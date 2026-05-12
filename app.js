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
const CELL_SIZE_LIMITS = {
  width: { min: 48, max: 240 },
  height: { min: 48, max: 220 },
  depth: { min: 36, max: 220 }
};
const TEXT_SIZE_MIN = 2;
const TEXT_SIZE_MAX = 24;
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
  sliceSizes: {
    widths: Array.from({ length: gridSpec.width }, () => gridSpec.cellSize.width),
    heights: Array.from({ length: gridSpec.height }, () => gridSpec.cellSize.height),
    depths: Array.from({ length: gridSpec.depth }, () => gridSpec.cellSize.depth)
  },
  boardTexts: {}
};

let cells = [];
let editingState = null;

const faces = ["front", "back", "right", "left", "top", "bottom"];
const scene = document.querySelector("#scene");
const modelStage = document.querySelector("#modelStage");
const cuboid = document.querySelector("#cuboid");
const sliceControls = document.querySelector("#sliceControls");
const resetViewButton = document.querySelector("#resetView");
const viewReadout = document.querySelector("#viewReadout");
const spacingInput = document.querySelector("#spacingInput");
const spacingReadout = document.querySelector("#spacingReadout");
const selectionText = document.querySelector("#selectionText");
const rowRuleSelect = document.querySelector("#rowRuleSelect");
const detailPreviewSelect = document.querySelector("#detailPreviewSelect");
const textSizeInput = document.querySelector("#textSizeInput");
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
  detailPreview: false,
  textSize: 10,
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

function getBoardKeyFromCoord(coord) {
  return getBoardKey(coord.x, coord.y, coord.z);
}

function getDefaultText(index) {
  return sampleTexts[index % sampleTexts.length];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getMaxGap() {
  return Math.max(...state.sliceSizes.widths, gridSpec.cellSize.width) * 2;
}

function getGap() {
  return clamp(viewState.gap, GAP_MIN, getMaxGap());
}

function fitSizeList(list, length, fallback) {
  const next = list.slice(0, length);
  while (next.length < length) {
    next.push(next[next.length - 1] || fallback);
  }
  return next;
}

function syncSliceSizesToDimensions() {
  state.sliceSizes.widths = fitSizeList(state.sliceSizes.widths, state.dimensions.width, gridSpec.cellSize.width);
  state.sliceSizes.heights = fitSizeList(state.sliceSizes.heights, state.dimensions.height, gridSpec.cellSize.height);
  state.sliceSizes.depths = fitSizeList(state.sliceSizes.depths, state.dimensions.depth, gridSpec.cellSize.depth);
}

function sumList(list) {
  return list.reduce((total, value) => total + value, 0);
}

function getSliceOffset(list, index) {
  const gap = getGap();
  return list.slice(0, index).reduce((total, value) => total + value + gap, 0);
}

function getCellSize(coord) {
  return {
    width: state.sliceSizes.widths[coord.x] || gridSpec.cellSize.width,
    height: state.sliceSizes.heights[coord.y] || gridSpec.cellSize.height,
    depth: state.sliceSizes.depths[coord.z] || gridSpec.cellSize.depth
  };
}

function getGlobalEdgePoint(coord, edgeNumber) {
  const size = getCellSize(coord);
  const edge = getEdgeLabelSpecs(size).find((item) => item.number === edgeNumber);
  return {
    x: getSliceOffset(state.sliceSizes.widths, coord.x) + edge.x,
    y: getSliceOffset(state.sliceSizes.heights, coord.y) + edge.y,
    z: getSliceOffset(state.sliceSizes.depths, coord.z) + edge.z
  };
}

function toDimension(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return clamp(parsed, DIMENSION_MIN, DIMENSION_MAX);
}

function toCellSize(value, axis, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  const limit = CELL_SIZE_LIMITS[axis];
  return clamp(parsed, limit.min, limit.max);
}

function toTextSize(value, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return clamp(parsed, TEXT_SIZE_MIN, TEXT_SIZE_MAX);
}

function getTextLines(text) {
  return String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim());
}

