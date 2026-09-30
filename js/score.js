// Score and chain state are kept separate from the game controller and renderer.
class Score {
  constructor() {
    this.total = 0;
    this.multiplier = 1;
    this.powerCharge = 0;
    this.enemyChain = 0;
    this.nextBonusScore = 5000;
    this.bonusReady = false;
  }

  add(points) {
    this.total += points;
    if (this.total >= this.nextBonusScore) {
      this.bonusReady = true;
      this.nextBonusScore += 5000;
    }
  }

  collectBomb(wasActivated) {
    const points = (wasActivated ? 200 : 100) * this.multiplier;
    this.add(points);
    // Idle bombs contribute half as much toward the source game's power event.
    this.powerCharge = Math.min(10, this.powerCharge + (wasActivated ? 1 : 0.5));
    return points;
  }

  collectPower() {
    const points = 500 * this.multiplier;
    this.add(points);
    this.enemyChain = 0;
    return points;
  }

  collectBonus() {
    const points = 500 * this.multiplier;
    this.multiplier = Math.min(5, this.multiplier + 1);
    this.bonusReady = false;
    this.add(points);
    return points;
  }

  defeatEnemy() {
    const enemyPoints = [100, 200, 300, 500, 800, 1200, 2000];
    const basePoints = enemyPoints[Math.min(this.enemyChain, enemyPoints.length - 1)];
    this.enemyChain += 1;
    const points = basePoints * this.multiplier;
    this.add(points);
    return points;
  }

  completeLevel() {
    const points = 1000 * this.multiplier;
    this.add(points);
    return points;
  }

  startNextLevel() {
    this.multiplier = 1;
    this.powerCharge = 0;
    this.enemyChain = 0;
    this.bonusReady = false;
  }

  consumePowerCharge() {
    if (this.powerCharge < 10) return false;
    this.powerCharge -= 10;
    return true;
  }

  resetEnemyChain() {
    this.enemyChain = 0;
  }
}
