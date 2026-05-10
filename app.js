const gridSpec = {
  width: 3,
  height: 2,
  depth: 2,
  cellSize: {
    width: 116,
    height: 92,
    depth: 86
  },
  gap: 8
};

const ZOOM_BASE = 2;
const ZOOM_MIN = 0.55;
const ZOOM_MAX = 7;
const DIMENSION_MIN = 1;
const DIMENSION_MAX = 8;
const GAP_MIN = gridSpec.gap;
const ROW_RULES = {
  GLOBAL_MAX: "global-max",
  LOCAL: "local"
};

const sampleTexts = [
  "核心论点\n定义问题\n限定范围\n提出判断",
  "第一条理由\n因果链\n关键证据\n反例边界",
  "第二条理由\n比较对象\n差异来源\n适用条件",
  "选择节点\n如果 A 成立\n转向方案 1\n否则检查 B",
  "证据组\n数据\n案例\n可信度",
  "反方观点\n对方假设\n薄弱点\n回应方式",
  "相邻连接\n和 Cell 01 匹配\n和 Cell 10 对照\n形成链条",
  "例子\n具体场景\n变量变化\n结论回扣",
  "判断规则\n阈值\n例外\n下一步",
  "记忆提示\n关键词\n图像化\n复述句",
  "小决策树\n问题\n分支\n结果\n反思过程\n总结经验",
  "复习出口\n总结\n盲点\n下一轮"
];

const state = {
  dimensions: {
    width: gridSpec.width,
    height: gridSpec.height,
    depth: gridSpec.depth
  },
  boardTexts: {}
};

let cells = [];

const faces = ["front", "back", "right", "left", "top", "bottom"];
const scene = document.querySelector("#scene");
const modelStage = document.querySelector("#modelStage");
const cuboid = document.querySelector("#cuboid");
const resetViewButton = document.querySelector("#resetView");
const viewReadout = document.querySelector("#viewReadout");
const spacingInput = document.querySelector("#spacingInput");
const spacingReadout = document.querySelector("#spacingReadout");
const selectionText = document.querySelector("#selectionText");
const rowRuleSelect = document.querySelector("#rowRuleSelect");
const widthInput = document.querySelector("#widthInput");
const heightInput = document.querySelector("#heightInput");
const depthInput = document.querySelector("#depthInput");
const structureReadout = document.querySelector("#structureReadout");
const boardEditorGrid = document.querySelector("#boardEditorGrid");
const fillDefaultsButton = document.querySelector("#fillDefaultsButton");
const tabButtons = document.querySelectorAll(".tab-button");
const pages = document.querySelectorAll(".page");

const viewState = {
  rotationX: -18,
  rotationY: -34,
  zoom: ZOOM_BASE,
  gap: GAP_MIN,
  rowRule: ROW_RULES.GLOBAL_MAX,
  selectedId: null,
  dragging: false,
  moved: false,
  lastX: 0,
  lastY: 0
};

function getBoardKey(x, y, z) {
  return `${x}-${y}-${z}`;
}

function getBoardIndex(x, y, z) {
  return z * state.dimensions.width * state.dimensions.height + y * state.dimensions.width + x;
}

function getDefaultText(index) {
  return sampleTexts[index % sampleTexts.length];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMaxGap() {
  return gridSpec.cellSize.width * 2;
}

function getGap() {
  return clamp(viewState.gap, GAP_MIN, getMaxGap());
}

function toDimension(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return clamp(parsed, DIMENSION_MIN, DIMENSION_MAX);
}

function getTextLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function ensureBoardTexts({ reset = false } = {}) {
  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        const key = getBoardKey(x, y, z);
        if (reset || typeof state.boardTexts[key] !== "string") {
          state.boardTexts[key] = getDefaultText(getBoardIndex(x, y, z));
        }
      }
    }
  }
}

function getCellAt(x, y, z) {
  return cells.find((cell) => cell.coord.x === x && cell.coord.y === y && cell.coord.z === z);
}

function buildCells() {
  ensureBoardTexts();
  const nextCells = [];

  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        const index = getBoardIndex(x, y, z);
        const lines = getTextLines(state.boardTexts[getBoardKey(x, y, z)]);
        const title = lines[0] || `板子 ${String(index + 1).padStart(2, "0")}`;
        const points = lines.slice(1);

        nextCells.push({
          id: `cell-${String(index + 1).padStart(2, "0")}`,
          label: `第 ${z + 1} 深 / 第 ${y + 1} 行 / 第 ${x + 1} 列`,
          coord: { x, y, z },
          content: {
            title,
            type: "板子",
            points
          },
          opacity: 1,
          links: []
        });
      }
    }
  }

  cells = nextCells;
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
}

function getGlobalNoteRowCount() {
  return Math.max(1, ...cells.map((cell) => [cell.content.title, ...cell.content.points].length));
}

function getNoteRowCount(cell) {
  if (viewState.rowRule === ROW_RULES.LOCAL) {
    return Math.max(1, [cell.content.title, ...cell.content.points].length);
  }

  return getGlobalNoteRowCount();
}

