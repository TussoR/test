// C# alt kümesi için ağaç-yürüten (tree-walking) yorumlayıcı.
// Güvenli: tarayıcıda, ağ/dosya erişimi olmadan, adım ve özyineleme sınırlarıyla çalışır.

import { CompileError, UnhandledException, LimitError } from './errors.js';
import { BUILTIN_TYPES } from './parser.js';
import {
  Dbl, Chr, CsArray, CsList, CsDict, CsObject, Lambda, MethodGroup, EnumVal, KVPair, TypeRef, TypeObj, StrBuilder, RandomGen,
  isNum, numVal, toStr, displayValue, typeNameOf, formatNumber, formatDouble, clrName,
} from './values.js';

const UNASSIGNED = Symbol('unassigned');
const BRK = { s: 'break' };
const CNT = { s: 'continue' };

class CsThrow { constructor(exc, line) { this.exc = exc; this.line = line; } }

class Scope {
  constructor(parent) { this.parent = parent; this.vars = new Map(); }
  lookup(name) {
    for (let s = this; s; s = s.parent) { const v = s.vars.get(name); if (v) return v; }
    return null;
  }
  declare(name, slot, node) {
    if (this.vars.has(name)) throw new CompileError('CS0128', `A local variable or function named '${name}' is already defined in this scope`, node.line, node.col);
    if (!this.isFuncRoot) {
      for (let s = this.parent; s; s = s.parent) {
        if (s.vars.has(name)) throw new CompileError('CS0136', `A local or parameter named '${name}' cannot be declared in this scope because that name is used in an enclosing local scope to define a local or parameter`, node.line, node.col);
        if (s.isFuncRoot) break;
      }
    }
    this.vars.set(name, slot);
  }
  lookupLocalOnly(name) {
    for (let s = this; s; s = s.parent) { if (s.vars.has(name)) return true; if (s.isFuncRoot) break; }
    return false;
  }
}

const INT_T = new Set(['int', 'long', 'short', 'byte', 'uint', 'ulong', 'sbyte', 'ushort', 'Int32', 'Int64']);
const DBL_T = new Set(['double', 'float', 'decimal', 'Double', 'Single', 'Decimal']);
const PRIM = new Set([...INT_T, ...DBL_T, 'string', 'bool', 'char', 'String', 'Boolean', 'Char']);

// Yerleşik exception hiyerarşisi
const EXC_TREE = {
  Exception: [null, 'System'],
  SystemException: ['Exception', 'System'],
  FormatException: ['SystemException', 'System'],
  ArithmeticException: ['SystemException', 'System'],
  DivideByZeroException: ['ArithmeticException', 'System'],
  OverflowException: ['ArithmeticException', 'System'],
  IndexOutOfRangeException: ['SystemException', 'System'],
  ArgumentException: ['SystemException', 'System'],
  ArgumentNullException: ['ArgumentException', 'System'],
  ArgumentOutOfRangeException: ['ArgumentException', 'System'],
  InvalidOperationException: ['SystemException', 'System'],
  NullReferenceException: ['SystemException', 'System'],
  InvalidCastException: ['SystemException', 'System'],
  NotImplementedException: ['SystemException', 'System'],
  NotSupportedException: ['SystemException', 'System'],
  StackOverflowException: ['SystemException', 'System'],
  KeyNotFoundException: ['SystemException', 'System.Collections.Generic'],
  IOException: ['SystemException', 'System.IO'],
  FileNotFoundException: ['IOException', 'System.IO'],
  DirectoryNotFoundException: ['IOException', 'System.IO'],
};

const BUILTIN_STATIC = new Set(['Console', 'Math', 'MathF', 'int', 'double', 'float', 'decimal', 'long', 'string', 'String', 'bool', 'char', 'Char', 'Convert',
  'Array', 'Enumerable', 'Environment', 'CultureInfo', 'NumberStyles', 'File', 'Path', 'Int32', 'Double', 'Boolean', 'StringSplitOptions', 'Directory', 'Enum', 'object', 'Object', 'Thread', 'Task', 'DateTime', 'TimeSpan', 'StringComparison', 'MidpointRounding']);

const DEFAULT_MSGS = {
  FormatException: 'One of the identified items was in an invalid format.',
  DivideByZeroException: 'Attempted to divide by zero.',
  NullReferenceException: 'Object reference not set to an instance of an object.',
  InvalidOperationException: 'Operation is not valid due to the current state of the object.',
  ArgumentException: 'Value does not fall within the expected range.',
  ArgumentNullException: 'Value cannot be null.',
  ArgumentOutOfRangeException: 'Specified argument was out of the range of valid values.',
  IndexOutOfRangeException: 'Index was outside the bounds of the array.',
  NotImplementedException: 'The method or operation is not implemented.',
  OverflowException: 'Arithmetic operation resulted in an overflow.',
  InvalidCastException: 'Specified cast is not valid.',
  KeyNotFoundException: 'The given key was not present in the dictionary.',
};
const DEFAULT_EXC_MSG = n => DEFAULT_MSGS[n] || `Exception of type '${EXC_TREE[n] ? 'System.' : ''}${n}' was thrown.`;

export class Interpreter {
  constructor(program, opts = {}) {
    this.prog = program;
    this.stdin = (opts.stdin ?? '').split(/\r?\n/);
    if (opts.stdin === undefined || opts.stdin === '') this.stdin = [];
    this.stdinPos = 0;
    this.maxSteps = opts.maxSteps ?? 3_000_000;
    this.maxDepth = opts.maxDepth ?? 500;
    this.maxOutput = opts.maxOutput ?? 200_000;
    this.files = opts.files ?? new Map();
    this.traceOn = !!opts.trace;
    this.maxTrace = opts.maxTrace ?? 1500;
    this.trace = [];
    this.out = [];
    this.outLen = 0;
    this.steps = 0;
    this.depth = 0;
    this.classes = new Map();
    this.enums = new Map();
    this.globalScope = new Scope(null);
    this.globalScope.isRoot = true;
    this.globalScope.isFuncRoot = true;
    this.entryScope = this.globalScope;
    this.curLine = 1;
    this.setupBuiltinClasses();
  }

  // ================= kurulum =================
  setupBuiltinClasses() {
    for (const [name, [base, ns]] of Object.entries(EXC_TREE)) {
      this.classes.set(name, { name, ns, builtin: true, isException: true, baseName: base, base: null, fields: [], props: new Map(), methods: new Map(), ctors: [], statics: new Map(), interfaces: [], decl: null, mods: ['public'] });
    }
    for (const c of this.classes.values()) c.base = c.baseName ? this.classes.get(c.baseName) : null;
  }

  setupUserTypes() {
    const decls = this.prog.types;
    for (const d of decls) {
      if (d.k === 'Enum') {
        const info = { name: d.name, members: new Map() };
        for (const m of d.members) info.members.set(m.name, new EnumVal(info, m.name, m.value));
        this.enums.set(d.name, info);
        continue;
      }
      if (this.classes.has(d.name) && !this.classes.get(d.name).builtin) throw new CompileError('CS0101', `The namespace '<global namespace>' already contains a definition for '${d.name}'`, d.line, d.col);
      const cls = { name: d.name, decl: d, isInterface: d.kind === 'interface', isStruct: d.kind === 'struct', isAbstract: d.mods.includes('abstract'), isStatic: d.mods.includes('static'),
        base: null, interfaces: [], fields: d.fields, props: new Map(), methods: new Map(), ctors: d.ctors, statics: new Map(), mods: d.mods };
      for (const p of d.props) { p.owner = cls; cls.props.set(p.name, p); }
      for (const m of d.methods) {
        m.owner = cls;
        if (!m.mods.includes('public') && !m.mods.includes('private') && !m.mods.includes('protected') && !m.mods.includes('internal') && cls.isInterface) m.mods.push('public');
        if (!cls.methods.has(m.name)) cls.methods.set(m.name, []);
        cls.methods.get(m.name).push(m);
      }
      for (const f of d.fields) f.owner = cls;
      for (const c of d.ctors) c.owner = cls;
      this.classes.set(d.name, cls);
    }
    for (const d of decls) {
      if (d.k === 'Enum') continue;
      const cls = this.classes.get(d.name);
      for (const bn of d.baseList || []) {
        const bname = bn.replace(/<.*$/, '');
        const b = this.classes.get(bname);
        if (b && !b.isInterface) {
          if (cls.base) throw new CompileError('CS1721', `Class '${d.name}' cannot have multiple base classes: '${cls.base.name}' and '${bname}'`, d.line, d.col);
          if (b.decl && b.decl.mods.includes('sealed')) throw new CompileError('CS0509', `'${d.name}': cannot derive from sealed type '${bname}'`, d.line, d.col);
          cls.base = b;
        } else if (b && b.isInterface) cls.interfaces.push(b.name);
        else if (/^I[A-Z]/.test(bname)) cls.interfaces.push(bname);
        else if (bname !== 'object') throw new CompileError('CS0246', `The type or namespace name '${bname}' could not be found (are you missing a using directive or an assembly reference?)`, d.line, d.col);
      }
    }
    // abstract/interface üyelerinin uygulandığını denetle
    for (const cls of this.classes.values()) {
      if (cls.builtin || cls.isInterface || cls.isAbstract) continue;
      for (const iname of cls.interfaces) {
        const icls = this.classes.get(iname);
        if (!icls) continue;
        for (const [mname, ms] of icls.methods) {
          for (const im of ms) {
            if (im.body) continue;
            if (!this.findMethods(cls, mname).some(m => m.body && m.params.length === im.params.length)) {
              throw new CompileError('CS0535', `'${cls.name}' does not implement interface member '${iname}.${mname}(${im.params.map(p => p.type).join(', ')})'`, cls.decl.line, cls.decl.col);
            }
          }
        }
      }
      for (let b = cls.base; b; b = b.base) {
        if (!b.isAbstract || !b.decl) continue;
        for (const [mname, ms] of b.methods) {
          for (const am of ms) {
            if (!am.mods.includes('abstract')) continue;
            const impl = this.findMethods(cls, mname).find(m => m.body && m.params.length === am.params.length);
            if (!impl) throw new CompileError('CS0534', `'${cls.name}' does not implement inherited abstract member '${b.name}.${mname}(${am.params.map(p => p.type).join(', ')})'`, cls.decl.line, cls.decl.col);
          }
        }
      }
      // override edilen metodun virtual olması gerekir
      for (const [mname, ms] of cls.methods) {
        for (const m of ms) {
          if (!m.mods.includes('override')) continue;
          let found = null;
          for (let b = cls.base; b && !found; b = b.base) found = (b.methods.get(mname) || []).find(x => x.params.length === m.params.length);
          if (!found && !['ToString', 'Equals', 'GetHashCode'].includes(mname)) throw new CompileError('CS0115', `'${cls.name}.${mname}(${m.params.map(p => p.type).join(', ')})': no suitable method found to override`, m.line, m.col);
          if (found && !found.mods.some(x => x === 'virtual' || x === 'abstract' || x === 'override')) throw new CompileError('CS0506', `'${cls.name}.${mname}': cannot override inherited member '${found.owner.name}.${mname}' because it is not marked virtual, abstract, or override`, m.line, m.col);
        }
      }
    }
    // statik alanlar
    for (const cls of this.classes.values()) {
      if (cls.builtin) continue;
      const ctx = { scope: new Scope(null), self: null, cls };
      for (const f of cls.fields) {
        if (!f.static) continue;
        const v = f.init ? this.coerce(this.evalInit(f.init, ctx, f.type), f.type, f) : this.defaultOf(f.type);
        cls.statics.set(f.name, { type: f.type, value: v, isConst: f.isConst, field: f });
      }
      for (const p of cls.props.values()) {
        if (!p.static || !p.auto) continue;
        cls.statics.set(p.name, { type: p.type, value: p.init ? this.coerce(this.evalInit(p.init, ctx, p.type), p.type, p) : this.defaultOf(p.type), prop: p });
      }
      const sctor = cls.ctors.find(c => c.static);
      if (sctor) this.execBlockIn(sctor.body, { scope: new Scope(null), self: null, cls });
    }
  }

  // ================= çalıştırma =================
  run() {
    this.setupUserTypes();
    const stmts = this.prog.stmts;
    if (stmts.length) {
      const ctx = { scope: this.globalScope, self: null, cls: null, top: true };
      const sig = this.execStmts(stmts, ctx, true);
      return;
    }
    // Main metodunu bul
    let main = null;
    for (const cls of this.classes.values()) {
      if (cls.builtin) continue;
      const ms = cls.methods.get('Main');
      if (ms) { const m = ms.find(x => x.static); if (m) { main = { m, cls }; break; } }
    }
    if (!main) {
      if (this.prog.types.length === 0) return; // boş program
      throw new CompileError('CS5001', "Program does not contain a static 'Main' method suitable for an entry point", 1, 1);
    }
    const args = main.m.params.length ? [new CsArray('string', [])] : [];
    this.invoke(main.m, null, main.cls, args, { line: main.m.line, col: main.m.col }, true);
  }

  tick(node) {
    if (++this.steps > this.maxSteps) throw new LimitError('TIMEOUT', 'Program çok uzun sürdü — muhtemelen sonsuz bir döngü var.', node?.line ?? this.curLine);
  }

  write(s) {
    this.outLen += s.length;
    if (this.outLen > this.maxOutput) throw new LimitError('OUTPUT', 'Çıktı çok büyük (sonsuz döngü içinde yazdırma olabilir).', this.curLine);
    this.out.push(s);
  }

  recordTrace(node, ctx) {
    if (!this.traceOn || this.trace.length >= this.maxTrace) return;
    const vars = [];
    const seen = new Set();
    for (let s = ctx.scope; s; s = s.parent) {
      for (const [name, slot] of s.vars) {
        if (seen.has(name) || slot.fn) continue;
        seen.add(name);
        vars.push({ name, type: slot.type, value: slot.value === UNASSIGNED ? '(atanmadı)' : displayValue(slot.value) });
      }
    }
    if (ctx.self) {
      for (const [k, v] of ctx.self.fields) if (!seen.has(k)) vars.push({ name: 'this.' + k, type: '', value: displayValue(v) });
    }
    this.trace.push({ line: node.line, vars, outLen: this.outLen, depth: this.depth, fn: ctx.fnName || (ctx.top ? '' : '') });
  }

  // ================= deyimler =================
  hoist(stmts, ctx) {
    for (const s of stmts) {
      if (s.k === 'LocalFunc') {
        const slot = { fn: s.m, closure: ctx.scope, type: 'function' };
        ctx.scope.declare(s.m.name, slot, s);
      }
    }
  }

  execStmts(stmts, ctx, hoist = true) {
    if (hoist) this.hoist(stmts, ctx);
    for (const s of stmts) {
      const r = this.exec(s, ctx);
      if (r) return r;
    }
    return undefined;
  }

  execBlockIn(block, ctx) {
    return this.execStmts(block.stmts, ctx);
  }

  child(ctx) { return { ...ctx, scope: new Scope(ctx.scope) }; }

  cond(e, ctx) {
    const v = this.eval(e, ctx);
    if (typeof v !== 'boolean') throw new CompileError('CS0029', `Cannot implicitly convert type '${typeNameOf(v)}' to 'bool'`, e.line, e.col);
    return v;
  }

