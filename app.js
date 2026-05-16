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
const HISTORY_LIMIT = 10;
const SAVE_ENDPOINT = "/api/state";
const ROW_RULES = {
  GLOBAL_MAX: "global-max",
  LOCAL: "local"
};
const BLOCK_TYPES = {
  HEADING: "heading",
  PARAGRAPH: "paragraph",
  BULLET: "bullet",
  NUMBERED: "numbered"
};
const INLINE_MARK_TYPES = new Set(["superscript", "subscript", "bold", "italic", "underline", "color", "fontSize"]);
const FORMAT_SIZE_MIN = 8;
const FORMAT_SIZE_MAX = 24;
const FORMAT_SIZE_STEP = 1;
const INDENT_MIN = 0;
const INDENT_MAX = 4;
const BULLET_LIST_STYLES = ["disc", "circle", "diamond"];
const NUMBERED_LIST_STYLES = ["decimal", "lower-alpha", "lower-roman"];

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
  boards: {}
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
const markerVisibilitySelect = document.querySelector("#markerVisibilitySelect");
const textSizeInput = document.querySelector("#textSizeInput");
const widthInput = document.querySelector("#widthInput");
const heightInput = document.querySelector("#heightInput");
const depthInput = document.querySelector("#depthInput");
const addWidthLeftButton = document.querySelector("#addWidthLeftButton");
const removeWidthLeftButton = document.querySelector("#removeWidthLeftButton");
const addWidthRightButton = document.querySelector("#addWidthRightButton");
const removeWidthRightButton = document.querySelector("#removeWidthRightButton");
const addHeightTopButton = document.querySelector("#addHeightTopButton");
const removeHeightTopButton = document.querySelector("#removeHeightTopButton");
const addHeightBottomButton = document.querySelector("#addHeightBottomButton");
const removeHeightBottomButton = document.querySelector("#removeHeightBottomButton");
const addDepthFrontButton = document.querySelector("#addDepthFrontButton");
const removeDepthFrontButton = document.querySelector("#removeDepthFrontButton");
const addDepthBackButton = document.querySelector("#addDepthBackButton");
const removeDepthBackButton = document.querySelector("#removeDepthBackButton");
const structureReadout = document.querySelector("#structureReadout");
const undoButton = document.querySelector("#undoButton");
const redoButton = document.querySelector("#redoButton");
const saveButton = document.querySelector("#saveButton");
const saveStatus = document.querySelector("#saveStatus");
const minimizeBoardsButton = document.querySelector("#minimizeBoardsButton");
const maximizeBoardsButton = document.querySelector("#maximizeBoardsButton");
const minimizeBoxesButton = document.querySelector("#minimizeBoxesButton");
const maximizeBoxesButton = document.querySelector("#maximizeBoxesButton");
const topFormatToolbar = document.querySelector("#topFormatToolbar");

const viewState = {
  rotationX: -18,
  rotationY: -34,
  zoom: ZOOM_BASE,
  gap: GAP_MIN,
  rowRule: ROW_RULES.GLOBAL_MAX,
  detailPreview: false,
  markersVisible: false,
  textSize: 10,
  selectedId: null,
  selectedIds: new Set(),
  dragging: false,
  moved: false,
  lastX: 0,
  lastY: 0
};

const historyState = {
  undoStack: [],
  redoStack: [],
  isRestoring: false
};

const saveState = {
  isDirty: false,
  isSaving: false,
  lastSavedAt: null,
  loadError: null
};

let spacingChangeSnapshot = null;
let textSizeChangeSnapshot = null;

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

function cloneData(value) {
  return JSON.parse(JSON.stringify(value));
}

function createHistorySnapshot() {
  return {
    dimensions: cloneData(state.dimensions),
    sliceSizes: cloneData(state.sliceSizes),
    boards: cloneData(state.boards),
    view: {
      gap: viewState.gap,
      rowRule: viewState.rowRule,
      detailPreview: viewState.detailPreview,
      markersVisible: viewState.markersVisible,
      textSize: viewState.textSize
    }
  };
}

function areSnapshotsEqual(first, second) {
  return JSON.stringify(first) === JSON.stringify(second);
}

function updateHistoryButtons() {
  undoButton.disabled = historyState.undoStack.length === 0;
  redoButton.disabled = historyState.redoStack.length === 0;
}

function updateSaveStatus({ variant = null, message = null } = {}) {
  saveButton.disabled = saveState.isSaving;
  saveStatus.classList.toggle("is-dirty", saveState.isDirty && variant !== "error");
  saveStatus.classList.toggle("is-error", variant === "error");

  if (message) {
    saveStatus.textContent = message;
    return;
  }

  if (saveState.isSaving) {
    saveStatus.textContent = "保存中";
    return;
  }

  saveStatus.textContent = saveState.isDirty ? "未保存" : "已保存";
}

function markDirty() {
  saveState.isDirty = true;
  updateSaveStatus();
}

function commitHistorySnapshot(beforeSnapshot) {
  if (historyState.isRestoring || !beforeSnapshot) {
    return;
  }

  const afterSnapshot = createHistorySnapshot();
  if (areSnapshotsEqual(beforeSnapshot, afterSnapshot)) {
    updateHistoryButtons();
    return;
  }

  historyState.undoStack.push(beforeSnapshot);
  if (historyState.undoStack.length > HISTORY_LIMIT) {
    historyState.undoStack.shift();
  }
  historyState.redoStack = [];
  updateHistoryButtons();
  markDirty();
}

function applyHistorySnapshot(snapshot) {
  historyState.isRestoring = true;
  state.dimensions = cloneData(snapshot.dimensions);
  state.sliceSizes = cloneData(snapshot.sliceSizes);
  state.boards = cloneData(snapshot.boards);
  gridSpec.width = state.dimensions.width;
  gridSpec.height = state.dimensions.height;
  gridSpec.depth = state.dimensions.depth;
  viewState.gap = snapshot.view.gap;
  viewState.rowRule = snapshot.view.rowRule;
  viewState.detailPreview = snapshot.view.detailPreview;
  viewState.markersVisible = snapshot.view.markersVisible;
  viewState.textSize = snapshot.view.textSize;
  viewState.selectedId = null;
  viewState.selectedIds.clear();

  rowRuleSelect.value = viewState.rowRule;
  detailPreviewSelect.value = viewState.detailPreview ? "on" : "off";
  markerVisibilitySelect.value = viewState.markersVisible ? "on" : "off";
  updateShapeControls();
  renderCells();
  renderConfig();
  selectionText.textContent = "尚未选择。";
  updateWindowControlButtons();
  historyState.isRestoring = false;
  updateHistoryButtons();
}

function undoHistoryStep() {
  if (editingState) {
    stopEditing({ commit: true });
  }

  if (historyState.undoStack.length === 0) {
    return;
  }

  const currentSnapshot = createHistorySnapshot();
  const previousSnapshot = historyState.undoStack.pop();
  historyState.redoStack.push(currentSnapshot);
  applyHistorySnapshot(previousSnapshot);
  markDirty();
}

function redoHistoryStep() {
  if (editingState) {
    stopEditing({ commit: true });
  }

  if (historyState.redoStack.length === 0) {
    return;
  }

  const currentSnapshot = createHistorySnapshot();
  const nextSnapshot = historyState.redoStack.pop();
  historyState.undoStack.push(currentSnapshot);
  if (historyState.undoStack.length > HISTORY_LIMIT) {
    historyState.undoStack.shift();
  }
  applyHistorySnapshot(nextSnapshot);
  markDirty();
}

