import { scaleFactor, dialogueData } from "./constants";
import { k } from "./kaboomCtx";
import { displayDialogue, setCamScale } from "./utils";

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

k.loadSprite("map", "./map.png");
k.setBackground(k.Color.fromHex("#1D1D1D"));

// ==========================================
// 2. MAIN SCENE
// ==========================================
k.scene("main", async () => {
  const mapData = await (await fetch("map.json")).json();

  const map = k.add([k.sprite("map"), k.pos(0), k.scale(scaleFactor)]);

  const player = k.add([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({ shape: new k.Rect(k.vec2(0, 3), 10, 10) }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    { speed: 250, direction: "down", isInDialogue: false },
    "player",
  ]);

  // Parse map layers
  for (const layer of mapData.layers) {
    if (layer.name === "boundaries") {
      setupBoundaries(layer.objects, map, player);
    } else if (layer.name === "spawnpoints") {
      setupPlayerSpawn(layer.objects, map, player);
    }
  }

  // Camera Setup
  setCamScale(k);
  k.onResize(() => setCamScale(k));
  k.onUpdate(() => {
    k.camPos(player.worldPos().x, player.worldPos().y - 100);
  });

  // Initialize Controls
  setupInputs(player);
});

k.go("main");

// ==========================================
// 3. HELPER FUNCTIONS (The Refactor Magic)
// ==========================================

function setupBoundaries(boundaries, map, player) {
  for (const boundary of boundaries) {
    map.add([
      k.area({ shape: new k.Rect(k.vec2(0), boundary.width, boundary.height) }),
      k.body({ isStatic: true }),
      k.pos(boundary.x, boundary.y),
      boundary.name,
    ]);

    if (boundary.name) {
      player.onCollide(boundary.name, () => {
        player.isInDialogue = true;
        displayDialogue(
          dialogueData[boundary.name],
          () => (player.isInDialogue = false)
        );
      });
    }
  }
}

function setupPlayerSpawn(spawnpoints, map, player) {
  const playerSpawn = spawnpoints.find((entity) => entity.name === "player");
  if (playerSpawn) {
    player.pos = k.vec2(
      (map.pos.x + playerSpawn.x) * scaleFactor,
      (map.pos.y + playerSpawn.y) * scaleFactor
    );
  }
}

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

  // Keyboard Input (Using onUpdate for smooth continuous movement)
  k.onUpdate(() => {
    if (player.isInDialogue) return;

    const left = k.isKeyDown("left");
    const right = k.isKeyDown("right");
    const up = k.isKeyDown("up");
    const down = k.isKeyDown("down");

    // Strict 4-way movement check: ensures only ONE key is pressed at a time.
    if (left + right + up + down !== 1) return;

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