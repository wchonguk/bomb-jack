// Sprite-sheet rectangles used by Canvas drawImage(source, sourceRect, targetRect).
const SPRITE_ATLAS = Object.freeze({
  player: {
    idle: { x: 4, y: 4, width: 16, height: 15 },
    runRight: [24, 44, 64, 84].map((x) => ({ x, y: 4, width: 16, height: 15 })),
    runLeft: [104, 124, 144, 164].map((x) => ({ x, y: 4, width: 16, height: 15 })),
    falling: { x: 204, y: 4, width: 16, height: 15 },
    flying: { x: 224, y: 4, width: 16, height: 15 },
    flyingRight: { x: 264, y: 4, width: 16, height: 15 },
    fallingRight: { x: 284, y: 4, width: 16, height: 15 },
    flyingLeft: { x: 304, y: 4, width: 16, height: 15 },
    fallingLeft: { x: 324, y: 4, width: 16, height: 15 },
    dead: [
      { x: 145, y: 27, width: 16, height: 18 },
      { x: 166, y: 29, width: 13, height: 16 },
      { x: 184, y: 24, width: 17, height: 24 },
      { x: 205, y: 27, width: 23, height: 21 }
    ]
  },
  bomb: {
    idle: { x: 46, y: 136, width: 12, height: 16 },
    activated: [66, 86, 106, 126, 146, 166].map(
      (x) => ({ x, y: 136, width: 12, height: 16 })
    )
  },
  enemy: {
    idle: { x: 6, y: 53, width: 12, height: 15 },
    runRight: [
      { x: 45, y: 53, width: 11, height: 15 },
      { x: 61, y: 53, width: 11, height: 15 },
      { x: 76, y: 53, width: 13, height: 15 }
    ],
    runLeft: [
      { x: 92, y: 53, width: 11, height: 15 },
      { x: 108, y: 53, width: 11, height: 15 },
      { x: 123, y: 53, width: 13, height: 15 }
    ]
  },
  powerOrb: [5, 25, 45, 65, 85, 105, 125, 145, 165].map(
    (x) => ({ x, y: 73, width: 14, height: 14 })
  ),
  bonus: [
    { x: 78, y: 114, width: 13, height: 13 },
    { x: 98, y: 114, width: 12, height: 13 },
    { x: 117, y: 114, width: 7, height: 13 },
    { x: 130, y: 114, width: 12, height: 13 }
  ]
});