function getTextLineCount(text) {
  return Math.max(1, String(text || "").split(/\r?\n/).length);
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

function getCellById(cellId) {
  return cells.find((cell) => cell.id === cellId);
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
  return Math.max(
    1,
    ...cells.map((cell) => getTextLineCount(state.boardTexts[getBoardKeyFromCoord(cell.coord)] || ""))
  );
}

function getNoteRowCount(cell) {
  if (viewState.rowRule === ROW_RULES.LOCAL) {
    return getTextLineCount(state.boardTexts[getBoardKeyFromCoord(cell.coord)] || "");
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

function selectCell(cell) {
  viewState.selectedId = cell.id;
  updateAllCellStates();
  updateSelection(cell);
}

function clearSelection() {
  viewState.selectedId = null;
  updateAllCellStates();
  selectionText.textContent = "尚未选择。";
}

function syncEditingRows() {
  if (!editingState) {
    return;
  }

  const activeCell = getCellById(editingState.cellId);
  if (!activeCell) {
    return;
  }

  const activeCount = getTextLineCount(editingState.textarea.value);
  const rowCount = viewState.rowRule === ROW_RULES.LOCAL
    ? activeCount
    : Math.max(getGlobalNoteRowCount(), activeCount);

  if (viewState.rowRule === ROW_RULES.GLOBAL_MAX) {
    cuboid.querySelectorAll(".cell").forEach((element) => {
      element.style.setProperty("--note-rows", rowCount);
    });
  } else {
    const element = cuboid.querySelector(`[data-cell-id="${activeCell.id}"]`);
    if (element) {
      element.style.setProperty("--note-rows", rowCount);
    }
  }

  updateEditingOverlayBounds();
}

function stopEditing({ commit }) {
  if (!editingState) {
    return;
  }

  const { cellId, key, originalText, textarea } = editingState;
  const nextText = commit ? textarea.value : originalText;
  state.boardTexts[key] = nextText;
  textarea.remove();
  editingState = null;
  viewState.selectedId = cellId;
  renderCells();
  renderConfig();

  const cell = getCellById(cellId);
  if (cell) {
    selectCell(cell);
  }
}

function beginEditing(cell, note) {
  if (editingState?.cellId === cell.id) {
    return;
  }

  if (editingState) {
    stopEditing({ commit: true });
  }

  const key = getBoardKeyFromCoord(cell.coord);
  const originalText = state.boardTexts[key] || "";
  viewState.selectedId = cell.id;
  updateAllCellStates();
  note.classList.add("is-editing");

  const editor = document.createElement("textarea");
  editor.className = "note-editor note-editor-overlay";
  editor.value = originalText;
  editor.spellcheck = false;
  editor.setAttribute("aria-label", `${cell.label} 文本编辑`);

  ["pointerdown", "pointerup", "click", "dblclick", "mousedown", "mouseup"].forEach((eventName) => {
    editor.addEventListener(eventName, (event) => {
      event.stopPropagation();
    });
  });
  editor.addEventListener("input", () => {
    state.boardTexts[key] = editor.value;
    syncEditingRows();
  });
  editor.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      stopEditing({ commit: false });
      return;
    }

    if (event.key === "Enter" && !event.shiftKey && !event.altKey) {
      event.preventDefault();
      event.stopPropagation();
      stopEditing({ commit: true });
      return;
    }

    if (event.key === "Enter") {
      window.setTimeout(syncEditingRows, 0);
    }
  });

  document.body.appendChild(editor);
  editingState = { cellId: cell.id, key, originalText, textarea: editor, note, noteRect: null };
  syncEditingRows();
  updateEditingOverlayBounds();
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);
}

function toPixels(value) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function scaleBoxValue(value, scale) {
  return value
    .split(/\s+/)
    .map((part) => `${toPixels(part) * scale}px`)
    .join(" ");
}