function getNoteRows(cell) {
  const rows = [cell.content.title, ...cell.content.points];
  const rowCount = getNoteRowCount(cell);
  while (rows.length < rowCount) {
    rows.push("");
  }
  return rows.slice(0, rowCount);
}

function getFullText(cell) {
  const detail = [cell.content.title, ...cell.content.points].filter(Boolean).join(" / ");
  return `${cell.label}: ${detail}`;
}

function renderCell(cell) {
  const element = document.createElement("article");
  element.className = "cell";
  element.dataset.cellId = cell.id;
  element.style.setProperty("--w", `${gridSpec.cellSize.width}px`);
  element.style.setProperty("--h", `${gridSpec.cellSize.height}px`);
  element.style.setProperty("--d", `${gridSpec.cellSize.depth}px`);
  element.style.setProperty("--note-rows", getNoteRowCount(cell));
  element.style.transform = cellTransform(cell.coord);
  element.setAttribute("aria-label", `${cell.label}, x ${cell.coord.x + 1}, y ${cell.coord.y + 1}, z ${cell.coord.z + 1}`);

  faces.forEach((faceName) => {
    const face = document.createElement("span");
    face.className = `face ${faceName}`;
    element.appendChild(face);
  });

  const noteAnchor = document.createElement("div");
  noteAnchor.className = "note-anchor";

  const note = document.createElement("div");
  note.className = "note";
  note.title = getFullText(cell);

  const rowList = document.createElement("ul");
  rowList.className = "note-lines";

  getNoteRows(cell).forEach((line, index) => {
    const item = document.createElement("li");
    item.className = "note-line";
    item.textContent = line;
    item.title = line;
    item.dataset.empty = line ? "false" : "true";
    item.dataset.row = String(index + 1);
    rowList.appendChild(item);
  });

  const detail = document.createElement("div");
  detail.className = "detail-popover";
  detail.setAttribute("aria-hidden", "true");

  const detailLabel = document.createElement("span");
  detailLabel.className = "detail-label";
  detailLabel.textContent = cell.label;

  const detailTitle = document.createElement("strong");
  detailTitle.textContent = cell.content.title;

  const detailPoints = document.createElement("p");
  detailPoints.textContent = cell.content.points.join(" / ");

  detail.append(detailLabel, detailTitle, detailPoints);
  note.append(rowList, detail);
  noteAnchor.appendChild(note);

  const pin = document.createElement("span");
  pin.className = "link-pin";
  pin.title = `${cell.links.length} adjacent links`;

  element.append(noteAnchor, pin);
  updateCellClasses(element, cell);

  element.addEventListener("click", (event) => {
    event.stopPropagation();
    if (viewState.moved) {
      return;
    }

    viewState.selectedId = viewState.selectedId === cell.id ? null : cell.id;
    updateAllCellStates();
    updateSelection(cell);
  });

  return element;
}

function renderCells() {
  buildCells();
  cuboid.replaceChildren();
  updateSpacingControls();
  setCuboidBounds();
  cells.forEach((cell) => {
    cuboid.appendChild(renderCell(cell));
  });
  applyViewTransform();
}

function setCuboidBounds() {
  const { width, height, depth } = gridSpec.cellSize;
  const gap = getGap();
  const totalWidth = state.dimensions.width * width + (state.dimensions.width - 1) * gap;
  const totalHeight = state.dimensions.height * height + (state.dimensions.height - 1) * gap;
  const totalDepth = state.dimensions.depth * depth + (state.dimensions.depth - 1) * gap;

  cuboid.style.width = `${totalWidth}px`;
  cuboid.style.height = `${totalHeight}px`;
  cuboid.style.left = `calc(50% - ${totalWidth / 2}px)`;
  cuboid.style.top = `calc(50% - ${totalHeight / 2}px)`;
  cuboid.style.transform = `translateZ(${-totalDepth / 2}px)`;
}

function cellTransform(coord) {
  const { width, height, depth } = gridSpec.cellSize;
  const gap = getGap();
  const x = coord.x * (width + gap);
  const y = coord.y * (height + gap);
  const z = coord.z * (depth + gap);

  return `translate3d(${x}px, ${y}px, ${z}px)`;
}

function updateSpacingControls() {
  const maxGap = getMaxGap();
  const gap = getGap();
  spacingInput.min = String(GAP_MIN);
  spacingInput.max = String(maxGap);
  spacingInput.value = String(gap);
  spacingReadout.value = `${gap} px`;
  spacingReadout.textContent = `${gap} px`;
}

function applyCellSpacing() {
  const gap = getGap();
  viewState.gap = gap;
  setCuboidBounds();
  cells.forEach((cell) => {
    const element = cuboid.querySelector(`[data-cell-id="${cell.id}"]`);
    if (element) {
      element.style.transform = cellTransform(cell.coord);
    }
  });
  updateSpacingControls();
  applyViewTransform();
}

function updateCellClasses(element, cell) {
  if (!element) {
    return;
  }

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
  const selected = viewState.selectedId === cell.id;
  selectionText.textContent = selected ? getFullText(cell) : "尚未选择。";
}

