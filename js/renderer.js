// All canvas presentation lives here; this class never updates gameplay state.
const SPECTRUM = Object.freeze({
  BLACK: "#000000",
  BLUE: "#0000ff",
  RED: "#ff0000",
  MAGENTA: "#ff00ff",
  GREEN: "#00ff00",
  CYAN: "#00ffff",
  YELLOW: "#ffff00",
  WHITE: "#ffffff"
});

// Five-by-seven bitmap letters sit inside either 8x8 or compact 6px cells.
const PIXEL_GLYPHS = {
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00010", "00100", "01000", "11111"],
  "3": ["11110", "00001", "00001", "01110", "00001", "00001", "11110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "10000", "11110", "00001", "00001", "11110"],
  "6": ["01110", "10000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00001", "01110"],
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01111", "10000", "10000", "10000", "10000", "10000", "01111"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "10010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "10101", "01010"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "01010", "00100", "00100", "00100", "00100", "00100"]
};

class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.context = canvas.getContext("2d");
    this.playfieldWidth = 208;

    // Draw the full logical world first, then shrink into the side-panel layout.
    this.worldCanvas = document.createElement("canvas");
    this.worldCanvas.width = canvas.width;
    this.worldCanvas.height = canvas.height;
    this.worldContext = this.worldCanvas.getContext("2d");
    this.context.imageSmoothingEnabled = false;
    this.worldContext.imageSmoothingEnabled = false;

    // These local PNGs are the screens and sprite atlases requested for the port.
    this.screenSheet = new Image();
    this.spriteSheet = new Image();
    this.screenSheet.src = "assets/screens.png";
    this.spriteSheet.src = "assets/sprites.png";
  }

  drawPixelText(target, text, x, y, color, cellWidth = 8) {
    target.fillStyle = color;
    for (const character of text) {
      const glyph = PIXEL_GLYPHS[character];
      if (glyph) {
        for (let row = 0; row < glyph.length; row += 1) {
          for (let column = 0; column < glyph[row].length; column += 1) {
            if (glyph[row][column] === "1") {
              target.fillRect(x + column, y + row, 1, 1);
            }
          }
        }
      }
      x += cellWidth;
    }
  }

  drawPanelRule(context, y) {
    // A neat stepped divider keeps the narrow HUD sections visually aligned.
    context.fillStyle = SPECTRUM.GREEN;
    context.fillRect(214, y + 2, 36, 1);
    context.fillRect(212, y, 3, 2);
    context.fillRect(249, y, 3, 2);
    context.fillRect(220, y + 1, 2, 2);
    context.fillRect(242, y + 1, 2, 2);
  }

  drawPanelBomb(context, x, y) {
    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(x + 8, y, 5, 4);
    context.fillRect(x + 5, y + 4, 12, 4);
    context.fillRect(x + 2, y + 8, 18, 12);
    context.fillRect(x + 5, y + 19, 12, 4);
    context.fillRect(x - 1, y + 9, 3, 2);
    context.fillRect(x + 20, y + 5, 3, 2);
    context.fillRect(x + 19, y + 21, 3, 2);
    context.fillStyle = SPECTRUM.YELLOW;
    context.fillRect(x + 6, y + 9, 10, 9);
    context.fillRect(x + 8, y + 5, 6, 3);
    context.fillStyle = SPECTRUM.CYAN;
    context.fillRect(x + 7, y + 10, 2, 2);
  }

  drawHud(game) {
    const context = this.context;
    const scoreText = String(game.score.total).padStart(6, "0");

    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(this.playfieldWidth, 0, this.canvas.width - this.playfieldWidth, this.canvas.height);
    context.fillRect(this.playfieldWidth - 2, 0, 4, this.canvas.height);

    this.drawPanelRule(context, 4);
    this.drawPixelText(context, "PLAYER", 212, 12, SPECTRUM.WHITE, 6);
    this.drawPixelText(context, String(game.levelNumber), 238, 21, SPECTRUM.YELLOW, 6);
    this.drawPixelText(context, "SCORE", 212, 31, SPECTRUM.GREEN, 6);
    this.drawPixelText(context, scoreText, 212, 40, SPECTRUM.WHITE, 6);

    // Give the bomb readout its own black keyline and a clean yellow inset.
    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(210, 53, 46, 54);
    context.fillStyle = SPECTRUM.YELLOW;
    context.fillRect(211, 54, 44, 52);
    this.drawPixelText(context, "BOMB", 221, 58, SPECTRUM.BLACK, 6);
    if (this.spriteSheet.complete && this.spriteSheet.naturalWidth > 0) {
      const bombSprite = SPRITE_ATLAS.bomb.idle;
      context.drawImage(
        this.spriteSheet,
        bombSprite.x, bombSprite.y, bombSprite.width, bombSprite.height,
        226, 67, 14, 18
      );
    } else {
      this.drawPanelBomb(context, 222, 65);
    }
    this.drawPixelText(context, "LEFT", 214, 91, SPECTRUM.BLACK, 6);
    this.drawPixelText(context, String(game.bombs.length).padStart(2, "0"), 238, 91, SPECTRUM.BLACK, 6);

    this.drawPanelRule(context, 109);
    this.drawPixelText(context, "LIVES", 212, 118, SPECTRUM.GREEN, 6);
    this.drawPixelText(context, String(game.lives), 244, 118, SPECTRUM.WHITE, 6);
    this.drawPixelText(context, `X${game.score.multiplier}`, 212, 128, SPECTRUM.YELLOW, 6);
    this.drawPixelText(context, "POWER", 212, 137, SPECTRUM.CYAN, 6);
    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(212, 146, 40, 5);
    const filledCells = Math.floor(game.score.powerCharge);
    for (let cell = 0; cell < 10; cell += 1) {
      context.fillStyle = cell < filledCells ? SPECTRUM.YELLOW : SPECTRUM.GREEN;
      context.fillRect(213 + cell * 4, 147, 3, 3);
    }

    this.drawPanelRule(context, 155);
    this.drawPixelText(context, "JACK", 218, 162, SPECTRUM.YELLOW, 6);
    if (this.spriteSheet.complete && this.spriteSheet.naturalWidth > 0) {
      const playerSprite = SPRITE_ATLAS.player.idle;
      context.drawImage(
        this.spriteSheet,
        playerSprite.x, playerSprite.y, playerSprite.width, playerSprite.height,
        224, 170, 16, 15
      );
    }
    this.drawPanelRule(context, 186);
  }

  drawLevelComplete(context) {
    this.drawPixelText(context, "LEVEL COMPLETE", 72, 92, SPECTRUM.YELLOW, 8);
  }

  drawWorld(game) {
    const context = this.worldContext;
    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(0, 0, this.worldCanvas.width, this.worldCanvas.height);
    game.level.drawBackground(context, this.screenSheet);
    game.level.draw(context);

    for (const bomb of game.bombs) bomb.draw(context, this.spriteSheet);
    if (game.powerOrb) game.powerOrb.draw(context, this.spriteSheet);
    if (game.bonus) game.bonus.draw(context, this.spriteSheet);

    for (const enemy of game.enemies) {
      enemy.draw(context, this.spriteSheet, game.powerTimer > 0);
    }

    if (game.playerDying) {
      game.player.drawDeath(
        context,
        game.deathTimer / game.deathAnimationSeconds,
        this.spriteSheet
      );
    } else {
      game.player.draw(context, this.spriteSheet);
    }

    if (game.levelComplete) this.drawLevelComplete(context);
  }

  draw(game) {
    this.drawWorld(game);

    const context = this.context;
    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    context.drawImage(
      this.worldCanvas,
      0, 0, this.worldCanvas.width, this.worldCanvas.height,
      0, 0, this.playfieldWidth, this.canvas.height
    );
    this.drawHud(game);

    // Two-pixel black frame like a CRT-era game screen.
    context.fillStyle = SPECTRUM.BLACK;
    context.fillRect(0, 0, this.canvas.width, 2);
    context.fillRect(0, this.canvas.height - 2, this.canvas.width, 2);
    context.fillRect(0, 0, 2, this.canvas.height);
    context.fillRect(this.canvas.width - 2, 0, 2, this.canvas.height);
  }
}