  exec(s, ctx) {
    this.tick(s);
    if (s.line) this.curLine = s.line;
    if (this.traceOn && s.k !== 'Block' && s.k !== 'LocalFunc' && s.k !== 'Empty') this.recordTrace(s, ctx);
    switch (s.k) {
      case 'Block': return this.execStmts(s.stmts, this.child(ctx));
      case 'Empty': case 'LocalFunc': return undefined;
      case 'ExprStmt': this.eval(s.e, ctx, null, true); return undefined;
      case 'VarDecl': {
        for (const d of s.decls) {
          let type = s.type;
          let value;
          if (d.init) {
            if (type === 'var' && d.init.k === 'Lit' && d.init.lt === 'null') throw new CompileError('CS0815', "Cannot assign <null> to an implicitly-typed variable", d.line, d.col);
            if (type === 'var' && d.init.k === 'ArrayLit') throw new CompileError('CS0820', 'Cannot initialize an implicitly-typed variable with an array initializer', d.line, d.col);
            value = this.evalInit(d.init, ctx, type);
            if (type === 'var') type = typeNameOf(value);
            else value = this.coerce(value, type, d.init);
          } else {
            if (type === 'var') throw new CompileError('CS0818', 'Implicitly-typed variables must be initialized', d.line, d.col);
            value = s.isConst ? UNASSIGNED : UNASSIGNED;
          }
          if (s.isConst && !d.init) throw new CompileError('CS0145', 'A const field requires a value to be provided', d.line, d.col);
          ctx.scope.declare(d.name, { type, value, isConst: !!s.isConst }, d);
        }
        return undefined;
      }
      case 'If':
        if (this.cond(s.c, ctx)) return this.exec(s.t, this.child(ctx));
        if (s.f) return this.exec(s.f, this.child(ctx));
        return undefined;
      case 'While':
        while (this.cond(s.c, ctx)) {
          const r = this.exec(s.b, this.child(ctx));
          if (r === BRK) break;
          if (r === CNT) continue;
          if (r) return r;
          this.tick(s);
        }
        return undefined;
      case 'DoWhile':
        do {
          const r = this.exec(s.b, this.child(ctx));
          if (r === BRK) break;
          if (r && r !== CNT) return r;
          this.tick(s);
        } while (this.cond(s.c, ctx));
        return undefined;
      case 'For': {
        const fctx = this.child(ctx);
        for (const i of s.init) this.exec(i, fctx);
        for (;;) {
          if (s.c && !this.cond(s.c, fctx)) break;
          const r = this.exec(s.b, this.child(fctx));
          if (r === BRK) break;
          if (r && r !== CNT) return r;
          for (const u of s.upd) this.eval(u, fctx, null, true);
          this.tick(s);
        }
        return undefined;
      }
      case 'Foreach': {
        const coll = this.eval(s.coll, ctx);
        const { items, src } = this.iterate(coll, s.coll);
        const ver = src && src.version;
        for (const it of items) {
          if (src && src.version !== ver) this.throwExc('InvalidOperationException', 'Collection was modified; enumeration operation may not execute.', s);
          const ictx = this.child(ctx);
          let v = it;
          let t = s.type;
          if (t !== 'var') v = this.coerceExplicitForeach(v, t, s);
          else t = typeNameOf(v);
          ictx.scope.declare(s.name, { type: t, value: v, foreachVar: true }, s);
          const r = this.exec(s.b, ictx);
          if (r === BRK) break;
          if (r && r !== CNT) return r;
          this.tick(s);
        }
        if (src && src.version !== ver) this.throwExc('InvalidOperationException', 'Collection was modified; enumeration operation may not execute.', s);
        return undefined;
      }
      case 'Return': {
        const v = s.e ? this.eval(s.e, ctx) : undefined;
        return { s: 'return', v, node: s, hasValue: !!s.e };
      }
      case 'Break': return BRK;
      case 'Continue': return CNT;
      case 'Throw': {
        if (!s.e) {
          if (!ctx.currentExc) throw new CompileError('CS0156', 'A throw statement with no arguments is not allowed outside of a catch clause', s.line, s.col);
          throw ctx.currentExc;
        }
        const ex = this.eval(s.e, ctx);
        if (!(ex instanceof CsObject) || !this.isExceptionClass(ex.cls)) throw new CompileError('CS0029', `Cannot implicitly convert type '${typeNameOf(ex)}' to 'System.Exception'`, s.line, s.col);
        throw new CsThrow(ex, s.line);
      }
      case 'Try': {
        let result;
        try {
          result = this.exec(s.b, ctx);
        } catch (err) {
          if (!(err instanceof CsThrow)) throw err;
          let handled = false;
          for (const c of s.catches) {
            if (!this.isAssignable(err.exc.cls, c.type)) continue;
            const cctx = this.child(ctx);
            cctx.currentExc = err;
            if (c.name) cctx.scope.declare(c.name, { type: c.type, value: err.exc }, s);
            if (c.when && !this.cond(c.when, cctx)) continue;
            handled = true;
            try {
              result = this.execBlockIn(c.b, cctx);
            } finally {
              if (s.fin) { const fr = this.exec(s.fin, ctx); if (fr) result = fr; }
            }
            break;
          }
          if (!handled) {
            if (s.fin) this.exec(s.fin, ctx);
            throw err;
          }
          return result;
        }
        if (s.fin) { const fr = this.exec(s.fin, ctx); if (fr) return fr; }
        return result;
      }
      case 'Switch': {
        const v = this.eval(s.e, ctx);
        let start = -1;
        outer: for (let i = 0; i < s.sections.length; i++) {
          for (const lab of s.sections[i].labels) {
            if (lab === null) continue;
            const lv = this.eval(lab.e, ctx);
            if (this.equals(v, lv)) {
              if (lab.guard && !this.cond(lab.guard, ctx)) continue;
              start = i; break outer;
            }
          }
        }
        if (start < 0) start = s.sections.findIndex(sec => sec.labels.includes(null));
        if (start < 0) return undefined;
        const sec = s.sections[start];
        const sctx = this.child(ctx);
        const r = this.execStmts(sec.stmts, sctx);
        if (r === BRK) return undefined;
        if (r) return r;
        if (sec.stmts.length) {
          const lab = sec.labels[0];
          throw new CompileError('CS0163', `Control cannot fall through from one case label ('${lab ? 'case ...' : 'default'}:') to another`, s.line, s.col);
        }
        return undefined;
      }
    }
    throw new CompileError('CS0000', `Desteklenmeyen deyim: ${s.k}`, s.line, s.col);
  }

  coerceExplicitForeach(v, t, node) {
    if (INT_T.has(t) && v instanceof Dbl) throw new CompileError('CS0030', `Cannot convert type 'double' to '${t}'`, node.line, node.col);
    return this.coerce(v, t, node);
  }

  iterate(coll, node) {
    if (coll === null) this.throwExc('NullReferenceException', 'Object reference not set to an instance of an object.', node);
    if (coll instanceof CsArray) return { items: coll.items.slice() };
    if (coll instanceof CsList) {
      if (coll.kind === 'Stack') return { items: coll.items.slice().reverse(), src: coll };
      return { items: coll.items.slice(), src: coll };
    }
    if (typeof coll === 'string') return { items: [...coll].map(c => new Chr(c)) };
    if (coll instanceof CsDict) return { items: [...coll.map.values()].map(e => new KVPair(e.k, e.v)), src: coll };
    throw new CompileError('CS1579', `foreach statement cannot operate on variables of type '${typeNameOf(coll)}' because '${typeNameOf(coll)}' does not contain a public instance or extension definition for 'GetEnumerator'`, node.line, node.col);
  }

  // ================= türler ve dönüşümler =================
  defaultOf(t) {
    if (!t) return null;
    if (t.endsWith('?')) return null;
    if (INT_T.has(t)) return 0;
    if (DBL_T.has(t)) return new Dbl(0);
    if (t === 'bool') return false;
    if (t === 'char') return new Chr('\0');
    const en = this.enums.get(t);
    if (en) return [...en.members.values()].find(m => m.value === 0) || new EnumVal(en, '0', 0);
    const cls = this.classes.get(t);
    if (cls && cls.isStruct) return this.instantiate(cls, [], null, { scope: new Scope(null), self: null, cls: null });
    return null;
  }

  isExceptionClass(cls) { for (let c = cls; c; c = c.base) if (c.name === 'Exception') return true; return false; }

  isAssignable(cls, typeName) {
    if (typeName === 'object' || typeName === 'Object' || typeName === 'System.Exception' && this.isExceptionClass(cls)) return true;
    typeName = typeName.replace(/^System\.(IO\.|Collections\.Generic\.)?/, '');
    for (let c = cls; c; c = c.base) {
      if (c.name === typeName) return true;
      if (c.interfaces && this.interfaceMatches(c.interfaces, typeName)) return true;
    }
    return false;
  }
  interfaceMatches(list, name) {
    for (const i of list) {
      if (i === name) return true;
      const ic = this.classes.get(i);
      if (ic && ic.decl && this.interfaceMatches((ic.decl.baseList || []), name)) return true;
    }
    return false;
  }

  convErr(v, t, node, explicitExists = false) {
    const from = typeNameOf(v);
    if (explicitExists) return new CompileError('CS0266', `Cannot implicitly convert type '${from}' to '${t}'. An explicit conversion exists (are you missing a cast?)`, node?.line ?? this.curLine, node?.col ?? 1);
    return new CompileError('CS0029', `Cannot implicitly convert type '${from}' to '${t}'`, node?.line ?? this.curLine, node?.col ?? 1);
  }

  /** Örtük (implicit) dönüşüm — C#'ın tür güvenliğini taklit eder. */
  coerce(v, t, node) {
    if (!t || t === 'var' || t === 'object' || t === 'dynamic' || t === 'Object') return v;
    if (/^[A-Z]$/.test(t) || /^T[A-Z]?\w*$/.test(t) && !this.classes.has(t) && !this.enums.has(t)) return v; // generic parametre
    if (t.endsWith('?')) { if (v === null) return null; return this.coerce(v, t.slice(0, -1), node); }
    if (INT_T.has(t)) {
      if (typeof v === 'number') return v;
      if (v instanceof Chr) return v.c.charCodeAt(0);
      if (v instanceof Dbl || v instanceof EnumVal) throw this.convErr(v, t, node, true);
      throw this.convErr(v, t, node);
    }
    if (DBL_T.has(t)) {
      if (v instanceof Dbl) return v;
      if (typeof v === 'number') return new Dbl(v);
      if (v instanceof Chr) return new Dbl(v.c.charCodeAt(0));
      throw this.convErr(v, t, node);
    }
    if (t === 'string' || t === 'String') { if (typeof v === 'string' || v === null) return v; throw this.convErr(v, t, node); }
    if (t === 'bool' || t === 'Boolean') { if (typeof v === 'boolean') return v; throw this.convErr(v, t, node); }
    if (t === 'char' || t === 'Char') { if (v instanceof Chr) return v; if (typeof v === 'number') throw this.convErr(v, t, node, true); throw this.convErr(v, t, node); }
    if (v === null) {
      if (this.enums.has(t)) throw this.convErr(v, t, node);
      return null;
    }
    const prim = typeof v === 'number' || typeof v === 'string' || typeof v === 'boolean' || v instanceof Dbl || v instanceof Chr;
    if (t.endsWith('[]')) {
      if (v instanceof CsArray) {
        const et = t.slice(0, -2);
        if (et !== 'var' && et !== 'object' && v.elemType !== et && PRIM.has(et) && PRIM.has(v.elemType) && v.elemType !== et) throw this.convErr(v, t, node);
        return v;
      }
      throw this.convErr(v, t, node);
    }
    const base = t.replace(/<.*$/, '');
    const en = this.enums.get(base);
    if (en) { if (v instanceof EnumVal && v.info === en) return v; throw this.convErr(v, t, node, typeof v === 'number'); }
    const cls = this.classes.get(base);
    if (cls) {
      if (v instanceof CsObject && this.isAssignable(v.cls, base)) return v;
      if (v instanceof CsObject && this.isAssignable(cls, v.cls.name)) throw this.convErr(v, t, node, true);
      throw this.convErr(v, t, node);
    }
    if (prim) {
      if (base === 'IComparable' || base === 'ValueType') return v;
      throw this.convErr(v, t, node);
    }
    if (['List', 'IList', 'ICollection', 'IReadOnlyList'].includes(base) && !(v instanceof CsList && v.kind === 'List')) {
      if (v instanceof CsList || v instanceof CsArray || v instanceof CsDict) throw this.convErr(v, t, node, v instanceof CsList);
    }
    if (base === 'Dictionary' && !(v instanceof CsDict)) throw this.convErr(v, t, node);
    return v;
  }

  /** Açık (explicit) dönüşüm: (int)x */
  cast(v, t, node) {
    if (t.endsWith('?')) { if (v === null) return null; t = t.slice(0, -1); }
    if (INT_T.has(t)) {
      if (typeof v === 'number') return v;
      if (v instanceof Dbl) {
        if (!Number.isFinite(v.v)) return -2147483648;
        return Math.trunc(v.v);
      }
      if (v instanceof Chr) return v.c.charCodeAt(0);
      if (v instanceof EnumVal) return v.value;
      if (v instanceof CsObject || v === null) this.throwExc('InvalidCastException', 'Unable to cast object.', node);
      throw new CompileError('CS0030', `Cannot convert type '${typeNameOf(v)}' to '${t}'`, node.line, node.col);
    }
    if (DBL_T.has(t)) {
      if (isNum(v)) return new Dbl(numVal(v));
      throw new CompileError('CS0030', `Cannot convert type '${typeNameOf(v)}' to '${t}'`, node.line, node.col);
    }
    if (t === 'char') {
      if (typeof v === 'number' || v instanceof Dbl) return new Chr(String.fromCharCode(Math.trunc(numVal(v)) & 0xFFFF));
      if (v instanceof Chr) return v;
      throw new CompileError('CS0030', `Cannot convert type '${typeNameOf(v)}' to 'char'`, node.line, node.col);
    }
    if (t === 'string') {
      if (typeof v === 'string' || v === null) return v;
      throw new CompileError('CS0030', `Cannot convert type '${typeNameOf(v)}' to 'string'`, node.line, node.col);
    }
    const en = this.enums.get(t);
    if (en) {
      if (v instanceof EnumVal) return v;
      if (typeof v === 'number') return [...en.members.values()].find(m => m.value === v) || new EnumVal(en, String(v), v);
    }
    if (t === 'object') return v;
    const cls = this.classes.get(t);
    if (cls) {
      if (v === null) return null;
      if (v instanceof CsObject && this.isAssignable(v.cls, t)) return v;
      if (v instanceof CsObject) this.throwExc('InvalidCastException', `Unable to cast object of type '${v.cls.name}' to type '${t}'.`, node);
      throw new CompileError('CS0030', `Cannot convert type '${typeNameOf(v)}' to '${t}'`, node.line, node.col);
    }
    return v;
  }

  // ================= exception yardımcıları =================
  makeExc(name, message) {
    const cls = this.classes.get(name);
    const o = new CsObject(cls);
    o.fields.set('Message', message ?? DEFAULT_EXC_MSG(name));
    o.fields.set('InnerException', null);
    return o;
  }
  throwExc(name, message, node) {
    throw new CsThrow(this.makeExc(name, message), node?.line ?? this.curLine);
  }
  nullRef(node) { this.throwExc('NullReferenceException', 'Object reference not set to an instance of an object.', node); }

  excFullName(cls) {
    if (cls.builtin) return `${cls.ns}.${cls.name}`;
    return cls.name;
  }

  objToString(o) {
    if (this.isExceptionClass(o.cls) && !this.findMethods(o.cls, 'ToString').some(m => m.body && m.params.length === 0)) {
      return `${this.excFullName(o.cls)}: ${o.fields.get('Message')}`;
    }
    const m = this.findMethods(o.cls, 'ToString').find(x => x.params.length === 0 && x.body);
    if (m) return toStr(this.invoke(m, o, m.owner, [], { line: this.curLine }), this);
    if (o.cls.decl && o.cls.decl.isRecord) {
      const parts = [...o.cls.props.keys()].map(k => `${k} = ${toStr(o.fields.get(k), this)}`);
      return `${o.cls.name} { ${parts.join(', ')} }`;
    }
    return o.cls.name;
  }

  // ================= eşitlik ve operatörler =================
  equals(a, b) {
    if (a === b) return true;
    if (a === null || b === null) return false;
    if (isNum(a) && isNum(b)) return numVal(a) === numVal(b);
    if (a instanceof EnumVal && b instanceof EnumVal) return a.info === b.info && a.value === b.value;
    if (typeof a === 'string' && typeof b === 'string') return a === b;
    if (a instanceof CsObject && b instanceof CsObject && a.cls.isStruct) {
      for (const [k, v] of a.fields) if (!this.equals(v, b.fields.get(k))) return false;
      return true;
    }
    if (a instanceof CsObject && b instanceof CsObject && a.cls.decl && a.cls.decl.isRecord && a.cls === b.cls) {
      for (const [k, v] of a.fields) if (!this.equals(v, b.fields.get(k))) return false;
      return true;
    }
    if (a instanceof KVPair && b instanceof KVPair) return this.equals(a.key, b.key) && this.equals(a.value, b.value);
    return false;
  }

  opErr(op, a, b, node) {
    return new CompileError('CS0019', `Operator '${op}' cannot be applied to operands of type '${typeNameOf(a)}' and '${typeNameOf(b)}'`, node.line, node.col);
  }

  binop(op, a, b, node) {
    switch (op) {
      case '+':
        if (typeof a === 'string' || typeof b === 'string') {
          if (a === null || b === null || typeof a === 'string' || typeof b === 'string') return toStr(a, this) + toStr(b, this);
        }
        if (isNum(a) && isNum(b)) return this.arith(op, a, b, node);
        if (a === null && typeof b === 'string' || b === null && typeof a === 'string') return toStr(a) + toStr(b);
        if (a instanceof Lambda && b instanceof Lambda) return a; // delegate birleşimi desteklenmez
        throw this.opErr(op, a, b, node);
      case '-': case '*': case '/': case '%':
        if (isNum(a) && isNum(b)) return this.arith(op, a, b, node);
        if (a instanceof EnumVal && typeof b === 'number' && (op === '-')) return a.value - b;
        throw this.opErr(op, a, b, node);
      case '==': case '!=': {
        const bad = (x, y) => (typeof x === 'string' && (isNum(y) || typeof y === 'boolean')) || (typeof x === 'boolean' && isNum(y));
        if (bad(a, b) || bad(b, a)) throw this.opErr(op, a, b, node);
        const r = this.equals(a, b);
        return op === '==' ? r : !r;
      }
      case '<': case '>': case '<=': case '>=': {
        let x, y;
        if (isNum(a) && isNum(b)) { x = numVal(a); y = numVal(b); }
        else if (a instanceof EnumVal && b instanceof EnumVal) { x = a.value; y = b.value; }
        else throw this.opErr(op, a, b, node);
        if (op === '<') return x < y;
        if (op === '>') return x > y;
        if (op === '<=') return x <= y;
        return x >= y;
      }
      case '&': case '|': case '^':
        if (typeof a === 'boolean' && typeof b === 'boolean') return op === '&' ? (a && b) : op === '|' ? (a || b) : (a !== b);
        if (typeof a === 'number' && typeof b === 'number') return op === '&' ? (a & b) : op === '|' ? (a | b) : (a ^ b);
        throw this.opErr(op, a, b, node);
      case '<<':
        if (typeof a === 'number' && typeof b === 'number') return a << b;
        throw this.opErr(op, a, b, node);
    }
    throw new CompileError('CS0000', `Desteklenmeyen operatör ${op}`, node.line, node.col);
  }