function updateEditingOverlayBounds() {
  if (!editingState) {
    return;
  }

  const { note, textarea } = editingState;
  if (!note.isConnected || !textarea.isConnected) {
    return;
  }

  const rect = note.getBoundingClientRect();
  const noteStyle = window.getComputedStyle(note);
  const lineStyle = window.getComputedStyle(note.querySelector(".note-line") || note);
  const visualScale = note.offsetHeight > 0 ? rect.height / note.offsetHeight : 1;
  const fontSize = toPixels(lineStyle.fontSize) * visualScale;
  const lineHeight = toPixels(lineStyle.lineHeight) * visualScale;

  editingState.noteRect = {
    left: rect.left,
    right: rect.right,
    top: rect.top,
    bottom: rect.bottom
  };

  textarea.style.left = `${rect.left}px`;
  textarea.style.top = `${rect.top}px`;
  textarea.style.width = `${rect.width}px`;
  textarea.style.height = `${rect.height}px`;
  textarea.style.padding = scaleBoxValue(noteStyle.padding, visualScale);
  textarea.style.borderRadius = noteStyle.borderRadius;
  textarea.style.fontSize = `${fontSize}px`;
  textarea.style.fontWeight = lineStyle.fontWeight;
  textarea.style.lineHeight = `${lineHeight}px`;
}

function isPointInsideElement(event, element) {
  const rect = element.getBoundingClientRect();
  return event.clientX >= rect.left
    && event.clientX <= rect.right
    && event.clientY >= rect.top
    && event.clientY <= rect.bottom;
}

function createCellBillboardLabel({ className, text, baseTransform, title }) {
  const label = document.createElement("span");
  label.className = className;
  label.textContent = text;
  label.title = title;
  label.dataset.baseTransform = baseTransform;
  label.style.transform = baseTransform;
  return label;
}

function getEdgeLabelSpecs(size) {
  const { width, height, depth } = size;
  const frontZ = depth / 2 + 1;
  const backZ = -depth / 2 - 1;

  return [
    { number: 1, x: width / 2, y: 0, z: frontZ },
    { number: 2, x: width, y: height / 2, z: frontZ },
    { number: 3, x: width / 2, y: height, z: frontZ },
    { number: 4, x: 0, y: height / 2, z: frontZ },
    { number: 5, x: width / 2, y: 0, z: backZ },
    { number: 6, x: width, y: height / 2, z: backZ },
    { number: 7, x: width / 2, y: height, z: backZ },
    { number: 8, x: 0, y: height / 2, z: backZ },
    { number: 9, x: 0, y: 0, z: 0 },
    { number: 10, x: width, y: 0, z: 0 },
    { number: 11, x: width, y: height, z: 0 },
    { number: 12, x: 0, y: height, z: 0 }
  ];
}

