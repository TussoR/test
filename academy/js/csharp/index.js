// Genel giriş noktası: runCSharp(kod, seçenekler) → sonuç
import { parse } from './parser.js';
import { Interpreter } from './interpreter.js';
import { CompileError, LimitError } from './errors.js';
import { displayValue } from './values.js';

/**
 * C# kodunu güvenli şekilde çalıştırır.
 * @returns {{ ok:boolean, stdout:string, error:null|{kind,code,message,line,col,excType}, variables:Array, trace:Array, steps:number, ms:number }}
 */
export function runCSharp(code, opts = {}) {
  const t0 = (typeof performance !== 'undefined' ? performance : Date).now();
  const result = { ok: true, stdout: '', error: null, variables: [], trace: [], steps: 0, ms: 0, inputsUsed: 0 };
  let interp = null;
  try {
    const prog = parse(code);
    interp = new Interpreter(prog, opts);
    interp.run();
  } catch (err) {
    result.ok = false;
    if (err instanceof CompileError) {
      result.error = { kind: 'compile', code: err.code, message: err.message, line: err.line, col: err.col };
    } else if (err instanceof LimitError) {
      result.error = { kind: 'limit', code: err.code, message: err.message, line: err.line };
    } else if (err instanceof RangeError) {
      result.error = { kind: 'limit', code: 'STACK', message: 'Stack overflow — fonksiyon kendini durmadan çağırıyor (sonsuz özyineleme) ya da çok derin bir özyineleme var.', line: interp?.curLine ?? 1 };
    } else if (err && err.exc) {
      // yakalanmamış C# exception
      const cls = err.exc.cls;
      const full = cls.builtin ? `${cls.ns}.${cls.name}` : cls.name;
      result.error = { kind: 'runtime', code: cls.name, excType: full, message: err.exc.fields.get('Message'), line: err.line };
    } else {
      result.error = { kind: 'internal', code: 'INTERNAL', message: String(err && err.message || err), line: interp?.curLine ?? 1 };
      if (typeof console !== 'undefined' && opts.debug) console.error(err);
    }
  }
  if (interp) {
    result.stdout = interp.out.join('');
    result.trace = interp.trace;
    result.steps = interp.steps;
    result.inputsUsed = interp.stdinPos;
    const vars = [];
    const scope = interp.entryScope;
    if (scope) for (const [name, slot] of scope.vars) {
      if (slot.fn) continue;
      vars.push({ name, type: slot.type, value: typeof slot.value === 'symbol' ? '(atanmadı)' : displayValue(slot.value) });
    }
    result.variables = vars;
  }
  // Derleme hatasında gerçek C# hiçbir şey çalıştırmaz
  if (result.error && result.error.kind === 'compile') { result.stdout = ''; result.trace = []; }
  result.ms = Math.round(((typeof performance !== 'undefined' ? performance : Date).now() - t0) * 10) / 10;
  return result;
}

/** Çalışma zamanı hatasını C# konsolundaki gibi metne dönüştürür. */
export function formatError(err) {
  if (!err) return '';
  if (err.kind === 'compile') return `Program.cs(${err.line},${err.col}): error ${err.code}: ${err.message}`;
  if (err.kind === 'runtime') return `Unhandled exception. ${err.excType}: ${err.message}\n   (satır ${err.line})`;
  if (err.kind === 'limit') return `⛔ ${err.message} (satır ${err.line})`;
  return `İç hata: ${err.message}`;
}