  arith(op, a, b, node) {
    const dbl = a instanceof Dbl || b instanceof Dbl;
    const x = numVal(a), y = numVal(b);
    if (dbl) {
      switch (op) {
        case '+': return new Dbl(x + y);
        case '-': return new Dbl(x - y);
        case '*': return new Dbl(x * y);
        case '/': return new Dbl(x / y);
        case '%': return new Dbl(x % y);
      }
    }
    switch (op) {
      case '+': return x + y;
      case '-': return x - y;
      case '*': return x * y;
      case '/':
        if (y === 0) this.throwExc('DivideByZeroException', 'Attempted to divide by zero.', node);
        return Math.trunc(x / y);
      case '%':
        if (y === 0) this.throwExc('DivideByZeroException', 'Attempted to divide by zero.', node);
        return x % y;
    }
  }

  // ================= referanslar (sol değerler) =================
  /** Atanabilir bir hedef için {get, set, type} döndürür. */
  ref(node, ctx) {
    if (node.k === 'Paren') return this.ref(node.e, ctx);
    if (node.k === 'Ident') {
      const slot = ctx.scope.lookup(node.name);
      if (slot && !slot.fn) {
        return {
          type: slot.type,
          get: () => { if (slot.value === UNASSIGNED) throw new CompileError('CS0165', `Use of unassigned local variable '${node.name}'`, node.line, node.col); return slot.value; },
          set: v => {
            if (slot.isConst) throw new CompileError('CS0131', 'The left-hand side of an assignment must be a variable, property or indexer', node.line, node.col);
            if (slot.foreachVar) throw new CompileError('CS1656', `Cannot assign to '${node.name}' because it is a 'foreach iteration variable'`, node.line, node.col);
            slot.value = v;
          },
          slot,
        };
      }
      const mref = this.memberRef(ctx.self, ctx.cls, node.name, node, ctx, true);
      if (mref) return mref;
      throw this.notFound(node.name, node);
    }
    if (node.k === 'Member') {
      const target = this.evalTarget(node.obj, ctx);
      if (target instanceof TypeRef) {
        if (target.kind === 'class') {
          const r = this.staticRef(target.info, node.name, node, ctx);
          if (r) return r;
          throw new CompileError('CS0117', `'${target.name}' does not contain a definition for '${node.name}'`, node.line, node.col);
        }
        throw new CompileError('CS0131', 'The left-hand side of an assignment must be a variable, property or indexer', node.line, node.col);
      }
      if (target === null) {
        if (node.nullCond) return { type: null, get: () => null, set: () => {} };
        this.nullRef(node);
      }
      if (target instanceof CsObject) {
        const r = this.memberRef(target, target.cls, node.name, node, ctx, false);
        if (r) return r;
        throw new CompileError('CS1061', `'${target.cls.name}' does not contain a definition for '${node.name}'`, node.line, node.col);
      }
      if (typeof target === 'string' && node.name === 'Length' || target instanceof CsArray && node.name === 'Length' || target instanceof CsList && node.name === 'Count') {
        throw new CompileError('CS0200', `Property or indexer '${typeNameOf(target)}.${node.name}' cannot be assigned to -- it is read only`, node.line, node.col);
      }
      if (target instanceof StrBuilder && node.name === 'Length') return { type: 'int', get: () => target.s.length, set: v => { target.s = target.s.slice(0, v).padEnd(v, '\0'); } };
      if (target instanceof KVPair) throw new CompileError('CS0200', `Property or indexer 'KeyValuePair.${node.name}' cannot be assigned to -- it is read only`, node.line, node.col);
      throw new CompileError('CS1061', `'${typeNameOf(target)}' does not contain a definition for '${node.name}'`, node.line, node.col);
    }
    if (node.k === 'Index') {
      const obj = this.eval(node.obj, ctx);
      if (obj === null) this.nullRef(node);
      if (obj instanceof CsArray) {
        if (node.multi) {
          const idx = node.idx.map(i => this.toIndex(this.eval(i, ctx), i));
          const [r, c] = idx;
          if (r < 0 || c < 0 || r >= obj.dims[0] || c >= obj.dims[1]) this.throwExc('IndexOutOfRangeException', 'Index was outside the bounds of the array.', node);
          const k = r * obj.dims[1] + c;
          return { type: obj.elemType, get: () => obj.items[k], set: v => { obj.items[k] = v; } };
        }
        const i = this.toIndex(this.eval(node.idx, ctx), node.idx);
        if (i < 0 || i >= obj.items.length) this.throwExc('IndexOutOfRangeException', 'Index was outside the bounds of the array.', node);
        return { type: obj.elemType, get: () => obj.items[i], set: v => { obj.items[i] = v; } };
      }
      if (obj instanceof CsList) {
        const i = this.toIndex(this.eval(node.idx, ctx), node.idx);
        if (obj.kind !== 'List') throw new CompileError('CS0021', `Cannot apply indexing with [] to an expression of type '${typeNameOf(obj)}'`, node.line, node.col);
        if (i < 0 || i >= obj.items.length) this.throwExc('ArgumentOutOfRangeException', "Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')", node);
        return { type: obj.elemType, get: () => obj.items[i], set: v => { obj.items[i] = v; obj.version++; } };
      }
      if (obj instanceof CsDict) {
        const key = this.coerce(this.eval(node.idx, ctx), obj.kType, node.idx);
        return {
          type: obj.vType,
          get: () => { const e = obj.map.get(this.dictKey(key)); if (!e) this.throwExc('KeyNotFoundException', `The given key '${toStr(key, this)}' was not present in the dictionary.`, node); return e.v; },
          set: v => { const k = this.dictKey(key); if (key === null) this.throwExc('ArgumentNullException', "Value cannot be null. (Parameter 'key')", node); const ex = obj.map.get(k); if (ex) ex.v = v; else { obj.map.set(k, { k: key, v }); obj.version++; } },
        };
      }
      if (typeof obj === 'string') {
        const i = this.toIndex(this.eval(node.idx, ctx), node.idx);
        return {
          type: 'char',
          get: () => { if (i < 0 || i >= obj.length) this.throwExc('IndexOutOfRangeException', 'Index was outside the bounds of the array.', node); return new Chr(obj[i]); },
          set: () => { throw new CompileError('CS0200', "Property or indexer 'string.this[int]' cannot be assigned to -- it is read only", node.line, node.col); },
        };
      }
      if (obj instanceof StrBuilder) {
        const i = this.toIndex(this.eval(node.idx, ctx), node.idx);
        return { type: 'char', get: () => new Chr(obj.s[i]), set: v => { obj.s = obj.s.slice(0, i) + v.c + obj.s.slice(i + 1); } };
      }
      if (obj instanceof CsObject) {
        const getters = this.findMethods(obj.cls, 'get_Item');
        throw new CompileError('CS0021', `Cannot apply indexing with [] to an expression of type '${obj.cls.name}'`, node.line, node.col);
      }
      throw new CompileError('CS0021', `Cannot apply indexing with [] to an expression of type '${typeNameOf(obj)}'`, node.line, node.col);
    }
    throw new CompileError('CS0131', 'The left-hand side of an assignment must be a variable, property or indexer', node.line, node.col);
  }

  toIndex(v, node) {
    if (typeof v === 'number') return v;
    if (v instanceof Chr) return v.c.charCodeAt(0);
    throw this.convErr(v, 'int', node, v instanceof Dbl);
  }

  dictKey(k) {
    if (typeof k === 'number' || k instanceof Dbl) return 'n:' + numVal(k);
    if (typeof k === 'string') return 's:' + k;
    if (k instanceof Chr) return 'c:' + k.c;
    if (typeof k === 'boolean') return 'b:' + k;
    if (k instanceof EnumVal) return 'e:' + k.info.name + ':' + k.value;
    return k;
  }

  canAccess(mods, owner, ctx) {
    if (!mods || mods.includes('public') || mods.includes('internal')) return true;
    if (owner.isInterface) return true;
    if (!ctx.cls) return false;
    if (mods.includes('protected')) { for (let c = ctx.cls; c; c = c.base) if (c === owner) return true; return this.isNestedIn(ctx.cls, owner); }
    return ctx.cls === owner || this.isNestedIn(ctx.cls, owner) || this.isNestedIn(owner, ctx.cls);
  }
  isNestedIn() { return false; }

  accessErr(owner, name, node) {
    return new CompileError('CS0122', `'${owner.name}.${name}' is inaccessible due to its protection level`, node.line, node.col);
  }

  findField(cls, name) {
    for (let c = cls; c; c = c.base) {
      const f = c.fields.find(x => x.name === name);
      if (f) return f;
    }
    return null;
  }
  findProp(cls, name) {
    for (let c = cls; c; c = c.base) { const p = c.props.get(name); if (p) return p; }
    return null;
  }
  findMethods(cls, name) {
    const out = [];
    const seenSig = new Set();
    for (let c = cls; c; c = c.base) {
      for (const m of c.methods.get(name) || []) {
        const sig = m.params.map(p => p.type).join(',');
        if (seenSig.has(sig)) continue;
        seenSig.add(sig);
        out.push(m);
      }
    }
    return out;
  }

  /** Bir nesnenin (veya statik sınıfın) üyesine referans. implicitThis: isimsiz erişim (alan adı tek başına). */
  memberRef(self, cls, name, node, ctx, implicitThis) {
    if (!cls) return null;
    // örnek alanı / özelliği
    const f = this.findField(cls, name);
    if (f) {
      if (!this.canAccess(f.mods, f.owner, ctx)) throw this.accessErr(f.owner, name, node);
      if (f.static) return this.staticRef(f.owner, name, node, ctx);
      if (!self) throw new CompileError('CS0120', `An object reference is required for the non-static field, method, or property '${f.owner.name}.${name}'`, node.line, node.col);
      return {
        type: f.type, get: () => self.fields.get(name), set: v => {
          if (f.readonly && !(ctx.inCtor && ctx.cls === f.owner)) throw new CompileError('CS0191', `A readonly field cannot be assigned to (except in a constructor or init-only setter of the type in which the field is defined or a variable initializer)`, node.line, node.col);
          self.fields.set(name, v);
        },
      };
    }
    const p = this.findProp(cls, name);
    if (p) {
      if (!this.canAccess(p.mods, p.owner, ctx)) throw this.accessErr(p.owner, name, node);
      if (p.static) return this.staticRef(p.owner, name, node, ctx);
      if (!self) throw new CompileError('CS0120', `An object reference is required for the non-static field, method, or property '${p.owner.name}.${name}'`, node.line, node.col);
      // sanal özellik: en türetilmiş sınıftaki tanım
      const vp = this.findProp(self.cls, name) || p;
      return {
        type: vp.type,
        get: () => {
          if (vp.auto || !vp.getter) { if (!vp.auto && !vp.getter) throw new CompileError('CS0154', `The property or indexer '${vp.owner.name}.${name}' cannot be used in this context because it lacks the get accessor`, node.line, node.col); return self.fields.get(name); }
          return this.runAccessor(vp.getter, self, vp.owner, null, vp.type, node);
        },
        set: v => {
          if (vp.auto) {
            if (!vp.hasSet && !(ctx.inCtor && ctx.cls === vp.owner)) throw new CompileError('CS0200', `Property or indexer '${vp.owner.name}.${name}' cannot be assigned to -- it is read only`, node.line, node.col);
            if (vp.setMods && vp.setMods.length && !this.canAccess(vp.setMods, vp.owner, ctx)) throw new CompileError('CS0272', `The property or indexer '${vp.owner.name}.${name}' cannot be used in this context because the set accessor is inaccessible`, node.line, node.col);
            self.fields.set(name, v);
            return;
          }
          if (!vp.setter) throw new CompileError('CS0200', `Property or indexer '${vp.owner.name}.${name}' cannot be assigned to -- it is read only`, node.line, node.col);
          if (vp.setMods && vp.setMods.length && !this.canAccess(vp.setMods, vp.owner, ctx)) throw new CompileError('CS0272', `The property or indexer '${vp.owner.name}.${name}' cannot be used in this context because the set accessor is inaccessible`, node.line, node.col);
          this.runAccessor(vp.setter, self, vp.owner, v, 'void', node);
        },
      };
    }
    if (cls.isException || this.isExceptionClass(cls)) {
      if (name === 'Message' || name === 'InnerException' || name === 'StackTrace') {
        if (!self) return null;
        return { type: 'string', get: () => name === 'StackTrace' ? '   at Program.Main()' : self.fields.get(name), set: () => { throw new CompileError('CS0200', `Property or indexer 'Exception.${name}' cannot be assigned to -- it is read only`, node.line, node.col); } };
      }
    }
    if (implicitThis) {
      const sr = this.staticRef(cls, name, node, ctx);
      if (sr) return sr;
    }
    return null;
  }

  staticRef(cls, name, node, ctx) {
    for (let c = cls; c; c = c.base) {
      const slot = c.statics.get(name);
      if (slot) {
        const mods = slot.field ? slot.field.mods : slot.prop ? slot.prop.mods : null;
        if (!this.canAccess(mods, c, ctx)) throw this.accessErr(c, name, node);
        return {
          type: slot.type, get: () => slot.value, set: v => {
            if (slot.isConst) throw new CompileError('CS0131', 'The left-hand side of an assignment must be a variable, property or indexer', node.line, node.col);
            slot.value = v;
          },
        };
      }
      const p = c.props.get(name);
      if (p && p.static && !p.auto) {
        return { type: p.type, get: () => this.runAccessor(p.getter, null, c, null, p.type, node), set: v => this.runAccessor(p.setter, null, c, v, 'void', node) };
      }
    }
    return null;
  }

  runAccessor(body, self, cls, value, retType, node) {
    const scope = new Scope(null); scope.isFuncRoot = true;
    if (value !== null && value !== undefined || retType === 'void') scope.vars.set('value', { type: 'var', value });
    this.enter(node);
    try {
      const r = this.execBlockIn(body, { scope, self, cls, inSetter: retType === 'void' });
      if (r && r.s === 'return') return r.v;
      return undefined;
    } finally { this.depth--; }
  }

  enter(node) {
    if (++this.depth > this.maxDepth) {
      this.depth = 0;
      throw new LimitError('STACK', 'Stack overflow — fonksiyon kendini durmadan çağırıyor (sonsuz özyineleme).', node?.line ?? this.curLine);
    }
  }

  notFound(name, node) {
    return new CompileError('CS0103', `The name '${name}' does not exist in the current context`, node.line, node.col);
  }

  // ================= ifadeler =================
  /** Hedef türü bilinen başlatıcıları değerlendirir (dizi başlatıcı, new()). */
  evalInit(e, ctx, type) {
    if (e.k === 'ArrayLit') {
      if (!type || type === 'var') throw new CompileError('CS0820', 'Cannot initialize an implicitly-typed variable with an array initializer', e.line, e.col);
      if (!type.endsWith('[]')) throw new CompileError('CS0622', 'Can only use array initializer expressions to assign to array types. Try using a new expression instead.', e.line, e.col);
      return this.buildArray(type.slice(0, -2), e, ctx);
    }
    if (e.k === 'New' && !e.type) return this.evalNew({ ...e, type }, ctx);
    return this.eval(e, ctx);
  }

  buildArray(elem, lit, ctx) {
    if (lit.items.length && lit.items[0].k === 'ArrayLit' && !elem.endsWith('[]')) {
      // 2B dizi: int[,] m = { {1,2}, {3,4} }
      const rows = lit.items.length, cols = lit.items[0].items.length;
      const items = [];
      for (const r of lit.items) for (const x of r.items) items.push(this.coerce(this.eval(x, ctx), elem, x));
      return new CsArray(elem, items, [rows, cols]);
    }
    return new CsArray(elem, lit.items.map(x => x.k === 'ArrayLit' ? this.buildArray(elem.slice(0, -2), x, ctx) : this.coerce(this.eval(x, ctx), elem, x)));
  }

