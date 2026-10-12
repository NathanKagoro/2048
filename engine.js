/*
 * 2048 game engine: pure game rules, no DOM.
 *
 * Works as a CommonJS module (node:test) and as a browser global
 * (window.Game2048Engine). Randomness is injected so tests are deterministic.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Game2048Engine = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const SIZE = 4;
  const WIN_VALUE = 2048;
  const DIRECTIONS = ['up', 'down', 'left', 'right'];
  const DIFFICULTIES = ['easy', 'medium', 'hard'];

  // Challenging / Extreme: probability that a spawn is doubled and,
  // independently, that an extra tile spawns. Checked highest threshold first
  // so the ladder actually escalates as the score grows.
  const LADDERS = {
    easy: [],
    medium: [[8192, 0.45], [4096, 0.4], [2048, 0.35], [1024, 0.3], [512, 0.25], [256, 0.2], [0, 0]],
    hard: [[8192, 0.6], [4096, 0.55], [2048, 0.5], [1024, 0.4], [512, 0.3], [256, 0.2], [0, 0.1]]
  };

  function pressure(difficulty, score) {
    const ladder = LADDERS[difficulty] || [];
    for (const [threshold, p] of ladder) {
      if (score >= threshold) return p;
    }
    return 0;
  }

  // Small seeded PRNG for tests and reproducible games.
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const idx = (r, c) => r * SIZE + c;

  // The cells visited for one line, ordered from the edge tiles slide towards.
  function lineCells(direction, line) {
    const cells = [];
    for (let k = 0; k < SIZE; k++) {
      if (direction === 'left') cells.push([line, k]);
      else if (direction === 'right') cells.push([line, SIZE - 1 - k]);
      else if (direction === 'up') cells.push([k, line]);
      else cells.push([SIZE - 1 - k, line]);
    }
    return cells;
  }

  function cloneCells(cells) {
    return cells.map((t) => (t ? { id: t.id, value: t.value } : null));
  }

  function snapshot(s) {
    return { cells: cloneCells(s.cells), score: s.score, nextId: s.nextId, won: s.won, keepPlaying: s.keepPlaying };
  }

  /**
   * createGame({ difficulty, rng, state })
   *   difficulty: 'easy' | 'medium' | 'hard'
   *   rng: () => number in [0, 1)  (defaults to Math.random)
   *   state: a value previously returned by game.serialize() to resume
   */
  function createGame(options = {}) {
    const rng = options.rng || Math.random;
    let s;

    function fresh(difficulty) {
      s = {
        difficulty: DIFFICULTIES.includes(difficulty) ? difficulty : 'easy',
        cells: new Array(SIZE * SIZE).fill(null),
        score: 0,
        nextId: 1,
        won: false,
        keepPlaying: false,
        prev: null
      };
      spawnOne(baseValue());
      spawnOne(baseValue());
    }

    function emptyIndices() {
      const out = [];
      s.cells.forEach((t, i) => { if (!t) out.push(i); });
      return out;
    }

    function baseValue() {
      return rng() < 0.9 ? 2 : 4;
    }

    // Picks uniformly among cells that are actually free; returns null if none.
    function spawnOne(value) {
      const free = emptyIndices();
      if (free.length === 0) return null;
      const i = free[Math.min(free.length - 1, Math.floor(rng() * free.length))];
      const tile = { id: s.nextId++, value };
      s.cells[i] = tile;
      return { id: tile.id, value, row: Math.floor(i / SIZE), col: i % SIZE };
    }

    function spawnAfterMove() {
      const p = pressure(s.difficulty, s.score);
      let value = baseValue();
      if (p > 0 && rng() < p) value *= 2;
      const extra = p > 0 && rng() < p;
      const spawned = [];
      const first = spawnOne(value);
      if (first) spawned.push(first);
      if (extra) {
        const second = spawnOne(value);
        if (second) spawned.push(second);
      }
      return spawned;
    }

    function tilesList() {
      const out = [];
      s.cells.forEach((t, i) => {
        if (t) out.push({ id: t.id, value: t.value, row: Math.floor(i / SIZE), col: i % SIZE });
      });
      return out;
    }

    function canMove() {
      for (let r = 0; r < SIZE; r++) {
        for (let c = 0; c < SIZE; c++) {
          const t = s.cells[idx(r, c)];
          if (!t) return true;
          if (c + 1 < SIZE) { const n = s.cells[idx(r, c + 1)]; if (n && n.value === t.value) return true; }
          if (r + 1 < SIZE) { const n = s.cells[idx(r + 1, c)]; if (n && n.value === t.value) return true; }
        }
      }
      return false;
    }

    function hasWon() {
      return s.cells.some((t) => t && t.value >= WIN_VALUE);
    }

    /**
     * Returns {
     *   moved, scoreGained,
     *   tiles:   every tile on the board afterwards (stable ids),
     *   moves:   [{ id, fromRow, fromCol, toRow, toCol }] for every pre-existing tile,
     *            including the two tiles consumed by each merge,
     *   merges:  [{ id, value, row, col, from: [idA, idB] }] (new tile id),
     *   spawned: [{ id, value, row, col }],
     *   won, over
     * }
     */
    function move(direction) {
      if (!DIRECTIONS.includes(direction)) throw new Error('Unknown direction: ' + direction);
      const before = snapshot(s);
      const next = new Array(SIZE * SIZE).fill(null);
      const moves = [];
      const merges = [];
      let gained = 0;
      let moved = false;

      for (let line = 0; line < SIZE; line++) {
        const cells = lineCells(direction, line);
        let target = 0;
        let lastFree = null; // the tile at target-1 that may still absorb one merge
        for (const [r, c] of cells) {
          const t = s.cells[idx(r, c)];
          if (!t) continue;
          if (lastFree && lastFree.value === t.value) {
            const [tr, tc] = lastFree.pos;
            const merged = { id: s.nextId++, value: t.value * 2 };
            next[idx(tr, tc)] = merged;
            moves.push({ id: t.id, fromRow: r, fromCol: c, toRow: tr, toCol: tc });
            merges.push({ id: merged.id, value: merged.value, row: tr, col: tc, from: [lastFree.id, t.id] });
            gained += merged.value;
            moved = true;
            lastFree = null; // a merged tile never merges again this move
            continue;
          }
          const [tr, tc] = cells[target];
          next[idx(tr, tc)] = { id: t.id, value: t.value };
          moves.push({ id: t.id, fromRow: r, fromCol: c, toRow: tr, toCol: tc });
          if (tr !== r || tc !== c) moved = true;
          lastFree = { id: t.id, value: t.value, pos: [tr, tc] };
          target++;
        }
      }

      if (!moved) {
        return { moved: false, scoreGained: 0, tiles: tilesList(), moves: [], merges: [], spawned: [], won: hasWon(), over: !canMove() };
      }

      s.prev = before;
      s.cells = next;
      s.score += gained;
      const spawned = spawnAfterMove();
      if (hasWon()) s.won = true;
      return { moved: true, scoreGained: gained, tiles: tilesList(), moves, merges, spawned, won: hasWon(), over: !canMove() };
    }

    function undo() {
      if (!s.prev) return false;
      const p = s.prev;
      s.cells = cloneCells(p.cells);
      s.score = p.score;
      s.nextId = Math.max(s.nextId, p.nextId); // never reuse ids the renderer has seen
      s.won = p.won;
      s.keepPlaying = p.keepPlaying;
      s.prev = null;
      return true;
    }

    function serialize() {
      return JSON.parse(JSON.stringify(s));
    }

    function load(state) {
      if (!state || !Array.isArray(state.cells) || state.cells.length !== SIZE * SIZE) return false;
      const cells = state.cells.map((t) => (t && t.value > 0 && Number.isFinite(t.id) ? { id: t.id, value: t.value } : null));
      const maxId = cells.reduce((m, t) => (t ? Math.max(m, t.id) : m), 0);
      s = {
        difficulty: DIFFICULTIES.includes(state.difficulty) ? state.difficulty : 'easy',
        cells,
        score: Number(state.score) || 0,
        nextId: Math.max(Number(state.nextId) || 1, maxId + 1),
        won: !!state.won,
        keepPlaying: !!state.keepPlaying,
        prev: state.prev && Array.isArray(state.prev.cells) && state.prev.cells.length === SIZE * SIZE ? state.prev : null
      };
      return true;
    }

    if (!(options.state && load(options.state))) fresh(options.difficulty);

    return {
      move,
      canMove,
      hasWon,
      undo,
      canUndo: () => !!s.prev,
      serialize,
      reset: (difficulty) => fresh(difficulty || s.difficulty),
      tiles: tilesList,
      get score() { return s.score; },
      get difficulty() { return s.difficulty; },
      get won() { return s.won; },
      get keepPlaying() { return s.keepPlaying; },
      continuePlaying() { s.keepPlaying = true; },
      // Test/debug helper: set the board from a 4x4 array of numbers (0 = empty).
      setGrid(grid) {
        s.cells = new Array(SIZE * SIZE).fill(null);
        grid.forEach((row, r) => row.forEach((v, c) => { if (v) s.cells[idx(r, c)] = { id: s.nextId++, value: v }; }));
        s.prev = null;
      },
      grid() {
        const out = [];
        for (let r = 0; r < SIZE; r++) out.push(s.cells.slice(r * SIZE, r * SIZE + SIZE).map((t) => (t ? t.value : 0)));
        return out;
      }
    };
  }

  return { createGame, mulberry32, pressure, SIZE, WIN_VALUE, DIRECTIONS, DIFFICULTIES };
});