function applyViewTransform() {
  modelStage.style.transform = `scale(${viewState.zoom}) rotateX(${viewState.rotationX}deg) rotateY(${viewState.rotationY}deg)`;
  viewReadout.textContent = `X ${Math.round(viewState.rotationX)} deg · Y ${Math.round(viewState.rotationY)} deg · ${Math.round((viewState.zoom / ZOOM_BASE) * 100)}%`;
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

function renderConfig() {
  const count = state.dimensions.width * state.dimensions.height * state.dimensions.depth;
  widthInput.value = state.dimensions.width;
  heightInput.value = state.dimensions.height;
  depthInput.value = state.dimensions.depth;
  structureReadout.textContent = `当前共有 ${state.dimensions.depth} × ${state.dimensions.height} × ${state.dimensions.width} = ${count} 个板子`;

  const fragment = document.createDocumentFragment();

  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        const key = getBoardKey(x, y, z);
        const field = document.createElement("label");
        field.className = "board-field";

        const title = document.createElement("span");
        title.className = "board-field-title";
        title.textContent = `第 ${z + 1} 深 / 第 ${y + 1} 行 / 第 ${x + 1} 列`;

        const textarea = document.createElement("textarea");
        textarea.value = state.boardTexts[key] || "";
        textarea.rows = 4;
        textarea.spellcheck = false;
        textarea.dataset.boardKey = key;
        textarea.addEventListener("input", () => {
          state.boardTexts[key] = textarea.value;
          viewState.selectedId = null;
          renderCells();
          structureReadout.textContent = `当前共有 ${state.dimensions.depth} × ${state.dimensions.height} × ${state.dimensions.width} = ${count} 个板子`;
        });

        field.append(title, textarea);
        fragment.appendChild(field);
      }
    }
  }

  boardEditorGrid.replaceChildren(fragment);
}

function syncDimensionsFromInputs({ allowFallback = true } = {}) {
  const nextWidth = Number.parseInt(widthInput.value, 10);
  const nextHeight = Number.parseInt(heightInput.value, 10);
  const nextDepth = Number.parseInt(depthInput.value, 10);

  if (!allowFallback && [nextWidth, nextHeight, nextDepth].some((value) => Number.isNaN(value))) {
    return;
  }

  state.dimensions.width = toDimension(widthInput.value, state.dimensions.width);
  state.dimensions.height = toDimension(heightInput.value, state.dimensions.height);
  state.dimensions.depth = toDimension(depthInput.value, state.dimensions.depth);
  gridSpec.width = state.dimensions.width;
  gridSpec.height = state.dimensions.height;
  gridSpec.depth = state.dimensions.depth;
  viewState.selectedId = null;
  ensureBoardTexts();
  renderCells();
  renderConfig();
}

function switchPage(targetId) {
  tabButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.pageTarget === targetId);
  });

  pages.forEach((page) => {
    const active = page.id === targetId;
    page.classList.toggle("is-active", active);
    page.hidden = !active;
  });

  if (targetId === "previewPage") {
    applyViewTransform();
  }
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
  const nextZoom = viewState.zoom - event.deltaY * 0.003;
  viewState.zoom = clamp(nextZoom, ZOOM_MIN, ZOOM_MAX);
  applyViewTransform();
}

function resetView() {
  viewState.rotationX = -18;
  viewState.rotationY = -34;
  viewState.zoom = ZOOM_BASE;
  viewState.selectedId = null;
  cells.forEach((cell) => {
    cell.opacity = 1;
  });
  updateAllCellStates();
  selectionText.textContent = "尚未选择。";
  applyViewTransform();
}

scene.addEventListener("pointerdown", handlePointerDown);
scene.addEventListener("pointermove", handlePointerMove);
scene.addEventListener("pointerup", handlePointerUp);
scene.addEventListener("pointercancel", handlePointerUp);
scene.addEventListener("wheel", handleWheel, { passive: false });
resetViewButton.addEventListener("click", resetView);
spacingInput.addEventListener("input", () => {
  viewState.gap = Number.parseInt(spacingInput.value, 10);
  applyCellSpacing();
});
rowRuleSelect.addEventListener("change", () => {
  viewState.rowRule = rowRuleSelect.value;
  renderCells();
});

[widthInput, heightInput, depthInput].forEach((input) => {
  input.addEventListener("input", () => syncDimensionsFromInputs({ allowFallback: false }));
  input.addEventListener("change", () => syncDimensionsFromInputs());
  input.addEventListener("blur", () => syncDimensionsFromInputs());
});

fillDefaultsButton.addEventListener("click", () => {
  ensureBoardTexts({ reset: true });
  renderCells();
  renderConfig();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchPage(button.dataset.pageTarget);
  });
});

document.addEventListener("click", () => {
  viewState.selectedId = null;
  updateAllCellStates();
  selectionText.textContent = "尚未选择。";
});

ensureBoardTexts();
renderCells();
renderConfig();

window.knowledgeBoard = {
  gridSpec,
  state,
  get cells() {
    return cells;
  },
  viewState,
  ROW_RULES,
  resetView
};