function createPersistedState() {
  return {
    schemaVersion: 1,
    savedAt: new Date().toISOString(),
    dimensions: cloneData(state.dimensions),
    sliceSizes: cloneData(state.sliceSizes),
    view: {
      gap: viewState.gap,
      rowRule: viewState.rowRule,
      detailPreview: viewState.detailPreview,
      markersVisible: viewState.markersVisible,
      textSize: viewState.textSize
    },
    boards: cloneData(state.boards)
  };
}

function applyPersistedState(payload) {
  if (!payload) {
    ensureBoards();
    return;
  }

  state.dimensions = cloneData(payload.dimensions || state.dimensions);
  state.sliceSizes = cloneData(payload.sliceSizes || state.sliceSizes);
  state.boards = cloneData(payload.boards || {});

  if (payload.boardTexts && !payload.boards) {
    Object.entries(payload.boardTexts).forEach(([key, text]) => {
      state.boards[key] = createBoardFromText(key, text);
    });
  }

  gridSpec.width = state.dimensions.width;
  gridSpec.height = state.dimensions.height;
  gridSpec.depth = state.dimensions.depth;
  syncSliceSizesToDimensions();

  if (payload.view) {
    viewState.gap = typeof payload.view.gap === "number" ? payload.view.gap : viewState.gap;
    viewState.rowRule = payload.view.rowRule || viewState.rowRule;
    viewState.detailPreview = Boolean(payload.view.detailPreview);
    viewState.markersVisible = Boolean(payload.view.markersVisible);
    viewState.textSize = typeof payload.view.textSize === "number" ? payload.view.textSize : viewState.textSize;
  }

  ensureBoards();
}

async function loadSavedState() {
  try {
    const response = await fetch(SAVE_ENDPOINT, { cache: "no-store" });
    if (!response.ok) {
      throw new Error("Load request failed.");
    }

    const payload = await response.json();
    applyPersistedState(payload);
    saveState.isDirty = false;
    saveState.loadError = null;
  } catch (error) {
    ensureBoards();
    saveState.loadError = error;
    saveState.isDirty = false;
    updateSaveStatus({ variant: "error", message: "未连接保存" });
    return;
  }

  updateSaveStatus();
}

async function saveBoardState() {
  if (editingState) {
    stopEditing({ commit: true });
  }

  saveState.isSaving = true;
  updateSaveStatus();
  let saved = false;

  try {
    const payload = createPersistedState();
    const response = await fetch(SAVE_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error("Save request failed.");
    }

    saveState.isDirty = false;
    saveState.lastSavedAt = payload.savedAt;
    saved = true;
  } catch (error) {
    saveState.isDirty = true;
  } finally {
    saveState.isSaving = false;
    updateSaveStatus(saved ? { message: "已保存" } : { variant: "error", message: "保存失败" });
  }
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

function isMaxYMaxZEdge(coord, edge) {
  const size = getCellSize(coord);
  const totals = getModelTotals();
  const globalY = getSliceOffset(state.sliceSizes.heights, coord.y) + edge.y;
  const globalZ = getSliceOffset(state.sliceSizes.depths, coord.z) + edge.z;
  const maxZ = getSliceOffset(state.sliceSizes.depths, state.dimensions.depth - 1)
    + state.sliceSizes.depths[state.dimensions.depth - 1] / 2
    + 1;

  return Math.abs(globalY - totals.height) < 0.01
    && Math.abs(globalZ - maxZ) < 0.01
    && edge.y === size.height;
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

function createTextBlocks(text) {
  const lines = String(text || "")
    .split(/\r?\n/)
    .map((line) => line.trim());
  const safeLines = lines.length > 0 ? lines : [""];

  return safeLines.map((line, index) => ({
    id: `block-${index + 1}`,
    type: index === 0 ? BLOCK_TYPES.HEADING : BLOCK_TYPES.BULLET,
    indent: 0,
    listStyle: index === 0 ? null : "disc",
    text: line,
    marks: []
  }));
}

function createBoardFromText(key, text) {
  return {
    id: key,
    blocks: createTextBlocks(text),
    links: [],
    hidden: false,
    boxHidden: false
  };
}

function normalizeBlockType(type, index) {
  if (Object.values(BLOCK_TYPES).includes(type)) {
    return type;
  }

  return index === 0 ? BLOCK_TYPES.HEADING : BLOCK_TYPES.BULLET;
}

function isListBlockType(type) {
  return type === BLOCK_TYPES.BULLET || type === BLOCK_TYPES.NUMBERED;
}

function getDefaultListStyle(type, indent = 0) {
  if (type === BLOCK_TYPES.NUMBERED) {
    return NUMBERED_LIST_STYLES[Math.min(indent, NUMBERED_LIST_STYLES.length - 1)];
  }

  if (type === BLOCK_TYPES.BULLET) {
    return BULLET_LIST_STYLES[Math.min(indent, BULLET_LIST_STYLES.length - 1)];
  }

  return null;
}

function normalizeListStyle(type, listStyle, indent = 0) {
  if (type === BLOCK_TYPES.BULLET && BULLET_LIST_STYLES.includes(listStyle)) {
    return listStyle;
  }

  if (type === BLOCK_TYPES.NUMBERED && NUMBERED_LIST_STYLES.includes(listStyle)) {
    return listStyle;
  }

  return getDefaultListStyle(type, indent);
}

function normalizeHexColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : null;
}

function rgbToHex(value) {
  const match = String(value || "").match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!match) {
    return normalizeHexColor(value);
  }

  return `#${match.slice(1, 4)
    .map((part) => clamp(Number.parseInt(part, 10) || 0, 0, 255).toString(16).padStart(2, "0"))
    .join("")}`;
}

function normalizeMark(mark, textLength) {
  if (!mark || !INLINE_MARK_TYPES.has(mark.type)) {
    return null;
  }

  const start = clamp(Number.parseInt(mark.start, 10) || 0, 0, textLength);
  const end = clamp(Number.parseInt(mark.end, 10) || 0, 0, textLength);
  if (end <= start) {
    return null;
  }

  if (mark.type === "color") {
    const color = normalizeHexColor(mark.value) || rgbToHex(mark.value);
    return color ? { type: mark.type, start, end, value: color } : null;
  }

  if (mark.type === "fontSize") {
    const fontSize = clamp(Number.parseInt(mark.value, 10) || viewState.textSize, FORMAT_SIZE_MIN, FORMAT_SIZE_MAX);
    return { type: mark.type, start, end, value: fontSize };
  }

  return { type: mark.type, start, end };
}

function normalizeBlock(block, index) {
  const text = String(block?.text || "");
  const type = normalizeBlockType(block?.type, index);
  const indent = clamp(Number.parseInt(block?.indent, 10) || 0, INDENT_MIN, INDENT_MAX);
  const marks = Array.isArray(block?.marks)
    ? block.marks.map((mark) => normalizeMark(mark, text.length)).filter(Boolean)
    : [];
  const normalizedBlock = {
    id: block?.id || `block-${index + 1}`,
    type,
    indent,
    text,
    marks
  };

  if (isListBlockType(type)) {
    normalizedBlock.listStyle = normalizeListStyle(type, block?.listStyle, indent);
  }

  return normalizedBlock;
}

