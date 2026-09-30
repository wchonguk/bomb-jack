// A simple source-inspired power pickup: touching it freezes enemies briefly.
class PowerOrb {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 12;
    this.timer = 0;
    this.visible = true;
  }

  update(deltaSeconds) {
    this.timer += deltaSeconds;
    if (this.timer >= 0.16) {
      this.timer %= 0.16;
      this.visible = !this.visible;
    }
  }

  overlaps(player) {
    return player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;
  }

  draw(context, spriteSheet) {
    if (!this.visible) return;

    if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
      const frame = SPRITE_ATLAS.powerOrb[Math.floor(Date.now() / 100) % SPRITE_ATLAS.powerOrb.length];
      context.drawImage(
        spriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        Math.round(this.x), Math.round(this.y), this.width, this.height
      );
      return;
    }

    // A crisp 12x12 starburst, drawn only from whole-pixel rectangles.
    context.fillStyle = "#000000";
    context.fillRect(this.x + 4, this.y, 4, 12);
    context.fillRect(this.x, this.y + 4, 12, 4);
    context.fillRect(this.x + 2, this.y + 2, 8, 8);
    context.fillStyle = "#ffff00";
    context.fillRect(this.x + 4, this.y + 2, 4, 8);
    context.fillRect(this.x + 2, this.y + 4, 8, 4);
    context.fillStyle = "#ffffff";
    context.fillRect(this.x + 5, this.y + 5, 2, 2);
  }
}
