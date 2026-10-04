import { scaleFactor, dialogueData } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";
import { loadFloors, createChunkManager } from "./chunks";

// ==========================================
// 1. ASSET LOADING
// ==========================================
k.loadSprite("spritesheet", "./spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.setBackground(k.Color.fromHex("#1D1D1D"));

// ==========================================
// 2. MAIN SCENE
// ==========================================
k.scene("main", (loadedFloors) => {
  const floorLabel = document.getElementById("floor-indicator");

  const player = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    k.z(10), // floors are spawned later, so keep the player drawn on top
    { speed: 250, direction: "down", isInDialogue: false },
    "player",
  ]);

  const spawn = loadedFloors[0].spawn;
  if (spawn) player.pos = k.vec2(spawn.x * scaleFactor, spawn.y * scaleFactor);

  // Endless floors: walking up counts up, walking down counts down.
  const chunkManager = createChunkManager(k, loadedFloors, {
    onChange: (index, floor) => {
      if (floorLabel) floorLabel.textContent = `Floor ${-index} · ${floor.name}`;
    },
  });
  chunkManager.update(player.pos.y);

  // One handler for every interactive object on every floor.
  player.onCollide("interactable", (obj) => {
    const text = dialogueData[obj.dialogueKey];
    if (!text || player.isInDialogue) return;
    player.isInDialogue = true;
    displayDialogue(text, () => (player.isInDialogue = false));
  });

  // Camera: follow vertically, keep the floor framed horizontally.
  const worldWidth = loadedFloors[0].width;
  setCamScale(k);
  k.onResize(() => setCamScale(k));
  k.onUpdate(() => {
    chunkManager.update(player.pos.y);

    const halfView = k.width() / k.camScale().x / 2;
    const camX =
      halfView * 2 >= worldWidth
        ? worldWidth / 2
        : k.clamp(player.pos.x, halfView, worldWidth - halfView);
    k.camPos(camX, player.pos.y - 100);
  });

  setupInputs(player);

  if (import.meta.env.DEV) window.__game = { k, player, chunkManager };
});

loadFloors(k).then((loadedFloors) => k.go("main", loadedFloors));

// ==========================================
// 3. HELPER FUNCTIONS
// ==========================================

function setupInputs(player) {
  const stopAnims = () => {
    if (player.direction === "down") player.play("idle-down");
    else if (player.direction === "up") player.play("idle-up");
    else player.play("idle-side");
  };

  // Mouse / Touch Input
  k.onMouseDown((mouseBtn) => {
    if (mouseBtn !== "left" || player.isInDialogue) return;

    const worldMousePos = k.toWorld(k.mousePos());
    player.moveTo(worldMousePos, player.speed);

    const mouseAngle = player.pos.angle(worldMousePos);
    updateAnimationByAngle(player, mouseAngle);
  });

  k.onMouseRelease(stopAnims);
  k.onKeyRelease(stopAnims);

  // Wheel / trackpad: scrolling walks the player up or down.
  let scrollBudget = 0; // pixels still to walk; negative = up
  const maxBudget = 600;
  k.onScroll((delta) => {
    if (player.isInDialogue) return;
    scrollBudget = k.clamp(scrollBudget + delta.y, -maxBudget, maxBudget);
  });

  const anyDown = (...keys) => keys.some((key) => k.isKeyDown(key));

  // Keyboard Input (Using onUpdate for smooth continuous movement)
  k.onUpdate(() => {
    if (player.isInDialogue) {
      scrollBudget = 0;
      return;
    }

    const left = anyDown("left", "a");
    const right = anyDown("right", "d");
    const up = anyDown("up", "w");
    const down = anyDown("down", "s");
    const pressed = left + right + up + down;

    if (pressed === 0 && scrollBudget !== 0) {
      const dir = Math.sign(scrollBudget);
      const step = player.speed * k.dt();
      if (dir < 0) movePlayer(player, "up", "walk-up", player.flipX, 0, -player.speed);
      else movePlayer(player, "down", "walk-down", player.flipX, 0, player.speed);
      scrollBudget = Math.abs(scrollBudget) <= step ? 0 : scrollBudget - dir * step;
      if (scrollBudget === 0) stopAnims();
      return;
    }
    if (pressed > 0) scrollBudget = 0;

    // Strict 4-way movement check: ensures only ONE direction is pressed at a time.
    if (pressed !== 1) return;

    if (right) movePlayer(player, "right", "walk-side", false, player.speed, 0);
    else if (left) movePlayer(player, "left", "walk-side", true, -player.speed, 0);
    else if (up) movePlayer(player, "up", "walk-up", player.flipX, 0, -player.speed);
    else if (down) movePlayer(player, "down", "walk-down", player.flipX, 0, player.speed);
  });
}

// DRY helper to handle animation, state, and movement simultaneously
function movePlayer(player, dir, anim, flip, dx, dy) {
  player.flipX = flip;
  if (player.curAnim() !== anim) player.play(anim);
  player.direction = dir;
  player.move(dx, dy);
}

// DRY helper for the mouse angle calculations
function updateAnimationByAngle(player, angle) {
  const lowerBound = 50;
  const upperBound = 125;

  if (angle > lowerBound && angle < upperBound) {
    if (player.curAnim() !== "walk-up") player.play("walk-up");
    player.direction = "up";
  } else if (angle < -lowerBound && angle > -upperBound) {
    if (player.curAnim() !== "walk-down") player.play("walk-down");
    player.direction = "down";
  } else if (Math.abs(angle) > upperBound) {
    player.flipX = false;
    if (player.curAnim() !== "walk-side") player.play("walk-side");
    player.direction = "right";
  } else if (Math.abs(angle) < lowerBound) {
    player.flipX = true;
    if (player.curAnim() !== "walk-side") player.play("walk-side");
    player.direction = "left";
  }
}