function normalizeBoard(key, board) {
  if (typeof board === "string") {
    return createBoardFromText(key, board);
  }

  if (!board || !Array.isArray(board.blocks)) {
    return createBoardFromText(key, "");
  }

  return {
    id: board.id || key,
    blocks: board.blocks.map((block, index) => normalizeBlock(block, index)),
    links: Array.isArray(board.links) ? board.links : [],
    hidden: Boolean(board.hidden),
    boxHidden: Boolean(board.boxHidden)
  };
}

function cloneBoardForKey(key, board) {
  const nextBoard = normalizeBoard(key, board);
  nextBoard.id = key;
  return nextBoard;
}

function getBoardBlocks(key) {
  const board = normalizeBoard(key, state.boards[key]);
  return board.blocks;
}

function getBoardText(key) {
  return getBoardBlocks(key).map((block) => block.text).join("\n");
}

function getBoardBlockCount(key) {
  return Math.max(1, getBoardBlocks(key).length);
}

function setBoardText(key, text) {
  const previousBoard = normalizeBoard(key, state.boards[key]);
  const nextBoard = createBoardFromText(key, text);
  nextBoard.links = previousBoard.links;
  nextBoard.hidden = previousBoard.hidden;
  nextBoard.boxHidden = previousBoard.boxHidden;
  state.boards[key] = nextBoard;
}

function setBoardBlocks(key, blocks) {
  const previousBoard = normalizeBoard(key, state.boards[key]);
  const safeBlocks = Array.isArray(blocks) && blocks.length > 0
    ? blocks.map((block, index) => normalizeBlock(block, index))
    : createTextBlocks("");
  state.boards[key] = {
    id: previousBoard.id || key,
    blocks: safeBlocks,
    links: previousBoard.links,
    hidden: previousBoard.hidden,
    boxHidden: previousBoard.boxHidden
  };
}

function getBoardLines(key) {
  return getTextLines(getBoardText(key));
}

function getBoardLineCount(key) {
  return getTextLineCount(getBoardText(key));
}

function ensureBoards({ reset = false } = {}) {
  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        const key = getBoardKey(x, y, z);
        if (reset || !state.boards[key]) {
          state.boards[key] = createBoardFromText(key, getDefaultText(getBoardIndex(x, y, z)));
        } else {
          state.boards[key] = normalizeBoard(key, state.boards[key]);
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
  ensureBoards();
  const nextCells = [];

  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        const index = getBoardIndex(x, y, z);
        const key = getBoardKey(x, y, z);
        const board = normalizeBoard(key, state.boards[key]);
        const blocks = board.blocks;
        const lines = blocks.map((block) => block.text);
        const title = lines[0] || `板子 ${String(index + 1).padStart(2, "0")}`;
        const points = lines.slice(1);

        nextCells.push({
          id: `cell-${String(index + 1).padStart(2, "0")}`,
          label: `第 ${z + 1} 深 / 第 ${y + 1} 行 / 第 ${x + 1} 列`,
          coord: { x, y, z },
          content: {
            title,
            type: "板子",
            points,
            blocks
          },
          opacity: 1,
          hidden: board.hidden,
          boxHidden: board.boxHidden,
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
    ...cells.map((cell) => getBoardBlockCount(getBoardKeyFromCoord(cell.coord)))
  );
}

function getNoteRowCount(cell) {
  if (viewState.rowRule === ROW_RULES.LOCAL) {
    return getBoardBlockCount(getBoardKeyFromCoord(cell.coord));
  }

  return getGlobalNoteRowCount();
}

function getNoteBlocks(cell) {
  const rows = cell.content.blocks.map((block, index) => normalizeBlock(block, index));
  const rowCount = getNoteRowCount(cell);
  while (rows.length < rowCount) {
    rows.push({
      id: `empty-${rows.length + 1}`,
      type: BLOCK_TYPES.PARAGRAPH,
      indent: 0,
      text: "",
      marks: []
    });
  }
  return rows.slice(0, rowCount);
}

function getFullText(cell) {
  const detail = [cell.content.title, ...cell.content.points].filter(Boolean).join(" / ");
  return `${cell.label}: ${detail}`;
}

function appendMarkedText(parent, block) {
  if (!block.text) {
    return;
  }

  const characters = Array.from(block.text, (char) => ({
    char,
    bold: false,
    italic: false,
    underline: false,
    superscript: false,
    subscript: false,
    color: null,
    fontSize: null
  }));

  block.marks.forEach((mark) => {
    const start = clamp(mark.start, 0, characters.length);
    const end = clamp(mark.end, start, characters.length);
    for (let index = start; index < end; index += 1) {
      if (mark.type === "color") {
        characters[index].color = mark.value;
      } else if (mark.type === "fontSize") {
        characters[index].fontSize = mark.value;
      } else if (mark.type in characters[index]) {
        characters[index][mark.type] = true;
      }
    }
  });

  function getStyleKey(item) {
    return JSON.stringify({
      bold: item.bold,
      italic: item.italic,
      underline: item.underline,
      superscript: item.superscript,
      subscript: item.subscript,
      color: item.color,
      fontSize: item.fontSize
    });
  }

  function appendRun(text, style) {
    if (!style.bold && !style.italic && !style.underline && !style.superscript && !style.subscript && !style.color && !style.fontSize) {
      parent.appendChild(document.createTextNode(text));
      return;
    }

    const element = document.createElement(style.superscript ? "sup" : style.subscript ? "sub" : "span");
    parent.appendChild(element);
    element.textContent = text;
    if (style.bold) {
      element.style.fontWeight = "800";
    }
    if (style.italic) {
      element.style.fontStyle = "italic";
    }
    if (style.underline) {
      element.style.textDecoration = "underline";
    }
    if (style.color) {
      element.style.color = style.color;
    }
    if (style.fontSize) {
      element.style.fontSize = `${style.fontSize}px`;
    }
  }

  let runText = "";
  let runStyle = null;
  let runKey = "";
  characters.forEach((item) => {
    const nextKey = getStyleKey(item);
    if (runText && nextKey !== runKey) {
      appendRun(runText, runStyle);
      runText = "";
    }

    runText += item.char;
    runStyle = item;
    runKey = nextKey;
  });

  if (runText) {
    appendRun(runText, runStyle);
  }
}

function renderBlockContent(parent, block) {
  parent.textContent = "";
  appendMarkedText(parent, block);
  if (!block.text) {
    parent.appendChild(document.createElement("br"));
  }
}

function createEditorBlock(block, index) {
  const element = document.createElement("div");
  element.className = "editor-block";
  element.contentEditable = "true";
  element.dataset.type = block.type;
  element.dataset.indent = String(block.indent);
  if (block.listStyle) {
    element.dataset.listStyle = block.listStyle;
  }
  element.dataset.blockId = block.id || `block-${index + 1}`;
  element.spellcheck = false;
  renderBlockContent(element, block);
  return element;
}

function createEditorBlocks(blocks) {
  const fragment = document.createDocumentFragment();
  blocks.forEach((block, index) => {
    fragment.appendChild(createEditorBlock(block, index));
  });
  return fragment;
}

function getEditorBlockFromEventTarget(target) {
  return target?.closest?.(".editor-block") || null;
}

function getActiveEditorBlock(editor) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return editor.querySelector(".editor-block");
  }

  const node = selection.anchorNode?.nodeType === Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection.anchorNode;
  return node?.closest?.(".editor-block") || editor.querySelector(".editor-block");
}

