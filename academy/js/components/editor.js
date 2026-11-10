// Hafif kod editörü: textarea + sözdizimi renklendirme katmanı + satır numaraları.
// Bağımlılık yok; C# için renklendirme, otomatik girinti, Tab, Ctrl+Enter ile çalıştırma.

import { h, esc } from '../core/dom.js';

const KW = new Set(['using', 'namespace', 'class', 'struct', 'interface', 'enum', 'record', 'public', 'private', 'protected', 'internal', 'static', 'readonly', 'const', 'void', 'new', 'return', 'if', 'else', 'while', 'for', 'foreach', 'in', 'do', 'break', 'continue', 'switch', 'case', 'default', 'try', 'catch', 'finally', 'throw', 'true', 'false', 'null', 'this', 'base', 'virtual', 'override', 'abstract', 'sealed', 'is', 'as', 'out', 'ref', 'params', 'var', 'get', 'set', 'init', 'typeof', 'nameof', 'when', 'async', 'await', 'operator', 'partial', 'event', 'delegate', 'where', 'yield']);
const TYPES = new Set(['int', 'double', 'float', 'decimal', 'long', 'short', 'byte', 'string', 'bool', 'char', 'object', 'uint', 'dynamic']);

export function highlight(code) {
  const re = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|(\$@?"(?:[^"\\]|\\.)*"|@"(?:[^"]|"")*"|"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?[fFdDmMlL]?\b)|([A-Za-z_À-ɏ][\wÀ-ɏ]*)(\s*\()?|([{}()[\];,.<>=!+\-*/%&|?:])/g;
  let out = '', last = 0, m;
  while ((m = re.exec(code))) {
    out += esc(code.slice(last, m.index));
    last = re.lastIndex;
    if (m[1]) out += `<span class="tok-com">${esc(m[1])}</span>`;
    else if (m[2]) out += `<span class="tok-str">${esc(m[2])}</span>`;
    else if (m[3]) out += `<span class="tok-num">${esc(m[3])}</span>`;
    else if (m[4]) {
      const w = m[4];
      let cls = '';
      if (KW.has(w)) cls = 'tok-kw';
      else if (TYPES.has(w)) cls = 'tok-type';
      else if (m[5]) cls = 'tok-fn';
      else if (/^[A-Z]/.test(w)) cls = 'tok-type';
      out += cls ? `<span class="${cls}">${esc(w)}</span>` : esc(w);
      if (m[5]) out += esc(m[5]);
    } else if (m[6]) out += `<span class="tok-op">${esc(m[6])}</span>`;
  }
  out += esc(code.slice(last));
  return out;
}

/** Renklendirilmiş HTML'i satırlara böler (açık span'ları satır sınırında kapatıp yeniden açar). */
function splitLines(html) {
  const lines = [];
  let cur = '', open = [];
  const re = /(<span class="[^"]+">)|(<\/span>)|(\n)|([^<\n]+|<)/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) { open.push(m[1]); cur += m[1]; }
    else if (m[2]) { open.pop(); cur += m[2]; }
    else if (m[3]) { cur += '</span>'.repeat(open.length); lines.push(cur); cur = open.join(''); }
    else cur += m[4];
  }
  lines.push(cur);
  return lines;
}

/**
 * @param {object} o
 * @param {string} o.code
 * @param {boolean} [o.readonly]
 * @param {Object<number,string>} [o.explain]   satır → açıklama (tıklanabilir satırlar)
 * @param {(n:number)=>void} [o.onLineClick]
 * @param {(code:string)=>void} [o.onChange]
 * @param {()=>void} [o.onRun]
 * @param {number} [o.maxHeight]
 */