function renderCell(cell) {
  const element = document.createElement("article");
  const size = getCellSize(cell.coord);
  const cellNumber = getBoardIndex(cell.coord.x, cell.coord.y, cell.coord.z) + 1;
  let cellPointerStart = null;
  element.className = "cell";
  element.dataset.cellId = cell.id;
  element.style.setProperty("--w", `${size.width}px`);
  element.style.setProperty("--h", `${size.height}px`);
  element.style.setProperty("--d", `${size.depth}px`);
  element.style.setProperty("--note-font", `${viewState.textSize}px`);
  element.style.setProperty("--note-rows", getNoteRowCount(cell));
  element.style.transform = cellTransform(cell.coord);
  element.setAttribute("aria-label", `${cell.label}, x ${cell.coord.x + 1}, y ${cell.coord.y + 1}, z ${cell.coord.z + 1}`);

  faces.forEach((faceName) => {
    const face = document.createElement("span");
    face.className = `face ${faceName}`;
    element.appendChild(face);
  });

  element.appendChild(createCellBillboardLabel({
    className: "cell-number cell-billboard-label",
    text: String(cellNumber),
    baseTransform: `translate3d(8px, 12px, ${size.depth / 2 + 2}px)`,
    title: `小长方体 ${cellNumber}`
  }));

  getEdgeLabelSpecs(size).forEach((edge) => {
    const edgeKey = `${cellNumber}-${edge.number}`;
    const isMarkedEdge = edgeKey === "1-8" || edgeKey === "4-8";
    element.appendChild(createCellBillboardLabel({
      className: `edge-label cell-billboard-label${isMarkedEdge ? " is-marked-edge" : ""}`,
      text: String(edge.number),
      baseTransform: `translate3d(${edge.x}px, ${edge.y}px, ${edge.z}px) translate(-50%, -50%)`,
      title: edgeKey
    }));
  });

  const noteAnchor = document.createElement("div");
  noteAnchor.className = "note-anchor";

  const note = document.createElement("div");
  note.className = "note";
  note.title = getFullText(cell);
  note.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  note.addEventListener("click", (event) => {
    event.stopPropagation();
    if (viewState.moved) {
      return;
    }

    if (editingState) {
      stopEditing({ commit: true });
    }
    selectCell(cell);
  });
  note.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (viewState.moved) {
      return;
    }

    if (editingState) {
      stopEditing({ commit: true });
    }
    selectCell(cell);
    beginEditing(cell, note);
  });

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

  element.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    cellPointerStart = {
      x: event.clientX,
      y: event.clientY,
      wasSelected: viewState.selectedId === cell.id
    };
  });

  element.addEventListener("pointerup", (event) => {
    if (!cellPointerStart) {
      return;
    }

    event.stopPropagation();
    const pointerStart = cellPointerStart;
    const deltaX = Math.abs(event.clientX - pointerStart.x);
    const deltaY = Math.abs(event.clientY - pointerStart.y);
    cellPointerStart = null;

    if (deltaX + deltaY > 3) {
      return;
    }

    if (editingState) {
      stopEditing({ commit: true });
    }
    selectCell(cell);
  });

  element.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  element.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (viewState.moved || !isPointInsideElement(event, note)) {
      return;
    }

    if (editingState) {
      stopEditing({ commit: true });
    }
    selectCell(cell);
    beginEditing(cell, note);
  });

  return element;
}

function renderCells() {
  syncSliceSizesToDimensions();
  buildCells();
  cuboid.replaceChildren();
  cuboid.classList.toggle("has-detail-preview", viewState.detailPreview);
  updateSpacingControls();
  setCuboidBounds();
  cells.forEach((cell) => {
    cuboid.appendChild(renderCell(cell));
  });
  renderSliceControls();
  applyViewTransform();
}

function setCuboidBounds() {
  const gap = getGap();
  const totalWidth = sumList(state.sliceSizes.widths) + (state.dimensions.width - 1) * gap;
  const totalHeight = sumList(state.sliceSizes.heights) + (state.dimensions.height - 1) * gap;
  const totalDepth = sumList(state.sliceSizes.depths) + (state.dimensions.depth - 1) * gap;

  cuboid.style.width = `${totalWidth}px`;
  cuboid.style.height = `${totalHeight}px`;
  cuboid.style.left = `calc(50% - ${totalWidth / 2}px)`;
  cuboid.style.top = `calc(50% - ${totalHeight / 2}px)`;
  cuboid.style.transform = `translateZ(${-totalDepth / 2}px)`;
  sliceControls.style.left = cuboid.style.left;
  sliceControls.style.top = cuboid.style.top;
  sliceControls.style.width = cuboid.style.width;
  sliceControls.style.height = cuboid.style.height;
  sliceControls.style.transform = cuboid.style.transform;
}

function cellTransform(coord) {
  const x = getSliceOffset(state.sliceSizes.widths, coord.x);
  const y = getSliceOffset(state.sliceSizes.heights, coord.y);
  const z = getSliceOffset(state.sliceSizes.depths, coord.z);

  return `translate3d(${x}px, ${y}px, ${z}px)`;
}

