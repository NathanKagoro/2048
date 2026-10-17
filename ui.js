/*
 * 2048 renderer. Mounts a self-contained game into any element:
 *   Game2048UI.mount(container, { embedded: true }) -> { destroy() }
 * Needs Game2048Engine (engine.js) to be loaded first.
 */
(function () {
  'use strict';

  const STATE_KEY = '2048State';
  const BEST_KEY = '2048Highscore'; // same key as the original game so best scores carry over
  const SLIDE_MS = 100;
  const SWIPE_MIN = 30;
  const KEYS = {
    ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
    w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right'
  };
  const LEVELS = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Challenging' },
    { value: 'hard', label: 'Extreme' }
  ];

  const CSS = `
.g2048{--g-green:#00ff66;--g-dim:#0b8f43;--g-bg:#000;--g-board:#2b2620;--g-cell:#3a332b;--g-gap:12px;--g-radius:6px;
  --g-slide:${SLIDE_MS}ms;width:min(480px,90vw,100%);margin:0 auto;color:var(--g-green);
  font-family:'Consolas','Courier New',monospace;box-sizing:border-box;user-select:none;-webkit-user-select:none;outline:none}
.g2048 *,.g2048 *::before,.g2048 *::after{box-sizing:border-box}
.g2048-title{display:flex;align-items:baseline;justify-content:space-between;gap:12px;margin:0 0 12px}
.g2048-title h2{margin:0;font-size:clamp(28px,8vw,40px);letter-spacing:.04em}
.g2048-hint{font-size:12px;color:var(--g-dim);text-align:right}
.g2048-levels{display:flex;border:1px solid var(--g-green);border-radius:4px;overflow:hidden;margin-bottom:12px}
.g2048-levels button{flex:1;min-width:0;padding:8px 4px;background:transparent;color:var(--g-green);border:0;
  border-left:1px solid var(--g-green);font:inherit;font-size:14px;cursor:pointer;white-space:nowrap}
.g2048-levels button:first-child{border-left:0}
.g2048-levels button[aria-pressed="true"]{background:var(--g-green);color:#000;font-weight:bold}
.g2048-levels button:focus-visible,.g2048-btn:focus-visible{outline:2px solid #fff;outline-offset:2px}
.g2048-bar{display:flex;gap:8px;align-items:stretch;margin-bottom:12px}
.g2048-stat{position:relative;flex:1;min-width:0;border:1px solid var(--g-green);border-radius:4px;padding:4px 8px;text-align:center}
.g2048-stat span{display:block;font-size:11px;letter-spacing:.1em;color:var(--g-dim);text-transform:uppercase}
.g2048-stat b{display:block;font-size:20px;line-height:1.2;overflow:hidden;text-overflow:ellipsis}
.g2048-plus{position:absolute;left:0;right:0;top:50%;font-weight:bold;pointer-events:none;
  animation:g2048-float 700ms ease-out forwards}
.g2048-btn{padding:6px 10px;background:transparent;color:var(--g-green);border:1px solid var(--g-green);border-radius:4px;
  font:inherit;font-size:14px;cursor:pointer;white-space:nowrap}
.g2048-btn:hover:not(:disabled){background:var(--g-green);color:#000}
.g2048-btn:disabled{opacity:.35;cursor:default}
.g2048-board{position:relative;width:100%;aspect-ratio:1/1;background:var(--g-board);border-radius:var(--g-radius);
  touch-action:none;container-type:inline-size;overflow:hidden}
.g2048-cell,.g2048-tile{position:absolute;left:var(--g-gap);top:var(--g-gap);
  width:calc((100% - 5 * var(--g-gap)) / 4);height:calc((100% - 5 * var(--g-gap)) / 4);
  transform:translate(calc(var(--c) * (100% + var(--g-gap))),calc(var(--r) * (100% + var(--g-gap))))}
.g2048-cell{background:var(--g-cell);border-radius:calc(var(--g-radius) - 2px)}
.g2048-tile{z-index:2;transition:transform var(--g-slide) ease-in-out;will-change:transform}
.g2048-tile.is-gone{z-index:1}
.g2048-inner{width:100%;height:100%;display:flex;align-items:center;justify-content:center;border-radius:calc(var(--g-radius) - 2px);
  font-weight:bold;font-size:12cqw;line-height:1;background:#eee4da;color:#776e65}
.g2048-tile.d3 .g2048-inner{font-size:9.5cqw}.g2048-tile.d4 .g2048-inner{font-size:7.5cqw}.g2048-tile.d5 .g2048-inner{font-size:6cqw}
.g2048-tile.is-new .g2048-inner{animation:g2048-appear 140ms ease-out both}
.g2048-tile.is-merged .g2048-inner{animation:g2048-pop 160ms ease-in-out both}
.g2048-tile.v4 .g2048-inner{background:#ede0c8}
.g2048-tile.v8 .g2048-inner{background:#f2b179;color:#f9f6f2}
.g2048-tile.v16 .g2048-inner{background:#f59563;color:#f9f6f2}
.g2048-tile.v32 .g2048-inner{background:#f67c5f;color:#f9f6f2}
.g2048-tile.v64 .g2048-inner{background:#f65e3b;color:#f9f6f2}
.g2048-tile.v128 .g2048-inner{background:#edcf72;color:#f9f6f2;box-shadow:0 0 12px 2px rgba(243,215,116,.25)}
.g2048-tile.v256 .g2048-inner{background:#edcc61;color:#f9f6f2;box-shadow:0 0 14px 3px rgba(243,215,116,.32)}
.g2048-tile.v512 .g2048-inner{background:#edc850;color:#f9f6f2;box-shadow:0 0 16px 4px rgba(243,215,116,.4)}
.g2048-tile.v1024 .g2048-inner{background:#edc53f;color:#f9f6f2;box-shadow:0 0 18px 5px rgba(243,215,116,.48)}
.g2048-tile.v2048 .g2048-inner{background:#edc22e;color:#f9f6f2;box-shadow:0 0 22px 6px rgba(243,215,116,.56)}
.g2048-tile.vbig .g2048-inner{background:#00ff66;color:#000;box-shadow:0 0 22px 6px rgba(0,255,102,.35)}
.g2048-msg{position:absolute;inset:0;z-index:5;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;
  background:rgba(0,0,0,.72);text-align:center;padding:16px;animation:g2048-fade 300ms ease-out both}
.g2048-msg[hidden]{display:none}
.g2048-msg p{margin:0;font-size:clamp(26px,9cqw,44px);font-weight:bold}
.g2048-msg small{font-size:14px;color:#cfe}
.g2048-msg.is-win p{color:#edc22e}
.g2048-msg div{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}
.g2048-msg .g2048-btn{background:#000;font-size:16px;padding:8px 14px}
.g2048-foot{margin-top:10px;font-size:12px;color:var(--g-dim);text-align:center}
@keyframes g2048-appear{from{opacity:0;transform:scale(.4)}to{opacity:1;transform:scale(1)}}
@keyframes g2048-pop{0%{transform:scale(1)}50%{transform:scale(1.18)}100%{transform:scale(1)}}
@keyframes g2048-fade{from{opacity:0}to{opacity:1}}
@keyframes g2048-float{from{opacity:1;transform:translateY(-50%)}to{opacity:0;transform:translateY(-220%)}}
@media (max-width:420px){.g2048{--g-gap:8px}.g2048-stat b{font-size:17px}.g2048-btn{padding:6px 8px;font-size:13px}.g2048-levels button{font-size:13px}}
@media (prefers-reduced-motion:reduce){
  .g2048-tile{transition:none}
  .g2048-tile .g2048-inner,.g2048-msg,.g2048-plus{animation:none!important}
  .g2048-plus{display:none}
}`;

  function injectStyle() {
    if (document.getElementById('g2048-style')) return;
    const style = document.createElement('style');
    style.id = 'g2048-style';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  function readJSON(key) {
    try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* storage full or blocked */ }
  }

  function mount(container, options = {}) {
    const Engine = window.Game2048Engine;
    if (!Engine) throw new Error('Game2048Engine not loaded');
    injectStyle();

    const reduceMotion = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    let best = parseInt(localStorage.getItem(BEST_KEY), 10) || 0;
    const saved = readJSON(STATE_KEY);
    const game = Engine.createGame({ state: saved, difficulty: 'easy' });

    const root = document.createElement('div');
    root.className = 'g2048';
    root.tabIndex = -1;
    root.innerHTML = `
      <div class="g2048-title"><h2>2048</h2><div class="g2048-hint">Arrows / WASD / swipe<br>Join tiles to reach 2048</div></div>
      <div class="g2048-levels" role="group" aria-label="Difficulty">
        ${LEVELS.map((l) => `<button type="button" data-level="${l.value}" aria-pressed="false">${l.label}</button>`).join('')}
      </div>
      <div class="g2048-bar">
        <div class="g2048-stat"><span>Score</span><b data-score>0</b></div>
        <div class="g2048-stat"><span>Best</span><b data-best>0</b></div>
        <button type="button" class="g2048-btn" data-undo title="Undo last move (U)">Undo</button>
        <button type="button" class="g2048-btn" data-new title="Start a new game (N)">New</button>
      </div>
      <div class="g2048-board" aria-label="2048 board" role="application">
        <div class="g2048-msg" data-msg hidden></div>
      </div>
      <div class="g2048-foot" data-status aria-live="polite"></div>`;

    const board = root.querySelector('.g2048-board');
    const msg = root.querySelector('[data-msg]');
    const scoreEl = root.querySelector('[data-score]');
    const bestEl = root.querySelector('[data-best]');
    const undoBtn = root.querySelector('[data-undo]');
    const statusEl = root.querySelector('[data-status]');
    const levelBtns = Array.from(root.querySelectorAll('[data-level]'));

    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        const cell = document.createElement('div');
        cell.className = 'g2048-cell';
        cell.style.setProperty('--r', r);
        cell.style.setProperty('--c', c);
        board.insertBefore(cell, msg);
      }
    }

    container.appendChild(root);

    // ---- tile elements (keyed by engine tile id) ----
    const tileEls = new Map();
    let pending = null; // { timer, finish } while a slide is animating

    function setPos(el, r, c) {
      el.style.setProperty('--r', r);
      el.style.setProperty('--c', c);
    }

    function makeTile(t, cls) {
      const el = document.createElement('div');
      const digits = String(t.value).length;
      el.className = `g2048-tile ${t.value > 2048 ? 'vbig' : 'v' + t.value} d${Math.min(digits, 5)}${cls ? ' ' + cls : ''}`;
      const inner = document.createElement('div');
      inner.className = 'g2048-inner';
      inner.textContent = t.value;
      el.appendChild(inner);
      setPos(el, t.row, t.col);
      board.insertBefore(el, msg);
      tileEls.set(t.id, el);
      return el;
    }

    function rebuild(animateNew) {
      finishPending();
      tileEls.forEach((el) => el.remove());
      tileEls.clear();
      game.tiles().forEach((t) => makeTile(t, animateNew ? 'is-new' : ''));
    }

    function finishPending() {
      if (!pending) return;
      const p = pending;
      pending = null;
      clearTimeout(p.timer);
      board.removeEventListener('transitionend', p.onEnd);
      p.finish();
    }

    function renderMove(res) {
      finishPending();
      const consumed = new Set();
      res.merges.forEach((m) => m.from.forEach((id) => consumed.add(id)));
      res.moves.forEach((m) => {
        const el = tileEls.get(m.id);
        if (!el) return;
        el.classList.remove('is-new', 'is-merged');
        if (consumed.has(m.id)) el.classList.add('is-gone');
        setPos(el, m.toRow, m.toCol);
      });

      const finish = () => {
        consumed.forEach((id) => {
          const el = tileEls.get(id);
          if (el) el.remove();
          tileEls.delete(id);
        });
        res.merges.forEach((m) => makeTile(m, 'is-merged'));
        res.spawned.forEach((s) => makeTile(s, 'is-new'));
      };

      if (reduceMotion.matches) { finish(); return; }

      // Complete when the slide transition ends; the timer is a safety net
      // (e.g. background tabs where transitionend never fires).
      let remaining = res.moves.filter((m) => m.fromRow !== m.toRow || m.fromCol !== m.toCol).length;
      const onEnd = (e) => {
        if (e.propertyName !== 'transform' || !e.target.classList.contains('g2048-tile')) return;
        if (--remaining <= 0) finishPending();
      };
      board.addEventListener('transitionend', onEnd);
      pending = { finish, onEnd, timer: setTimeout(finishPending, SLIDE_MS + 60) };
    }

    // ---- HUD ----
    function showGain(n) {
      if (!n || reduceMotion.matches) return;
      const plus = document.createElement('div');
      plus.className = 'g2048-plus';
      plus.textContent = '+' + n;
      scoreEl.parentNode.appendChild(plus);
      plus.addEventListener('animationend', () => plus.remove());
      setTimeout(() => plus.remove(), 1000);
    }

    function updateHud() {
      if (game.score > best) {
        best = game.score;
        write(BEST_KEY, String(best));
      }
      scoreEl.textContent = game.score;
      bestEl.textContent = best;
      undoBtn.disabled = !game.canUndo();
      levelBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.level === game.difficulty)));
    }

    function showMessage(kind) {
      if (!kind) { msg.hidden = true; msg.innerHTML = ''; msg.className = 'g2048-msg'; return; }
      msg.className = 'g2048-msg ' + (kind === 'win' ? 'is-win' : 'is-over');
      msg.innerHTML = kind === 'win'
        ? '<p>You win</p><small>You made 2048.</small><div><button type="button" class="g2048-btn" data-keep>Keep going</button><button type="button" class="g2048-btn" data-retry>New game</button></div>'
        : `<p>Game over</p><small>Score ${game.score}</small><div><button type="button" class="g2048-btn" data-retry>Try again</button>${game.canUndo() ? '<button type="button" class="g2048-btn" data-msg-undo>Undo</button>' : ''}</div>`;
      msg.hidden = false;
      statusEl.textContent = kind === 'win' ? 'You reached 2048.' : 'No moves left.';
    }

    function refreshMessage() {
      statusEl.textContent = '';
      if (game.hasWon() && !game.keepPlaying) showMessage('win');
      else if (!game.canMove()) showMessage('over');
      else showMessage(null);
    }

    function save() {
      write(STATE_KEY, JSON.stringify(game.serialize()));
    }

    // ---- actions ----
    function doMove(dir) {
      if (!msg.hidden) return; // a dialog is up; use its buttons
      const res = game.move(dir);
      if (!res.moved) return;
      renderMove(res);
      showGain(res.scoreGained);
      updateHud();
      save();
      refreshMessage();
    }

    function newGame(level) {
      game.reset(level);
      rebuild(true);
      updateHud();
      save();
      refreshMessage();
    }

    function undo() {
      if (!game.undo()) return;
      rebuild(false);
      updateHud();
      save();
      refreshMessage();
    }

    root.addEventListener('click', (e) => {
      const t = e.target.closest('button');
      if (!t || !root.contains(t)) return;
      if (t.dataset.level) newGame(t.dataset.level);
      else if (t.hasAttribute('data-new') || t.hasAttribute('data-retry')) newGame();
      else if (t.hasAttribute('data-undo') || t.hasAttribute('data-msg-undo')) undo();
      else if (t.hasAttribute('data-keep')) { game.continuePlaying(); save(); refreshMessage(); }
      root.focus({ preventScroll: true });
    });

    // ---- keyboard ----
    function isActive() {
      return root.isConnected && !root.closest('.hidden');
    }

    function onKeyDown(e) {
      if (!isActive() || e.ctrlKey || e.metaKey || e.altKey) return;
      const tag = e.target && e.target.tagName;
      const inOtherField = (tag === 'INPUT' || tag === 'TEXTAREA') && e.target.id !== 'command-input';
      if (inOtherField) return;
      const dir = KEYS[e.key];
      let handled = true;
      if (dir) doMove(dir);
      else if (e.key === 'u' || e.key === 'U' || (e.key === 'z' && !e.shiftKey)) undo();
      else if (e.key === 'n' || e.key === 'N') newGame();
      else handled = false;
      if (handled) {
        // Keep arrows from scrolling the page/overlay and from reaching the
        // terminal's command history handler underneath.
        e.preventDefault();
        e.stopPropagation();
      }
    }
    window.addEventListener('keydown', onKeyDown, true);

    // The terminal focuses its (now covered) command input after every command;
    // on phones that pops up the keyboard over the board, so hand focus back.
    function onFocusIn(e) {
      if (options.embedded && isActive() && e.target && e.target.id === 'command-input') {
        e.target.blur();
        root.focus({ preventScroll: true });
      }
    }
    document.addEventListener('focusin', onFocusIn);

    // ---- swipe (pointer events) ----
    let start = null;
    function onPointerDown(e) {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      if (e.target.closest('button')) return;
      start = { x: e.clientX, y: e.clientY, id: e.pointerId };
      try { board.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
    }
    function onPointerUp(e) {
      if (!start || e.pointerId !== start.id) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_MIN) return;
      if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
      else doMove(dy > 0 ? 'down' : 'up');
    }
    function onPointerCancel() { start = null; }
    board.addEventListener('pointerdown', onPointerDown);
    board.addEventListener('pointerup', onPointerUp);
    board.addEventListener('pointercancel', onPointerCancel);

    // ---- lifecycle: tear down when the overlay is closed or replaced ----
    let observer = null;
    function destroy() {
      if (pending) { clearTimeout(pending.timer); pending = null; }
      window.removeEventListener('keydown', onKeyDown, true);
      document.removeEventListener('focusin', onFocusIn);
      if (observer) observer.disconnect();
      observer = null;
      save();
      if (root.isConnected && options.removeOnDestroy !== false) root.remove();
    }
    if (typeof MutationObserver !== 'undefined') {
      observer = new MutationObserver(() => { if (!isActive()) destroy(); });
      observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    }

    rebuild(!saved);
    updateHud();
    if (!saved) save();
    refreshMessage();

    if (options.embedded) {
      // The terminal re-focuses its command input after a command finishes;
      // move focus to the game so mobile keyboards don't cover the board.
      setTimeout(() => {
        const a = document.activeElement;
        if (a && a.id === 'command-input') a.blur();
        if (isActive()) root.focus({ preventScroll: true });
      }, 0);
    } else {
      root.focus({ preventScroll: true });
    }

    return { destroy, game };
  }

  window.Game2048UI = { mount };
})();