  evalTarget(node, ctx) {
    // Member erişiminde sol taraf: tür adı mı değer mi?
    if (node.k === 'Ident') {
      const slot = ctx.scope.lookup(node.name);
      if (slot && !slot.fn) return this.eval(node, ctx);
      if (!node.isType) {
        if (ctx.cls && (this.findField(ctx.cls, node.name) || this.findProp(ctx.cls, node.name))) return this.eval(node, ctx);
        if (ctx.cls && this.staticRef(ctx.cls, node.name, node, ctx)) return this.eval(node, ctx);
      }
      if (this.classes.has(node.name)) return new TypeRef('class', node.name, this.classes.get(node.name));
      if (this.enums.has(node.name)) return new TypeRef('enum', node.name, this.enums.get(node.name));
      if (BUILTIN_STATIC.has(node.name) || node.isType) return new TypeRef('builtin', node.name);
      if (node.name === 'System') return new TypeRef('ns', 'System');
      if (node.name === 'console' || node.name === 'math' || node.name === 'CONSOLE') throw this.notFound(node.name, node);
      throw this.notFound(node.name, node);
    }
    if (node.k === 'Member' && node.obj.k === 'Ident' && node.obj.name === 'System') {
      if (BUILTIN_STATIC.has(node.name) || this.classes.has(node.name)) return this.evalTarget({ ...node, k: 'Ident', name: node.name }, ctx);
      return new TypeRef('ns', 'System.' + node.name);
    }
    if (node.k === 'Member') {
      const t = this.evalTarget(node.obj, ctx);
      if (t instanceof TypeRef && t.kind === 'ns') {
        if (BUILTIN_STATIC.has(node.name) || this.classes.has(node.name)) return this.evalTarget({ k: 'Ident', name: node.name, line: node.line, col: node.col }, ctx);
        return new TypeRef('ns', t.name + '.' + node.name);
      }
      return this.evalMember(node, ctx, t);
    }
    if (node.k === 'Base') return { __base: true, self: ctx.self };
    return this.eval(node, ctx);
  }

  eval(e, ctx, expected = null, asStatement = false) {
    switch (e.k) {
      case 'Lit':
        if (e.lt === 'double') return new Dbl(e.v);
        if (e.lt === 'char') return new Chr(e.v);
        if (e.lt === 'int' && e.v > 2147483647 && !Number.isInteger(e.v)) return new Dbl(e.v);
        return e.v;
      case 'Paren': return this.eval(e.e, ctx);
      case 'Interp': {
        let s = '';
        for (const p of e.parts) {
          if (p.s !== undefined) { s += p.s; continue; }
          const v = this.eval(p.e, ctx);
          let str = p.fmt ? this.formatWith(v, p.fmt, p.e) : toStr(v, this);
          if (p.align) str = p.align > 0 ? str.padStart(p.align) : str.padEnd(-p.align);
          s += str;
        }
        return s;
      }
      case 'Ident': {
        const slot = ctx.scope.lookup(e.name);
        if (slot) {
          if (slot.fn) return new MethodGroup(e.name, { fnSlot: slot });
          if (slot.value === UNASSIGNED) throw new CompileError('CS0165', `Use of unassigned local variable '${e.name}'`, e.line, e.col);
          return slot.value;
        }
        if (ctx.cls) {
          const r = this.memberRef(ctx.self, ctx.cls, e.name, e, ctx, true);
          if (r) return r.get();
          if (this.findMethods(ctx.cls, e.name).length) return new MethodGroup(e.name, { cls: ctx.cls, self: ctx.self });
        }
        if (this.classes.has(e.name)) return new TypeRef('class', e.name, this.classes.get(e.name));
        if (this.enums.has(e.name)) return new TypeRef('enum', e.name, this.enums.get(e.name));
        if (BUILTIN_STATIC.has(e.name)) return new TypeRef('builtin', e.name);
        throw this.notFound(e.name, e);
      }
      case 'This':
        if (!ctx.self) throw new CompileError('CS0026', "Keyword 'this' is not valid in a static property, static method, or static field initializer", e.line, e.col);
        return ctx.self;
      case 'Member': return this.evalMember(e, ctx);
      case 'Index': return this.ref(e, ctx).get();
      case 'Call': return this.evalCall(e, ctx, asStatement);
      case 'New': return this.evalNew(e, ctx);
      case 'NewArray': return this.evalNewArray(e, ctx);
      case 'ArrayLit': throw new CompileError('CS1525', "Invalid expression term '{'", e.line, e.col);
      case 'Assign': return this.evalAssign(e, ctx);
      case 'Unary': {
        const v = this.eval(e.e, ctx);
        switch (e.op) {
          case '!': if (typeof v !== 'boolean') throw new CompileError('CS0023', `Operator '!' cannot be applied to operand of type '${typeNameOf(v)}'`, e.line, e.col); return !v;
          case '-': if (v instanceof Dbl) return new Dbl(-v.v); if (isNum(v)) return -numVal(v); throw new CompileError('CS0023', `Operator '-' cannot be applied to operand of type '${typeNameOf(v)}'`, e.line, e.col);
          case '+': if (v instanceof Dbl) return v; if (isNum(v)) return numVal(v); throw new CompileError('CS0023', `Operator '+' cannot be applied to operand of type '${typeNameOf(v)}'`, e.line, e.col);
          case '~': if (typeof v === 'number') return ~v; throw new CompileError('CS0023', `Operator '~' cannot be applied to operand of type '${typeNameOf(v)}'`, e.line, e.col);
        }
        break;
      }
      case 'PreInc': case 'PostInc': {
        const r = this.ref(e.e, ctx);
        const old = r.get();
        if (!isNum(old)) throw new CompileError('CS0023', `Operator '${e.op}' cannot be applied to operand of type '${typeNameOf(old)}'`, e.line, e.col);
        let nv;
        const d = e.op === '++' ? 1 : -1;
        if (old instanceof Dbl) nv = new Dbl(old.v + d);
        else if (old instanceof Chr) nv = new Chr(String.fromCharCode(old.c.charCodeAt(0) + d));
        else nv = old + d;
        r.set(nv);
        return e.k === 'PreInc' ? nv : old;
      }
      case 'Binary': {
        if (e.op === '&&' || e.op === '||') {
          const a = this.eval(e.l, ctx);
          if (typeof a !== 'boolean') { const b = this.eval(e.r, ctx); throw this.opErr(e.op, a, b, e); }
          if (e.op === '&&' && !a) { return false; }
          if (e.op === '||' && a) { return true; }
          const b = this.eval(e.r, ctx);
          if (typeof b !== 'boolean') throw this.opErr(e.op, a, b, e);
          return b;
        }
        const a = this.eval(e.l, ctx);
        const b = this.eval(e.r, ctx);
        return this.binop(e.op, a, b, e);
      }
      case 'Cond': {
        const c = this.cond(e.c, ctx);
        const v = c ? this.eval(e.a, ctx) : this.eval(e.b, ctx);
        return v;
      }
      case 'Coalesce': {
        const l = this.eval(e.l, ctx);
        return l !== null ? l : this.eval(e.r, ctx);
      }
      case 'Cast': return this.cast(this.eval(e.e, ctx), e.type, e);
      case 'Is': {
        const v = this.eval(e.e, ctx);
        let ok = this.isOfType(v, e.type);
        if (ok && e.bind) ctx.scope.vars.set(e.bind, { type: e.type, value: v });
        return e.neg ? !ok : ok;
      }
      case 'As': {
        const v = this.eval(e.e, ctx);
        return this.isOfType(v, e.type) ? v : null;
      }
      case 'Lambda': return new Lambda(e.params, e.body, ctx.scope, ctx);
      case 'Typeof': return new TypeObj(e.type, clrName(e.type));
      case 'Default': return e.type ? this.defaultOf(e.type) : (expected ? this.defaultOf(expected) : null);
      case 'Base': throw new CompileError('CS0175', "Use of keyword 'base' is not valid in this context", e.line, e.col);
    }
    throw new CompileError('CS0000', `Desteklenmeyen ifade: ${e.k}`, e.line, e.col);
  }

  isOfType(v, t) {
    if (v === null) return false;
    if (t === 'object' || t === 'var') return true;
    if (INT_T.has(t)) return typeof v === 'number';
    if (DBL_T.has(t)) return v instanceof Dbl;
    if (t === 'string') return typeof v === 'string';
    if (t === 'bool') return typeof v === 'boolean';
    if (t === 'char') return v instanceof Chr;
    if (v instanceof CsObject) return this.isAssignable(v.cls, t.replace(/<.*$/, ''));
    if (v instanceof EnumVal) return v.info.name === t;
    if (v instanceof CsList) return t.startsWith(v.kind) || t.startsWith('IEnumerable') || t.startsWith('I' + v.kind);
    if (v instanceof CsArray) return t.endsWith('[]');
    if (v instanceof CsDict) return t.startsWith('Dictionary') || t.startsWith('IDictionary');
    return false;
  }

  formatWith(v, fmt, node) {
    if (isNum(v) && !(v instanceof Chr)) {
      try { return formatNumber(v, fmt); } catch { this.throwExc('FormatException', 'Format specifier was invalid.', node); }
    }
    return toStr(v, this);
  }

  evalAssign(e, ctx) {
    const r = this.ref(e.target, ctx);
    let v;
    if (e.op === '=') {
      v = (e.e.k === 'ArrayLit' || (e.e.k === 'New' && !e.e.type)) ? this.evalInit(e.e, ctx, r.type) : this.eval(e.e, ctx);
    } else if (e.op === '??=') {
      const cur = r.get();
      if (cur !== null) return cur;
      v = this.eval(e.e, ctx);
    } else {
      const cur = r.get();
      const rhs = this.eval(e.e, ctx);
      v = this.binop(e.op.slice(0, -1), cur, rhs, e);
      // bileşik atama: char += 1 vb. örtük dönüşüme izin ver
      if (r.type === 'char' && typeof v === 'number') v = new Chr(String.fromCharCode(v));
    }
    if (r.type) v = this.coerce(v, r.type, e.e);
    r.set(v);
    return v;
  }

  evalMember(e, ctx, preTarget) {
    const target = preTarget !== undefined ? preTarget : this.evalTarget(e.obj, ctx);
    const name = e.name;
    if (target instanceof TypeRef) {
      if (target.kind === 'enum') {
        const m = target.info.members.get(name);
        if (!m) throw new CompileError('CS0117', `'${target.name}' does not contain a definition for '${name}'`, e.line, e.col);
        return m;
      }
      if (target.kind === 'class') {
        const r = this.staticRef(target.info, name, e, ctx);
        if (r) return r.get();
        const f = this.findField(target.info, name) || this.findProp(target.info, name);
        if (f) throw new CompileError('CS0120', `An object reference is required for the non-static field, method, or property '${target.name}.${name}'`, e.line, e.col);
        if (this.findMethods(target.info, name).length) return new MethodGroup(name, { cls: target.info, self: null });
        if (this.classes.has(name)) return new TypeRef('class', name, this.classes.get(name));
        throw new CompileError('CS0117', `'${target.name}' does not contain a definition for '${name}'`, e.line, e.col);
      }
      if (target.kind === 'builtin') return this.builtinStaticMember(target.name, name, e);
      throw this.notFound(name, e);
    }
    if (target && target.__base) {
      const r = this.memberRef(target.self, ctx.cls.base, name, e, ctx, false);
      if (r) return r.get();
      throw new CompileError('CS0117', `'${ctx.cls.base?.name}' does not contain a definition for '${name}'`, e.line, e.col);
    }
    if (target === null || target === undefined) {
      if (e.nullCond) return null;
      this.nullRef(e);
    }
    if (target instanceof CsObject) {
      const r = this.memberRef(target, target.cls, name, e, ctx, false);
      if (r) return r.get();
      if (this.findMethods(target.cls, name).length) return new MethodGroup(name, { cls: target.cls, self: target });
      throw new CompileError('CS1061', `'${target.cls.name}' does not contain a definition for '${name}' and no accessible extension method '${name}' accepting a first argument of type '${target.cls.name}' could be found`, e.line, e.col);
    }
    return this.builtinInstanceMember(target, name, e);
  }

  builtinStaticMember(tname, name, e) {
    const t = tname;
    const C = {
      Math: { PI: new Dbl(Math.PI), E: new Dbl(Math.E), Tau: new Dbl(Math.PI * 2) },
      MathF: { PI: new Dbl(Math.fround(Math.PI)) },
      int: { MaxValue: 2147483647, MinValue: -2147483648 },
      Int32: { MaxValue: 2147483647, MinValue: -2147483648 },
      long: { MaxValue: new Dbl(9223372036854775807), MinValue: new Dbl(-9223372036854775808) },
      double: { MaxValue: new Dbl(Number.MAX_VALUE), MinValue: new Dbl(-Number.MAX_VALUE), Epsilon: new Dbl(5e-324), NaN: new Dbl(NaN), PositiveInfinity: new Dbl(Infinity), NegativeInfinity: new Dbl(-Infinity) },
      float: { MaxValue: new Dbl(3.4028234663852886e38), MinValue: new Dbl(-3.4028234663852886e38), Epsilon: new Dbl(1.401298464324817e-45), NaN: new Dbl(NaN) },
      Double: { MaxValue: new Dbl(Number.MAX_VALUE), NaN: new Dbl(NaN) },
      string: { Empty: '' }, String: { Empty: '' },
      Environment: { NewLine: '\n' },
      char: { MaxValue: new Chr('￿'), MinValue: new Chr('\0') },
      StringSplitOptions: { RemoveEmptyEntries: 'RemoveEmptyEntries', None: 'None', TrimEntries: 'TrimEntries' },
      StringComparison: { OrdinalIgnoreCase: 'OrdinalIgnoreCase', Ordinal: 'Ordinal', CurrentCultureIgnoreCase: 'OrdinalIgnoreCase', InvariantCultureIgnoreCase: 'OrdinalIgnoreCase' },
      MidpointRounding: { AwayFromZero: 'AwayFromZero', ToEven: 'ToEven' },
      CultureInfo: { InvariantCulture: 'InvariantCulture', CurrentCulture: 'InvariantCulture' },
      NumberStyles: { Any: 'Any', Float: 'Float', Integer: 'Integer' },
    };
    if (C[t] && name in C[t]) return C[t][name];
    if (t === 'Console' && ['WriteLine', 'Write', 'ReadLine', 'Clear', 'ReadKey'].includes(name)) return new MethodGroup(name, { builtin: 'Console' });
    if (t === 'Console' && name === 'ForegroundColor') return null;
    throw new CompileError('CS0117', `'${t}' does not contain a definition for '${name}'`, e.line, e.col);
  }

  builtinInstanceMember(v, name, e) {
    const err = () => new CompileError('CS1061', `'${typeNameOf(v)}' does not contain a definition for '${name}' and no accessible extension method '${name}' accepting a first argument of type '${typeNameOf(v)}' could be found (are you missing a using directive or an assembly reference?)`, e.line, e.col);
    if (typeof v === 'string') { if (name === 'Length') return v.length; throw err(); }
    if (v instanceof CsArray) { if (name === 'Length') return v.items.length; if (name === 'Rank') return v.dims.length; throw err(); }
    if (v instanceof CsList) { if (name === 'Count') return v.items.length; if (name === 'Capacity') return Math.max(4, v.items.length); throw err(); }
    if (v instanceof CsDict) {
      if (name === 'Count') return v.map.size;
      if (name === 'Keys') return new CsList(v.kType, [...v.map.values()].map(x => x.k), 'KeyCollection');
      if (name === 'Values') return new CsList(v.vType, [...v.map.values()].map(x => x.v), 'ValueCollection');
      throw err();
    }
    if (v instanceof KVPair) { if (name === 'Key') return v.key; if (name === 'Value') return v.value; throw err(); }
    if (v instanceof StrBuilder) { if (name === 'Length') return v.s.length; throw err(); }
    if (v instanceof TypeObj) { if (name === 'Name') return v.name; if (name === 'FullName') return v.full; throw err(); }
    if (v instanceof EnumVal) throw err();
    throw err();
  }

  // ================= nesne oluşturma =================
  evalNew(e, ctx) {
    const tn = e.type;
    if (!tn || tn === 'var') throw new CompileError('CS8754', "There is no target type for 'new()'", e.line, e.col);
    const base = tn.replace(/<.*$/, '').replace(/^System\.(Collections\.Generic\.|Text\.)?/, '');
    const targs = e.typeNode ? e.typeNode.args.map(a => typeToStr(a)) : (/<(.*)>/.exec(tn)?.[1].split(',').map(s => s.trim()) || []);
    const args = (e.args || []).map(a => this.eval(a.e, ctx));
    let obj;
    switch (base) {
      case 'List': {
        const et = targs[0] || 'object';
        obj = new CsList(et, []);
        if (args[0] && !(typeof args[0] === 'number')) obj.items = this.iterate(args[0], e).items.map(x => this.coerce(x, et, e));
        break;
      }
      case 'HashSet': {
        obj = new CsList(targs[0] || 'object', [], 'HashSet');
        if (args[0]) for (const x of this.iterate(args[0], e).items) if (!obj.items.some(y => this.equals(x, y))) obj.items.push(x);
        break;
      }
      case 'Stack': obj = new CsList(targs[0] || 'object', args[0] && typeof args[0] !== 'number' ? this.iterate(args[0], e).items : [], 'Stack'); break;
      case 'Queue': obj = new CsList(targs[0] || 'object', args[0] && typeof args[0] !== 'number' ? this.iterate(args[0], e).items : [], 'Queue'); break;
      case 'LinkedList': obj = new CsList(targs[0] || 'object', [], 'LinkedList'); break;
      case 'Dictionary': case 'SortedDictionary': {
        obj = new CsDict(targs[0] || 'object', targs[1] || 'object');
        if (base === 'SortedDictionary') obj.sorted = true;
        break;
      }
      case 'string': case 'String': {
        if (args[0] instanceof Chr && typeof args[1] === 'number') { obj = args[0].c.repeat(Math.max(0, args[1])); break; }
        if (args[0] instanceof CsArray) { obj = args[0].items.map(c => c.c ?? toStr(c)).join(''); break; }
        throw new CompileError('CS1729', `'string' does not contain a constructor that takes ${args.length} arguments`, e.line, e.col);
      }
      case 'StringBuilder': obj = new StrBuilder(args[0] !== undefined && typeof args[0] === 'string' ? args[0] : ''); break;
      case 'Random': obj = new RandomGen(args[0]); break;
      case 'object': case 'Object': obj = new CsObject({ name: 'Object', fields: [], props: new Map(), methods: new Map(), base: null, interfaces: [] }); break;
      default: {
        const cls = this.classes.get(base);
        if (!cls) {
          if (BUILTIN_TYPES.has(base) || BUILTIN_STATIC.has(base)) throw new CompileError('CS0712', `Cannot create an instance of the static class or primitive '${base}'`, e.line, e.col);
          throw new CompileError('CS0246', `The type or namespace name '${base}' could not be found (are you missing a using directive or an assembly reference?)`, e.line, e.col);
        }
        if (cls.isAbstract || cls.isInterface) throw new CompileError('CS0144', `Cannot create an instance of the abstract type or interface '${base}'`, e.line, e.col);
        if (cls.isStatic) throw new CompileError('CS0712', `Cannot create an instance of the static class '${base}'`, e.line, e.col);
        obj = this.instantiate(cls, args, e, ctx);
      }
    }
    if (e.init) this.applyInit(obj, e.init, ctx, e);
    return obj;
  }

