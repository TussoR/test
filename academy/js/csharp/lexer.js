// C# alt kümesi için sözcük çözümleyici (lexer / tokenizer).
// Kaynak kodu token dizisine çevirir: { t: tür, v: değer, line, col }.
// Türler: id, num, str, char, istr (interpolated string), op, eof

import { CompileError } from './errors.js';

const OPERATORS = [
  '>>=', '<<=', '??=', '...',
  '=>', '==', '!=', '<=', '>=', '&&', '||', '++', '--', '+=', '-=', '*=', '/=', '%=',
  '??', '?.', '::', '<<',
  '+', '-', '*', '/', '%', '=', '<', '>', '!', '&', '|', '^', '~', '?', ':',
  ';', ',', '.', '(', ')', '{', '}', '[', ']',
];

function isIdStart(c) { return /[A-Za-z_À-ɏ]/.test(c); }
function isIdPart(c) { return /[A-Za-z0-9_À-ɏ]/.test(c); }
function isDigit(c) { return c >= '0' && c <= '9'; }

const ESCAPES = { n: '\n', t: '\t', r: '\r', '0': '\0', '\\': '\\', '"': '"', "'": "'", a: '\x07', b: '\b', f: '\f', v: '\v' };

export function tokenize(src) {
  const tokens = [];
  let i = 0, line = 1, col = 1;
  const n = src.length;

  const peek = (o = 0) => src[i + o];
  const advance = () => {
    const c = src[i++];
    if (c === '\n') { line++; col = 1; } else { col++; }
    return c;
  };

  function readEscape(startLine, startCol) {
    const e = advance();
    if (e === 'u') {
      let hex = '';
      for (let k = 0; k < 4; k++) hex += advance();
      return String.fromCharCode(parseInt(hex, 16));
    }
    if (e in ESCAPES) return ESCAPES[e];
    throw new CompileError('CS1009', `Unrecognized escape sequence '\\${e}'`, startLine, startCol);
  }

  while (i < n) {
    const c = peek();
    // boşluk
    if (c === ' ' || c === '\t' || c === '\r' || c === '\n' || c === '﻿') { advance(); continue; }
    // yorumlar
    if (c === '/' && peek(1) === '/') { while (i < n && peek() !== '\n') advance(); continue; }
    if (c === '/' && peek(1) === '*') {
      const sl = line, sc = col;
      advance(); advance();
      while (i < n && !(peek() === '*' && peek(1) === '/')) advance();
      if (i >= n) throw new CompileError('CS1035', 'End-of-file found, \'*/\' expected', sl, sc);
      advance(); advance();
      continue;
    }
    // önişlemci direktifleri (#region vb.) yok sayılır
    if (c === '#' && (col === 1 || /^\s*$/.test(src.slice(src.lastIndexOf('\n', i - 1) + 1, i)))) {
      while (i < n && peek() !== '\n') advance();
      continue;
    }

    const sl = line, sc = col;

    // interpolated string: $"..." veya $@"..." / @$"..."
    if ((c === '$' && peek(1) === '"') || (c === '$' && peek(1) === '@' && peek(2) === '"') || (c === '@' && peek(1) === '$' && peek(2) === '"')) {
      const verbatim = c === '@' || peek(1) === '@';
      advance(); if (verbatim) advance(); advance(); // $ @ "
      const parts = [];
      let text = '';
      for (;;) {
        if (i >= n || (!verbatim && peek() === '\n')) throw new CompileError('CS1010', 'Newline in constant', sl, sc);
        const ch = peek();
        if (ch === '"') {
          if (verbatim && peek(1) === '"') { advance(); advance(); text += '"'; continue; }
          advance(); break;
        }
        if (ch === '{' && peek(1) === '{') { advance(); advance(); text += '{'; continue; }
        if (ch === '}' && peek(1) === '}') { advance(); advance(); text += '}'; continue; }
        if (ch === '{') {
          if (text) parts.push({ s: text }); text = '';
          advance();
          const el = line, ec = col;
          let depth = 0, code = '', fmt = null, align = null;
          let inStr = false;
          for (;;) {
            if (i >= n) throw new CompileError('CS1010', 'Newline in constant', sl, sc);
            const d = peek();
            if (inStr) { code += advance(); if (d === '\\') { code += advance(); } else if (d === '"') inStr = false; continue; }
            if (d === '"') { inStr = true; code += advance(); continue; }
            if (d === '(' || d === '[' || d === '{') depth++;
            if (d === ')' || d === ']') depth--;
            if (d === '}' && depth === 0) { advance(); break; }
            if (d === '}') depth--;
            if (d === ':' && depth === 0 && !code.includes('?')) {
              advance(); fmt = '';
              while (i < n && peek() !== '}') fmt += advance();
              advance();
              break;
            }
            if (d === ',' && depth === 0) {
              advance(); align = '';
              while (i < n && peek() !== '}' && peek() !== ':') align += advance();
              continue;
            }
            code += advance();
          }
          parts.push({ code, fmt, align: align ? parseInt(align.trim(), 10) : null, line: el, col: ec });
          continue;
        }
        if (ch === '\\' && !verbatim) { advance(); text += readEscape(sl, sc); continue; }
        text += advance();
      }
      if (text) parts.push({ s: text });
      tokens.push({ t: 'istr', v: parts, line: sl, col: sc });
      continue;
    }

    // verbatim string @"..."
    if (c === '@' && peek(1) === '"') {
      advance(); advance();
      let s = '';
      for (;;) {
        if (i >= n) throw new CompileError('CS1010', 'Newline in constant', sl, sc);
        const ch = advance();
        if (ch === '"') { if (peek() === '"') { advance(); s += '"'; continue; } break; }
        s += ch;
      }
      tokens.push({ t: 'str', v: s, line: sl, col: sc });
      continue;
    }
    // @identifier
    if (c === '@' && isIdStart(peek(1))) { advance(); }

    // normal string
    if (c === '"') {
      advance();
      let s = '';
      for (;;) {
        if (i >= n || peek() === '\n') throw new CompileError('CS1010', 'Newline in constant', sl, sc);
        const ch = advance();
        if (ch === '"') break;
        if (ch === '\\') { s += readEscape(sl, sc); continue; }
        s += ch;
      }
      tokens.push({ t: 'str', v: s, line: sl, col: sc });
      continue;
    }
    // karakter
    if (c === "'") {
      advance();
      let ch = advance();
      if (ch === '\\') ch = readEscape(sl, sc);
      else if (ch === "'" ) throw new CompileError('CS1011', 'Empty character literal', sl, sc);
      if (peek() !== "'") throw new CompileError('CS1012', 'Too many characters in character literal', sl, sc);
      advance();
      tokens.push({ t: 'char', v: ch, line: sl, col: sc });
      continue;
    }
    // sayı
    if (isDigit(c) || (c === '.' && isDigit(peek(1)))) {
      let s = '';
      let isDouble = false;
      if (c === '0' && (peek(1) === 'x' || peek(1) === 'X')) {
        advance(); advance();
        while (/[0-9a-fA-F_]/.test(peek() || '')) { const d = advance(); if (d !== '_') s += d; }
        tokens.push({ t: 'num', v: parseInt(s, 16), dbl: false, line: sl, col: sc });
        continue;
      }
      while (i < n && (isDigit(peek()) || peek() === '_')) { const d = advance(); if (d !== '_') s += d; }
      if (peek() === '.' && isDigit(peek(1))) {
        isDouble = true; s += advance();
        while (i < n && (isDigit(peek()) || peek() === '_')) { const d = advance(); if (d !== '_') s += d; }
      }
      if (peek() === 'e' || peek() === 'E') {
        isDouble = true; s += advance();
        if (peek() === '+' || peek() === '-') s += advance();
        while (i < n && isDigit(peek())) s += advance();
      }
      const suf = (peek() || '').toLowerCase();
      if (suf === 'f' || suf === 'd' || suf === 'm') { advance(); isDouble = true; }
      else if (suf === 'l' || suf === 'u') { advance(); if ((peek() || '').toLowerCase() === 'l' || (peek() || '').toLowerCase() === 'u') advance(); }
      tokens.push({ t: 'num', v: parseFloat(s), dbl: isDouble, line: sl, col: sc });
      continue;
    }
    // tanımlayıcı / anahtar kelime
    if (isIdStart(c)) {
      let s = '';
      while (i < n && isIdPart(peek())) s += advance();
      tokens.push({ t: 'id', v: s, line: sl, col: sc });
      continue;
    }
    // operatör
    let matched = null;
    for (const op of OPERATORS) {
      if (src.startsWith(op, i)) { matched = op; break; }
    }
    if (matched) {
      for (let k = 0; k < matched.length; k++) advance();
      tokens.push({ t: 'op', v: matched, line: sl, col: sc });
      continue;
    }
    throw new CompileError('CS1056', `Unexpected character '${c}'`, sl, sc);
  }
  tokens.push({ t: 'eof', v: '<EOF>', line, col });
  return tokens;
}