function placeCaretAtEnd(element) {
  element.focus();
  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function getTextAndMarksFromEditorBlock(element) {
  let text = "";
  const marks = [];

  function pushActiveMarks(activeStyle, start, end) {
    if (end <= start) {
      return;
    }

    ["bold", "italic", "underline", "superscript", "subscript"].forEach((type) => {
      if (activeStyle[type]) {
        marks.push({ type, start, end });
      }
    });
    if (activeStyle.color) {
      marks.push({ type: "color", start, end, value: activeStyle.color });
    }
    if (activeStyle.fontSize) {
      marks.push({ type: "fontSize", start, end, value: activeStyle.fontSize });
    }
  }

  function walk(node, activeStyle = {}) {
    if (node.nodeType === Node.TEXT_NODE) {
      const start = text.length;
      text += node.nodeValue || "";
      const end = text.length;
      pushActiveMarks(activeStyle, start, end);
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    const tagName = node.tagName.toLowerCase();
    const nodeStyle = node.style || {};
    const nextStyle = { ...activeStyle };
    if (tagName === "b" || tagName === "strong" || Number.parseInt(nodeStyle.fontWeight, 10) >= 600) {
      nextStyle.bold = true;
    }
    if (tagName === "i" || tagName === "em" || nodeStyle.fontStyle === "italic") {
      nextStyle.italic = true;
    }
    if (tagName === "u" || String(nodeStyle.textDecorationLine || nodeStyle.textDecoration || "").includes("underline")) {
      nextStyle.underline = true;
    }
    if (tagName === "sup") {
      nextStyle.superscript = true;
    }
    if (tagName === "sub") {
      nextStyle.subscript = true;
    }
    const color = node.getAttribute("color") || nodeStyle.color;
    const normalizedColor = normalizeHexColor(color) || rgbToHex(color);
    if (normalizedColor) {
      nextStyle.color = normalizedColor;
    }
    const fontSize = Number.parseInt(nodeStyle.fontSize || "", 10);
    if (Number.isFinite(fontSize)) {
      nextStyle.fontSize = clamp(fontSize, FORMAT_SIZE_MIN, FORMAT_SIZE_MAX);
    }
    node.childNodes.forEach((child) => walk(child, nextStyle));
  }

  element.childNodes.forEach((child) => walk(child));
  return { text, marks };
}

function getEditorBlocks(editor) {
  return [...editor.querySelectorAll(".editor-block")].map((element, index) => {
    const { text, marks } = getTextAndMarksFromEditorBlock(element);
    const type = normalizeBlockType(element.dataset.type, index);
    const indent = clamp(Number.parseInt(element.dataset.indent, 10) || 0, INDENT_MIN, INDENT_MAX);
    const block = {
      id: element.dataset.blockId || `block-${index + 1}`,
      type,
      indent,
      text: text.trim(),
      marks
    };

    if (isListBlockType(type)) {
      block.listStyle = normalizeListStyle(type, element.dataset.listStyle, indent);
    }

    return block;
  });
}

function updateEditorStateFromDom(editor, key) {
  updateEditorMarkers(editor);
  setBoardBlocks(key, getEditorBlocks(editor));
  syncEditingRows();
}

function setActiveBlockType(editor, type, listStyle = null) {
  const block = getActiveEditorBlock(editor);
  if (!block) {
    return;
  }

  block.dataset.type = type;
  if (isListBlockType(type)) {
    block.dataset.listStyle = normalizeListStyle(type, listStyle || block.dataset.listStyle, Number.parseInt(block.dataset.indent, 10) || 0);
  } else {
    delete block.dataset.listStyle;
  }
  updateEditorStateFromDom(editor, editingState.key);
}

function shiftActiveBlockIndent(editor, delta) {
  const block = getActiveEditorBlock(editor);
  if (!block) {
    return;
  }

  const current = Number.parseInt(block.dataset.indent, 10) || 0;
  const nextIndent = clamp(current + delta, INDENT_MIN, INDENT_MAX);
  block.dataset.indent = String(nextIndent);
  if (isListBlockType(block.dataset.type)) {
    block.dataset.listStyle = getDefaultListStyle(block.dataset.type, nextIndent);
  }
  updateEditorStateFromDom(editor, editingState.key);
}

function getEditorSelection(editor) {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  const range = selection.getRangeAt(0);
  const container = range.commonAncestorContainer.nodeType === Node.TEXT_NODE
    ? range.commonAncestorContainer.parentElement
    : range.commonAncestorContainer;
  return editor.contains(container) ? selection : null;
}

function selectActiveBlockWhenCollapsed(editor) {
  const selection = getEditorSelection(editor);
  const activeBlock = getActiveEditorBlock(editor);
  if (!activeBlock) {
    return;
  }

  if (selection && !selection.isCollapsed) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(activeBlock);
  const nextSelection = window.getSelection();
  nextSelection.removeAllRanges();
  nextSelection.addRange(range);
}

function replaceFontSizeElements(editor, size) {
  editor.querySelectorAll("font[size='7']").forEach((font) => {
    const span = document.createElement("span");
    span.style.fontSize = `${size}px`;
    while (font.firstChild) {
      span.appendChild(font.firstChild);
    }
    font.replaceWith(span);
  });
}

function applyFontSize(editor, size) {
  const safeSize = clamp(Number.parseInt(size, 10) || viewState.textSize, FORMAT_SIZE_MIN, FORMAT_SIZE_MAX);
  selectActiveBlockWhenCollapsed(editor);
  document.execCommand("fontSize", false, "7");
  replaceFontSizeElements(editor, safeSize);
}

function getCurrentFormatSize(editor) {
  const selection = getEditorSelection(editor);
  const node = selection?.anchorNode?.nodeType === Node.TEXT_NODE
    ? selection.anchorNode.parentElement
    : selection?.anchorNode;
  const styledNode = node?.closest?.("[style*='font-size']");
  const inlineSize = Number.parseInt(styledNode?.style?.fontSize || "", 10);
  if (Number.isFinite(inlineSize)) {
    return clamp(inlineSize, FORMAT_SIZE_MIN, FORMAT_SIZE_MAX);
  }

  return clamp(viewState.textSize, FORMAT_SIZE_MIN, FORMAT_SIZE_MAX);
}

function applyTextColor(editor, color) {
  const safeColor = normalizeHexColor(color) || "#1c2430";
  selectActiveBlockWhenCollapsed(editor);
  document.execCommand("foreColor", false, safeColor);
}

function runFormatAction(action, listStyle = null) {
  if (!editingState) {
    return;
  }

  const { editor, key } = editingState;
  getActiveEditorBlock(editor)?.focus();

  if (action === "bold" || action === "italic" || action === "underline" || action === "superscript" || action === "subscript") {
    selectActiveBlockWhenCollapsed(editor);
    document.execCommand(action);
  } else if (action === "increase-size" || action === "decrease-size") {
    const delta = action === "increase-size" ? FORMAT_SIZE_STEP : -FORMAT_SIZE_STEP;
    applyFontSize(editor, getCurrentFormatSize(editor) + delta);
  } else if (action === "clear-format") {
    selectActiveBlockWhenCollapsed(editor);
    document.execCommand("removeFormat");
  } else if (action === "heading") {
    setActiveBlockType(editor, BLOCK_TYPES.HEADING);
  } else if (action === "paragraph") {
    setActiveBlockType(editor, BLOCK_TYPES.PARAGRAPH);
  } else if (action === "bullet") {
    setActiveBlockType(editor, BLOCK_TYPES.BULLET, listStyle);
  } else if (action === "numbered") {
    setActiveBlockType(editor, BLOCK_TYPES.NUMBERED, listStyle);
  } else if (action === "outdent") {
    shiftActiveBlockIndent(editor, -1);
  } else if (action === "indent") {
    shiftActiveBlockIndent(editor, 1);
  }

  updateEditorStateFromDom(editor, key);
  updateFormatToolbarState();
}

function setFormatSize(size) {
  if (!editingState) {
    return;
  }

  const { editor, key } = editingState;
  getActiveEditorBlock(editor)?.focus();
  applyFontSize(editor, size);
  updateEditorStateFromDom(editor, key);
  updateFormatToolbarState();
}

function setFormatColor(color) {
  if (!editingState) {
    return;
  }

  const { editor, key } = editingState;
  getActiveEditorBlock(editor)?.focus();
  applyTextColor(editor, color);
  updateEditorStateFromDom(editor, key);
  updateFormatToolbarState();
}

function wireFormatToolbar(toolbar) {
  if (!toolbar) {
    return;
  }

  ["pointerdown", "pointerup", "click", "dblclick", "mousedown", "mouseup"].forEach((eventName) => {
    toolbar.addEventListener(eventName, (event) => event.stopPropagation());
  });

  toolbar.querySelectorAll("[data-format-action]").forEach((button) => {
    button.addEventListener("pointerdown", (event) => event.preventDefault());
    button.addEventListener("click", () => runFormatAction(button.dataset.formatAction, button.dataset.listStyle || null));
  });
  toolbar.querySelectorAll("[data-format-size]").forEach((select) => {
    select.addEventListener("pointerdown", (event) => event.stopPropagation());
    select.addEventListener("change", () => setFormatSize(select.value));
  });
  toolbar.querySelectorAll("[data-format-color]").forEach((input) => {
    input.addEventListener("pointerdown", (event) => event.stopPropagation());
    input.addEventListener("input", () => {
      input.closest(".format-color-control")?.style.setProperty("color", input.value);
      setFormatColor(input.value);
    });
  });
}

function createFloatingFormatToolbar() {
  const toolbar = topFormatToolbar.cloneNode(true);
  toolbar.id = "";
  toolbar.classList.remove("top-format-toolbar");
  toolbar.classList.add("floating-format-toolbar");
  wireFormatToolbar(toolbar);
  return toolbar;
}

function updateFormatToolbarState() {
  const disabled = !editingState;
  document.querySelectorAll(".text-format-toolbar [data-format-action]").forEach((button) => {
    button.disabled = disabled;
  });
  document.querySelectorAll(".text-format-toolbar [data-format-size], .text-format-toolbar [data-format-color]").forEach((control) => {
    control.disabled = disabled;
  });
}

function insertEditorBlockAfter(editor, currentBlock) {
  const blocks = [...editor.querySelectorAll(".editor-block")];
  const index = blocks.indexOf(currentBlock);
  const nextBlock = createEditorBlock({
    id: `block-${Date.now()}`,
    type: currentBlock?.dataset.type || BLOCK_TYPES.BULLET,
    indent: Number.parseInt(currentBlock?.dataset.indent, 10) || 0,
    listStyle: currentBlock?.dataset.listStyle || null,
    text: "",
    marks: []
  }, index + 1);

  currentBlock.after(nextBlock);
  updateEditorStateFromDom(editor, editingState.key);
  placeCaretAtEnd(nextBlock);
}

function getBulletMarker(listStyle) {
  return {
    disc: "•",
    circle: "○",
    diamond: "◆"
  }[listStyle] || "•";
}

function toAlphaNumber(value) {
  let current = value;
  let result = "";
  while (current > 0) {
    current -= 1;
    result = String.fromCharCode(97 + (current % 26)) + result;
    current = Math.floor(current / 26);
  }
  return result || "a";
}

function toRomanNumber(value) {
  const romanMap = [
    [10, "x"],
    [9, "ix"],
    [5, "v"],
    [4, "iv"],
    [1, "i"]
  ];
  let current = value;
  let result = "";
  romanMap.forEach(([amount, symbol]) => {
    while (current >= amount) {
      result += symbol;
      current -= amount;
    }
  });
  return result || "i";
}

function getNumberMarker(value, listStyle) {
  if (listStyle === "lower-alpha") {
    return `${toAlphaNumber(value)}.`;
  }

  if (listStyle === "lower-roman") {
    return `${toRomanNumber(value)}.`;
  }

  return `${value}.`;
}

function applyListMarkerData(element, block, numberCounters = null) {
  element.dataset.type = block.type;
  element.dataset.indent = String(block.indent);
  delete element.dataset.marker;
  delete element.dataset.listStyle;

  if (block.type === BLOCK_TYPES.NUMBERED) {
    const listStyle = normalizeListStyle(block.type, block.listStyle, block.indent);
    if (numberCounters) {
      numberCounters[block.indent] += 1;
      numberCounters.fill(0, block.indent + 1);
      element.dataset.marker = getNumberMarker(numberCounters[block.indent], listStyle);
    } else {
      element.dataset.marker = getNumberMarker(1, listStyle);
    }
    element.dataset.listStyle = listStyle;
  } else if (block.type === BLOCK_TYPES.BULLET) {
    const listStyle = normalizeListStyle(block.type, block.listStyle, block.indent);
    if (numberCounters) {
      numberCounters.fill(0, block.indent);
    }
    element.dataset.marker = getBulletMarker(listStyle);
    element.dataset.listStyle = listStyle;
  }
}

function updateEditorMarkers(editor) {
  const numberCounters = Array.from({ length: INDENT_MAX + 1 }, () => 0);
  editor.querySelectorAll(".editor-block").forEach((element, index) => {
    const type = normalizeBlockType(element.dataset.type, index);
    const indent = clamp(Number.parseInt(element.dataset.indent, 10) || 0, INDENT_MIN, INDENT_MAX);
    applyListMarkerData(element, {
      type,
      indent,
      listStyle: element.dataset.listStyle
    }, numberCounters);
  });
}

function selectCell(cell) {
  viewState.selectedId = cell.id;
  viewState.selectedIds = new Set([cell.id]);
  updateAllCellStates();
  updateSelection();
  updateWindowControlButtons();
}

function toggleCellSelection(cell) {
  const selectedIds = new Set(viewState.selectedIds);

  if (selectedIds.has(cell.id)) {
    selectedIds.delete(cell.id);
  } else {
    selectedIds.add(cell.id);
    viewState.selectedId = cell.id;
  }

  viewState.selectedIds = selectedIds;
  if (!selectedIds.has(viewState.selectedId)) {
    const nextSelectedIds = Array.from(selectedIds);
    viewState.selectedId = nextSelectedIds[nextSelectedIds.length - 1] || null;
  }

  updateAllCellStates();
  updateSelection();
  updateWindowControlButtons();
}

function selectCellFromEvent(cell, event) {
  if (event.ctrlKey) {
    toggleCellSelection(cell);
    return;
  }

  selectCell(cell);
}

function clearSelection() {
  viewState.selectedId = null;
  viewState.selectedIds.clear();
  updateAllCellStates();
  selectionText.textContent = "尚未选择。";
  updateWindowControlButtons();
}

function getSelectedCells() {
  return Array.from(viewState.selectedIds)
    .map((id) => getCellById(id))
    .filter(Boolean);
}

function updateWindowControlButtons() {
  if (!minimizeBoardsButton || !maximizeBoardsButton || !minimizeBoxesButton || !maximizeBoxesButton) {
    return;
  }

  const selectedCount = getSelectedCells().length;
  const disabled = selectedCount === 0;
  minimizeBoardsButton.disabled = disabled;
  maximizeBoardsButton.disabled = disabled;
  minimizeBoxesButton.disabled = disabled;
  maximizeBoxesButton.disabled = disabled;
  minimizeBoardsButton.title = disabled ? "先选中一个或多个小长方体" : `隐藏 ${selectedCount} 个选中板子`;
  maximizeBoardsButton.title = disabled ? "先选中一个或多个小长方体" : `恢复 ${selectedCount} 个选中板子`;
  minimizeBoxesButton.title = disabled ? "先选中一个或多个小长方体" : `隐藏 ${selectedCount} 个选中方框`;
  maximizeBoxesButton.title = disabled ? "先选中一个或多个小长方体" : `恢复 ${selectedCount} 个选中方框`;
}

function setSelectedBoardsVisibility(hidden) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const selectedCells = getSelectedCells();
  if (selectedCells.length === 0) {
    updateWindowControlButtons();
    return;
  }

  const beforeSnapshot = createHistorySnapshot();
  selectedCells.forEach((cell) => {
    const key = getBoardKeyFromCoord(cell.coord);
    const board = normalizeBoard(key, state.boards[key]);
    state.boards[key] = {
      ...board,
      hidden
    };
  });
  renderCells();
  updateSelection();
  updateWindowControlButtons();
  commitHistorySnapshot(beforeSnapshot);
}

function setSelectedBoxesVisibility(boxHidden) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const selectedCells = getSelectedCells();
  if (selectedCells.length === 0) {
    updateWindowControlButtons();
    return;
  }

  const beforeSnapshot = createHistorySnapshot();
  selectedCells.forEach((cell) => {
    const key = getBoardKeyFromCoord(cell.coord);
    const board = normalizeBoard(key, state.boards[key]);
    state.boards[key] = {
      ...board,
      boxHidden
    };
  });
  renderCells();
  updateSelection();
  updateWindowControlButtons();
  commitHistorySnapshot(beforeSnapshot);
}