function updateSpacingControls() {
  const maxGap = getMaxGap();
  const gap = getGap();
  viewState.gap = gap;
  spacingInput.min = String(GAP_MIN);
  spacingInput.max = String(maxGap);
  spacingInput.value = String(gap);
  spacingReadout.value = `${gap} px`;
  spacingReadout.textContent = `${gap} px`;
}

function updateShapeControls() {
  textSizeInput.value = viewState.textSize;
}

function getModelTotals() {
  const gap = getGap();
  return {
    width: sumList(state.sliceSizes.widths) + (state.dimensions.width - 1) * gap,
    height: sumList(state.sliceSizes.heights) + (state.dimensions.height - 1) * gap,
    depth: sumList(state.sliceSizes.depths) + (state.dimensions.depth - 1) * gap
  };
}

function createSliceControl({ axis, index, label, value, min, max, baseTransform }) {
  const field = document.createElement("label");
  field.className = `slice-control slice-control-${axis}`;
  field.dataset.axis = axis;
  field.dataset.index = String(index);
  field.dataset.baseTransform = baseTransform;

  const input = document.createElement("input");
  input.type = "number";
  input.min = String(min);
  input.max = String(max);
  input.step = "1";
  input.value = String(value);
  input.setAttribute("aria-label", `${label}，范围 ${min} 到 ${max}`);

  ["pointerdown", "pointerup", "click", "dblclick", "mousedown", "mouseup"].forEach((eventName) => {
    field.addEventListener(eventName, (event) => {
      event.stopPropagation();
    });
  });

  input.addEventListener("change", () => syncSliceControlInput(input));
  input.addEventListener("blur", () => syncSliceControlInput(input));
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    syncSliceControlInput(input);
    input.blur();
  });

  field.appendChild(input);
  return field;
}

function renderSliceControls() {
  const { width, height, depth } = getModelTotals();
  const gap = getGap();
  const fragment = document.createDocumentFragment();

  state.sliceSizes.widths.forEach((value, index) => {
    const x = getSliceOffset(state.sliceSizes.widths, index) + value / 2;
    const y = height + 24;
    const z = depth - 26;
    fragment.appendChild(createSliceControl({
      axis: "width",
      index,
      label: `宽 ${index + 1}`,
      value,
      min: CELL_SIZE_LIMITS.width.min,
      max: CELL_SIZE_LIMITS.width.max,
      baseTransform: `translate3d(${x}px, ${y}px, ${z}px)`
    }));
  });

  state.sliceSizes.heights.forEach((value, index) => {
    const edgePoint = getGlobalEdgePoint({ x: 0, y: index, z: 0 }, 8);
    fragment.appendChild(createSliceControl({
      axis: "height",
      index,
      label: `高 ${index + 1}`,
      value,
      min: CELL_SIZE_LIMITS.height.min,
      max: CELL_SIZE_LIMITS.height.max,
      baseTransform: `translate3d(${edgePoint.x - 12}px, ${edgePoint.y}px, ${edgePoint.z - 12}px)`
    }));
  });

  state.sliceSizes.depths.forEach((value, index) => {
    const x = -6;
    const y = height + 24;
    const z = getSliceOffset(state.sliceSizes.depths, index) + value / 2 - 30;
    fragment.appendChild(createSliceControl({
      axis: "depth",
      index,
      label: `深 ${index + 1}`,
      value,
      min: CELL_SIZE_LIMITS.depth.min,
      max: CELL_SIZE_LIMITS.depth.max,
      baseTransform: `translate3d(${x}px, ${y}px, ${z}px)`
    }));
  });

  sliceControls.replaceChildren(fragment);
  updateBillboards();
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
  renderSliceControls();
  updateSpacingControls();
  applyViewTransform();
}

