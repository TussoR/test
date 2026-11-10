// Çalıştırma paneli: Çıktı / Girdi / Bellek sekmeleri + adım adım yürütme (stepper).

import { h, mount, esc, icon } from '../core/dom.js';
import { runCSharp, formatError } from '../csharp/index.js';
import { explainError } from '../csharp/diagnostics.js';
import { state, save } from '../core/store.js';
import { setCtx } from '../core/context.js';

export function errorBox(err, { onAsk } = {}) {
  const info = explainError(err);
  const box = h('div.err-box', { role: 'alert' },
    h('h4', `${info.title} `, h('span.badge.err', err.code || '')),
    h('div.small.muted', { style: { fontFamily: 'var(--mono)', margin: '2px 0 6px' } }, formatError(err)),
    h('div.why', { html: info.why }),
    h('div.fix', { html: info.fix }),
  );
  if (onAsk) box.append(h('div', { style: { marginTop: '8px' } }, h('button.btn.sm', { onclick: onAsk }, icon('bot'), 'Eğitmene sor')));
  return box;
}

/**
 * @param {object} o
 * @param {object} o.editor        createEditor() sonucu
 * @param {string} [o.stdin]
 * @param {boolean} [o.stepper]    adım adım modu göster
 * @param {boolean} [o.showStdin]  girdi sekmesini öne çıkar
 * @param {(res)=>void} [o.onResult]
 * @param {HTMLElement[]} [o.extraButtons]
 */
