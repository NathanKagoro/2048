'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createGame, mulberry32, pressure } = require('../engine.js');

function gameWith(grid, opts = {}) {
  const g = createGame({ difficulty: opts.difficulty || 'easy', rng: opts.rng || mulberry32(opts.seed || 1) });
  g.setGrid(grid);
  return g;
}

// Removes spawned tiles from a grid so assertions only look at slide/merge results.
function withoutSpawns(g, res) {
  const grid = g.grid();
  for (const s of res.spawned) grid[s.row][s.col] = 0;
  return grid;
}

const E = [0, 0, 0, 0];

test('[2,2,2,2] left -> [4,4,0,0]', () => {
  const g = gameWith([[2, 2, 2, 2], E, E, E]);
  const res = g.move('left');
  assert.deepEqual(withoutSpawns(g, res)[0], [4, 4, 0, 0]);
  assert.equal(res.scoreGained, 8);
  assert.equal(res.merges.length, 2);
});

test('[4,4,8] left -> [8,8] (no double merge)', () => {
  const g = gameWith([[4, 4, 8, 0], E, E, E]);
  const res = g.move('left');
  assert.deepEqual(withoutSpawns(g, res)[0], [8, 8, 0, 0]);
  assert.equal(res.scoreGained, 8);
});

test('[2,2,4] left -> [4,4]', () => {
  const g = gameWith([[2, 2, 4, 0], E, E, E]);
  const res = g.move('left');
  assert.deepEqual(withoutSpawns(g, res)[0], [4, 4, 0, 0]);
});

test('moves in all four directions', () => {
  const start = [
    [2, 0, 0, 2],
    [0, 4, 0, 0],
    [0, 0, 0, 0],
    [8, 0, 0, 8]
  ];
  const expected = {
    left: [[4, 0, 0, 0], [4, 0, 0, 0], [0, 0, 0, 0], [16, 0, 0, 0]],
    right: [[0, 0, 0, 4], [0, 0, 0, 4], [0, 0, 0, 0], [0, 0, 0, 16]],
    up: [[2, 4, 0, 2], [8, 0, 0, 8], [0, 0, 0, 0], [0, 0, 0, 0]],
    down: [[0, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 2], [8, 4, 0, 8]]
  };
  for (const dir of Object.keys(expected)) {
    const g = gameWith(start);
    const res = g.move(dir);
    assert.equal(res.moved, true, dir);
    assert.deepEqual(withoutSpawns(g, res), expected[dir], dir);
  }
});

test('merge priority follows direction: [2,2,2,0] right -> [0,0,2,4]', () => {
  const g = gameWith([[2, 2, 2, 0], E, E, E]);
  const res = g.move('right');
  assert.deepEqual(withoutSpawns(g, res)[0], [0, 0, 2, 4]);
});

test('no-op move does not spawn or change score', () => {
  const g = gameWith([[2, 4, 0, 0], [4, 2, 0, 0], E, E]);
  const before = g.grid();
  const res = g.move('left');
  assert.equal(res.moved, false);
  assert.equal(res.spawned.length, 0);
  assert.deepEqual(g.grid(), before);
  assert.equal(g.score, 0);
  assert.equal(g.canUndo(), false);
});

test('full board with an adjacent pair is NOT game over and the move continues (bug #1)', () => {
  const g = gameWith([
    [2, 2, 4, 8],
    [4, 8, 16, 32],
    [8, 16, 32, 64],
    [16, 32, 64, 128]
  ]);
  assert.equal(g.canMove(), true);
  const res = g.move('left');
  assert.equal(res.moved, true);
  assert.equal(res.scoreGained, 4);
  assert.equal(res.spawned.length, 1);
  assert.deepEqual(res.spawned[0].row, 0);
  assert.deepEqual(res.spawned[0].col, 3);
  assert.deepEqual(g.grid()[0].slice(0, 3), [4, 4, 8]);
});

test('full board with no merges IS game over', () => {
  const g = gameWith([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  ]);
  assert.equal(g.canMove(), false);
  for (const d of ['up', 'down', 'left', 'right']) assert.equal(g.move(d).moved, false);
});

test('vertical pair on a full board keeps the game alive', () => {
  const g = gameWith([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [2, 8, 16, 32]
  ]);
  assert.equal(g.canMove(), true);
  assert.equal(g.move('left').moved, false);
  assert.equal(g.move('up').moved, true);
});

test('win detection at 2048', () => {
  const g = gameWith([[1024, 1024, 0, 0], E, E, E]);
  assert.equal(g.hasWon(), false);
  const res = g.move('left');
  assert.equal(res.won, true);
  assert.equal(g.hasWon(), true);
  assert.equal(g.won, true);
  assert.equal(res.scoreGained, 2048);
});

test('score accumulates merged tile values', () => {
  const g = gameWith([[2, 2, 4, 4], [8, 8, 0, 0], E, E]);
  const res = g.move('left');
  assert.equal(res.scoreGained, 4 + 8 + 16);
  assert.equal(g.score, 28);
});

