// C# alt kümesi için özyinelemeli iniş (recursive descent) ayrıştırıcı.
// Token dizisinden soyut sözdizim ağacı (AST) üretir.

import { tokenize } from './lexer.js';
import { CompileError } from './errors.js';

const RESERVED = new Set(['if', 'else', 'while', 'for', 'foreach', 'do', 'return', 'break', 'continue', 'new', 'class',
  'true', 'false', 'null', 'try', 'catch', 'finally', 'throw', 'switch', 'case', 'default', 'using', 'namespace',
  'static', 'public', 'private', 'protected', 'internal', 'const', 'readonly', 'void', 'this', 'base', 'in', 'is', 'as',
  'out', 'ref', 'virtual', 'override', 'abstract', 'sealed', 'interface', 'struct', 'enum', 'params', 'typeof',
  'int', 'double', 'float', 'decimal', 'long', 'short', 'byte', 'string', 'bool', 'char', 'object', 'uint', 'ulong', 'sbyte', 'ushort']);

export const BUILTIN_TYPES = new Set(['int', 'double', 'float', 'decimal', 'long', 'short', 'byte', 'string', 'bool', 'char', 'object', 'var', 'uint', 'ulong', 'sbyte', 'ushort', 'dynamic']);
const MODIFIERS = new Set(['public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'virtual', 'override', 'abstract', 'sealed', 'async', 'partial', 'unsafe', 'extern', 'volatile', 'required']);
const ASSIGN_OPS = new Set(['=', '+=', '-=', '*=', '/=', '%=', '??=']);
const TYPE_DECL = new Set(['class', 'interface', 'struct', 'enum', 'record']);

export function typeToString(t) {
  if (!t) return 'var';
  let s = t.name;
  if (t.args && t.args.length) s += '<' + t.args.map(typeToString).join(', ') + '>';
  if (t.nullable) s += '?';
  for (let i = 0; i < (t.rank || 0); i++) s += '[]';
  return s;
}

export class Parser {
  constructor(src, lineOffset = 0, colOffset = 0) {
    this.toks = tokenize(src);
    if (lineOffset || colOffset) {
      for (const t of this.toks) {
        if (t.line === 1) t.col += colOffset;
        t.line += lineOffset;
      }
    }
    this.pos = 0;
  }

  // ---------- yardımcılar ----------
  peek(o = 0) { return this.toks[Math.min(this.pos + o, this.toks.length - 1)]; }
  next() { return this.toks[this.pos++]; }
  prev() { return this.toks[Math.max(0, this.pos - 1)]; }
  isOp(v, o = 0) { const t = this.peek(o); return t.t === 'op' && t.v === v; }
  isId(v, o = 0) { const t = this.peek(o); return t.t === 'id' && (v === undefined || t.v === v); }
  eatOp(v) { if (this.isOp(v)) { this.pos++; return true; } return false; }
  eatId(v) { if (this.isId(v)) { this.pos++; return true; } return false; }

  errAt(tok, code, msg) { return new CompileError(code, msg, tok.line, tok.col); }
  /** Eksik token hatalarını önceki token'ın sonunda raporla (gerçek derleyici gibi). */
  errAfterPrev(code, msg) {
    const p = this.pos > 0 ? this.prev() : this.peek();
    const len = p.t === 'str' ? p.v.length + 2 : String(p.v).length;
    return new CompileError(code, msg, p.line, p.col + (this.pos > 0 ? len : 0));
  }

  expectOp(v) {
    if (this.isOp(v)) return this.next();
    const codes = { ';': 'CS1002', ')': 'CS1026', '}': 'CS1513', '{': 'CS1514', ']': 'CS1003', '(': 'CS1003', ',': 'CS1003', ':': 'CS1003', '=>': 'CS1003' };
    const code = codes[v] || 'CS1003';
    const msg = code === 'CS1003' ? `Syntax error, '${v}' expected` : `${v} expected`;
    if (v === ';' || v === ')' || v === ']') throw this.errAfterPrev(code, msg);
    throw this.errAt(this.peek(), code, msg);
  }
  expectId(what) {
    const t = this.peek();
    if (t.t === 'id' && !RESERVED.has(t.v)) return this.next().v;
    if (t.t === 'id' && RESERVED.has(t.v)) throw this.errAt(t, 'CS1041', `Identifier expected; '${t.v}' is a keyword`);
    throw this.errAt(t, 'CS1001', 'Identifier expected');
  }
  loc(tok) { return { line: tok.line, col: tok.col }; }

  // ---------- program ----------
  parseProgram() {
    const prog = { k: 'Program', usings: [], types: [], stmts: [] };
    while (this.peek().t !== 'eof') {
      if (this.isId('using') && !this.isOp('(', 1) && !this.isId('var', 1)) {
        this.next();
        let name = '';
        while (!this.isOp(';') && this.peek().t !== 'eof') name += this.next().v;
        this.expectOp(';');
        prog.usings.push(name);
        continue;
      }
      if (this.isId('namespace')) {
        this.next();
        let name = this.expectId();
        while (this.eatOp('.')) name += '.' + this.expectId();
        if (this.eatOp(';')) continue; // file-scoped namespace
        this.expectOp('{');
        while (!this.isOp('}')) {
          if (this.peek().t === 'eof') throw this.errAt(this.peek(), 'CS1513', '} expected');
          if (this.isId('using')) { this.next(); while (!this.isOp(';')) this.next(); this.next(); continue; }
          const mods = this.parseModifiers();
          if (!this.isTypeDeclStart()) throw this.errAt(this.peek(), 'CS0116', 'A namespace cannot directly contain members such as fields, methods or statements');
          prog.types.push(...this.parseTypeDecl(mods));
        }
        this.expectOp('}');
        continue;
      }
      const save = this.pos;
      const mods = this.parseModifiers();
      if (this.isTypeDeclStart()) { prog.types.push(...this.parseTypeDecl(mods)); continue; }
      this.pos = save;
      prog.stmts.push(this.parseStatement());
    }
    return prog;
  }

  isTypeDeclStart() { return this.peek().t === 'id' && TYPE_DECL.has(this.peek().v) && this.peek(1).t === 'id'; }

  parseModifiers() {
    const mods = [];
    while (this.peek().t === 'id' && MODIFIERS.has(this.peek().v)) {
      // "static" bir yerel fonksiyon da olabilir; sadece modifier olarak topla
      mods.push(this.next().v);
    }
    // [Attribute] satırlarını atla
    return mods;
  }

  parseTypeDecl(mods) {
    const kwTok = this.next();
    const kind = kwTok.v === 'record' ? 'class' : kwTok.v;
    const name = this.expectId();
    const decl = { k: 'Class', kind, name, mods, base: null, interfaces: [], fields: [], methods: [], ctors: [], props: [], line: kwTok.line, col: kwTok.col, generics: [] };
    const nested = [];
    if (this.eatOp('<')) { do { decl.generics.push(this.expectId()); } while (this.eatOp(',')); this.expectOp('>'); }
    // record Point(int X, int Y);
    if (kwTok.v === 'record' && this.isOp('(')) {
      const params = this.parseParams();
      for (const p of params) decl.props.push({ name: p.name, type: p.type, auto: true, hasSet: false, static: false, init: null });
      decl.ctors.push({ params, body: { k: 'Block', stmts: params.map(p => ({ k: 'ExprStmt', e: { k: 'Assign', op: '=', target: { k: 'Member', obj: { k: 'This' }, name: p.name }, e: { k: 'Ident', name: p.name } } })) }, init: null, line: kwTok.line });
      decl.isRecord = true;
      if (this.eatOp(';')) return [decl];
    }
    if (kind === 'enum') {
      decl.k = 'Enum';
      decl.members = [];
      if (this.eatOp(':')) this.parseType();
      this.expectOp('{');
      let val = 0;
      while (!this.isOp('}')) {
        const m = this.expectId();
        if (this.eatOp('=')) { const e = this.parseExpr(); val = e.k === 'Lit' ? e.v : (e.k === 'Unary' && e.e.k === 'Lit' ? -e.e.v : val); }
        decl.members.push({ name: m, value: val++ });
        if (!this.eatOp(',')) break;
      }
      this.expectOp('}');
      return [decl];
    }
    if (this.eatOp(':')) {
      const types = [];
      do { types.push(typeToString(this.parseType())); } while (this.eatOp(','));
      // İlk tür bir sınıfsa base; 'I' ile başlayan büyük harfli isimler interface sayılır (yorumlama zamanında düzeltilir)
      decl.baseList = types;
    }
    while (this.isId('where')) { while (!this.isOp('{')) this.next(); }
    this.expectOp('{');
    while (!this.isOp('}')) {
      if (this.peek().t === 'eof') throw this.errAt(this.peek(), 'CS1513', '} expected');
      if (this.isOp('[')) { while (!this.isOp(']')) this.next(); this.next(); continue; } // attribute
      const mtok = this.peek();
      const mmods = this.parseModifiers();
      if (this.isTypeDeclStart()) { nested.push(...this.parseTypeDecl(mmods)); continue; }
      const isStatic = mmods.includes('static') || mmods.includes('const');
      // constructor
      if (this.isId(name) && this.isOp('(', 1)) {
        this.next();
        const params = this.parseParams();
        let init = null;
        if (this.eatOp(':')) {
          const which = this.next().v; // base | this
          init = { which, args: this.parseArgs() };
        }
        let body;
        if (this.eatOp('=>')) { body = { k: 'Block', stmts: [{ k: 'ExprStmt', e: this.parseExpr() }] }; this.expectOp(';'); }
        else body = this.parseBlock();
        decl.ctors.push({ params, body, init, static: isStatic, line: mtok.line });
        continue;
      }
      let retType;
      if (this.isId('void')) { this.next(); retType = { name: 'void', args: [], rank: 0 }; }
      else retType = this.parseType();
      if (!retType) throw this.errAt(this.peek(), 'CS1519', `Invalid token '${this.peek().v}' in class, record, struct, or interface member declaration`);
      const nameTok = this.peek();
      const mname = this.expectId();
      if (this.isOp('(') || this.isOp('<')) {
        if (this.eatOp('<')) { while (!this.eatOp('>')) this.next(); }
        const params = this.parseParams();
        let body = null;
        if (this.eatOp('=>')) { const e = this.parseExpr(); this.expectOp(';'); body = { k: 'Block', stmts: [retType.name === 'void' ? { k: 'ExprStmt', e } : { k: 'Return', e, line: nameTok.line }] }; }
        else if (this.eatOp(';')) body = null; // abstract / interface
        else body = this.parseBlock();
        decl.methods.push({ k: 'Method', name: mname, params, retType: typeToString(retType), body, static: isStatic, mods: mmods, line: nameTok.line, col: nameTok.col });
        continue;
      }
      if (this.isOp('{') || this.isOp('=>')) {
        const prop = { name: mname, type: typeToString(retType), static: isStatic, auto: false, getter: null, setter: null, hasSet: false, init: null, mods: mmods, line: nameTok.line };
        if (this.eatOp('=>')) { prop.getter = { k: 'Block', stmts: [{ k: 'Return', e: this.parseExpr(), line: nameTok.line }] }; this.expectOp(';'); decl.props.push(prop); continue; }
        this.expectOp('{');
        let auto = true;
        while (!this.isOp('}')) {
          const amods = this.parseModifiers();
          const acc = this.next().v; // get | set | init
          if (acc !== 'get') prop.setMods = amods;
          let body = null;
          if (this.eatOp(';')) body = null;
          else if (this.eatOp('=>')) {
            const e = this.parseExpr(); this.expectOp(';');
            body = { k: 'Block', stmts: [acc === 'get' ? { k: 'Return', e, line: nameTok.line } : { k: 'ExprStmt', e }] };
          } else body = this.parseBlock();
          if (body) auto = false;
          if (acc === 'get') prop.getter = body;
          else { prop.setter = body; prop.hasSet = true; }
        }
        this.expectOp('}');
        prop.auto = auto;
        if (this.eatOp('=')) { prop.init = this.parseVarInit(); this.expectOp(';'); }
        decl.props.push(prop);
        continue;
      }
      // alan (field)
      let fname = mname, ftok = nameTok;
      for (;;) {
        let init = null;
        if (this.eatOp('=')) init = this.parseVarInit();
        decl.fields.push({ name: fname, type: typeToString(retType), init, static: isStatic, isConst: mmods.includes('const'), readonly: mmods.includes('readonly'), mods: mmods, line: ftok.line });
        if (!this.eatOp(',')) break;
        ftok = this.peek();
        fname = this.expectId();
      }
      this.expectOp(';');
    }
    this.expectOp('}');
    this.eatOp(';');
    return [decl, ...nested];
  }

  parseParams() {
    this.expectOp('(');
    const params = [];
    if (!this.isOp(')')) {
      do {
        let mod = null;
        if (this.isId('out') || this.isId('ref') || this.isId('params') || this.isId('in') || this.isId('this')) mod = this.next().v;
        const type = this.parseType();
        if (!type) throw this.errAt(this.peek(), 'CS1001', 'Identifier expected');
        const name = this.expectId();
        let def = null;
        if (this.eatOp('=')) def = this.parseExpr();
        params.push({ name, type: typeToString(type), mod, def });
      } while (this.eatOp(','));
    }
    this.expectOp(')');
    return params;
  }

  // ---------- türler ----------
  /** Tür ayrıştırmayı dener; başarısız olursa null döner ve konumu geri alır. */
  tryParseType() {
    const save = this.pos;
    const t = this.parseTypeInner();
    if (!t) { this.pos = save; return null; }
    return t;
  }
  parseType() { return this.tryParseType(); }
  parseTypeInner(noArray = false) {
    const tok = this.peek();
    if (tok.t !== 'id') return null;
    if (RESERVED.has(tok.v) && !BUILTIN_TYPES.has(tok.v)) return null;
    this.next();
    let name = tok.v;
    while (this.isOp('.') && this.peek(1).t === 'id') { this.next(); name += '.' + this.next().v; }
    const t = { name, args: [], rank: 0, nullable: false };
    if (this.isOp('<')) {
      const save = this.pos;
      this.next();
      const args = [];
      let ok = true;
      for (;;) {
        const a = this.parseTypeInner();
        if (!a) { ok = false; break; }
        args.push(a);
        if (this.eatOp(',')) continue;
        if (this.eatOp('>')) break;
        if (this.isOp('>>') ) { ok = false; break; }
        ok = false; break;
      }
      if (ok) t.args = args; else { this.pos = save; return name.includes('.') || BUILTIN_TYPES.has(name) ? t : (this.pos = save, t); }
    }
    if (this.isOp('?') && (this.peek(1).t === 'id' || this.isOp('[', 1) || this.isOp('>', 1) || this.isOp(',', 1) || this.isOp(')', 1))) { this.next(); t.nullable = true; }
    if (!noArray) {
      while (this.isOp('[') && (this.isOp(']', 1) || this.isOp(',', 1))) {
        this.next();
        while (this.eatOp(',')) { /* çok boyutlu dizi rank'i */ t.multi = true; }
        this.expectOp(']');
        t.rank++;
      }
    }
    return t;
  }

  /** Şu anki konumda bir değişken bildirimi mi var? */
  looksLikeDeclaration() {
    const save = this.pos;
    const first = this.peek();
    const t = this.tryParseType();
    let result = null;
    if (t) {
      const a = this.peek(), b = this.peek(1);
      if (a.t === 'id' && !RESERVED.has(a.v)) {
        if (b.t === 'op' && (b.v === '=' || b.v === ';' || b.v === ',')) result = 'var';
        else if (b.t === 'op' && (b.v === '(' || b.v === '<')) result = 'func';
        else if (BUILTIN_TYPES.has(first.v) || t.args.length || t.rank) result = 'var'; // ';' eksikse bile bildirim say
      } else if (a.t === 'id' && RESERVED.has(a.v) && BUILTIN_TYPES.has(first.v) && !BUILTIN_TYPES.has(a.v)) {
        result = 'badname';
      }
    }
    this.pos = save;
    return result;
  }

  // ---------- deyimler ----------
  parseBlock() {
    const tok = this.peek();
    this.expectOp('{');
    const stmts = [];
    while (!this.isOp('}')) {
      if (this.peek().t === 'eof') throw this.errAt(this.peek(), 'CS1513', '} expected');
      stmts.push(this.parseStatement());
    }
    this.next();
    return { k: 'Block', stmts, line: tok.line };
  }

  parseEmbedded() {
    // if/while gövdesi: blok ya da tek deyim
    const s = this.parseStatement();
    if (s.k === 'VarDecl') throw new CompileError('CS1023', 'Embedded statement cannot be a declaration or labeled statement', s.line, s.col);
    return s;
  }

  parseStatement() {
    const tok = this.peek();
    const L = { line: tok.line, col: tok.col };
    if (tok.t === 'op') {
      if (tok.v === '{') return this.parseBlock();
      if (tok.v === ';') { this.next(); return { k: 'Empty', ...L }; }
    }
    if (tok.t === 'id') {
      switch (tok.v) {
        case 'if': {
          this.next(); this.expectOp('(');
          const c = this.parseExpr(); this.expectOp(')');
          const t = this.parseEmbedded();
          let f = null;
          if (this.eatId('else')) f = this.parseEmbedded();
          return { k: 'If', c, t, f, ...L };
        }
        case 'while': {
          this.next(); this.expectOp('(');
          const c = this.parseExpr(); this.expectOp(')');
          return { k: 'While', c, b: this.parseEmbedded(), ...L };
        }
        case 'do': {
          this.next();
          const b = this.parseEmbedded();
          if (!this.eatId('while')) throw this.errAt(this.peek(), 'CS1003', "Syntax error, 'while' expected");
          this.expectOp('('); const c = this.parseExpr(); this.expectOp(')'); this.expectOp(';');
          return { k: 'DoWhile', c, b, ...L };
        }
        case 'for': {
          this.next(); this.expectOp('(');
          let init = [];
          if (!this.isOp(';')) {
            if (this.looksLikeDeclaration() === 'var') init = [this.parseVarDecl(false)];
            else { do { init.push({ k: 'ExprStmt', e: this.parseExpr() }); } while (this.eatOp(',')); }
          }
          this.expectOp(';');
          const c = this.isOp(';') ? null : this.parseExpr();
          this.expectOp(';');
          const upd = [];
          if (!this.isOp(')')) { do { upd.push(this.parseExpr()); } while (this.eatOp(',')); }
          this.expectOp(')');
          return { k: 'For', init, c, upd, b: this.parseEmbedded(), ...L };
        }
        case 'foreach': {
          this.next(); this.expectOp('(');
          const type = this.parseType();
          if (!type) throw this.errAt(this.peek(), 'CS1001', 'Type and identifier are both required in a foreach statement');
          const name = this.expectId();
          if (!this.eatId('in')) throw this.errAt(this.peek(), 'CS1515', "'in' expected");
          const coll = this.parseExpr(); this.expectOp(')');
          return { k: 'Foreach', type: typeToString(type), name, coll, b: this.parseEmbedded(), ...L };
        }
        case 'return': {
          this.next();
          const e = this.isOp(';') ? null : this.parseExpr();
          this.expectOp(';');
          return { k: 'Return', e, ...L };
        }
        case 'break': this.next(); this.expectOp(';'); return { k: 'Break', ...L };
        case 'continue': this.next(); this.expectOp(';'); return { k: 'Continue', ...L };
        case 'throw': {
          this.next();
          const e = this.isOp(';') ? null : this.parseExpr();
          this.expectOp(';');
          return { k: 'Throw', e, ...L };
        }
        case 'try': {
          this.next();
          const b = this.parseBlock();
          const catches = [];
          while (this.isId('catch')) {
            this.next();
            let type = 'Exception', name = null, when = null;
            if (this.eatOp('(')) {
              type = typeToString(this.parseType());
              if (this.peek().t === 'id' && !this.isId('when')) name = this.expectId();
              this.expectOp(')');
            }
            if (this.eatId('when')) { this.expectOp('('); when = this.parseExpr(); this.expectOp(')'); }
            catches.push({ type, name, when, b: this.parseBlock() });
          }
          let fin = null;
          if (this.eatId('finally')) fin = this.parseBlock();
          if (!catches.length && !fin) throw this.errAt(this.peek(), 'CS1524', 'Expected catch or finally');
          return { k: 'Try', b, catches, fin, ...L };
        }
        case 'switch': {
          this.next(); this.expectOp('(');
          const e = this.parseExpr(); this.expectOp(')');
          this.expectOp('{');
          const sections = [];
          while (!this.isOp('}')) {
            const labels = [];
            while (this.isId('case') || this.isId('default')) {
              if (this.eatId('default')) { labels.push(null); this.expectOp(':'); continue; }
              this.next();
              const ce = this.parseTernary();
              let guard = null;
              if (this.eatId('when')) guard = this.parseExpr();
              labels.push({ e: ce, guard });
              this.expectOp(':');
            }
            if (!labels.length) throw this.errAt(this.peek(), 'CS1513', "'case' or 'default' expected");
            const stmts = [];
            while (!this.isId('case') && !this.isId('default') && !this.isOp('}')) stmts.push(this.parseStatement());
            sections.push({ labels, stmts });
          }
          this.expectOp('}');
          return { k: 'Switch', e, sections, ...L };
        }
        case 'const': {
          this.next();
          const d = this.parseVarDecl(true);
          d.isConst = true;
          return d;
        }
        case 'else':
          throw this.errAt(tok, 'CS8641', "'else' cannot start a statement (önünde eşleşen bir 'if' yok)");
        case 'using': {
          // using var x = ...;  veya using (...) {...}
          this.next();
          if (this.eatOp('(')) {
            const d = this.looksLikeDeclaration() === 'var' ? this.parseVarDecl(false) : { k: 'ExprStmt', e: this.parseExpr() };
            this.expectOp(')');
            const b = this.parseEmbedded();
            return { k: 'Block', stmts: [d, b], ...L };
          }
          return this.parseVarDecl(true);
        }
      }
      // yerel fonksiyon: static int Kare(int x) { ... }
      if (tok.v === 'static' || tok.v === 'async') {
        this.next();
        return this.parseLocalFunction(L);
      }
      if (tok.v === 'void' && this.peek(1).t === 'id' && this.isOp('(', 2)) return this.parseLocalFunction(L);
      if (MODIFIERS.has(tok.v) && tok.v !== 'const') {
        throw this.errAt(tok, 'CS0106', `The modifier '${tok.v}' is not valid for this item`);
      }
      const decl = this.looksLikeDeclaration();
      if (decl === 'var') return this.parseVarDecl(true);
      if (decl === 'func') return this.parseLocalFunction(L);
      if (decl === 'badname') {
        this.parseType();
        throw this.errAt(this.peek(), 'CS1041', `Identifier expected; '${this.peek().v}' is a keyword`);
      }
    }
    // ifade deyimi
    const e = this.parseExpr();
    const okKinds = new Set(['Assign', 'Call', 'PreInc', 'PostInc', 'New']);
    if (!okKinds.has(e.k)) {
      throw new CompileError('CS0201', 'Only assignment, call, increment, decrement, await, and new object expressions can be used as a statement', L.line, L.col);
    }
    this.expectOp(';');
    return { k: 'ExprStmt', e, ...L };
  }

  parseLocalFunction(L) {
    while (this.peek().t === 'id' && MODIFIERS.has(this.peek().v)) this.next();
    let retType;
    if (this.eatId('void')) retType = 'void';
    else { const t = this.parseType(); if (!t) throw this.errAt(this.peek(), 'CS1001', 'Identifier expected'); retType = typeToString(t); }
    const nameTok = this.peek();
    const name = this.expectId();
    if (this.eatOp('<')) { while (!this.eatOp('>')) this.next(); }
    const params = this.parseParams();
    let body;
    if (this.eatOp('=>')) { const e = this.parseExpr(); this.expectOp(';'); body = { k: 'Block', stmts: [retType === 'void' ? { k: 'ExprStmt', e } : { k: 'Return', e, line: nameTok.line }] }; }
    else body = this.parseBlock();
    return { k: 'LocalFunc', m: { k: 'Method', name, params, retType, body, static: true, line: nameTok.line, col: nameTok.col }, ...L };
  }

  parseVarDecl(requireSemi) {
    const tok = this.peek();
    const type = this.parseType();
    const decls = [];
    for (;;) {
      const ntok = this.peek();
      const name = this.expectId();
      let init = null;
      if (this.eatOp('=')) init = this.parseVarInit();
      decls.push({ name, init, line: ntok.line, col: ntok.col });
      if (!this.eatOp(',')) break;
    }
    if (requireSemi) this.expectOp(';');
    return { k: 'VarDecl', type: typeToString(type), decls, line: tok.line, col: tok.col };
  }

  parseVarInit() {
    if (this.isOp('{')) return this.parseArrayLit();
    return this.parseExpr();
  }

  parseArrayLit() {
    const tok = this.peek();
    this.expectOp('{');
    const items = [];
    while (!this.isOp('}')) {
      items.push(this.isOp('{') ? this.parseArrayLit() : this.parseExpr());
      if (!this.eatOp(',')) break;
    }
    this.expectOp('}');
    return { k: 'ArrayLit', items, line: tok.line, col: tok.col };
  }

  // ---------- ifadeler ----------
  parseExpr() { return this.parseAssignment(); }

  tryLambda() {
    const tok = this.peek();
    // x => ...
    if (tok.t === 'id' && !RESERVED.has(tok.v) && this.isOp('=>', 1)) {
      this.next(); this.next();
      return { k: 'Lambda', params: [tok.v], body: this.parseLambdaBody(), line: tok.line, col: tok.col };
    }
    // (a, b) => ...   veya (int a, int b) => ...
    if (tok.t === 'op' && tok.v === '(') {
      let depth = 0, j = this.pos;
      for (; j < this.toks.length; j++) {
        const t = this.toks[j];
        if (t.t === 'op' && t.v === '(') depth++;
        else if (t.t === 'op' && t.v === ')') { depth--; if (depth === 0) break; }
        else if (t.t === 'eof') return null;
      }
      const after = this.toks[j + 1];
      if (!after || after.t !== 'op' || after.v !== '=>') return null;
      this.next();
      const params = [];
      while (!this.isOp(')')) {
        const ids = [];
        while (this.peek().t === 'id' || this.isOp('<') || this.isOp('>') || this.isOp('[') || this.isOp(']')) ids.push(this.next().v);
        params.push(ids[ids.length - 1]);
        if (!this.eatOp(',')) break;
      }
      this.expectOp(')'); this.expectOp('=>');
      return { k: 'Lambda', params, body: this.parseLambdaBody(), line: tok.line, col: tok.col };
    }
    return null;
  }
  parseLambdaBody() {
    if (this.isOp('{')) return this.parseBlock();
    return this.parseExpr();
  }

  parseAssignment() {
    const lam = this.tryLambda();
    if (lam) return lam;
    const tok = this.peek();
    const left = this.parseTernary();
    const t = this.peek();
    if (t.t === 'op' && ASSIGN_OPS.has(t.v)) {
      if (!['Ident', 'Member', 'Index'].includes(left.k)) {
        throw new CompileError('CS0131', 'The left-hand side of an assignment must be a variable, property or indexer', tok.line, tok.col);
      }
      this.next();
      const right = this.isOp('{') && t.v === '=' ? this.parseArrayLit() : this.parseAssignment();
      return { k: 'Assign', op: t.v, target: left, e: right, line: t.line, col: t.col };
    }
    return left;
  }

  parseTernary() {
    const c = this.parseNullCoalesce();
    if (this.isOp('?')) {
      const q = this.next();
      const a = this.parseAssignment();
      this.expectOp(':');
      const b = this.parseAssignment();
      return { k: 'Cond', c, a, b, line: q.line, col: q.col };
    }
    return c;
  }

  parseNullCoalesce() {
    const l = this.parseBinary(0);
    if (this.isOp('??')) { const t = this.next(); return { k: 'Coalesce', l, r: this.parseNullCoalesce(), line: t.line, col: t.col }; }
    return l;
  }

  parseBinary(level) {
    const LEVELS = [['||'], ['&&'], ['|'], ['^'], ['&'], ['==', '!='], ['<', '>', '<=', '>=', 'is', 'as'], ['<<'], ['+', '-'], ['*', '/', '%']];
    if (level >= LEVELS.length) return this.parseUnary();
    let l = this.parseBinary(level + 1);
    for (;;) {
      const t = this.peek();
      const ops = LEVELS[level];
      const isOpTok = (t.t === 'op' && ops.includes(t.v)) || (t.t === 'id' && (t.v === 'is' || t.v === 'as') && ops.includes(t.v));
      if (!isOpTok) break;
      this.next();
      if (t.v === 'is' || t.v === 'as') {
        let neg = false;
        if (t.v === 'is' && this.eatId('not')) neg = true;
        if (t.v === 'is' && (this.peek().t === 'num' || this.peek().t === 'str' || this.isId('null') || this.isId('true') || this.isId('false'))) {
          const val = this.parseUnary();
          l = { k: 'Binary', op: neg ? '!=' : '==', l, r: val, line: t.line, col: t.col };
          continue;
        }
        const type = this.parseType();
        let bind = null;
        if (t.v === 'is' && this.peek().t === 'id' && !RESERVED.has(this.peek().v)) bind = this.next().v;
        l = { k: t.v === 'is' ? 'Is' : 'As', e: l, type: typeToString(type), bind, neg, line: t.line, col: t.col };
        continue;
      }
      const r = this.parseBinary(level + 1);
      l = { k: 'Binary', op: t.v, l, r, line: t.line, col: t.col };
    }
    return l;
  }

  parseUnary() {
    const t = this.peek();
    if (t.t === 'op') {
      if (t.v === '!' || t.v === '-' || t.v === '+' || t.v === '~') {
        this.next();
        return { k: 'Unary', op: t.v, e: this.parseUnary(), line: t.line, col: t.col };
      }
      if (t.v === '++' || t.v === '--') {
        this.next();
        const e = this.parseUnary();
        return { k: 'PreInc', op: t.v, e, line: t.line, col: t.col };
      }
      if (t.v === '(') {
        // tür dönüşümü (cast) mı?
        const save = this.pos;
        this.next();
        const type = this.tryParseType();
        if (type && this.isOp(')')) {
          const builtin = BUILTIN_TYPES.has(type.name);
          const nt = this.peek(1);
          const startsOperand = nt.t === 'id' || nt.t === 'num' || nt.t === 'str' || nt.t === 'char' || nt.t === 'istr' || (nt.t === 'op' && (nt.v === '(' || (builtin && (nt.v === '-' || nt.v === '!' || nt.v === '+'))));
          if (builtin || (startsOperand && /^[A-Z]/.test(type.name) && nt.t === 'id')) {
            if (startsOperand) {
              this.next();
              return { k: 'Cast', type: typeToString(type), e: this.parseUnary(), line: t.line, col: t.col };
            }
          }
        }
        this.pos = save;
      }
    }
    return this.parsePostfix(this.parsePrimary());
  }

  parseArgs() {
    this.expectOp('(');
    const args = [];
    if (!this.isOp(')')) {
      do {
        const atok = this.peek();
        if (this.isId('out') || this.isId('ref') || this.isId('in')) {
          const mod = this.next().v;
          // out int x / out var x / out x
          if (mod === 'out' && this.peek().t === 'id' && this.peek(1).t === 'id') {
            const declType = typeToString(this.parseType());
            const declName = this.expectId();
            args.push({ mod, declType, declName, e: { k: 'Ident', name: declName, line: atok.line, col: atok.col } });
          } else {
            args.push({ mod, e: this.parseExpr() });
          }
          continue;
        }
        // adlandırılmış argüman: name: value
        if (this.peek().t === 'id' && this.isOp(':', 1) && !this.isOp('::', 1)) {
          const nm = this.next().v; this.next();
          args.push({ e: this.parseExpr(), named: nm });
          continue;
        }
        args.push({ e: this.parseExpr() });
      } while (this.eatOp(','));
    }
    this.expectOp(')');
    return args;
  }

  parsePostfix(e) {
    for (;;) {
      const t = this.peek();
      if (t.t !== 'op') break;
      if (t.v === '.' || t.v === '?.') {
        this.next();
        const nt = this.peek();
        if (nt.t !== 'id') throw this.errAt(nt, 'CS1001', 'Identifier expected');
        this.next();
        e = { k: 'Member', obj: e, name: nt.v, nullCond: t.v === '?.', line: nt.line, col: nt.col };
        // generic yöntem çağrısı: x.Cast<int>()
        if (this.isOp('<')) {
          const save = this.pos;
          this.next();
          const ty = this.tryParseType();
          if (ty && this.eatOp('>') && this.isOp('(')) e.generic = typeToString(ty);
          else this.pos = save;
        }
        continue;
      }
      if (t.v === '(') {
        const args = this.parseArgs();
        e = { k: 'Call', callee: e, args, line: t.line, col: t.col };
        continue;
      }
      if (t.v === '[') {
        this.next();
        const idx = [this.parseExpr()];
        while (this.eatOp(',')) idx.push(this.parseExpr());
        this.expectOp(']');
        e = { k: 'Index', obj: e, idx: idx.length === 1 ? idx[0] : idx, multi: idx.length > 1, line: t.line, col: t.col };
        continue;
      }
      if (t.v === '++' || t.v === '--') {
        this.next();
        e = { k: 'PostInc', op: t.v, e, line: t.line, col: t.col };
        continue;
      }
      if (t.v === '!' && (this.isOp('.', 1) || this.isOp(';', 1) || this.isOp(')', 1))) { this.next(); continue; } // null-forgiving
      break;
    }
    return e;
  }

  parseNew(tok) {
    // new() — hedef türlü
    if (this.isOp('(')) {
      const args = this.parseArgs();
      let init = null;
      if (this.isOp('{')) init = this.parseObjInit();
      return { k: 'New', type: null, args, init, line: tok.line, col: tok.col };
    }
    // new[] { ... }
    if (this.isOp('[') && this.isOp(']', 1)) {
      this.next(); this.next();
      const lit = this.parseArrayLit();
      return { k: 'NewArray', elem: null, sizes: null, init: lit, line: tok.line, col: tok.col };
    }
    const type = this.parseTypeInner(true);
    if (!type) throw this.errAt(this.peek(), 'CS1031', 'Type expected');
    const tname = typeToString(type);
    if (this.isOp('[')) {
      this.next();
      let sizes = [];
      if (!this.isOp(']') && !this.isOp(',')) { sizes.push(this.parseExpr()); while (this.eatOp(',')) sizes.push(this.parseExpr()); }
      else { while (this.eatOp(',')) sizes.push(null); }
      this.expectOp(']');
      let extraRank = 0;
      while (this.isOp('[') && this.isOp(']', 1)) { this.next(); this.next(); extraRank++; }
      let init = null;
      if (this.isOp('{')) init = this.parseArrayLit();
      return { k: 'NewArray', elem: tname + '[]'.repeat(extraRank), sizes: sizes.length ? sizes : null, multi: sizes.length > 1, init, line: tok.line, col: tok.col };
    }
    let args = [];
    if (this.isOp('(')) args = this.parseArgs();
    else if (!this.isOp('{')) throw this.errAt(this.peek(), 'CS1526', "A new expression requires an argument list or (), [], or {} after type");
    let init = null;
    if (this.isOp('{')) init = this.parseObjInit();
    return { k: 'New', type: tname, typeNode: type, args, init, line: tok.line, col: tok.col };
  }

  parseObjInit() {
    // nesne başlatıcı { X = 1, Y = 2 } ya da koleksiyon başlatıcı { 1, 2 } / { {"a", 1} } / { ["a"] = 1 }
    const tok = this.peek();
    this.expectOp('{');
    if (this.isOp('}')) { this.next(); return { k: 'CollInit', items: [] }; }
    if (this.peek().t === 'id' && this.isOp('=', 1)) {
      const sets = [];
      while (!this.isOp('}')) {
        const name = this.expectId(); this.expectOp('=');
        sets.push({ name, e: this.isOp('{') ? this.parseObjInitValue() : this.parseExpr() });
        if (!this.eatOp(',')) break;
      }
      this.expectOp('}');
      return { k: 'ObjInit', sets, line: tok.line };
    }
    if (this.isOp('[')) {
      const pairs = [];
      while (!this.isOp('}')) {
        this.expectOp('['); const key = this.parseExpr(); this.expectOp(']'); this.expectOp('=');
        pairs.push({ key, e: this.parseExpr() });
        if (!this.eatOp(',')) break;
      }
      this.expectOp('}');
      return { k: 'IndexInit', pairs };
    }
    const items = [];
    while (!this.isOp('}')) {
      items.push(this.isOp('{') ? this.parseArrayLit() : this.parseExpr());
      if (!this.eatOp(',')) break;
    }
    this.expectOp('}');
    return { k: 'CollInit', items };
  }
  parseObjInitValue() { return this.parseArrayLit(); }

  parsePrimary() {
    const t = this.peek();
    const L = { line: t.line, col: t.col };
    switch (t.t) {
      case 'num': this.next(); return { k: 'Lit', v: t.v, lt: t.dbl ? 'double' : 'int', ...L };
      case 'str': this.next(); return { k: 'Lit', v: t.v, lt: 'string', ...L };
      case 'char': this.next(); return { k: 'Lit', v: t.v, lt: 'char', ...L };
      case 'istr': {
        this.next();
        const parts = t.v.map(p => {
          if (p.s !== undefined) return p;
          if (!p.code.trim()) throw new CompileError('CS1733', 'Expected expression', p.line, p.col);
          const sub = new Parser(p.code, p.line - 1, p.col);
          const e = sub.parseExpr();
          if (sub.peek().t !== 'eof') throw sub.errAt(sub.peek(), 'CS1003', `Syntax error, '}' expected`);
          return { e, fmt: p.fmt, align: p.align };
        });
        return { k: 'Interp', parts, ...L };
      }
      case 'id': {
        switch (t.v) {
          case 'true': this.next(); return { k: 'Lit', v: true, lt: 'bool', ...L };
          case 'false': this.next(); return { k: 'Lit', v: false, lt: 'bool', ...L };
          case 'null': this.next(); return { k: 'Lit', v: null, lt: 'null', ...L };
          case 'this': this.next(); return { k: 'This', ...L };
          case 'base': this.next(); return { k: 'Base', ...L };
          case 'new': this.next(); return this.parseNew(t);
          case 'typeof': { this.next(); this.expectOp('('); const ty = this.parseType(); this.expectOp(')'); return { k: 'Typeof', type: typeToString(ty), ...L }; }
          case 'nameof': {
            if (!this.isOp('(', 1)) break;
            this.next(); this.expectOp('(');
            let last = '';
            while (!this.isOp(')')) last = this.next().v;
            this.next();
            return { k: 'Lit', v: last, lt: 'string', ...L };
          }
          case 'default': {
            this.next();
            if (this.eatOp('(')) { const ty = this.parseType(); this.expectOp(')'); return { k: 'Default', type: typeToString(ty), ...L }; }
            return { k: 'Default', type: null, ...L };
          }
        }
        if (BUILTIN_TYPES.has(t.v) && t.v !== 'var' && t.v !== 'dynamic') {
          // int.Parse, double.MaxValue, string.Join ...
          this.next();
          return { k: 'Ident', name: t.v, isType: true, ...L };
        }
        if (RESERVED.has(t.v)) throw this.errAt(t, 'CS1525', `Invalid expression term '${t.v}'`);
        this.next();
        return { k: 'Ident', name: t.v, ...L };
      }
      case 'op': {
        if (t.v === '(') {
          this.next();
          const e = this.parseExpr();
          // tuple (a, b) desteklenmiyor
          this.expectOp(')');
          return { k: 'Paren', e, ...L };
        }
        break;
      }
      case 'eof':
        throw this.errAfterPrev('CS1733', 'Expected expression');
    }
    throw this.errAt(t, 'CS1525', `Invalid expression term '${t.v}'`);
  }
}

export function parse(src) {
  return new Parser(src).parseProgram();
}