export function createRunner(o) {
  const out = h('div.console', { 'aria-live': 'polite' }, h('span.placeholder', '▶ Çalıştır\'a bas (Ctrl+Enter) — çıktı burada görünecek.'));
  const stdinTa = h('textarea', { placeholder: 'Console.ReadLine() için girdiler — her satır bir okuma', 'aria-label': 'Program girdisi (stdin)' });
  stdinTa.value = o.stdin ?? '';
  const varsBox = h('div', h('div.empty.small', 'Programı çalıştırınca değişkenlerin son değerleri burada görünür.'));
  const panes = { out, stdin: h('div.stdin-area', h('div.small.muted', { style: { marginBottom: '6px' } }, 'Program Console.ReadLine() çağırdıkça bu satırlar sırayla okunur.'), stdinTa), vars: varsBox };
  const body = h('div', out);
  const tabs = h('div.tabs', { role: 'tablist' });
  let curTab = 'out';
  const tabDefs = [['out', 'Çıktı'], ['stdin', 'Girdi (stdin)'], ['vars', 'Bellek']];
  function showTab(k) {
    curTab = k;
    mount(body, panes[k]);
    for (const b of tabs.children) b.classList.toggle('active', b.dataset.k === k);
  }
  for (const [k, label] of tabDefs) tabs.append(h('button', { dataset: { k }, role: 'tab', onclick: () => showTab(k) }, label));
  tabs.firstChild.classList.add('active');

  const meta = h('span.meta');
  const runBtn = h('button.btn.primary.sm', { onclick: () => run(), title: 'Ctrl+Enter' }, icon('play'), 'Çalıştır');
  const stepBtn = o.stepper ? h('button.btn.sm', { onclick: () => run(true), title: 'Kodu satır satır yürüt' }, icon('step'), 'Adım adım') : null;
  const bar = h('div.runner-bar', runBtn, stepBtn, ...(o.extraButtons || []), meta);
  const errHolder = h('div');
  const stepperBar = h('div.stepper', { style: { display: 'none' } });
  const el = h('div.runner', bar, tabs, body, errHolder, stepperBar);

  let last = null;

  function renderVars(vars, prev) {
    if (!vars || !vars.length) { mount(varsBox, h('div.empty.small', 'Bu noktada görünür değişken yok.')); return; }
    const prevMap = new Map((prev || []).map(v => [v.name, v.value]));
    mount(varsBox, h('table.vars',
      h('thead', h('tr', h('th', 'Ad'), h('th', 'Tür'), h('th', 'Değer'))),
      h('tbody', vars.map(v => h('tr', { class: prev && prevMap.get(v.name) !== v.value ? 'changed' : '' }, h('td', v.name), h('td.t', v.type || ''), h('td.v', v.value)))),
    ));
  }

  function showOutput(text, err, inputsUsed, stdinLines) {
    out.innerHTML = '';
    if (text) out.append(document.createTextNode(text));
    if (!text && !err) out.append(h('span.placeholder', '(Program çalıştı ama hiçbir şey yazdırmadı.)'));
    if (err) out.append(h('div.err-line', (text && !text.endsWith('\n') ? '\n' : '') + formatError(err)));
    if (inputsUsed) out.append(h('div.in-echo', `\n— ${inputsUsed} girdi satırı okundu: ${stdinLines.slice(0, inputsUsed).map(s => JSON.stringify(s)).join(', ')}`));
  }

  function run(trace = false) {
    const code = o.editor.getValue();
    const stdin = stdinTa.value;
    const res = runCSharp(code, { stdin, trace });
    last = res;
    state.stats.runs++;
    if (res.error) state.stats.errorsSeen[res.error.code] = (state.stats.errorsSeen[res.error.code] || 0) + 1;
    save();
    setCtx({ lastRun: { code, result: res } });
    meta.textContent = res.error ? `${res.error.kind === 'compile' ? 'derleme hatası' : 'hata'} · ${res.ms} ms` : `${res.steps.toLocaleString('tr-TR')} adım · ${res.ms} ms`;
    showOutput(res.stdout, res.error, res.inputsUsed, stdin.split(/\r?\n/));
    renderVars(res.variables);
    errHolder.innerHTML = '';
    if (res.error) {
      errHolder.append(errorBox(res.error, { onAsk: () => window.dispatchEvent(new CustomEvent('tutor:ask', { detail: { action: 'error' } })) }));
      if (res.error.line) o.editor.setErrorLine(res.error.line);
    } else o.editor.setErrorLine(null);
    if (curTab !== 'out' && curTab !== 'vars' || curTab === 'both') showTab('out');
    if (trace && !res.error?.kind?.startsWith('compile') && res.trace.length) startStepper(res);
    else { stepperBar.style.display = 'none'; o.editor.setCurrentLine(null); }
    o.onResult && o.onResult(res);
    return res;
  }

  function startStepper(res) {
    const tr = res.trace;
    let i = 0;
    const slider = h('input', { type: 'range', min: 0, max: tr.length - 1, value: 0, 'aria-label': 'Adım' });
    const pos = h('span.pos');
    const lineInfo = h('span.small.muted');
    const go = (k) => {
      i = Math.max(0, Math.min(tr.length - 1, k));
      slider.value = i;
      const t = tr[i];
      o.editor.setCurrentLine(t.line);
      pos.textContent = `${i + 1} / ${tr.length}`;
      lineInfo.textContent = `Satır ${t.line}${t.fn ? ' · ' + t.fn + '()' : ''}`;
      const text = res.stdout.slice(0, t.outLen);
      out.innerHTML = '';
      out.append(document.createTextNode(text || ''));
      if (!text) out.append(h('span.placeholder', '(henüz çıktı yok)'));
      out.append(h('div.in-echo', `\n▶ Sıradaki satır: ${t.line} — henüz çalışmadı`));
      renderVars(t.vars, i > 0 ? tr[i - 1].vars : null);
    };
    let timer = null;
    const playBtn = h('button.btn.sm', { onclick: () => {
      if (timer) { clearInterval(timer); timer = null; playBtn.textContent = '▶ Oynat'; return; }
      playBtn.textContent = '⏸ Durdur';
      timer = setInterval(() => { if (i >= tr.length - 1) { clearInterval(timer); timer = null; playBtn.textContent = '▶ Oynat'; return; } go(i + 1); }, 700);
    } }, '▶ Oynat');
    slider.addEventListener('input', () => go(+slider.value));
    mount(stepperBar,
      h('button.btn.sm', { onclick: () => go(0), 'aria-label': 'Başa' }, '⏮'),
      h('button.btn.sm', { onclick: () => go(i - 1), 'aria-label': 'Geri' }, '◀'),
      h('button.btn.sm.primary', { onclick: () => go(i + 1), 'aria-label': 'İleri' }, 'İleri ▶'),
      playBtn,
      slider, pos,
      h('button.btn.sm.ghost', { onclick: () => { if (timer) clearInterval(timer); stepperBar.style.display = 'none'; o.editor.setCurrentLine(null); showOutput(res.stdout, res.error, 0, []); renderVars(res.variables); } }, 'Kapat'),
      h('div', { style: { flexBasis: '100%' } }, lineInfo, h('span.small.muted', ' · Sarı/yeşil satırlar: bu adımda değişen değişkenler (Bellek sekmesi)')),
    );
    stepperBar.style.display = '';
    if (res.trace.length >= 1500) lineInfo.textContent += ' (ilk 1500 adım gösteriliyor)';
    // adım modunda çıktı ve bellek birlikte görünür
    mount(body, out, h('div', { style: { borderTop: '1px solid var(--border)' } }, h('div.small.muted', { style: { padding: '6px 12px 0' } }, 'Bellek (RAM) — bu adımdaki değişkenler'), varsBox));
    for (const b of tabs.children) b.classList.remove('active');
    curTab = 'both';
    go(0);
  }

  return {
    el, run,
    getStdin: () => stdinTa.value,
    setStdin: v => { stdinTa.value = v ?? ''; },
    showTab,
    clear() { showOutput('', null, 0, []); errHolder.innerHTML = ''; stepperBar.style.display = 'none'; },
    last: () => last,
  };
}
