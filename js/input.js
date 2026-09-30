// Tracks held keys as well as one-frame presses (used for jumping).
class Input {
  constructor() {
    this.held = Object.create(null);
    this.pressed = Object.create(null);

    window.addEventListener("keydown", (event) => {
      // Stop the page scrolling when the game controls are used.
      if (["ArrowLeft", "ArrowRight", "Space"].includes(event.code)) {
        event.preventDefault();
      }

      // Only mark a key as newly pressed on the transition from up to down.
      if (!this.held[event.code]) {
        this.pressed[event.code] = true;
      }
      this.held[event.code] = true;
    });

    window.addEventListener("keyup", (event) => {
      this.held[event.code] = false;
    });

    // Avoid a key being left held if the browser loses focus mid-press.
    window.addEventListener("blur", () => {
      this.held = Object.create(null);
      this.pressed = Object.create(null);
    });
  }

  isDown(code) {
    return Boolean(this.held[code]);
  }

  wasPressed(code) {
    return Boolean(this.pressed[code]);
  }

  // Called once after each game update so presses last exactly one frame.
  finishFrame() {
    this.pressed = Object.create(null);
  }
}
