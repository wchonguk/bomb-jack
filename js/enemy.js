// Physics and steering values for the single basic enemy type.
const ENEMY_PHYSICS = Object.freeze({
  WORLD_WIDTH: 256,
  MOVE_SPEED: 48,
  GRAVITY: 720,
  MAX_FALL_SPEED: 300,
  MIN_TURN_TIME: 0.7,
  MAX_TURN_TIME: 1.5,
  CHASE_CHANCE: 0.72
});

// A simple patrolling enemy that periodically steers toward the player.
class Enemy {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.velocityY = 0;
    this.direction = -1;
    this.directionTimer = this.nextTurnTime();
  }

  nextTurnTime() {
    const range = ENEMY_PHYSICS.MAX_TURN_TIME - ENEMY_PHYSICS.MIN_TURN_TIME;
    return ENEMY_PHYSICS.MIN_TURN_TIME + Math.random() * range;
  }

  update(deltaSeconds, player, platforms) {
    this.directionTimer -= deltaSeconds;
    if (this.directionTimer <= 0) {
      this.directionTimer = this.nextTurnTime();

      // Usually choose the direction of the player, but sometimes patrol away
      // to keep the enemy's movement from looking perfectly predictable.
      const distanceToPlayer = player.x - this.x;
      if (Math.abs(distanceToPlayer) > 8 && Math.random() < ENEMY_PHYSICS.CHASE_CHANCE) {
        this.direction = Math.sign(distanceToPlayer);
      } else if (Math.random() < 0.5) {
        this.direction *= -1;
      }
    }

    const previousX = this.x;
    const previousBottom = this.y + this.height;
    this.x += this.direction * ENEMY_PHYSICS.MOVE_SPEED * deltaSeconds;

    // Reverse at the screen edges instead of walking out of the playfield.
    if (this.x < 0) {
      this.x = 0;
      this.direction = 1;
    } else if (this.x > ENEMY_PHYSICS.WORLD_WIDTH - this.width) {
      this.x = ENEMY_PHYSICS.WORLD_WIDTH - this.width;
      this.direction = -1;
    }

    // The enemy falls under gravity and lands on platform tops just like the player.
    this.velocityY = Math.min(
      this.velocityY + ENEMY_PHYSICS.GRAVITY * deltaSeconds,
      ENEMY_PHYSICS.MAX_FALL_SPEED
    );
    this.y += this.velocityY * deltaSeconds;

    if (this.velocityY >= 0) {
      const currentBottom = this.y + this.height;
      const sweptLeft = Math.min(previousX, this.x);
      const sweptRight = Math.max(previousX + this.width, this.x + this.width);
      let landingPlatform = null;

      for (const platform of platforms) {
        const overlapsHorizontally =
          sweptRight > platform.x && sweptLeft < platform.x + platform.width;
        const crossedPlatformTop = previousBottom <= platform.y && currentBottom >= platform.y;

        if (overlapsHorizontally && crossedPlatformTop &&
            (!landingPlatform || platform.y < landingPlatform.y)) {
          landingPlatform = platform;
        }
      }

      if (landingPlatform) {
        this.y = landingPlatform.y - this.height;
        this.velocityY = 0;
      }
    }
  }

  overlaps(player) {
    return player.x < this.x + this.width &&
      player.x + player.width > this.x &&
      player.y < this.y + this.height &&
      player.y + player.height > this.y;
  }

  draw(context, spriteSheet, frozen = false) {
    if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
      const atlas = SPRITE_ATLAS.enemy;
      const frames = this.direction < 0 ? atlas.runLeft : atlas.runRight;
      const frame = Math.floor(Date.now() / 180) % frames.length;
      const source = frames[frame] || atlas.idle;

      context.drawImage(
        spriteSheet,
        source.x, source.y, source.width, source.height,
        Math.round(this.x), Math.round(this.y), 16, 16
      );

      return;
    }

    // Black-outlined 16x16 creature with bright magenta armor and green eyes.
    const pixelX = Math.round(this.x);
    const pixelY = Math.round(this.y);
    context.fillStyle = "#000000";
    context.fillRect(pixelX + 3, pixelY, 4, 4);
    context.fillRect(pixelX + 9, pixelY, 4, 4);
    context.fillRect(pixelX + 1, pixelY + 3, 14, 10);
    context.fillRect(pixelX + 3, pixelY + 12, 4, 4);
    context.fillRect(pixelX + 9, pixelY + 12, 4, 4);
    context.fillStyle = frozen ? "#00ffff" : "#ff00ff";
    context.fillRect(pixelX + 4, pixelY + 2, 8, 3);
    context.fillRect(pixelX + 2, pixelY + 5, 12, 6);
    context.fillRect(pixelX + 4, pixelY + 11, 8, 3);
    context.fillStyle = frozen ? "#ffff00" : "#00ff00";
    context.fillRect(pixelX + 4, pixelY + 6, 3, 3);
    context.fillRect(pixelX + 9, pixelY + 6, 3, 3);
    context.fillStyle = "#fff";
    context.fillRect(pixelX + 5, pixelY + 7, 1, 1);
    context.fillRect(pixelX + 10, pixelY + 7, 1, 1);
    context.fillStyle = "#ff00ff";
    context.fillRect(pixelX + 3, pixelY + 14, 4, 2);
    context.fillRect(pixelX + 9, pixelY + 14, 4, 2);
  }
}