test('tile ids are stable across slides; merges produce new ids', () => {
  const g = gameWith([[0, 0, 0, 2], [0, 0, 4, 4], E, E]);
  const ids = new Map(g.tiles().map((t) => [`${t.row},${t.col}`, t.id]));
  const res = g.move('left');
  const slid = res.tiles.find((t) => t.row === 0 && t.col === 0);
  assert.equal(slid.id, ids.get('0,3'));
  const m = res.merges[0];
  assert.deepEqual(m.from.sort(), [ids.get('1,2'), ids.get('1,3')].sort());
  assert.ok(!m.from.includes(m.id));
  assert.equal(res.moves.length, 3);
});

test('spawns only into empty cells with a seeded RNG', () => {
  for (let seed = 1; seed <= 200; seed++) {
    const g = gameWith([[2, 0, 4, 0], [0, 8, 0, 16], [32, 0, 64, 0], [0, 128, 0, 0]], { seed });
    for (const dir of ['left', 'up', 'right', 'down']) {
      const res = g.move(dir);
      if (!res.moved) continue;
      const tileCount = res.moves.length - res.merges.length; // surviving pre-move tiles
      assert.equal(res.tiles.length, tileCount + res.spawned.length, 'spawn did not overwrite a tile');
      for (const s of res.spawned) {
        // the cell must be free after the slide: no slid/merged tile landed there
        assert.ok(!res.moves.some((m) => m.toRow === s.row && m.toCol === s.col));
        assert.ok([2, 4].includes(s.value));
      }
    }
  }
});

test('seeded RNG makes games reproducible', () => {
  const play = () => {
    const g = createGame({ difficulty: 'hard', rng: mulberry32(42) });
    const dirs = ['left', 'up', 'right', 'down'];
    for (let i = 0; i < 200; i++) g.move(dirs[i % 4]);
    return JSON.stringify(g.serialize());
  };
  assert.equal(play(), play());
});

test('easy spawns 2 at ~90% and 4 at ~10%, one tile per move', () => {
  const rng = mulberry32(7);
  let twos = 0, fours = 0;
  for (let i = 0; i < 2000; i++) {
    const g = createGame({ difficulty: 'easy', rng });
    g.setGrid([[2, 0, 0, 0], E, E, E]);
    const res = g.move('right');
    assert.equal(res.spawned.length, 1);
    if (res.spawned[0].value === 2) twos++; else fours++;
  }
  const ratio = twos / (twos + fours);
  assert.ok(ratio > 0.86 && ratio < 0.94, `ratio ${ratio}`);
});

test('difficulty ladder escalates with score (highest threshold first)', () => {
  assert.equal(pressure('easy', 100000), 0);
  assert.ok(pressure('medium', 0) < pressure('medium', 300));
  assert.ok(pressure('medium', 300) < pressure('medium', 600));
  assert.ok(pressure('medium', 600) < pressure('medium', 10000));
  assert.ok(pressure('hard', 0) > 0);
  assert.ok(pressure('hard', 300) < pressure('hard', 5000));
  assert.ok(pressure('hard', 5000) < pressure('hard', 10000));
});

test('Extreme with one free cell never crashes and fills only that cell', () => {
  // always-low rng => doubled value and the extra spawn are both requested
  const g = createGame({ difficulty: 'hard', rng: () => 0 });
  g.setGrid([
    [2, 2, 4, 8],
    [4, 8, 16, 32],
    [8, 16, 32, 64],
    [16, 32, 64, 128]
  ]);
  const res = g.move('left');
  assert.equal(res.moved, true);
  assert.equal(res.spawned.length, 1, 'second spawn skipped: no free cell');
  assert.equal(g.tiles().length, 16);
});

test('Extreme long random game never throws', () => {
  for (let seed = 1; seed <= 50; seed++) {
    const rng = mulberry32(seed);
    const g = createGame({ difficulty: 'hard', rng });
    let guard = 0;
    while (g.canMove() && guard++ < 5000) {
      g.move(['left', 'up', 'right', 'down'][Math.floor(rng() * 4)]);
    }
    assert.equal(g.canMove(), false);
  }
});

test('undo restores the previous board and score once', () => {
  const g = gameWith([[2, 2, 0, 0], E, E, E]);
  const before = g.grid();
  g.move('left');
  assert.equal(g.canUndo(), true);
  assert.equal(g.undo(), true);
  assert.deepEqual(g.grid(), before);
  assert.equal(g.score, 0);
  assert.equal(g.undo(), false);
});

test('serialize / restore resumes the same game', () => {
  const g = createGame({ difficulty: 'medium', rng: mulberry32(3) });
  g.move('left'); g.move('up');
  const saved = JSON.parse(JSON.stringify(g.serialize()));
  const h = createGame({ state: saved, rng: mulberry32(3) });
  assert.deepEqual(h.grid(), g.grid());
  assert.equal(h.score, g.score);
  assert.equal(h.difficulty, 'medium');
  assert.equal(h.canUndo(), true);
});

test('corrupt saved state falls back to a fresh game', () => {
  const g = createGame({ state: { cells: [1, 2] }, difficulty: 'easy' });
  assert.equal(g.tiles().length, 2);
});
