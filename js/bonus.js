// A small score bonus that increases the bomb and enemy score multiplier.
class Bonus {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 12;
    this.height = 12;
    this.flashTime = 0;
    this.visible = true;
  }

  update(deltaSeconds) {
    this.flashTime += deltaSeconds;
    if (this.flashTime >= 0.2) {
      this.flashTime %= 0.2;
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
      const frames = SPRITE_ATLAS.bonus;
      const frame = frames[Math.floor(Date.now() / 150) % frames.length];
      context.drawImage(
        spriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        Math.round(this.x), Math.round(this.y), this.width, this.height
      );
      return;
    }

    // A square-cornered bonus jewel, using only the arcade palette.
    context.fillStyle = "#000000";
    context.fillRect(this.x + 3, this.y, 6, 12);
    context.fillRect(this.x, this.y + 3, 12, 6);
    context.fillStyle = "#00ff00";
    context.fillRect(this.x + 3, this.y + 2, 6, 8);
    context.fillRect(this.x + 2, this.y + 3, 8, 6);
    context.fillStyle = "#ffffff";
    context.fillRect(this.x + 4, this.y + 3, 2, 2);
  }
}