function updateCellClasses(element, cell) {
  if (!element) {
    return;
  }

  element.classList.toggle("is-muted", cell.opacity < 1);
  element.classList.toggle("is-selected", cell.id === viewState.selectedId);
  element.classList.toggle("is-editing", editingState?.cellId === cell.id);
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
  updateEditingOverlayBounds();
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

  cuboid.querySelectorAll(".cell-billboard-label").forEach((label) => {
    label.style.transform = `${label.dataset.baseTransform} ${labelTransform}`;
  });

  sliceControls.querySelectorAll(".slice-control").forEach((control) => {
    control.style.transform = `${control.dataset.baseTransform} ${labelTransform}`;
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
  if (editingState) {
    stopEditing({ commit: true });
  }

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
  syncSliceSizesToDimensions();
  viewState.selectedId = null;
  ensureBoardTexts();
  renderCells();
  renderConfig();
}

function syncShapeControlsFromInputs({ allowFallback = true } = {}) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const nextTextSize = Number.parseInt(textSizeInput.value, 10);

  if (!allowFallback && Number.isNaN(nextTextSize)) {
    return;
  }

  viewState.textSize = toTextSize(textSizeInput.value, viewState.textSize);
  updateShapeControls();
  renderCells();
}

function syncSliceControlInput(input) {
  const field = input.closest(".slice-control");
  if (!field) {
    return;
  }

  if (editingState) {
    stopEditing({ commit: true });
  }

  const axis = field.dataset.axis;
  const index = Number.parseInt(field.dataset.index, 10);
  const listName = `${axis}s`;
  const fallback = state.sliceSizes[listName][index];
  const nextValue = toCellSize(input.value, axis, fallback);
  state.sliceSizes[listName][index] = nextValue;
  viewState.selectedId = null;
  renderCells();
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
  if (editingState) {
    stopEditing({ commit: true });
  }

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
window.addEventListener("resize", updateEditingOverlayBounds);
resetViewButton.addEventListener("click", resetView);
spacingInput.addEventListener("input", () => {
  viewState.gap = Number.parseInt(spacingInput.value, 10);
  applyCellSpacing();
});
rowRuleSelect.addEventListener("change", () => {
  if (editingState) {
    stopEditing({ commit: true });
  }

  viewState.rowRule = rowRuleSelect.value;
  renderCells();
});
detailPreviewSelect.addEventListener("change", () => {
  viewState.detailPreview = detailPreviewSelect.value === "on";
  cuboid.classList.toggle("has-detail-preview", viewState.detailPreview);
});

[widthInput, heightInput, depthInput].forEach((input) => {
  input.addEventListener("input", () => syncDimensionsFromInputs({ allowFallback: false }));
  input.addEventListener("change", () => syncDimensionsFromInputs());
  input.addEventListener("blur", () => syncDimensionsFromInputs());
});

textSizeInput.addEventListener("input", () => syncShapeControlsFromInputs({ allowFallback: false }));
textSizeInput.addEventListener("change", () => syncShapeControlsFromInputs());
textSizeInput.addEventListener("blur", () => syncShapeControlsFromInputs());
textSizeInput.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") {
    return;
  }

  event.preventDefault();
  syncShapeControlsFromInputs();
  textSizeInput.blur();
});

fillDefaultsButton.addEventListener("click", () => {
  if (editingState) {
    stopEditing({ commit: true });
  }

  ensureBoardTexts({ reset: true });
  renderCells();
  renderConfig();
});

tabButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchPage(button.dataset.pageTarget);
  });
});

document.addEventListener("click", (event) => {
  if (editingState) {
    const rect = editingState.noteRect;
    const isInsideNote = rect
      && event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom;

    if (editingState.textarea.contains(event.target) || isInsideNote) {
      editingState.textarea.focus();
      return;
    }

    stopEditing({ commit: true });
    return;
  }

  clearSelection();
});

document.addEventListener("keydown", (event) => {
  if (event.key !== "Escape" || editingState) {
    return;
  }

  if (viewState.selectedId) {
    event.preventDefault();
    clearSelection();
  }
});

ensureBoardTexts();
updateShapeControls();
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