  applyInit(obj, init, ctx, e) {
    if (init.k === 'ObjInit') {
      for (const s of init.sets) {
        const node = { k: 'Member', obj: { k: '__val' }, name: s.name, line: e.line, col: e.col };
        const r = obj instanceof CsObject ? this.memberRef(obj, obj.cls, s.name, node, { ...ctx, inCtor: false, initializer: true }, false) : null;
        if (!r) throw new CompileError('CS0117', `'${typeNameOf(obj)}' does not contain a definition for '${s.name}'`, e.line, e.col);
        let v = s.e.k === 'ArrayLit' ? this.evalInit(s.e, ctx, r.type) : this.eval(s.e, ctx);
        v = this.coerce(v, r.type, s.e);
        // init-only/auto get-only özelliklere nesne başlatıcıda atamaya izin ver
        const p = this.findProp(obj.cls, s.name);
        if (p && p.auto && (p.setMods === undefined ? !p.hasSet : false)) throw new CompileError('CS0200', `Property or indexer '${obj.cls.name}.${s.name}' cannot be assigned to -- it is read only`, e.line, e.col);
        if (p && p.auto) obj.fields.set(s.name, v); else r.set(v);
      }
      return;
    }
    if (init.k === 'CollInit') {
      for (const it of init.items) {
        if (obj instanceof CsDict) {
          if (it.k !== 'ArrayLit' || it.items.length !== 2) throw new CompileError('CS7036', 'Dictionary başlatıcısı { anahtar, değer } çiftleri bekler', e.line, e.col);
          this.dictAdd(obj, this.eval(it.items[0], ctx), this.eval(it.items[1], ctx), e);
        } else if (obj instanceof CsList) {
          const v = this.coerce(this.eval(it, ctx), obj.elemType, it);
          if (obj.kind === 'HashSet') { if (!obj.items.some(y => this.equals(v, y))) obj.items.push(v); } else obj.items.push(v);
        } else throw new CompileError('CS1922', `Cannot initialize type '${typeNameOf(obj)}' with a collection initializer because it does not implement 'System.Collections.IEnumerable'`, e.line, e.col);
      }
      return;
    }
    if (init.k === 'IndexInit') {
      for (const p of init.pairs) {
        const k = this.eval(p.key, ctx), v = this.eval(p.e, ctx);
        obj.map.set(this.dictKey(k), { k, v: this.coerce(v, obj.vType, p.e) });
      }
    }
  }

  dictAdd(d, k, v, node) {
    k = this.coerce(k, d.kType, node); v = this.coerce(v, d.vType, node);
    if (k === null) this.throwExc('ArgumentNullException', "Value cannot be null. (Parameter 'key')", node);
    const key = this.dictKey(k);
    if (d.map.has(key)) this.throwExc('ArgumentException', `An item with the same key has already been added. Key: ${toStr(k, this)}`, node);
    d.map.set(key, { k, v });
    if (d.sorted) d.map = new Map([...d.map.entries()].sort((a, b) => this.compare(a[1].k, b[1].k)));
    d.version++;
  }

  instantiate(cls, args, node, ctx) {
    const obj = new CsObject(cls);
    const chain = [];
    for (let c = cls; c; c = c.base) chain.unshift(c);
    // alanları varsayılan değerlerle doldur
    for (const c of chain) {
      if (c.builtin) { if (c.name === 'Exception') { obj.fields.set('Message', DEFAULT_EXC_MSG(cls.name)); obj.fields.set('InnerException', null); } continue; }
      for (const f of c.fields) if (!f.static) obj.fields.set(f.name, this.defaultOf(f.type));
      for (const p of c.props.values()) if (!p.static && p.auto) obj.fields.set(p.name, this.defaultOf(p.type));
    }
    this.runCtor(cls, obj, args, node || { line: this.curLine, col: 1 }, ctx);
    return obj;
  }

  initFields(c, obj) {
    const fctx = { scope: new Scope(null), self: obj, cls: c, inCtor: true };
    for (const f of c.fields) if (!f.static && f.init) obj.fields.set(f.name, this.coerce(this.evalInit(f.init, fctx, f.type), f.type, f.init));
    for (const p of c.props.values()) if (!p.static && p.auto && p.init) obj.fields.set(p.name, this.coerce(this.evalInit(p.init, fctx, p.type), p.type, p.init));
  }

  runCtor(cls, obj, args, node, callerCtx) {
    if (cls.builtin) {
      // Exception(string message, Exception inner) — Argument* türlerinde parametre adı biçimi .NET gibi
      const n = cls.name;
      const str = (v) => toStr(v, this);
      if (n === 'ArgumentNullException' || n === 'ArgumentOutOfRangeException') {
        const base = n === 'ArgumentNullException' ? 'Value cannot be null.' : 'Specified argument was out of the range of valid values.';
        if (args.length === 1) obj.fields.set('Message', `${base} (Parameter '${str(args[0])}')`);
        else if (args.length >= 2 && typeof args[1] === 'string') obj.fields.set('Message', `${str(args[1])} (Parameter '${str(args[0])}')`);
        return;
      }
      if (n === 'ArgumentException' && args.length >= 2 && typeof args[1] === 'string') {
        obj.fields.set('Message', `${str(args[0])} (Parameter '${str(args[1])}')`);
        return;
      }
      if (args.length > 0) obj.fields.set('Message', args[0] === null ? DEFAULT_EXC_MSG(obj.cls.name) : str(args[0]));
      if (args.length > 1) obj.fields.set('InnerException', args[1]);
      return;
    }
    const ctors = cls.ctors.filter(c => !c.static);
    let ctor = null;
    if (ctors.length) {
      ctor = this.pickOverload(ctors, args, node, cls.name, true);
      if (!this.canAccess(ctor.mods || (ctor.isPublic ? ['public'] : null) || this.ctorMods(ctor), cls, callerCtx || {})) {
        // kurucunun erişim belirleyicisi parse sırasında saklanmadı; varsayılan public kabul edilir
      }
    } else if (args.length) {
      throw new CompileError('CS1729', `'${cls.name}' does not contain a constructor that takes ${args.length} arguments`, node.line, node.col);
    }
    // base / this kurucu zinciri
    const scope = new Scope(null); scope.isFuncRoot = true;
    const cctx = { scope, self: obj, cls, inCtor: true, fnName: cls.name };
    if (ctor) this.bindParams(ctor, args, scope, node, cls.name);
    if (ctor && ctor.init && ctor.init.which === 'this') {
      const a2 = ctor.init.args.map(a => this.eval(a.e, cctx));
      this.runCtor(cls, obj, a2, node, cctx);
    } else {
      if (cls.base) {
        const a2 = ctor && ctor.init && ctor.init.which === 'base' ? ctor.init.args.map(a => this.eval(a.e, cctx)) : [];
        if (!(ctor && ctor.init) && cls.base.ctors && cls.base.ctors.filter(c => !c.static).length && !cls.base.ctors.some(c => !c.static && c.params.length === 0)) {
          throw new CompileError('CS7036', `There is no argument given that corresponds to the required parameter of '${cls.base.name}.${cls.base.name}(...)'`, (ctor || cls.decl).line, 1);
        }
        this.runCtor(cls.base, obj, a2, node, cctx);
      }
      this.initFields(cls, obj);
    }
    if (ctor) {
      this.enter(node);
      try {
        const r = this.execBlockIn(ctor.body, cctx);
      } finally { this.depth--; }
    }
  }
  ctorMods() { return ['public']; }

  evalNewArray(e, ctx) {
    if (e.init && !e.sizes) {
      if (!e.elem) {
        const vals = e.init.items.map(x => this.eval(x, ctx));
        let et = vals.length ? typeNameOf(vals[0]) : 'object';
        if (vals.some(v => v instanceof Dbl) && vals.every(isNum)) et = 'double';
        return new CsArray(et, vals.map(v => this.coerce(v, et, e)));
      }
      return this.buildArray(e.elem, e.init, ctx);
    }
    const sizes = e.sizes.map(s => s ? this.toIndex(this.eval(s, ctx), s) : 0);
    for (const n of sizes) if (n < 0) this.throwExc('OverflowException', 'Arithmetic operation resulted in an overflow.', e);
    if (e.multi) {
      const total = sizes.reduce((a, b) => a * b, 1);
      const arr = new CsArray(e.elem, Array.from({ length: total }, () => this.defaultOf(e.elem)), sizes);
      if (e.init) { const built = this.buildArray(e.elem, e.init, ctx); arr.items = built.items; }
      return arr;
    }
    const arr = new CsArray(e.elem, Array.from({ length: sizes[0] }, () => this.defaultOf(e.elem)));
    if (e.init) {
      if (e.init.items.length !== sizes[0]) throw new CompileError('CS0847', `An array initializer of length '${sizes[0]}' is expected`, e.line, e.col);
      arr.items = this.buildArray(e.elem, e.init, ctx).items;
    }
    return arr;
  }

  // ================= çağrılar =================
  /** Argümanları değerlendirir; out/ref için slot döndürür. */
  evalArgs(args, ctx) {
    return args.map(a => {
      if (a.mod === 'out' || a.mod === 'ref') {
        if (a.declType) {
          const slot = { type: a.declType === 'var' ? 'var' : a.declType, value: UNASSIGNED };
          ctx.scope.declare(a.declName, slot, a.e);
          return { refSlot: slot, mod: a.mod };
        }
        if (a.e.k === 'Ident' && a.e.name === '_') return { refSlot: { type: 'var', value: null }, mod: a.mod };
        const r = this.ref(a.e, ctx);
        if (r.slot) return { refSlot: r.slot, mod: a.mod };
        const proxy = { type: r.type };
        Object.defineProperty(proxy, 'value', { get: () => r.get(), set: v => r.set(v) });
        return { refSlot: proxy, mod: a.mod };
      }
      const v = this.eval(a.e, ctx);
      return a.named ? { named: a.named, v } : v;
    });
  }

  evalCall(e, ctx, asStatement) {
    const c = e.callee;
    // yerel isim: Foo(...)
    if (c.k === 'Ident') {
      const slot = ctx.scope.lookup(c.name);
      if (slot && slot.fn) {
        const args = this.evalArgs(e.args, ctx);
        return this.invoke(slot.fn, null, null, args, e, false, slot.closure);
      }
      if (slot && !slot.fn) {
        const fv = slot.value;
        if (fv instanceof Lambda || fv instanceof MethodGroup) return this.callDelegate(fv, this.evalArgs(e.args, ctx), e);
        throw new CompileError('CS0149', `Method name expected ('${c.name}' bir değişken, metot değil)`, e.line, e.col);
      }
      if (ctx.cls) {
        const ms = this.findMethods(ctx.cls, c.name);
        if (ms.length) {
          const args = this.evalArgs(e.args, ctx);
          const m = this.pickOverload(ms, args, e, c.name);
          if (!m.static && !ctx.self) throw new CompileError('CS0120', `An object reference is required for the non-static field, method, or property '${m.owner.name}.${c.name}(${m.params.map(p => p.type).join(', ')})'`, e.line, e.col);
          if (!this.canAccess(m.mods, m.owner, ctx)) throw this.accessErr(m.owner, c.name, e);
          // sanal çağrı
          const target = !m.static && ctx.self ? this.virtualResolve(ctx.self.cls, m) : m;
          return this.invoke(target, m.static ? null : ctx.self, target.owner, args, e);
        }
        const r = this.memberRef(ctx.self, ctx.cls, c.name, c, ctx, true);
        if (r) { const fv = r.get(); if (fv instanceof Lambda || fv instanceof MethodGroup) return this.callDelegate(fv, this.evalArgs(e.args, ctx), e); }
      }
      if (ctx.self && ['GetType', 'ToString', 'Equals', 'GetHashCode'].includes(c.name)) {
        return this.callBuiltinInstance(ctx.self, c.name, this.evalArgs(e.args, ctx), e, ctx, c);
      }
      throw this.notFound(c.name, c);
    }
    if (c.k === 'Member') {
      const target = this.evalTarget(c.obj, ctx);
      const name = c.name;
      if (target instanceof TypeRef) {
        if (target.kind === 'builtin') return this.callBuiltinStatic(target.name, name, e, ctx);
        if (target.kind === 'class') {
          const ms = this.findMethods(target.info, name);
          if (!ms.length) {
            const r = this.staticRef(target.info, name, c, ctx);
            if (r) { const fv = r.get(); if (fv instanceof Lambda) return this.callDelegate(fv, this.evalArgs(e.args, ctx), e); }
            throw new CompileError('CS0117', `'${target.name}' does not contain a definition for '${name}'`, c.line, c.col);
          }
          const args = this.evalArgs(e.args, ctx);
          const m = this.pickOverload(ms, args, e, name);
          if (!m.static) throw new CompileError('CS0120', `An object reference is required for the non-static field, method, or property '${target.name}.${name}(${m.params.map(p => p.type).join(', ')})'`, e.line, e.col);
          if (!this.canAccess(m.mods, m.owner, ctx)) throw this.accessErr(m.owner, name, c);
          return this.invoke(m, null, m.owner, args, e);
        }
        if (target.kind === 'enum') {
          throw new CompileError('CS0117', `'${target.name}' does not contain a definition for '${name}'`, c.line, c.col);
        }
        throw this.notFound(name, c);
      }
      if (target && target.__base) {
        const ms = this.findMethods(ctx.cls.base, name);
        const args = this.evalArgs(e.args, ctx);
        if (!ms.length) {
          if (name === 'ToString') return ctx.cls.base.builtin ? this.objToStringBase(target.self) : target.self.cls.name;
          throw new CompileError('CS0117', `'${ctx.cls.base.name}' does not contain a definition for '${name}'`, c.line, c.col);
        }
        const m = this.pickOverload(ms, args, e, name);
        if (!m.body) throw new CompileError('CS0205', `Cannot call an abstract base member: '${m.owner.name}.${name}'`, e.line, e.col);
        return this.invoke(m, target.self, m.owner, args, e);
      }
      if (target === null || target === undefined) {
        if (c.nullCond) return null;
        this.nullRef(c);
      }
      if (target instanceof CsObject && target.cls.methods) {
        const ms = this.findMethods(target.cls, name);
        if (ms.length) {
          const args = this.evalArgs(e.args, ctx);
          const m = this.pickOverload(ms, args, e, name);
          if (!this.canAccess(m.mods, m.owner, ctx)) throw this.accessErr(m.owner, name, c);
          if (m.static) throw new CompileError('CS0176', `Member '${m.owner.name}.${name}(${m.params.map(p => p.type).join(', ')})' cannot be accessed with an instance reference; qualify it with a type name instead`, e.line, e.col);
          const impl = this.virtualResolve(target.cls, m);
          if (!impl.body) throw new CompileError('CS0000', 'Soyut metot çağrılamaz', e.line, e.col);
          return this.invoke(impl, target, impl.owner, args, e);
        }
        const r = this.memberRef(target, target.cls, name, c, ctx, false);
        if (r) { const fv = r.get(); if (fv instanceof Lambda || fv instanceof MethodGroup) return this.callDelegate(fv, this.evalArgs(e.args, ctx), e); }
      }
      const args = this.evalArgs(e.args, ctx);
      return this.callBuiltinInstance(target, name, args, e, ctx, c);
    }
    // ifade sonucu bir delege: GetFunc()(5)
    const fv = this.eval(c, ctx);
    if (fv instanceof Lambda || fv instanceof MethodGroup) return this.callDelegate(fv, this.evalArgs(e.args, ctx), e);
    throw new CompileError('CS0149', 'Method name expected', e.line, e.col);
  }

  objToStringBase(o) { return this.isExceptionClass(o.cls) ? `${this.excFullName(o.cls)}: ${o.fields.get('Message')}` : o.cls.name; }

