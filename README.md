# Bomb Jack (Canvas Edition)

A single-screen, pixel-art browser game built with HTML, CSS, vanilla JavaScript,
and the Canvas 2D API. Open `index.html` directly in a modern browser; no build
step or package installation is needed.

## Structure

- `js/game.js` coordinates gameplay state, bomb chains, scoring, lives, and level changes.
- `js/level.js` stores level geometry as data and draws the original Canvas backdrop.
- `js/player.js`, `js/enemy.js`, `js/bomb.js`, `js/power-orb.js`, and `js/bonus.js`
  contain individual game entities.
- `js/score.js` owns score multipliers, bomb power charge, and enemy-chain scoring.
- `js/renderer.js` handles the Canvas display, pixel font, and side panel.
- `js/sprite-atlas.js` maps the local sprite sheet to animated game sprites.
- `js/input.js` tracks keyboard state and one-frame key presses.

The game structure and classic gameplay conventions were informed by
[`feltz/bombjack`](https://github.com/feltz/bombjack), a Lua/Love2D project.
The five environment screens and animated sprite frames are loaded from the
repository's `graphics/screens.png` and `graphics/sprites.png`, respectively.
Gameplay and rendering remain vanilla JavaScript and Canvas; the Lua/Love2D
runtime and soundtrack are not required.
