// Game controller: own state transitions and coordinate the independent systems.
class ArcadeGame {
  constructor(canvas) {
    this.input = new Input();
    this.levelNumber = 1;
    this.level = new Level(this.levelNumber);
    this.player = new Player(this.level.playerStart.x, this.level.playerStart.y);
    this.renderer = new Renderer(canvas);
    this.score = new Score();
    this.lives = 3;

    this.bombs = [];
    this.activeBomb = null;
    this.enemies = [];
    this.powerOrb = null;
    this.bonus = null;
    this.powerTimer = 0;

    this.levelComplete = false;
    this.levelCompleteTimer = 0;
    this.playerDying = false;
    this.deathTimer = 0;
    this.deathAnimationSeconds = 0.75;

    this.resetLevelEntities();
  }

  resetLevelEntities() {
    // Recreate enemies on respawn, while keeping collected bombs and score.
    this.enemies = this.level.enemyPositions.map(
      (position) => new Enemy(position.x, position.y)
    );
    if (this.bombs.length === 0 && !this.levelComplete) {
      this.bombs = this.level.bombPositions.map(
        (position, order) => new Bomb(position.x, position.y, order)
      );
    }
  }

  activateNextBomb(afterOrder) {
    let nextBomb = null;
    for (const bomb of this.bombs) {
      if (bomb.order > afterOrder && (!nextBomb || bomb.order < nextBomb.order)) {
        nextBomb = bomb;
      }
    }
    if (!nextBomb) {
      for (const bomb of this.bombs) {
        if (!nextBomb || bomb.order < nextBomb.order) nextBomb = bomb;
      }
    }
    if (nextBomb) nextBomb.activate();
    return nextBomb;
  }

  collectBomb(index) {
    const [bomb] = this.bombs.splice(index, 1);
    const wasActivated = bomb.activated;
    this.score.collectBomb(wasActivated);

    // Picking up the lit bomb advances the chain; the first pickup lights one.
    if (this.activeBomb === bomb) this.activeBomb = null;
    if (!this.activeBomb) {
      this.activeBomb = this.activateNextBomb(bomb.order);
    }

    if (!this.powerOrb && this.powerTimer <= 0 && this.score.consumePowerCharge()) {
      this.powerOrb = new PowerOrb(122, 92);
    }

    if (this.bombs.length === 0) {
      this.activeBomb = null;
      this.levelComplete = true;
      this.levelCompleteTimer = 0;
      this.score.completeLevel();
    }
  }

  startNextLevel() {
    this.levelNumber += 1;
    this.level = new Level(this.levelNumber);
    this.bombs = [];
    this.activeBomb = null;
    this.levelComplete = false;
    this.levelCompleteTimer = 0;
    this.powerOrb = null;
    this.bonus = null;
    this.powerTimer = 0;
    this.score.startNextLevel();
    this.player.respawn(this.level.playerStart.x, this.level.playerStart.y);
    this.resetLevelEntities();
  }

  startPlayerDeath() {
    if (this.playerDying) return;
    this.playerDying = true;
    this.deathTimer = 0;
    this.lives = Math.max(0, this.lives - 1);
    this.score.resetEnemyChain();
  }

  collectPowerOrb() {
    this.powerOrb = null;
    this.powerTimer = 4;
    this.score.collectPower();
  }

  update(deltaSeconds) {
    if (this.levelComplete) {
      this.levelCompleteTimer += deltaSeconds;
      if (this.levelCompleteTimer >= 2.5) this.startNextLevel();
      this.input.finishFrame();
      return;
    }

    if (this.powerTimer > 0) {
      this.powerTimer = Math.max(0, this.powerTimer - deltaSeconds);
    }

    if (this.playerDying) {
      this.deathTimer += deltaSeconds;
      if (this.deathTimer >= this.deathAnimationSeconds) {
        this.playerDying = false;
        this.player.respawn(this.level.playerStart.x, this.level.playerStart.y);
        this.resetLevelEntities();
      }
      this.input.finishFrame();
      return;
    }

    this.player.update(deltaSeconds, this.input, this.level.platforms);

    if (this.powerOrb) {
      this.powerOrb.update(deltaSeconds);
      if (this.powerOrb.overlaps(this.player)) this.collectPowerOrb();
    }

    if (this.bonus) {
      this.bonus.update(deltaSeconds);
      if (this.bonus.overlaps(this.player)) {
        this.bonus = null;
        this.score.collectBonus();
      }
    }

    // A collected power orb freezes the same enemy type; touching one removes it.
    if (this.powerTimer <= 0) {
      for (const enemy of this.enemies) {
        enemy.update(deltaSeconds, this.player, this.level.platforms);
      }
    }

    for (const bomb of this.bombs) bomb.update(deltaSeconds);

    let hitEnemy = false;
    for (let index = this.enemies.length - 1; index >= 0; index -= 1) {
      if (!this.enemies[index].overlaps(this.player)) continue;

      if (this.powerTimer > 0) {
        this.enemies.splice(index, 1);
        this.score.defeatEnemy();
      } else {
        this.startPlayerDeath();
        hitEnemy = true;
        break;
      }
    }

    if (!hitEnemy && !this.playerDying) {
      for (let index = this.bombs.length - 1; index >= 0; index -= 1) {
        if (this.bombs[index].overlaps(this.player)) this.collectBomb(index);
      }
    }

    if (!this.levelComplete && this.score.bonusReady && !this.bonus) {
      this.bonus = new Bonus(82, 62);
    }

    this.input.finishFrame();
  }

  draw() {
    this.renderer.draw(this);
  }
}

// Keep direct index.html launch support; no module loader or build step is used.
(() => {
  const canvas = document.getElementById("game-canvas");
  const game = new ArcadeGame(canvas);
  let previousTime = 0;

  function frame(time) {
    // Limit large tab-switch pauses, then update game state and render it.
    const deltaSeconds = previousTime === 0
      ? 0
      : Math.min((time - previousTime) / 1000, 0.05);
    previousTime = time;

    game.update(deltaSeconds);
    game.draw();
    window.requestAnimationFrame(frame);
  }

  window.requestAnimationFrame(frame);
})();