  virtualResolve(runtimeCls, m) {
    if (m.static || !(m.mods.includes('virtual') || m.mods.includes('abstract') || m.mods.includes('override') || m.owner.isInterface)) {
      // virtual değilse (new/gizleme) statik çözüm; ama interface ise türetilmiş uygulamayı bul
      if (!m.owner.isInterface) return m;
    }
    for (let c = runtimeCls; c; c = c.base) {
      const found = (c.methods.get(m.name) || []).find(x => x.params.length === m.params.length && x.body && x.params.every((p, i) => p.type === m.params[i].type));
      if (found) return found;
    }
    return m;
  }

  callDelegate(fv, args, node) {
    if (fv instanceof Lambda) return this.callLambda(fv, args.map(a => (a && a.refSlot) ? a.refSlot.value : a), node);
    if (fv instanceof MethodGroup) {
      const t = fv.target;
      if (t.fnSlot) return this.invoke(t.fnSlot.fn, null, null, args, node, false, t.fnSlot.closure);
      if (t.builtin === 'Console') return this.callBuiltinStaticVals('Console', fv.name, args, node);
      if (t.cls) {
        const ms = this.findMethods(t.cls, fv.name);
        const m = this.pickOverload(ms, args, node, fv.name);
        return this.invoke(t.self ? this.virtualResolve(t.self.cls, m) : m, t.self, m.owner, args, node);
      }
    }
    throw new CompileError('CS0149', 'Method name expected', node.line, node.col);
  }

  callLambda(lam, args, node) {
    const scope = new Scope(lam.scope);
    lam.params.forEach((p, i) => scope.vars.set(p, { type: 'var', value: args[i] }));
    this.enter(node);
    try {
      const lctx = { ...lam.ctx, scope };
      if (lam.body.k === 'Block') {
        const r = this.execBlockIn(lam.body, lctx);
        return r && r.s === 'return' ? r.v : undefined;
      }
      return this.eval(lam.body, lctx);
    } finally { this.depth--; }
  }

  /** Aşırı yükleme (overload) çözümü: argüman sayısı + tür uyumu. */
  pickOverload(ms, args, node, name, isCtor = false) {
    const n = args.length;
    const fits = ms.filter(m => {
      const req = m.params.filter(p => !p.def && p.mod !== 'params').length;
      const hasParams = m.params.some(p => p.mod === 'params');
      return n >= req && (n <= m.params.length || hasParams);
    });
    if (!fits.length) {
      const m = ms[0];
      const owner = m.owner ? m.owner.name : 'Program';
      if (isCtor) throw new CompileError('CS1729', `'${name}' does not contain a constructor that takes ${n} arguments`, node.line, node.col);
      if (ms.length === 1 && n < m.params.length) {
        const missing = m.params[n];
        throw new CompileError('CS7036', `There is no argument given that corresponds to the required parameter '${missing.name}' of '${owner}.${name}(${m.params.map(p => p.type).join(', ')})'`, node.line, node.col);
      }
      throw new CompileError('CS1501', `No overload for method '${name}' takes ${n} arguments`, node.line, node.col);
    }
    if (fits.length === 1) return fits[0];
    let best = fits[0], bestScore = -1;
    for (const m of fits) {
      let score = 0, ok = true;
      args.forEach((a, i) => {
        const p = m.params[i];
        if (!p) return;
        const v = a && a.refSlot ? a.refSlot.value : a && a.named ? a.v : a;
        const vt = typeNameOf(v);
        if (vt === p.type || (v === null && !PRIM.has(p.type))) score += 3;
        else {
          try { this.coerce(v, p.type, node); score += 1; } catch { ok = false; }
        }
      });
      if (ok && score > bestScore) { best = m; bestScore = score; }
    }
    if (bestScore < 0) {
      // hiçbiri uymadı → ilk adayla tür hatası üretilsin
      return fits[0];
    }
    return best;
  }

  bindParams(m, args, scope, node, name) {
    const named = args.filter(a => a && a.named);
    const pos = args.filter(a => !(a && a.named));
    if (pos.length > m.params.length && !m.params.some(p => p.mod === 'params')) {
      throw new CompileError('CS1501', `No overload for method '${name}' takes ${args.length} arguments`, node.line, node.col);
    }
    m.params.forEach((p, i) => {
      if (p.mod === 'params') {
        const rest = pos.slice(i);
        const et = p.type.replace(/\[\]$/, '');
        let arr;
        if (rest.length === 1 && rest[0] instanceof CsArray) arr = rest[0];
        else arr = new CsArray(et, rest.map(v => this.coerce(v, et, node)));
        scope.vars.set(p.name, { type: p.type, value: arr });
        return;
      }
      let a = i < pos.length ? pos[i] : undefined;
      const nm = named.find(x => x.named === p.name);
      if (nm) a = nm.v;
      if (p.mod === 'out' || p.mod === 'ref') {
        if (!a || !a.refSlot) throw new CompileError('CS1620', `Argument ${i + 1} must be passed with the '${p.mod}' keyword`, node.line, node.col);
        const slot = a.refSlot;
        if (slot.type === 'var') slot.type = p.type;
        scope.vars.set(p.name, slot);
        if (p.mod === 'out') slot.value = UNASSIGNED;
        return;
      }
      if (a && a.refSlot) throw new CompileError('CS1615', `Argument ${i + 1} may not be passed with the '${a.mod}' keyword`, node.line, node.col);
      if (a === undefined) {
        if (!p.def) throw new CompileError('CS7036', `There is no argument given that corresponds to the required parameter '${p.name}' of '${name}'`, node.line, node.col);
        a = this.eval(p.def, { scope: new Scope(null), self: null, cls: m.owner });
      }
      if (a instanceof Lambda || a instanceof MethodGroup) { scope.vars.set(p.name, { type: p.type, value: a }); return; }
      scope.vars.set(p.name, { type: p.type, value: this.coerce(a, p.type, node.args && node.args[i] ? node.args[i].e : node) });
    });
  }

  invoke(m, self, cls, args, node, isEntry = false, closure = null) {
    if (!m.body) throw new CompileError('CS0000', `'${m.name}' metodunun gövdesi yok`, node.line, node.col);
    const scope = new Scope(closure);
    scope.isFuncRoot = true;
    this.bindParams(m, args, scope, node, m.name);
    if (isEntry) this.entryScope = scope;
    this.enter(node);
    const ctx = { scope, self, cls: cls || null, fnName: m.name, retType: m.retType };
    let r;
    try {
      r = this.execBlockIn(m.body, ctx);
    } finally { this.depth--; }
    // out parametreleri atanmış olmalı
    for (const p of m.params) {
      if (p.mod === 'out' && scope.vars.get(p.name).value === UNASSIGNED) {
        throw new CompileError('CS0177', `The out parameter '${p.name}' must be assigned to before control leaves the current method`, m.line, m.col);
      }
    }
    const owner = cls ? cls.name : 'Program';
    if (m.retType === 'void') {
      if (r && r.s === 'return' && r.hasValue) throw new CompileError('CS0127', `Since '${owner}.${m.name}(${m.params.map(p => p.type).join(', ')})' returns void, a return keyword must not be followed by an object expression`, r.node.line, r.node.col);
      return undefined;
    }
    if (!r || r.s !== 'return') {
      throw new CompileError('CS0161', `'${owner}.${m.name}(${m.params.map(p => p.type).join(', ')})': not all code paths return a value`, m.line, m.col);
    }
    if (!r.hasValue) throw new CompileError('CS0126', `An object of a type convertible to '${m.retType}' is required`, r.node.line, r.node.col);
    return this.coerce(r.v, m.retType, r.node.e || r.node);
  }

  // ================= yerleşik statik çağrılar =================
  callBuiltinStatic(tname, name, e, ctx) {
    // TryParse gibi out parametreli çağrılar için slot'ları koru
    const args = this.evalArgs(e.args, ctx);
    return this.callBuiltinStaticVals(tname, name, args, e, ctx);
  }

  argErr(tname, name, n, node) {
    return new CompileError('CS1501', `No overload for method '${name}' takes ${n} arguments`, node.line, node.col);
  }

  callBuiltinStaticVals(tname, name, args, e, ctx) {
    const vals = args.map(a => (a && a.refSlot) ? a.refSlot : (a && a.named) ? a.v : a);
    const n = args.length;
    const need = (...counts) => { if (!counts.includes(n)) throw this.argErr(tname, name, n, e); };
    const num = (v, i = 0) => { if (!isNum(v)) throw new CompileError('CS1503', `Argument ${i + 1}: cannot convert from '${typeNameOf(v)}' to 'double'`, e.line, e.col); return numVal(v); };
    const T = tname === 'String' ? 'string' : tname === 'Int32' ? 'int' : tname === 'Double' ? 'double' : tname === 'Boolean' ? 'bool' : tname === 'Char' ? 'char' : tname === 'MathF' ? 'Math' : tname === 'Object' ? 'object' : tname;
    switch (T) {
      case 'Console':
        switch (name) {
          case 'WriteLine': case 'Write': {
            let s = '';
            if (n >= 1) {
              if (n > 1 && typeof vals[0] === 'string') s = this.stringFormat(vals[0], vals.slice(1), e);
              else if (n > 1) throw new CompileError('CS1501', `No overload for method '${name}' takes ${n} arguments`, e.line, e.col);
              else {
                const v = vals[0];
                if (v instanceof MethodGroup || v instanceof Lambda) throw new CompileError('CS1503', "Argument 1: cannot convert from 'method group' to 'bool'", e.line, e.col);
                if (v === undefined) throw new CompileError('CS1503', "Argument 1: cannot convert from 'void' to 'bool'", e.line, e.col);
                s = toStr(v, this);
              }
            }
            this.write(name === 'WriteLine' ? s + '\n' : s);
            return undefined;
          }
          case 'ReadLine':
            need(0);
            if (this.stdinPos < this.stdin.length) {
              const line = this.stdin[this.stdinPos++];
              if (this.traceOn || true) this.echoInput?.(line);
              return line;
            }
            return null;
          case 'ReadKey': case 'Read': return null;
          case 'Clear': return undefined;
          case 'Beep': case 'ResetColor': case 'SetCursorPosition': return undefined;
        }
        break;
      case 'Math': {
        const r = x => new Dbl(x);
        switch (name) {
          case 'Abs': need(1); return vals[0] instanceof Dbl ? r(Math.abs(vals[0].v)) : Math.abs(num(vals[0]));
          case 'Max': case 'Min': {
            need(2);
            const f = name === 'Max' ? Math.max : Math.min;
            const res = f(num(vals[0]), num(vals[1], 1));
            return (vals[0] instanceof Dbl || vals[1] instanceof Dbl) ? r(res) : res;
          }
          case 'Pow': need(2); return r(Math.pow(num(vals[0]), num(vals[1], 1)));
          case 'Sqrt': need(1); return r(Math.sqrt(num(vals[0])));
          case 'Cbrt': need(1); return r(Math.cbrt(num(vals[0])));
          case 'Floor': need(1); return r(Math.floor(num(vals[0])));
          case 'Ceiling': need(1); return r(Math.ceil(num(vals[0])));
          case 'Truncate': need(1); return r(Math.trunc(num(vals[0])));
          case 'Round': {
            const x = num(vals[0]);
            let digits = 0, mode = 'ToEven';
            if (n >= 2) { if (typeof vals[1] === 'string') mode = vals[1]; else digits = num(vals[1]); }
            if (n >= 3) mode = vals[2];
            return r(roundHalf(x, digits, mode));
          }
          case 'Sign': need(1); return Math.sign(num(vals[0]));
          case 'Sin': case 'Cos': case 'Tan': case 'Asin': case 'Acos': case 'Atan': case 'Exp': case 'Log10': case 'Log2':
            need(1); return r(Math[name.toLowerCase()](num(vals[0])));
          case 'Log': return n === 2 ? r(Math.log(num(vals[0])) / Math.log(num(vals[1]))) : r(Math.log(num(vals[0])));
          case 'Atan2': need(2); return r(Math.atan2(num(vals[0]), num(vals[1], 1)));
          case 'Clamp': {
            need(3);
            const v = Math.min(Math.max(num(vals[0]), num(vals[1])), num(vals[2]));
            return vals.some(x => x instanceof Dbl) ? r(v) : v;
          }
          case 'Hypot': return r(Math.hypot(num(vals[0]), num(vals[1])));
        }
        break;
      }
      case 'int': case 'long': case 'short': case 'byte':
        if (name === 'Parse') { need(1, 2, 3); return this.parseInt(vals[0], e); }
        if (name === 'TryParse') {
          need(2);
          const slot = vals[1];
          try { slot.value = this.parseInt(vals[0], e); return true; } catch (err) { if (err instanceof CsThrow) { slot.value = 0; return false; } throw err; }
        }
        if (name === 'IsEven') return num(vals[0]) % 2 === 0;
        break;
      case 'double': case 'float': case 'decimal':
        if (name === 'Parse') { need(1, 2, 3); return this.parseDouble(vals[0], e); }
        if (name === 'TryParse') {
          need(2, 4);
          const slot = vals[n - 1];
          try { slot.value = this.parseDouble(vals[0], e); return true; } catch (err) { if (err instanceof CsThrow) { slot.value = new Dbl(0); return false; } throw err; }
        }
        if (name === 'IsNaN') return Number.isNaN(num(vals[0]));
        if (name === 'IsInfinity') return !Number.isFinite(num(vals[0])) && !Number.isNaN(num(vals[0]));
        if (name === 'IsFinite') return Number.isFinite(num(vals[0]));
        break;
      case 'bool':
        if (name === 'Parse') {
          const s = String(vals[0] ?? '').trim().toLowerCase();
          if (s === 'true') return true; if (s === 'false') return false;
          this.throwExc('FormatException', `String '${vals[0]}' was not recognized as a valid Boolean.`, e);
        }
        if (name === 'TryParse') {
          const s = String(vals[0] ?? '').trim().toLowerCase();
          if (s === 'true' || s === 'false') { vals[1].value = s === 'true'; return true; }
          vals[1].value = false; return false;
        }
        break;
      case 'char': {
        const c = vals[0] instanceof Chr ? vals[0].c : (typeof vals[0] === 'string' && vals[1] !== undefined ? vals[0][num(vals[1])] : null);
        switch (name) {
          case 'IsDigit': return /[0-9]/.test(c);
          case 'IsLetter': return /\p{L}/u.test(c);
          case 'IsLetterOrDigit': return /[\p{L}0-9]/u.test(c);
          case 'IsUpper': return /\p{Lu}/u.test(c);
          case 'IsLower': return /\p{Ll}/u.test(c);
          case 'IsWhiteSpace': return /\s/.test(c);
          case 'IsPunctuation': return /[!-\/:-@\[-`{-~]/.test(c) && !/[$+<=>^`|~]/.test(c);
          case 'ToUpper': return new Chr(c.toUpperCase());
          case 'ToLower': return new Chr(c.toLowerCase());
          case 'Parse': if (typeof vals[0] !== 'string' || vals[0].length !== 1) this.throwExc('FormatException', 'String must be exactly one character long.', e); return new Chr(vals[0]);
          case 'GetNumericValue': return new Dbl(/[0-9]/.test(c) ? Number(c) : -1);
        }
        break;
      }
      case 'string':
        switch (name) {
          case 'IsNullOrEmpty': need(1); return vals[0] === null || vals[0] === '';
          case 'IsNullOrWhiteSpace': need(1); return vals[0] === null || String(vals[0]).trim() === '';
          case 'Join': {
            const sep = toStr(vals[0], this);
            let items;
            if (n === 2 && vals[1] !== null && typeof vals[1] === 'object' && !(vals[1] instanceof Dbl) && !(vals[1] instanceof Chr) && !(vals[1] instanceof CsObject)) items = this.iterate(vals[1], e).items;
            else items = vals.slice(1);
            return items.map(x => toStr(x, this)).join(sep);
          }
          case 'Concat': return vals.map(x => (x instanceof CsList || x instanceof CsArray) ? this.iterate(x, e).items.map(y => toStr(y, this)).join('') : toStr(x, this)).join('');
          case 'Format': return this.stringFormat(vals[0], vals.slice(1), e);
          case 'Compare': { const a = vals[0] ?? '', b = vals[1] ?? ''; return a < b ? -1 : a > b ? 1 : 0; }
          case 'Equals': return vals[0] === vals[1];
          case 'Empty': return '';
        }
        break;
      case 'Convert':
        switch (name) {
          case 'ToInt32': case 'ToInt64': case 'ToInt16': case 'ToByte': {
            need(1, 2);
            const v = vals[0];
            if (typeof v === 'string') return this.parseInt(v, e);
            if (v === null) return 0;
            if (v instanceof Dbl) return roundHalf(v.v, 0, 'ToEven');
            if (typeof v === 'boolean') return v ? 1 : 0;
            if (v instanceof Chr) return v.c.charCodeAt(0);
            return numVal(v);
          }
          case 'ToDouble': case 'ToSingle': case 'ToDecimal': {
            const v = vals[0];
            if (typeof v === 'string') return this.parseDouble(v, e);
            if (v === null) return new Dbl(0);
            if (typeof v === 'boolean') return new Dbl(v ? 1 : 0);
            if (v instanceof Chr) this.throwExc('InvalidCastException', "Invalid cast from 'Char' to 'Double'.", e);
            return new Dbl(numVal(v));
          }
          case 'ToString': return toStr(vals[0], this);
          case 'ToBoolean': {
            const v = vals[0];
            if (typeof v === 'string') return this.callBuiltinStaticVals('bool', 'Parse', [v], e, ctx);
            return isNum(v) ? numVal(v) !== 0 : !!v;
          }
          case 'ToChar': return new Chr(typeof vals[0] === 'string' ? vals[0][0] : String.fromCharCode(numVal(vals[0])));
        }
        break;
      case 'Array':
        switch (name) {
          case 'Sort': {
            const a = vals[0];
            if (!(a instanceof CsArray)) break;
            if (vals[1] instanceof Lambda) a.items.sort((x, y) => numVal(this.callLambda(vals[1], [x, y], e)));
            else a.items.sort((x, y) => this.compare(x, y));
            return undefined;
          }
          case 'Reverse': vals[0].items.reverse(); return undefined;
          case 'IndexOf': return vals[0].items.findIndex(x => this.equals(x, vals[1]));
          case 'Fill': vals[0].items.fill(vals[1]); return undefined;
          case 'Clear': { const a = vals[0]; for (let i = 0; i < a.items.length; i++) a.items[i] = this.defaultOf(a.elemType); return undefined; }
          case 'Resize': {
            const slot = vals[0];
            const old = slot.value;
            const len = num(vals[1]);
            const items = old.items.slice(0, len);
            while (items.length < len) items.push(this.defaultOf(old.elemType));
            slot.value = new CsArray(old.elemType, items);
            return undefined;
          }
          case 'Copy': {
            const [src, dst, len] = vals;
            for (let i = 0; i < num(len); i++) dst.items[i] = src.items[i];
            return undefined;
          }
          case 'Exists': return vals[0].items.some(x => this.callLambda(vals[1], [x], e));
          case 'Find': { const f = vals[0].items.find(x => this.callLambda(vals[1], [x], e)); return f === undefined ? this.defaultOf(vals[0].elemType) : f; }
          case 'Empty': return new CsArray('object', []);
        }
        break;
      case 'Enumerable':
        if (name === 'Range') { const s = num(vals[0]), c = num(vals[1]); return new CsList('int', Array.from({ length: c }, (_, i) => s + i), 'Enumerable'); }
        if (name === 'Repeat') return new CsList(typeNameOf(vals[0]), Array.from({ length: num(vals[1]) }, () => vals[0]), 'Enumerable');
        if (name === 'Empty') return new CsList('object', [], 'Enumerable');
        break;
      case 'File': return this.fileOp(name, vals, e);
      case 'Directory':
        if (name === 'Exists') return true;
        if (name === 'CreateDirectory') return null;
        if (name === 'GetFiles') return new CsArray('string', [...this.files.keys()]);
        break;
      case 'Path':
        switch (name) {
          case 'Combine': return vals.map(v => toStr(v)).join('/').replace(/\/+/g, '/');
          case 'GetExtension': { const s = toStr(vals[0]); const i = s.lastIndexOf('.'); return i >= 0 ? s.slice(i) : ''; }
          case 'GetFileName': return toStr(vals[0]).split(/[\\/]/).pop();
          case 'GetFileNameWithoutExtension': return toStr(vals[0]).split(/[\\/]/).pop().replace(/\.[^.]*$/, '');
          case 'ChangeExtension': return toStr(vals[0]).replace(/\.[^.]*$/, '') + toStr(vals[1]);
        }
        break;
      case 'Enum':
        if (name === 'GetValues' || name === 'GetNames') {
          const t = args[0];
          const info = t instanceof TypeObj ? this.enums.get(t.name) : null;
          if (info) return new CsArray(name === 'GetNames' ? 'string' : info.name, [...info.members.values()].map(m => name === 'GetNames' ? m.name : m));
        }
        if (name === 'Parse' || name === 'TryParse') break;
        break;
      case 'object':
        if (name === 'ReferenceEquals') return vals[0] === vals[1];
        if (name === 'Equals') return this.equals(vals[0], vals[1]);
        break;
      case 'Thread': if (name === 'Sleep') return undefined; break;
    }
    throw new CompileError('CS0117', `'${tname}' does not contain a definition for '${name}'`, e.line, e.col);
  }

  fileOp(name, vals, e) {
    const path = vals[0];
    const notFound = () => this.throwExc('FileNotFoundException', `Could not find file '${path}'.`, e);
    switch (name) {
      case 'WriteAllText': this.files.set(path, toStr(vals[1])); return undefined;
      case 'AppendAllText': this.files.set(path, (this.files.get(path) ?? '') + toStr(vals[1])); return undefined;
      case 'ReadAllText': if (!this.files.has(path)) notFound(); return this.files.get(path);
      case 'ReadAllLines': {
        if (!this.files.has(path)) notFound();
        const lines = this.files.get(path).split(/\r?\n/);
        if (lines.length && lines[lines.length - 1] === '') lines.pop();
        return new CsArray('string', lines);
      }
      case 'WriteAllLines': this.files.set(path, this.iterate(vals[1], e).items.map(x => toStr(x)).join('\n') + '\n'); return undefined;
      case 'AppendAllLines': this.files.set(path, (this.files.get(path) ?? '') + this.iterate(vals[1], e).items.map(x => toStr(x)).join('\n') + '\n'); return undefined;
      case 'Exists': return this.files.has(path);
      case 'Delete': this.files.delete(path); return undefined;
      case 'Copy': if (!this.files.has(path)) notFound(); this.files.set(vals[1], this.files.get(path)); return undefined;
    }
    throw new CompileError('CS0117', `'File' does not contain a definition for '${name}'`, e.line, e.col);
  }

  parseInt(s, e) {
    if (s === null) this.throwExc('ArgumentNullException', "Value cannot be null. (Parameter 's')", e);
    if (typeof s !== 'string') throw new CompileError('CS1503', `Argument 1: cannot convert from '${typeNameOf(s)}' to 'string'`, e.line, e.col);
    const t = s.trim();
    if (!/^[+-]?\d+$/.test(t)) this.throwExc('FormatException', `The input string '${s}' was not in a correct format.`, e);
    const v = parseInt(t, 10);
    if (v > 2147483647 || v < -2147483648) this.throwExc('OverflowException', 'Value was either too large or too small for an Int32.', e);
    return v;
  }
  parseDouble(s, e) {
    if (s === null) this.throwExc('ArgumentNullException', "Value cannot be null. (Parameter 's')", e);
    if (typeof s !== 'string') throw new CompileError('CS1503', `Argument 1: cannot convert from '${typeNameOf(s)}' to 'string'`, e.line, e.col);
    const t = s.trim();
    // InvariantCulture: ondalık ayırıcı '.', binlik ayırıcı ','
    if (!/^[+-]?(\d[\d,]*)?(\.\d*)?([eE][+-]?\d+)?$/.test(t) || t === '' || t === '.' || /^[+-]$/.test(t)) {
      if (/^[+-]?(∞|Infinity)$/i.test(t)) return new Dbl(t.startsWith('-') ? -Infinity : Infinity);
      if (t === 'NaN') return new Dbl(NaN);
      this.throwExc('FormatException', `The input string '${s}' was not in a correct format.`, e);
    }
    return new Dbl(parseFloat(t.replace(/,/g, '')));
  }

  stringFormat(fmt, args, e) {
    if (typeof fmt !== 'string') throw new CompileError('CS1503', 'Argument 1: cannot convert to string', e.line, e.col);
    if (args.length === 1 && args[0] instanceof CsArray && args[0].elemType === 'object') args = args[0].items;
    return fmt.replace(/\{\{|\}\}|\{(\d+)(?:,(-?\d+))?(?::([^}]*))?\}/g, (m, idx, align, f) => {
      if (m === '{{') return '{';
      if (m === '}}') return '}';
      const i = parseInt(idx, 10);
      if (i >= args.length) this.throwExc('FormatException', 'Index (zero based) must be greater than or equal to zero and less than the size of the argument list.', e);
      let s = f ? this.formatWith(args[i], f, e) : toStr(args[i], this);
      if (align) { const a = parseInt(align, 10); s = a > 0 ? s.padStart(a) : s.padEnd(-a); }
      return s;
    });
  }

