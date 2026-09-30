// Keep every physics tuning knob together so movement can be adjusted easily.
const PLAYER_PHYSICS = Object.freeze({
  WORLD_WIDTH: 256,
  MOVE_SPEED: 132, // Horizontal speed in pixels per second.
  GRAVITY: 900, // Normal downward acceleration in pixels per second squared.
  JUMP_SPEED: 330, // Initial upward speed in pixels per second.
  JUMP_HOLD_TIME: 0.22, // Maximum time Space can add extra upward force.
  JUMP_HOLD_ACCELERATION: 1200, // Extra lift while Space is held during ascent.
  EARLY_RELEASE_MULTIPLIER: 0.45, // Cut upward speed once when Space is released.
  SPACE_FALL_GRAVITY_MULTIPLIER: 0.72, // Lighter gravity while Space is held on descent.
  MAX_FALL_SPEED: 420,
  SPACE_MAX_FALL_SPEED: 230
});

// A small 16x16 block-built stand-in for the player character.
class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.velocityX = 0;
    this.velocityY = 0;
    this.grounded = false;
    this.jumpHoldRemaining = 0;
  }

  update(deltaSeconds, input, platforms) {
    // Horizontal control stays direct and responsive, including in mid-air.
    this.velocityX = 0;
    if (input.isDown("ArrowLeft")) this.velocityX -= PLAYER_PHYSICS.MOVE_SPEED;
    if (input.isDown("ArrowRight")) this.velocityX += PLAYER_PHYSICS.MOVE_SPEED;

    const previousX = this.x;
    this.x += this.velocityX * deltaSeconds;
    this.x = Math.max(0, Math.min(PLAYER_PHYSICS.WORLD_WIDTH - this.width, this.x));

    // A fresh Space press starts a strong jump. Holding it adds extra lift,
    // while releasing early sharply shortens the jump.
    if (this.grounded && input.wasPressed("Space")) {
      this.velocityY = -PLAYER_PHYSICS.JUMP_SPEED;
      this.jumpHoldRemaining = PLAYER_PHYSICS.JUMP_HOLD_TIME;
      this.grounded = false;
    }

    const previousBottom = this.y + this.height;
    const spaceHeld = input.isDown("Space");

    if (this.velocityY < 0 && this.jumpHoldRemaining > 0) {
      if (spaceHeld) {
        // Limit the boost to the time remaining, even if a frame is unusually long.
        const holdTime = Math.min(deltaSeconds, this.jumpHoldRemaining);
        this.velocityY -= PLAYER_PHYSICS.JUMP_HOLD_ACCELERATION * holdTime;
        this.jumpHoldRemaining -= holdTime;
      } else {
        // Apply the short-hop cut once, on the first frame Space is released.
        this.velocityY *= PLAYER_PHYSICS.EARLY_RELEASE_MULTIPLIER;
        this.jumpHoldRemaining = 0;
      }
    }

    // Holding Space while falling gives a modest, controllable float effect.
    const falling = this.velocityY >= 0;
    const gravityMultiplier = falling && spaceHeld
      ? PLAYER_PHYSICS.SPACE_FALL_GRAVITY_MULTIPLIER
      : 1;
    this.velocityY += PLAYER_PHYSICS.GRAVITY * gravityMultiplier * deltaSeconds;
    const maxFallSpeed = spaceHeld
      ? PLAYER_PHYSICS.SPACE_MAX_FALL_SPEED
      : PLAYER_PHYSICS.MAX_FALL_SPEED;
    this.velocityY = Math.min(this.velocityY, maxFallSpeed);

    this.y += this.velocityY * deltaSeconds;
    this.grounded = false;

    // Sweep the player's bottom across the whole frame so even thin platforms
    // are caught if a fast fall crosses them between updates.
    if (this.velocityY >= 0) {
      const currentBottom = this.y + this.height;
      const sweptLeft = Math.min(previousX, this.x);
      const sweptRight = Math.max(previousX + this.width, this.x + this.width);
      let landingPlatform = null;

      for (const platform of platforms) {
        const overlapsHorizontally = sweptRight > platform.x && sweptLeft < platform.x + platform.width;
        const crossedPlatformTop = previousBottom <= platform.y && currentBottom >= platform.y;

        // If one large step crosses multiple platforms, land on the first one
        // encountered from above (the smallest platform Y in the swept range).
        if (overlapsHorizontally && crossedPlatformTop &&
            (!landingPlatform || platform.y < landingPlatform.y)) {
          landingPlatform = platform;
        }
      }

      if (landingPlatform) {
        this.y = landingPlatform.y - this.height;
        this.velocityY = 0;
        this.grounded = true;
        this.jumpHoldRemaining = 0;
      }
    }
  }

  respawn(x, y) {
    // Restore the starting position and clear all motion from the previous life.
    this.x = x;
    this.y = y;
    this.velocityX = 0;
    this.velocityY = 0;
    this.grounded = false;
    this.jumpHoldRemaining = 0;
  }

  draw(context, spriteSheet) {
    if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
      const frameNumber = Math.floor(Date.now() / 110) % 4;
      const atlas = SPRITE_ATLAS.player;
      let frame = atlas.idle;

      if (this.velocityY < -20) {
        if (this.velocityX > 0) frame = atlas.flyingRight;
        else if (this.velocityX < 0) frame = atlas.flyingLeft;
        else frame = atlas.flying;
      } else if (this.velocityY > 70) {
        if (this.velocityX > 0) frame = atlas.fallingRight;
        else if (this.velocityX < 0) frame = atlas.fallingLeft;
        else frame = atlas.falling;
      } else if (this.velocityX > 0) {
        frame = atlas.runRight[frameNumber];
      } else if (this.velocityX < 0) {
        frame = atlas.runLeft[frameNumber];
      }

      context.drawImage(
        spriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        Math.round(this.x), Math.round(this.y), 16, 16
      );
      return;
    }

    // A yellow helmet and suit over a one-pixel black silhouette.
    // Round positions only while drawing so moving sprites stay on whole pixels.
    const pixelX = Math.round(this.x);
    const pixelY = Math.round(this.y);
    context.fillStyle = "#000000";
    context.fillRect(pixelX + 3, pixelY, 10, 3);
    context.fillRect(pixelX + 1, pixelY + 3, 14, 9);
    context.fillRect(pixelX + 3, pixelY + 12, 10, 3);
    context.fillRect(pixelX + 2, pixelY + 14, 5, 2);
    context.fillRect(pixelX + 9, pixelY + 14, 5, 2);

    context.fillStyle = "#ffff00";
    context.fillRect(pixelX + 5, pixelY, 6, 2);
    context.fillRect(pixelX + 2, pixelY + 2, 12, 3);
    context.fillRect(pixelX + 4, pixelY + 8, 8, 4);
    context.fillRect(pixelX + 3, pixelY + 12, 4, 2);
    context.fillRect(pixelX + 9, pixelY + 12, 4, 2);

    context.fillStyle = "#ffffff";
    context.fillRect(pixelX + 4, pixelY + 5, 2, 2);
    context.fillRect(pixelX + 10, pixelY + 5, 2, 2);
    context.fillStyle = "#00ffff";
    context.fillRect(pixelX + 5, pixelY + 5, 1, 1);
    context.fillRect(pixelX + 11, pixelY + 5, 1, 1);
  }

  drawDeath(context, progress, spriteSheet) {
    // Keep the death flash crisp by blinking whole pixels without transforms.
    const animationProgress = Math.max(0, Math.min(1, progress));
    if (spriteSheet && spriteSheet.complete && spriteSheet.naturalWidth > 0) {
      const frames = SPRITE_ATLAS.player.dead;
      const frame = frames[Math.min(frames.length - 1, Math.floor(animationProgress * frames.length))];
      context.drawImage(
        spriteSheet,
        frame.x, frame.y, frame.width, frame.height,
        Math.round(this.x), Math.round(this.y), 16, 16
      );
      return;
    }

    const shouldDraw = Math.floor(animationProgress * 12) % 2 === 0;
    if (shouldDraw) this.draw(context, spriteSheet);
  }
}
