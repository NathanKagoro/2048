# 2048

The 2048 game on [nathankagoro.com](https://nathankagoro.com). Type `play 2048` in the terminal there, or play it on its own at [nathankagoro.github.io/2048](https://nathankagoro.github.io/2048/).

## Files

| File | What it is |
| --- | --- |
| `engine.js` | The game rules, with no DOM: moves, merges, scoring, spawning, win and game-over checks, undo, save/load. The random number generator can be injected, so tests are repeatable. |
| `ui.js` | The renderer: animated sliding tiles, keyboard (arrows / WASD, U to undo, N for a new game), swipe, difficulty picker, win and game-over dialogs. Exposes `Game2048UI.mount(element, { embedded })`. |
| `index.html` | The standalone page, used by GitHub Pages. |
| `tests/` | Engine tests (`npm test`, no dependencies). |

Difficulty: **Easy** is classic 2048. **Challenging** and **Extreme** sometimes spawn higher tiles or an extra tile, and the chance rises with your score.

Best score is kept in `localStorage` (`2048Highscore`) and a game in progress resumes (`2048State`).

## How it fits into the portfolio

[cmd-website](https://github.com/NathanKagoro/cmd-website) includes this repo as a git submodule at `games/2048`. Its `games/2048.js` loads `engine.js` and `ui.js` from there and mounts the game inside the terminal's overlay. After changing this repo, update the submodule in cmd-website:

```
git submodule update --remote games/2048
```

Keep script paths in `index.html` relative, so the page works both at `nathankagoro.com/games/2048/` and on GitHub Pages.

## History

The original coursework version (multi-page site with login, sign-up and a leaderboard) is preserved on the [`coursework-original`](https://github.com/NathanKagoro/2048/tree/coursework-original) branch.
