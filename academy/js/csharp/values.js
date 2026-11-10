// Çalışma zamanı değer türleri ve C# uyumlu biçimlendirme.
// int  -> JS number (tam sayı)
// double/float/decimal -> Dbl
// char -> Chr
// string -> JS string, bool -> JS boolean, null -> null

export class Dbl { constructor(v) { this.v = v; } }
export class Chr { constructor(c) { this.c = c; } }
export class CsArray { constructor(elemType, items, dims) { this.elemType = elemType; this.items = items; this.dims = dims || [items.length]; } }
export class CsList { constructor(elemType, items = [], kind = 'List') { this.elemType = elemType; this.items = items; this.kind = kind; this.version = 0; } }
export class CsDict {
  constructor(kType, vType) { this.kType = kType; this.vType = vType; this.map = new Map(); this.version = 0; }
}
export class CsObject { constructor(cls) { this.cls = cls; this.fields = new Map(); } }
export class Lambda { constructor(params, body, scope, ctx) { this.params = params; this.body = body; this.scope = scope; this.ctx = ctx; } }
export class MethodGroup { constructor(name, target) { this.name = name; this.target = target; } }
export class EnumVal { constructor(info, name, value) { this.info = info; this.name = name; this.value = value; } }
export class KVPair { constructor(key, value) { this.key = key; this.value = value; } }
export class TypeRef { constructor(kind, name, info) { this.kind = kind; this.name = name; this.info = info; } }
export class TypeObj { constructor(name, full) { this.name = name; this.full = full || name; } }
export class StrBuilder { constructor(s = '') { this.s = s; } }
export class RandomGen {
  constructor(seed) {
    this.seeded = seed !== undefined;
    this.state = (seed === undefined ? Math.floor(Math.random() * 2 ** 31) : seed) >>> 0;
  }
  next() { // mulberry32
    let t = (this.state += 0x6D2B79F5) >>> 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
}

export const isNum = v => typeof v === 'number' || v instanceof Dbl || v instanceof Chr;
export const numVal = v => typeof v === 'number' ? v : v instanceof Dbl ? v.v : v instanceof Chr ? v.c.charCodeAt(0) : v instanceof EnumVal ? v.value : NaN;

const CLR_NAMES = { int: 'Int32', double: 'Double', string: 'String', bool: 'Boolean', char: 'Char', float: 'Single', decimal: 'Decimal', long: 'Int64', object: 'Object', byte: 'Byte', short: 'Int16' };
export function clrName(t) {
  if (!t) return 'System.Object';
  const m = /^(.*?)((\[\])*)$/.exec(t);
  const base = m[1];
  return (CLR_NAMES[base] ? 'System.' + CLR_NAMES[base] : base) + m[2];
}

/** C# double.ToString() davranışını taklit eder ("R" / en kısa gidiş-dönüş). */
export function formatDouble(x) {
  if (Number.isNaN(x)) return 'NaN';
  if (x === Infinity) return '∞';
  if (x === -Infinity) return '-∞';
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';
  const abs = Math.abs(x);
  const exp = Math.floor(Math.log10(abs));
  if (exp >= 15 || exp < -5) {
    let [mant, e] = x.toExponential().split('e');
    const sign = e[0] === '-' ? '-' : '+';
    let digits = e.replace(/^[+-]/, '');
    if (digits.length < 2) digits = '0' + digits;
    return `${mant}E${sign}${digits}`;
  }
  return String(x);
}

function groupThousands(intStr) {
  return intStr.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/** Sayı biçim belirteçleri: F2, N2, D3, P1, X, E2, C, 0.00, #,##0.0 ... */
export function formatNumber(v, fmt) {
  const isInt = typeof v === 'number';
  const x = numVal(v);
  if (!fmt) return isInt ? String(x) : formatDouble(x);
  const m = /^([A-Za-z])(\d*)$/.exec(fmt);
  if (m) {
    const c = m[1].toUpperCase();
    const p = m[2] === '' ? null : parseInt(m[2], 10);
    switch (c) {
      case 'F': return fixed(x, p ?? 2);
      case 'N': { const s = fixed(Math.abs(x), p ?? 2); const [a, b] = s.split('.'); return (x < 0 ? '-' : '') + groupThousands(a) + (b !== undefined ? '.' + b : ''); }
      case 'D': if (!isInt) throw new Error('FormatD'); { const s = String(Math.abs(x)).padStart(p ?? 0, '0'); return (x < 0 ? '-' : '') + s; }
      case 'P': { const s = fixed(Math.abs(x * 100), p ?? 2); const [a, b] = s.split('.'); return (x < 0 ? '-' : '') + groupThousands(a) + (b !== undefined ? '.' + b : '') + ' %'; }
      case 'C': { const s = fixed(Math.abs(x), p ?? 2); const [a, b] = s.split('.'); return (x < 0 ? '-' : '') + '¤' + groupThousands(a) + (b !== undefined ? '.' + b : ''); }
      case 'X': { const s = (x >>> 0).toString(16); return (m[1] === 'X' ? s.toUpperCase() : s).padStart(p ?? 0, '0'); }
      case 'E': { const [mant, e] = x.toExponential(p ?? 6).split('e'); const sign = e[0] === '-' ? '-' : '+'; return `${mant}${m[1]}${sign}${e.replace(/^[+-]/, '').padStart(3, '0')}`; }
      case 'G': case 'R': return isInt ? String(x) : formatDouble(x);
    }
  }
  // özel desen: 0.00, #.##, #,##0.0
  if (/^[#0,.]+$/.test(fmt)) {
    const [ip, dp = ''] = fmt.split('.');
    const minDec = (dp.match(/0/g) || []).length;
    const maxDec = dp.length;
    let s = fixed(Math.abs(x), maxDec);
    if (maxDec > minDec) {
      s = s.replace(/0+$/, m0 => m0.slice(0, Math.max(0, m0.length - (maxDec - minDec))));
      let [a, b = ''] = s.split('.');
      while (b.length > minDec && b.endsWith('0')) b = b.slice(0, -1);
      s = b.length ? `${a}.${b}` : a;
    }
    let [a, b] = s.split('.');
    const minInt = (ip.replace(/,/g, '').match(/0/g) || []).length;
    if (minInt === 0 && a === '0') a = '';
    a = a.padStart(minInt, '0');
    if (ip.includes(',')) a = groupThousands(a);
    return (x < 0 ? '-' : '') + a + (b !== undefined ? '.' + b : '');
  }
  return isInt ? String(x) : formatDouble(x);
}

function fixed(x, p) {
  // toFixed, ±0.5 sınırlarında IEEE doğrulukta çalışır (.NET Core 3+ ile aynı)
  const s = x.toFixed(Math.min(p, 100));
  return s === '-0' || /^-0\.0*$/.test(s) ? s.slice(1) : s;
}

/** Konsola yazdırılan dize karşılığı (C# ToString()). */
export function toStr(v, interp) {
  if (v === null || v === undefined) return '';
  if (typeof v === 'string') return v;
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'True' : 'False';
  if (v instanceof Dbl) return formatDouble(v.v);
  if (v instanceof Chr) return v.c;
  if (v instanceof EnumVal) return v.name;
  if (v instanceof CsArray) return clrName(v.elemType) + '[]';
  if (v instanceof CsList) {
    if (v.kind === 'List') return `System.Collections.Generic.List\`1[${clrName(v.elemType)}]`;
    if (v.kind === 'Enumerable') return 'System.Linq.Enumerable+Iterator`1[' + clrName(v.elemType) + ']';
    return `System.Collections.Generic.${v.kind}\`1[${clrName(v.elemType)}]`;
  }
  if (v instanceof CsDict) return `System.Collections.Generic.Dictionary\`2[${clrName(v.kType)},${clrName(v.vType)}]`;
  if (v instanceof KVPair) return `[${toStr(v.key, interp)}, ${toStr(v.value, interp)}]`;
  if (v instanceof StrBuilder) return v.s;
  if (v instanceof TypeObj) return v.full;
  if (v instanceof Lambda) return 'System.Func`1';
  if (v instanceof RandomGen) return 'System.Random';
  if (v instanceof CsObject) {
    if (interp) return interp.objToString(v);
    return v.cls.name;
  }
  return String(v);
}

/** Bellek panelinde gösterim (geliştirici dostu). */
export function displayValue(v, depth = 0) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (v instanceof Chr) return `'${v.c === '\n' ? '\\n' : v.c}'`;
  if (v instanceof Dbl) return formatDouble(v.v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  if (typeof v === 'number') return String(v);
  if (depth > 1) return '…';
  if (v instanceof CsArray) return `[${v.items.slice(0, 20).map(x => displayValue(x, depth + 1)).join(', ')}${v.items.length > 20 ? ', …' : ''}]`;
  if (v instanceof CsList) return `[${v.items.slice(0, 20).map(x => displayValue(x, depth + 1)).join(', ')}${v.items.length > 20 ? ', …' : ''}] (Count=${v.items.length})`;
  if (v instanceof CsDict) return `{${[...v.map.values()].slice(0, 12).map(e => `${displayValue(e.k, depth + 1)}: ${displayValue(e.v, depth + 1)}`).join(', ')}}`;
  if (v instanceof EnumVal) return `${v.info.name}.${v.name}`;
  if (v instanceof Lambda) return '(lambda)';
  if (v instanceof CsObject) {
    const fs = [...v.fields.entries()].slice(0, 6).map(([k, x]) => `${k}=${displayValue(x, depth + 1)}`).join(', ');
    return `${v.cls.name} {${fs}}`;
  }
  return toStr(v);
}

export function typeNameOf(v) {
  if (v === undefined) return 'void';
  if (v === null) return '<null>';
  if (typeof v === 'number') return 'int';
  if (typeof v === 'string') return 'string';
  if (typeof v === 'boolean') return 'bool';
  if (v instanceof Dbl) return 'double';
  if (v instanceof Chr) return 'char';
  if (v instanceof CsArray) return v.elemType + '[]';
  if (v instanceof CsList) return v.kind === 'Enumerable' ? `IEnumerable<${v.elemType}>` : `${v.kind}<${v.elemType}>`;
  if (v instanceof CsDict) return `Dictionary<${v.kType}, ${v.vType}>`;
  if (v instanceof EnumVal) return v.info.name;
  if (v instanceof CsObject) return v.cls.name;
  if (v instanceof Lambda) return 'lambda expression';
  if (v instanceof StrBuilder) return 'StringBuilder';
  if (v instanceof KVPair) return 'KeyValuePair';
  return 'object';
}
