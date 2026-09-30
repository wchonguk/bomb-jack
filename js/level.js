// The complete first stage is described as data, separate from its renderer.
// Platform and bomb coordinates use the canvas's 256x192 logical pixel space.
const LEVEL_DATA = {
  playerStart: { x: 116, y: 164 },

  // One ground strip and seven staggered platforms form an uneven climb with
  // broad gaps through the middle for high jumps and mid-air movement.
  platforms: [
    { x: 0, y: 180, width: 256, color: "#00ffff" },
    { x: 12, y: 150, width: 72, color: "#ffff00" },
    { x: 168, y: 151, width: 76, color: "#ff00ff" },
    { x: 48, y: 119, width: 75, color: "#00ff00" },
    { x: 139, y: 125, width: 100, color: "#00ffff" },
    { x: 12, y: 83, width: 66, color: "#ff00ff" },
    { x: 88, y: 75, width: 72, color: "#ffff00" },
    { x: 184, y: 91, width: 62, color: "#00ff00" }
  ],

  // Bomb positions are the top-left pixel of each 8x8 collectible.
  bombPositions: [
    { x: 24, y: 172 }, { x: 72, y: 172 }, { x: 184, y: 172 }, { x: 232, y: 172 },
    { x: 20, y: 142 }, { x: 64, y: 142 },
    { x: 176, y: 143 }, { x: 228, y: 143 },
    { x: 54, y: 111 }, { x: 82, y: 111 }, { x: 108, y: 111 },
    { x: 147, y: 117 }, { x: 184, y: 117 }, { x: 222, y: 117 },
    { x: 20, y: 75 }, { x: 58, y: 75 },
    { x: 102, y: 67 }, { x: 142, y: 67 },
    { x: 190, y: 83 }, { x: 230, y: 83 }
  ],

  enemyPositions: [
    { x: 220, y: 164 }
  ]
};

class Level {
  constructor(levelNumber = 1) {
    this.levelNumber = levelNumber;
    const variation = (levelNumber - 1) % 5;
    const mirrored = variation === 1 || variation === 3 || variation === 4;
    const verticalOffsets = variation === 2
      ? [0, -3, 3, -2, 2, -4, 3, 0]
      : variation === 3
        ? [0, 2, -3, 3, -2, 2, -4, 0]
        : variation === 4
          ? [0, -2, 2, 4, -4, 3, -3, 0]
          : [0, 0, 0, 0, 0, 0, 0, 0];
    const platformColors = ["#ffff00", "#00ff00", "#00ffff", "#ff00ff"];

    // Give gameplay its own copies, while keeping the source layout unchanged.
    this.playerStart = {
      x: mirrored ? 256 - LEVEL_DATA.playerStart.x - 16 : LEVEL_DATA.playerStart.x,
      y: LEVEL_DATA.playerStart.y
    };
    this.platforms = LEVEL_DATA.platforms.map((platform, index) => ({
      ...platform,
      x: mirrored ? 256 - platform.x - platform.width : platform.x,
      y: platform.y + verticalOffsets[index],
      color: index === 0
        ? platform.color
        : platformColors[(index - 1 + variation) % platformColors.length]
    }));
    this.bombPositions = LEVEL_DATA.bombPositions.map((position) => {
      const platformIndex = LEVEL_DATA.platforms.findIndex(
        (platform) => position.y === platform.y - 8
      );
      const platform = this.platforms[platformIndex];
      return {
        x: mirrored ? 256 - position.x - 8 : position.x,
        y: platform ? platform.y - 8 : position.y
      };
    });
    this.enemyPositions = LEVEL_DATA.enemyPositions.map((position) => ({
      x: mirrored ? 256 - position.x - 16 : position.x,
      y: this.platforms[0].y - 16
    }));
  }