  compare(a, b) {
    if (isNum(a) && isNum(b)) return numVal(a) - numVal(b);
    if (typeof a === 'string' && typeof b === 'string') return a.localeCompare(b, 'en', { sensitivity: 'variant' });
    if (a instanceof EnumVal && b instanceof EnumVal) return a.value - b.value;
    if (typeof a === 'boolean') return (a ? 1 : 0) - (b ? 1 : 0);
    if (a instanceof CsObject) {
      const m = this.findMethods(a.cls, 'CompareTo')[0];
      if (m) return numVal(this.invoke(m, a, m.owner, [b], { line: this.curLine }));
      this.throwExc('InvalidOperationException', 'Failed to compare two elements in the array.', { line: this.curLine });
    }
    if (a === null) return b === null ? 0 : -1;
    if (b === null) return 1;
    return 0;
  }

  // ================= yerleşik örnek (instance) çağrıları =================
  callBuiltinInstance(v, name, args, e, ctx, calleeNode) {
    const vals = args.map(a => (a && a.refSlot) ? a.refSlot : (a && a.named) ? a.v : a);
    const n = args.length;
    const noMethod = () => new CompileError('CS1061', `'${typeNameOf(v)}' does not contain a definition for '${name}' and no accessible extension method '${name}' accepting a first argument of type '${typeNameOf(v)}' could be found (are you missing a using directive or an assembly reference?)`, calleeNode.line, calleeNode.col);
    const lam = (i = 0) => {
      const f = vals[i];
      if (!(f instanceof Lambda || f instanceof MethodGroup)) throw new CompileError('CS1503', `Argument ${i + 1}: cannot convert to delegate (lambda bekleniyordu, ör. x => x > 0)`, e.line, e.col);
      return (...xs) => this.callDelegate(f, xs, e);
    };
    // tüm nesneler için ortak
    if (name === 'ToString') {
      if ((n === 1 || n === 2) && isNum(v) && !(v instanceof Chr) && typeof vals[0] === 'string' && vals[0] !== 'InvariantCulture') return this.formatWith(v, vals[0], e);
      if (v instanceof CsObject) return this.objToString(v);
      return toStr(v, this);
    }
    if (name === 'GetType') {
      const tn = typeNameOf(v);
      return new TypeObj(v instanceof CsObject ? v.cls.name : clrName(tn).replace('System.', ''), v instanceof CsObject ? (v.cls.builtin ? this.excFullName(v.cls) : v.cls.name) : clrName(tn));
    }
    if (name === 'Equals' && n === 1) return this.equals(v, vals[0]);
    if (name === 'GetHashCode') return typeof v === 'number' ? v : 0;
    if (name === 'CompareTo' && n === 1 && !(v instanceof CsObject)) return Math.sign(this.compare(v, vals[0]));

    if (typeof v === 'string') return this.stringMethod(v, name, vals, e, noMethod, lam);
    if (v instanceof Chr) throw noMethod();
    if (isNum(v) || typeof v === 'boolean') throw noMethod();
    if (v instanceof StrBuilder) {
      switch (name) {
        case 'Append': v.s += n ? toStr(vals[0], this) : ''; return v;
        case 'AppendLine': v.s += (n ? toStr(vals[0], this) : '') + '\n'; return v;
        case 'AppendFormat': v.s += this.stringFormat(vals[0], vals.slice(1), e); return v;
        case 'Insert': v.s = v.s.slice(0, vals[0]) + toStr(vals[1], this) + v.s.slice(vals[0]); return v;
        case 'Clear': v.s = ''; return v;
        case 'Remove': v.s = v.s.slice(0, vals[0]) + v.s.slice(vals[0] + vals[1]); return v;
        case 'Replace': v.s = v.s.split(toStr(vals[0])).join(toStr(vals[1])); return v;
      }
      throw noMethod();
    }
    if (v instanceof RandomGen) {
      switch (name) {
        case 'Next': {
          if (n === 0) return Math.floor(v.next() * 2147483647);
          if (n === 1) return Math.floor(v.next() * numVal(vals[0]));
          const lo = numVal(vals[0]), hi = numVal(vals[1]);
          if (lo > hi) this.throwExc('ArgumentOutOfRangeException', "'minValue' cannot be greater than maxValue. (Parameter 'minValue')", e);
          return lo + Math.floor(v.next() * (hi - lo));
        }
        case 'NextDouble': return new Dbl(v.next());
      }
      throw noMethod();
    }
    if (v instanceof CsDict) {
      switch (name) {
        case 'Add': if (n !== 2) throw this.argErr('', name, n, e); this.dictAdd(v, vals[0], vals[1], e); return undefined;
        case 'ContainsKey': return v.map.has(this.dictKey(vals[0]));
        case 'ContainsValue': return [...v.map.values()].some(x => this.equals(x.v, vals[0]));
        case 'Remove': { const had = v.map.delete(this.dictKey(vals[0])); if (had) v.version++; return had; }
        case 'TryGetValue': {
          const ent = v.map.get(this.dictKey(vals[0]));
          vals[1].value = ent ? ent.v : this.defaultOf(v.vType);
          return !!ent;
        }
        case 'TryAdd': { if (v.map.has(this.dictKey(vals[0]))) return false; this.dictAdd(v, vals[0], vals[1], e); return true; }
        case 'GetValueOrDefault': { const ent = v.map.get(this.dictKey(vals[0])); return ent ? ent.v : (n > 1 ? vals[1] : this.defaultOf(v.vType)); }
        case 'Clear': v.map.clear(); v.version++; return undefined;
      }
      const items = [...v.map.values()].map(x => new KVPair(x.k, x.v));
      return this.linq(new CsList('KeyValuePair', items, 'Enumerable'), items, name, vals, e, noMethod, lam);
    }
    if (v instanceof CsList) {
      const it = v.items;
      const mut = () => { v.version++; };
      if (v.kind === 'Stack') {
        switch (name) {
          case 'Push': it.push(this.coerce(vals[0], v.elemType, e)); mut(); return undefined;
          case 'Pop': if (!it.length) this.throwExc('InvalidOperationException', 'Stack empty.', e); mut(); return it.pop();
          case 'Peek': if (!it.length) this.throwExc('InvalidOperationException', 'Stack empty.', e); return it[it.length - 1];
          case 'TryPop': case 'TryPeek': if (!it.length) { vals[0].value = this.defaultOf(v.elemType); return false; } vals[0].value = name === 'TryPop' ? (mut(), it.pop()) : it[it.length - 1]; return true;
          case 'Clear': it.length = 0; mut(); return undefined;
          case 'Contains': return it.some(x => this.equals(x, vals[0]));
          case 'ToArray': return new CsArray(v.elemType, it.slice().reverse());
        }
        return this.linq(v, it.slice().reverse(), name, vals, e, noMethod, lam);
      }
      if (v.kind === 'Queue') {
        switch (name) {
          case 'Enqueue': it.push(this.coerce(vals[0], v.elemType, e)); mut(); return undefined;
          case 'Dequeue': if (!it.length) this.throwExc('InvalidOperationException', 'Queue empty.', e); mut(); return it.shift();
          case 'Peek': if (!it.length) this.throwExc('InvalidOperationException', 'Queue empty.', e); return it[0];
          case 'TryDequeue': case 'TryPeek': if (!it.length) { vals[0].value = this.defaultOf(v.elemType); return false; } vals[0].value = name === 'TryDequeue' ? (mut(), it.shift()) : it[0]; return true;
          case 'Clear': it.length = 0; mut(); return undefined;
          case 'Contains': return it.some(x => this.equals(x, vals[0]));
          case 'ToArray': return new CsArray(v.elemType, it.slice());
        }
        return this.linq(v, it, name, vals, e, noMethod, lam);
      }
      if (v.kind === 'HashSet') {
        switch (name) {
          case 'Add': { const x = this.coerce(vals[0], v.elemType, e); if (it.some(y => this.equals(x, y))) return false; it.push(x); mut(); return true; }
          case 'Remove': { const i = it.findIndex(y => this.equals(vals[0], y)); if (i < 0) return false; it.splice(i, 1); mut(); return true; }
          case 'Contains': return it.some(y => this.equals(vals[0], y));
          case 'Clear': it.length = 0; mut(); return undefined;
          case 'UnionWith': for (const x of this.iterate(vals[0], e).items) if (!it.some(y => this.equals(x, y))) it.push(x); mut(); return undefined;
          case 'IntersectWith': { const other = this.iterate(vals[0], e).items; v.items = it.filter(x => other.some(y => this.equals(x, y))); mut(); return undefined; }
          case 'ExceptWith': { const other = this.iterate(vals[0], e).items; v.items = it.filter(x => !other.some(y => this.equals(x, y))); mut(); return undefined; }
        }
        return this.linq(v, it, name, vals, e, noMethod, lam);
      }
      if (v.kind === 'List' || v.kind === 'LinkedList') {
        const idx = (i, len = it.length) => { const k = numVal(i); if (k < 0 || k >= len) this.throwExc('ArgumentOutOfRangeException', "Index was out of range. Must be non-negative and less than the size of the collection. (Parameter 'index')", e); return k; };
        switch (name) {
          case 'Add': case 'AddLast': if (n !== 1) throw this.argErr('', name, n, e); it.push(this.coerce(vals[0], v.elemType, e.args[0].e)); mut(); return undefined;
          case 'AddFirst': it.unshift(this.coerce(vals[0], v.elemType, e)); mut(); return undefined;
          case 'AddRange': for (const x of this.iterate(vals[0], e).items) it.push(this.coerce(x, v.elemType, e)); mut(); return undefined;
          case 'Insert': { const k = numVal(vals[0]); if (k < 0 || k > it.length) this.throwExc('ArgumentOutOfRangeException', "Index must be within the bounds of the List. (Parameter 'index')", e); it.splice(k, 0, this.coerce(vals[1], v.elemType, e)); mut(); return undefined; }
          case 'Remove': { const i = it.findIndex(y => this.equals(vals[0], y)); if (i < 0) return false; it.splice(i, 1); mut(); return true; }
          case 'RemoveAt': { const k = idx(vals[0]); it.splice(k, 1); mut(); return undefined; }
          case 'RemoveAll': { const f = lam(); const before = it.length; v.items = it.filter(x => !f(x)); mut(); return before - v.items.length; }
          case 'RemoveRange': it.splice(numVal(vals[0]), numVal(vals[1])); mut(); return undefined;
          case 'Clear': it.length = 0; mut(); return undefined;
          case 'Contains': return it.some(y => this.equals(vals[0], y));
          case 'IndexOf': return it.findIndex(y => this.equals(vals[0], y));
          case 'LastIndexOf': { for (let i = it.length - 1; i >= 0; i--) if (this.equals(vals[0], it[i])) return i; return -1; }
          case 'Sort': {
            if (n === 1) { const f = lam(); it.sort((a, b) => numVal(f(a, b))); }
            else it.sort((a, b) => this.compare(a, b));
            mut(); return undefined;
          }
          case 'Reverse': it.reverse(); mut(); return undefined;
          case 'ToArray': return new CsArray(v.elemType, it.slice());
          case 'Find': { const f = lam(); const r = it.find(x => f(x)); return r === undefined ? this.defaultOf(v.elemType) : r; }
          case 'FindAll': { const f = lam(); return new CsList(v.elemType, it.filter(x => f(x))); }
          case 'FindIndex': { const f = lam(); return it.findIndex(x => f(x)); }
          case 'FindLast': { const f = lam(); for (let i = it.length - 1; i >= 0; i--) if (f(it[i])) return it[i]; return this.defaultOf(v.elemType); }
          case 'Exists': { const f = lam(); return it.some(x => f(x)); }
          case 'TrueForAll': { const f = lam(); return it.every(x => f(x)); }
          case 'ForEach': { const f = lam(); for (const x of it.slice()) f(x); return undefined; }
          case 'GetRange': { const s = numVal(vals[0]), c = numVal(vals[1]); if (s < 0 || c < 0 || s + c > it.length) this.throwExc('ArgumentException', 'Offset and length were out of bounds for the array or count is greater than the number of elements from index to the end of the source collection.', e); return new CsList(v.elemType, it.slice(s, s + c)); }
          case 'ConvertAll': { const f = lam(); const r = it.map(x => f(x)); return new CsList(r.length ? typeNameOf(r[0]) : 'object', r); }
          case 'BinarySearch': return it.findIndex(y => this.equals(vals[0], y));
        }
        return this.linq(v, it, name, vals, e, noMethod, lam);
      }
      return this.linq(v, it, name, vals, e, noMethod, lam);
    }
    if (v instanceof CsArray) {
      if (name === 'GetLength') return v.dims[numVal(vals[0])] ?? this.throwExc('IndexOutOfRangeException', 'Index was outside the bounds of the array.', e);
      if (name === 'Clone') return new CsArray(v.elemType, v.items.slice(), v.dims.slice());
      if (name === 'CopyTo') { const dst = vals[0], off = numVal(vals[1] ?? 0); v.items.forEach((x, i) => { dst.items[off + i] = x; }); return undefined; }
      return this.linq(v, v.items, name, vals, e, noMethod, lam);
    }
    if (v instanceof CsObject && this.isExceptionClass(v.cls)) {
      if (name === 'ToString') return this.objToString(v);
    }
    if (v instanceof Lambda && name === 'Invoke') return this.callLambda(v, vals, e);
    throw noMethod();
  }