export function createEditor(o) {
  const gutter = h('div.gutter', { 'aria-hidden': 'true' });
  const pre = h('pre');
  const hlLayer = h('div', { style: { position: 'absolute', inset: '0', pointerEvents: 'none' } });
  const ta = h('textarea', { spellcheck: 'false', autocapitalize: 'off', autocomplete: 'off', autocorrect: 'off', wrap: 'off', 'aria-label': 'C# kod editörü' });
  const wrap = h('div', { style: { position: 'relative', flex: '1', width: 'max-content', minWidth: '100%' } }, hlLayer, pre, ta);
  const surface = h('div.surface', { style: { display: 'flex', overflow: 'auto', maxHeight: (o.maxHeight || 560) + 'px' } }, gutter, wrap);
  const el = h('div.editor', { class: o.readonly ? 'readonly' : '' }, surface);
  gutter.style.position = 'sticky';
  gutter.style.left = '0';
  gutter.style.zIndex = '3';
  gutter.style.alignSelf = 'flex-start';
  gutter.style.minHeight = '100%';

  let value = o.code ?? '';
  let marks = { cur: null, err: null, sel: null };
  let escPressed = false;

  function render() {
    const lines = splitLines(highlight(value));
    pre.innerHTML = lines.map((l, i) => {
      const n = i + 1;
      const click = o.explain && o.explain[n] ? ' clickable' : '';
      return `<span class="line${click}" data-n="${n}">${l || ' '}</span>`;
    }).join('');
    gutter.innerHTML = lines.map((_, i) => {
      const n = i + 1;
      const cls = [n === marks.cur ? 'cur' : '', n === marks.err ? 'err' : '', o.explain && o.explain[n] ? 'has-exp' : ''].join(' ').trim();
      return `<div class="${cls}" data-n="${n}">${n}</div>`;
    }).join('');
    renderMarks();
  }
  function lineH() { return parseFloat(getComputedStyle(el).getPropertyValue('--code-size') || 14) * 1.6; }
  function renderMarks() {
    hlLayer.innerHTML = '';
    const add = (n, cls) => {
      if (!n) return;
      const d = h('div.hl-line', { class: cls });
      d.style.top = (12 + (n - 1) * lineH()) + 'px';
      hlLayer.append(d);
    };
    add(marks.sel, 'sel');
    add(marks.err, 'err');
    add(marks.cur, '');
    for (const g of gutter.children) {
      const n = +g.dataset.n;
      g.classList.toggle('cur', n === marks.cur);
      g.classList.toggle('err', n === marks.err);
    }
  }

  function scrollToLine(n) {
    const top = 12 + (n - 1) * lineH();
    if (top < surface.scrollTop || top > surface.scrollTop + surface.clientHeight - 40) surface.scrollTop = Math.max(0, top - surface.clientHeight / 3);
  }

  ta.value = value;
  if (o.readonly) ta.readOnly = true;

  function insert(text) {
    ta.focus();
    if (!document.execCommand || !document.execCommand('insertText', false, text)) {
      const s = ta.selectionStart, e = ta.selectionEnd;
      ta.setRangeText(text, s, e, 'end');
      ta.dispatchEvent(new Event('input'));
    }
  }

  ta.addEventListener('input', () => {
    value = ta.value;
    if (marks.err) marks.err = null;
    render();
    o.onChange && o.onChange(value);
  });
  ta.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); o.onRun && o.onRun(); return; }
    if (e.key === 'Escape') { escPressed = true; return; }
    if (e.key === 'Tab') {
      if (escPressed) { escPressed = false; return; } // klavye kullanıcıları için editörden çıkış
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      if (s === en && !e.shiftKey) { insert('    '); return; }
      // seçili satırları girintile/çıkar
      const startLine = value.lastIndexOf('\n', s - 1) + 1;
      const block = value.slice(startLine, en);
      const changed = block.split('\n').map(l => e.shiftKey ? l.replace(/^ {1,4}/, '') : '    ' + l).join('\n');
      ta.setSelectionRange(startLine, en);
      insert(changed);
      ta.setSelectionRange(startLine, startLine + changed.length);
      return;
    }
    escPressed = false;
    if (e.key === 'Enter') {
      e.preventDefault();
      const s = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const line = value.slice(lineStart, s);
      let indent = /^\s*/.exec(line)[0];
      const prevChar = line.trimEnd().slice(-1);
      const nextChar = value[ta.selectionEnd];
      if (prevChar === '{') {
        if (nextChar === '}') { insert('\n' + indent + '    \n' + indent); ta.setSelectionRange(s + indent.length + 5, s + indent.length + 5); return; }
        indent += '    ';
      }
      insert('\n' + indent);
      return;
    }
    if (e.key === '}') {
      const s = ta.selectionStart;
      const lineStart = value.lastIndexOf('\n', s - 1) + 1;
      const before = value.slice(lineStart, s);
      if (/^\s{4,}$/.test(before)) {
        e.preventDefault();
        ta.setSelectionRange(s - 4, s);
        insert('}');
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key === '/') {
      e.preventDefault();
      const s = ta.selectionStart, en = ta.selectionEnd;
      const startLine = value.lastIndexOf('\n', s - 1) + 1;
      let endLine = value.indexOf('\n', en); if (endLine < 0) endLine = value.length;
      const block = value.slice(startLine, endLine);
      const ls = block.split('\n');
      const allC = ls.every(l => /^\s*\/\//.test(l) || !l.trim());
      const changed = ls.map(l => allC ? l.replace(/^(\s*)\/\/ ?/, '$1') : l.replace(/^(\s*)/, '$1// ')).join('\n');
      ta.setSelectionRange(startLine, endLine);
      insert(changed);
    }
  });

  pre.addEventListener('click', (e) => {
    if (!o.readonly) return;
    const line = e.target.closest('.line');
    if (line && o.onLineClick) o.onLineClick(+line.dataset.n);
  });
  gutter.addEventListener('click', (e) => {
    const g = e.target.closest('[data-n]');
    if (g && o.onLineClick && o.explain && o.explain[+g.dataset.n]) o.onLineClick(+g.dataset.n);
  });

  render();

  return {
    el,
    getValue: () => value,
    setValue(v) { value = v ?? ''; ta.value = value; marks.err = null; render(); },
    setCurrentLine(n) { marks.cur = n || null; renderMarks(); if (n) scrollToLine(n); },
    setErrorLine(n) { marks.err = n || null; renderMarks(); if (n) scrollToLine(n); },
    setSelectedLine(n) { marks.sel = n || null; renderMarks(); },
    focus() { ta.focus(); },
    refresh: render,
  };
}