function syncEditingRows() {
  if (!editingState) {
    return;
  }

  const activeCell = getCellById(editingState.cellId);
  if (!activeCell) {
    return;
  }

  const activeCount = getEditorBlocks(editingState.editor).length;
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

  const { cellId, key, originalBlocks, editor, floatingToolbar, beforeSnapshot } = editingState;
  const nextBlocks = commit ? getEditorBlocks(editor) : originalBlocks;
  setBoardBlocks(key, nextBlocks);
  editor.remove();
  floatingToolbar.remove();
  editingState = null;
  updateFormatToolbarState();
  renderCells();
  renderConfig();

  const cell = getCellById(cellId);
  if (cell) {
    selectCell(cell);
  }

  if (commit) {
    commitHistorySnapshot(beforeSnapshot);
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
  const originalBlocks = cloneData(getBoardBlocks(key));
  viewState.selectedId = cell.id;
  viewState.selectedIds = new Set([cell.id]);
  updateAllCellStates();
  note.classList.add("is-editing");

  const editor = document.createElement("div");
  editor.className = "note-editor note-editor-overlay rich-note-editor";
  editor.setAttribute("aria-label", `${cell.label} 文本编辑`);

  const blockList = document.createElement("div");
  blockList.className = "rich-editor-blocks";
  blockList.appendChild(createEditorBlocks(originalBlocks));
  editor.appendChild(blockList);
  updateEditorMarkers(editor);
  const floatingToolbar = createFloatingFormatToolbar();

  ["pointerdown", "pointerup", "click", "dblclick", "mousedown", "mouseup"].forEach((eventName) => {
    editor.addEventListener(eventName, (event) => {
      event.stopPropagation();
    });
  });
  editor.addEventListener("input", () => {
    updateEditorStateFromDom(editor, key);
  });
  editor.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      stopEditing({ commit: false });
      return;
    }

    if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      event.stopPropagation();
      stopEditing({ commit: true });
      return;
    }

    if (event.key === "Enter") {
      const block = getEditorBlockFromEventTarget(event.target);
      if (block) {
        event.preventDefault();
        event.stopPropagation();
        insertEditorBlockAfter(editor, block);
      }
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      shiftActiveBlockIndent(editor, event.shiftKey ? -1 : 1);
      return;
    }

    const keyName = event.key.toLowerCase();
    if ((event.ctrlKey || event.metaKey) && ["b", "i", "u"].includes(keyName)) {
      event.preventDefault();
      document.execCommand(keyName === "b" ? "bold" : keyName === "i" ? "italic" : "underline");
      updateEditorStateFromDom(editor, key);
      updateFormatToolbarState();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && keyName === ".") {
      event.preventDefault();
      document.execCommand("superscript");
      updateEditorStateFromDom(editor, key);
      return;
    }

    if ((event.ctrlKey || event.metaKey) && keyName === ",") {
      event.preventDefault();
      document.execCommand("subscript");
      updateEditorStateFromDom(editor, key);
    }
  });

  document.body.appendChild(editor);
  document.body.appendChild(floatingToolbar);
  editingState = {
    cellId: cell.id,
    key,
    originalBlocks,
    editor,
    floatingToolbar,
    note,
    noteRect: null,
    beforeSnapshot: createHistorySnapshot()
  };
  updateFormatToolbarState();
  syncEditingRows();
  updateEditingOverlayBounds();
  placeCaretAtEnd(editor.querySelector(".editor-block"));
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

  const { note, editor, floatingToolbar } = editingState;
  if (!note.isConnected || !editor.isConnected) {
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

  editor.style.left = `${rect.left}px`;
  editor.style.top = `${rect.top}px`;
  editor.style.width = `${rect.width}px`;
  editor.style.height = `${rect.height}px`;
  editor.style.padding = scaleBoxValue(noteStyle.padding, visualScale);
  editor.style.borderRadius = noteStyle.borderRadius;
  editor.style.fontSize = `${fontSize}px`;
  editor.style.fontWeight = lineStyle.fontWeight;
  editor.style.lineHeight = `${lineHeight}px`;

  if (floatingToolbar?.isConnected) {
    floatingToolbar.style.left = `${Math.max(8, rect.left)}px`;
    floatingToolbar.style.top = `${Math.max(8, rect.top - floatingToolbar.offsetHeight - 8)}px`;
  }
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
    element.appendChild(createCellBillboardLabel({
      className: `edge-label cell-billboard-label${isMaxYMaxZEdge(cell.coord, edge) ? " is-max-y-max-z" : ""}`,
      text: String(edge.number),
      baseTransform: `translate3d(${edge.x}px, ${edge.y}px, ${edge.z}px) translate(-50%, -50%)`,
      title: edgeKey
    }));
  });

  const noteAnchor = document.createElement("div");
  noteAnchor.className = "note-anchor";

  const note = document.createElement("div");
  note.className = "note";
  note.classList.toggle("is-board-hidden", cell.hidden);
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
    selectCellFromEvent(cell, event);
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

  const numberCounters = Array.from({ length: INDENT_MAX + 1 }, () => 0);
  getNoteBlocks(cell).forEach((block, index) => {
    const item = document.createElement("li");
    item.className = "note-line";
    applyListMarkerData(item, block, numberCounters);
    renderBlockContent(item, block);
    item.title = block.text;
    item.dataset.empty = block.text ? "false" : "true";
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
      wasSelected: viewState.selectedIds.has(cell.id)
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
    selectCellFromEvent(cell, event);
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
  cuboid.classList.toggle("has-markers", viewState.markersVisible);
  updateSpacingControls();
  setCuboidBounds();
  cells.forEach((cell) => {
    cuboid.appendChild(renderCell(cell));
  });
  renderSliceControls();
  applyViewTransform();
  updateWindowControlButtons();
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
  if (!textSizeInput) {
    return;
  }

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
  let beforeSnapshot = null;

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

  const captureBeforeSnapshot = () => {
    if (!beforeSnapshot) {
      beforeSnapshot = createHistorySnapshot();
    }
  };
  const commitSliceChange = () => {
    syncSliceControlInput(input, beforeSnapshot);
    beforeSnapshot = null;
  };

  input.addEventListener("focus", captureBeforeSnapshot);
  input.addEventListener("pointerdown", captureBeforeSnapshot);
  input.addEventListener("change", commitSliceChange);
  input.addEventListener("blur", commitSliceChange);
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    captureBeforeSnapshot();
    commitSliceChange();
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
    const anchorCoord = {
      x: index,
      y: state.dimensions.height - 1,
      z: state.dimensions.depth - 1
    };
    const edgePoint = getGlobalEdgePoint(anchorCoord, 3);
    fragment.appendChild(createSliceControl({
      axis: "width",
      index,
      label: `宽 ${index + 1}`,
      value,
      min: CELL_SIZE_LIMITS.width.min,
      max: CELL_SIZE_LIMITS.width.max,
      baseTransform: `translate3d(${edgePoint.x}px, ${edgePoint.y + 12}px, ${edgePoint.z + 12}px)`
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
    const anchorCoord = {
      x: 0,
      y: state.dimensions.height - 1,
      z: index
    };
    const edgePoint = getGlobalEdgePoint(anchorCoord, 12);
    fragment.appendChild(createSliceControl({
      axis: "depth",
      index,
      label: `深 ${index + 1}`,
      value,
      min: CELL_SIZE_LIMITS.depth.min,
      max: CELL_SIZE_LIMITS.depth.max,
      baseTransform: `translate3d(${edgePoint.x - 12}px, ${edgePoint.y + 12}px, ${edgePoint.z}px)`
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
  element.classList.toggle("is-selected", viewState.selectedIds.has(cell.id));
  element.classList.toggle("is-editing", editingState?.cellId === cell.id);
  element.classList.toggle("is-box-hidden", cell.boxHidden);
}

function updateAllCellStates() {
  cells.forEach((cell) => {
    const element = cuboid.querySelector(`[data-cell-id="${cell.id}"]`);
    updateCellClasses(element, cell);
  });
}

function updateSelection() {
  const selectedCells = getSelectedCells();
  if (selectedCells.length === 0) {
    selectionText.textContent = "尚未选择。";
    return;
  }

  if (selectedCells.length === 1) {
    selectionText.textContent = getFullText(selectedCells[0]);
    return;
  }

  selectionText.textContent = `已选择 ${selectedCells.length} 个板子。`;
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
  updateDimensionSideControls();
  if (structureReadout) {
    structureReadout.textContent = `当前共有 ${state.dimensions.depth} × ${state.dimensions.height} × ${state.dimensions.width} = ${count} 个板子`;
  }
}

function updateDimensionSideControls() {
  [
    { axis: "width", add: addWidthLeftButton, remove: removeWidthLeftButton },
    { axis: "width", add: addWidthRightButton, remove: removeWidthRightButton },
    { axis: "height", add: addHeightTopButton, remove: removeHeightTopButton },
    { axis: "height", add: addHeightBottomButton, remove: removeHeightBottomButton },
    { axis: "depth", add: addDepthFrontButton, remove: removeDepthFrontButton },
    { axis: "depth", add: addDepthBackButton, remove: removeDepthBackButton }
  ].forEach(({ axis, add, remove }) => {
    if (!add || !remove) {
      return;
    }

    add.disabled = state.dimensions[axis] >= DIMENSION_MAX;
    remove.disabled = state.dimensions[axis] <= DIMENSION_MIN;
  });
}

function getCoordValue(coord, axis) {
  return coord[axis === "width" ? "x" : axis === "height" ? "y" : "z"];
}

function setCoordValue(coord, axis, value) {
  coord[axis === "width" ? "x" : axis === "height" ? "y" : "z"] = value;
}

function getDefaultSliceSize(axis) {
  return gridSpec.cellSize[axis];
}

function getSliceSizeListName(axis) {
  return `${axis}s`;
}

function shiftDimensionFromEdge(axis, edge, direction) {
  const isAdding = direction > 0;
  const isStartEdge = edge === "start";
  const currentLength = state.dimensions[axis];
  const nextLength = currentLength + (isAdding ? 1 : -1);

  if (nextLength < DIMENSION_MIN || nextLength > DIMENSION_MAX) {
    updateDimensionSideControls();
    return;
  }

  if (editingState) {
    stopEditing({ commit: true });
  }

  const beforeSnapshot = createHistorySnapshot();
  const nextBoards = {};
  const nextDimensions = {
    ...state.dimensions,
    [axis]: nextLength
  };
  const listName = getSliceSizeListName(axis);
  const currentSizes = state.sliceSizes[listName];
  const nextSizes = isAdding
    ? (
      isStartEdge
        ? [getDefaultSliceSize(axis), ...currentSizes.slice(0, currentLength)]
        : [...currentSizes.slice(0, currentLength), getDefaultSliceSize(axis)]
    )
    : (
      isStartEdge
        ? currentSizes.slice(1)
        : currentSizes.slice(0, nextLength)
    );

  state.dimensions = nextDimensions;
  gridSpec[axis] = nextLength;
  state.sliceSizes[listName] = nextSizes;

  for (let z = 0; z < nextDimensions.depth; z += 1) {
    for (let y = 0; y < nextDimensions.height; y += 1) {
      for (let x = 0; x < nextDimensions.width; x += 1) {
        const nextCoord = { x, y, z };
        const nextKey = getBoardKeyFromCoord(nextCoord);
        const nextAxisValue = getCoordValue(nextCoord, axis);
        const previousCoord = { x, y, z };
        let previousBoard = null;

        if (isAdding) {
          if (isStartEdge && nextAxisValue > 0) {
            setCoordValue(previousCoord, axis, nextAxisValue - 1);
            previousBoard = state.boards[getBoardKeyFromCoord(previousCoord)];
          } else if (!isStartEdge && nextAxisValue < currentLength) {
            previousBoard = state.boards[nextKey];
          }
        } else if (isStartEdge) {
          setCoordValue(previousCoord, axis, nextAxisValue + 1);
          previousBoard = state.boards[getBoardKeyFromCoord(previousCoord)];
        } else {
          previousBoard = state.boards[nextKey];
        }

        nextBoards[nextKey] = previousBoard
          ? cloneBoardForKey(nextKey, previousBoard)
          : createBoardFromText(nextKey, getDefaultText(getBoardIndex(x, y, z)));
      }
    }
  }

  state.boards = nextBoards;
  viewState.selectedId = null;
  viewState.selectedIds.clear();
  ensureBoards();
  renderCells();
  renderConfig();
  commitHistorySnapshot(beforeSnapshot);
}

function syncDimensionsFromInputs({ allowFallback = true } = {}) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const beforeSnapshot = createHistorySnapshot();
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
  viewState.selectedIds.clear();
  ensureBoards();
  renderCells();
  renderConfig();
  commitHistorySnapshot(beforeSnapshot);
}

function resetDimensionInputs() {
  widthInput.value = state.dimensions.width;
  heightInput.value = state.dimensions.height;
  depthInput.value = state.dimensions.depth;
}

function syncShapeControlsFromInputs({ allowFallback = true, beforeSnapshot = null } = {}) {
  if (!textSizeInput) {
    return;
  }

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
  commitHistorySnapshot(beforeSnapshot);
}

function syncSliceControlInput(input, beforeSnapshot = null) {
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
  viewState.selectedIds.clear();
  renderCells();
  commitHistorySnapshot(beforeSnapshot);
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
  viewState.selectedIds.clear();
  cells.forEach((cell) => {
    cell.opacity = 1;
  });
  updateAllCellStates();
  selectionText.textContent = "尚未选择。";
  updateWindowControlButtons();
  applyViewTransform();
}

wireFormatToolbar(topFormatToolbar);
updateFormatToolbarState();

scene.addEventListener("pointerdown", handlePointerDown);
scene.addEventListener("pointermove", handlePointerMove);
scene.addEventListener("pointerup", handlePointerUp);
scene.addEventListener("pointercancel", handlePointerUp);
scene.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("resize", updateEditingOverlayBounds);
window.addEventListener("beforeunload", (event) => {
  const hasUncommittedEdit = editingState
    && !areSnapshotsEqual(editingState.originalBlocks, getEditorBlocks(editingState.editor));
  if (!saveState.isDirty && !hasUncommittedEdit) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
});
resetViewButton.addEventListener("click", resetView);
undoButton.addEventListener("click", undoHistoryStep);
redoButton.addEventListener("click", redoHistoryStep);
saveButton.addEventListener("click", saveBoardState);
minimizeBoardsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedBoardsVisibility(true);
});

maximizeBoardsButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedBoardsVisibility(false);
});

minimizeBoxesButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedBoxesVisibility(true);
});

maximizeBoxesButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedBoxesVisibility(false);
});

addWidthLeftButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("width", "start", 1);
});

removeWidthLeftButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("width", "start", -1);
});

addWidthRightButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("width", "end", 1);
});

removeWidthRightButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("width", "end", -1);
});

addHeightTopButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("height", "start", 1);
});

removeHeightTopButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("height", "start", -1);
});

addHeightBottomButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("height", "end", 1);
});

removeHeightBottomButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("height", "end", -1);
});

addDepthFrontButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("depth", "end", 1);
});

removeDepthFrontButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("depth", "end", -1);
});

addDepthBackButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("depth", "start", 1);
});

removeDepthBackButton?.addEventListener("click", (event) => {
  event.stopPropagation();
  shiftDimensionFromEdge("depth", "start", -1);
});

spacingInput.addEventListener("focus", () => {
  if (!spacingChangeSnapshot) {
    spacingChangeSnapshot = createHistorySnapshot();
  }
});
spacingInput.addEventListener("pointerdown", () => {
  if (!spacingChangeSnapshot) {
    spacingChangeSnapshot = createHistorySnapshot();
  }
});
spacingInput.addEventListener("input", () => {
  viewState.gap = Number.parseInt(spacingInput.value, 10);
  applyCellSpacing();
});
spacingInput.addEventListener("change", () => {
  commitHistorySnapshot(spacingChangeSnapshot);
  spacingChangeSnapshot = null;
});
rowRuleSelect.addEventListener("change", () => {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const beforeSnapshot = createHistorySnapshot();
  viewState.rowRule = rowRuleSelect.value;
  renderCells();
  commitHistorySnapshot(beforeSnapshot);
});
detailPreviewSelect.addEventListener("change", () => {
  const beforeSnapshot = createHistorySnapshot();
  viewState.detailPreview = detailPreviewSelect.value === "on";
  cuboid.classList.toggle("has-detail-preview", viewState.detailPreview);
  commitHistorySnapshot(beforeSnapshot);
});
markerVisibilitySelect.addEventListener("change", () => {
  const beforeSnapshot = createHistorySnapshot();
  viewState.markersVisible = markerVisibilitySelect.value === "on";
  cuboid.classList.toggle("has-markers", viewState.markersVisible);
  commitHistorySnapshot(beforeSnapshot);
});