  stringMethod(s, name, vals, e, noMethod, lam) {
    const n = vals.length;
    const str = (i) => { const x = vals[i]; if (x instanceof Chr) return x.c; if (typeof x !== 'string') throw new CompileError('CS1503', `Argument ${i + 1}: cannot convert from '${typeNameOf(x)}' to 'string'`, e.line, e.col); return x; };
    const ic = vals.some(v => v === 'OrdinalIgnoreCase');
    const norm = x => ic ? x.toLowerCase() : x;
    const aoor = (p) => this.throwExc('ArgumentOutOfRangeException', `Index and length must refer to a location within the string. (Parameter '${p}')`, e);
    switch (name) {
      case 'ToUpper': case 'ToUpperInvariant': return s.toUpperCase();
      case 'ToLower': case 'ToLowerInvariant': return s.toLowerCase();
      case 'Trim': return n ? s.replace(new RegExp(`^[${escapeRe(vals.map(v => v.c ?? v).join(''))}]+|[${escapeRe(vals.map(v => v.c ?? v).join(''))}]+$`, 'g'), '') : s.trim();
      case 'TrimStart': return n ? s.replace(new RegExp(`^[${escapeRe(vals.map(v => v.c ?? v).join(''))}]+`), '') : s.replace(/^\s+/, '');
      case 'TrimEnd': return n ? s.replace(new RegExp(`[${escapeRe(vals.map(v => v.c ?? v).join(''))}]+$`), '') : s.replace(/\s+$/, '');
      case 'Contains': return norm(s).includes(norm(str(0)));
      case 'StartsWith': return norm(s).startsWith(norm(str(0)));
      case 'EndsWith': return norm(s).endsWith(norm(str(0)));
      case 'IndexOf': return norm(s).indexOf(norm(str(0)), n > 1 && typeof vals[1] === 'number' ? vals[1] : 0);
      case 'LastIndexOf': return norm(s).lastIndexOf(norm(str(0)));
      case 'IndexOfAny': return [...s].findIndex(c => vals[0].items.some(x => x.c === c));
      case 'Substring': {
        const st = numVal(vals[0]);
        if (st < 0 || st > s.length) aoor('startIndex');
        if (n === 1) return s.slice(st);
        const len = numVal(vals[1]);
        if (len < 0 || st + len > s.length) aoor('length');
        return s.substr(st, len);
      }
      case 'Replace': return s.split(str(0)).join(vals[1] === null ? '' : str(1));
      case 'Split': {
        let seps = [];
        let opts = 'None';
        let count = Infinity;
        for (const v of vals) {
          if (v instanceof Chr) seps.push(v.c);
          else if (v === 'RemoveEmptyEntries' || v === 'None' || v === 'TrimEntries') opts = v;
          else if (typeof v === 'string') seps.push(v);
          else if (v instanceof CsArray) seps.push(...v.items.map(x => x instanceof Chr ? x.c : x));
          else if (typeof v === 'number') count = v;
        }
        let parts;
        if (!seps.length) parts = s.split(/\s/);
        else parts = s.split(new RegExp(seps.map(escapeRe).join('|')));
        if (opts === 'TrimEntries') parts = parts.map(p => p.trim());
        if (opts === 'RemoveEmptyEntries') parts = parts.filter(p => p !== '');
        if (count < parts.length) parts = [...parts.slice(0, count - 1), parts.slice(count - 1).join(seps[0] || ' ')];
        return new CsArray('string', parts);
      }
      case 'Insert': return s.slice(0, vals[0]) + str(1) + s.slice(vals[0]);
      case 'Remove': { const st = numVal(vals[0]); if (st < 0 || st > s.length) aoor('startIndex'); return n === 1 ? s.slice(0, st) : s.slice(0, st) + s.slice(st + numVal(vals[1])); }
      case 'PadLeft': return s.padStart(numVal(vals[0]), n > 1 ? vals[1].c : ' ');
      case 'PadRight': return s.padEnd(numVal(vals[0]), n > 1 ? vals[1].c : ' ');
      case 'ToCharArray': return new CsArray('char', [...s].map(c => new Chr(c)));
      case 'Equals': return ic ? s.toLowerCase() === String(vals[0]).toLowerCase() : s === vals[0];
      case 'CompareTo': return Math.sign(this.compare(s, vals[0]));
      case 'Normalize': return s;
    }
    return this.linq(new CsList('char', [...s].map(c => new Chr(c)), 'Enumerable'), [...s].map(c => new Chr(c)), name, vals, e, noMethod, lam);
  }

  /** LINQ (System.Linq) yöntemleri — tüm koleksiyonlar için. */
  linq(src, items, name, vals, e, noMethod, lam) {
    const n = vals.length;
    const et = src.elemType;
    const seq = (arr, t) => new CsList(t ?? (arr.length ? typeNameOf(arr[0]) : et), arr, 'Enumerable');
    const empty = () => this.throwExc('InvalidOperationException', 'Sequence contains no elements', e);
    const sumLike = (arr) => { const hasD = arr.some(x => x instanceof Dbl); const s = arr.reduce((a, b) => a + numVal(b), 0); return hasD ? new Dbl(s) : s; };
    switch (name) {
      case 'Where': { const f = lam(); return seq(items.filter((x, i) => f(x, i)), et); }
      case 'Select': { const f = lam(); return seq(items.map((x, i) => f(x, i))); }
      case 'SelectMany': { const f = lam(); return seq(items.flatMap(x => this.iterate(f(x), e).items)); }
      case 'OrderBy': case 'OrderByDescending': {
        const f = n ? lam() : (x => x);
        const keyed = items.map((x, i) => ({ x, k: f(x), i }));
        keyed.sort((a, b) => (this.compare(a.k, b.k) || (a.i - b.i)) * (name === 'OrderBy' ? 1 : -1) || a.i - b.i);
        const r = seq(keyed.map(k => k.x), et); r.orderKeys = [{ f, desc: name !== 'OrderBy' }]; return r;
      }
      case 'ThenBy': case 'ThenByDescending': {
        const keys = [...(src.orderKeys || []), { f: lam(), desc: name === 'ThenByDescending' }];
        const arr = items.map((x, i) => ({ x, i }));
        arr.sort((a, b) => { for (const k of keys) { const c = this.compare(k.f(a.x), k.f(b.x)) * (k.desc ? -1 : 1); if (c) return c; } return a.i - b.i; });
        const r = seq(arr.map(a => a.x), et); r.orderKeys = keys; return r;
      }
      case 'First': case 'FirstOrDefault': case 'Last': case 'LastOrDefault': case 'Single': case 'SingleOrDefault': {
        const f = n ? lam() : null;
        const filtered = f ? items.filter(x => f(x)) : items;
        if (!filtered.length) { if (name.endsWith('OrDefault')) return this.defaultOf(et); this.throwExc('InvalidOperationException', f ? 'Sequence contains no matching element' : 'Sequence contains no elements', e); }
        if (name.startsWith('Single') && filtered.length > 1) this.throwExc('InvalidOperationException', 'Sequence contains more than one element', e);
        return name.startsWith('Last') ? filtered[filtered.length - 1] : filtered[0];
      }
      case 'ElementAt': { const i = numVal(vals[0]); if (i < 0 || i >= items.length) this.throwExc('ArgumentOutOfRangeException', "Index was out of range. (Parameter 'index')", e); return items[i]; }
      case 'Any': { if (!n) return items.length > 0; const f = lam(); return items.some(x => f(x)); }
      case 'All': { const f = lam(); return items.every(x => f(x)); }
      case 'Count': case 'LongCount': { if (!n) return items.length; const f = lam(); return items.filter(x => f(x)).length; }
      case 'Contains': return items.some(x => this.equals(x, vals[0]));
      case 'Sum': { const arr = n ? items.map(lam()) : items; return arr.length ? sumLike(arr) : (et === 'double' ? new Dbl(0) : 0); }
      case 'Average': { const arr = n ? items.map(lam()) : items; if (!arr.length) empty(); return new Dbl(arr.reduce((a, b) => a + numVal(b), 0) / arr.length); }
      case 'Max': case 'Min': {
        const arr = n ? items.map(lam()) : items;
        if (!arr.length) empty();
        let best = arr[0];
        for (const x of arr) { const c = this.compare(x, best); if (name === 'Max' ? c > 0 : c < 0) best = x; }
        return best;
      }
      case 'MaxBy': case 'MinBy': {
        const f = lam(); if (!items.length) empty();
        let best = items[0], bk = f(best);
        for (const x of items) { const k = f(x); const c = this.compare(k, bk); if (name === 'MaxBy' ? c > 0 : c < 0) { best = x; bk = k; } }
        return best;
      }
      case 'Aggregate': {
        if (n === 1) { const f = lam(0); if (!items.length) empty(); return items.slice(1).reduce((a, b) => f(a, b), items[0]); }
        const f = lam(1); return items.reduce((a, b) => f(a, b), vals[0]);
      }
      case 'ToList': return new CsList(et === 'KeyValuePair' && items[0] ? 'KeyValuePair' : (src.kind === 'Enumerable' && items.length ? typeNameOf(items[0]) : et), items.slice());
      case 'ToArray': return new CsArray(src.kind === 'Enumerable' && items.length ? typeNameOf(items[0]) : et, items.slice());
      case 'ToHashSet': { const r = new CsList(et, []); r.kind = 'HashSet'; for (const x of items) if (!r.items.some(y => this.equals(x, y))) r.items.push(x); return r; }
      case 'ToDictionary': {
        const kf = lam(0); const vf = n > 1 ? lam(1) : (x => x);
        const sample = items[0];
        const d = new CsDict(sample !== undefined ? typeNameOf(kf(sample)) : 'object', sample !== undefined ? typeNameOf(vf(sample)) : 'object');
        for (const x of items) this.dictAdd(d, kf(x), vf(x), e);
        return d;
      }
      case 'Distinct': { const r = []; for (const x of items) if (!r.some(y => this.equals(x, y))) r.push(x); return seq(r, et); }
      case 'Take': return seq(items.slice(0, Math.max(0, numVal(vals[0]))), et);
      case 'Skip': return seq(items.slice(Math.max(0, numVal(vals[0]))), et);
      case 'TakeWhile': { const f = lam(); const r = []; for (const x of items) { if (!f(x)) break; r.push(x); } return seq(r, et); }
      case 'SkipWhile': { const f = lam(); let i = 0; while (i < items.length && f(items[i])) i++; return seq(items.slice(i), et); }
      case 'Reverse': return seq(items.slice().reverse(), et);
      case 'Concat': return seq([...items, ...this.iterate(vals[0], e).items], et);
      case 'Union': { const r = []; for (const x of [...items, ...this.iterate(vals[0], e).items]) if (!r.some(y => this.equals(x, y))) r.push(x); return seq(r, et); }
      case 'Intersect': { const o = this.iterate(vals[0], e).items; const r = []; for (const x of items) if (o.some(y => this.equals(x, y)) && !r.some(y => this.equals(x, y))) r.push(x); return seq(r, et); }
      case 'Except': { const o = this.iterate(vals[0], e).items; return seq(items.filter(x => !o.some(y => this.equals(x, y))), et); }
      case 'SequenceEqual': { const o = this.iterate(vals[0], e).items; return o.length === items.length && items.every((x, i) => this.equals(x, o[i])); }
      case 'Zip': { const o = this.iterate(vals[0], e).items; const f = lam(1); const len = Math.min(items.length, o.length); return seq(Array.from({ length: len }, (_, i) => f(items[i], o[i]))); }
      case 'GroupBy': {
        const f = lam(); const groups = [];
        for (const x of items) {
          const k = f(x);
          let g = groups.find(g => this.equals(g.key, k));
          if (!g) { g = { key: k, items: [] }; groups.push(g); }
          g.items.push(x);
        }
        return seq(groups.map(g => { const l = new CsList(et, g.items, 'Grouping'); l.groupKey = g.key; return l; }), 'IGrouping');
      }
      case 'Cast': case 'OfType': return seq(items, et);
      case 'DefaultIfEmpty': return items.length ? seq(items, et) : seq([this.defaultOf(et)], et);
      case 'AsEnumerable': return seq(items, et);
    }
    if (src.kind === 'Grouping' && name === 'Key') return src.groupKey;
    throw noMethod();
  }
}

function typeToStr(t) {
  let s = t.name;
  if (t.args && t.args.length) s += '<' + t.args.map(typeToStr).join(', ') + '>';
  for (let i = 0; i < (t.rank || 0); i++) s += '[]';
  return s;
}

function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\\-]/g, '\\$&'); }

/** C# Math.Round: varsayılan MidpointRounding.ToEven (banker yuvarlaması). */
export function roundHalf(x, digits, mode) {
  // .NET gibi: değeri 10^digits ile ölçekle, tam yarımda moda göre yuvarla, geri böl.
  const f = Math.pow(10, digits);
  const y = x * f;
  const fl = Math.floor(y);
  let r;
  if (y - fl === 0.5) {
    if (mode === 'AwayFromZero') r = y >= 0 ? fl + 1 : fl;
    else r = fl % 2 === 0 ? fl : fl + 1;
  } else r = Math.round(y);
  return r / f;
}
