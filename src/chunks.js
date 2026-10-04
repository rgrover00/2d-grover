import { scaleFactor, floors } from "./constants";

const mod = (n, m) => ((n % m) + m) % m;

// Loads every floor's sprite and Tiled data. All floors must share one size.
export async function loadFloors(k) {
  const loaded = await Promise.all(
    floors.map(async (floor, i) => {
      const spriteName = `floor-${i}`;
      k.loadSprite(spriteName, floor.sprite);
      const mapData = await (await fetch(floor.map)).json();
      const layer = (name) =>
        mapData.layers.find((l) => l.name === name)?.objects ?? [];
      return {
        name: floor.name,
        spriteName,
        width: mapData.width * mapData.tilewidth * scaleFactor,
        height: mapData.height * mapData.tileheight * scaleFactor,
        boundaries: layer("boundaries"),
        spawn: layer("spawnpoints").find((o) => o.name === "player"),
      };
    })
  );

  const { width, height } = loaded[0];
  if (loaded.some((f) => f.width !== width || f.height !== height)) {
    throw new Error("All floors must be the same size");
  }
  return loaded;
}

// Keeps only the floor the player is on plus `radius` neighbours alive.
// Chunk index i can be any integer: content repeats, position is i * height.
export function createChunkManager(k, loadedFloors, { radius = 1, onChange } = {}) {
  const chunkHeight = loadedFloors[0].height;
  const chunks = new Map(); // index -> root game object
  let current = null;

  function spawn(index) {
    const floor = loadedFloors[mod(index, loadedFloors.length)];

    // One root per chunk: destroying it removes the art and every collider.
    const root = k.add([
      k.sprite(floor.spriteName),
      k.pos(0, index * chunkHeight),
      k.scale(scaleFactor),
      k.z(0),
    ]);

    for (const b of floor.boundaries) {
      if (!b.width || !b.height) continue; // skip stray zero-size objects
      root.add([
        k.area({ shape: new k.Rect(k.vec2(0), b.width, b.height) }),
        k.body({ isStatic: true }),
        k.pos(b.x, b.y),
        ...(b.name ? ["interactable", { dialogueKey: b.name }] : []),
      ]);
    }
    chunks.set(index, root);
  }

  function update(playerY) {
    const index = Math.floor(playerY / chunkHeight);
    if (index === current) return;
    current = index;

    for (let i = index - radius; i <= index + radius; i++) {
      if (!chunks.has(i)) spawn(i);
    }
    for (const [i, root] of chunks) {
      if (Math.abs(i - index) > radius) {
        root.destroy();
        chunks.delete(i);
      }
    }
    onChange?.(index, loadedFloors[mod(index, loadedFloors.length)]);
  }

  return { update, chunkHeight, count: () => chunks.size };
}
