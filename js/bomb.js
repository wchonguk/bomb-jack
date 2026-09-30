// A collectible 8x8 bomb. State/collision methods are used during updates;
// draw() is only called by the renderer.
class Bomb {
  constructor(x, y, order) {
    this.x = x;
    this.y = y;
    this.order = order;
    this.width = 8;
    this.height = 8;
    this.flashTimer = 0;
    this.flashPeriod = 0.22;
    this.flashOn = true;
    this.activated = false;
  }

  activate() {
    this.activated = true;
    this.flashPeriod = 0.1;
  }

  update(deltaSeconds) {
    this.flashTimer += deltaSeconds;
    if (this.flashTimer >= this.flashPeriod) {
      this.flashTimer %= this.flashPeriod;
      this.flashOn = !this.flashOn;
    }
  }

  overlaps(player) {
    return player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;
  }

  draw(context, spriteSheet) {
    if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
      const frame = this.activated
        ? SPRITE_ATLAS.bomb.activated[Math.floor(Date.now() / 90) % SPRITE_ATLAS.bomb.activated.length]
        : SPRITE_ATLAS.bomb.idle;
      context.drawImage(
        spriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        Math.round(this.x - 2), Math.round(this.y - 4), 12, 16
      );
      return;
    }

    if (!this.flashOn) return;

    // The active bomb flashes faster and gets a white fuse glint.
    context.fillStyle = "#000000";
    context.fillRect(this.x + 2, this.y, 4, 2);
    context.fillRect(this.x, this.y + 2, 8, 4);
    context.fillRect(this.x + 2, this.y + 6, 4, 2);
    context.fillStyle = "#ffff00";
    context.fillRect(this.x + 2, this.y + 2, 4, 4);
    if (this.activated) {
      context.fillStyle = "#ffffff";
      context.fillRect(this.x + 5, this.y, 2, 2);
    }
    context.fillStyle = "#00ffff";
    context.fillRect(this.x + 3, this.y + 2, 1, 1);
  }
}