[widthInput, heightInput, depthInput].forEach((input) => {
  input.addEventListener("blur", resetDimensionInputs);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      syncDimensionsFromInputs();
      input.blur();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      resetDimensionInputs();
      input.blur();
    }
  });
});

if (textSizeInput) {
  textSizeInput.addEventListener("focus", () => {
    if (!textSizeChangeSnapshot) {
      textSizeChangeSnapshot = createHistorySnapshot();
    }
  });
  textSizeInput.addEventListener("pointerdown", () => {
    if (!textSizeChangeSnapshot) {
      textSizeChangeSnapshot = createHistorySnapshot();
    }
  });
  textSizeInput.addEventListener("input", () => syncShapeControlsFromInputs({ allowFallback: false }));
  textSizeInput.addEventListener("change", () => {
    syncShapeControlsFromInputs({ beforeSnapshot: textSizeChangeSnapshot });
    textSizeChangeSnapshot = null;
  });
  textSizeInput.addEventListener("blur", () => {
    syncShapeControlsFromInputs({ beforeSnapshot: textSizeChangeSnapshot });
    textSizeChangeSnapshot = null;
  });
  textSizeInput.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    if (!textSizeChangeSnapshot) {
      textSizeChangeSnapshot = createHistorySnapshot();
    }
    syncShapeControlsFromInputs({ beforeSnapshot: textSizeChangeSnapshot });
    textSizeChangeSnapshot = null;
    textSizeInput.blur();
  });
}

