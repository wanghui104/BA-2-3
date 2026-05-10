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

const sampleContent = [
  ["Main claim", "核心论点", ["定义问题", "限定范围", "提出判断"]],
  ["Reason A", "第一条理由", ["因果链", "关键证据", "反例边界"]],
  ["Reason B", "第二条理由", ["比较对象", "差异来源", "适用条件"]],
  ["Decision", "选择节点", ["如果 A 成立", "转向方案 1", "否则检查 B"]],
  ["Evidence", "证据组", ["数据", "案例", "可信度"]],
  ["Counter", "反方观点", ["对方假设", "薄弱点", "回应方式"]],
  ["Link", "相邻连接", ["和 Cell 01 匹配", "和 Cell 10 对照", "形成链条"]],
  ["Example", "例子", ["具体场景", "变量变化", "结论回扣"]],
  ["Rule", "判断规则", ["阈值", "例外", "下一步"]],
  ["Memory", "记忆提示", ["关键词", "图像化", "复述句"]],
  ["Tree", "小决策树", ["问题", "分支", "结果"]],
  ["Review", "复习出口", ["总结", "盲点", "下一轮"]]
];

const cells = Array.from({ length: gridSpec.x * gridSpec.y * gridSpec.z }, (_, index) => {
  const x = index % gridSpec.x;
  const y = Math.floor(index / gridSpec.x) % gridSpec.y;
  const z = Math.floor(index / (gridSpec.x * gridSpec.y));
  const [type, title, points] = sampleContent[index];

  return {
    id: `cell-${String(index + 1).padStart(2, "0")}`,
    label: `Cell ${String(index + 1).padStart(2, "0")}`,
    coord: { x, y, z },
    content: {
      title,
      summary: `${type} / 测试内容`,
      type,
      points,
      decisionTree: type === "Decision" || type === "Tree" ? ["条件", "分支", "结果"] : null
    },
    opacity: 1,
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
const scene = document.querySelector("#scene");
const modelStage = document.querySelector("#modelStage");
const cuboid = document.querySelector("#cuboid");
const resetViewButton = document.querySelector("#resetView");
const viewReadout = document.querySelector("#viewReadout");
const selectionText = document.querySelector("#selectionText");

const viewState = {
  rotationX: -18,
  rotationY: -34,
  zoom: 1,
  selectedId: null,
  dragging: false,
  moved: false,
  lastX: 0,
  lastY: 0
};

function renderCell(cell) {
  const element = document.createElement("article");
  element.className = "cell";
  element.dataset.cellId = cell.id;
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

  const noteAnchor = document.createElement("div");
  noteAnchor.className = "note-anchor";

  const note = document.createElement("div");
  note.className = "note";

  const label = document.createElement("strong");
  label.textContent = cell.content.title;

  const meta = document.createElement("span");
  meta.textContent = `${cell.label} · x:${cell.coord.x} y:${cell.coord.y} z:${cell.coord.z}`;

  const pointList = document.createElement("ul");
  cell.content.points.forEach((point) => {
    const item = document.createElement("li");
    item.textContent = point;
    pointList.appendChild(item);
  });

  const pin = document.createElement("span");
  pin.className = "link-pin";
  pin.title = `${cell.links.length} adjacent links`;

  note.append(label, meta, pointList);
  noteAnchor.appendChild(note);
  element.append(noteAnchor, pin);
  updateCellClasses(element, cell);

  element.addEventListener("click", (event) => {
    event.stopPropagation();
    if (viewState.moved) {
      return;
    }

    viewState.selectedId = cell.id;
    cell.opacity = cell.opacity < 1 ? 1 : 0.22;
    updateAllCellStates();
    updateSelection(cell);
  });

  return element;
}

function cellTransform(coord) {
  const { width, height, depth } = gridSpec.cellSize;
  const x = coord.x * (width + gridSpec.gap);
  const y = coord.y * (height + gridSpec.gap);
  const z = coord.z * (depth + gridSpec.gap);

  return `translate3d(${x}px, ${y}px, ${z}px)`;
}

function updateCellClasses(element, cell) {
  element.classList.toggle("is-muted", cell.opacity < 1);
  element.classList.toggle("is-selected", cell.id === viewState.selectedId);
}

function updateAllCellStates() {
  cells.forEach((cell) => {
    const element = cuboid.querySelector(`[data-cell-id="${cell.id}"]`);
    updateCellClasses(element, cell);
  });
}

function updateSelection(cell) {
  const state = cell.opacity < 1 ? "文字淡化" : "文字恢复";
  selectionText.textContent = `${cell.label} · ${cell.content.title}：${cell.content.points.join(" / ")}。当前状态：${state}。`;
}

function applyViewTransform() {
  modelStage.style.transform = `scale(${viewState.zoom}) rotateX(${viewState.rotationX}deg) rotateY(${viewState.rotationY}deg)`;
  viewReadout.textContent = `X ${Math.round(viewState.rotationX)}° · Y ${Math.round(viewState.rotationY)}° · ${Math.round(viewState.zoom * 100)}%`;
  updateBillboards();
}

function updateBillboards() {
  const noteTransform = `translate(-50%, -50%) rotateY(${-viewState.rotationY}deg) rotateX(${-viewState.rotationX}deg)`;
  const labelTransform = `rotateY(${-viewState.rotationY}deg) rotateX(${-viewState.rotationX}deg)`;

  cuboid.querySelectorAll(".note").forEach((note) => {
    note.style.transform = noteTransform;
  });

  document.querySelectorAll(".axis b").forEach((label) => {
    label.style.transform = labelTransform;
  });
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function handlePointerDown(event) {
  viewState.dragging = true;
  viewState.moved = false;
  viewState.lastX = event.clientX;
  viewState.lastY = event.clientY;
  scene.setPointerCapture(event.pointerId);
}

function handlePointerMove(event) {
  if (!viewState.dragging) {
    return;
  }

  const deltaX = event.clientX - viewState.lastX;
  const deltaY = event.clientY - viewState.lastY;
  if (Math.abs(deltaX) + Math.abs(deltaY) > 3) {
    viewState.moved = true;
  }

  viewState.rotationY += deltaX * 0.42;
  viewState.rotationX = clamp(viewState.rotationX - deltaY * 0.42, -78, 78);
  viewState.lastX = event.clientX;
  viewState.lastY = event.clientY;
  applyViewTransform();
}

function handlePointerUp(event) {
  viewState.dragging = false;
  scene.releasePointerCapture(event.pointerId);
  window.setTimeout(() => {
    viewState.moved = false;
  }, 0);
}

function handleWheel(event) {
  event.preventDefault();
  const nextZoom = viewState.zoom - event.deltaY * 0.001;
  viewState.zoom = clamp(nextZoom, 0.68, 1.42);
  applyViewTransform();
}

function resetView() {
  viewState.rotationX = -18;
  viewState.rotationY = -34;
  viewState.zoom = 1;
  viewState.selectedId = null;
  cells.forEach((cell) => {
    cell.opacity = 1;
  });
  updateAllCellStates();
  selectionText.textContent = "尚未选择。点击任意小长方体查看测试内容。";
  applyViewTransform();
}

cells.forEach((cell) => {
  cuboid.appendChild(renderCell(cell));
});

scene.addEventListener("pointerdown", handlePointerDown);
scene.addEventListener("pointermove", handlePointerMove);
scene.addEventListener("pointerup", handlePointerUp);
scene.addEventListener("pointercancel", handlePointerUp);
scene.addEventListener("wheel", handleWheel, { passive: false });
resetViewButton.addEventListener("click", resetView);

applyViewTransform();

window.knowledgeCuboidPrototype = {
  gridSpec,
  cells,
  viewState,
  resetView
};