  drawBackground(context, screenSheet) {
    // The supplied screen atlas contains five 224x224 environment panels.
    if (screenSheet && screenSheet.complete && screenSheet.naturalWidth > 0) {
      const panelWidth = screenSheet.naturalWidth / 5;
      const panelIndex = (this.levelNumber - 1) % 5;
      context.drawImage(
        screenSheet,
        panelIndex * panelWidth, 0, panelWidth, screenSheet.naturalHeight,
        0, 0, 256, 192
      );
      return;
    }

    // Spectrum-cyan sky and a stepped black/yellow Egyptian arcade mural.
    context.fillStyle = "#00ffff";
    context.fillRect(0, 0, 256, 192);

    const apexX = 76;
    const apexY = 72;
    const baseY = 190;

    // Build the pyramid as chunky four-pixel steps, not a smoothed triangle.
    for (let y = apexY; y < baseY; y += 4) {
      const progress = (y - apexY) / (baseY - apexY);
      const left = Math.max(0, apexX - Math.floor(apexX * progress));
      const right = Math.min(166, apexX + Math.floor(90 * progress));

      context.fillStyle = "#000000";
      context.fillRect(left, y, right - left, 4);
      if (right - left > 8) {
        context.fillStyle = "#ffff00";
        context.fillRect(left + 2, y + 1, right - left - 4, 2);
      }
    }

    // Broken masonry lines and little dither blocks give the face stone texture.
    for (let row = 0; row < 13; row += 1) {
      const y = 82 + row * 8;
      const progress = (y - apexY) / (baseY - apexY);
      const left = Math.max(0, apexX - Math.floor(apexX * progress));
      const right = Math.min(166, apexX + Math.floor(90 * progress));
      const offset = row % 2 === 0 ? 5 : 9;

      context.fillStyle = "#000000";
      for (let x = left + offset; x < right - 6; x += 12) {
        const stonePattern = (row + Math.floor(x / 12)) % 3;
        if (stonePattern === 0) {
          context.fillRect(x, y + 2, 6, 1);
          context.fillRect(x + 3, y + 4, 2, 2);
        } else if (stonePattern === 1) {
          context.fillRect(x + 2, y, 3, 2);
          context.fillRect(x + 6, y + 5, 4, 1);
        } else {
          context.fillRect(x, y + 5, 5, 1);
          context.fillRect(x + 7, y + 1, 2, 3);
        }
      }
    }

    // Stepped Sphinx silhouette in front of the pyramid, facing left.
    context.fillStyle = "#000000";
    context.fillRect(132, 174, 76, 16); // base and paws
    context.fillRect(138, 151, 68, 32); // body
    context.fillRect(145, 139, 55, 25); // chest and shoulders
    context.fillRect(154, 119, 42, 34); // neck
    context.fillRect(149, 101, 48, 31); // headdress
    context.fillRect(145, 108, 41, 36); // face
    context.fillRect(136, 120, 19, 11); // projecting nose
    context.fillRect(158, 95, 33, 11); // crown
    context.fillRect(188, 108, 13, 17); // rear headdress flap
    context.fillRect(143, 178, 17, 12); // front leg
    context.fillRect(175, 176, 16, 14); // rear leg

    context.fillStyle = "#ffff00";
    context.fillRect(161, 98, 25, 4); // crown stripe
    context.fillRect(153, 106, 36, 4); // headdress band
    context.fillRect(149, 112, 31, 5); // brow
    context.fillRect(140, 123, 13, 4); // nose bridge
    context.fillRect(146, 132, 22, 4); // cheek
    context.fillRect(153, 140, 30, 4); // jaw
    context.fillRect(158, 151, 37, 4); // chest collar
    context.fillRect(144, 162, 50, 3); // shoulder and body marking
    context.fillRect(151, 169, 40, 3); // flank stripe
    context.fillRect(146, 182, 12, 3); // paw highlight
    context.fillRect(178, 181, 10, 3); // rear paw highlight

    // Black face markings and yellow pixels define the eye and headdress.
    context.fillStyle = "#000000";
    context.fillRect(150, 120, 7, 3); // eye
    context.fillRect(138, 128, 12, 3); // nose shadow
    context.fillRect(151, 138, 14, 3); // mouth
    context.fillRect(155, 105, 7, 3);
    context.fillRect(168, 105, 8, 3);
    context.fillRect(182, 105, 8, 3);
    context.fillRect(162, 158, 25, 2);
    context.fillRect(148, 170, 15, 2);

    // Tiny stone chips tie the Sphinx base into the yellow pyramid ground.
    context.fillStyle = "#ffff00";
    context.fillRect(121, 184, 8, 2);
    context.fillRect(128, 180, 5, 2);
    context.fillRect(198, 169, 8, 2);
    context.fillRect(202, 173, 6, 2);
    context.fillRect(112, 188, 13, 2);
  }

  draw(context) {
    for (const platform of this.platforms) {
      // Black outlines keep bright platforms visible against the cyan sky.
      context.fillStyle = "#000000";
      context.fillRect(platform.x - 1, platform.y - 1, platform.width + 2, 7);
      context.fillStyle = platform.color;
      context.fillRect(platform.x, platform.y, platform.width, 3);
      context.fillStyle = "#0000ff";
      context.fillRect(platform.x, platform.y + 3, platform.width, 2);
    }
  }
}