document.addEventListener("click", (event) => {
  if (editingState) {
    const rect = editingState.noteRect;
    const isInsideNote = rect
      && event.clientX >= rect.left
      && event.clientX <= rect.right
      && event.clientY >= rect.top
      && event.clientY <= rect.bottom;

    if (editingState.editor.contains(event.target) || isInsideNote) {
      getActiveEditorBlock(editingState.editor)?.focus();
      return;
    }

    stopEditing({ commit: true });
    return;
  }

  clearSelection();
});

document.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  const isSaveShortcut = (event.ctrlKey || event.metaKey) && key === "s";
  const isUndoShortcut = (event.ctrlKey || event.metaKey) && !event.shiftKey && key === "z";
  const isRedoShortcut = (event.ctrlKey || event.metaKey) && (key === "y" || (event.shiftKey && key === "z"));

  if (isSaveShortcut) {
    event.preventDefault();
    saveBoardState();
    return;
  }

  if (isUndoShortcut || isRedoShortcut) {
    event.preventDefault();
    if (isUndoShortcut) {
      undoHistoryStep();
      return;
    }

    redoHistoryStep();
    return;
  }

  if (event.key !== "Escape" || editingState) {
    return;
  }

  if (viewState.selectedIds.size > 0) {
    event.preventDefault();
    clearSelection();
  }
});

async function initializeApp() {
  await loadSavedState();
  rowRuleSelect.value = viewState.rowRule;
  detailPreviewSelect.value = viewState.detailPreview ? "on" : "off";
  markerVisibilitySelect.value = viewState.markersVisible ? "on" : "off";
  updateShapeControls();
  renderCells();
  renderConfig();
  historyState.undoStack = [];
  historyState.redoStack = [];
  updateHistoryButtons();
  updateSaveStatus(saveState.loadError ? { variant: "error", message: "未连接保存" } : undefined);
}

initializeApp();

window.knowledgeBoard = {
  gridSpec,
  state,
  get cells() {
    return cells;
  },
  viewState,
  ROW_RULES,
  resetView,
  saveBoardState
};
