const gridSpec = {
  x: 3,
  y: 2,
  z: 2,
  cellSize: {
    width: 116,
    height: 92,
    depth: 86
  },
  gap: 8
};

const cells = Array.from({ length: gridSpec.x * gridSpec.y * gridSpec.z }, (_, index) => {
  const x = index % gridSpec.x;
  const y = Math.floor(index / gridSpec.x) % gridSpec.y;
  const z = Math.floor(index / (gridSpec.x * gridSpec.y));

  return {
    id: `cell-${String(index + 1).padStart(2, "0")}`,
    label: `Cell ${String(index + 1).padStart(2, "0")}`,
    coord: { x, y, z },
    content: {
      title: "",
      summary: "",
      type: "",
      points: [],
      decisionTree: null
    },
    opacity: index === 2 || index === 7 ? 0.32 : 1,
    links: []
  };
});

function getCellAt(x, y, z) {
  return cells.find((cell) => cell.coord.x === x && cell.coord.y === y && cell.coord.z === z);
}

cells.forEach((cell) => {
  const { x, y, z } = cell.coord;
  const adjacent = [
    getCellAt(x + 1, y, z),
    getCellAt(x - 1, y, z),
    getCellAt(x, y + 1, z),
    getCellAt(x, y - 1, z),
    getCellAt(x, y, z + 1),
    getCellAt(x, y, z - 1)
  ].filter(Boolean);

  cell.links = adjacent.map((item) => item.id);
});

const faces = ["front", "back", "right", "left", "top", "bottom"];
const cuboid = document.querySelector("#cuboid");

function renderCell(cell) {
  const element = document.createElement("article");
  element.className = `cell${cell.opacity < 1 ? " is-muted" : ""}`;
  element.style.setProperty("--w", `${gridSpec.cellSize.width}px`);
  element.style.setProperty("--h", `${gridSpec.cellSize.height}px`);
  element.style.setProperty("--d", `${gridSpec.cellSize.depth}px`);
  element.style.transform = cellTransform(cell.coord);
  element.setAttribute("aria-label", `${cell.label}, x ${cell.coord.x}, y ${cell.coord.y}, z ${cell.coord.z}`);

  faces.forEach((faceName) => {
    const face = document.createElement("span");
    face.className = `face ${faceName}`;
    element.appendChild(face);
  });

  const note = document.createElement("div");
  note.className = "note";
  note.innerHTML = `
    <strong>${cell.label}</strong>
    <span>x:${cell.coord.x} y:${cell.coord.y} z:${cell.coord.z}</span>
    <span>待填写</span>
  `;

  const pin = document.createElement("span");
  pin.className = "link-pin";
  pin.title = `${cell.links.length} adjacent links`;

  element.append(note, pin);
  return element;
}

function cellTransform(coord) {
  const { width, height, depth } = gridSpec.cellSize;
  const x = coord.x * (width + gridSpec.gap);
  const y = coord.y * (height + gridSpec.gap);
  const z = coord.z * (depth + gridSpec.gap);

  return `translate3d(${x}px, ${y}px, ${z}px)`;
}

cells.forEach((cell) => {
  cuboid.appendChild(renderCell(cell));
});

window.knowledgeCuboidPrototype = {
  gridSpec,
  cells
};
