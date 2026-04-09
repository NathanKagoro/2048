# 2048 Game Website

This is a simple web project for a 2048 game with a shared layout and leaderboard.

## Structure

- `game/` contains the main game page and game logic.
- `leaderboard/` contains the leaderboard page and script.
- `shared/` contains shared JavaScript and CSS used by multiple pages.
- `difficulty/`, `entry/`, `login/`, and `signup/` contain pages for navigation and account flow.

## How to run

1. Open a terminal in this folder.
2. Start a local server, for example:
   - `python -m http.server 8000`
3. Open a browser and go to:
   - `http://localhost:8000/entry/2048 entry.html`

## Notes

- The pages use shared layout code for header and footer.
- The game uses local storage for highscores and session data.
- Use the browser console to check for loading issues if a page does not appear correctly.
