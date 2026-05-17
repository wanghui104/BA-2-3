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
const OPERATOR_SIZE_LIMITS = {
  width: { min: 8, max: 80 },
  height: { min: 8, max: 80 },
  depth: { min: 8, max: 80 }
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
const ARROW_ENDPOINT_OVERLAP = 5;
const ARROW_MIN_LENGTH = 28;
const BULLET_LIST_STYLES = ["disc", "circle", "diamond"];
const NUMBERED_LIST_STYLES = ["decimal", "lower-alpha", "lower-roman"];
const EXCEL_TABLE_POSITION = {
  y: -214,
  z: -92
};
const EXCEL_TABLE_DEFAULT_ROW_HEIGHT = 14;
const EXCEL_TABLE_HEADER_HEIGHT = 16;
const EXCEL_TABLE_ROW_HEADER_WIDTH = 24;
const EXCEL_TABLE_GAP_FROM_CUBOID = 60;
const EXCEL_COLUMN_WIDTH_MIN = 34;
const EXCEL_COLUMN_RESIZE_HITBOX = 10;
const EXCEL_ROW_HEIGHT_MIN = 10;

const defaultExcelTableColumns = [
  { id: "section", width: 94, minWidth: 54 },
  { id: "col", width: 54, minWidth: 34 },
  { id: "name", width: 320, minWidth: 130 },
  { id: "total", width: 78, minWidth: 50 },
  { id: "line", width: 78, minWidth: 50 }
];

const defaultExcelTableRows = [
  { kind: "title", cells: { section: "", col: "", name: "IEE Part 2", total: "", line: "" } },
  { kind: "header", cells: { section: "", col: "Col #", name: "Col Name", total: "Total Amt", line: "Line _A Amt" } },
  { cells: { section: "", col: "1", name: "Premiums Written", total: "26752", line: "4555" } },
  { cells: { section: "", col: "3", name: "Premiums Earned", total: "26512", line: "4445" } },
  { cells: { section: "", col: "5", name: "Dividends to Policyholders", total: "46", line: "" } },
  { cells: { section: "", col: "7", name: "Incurred Loss", total: "16907", line: "" } },
  { cells: { section: "", col: "9", name: "LAE - DCC Expense Incurred", total: "1671", line: "" } },
  { cells: { section: "BS Net reserve liabilities", col: "11", name: "LAE - AO Expense Incurred", total: "1585", line: "" } },
  { cells: { section: "", col: "13", name: "Unpaid Loss", total: "41894", line: "1311" } },
  { cells: { section: "", col: "15", name: "LAE - DCC Expense Unpaid", total: "7068", line: "55" } },
  { cells: { section: "", col: "17", name: "LAE - AO Expense Unpaid", total: "2595", line: "89" } },
  { cells: { section: "", col: "19", name: "UnEarned Premium Reserve", total: "11691", line: "2401" } },
  { kind: "spacer", cells: { section: "", col: "", name: "", total: "", line: "" } },
  { cells: { section: "IS line4 Other Underwriting Expenses", col: "21", name: "Agents' Balances", total: "7172", line: "1901" } },
  { cells: { section: "", col: "23", name: "Commission and Brokerage Expenses Incurred", total: "4055", line: "867" } },
  { cells: { section: "", col: "25", name: "Taxes, Licenses & Fees Incurred", total: "860", line: "130" } },
  { cells: { section: "", col: "27", name: "Other Acquisitions, Field Supervision, and Collection Expenses", total: "1283", line: "169" } },
  { cells: { section: "", col: "29", name: "General Expenses", total: "2285", line: "298" } },
  { cells: { section: "", col: "31", name: "Other Income Less Other Expenses", total: "33", line: "" } },
  { kind: "spacer", cells: { section: "", col: "", name: "", total: "", line: "" } },
  { cells: { section: "", col: "33", name: "Pre-tax Profit or Loss Excluding All Investment Gain", total: "-2147", line: "-1241" } },
  { cells: { section: "", col: "35", name: "Investment Gain on Funds Attributable to Insurance Transactions", total: "2663", line: "53" } },
  { cells: { section: "", col: "37", name: "Profit or Loss Excluding Investment Gain Attributable to Capital and Surplus", total: "516", line: "-1188" } },
  { cells: { section: "", col: "39", name: "Investment Gain Attributable to Capital and Surplus", total: "1741", line: "179" } },
  { kind: "subtotal", cells: { section: "", col: "", name: "Subtotal Net Investment Gain(Loss) Before Capital Gains tax", total: "4404", line: "232" } },
  { cells: { section: "", col: "41", name: "Total Profit or Loss", total: "2257", line: "" } },
  { kind: "spacer", cells: { section: "", col: "", name: "", total: "", line: "" } },
  { cells: { section: "BS Liab 37", col: "", name: "BS : Surplus line 37 : Policyholder Surplus", total: "31024", line: "tbl 69 : $2872" } },
  { kind: "green", cells: { section: "BS Liab 12", col: "", name: "BS Liab Line 12 : Ceded reinsurance premium payable", total: "440", line: "tbl 67 : $12" } },
  { kind: "spacer", cells: { section: "", col: "", name: "", total: "", line: "" } },
  { kind: "green", cells: { section: "", col: "", name: "U&IE Part 1B Col 4+5 Line. Ceded WP", total: "1882", line: "91" } }
];

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
  operatorSize: {
    width: 15,
    height: 15,
    depth: 15
  },
  operators: {},
  arrows: {},
  boards: {},
  excelTable: {
    columns: cloneData(defaultExcelTableColumns),
    rows: cloneData(defaultExcelTableRows)
  }
};

let cells = [];
let operators = [];
let arrows = [];
let editingState = null;

const faces = ["front", "back", "right", "left", "top", "bottom"];
const scene = document.querySelector("#scene");
const modelStage = document.querySelector("#modelStage");
const cuboid = document.querySelector("#cuboid");
const excelTableRack = document.querySelector("#excelTableRack");
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
const operatorWidthInput = document.querySelector("#operatorWidthInput");
const operatorHeightInput = document.querySelector("#operatorHeightInput");
const operatorDepthInput = document.querySelector("#operatorDepthInput");
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
const showMiniOperatorButton = document.querySelector("#showMiniOperatorButton");
const hideMiniOperatorButton = document.querySelector("#hideMiniOperatorButton");
const showArrowButton = document.querySelector("#showArrowButton");
const hideArrowButton = document.querySelector("#hideArrowButton");
const arrowColorInput = document.querySelector("#arrowColorInput");
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
  arrowColor: "#357ded",
  excelTableSelected: false,
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
let operatorSizeChangeSnapshot = null;
let excelEditSnapshot = null;
let excelColumnResizeState = null;
let excelRowResizeState = null;

function getBoardKey(x, y, z) {
  return `${x}-${y}-${z}`;
}

function getBoardIndex(x, y, z) {
  return z * state.dimensions.width * state.dimensions.height + y * state.dimensions.width + x;
}

function getBoardKeyFromCoord(coord) {
  return getBoardKey(coord.x, coord.y, coord.z);
}

function getCoordFromBoardKey(key) {
  const parts = String(key || "").split("-").map((part) => Number.parseInt(part, 10));
  if (parts.length !== 3 || parts.some((part) => Number.isNaN(part))) {
    return null;
  }

  return {
    x: parts[0],
    y: parts[1],
    z: parts[2]
  };
}

function getOperatorKey(axis, x, y, z) {
  return `${axis}-${x}-${y}-${z}`;
}

function getOperatorKeyFromSpec(spec) {
  return getOperatorKey(spec.axis, spec.coord.x, spec.coord.y, spec.coord.z);
}

function getArrowKey(fromKey, toKey) {
  return `${fromKey}->${toKey}`;
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

function normalizeExcelColumns(columns) {
  const sourceColumns = Array.isArray(columns) && columns.length > 0 ? columns : defaultExcelTableColumns;

  return defaultExcelTableColumns.map((fallback, index) => {
    const column = sourceColumns.find((item) => item?.id === fallback.id) || sourceColumns[index] || fallback;
    const width = Number.parseInt(column.width, 10);
    const minWidth = Number.parseInt(column.minWidth, 10);
    return {
      id: fallback.id,
      width: Number.isFinite(width) ? Math.max(width, fallback.minWidth || EXCEL_COLUMN_WIDTH_MIN) : fallback.width,
      minWidth: Number.isFinite(minWidth) ? Math.max(minWidth, EXCEL_COLUMN_WIDTH_MIN) : fallback.minWidth
    };
  });
}

function normalizeExcelRows(rows) {
  const sourceRows = Array.isArray(rows) && rows.length > 0 ? rows : defaultExcelTableRows;

  return sourceRows.map((row, index) => {
    const fallback = defaultExcelTableRows[index] || {};
    const sourceCells = row?.cells || row || {};
    const fallbackCells = fallback.cells || {};
    const cells = {};
    defaultExcelTableColumns.forEach((column) => {
      cells[column.id] = String(sourceCells[column.id] ?? fallbackCells[column.id] ?? "");
    });

    return {
      kind: String(row?.kind ?? fallback.kind ?? ""),
      height: Math.max(EXCEL_ROW_HEIGHT_MIN, Number.parseInt(row?.height ?? EXCEL_TABLE_DEFAULT_ROW_HEIGHT, 10) || EXCEL_TABLE_DEFAULT_ROW_HEIGHT),
      cells
    };
  });
}

function normalizeExcelTable(table) {
  return {
    columns: normalizeExcelColumns(table?.columns),
    rows: normalizeExcelRows(table?.rows || table)
  };
}

function createHistorySnapshot() {
  return {
    dimensions: cloneData(state.dimensions),
    sliceSizes: cloneData(state.sliceSizes),
    operatorSize: cloneData(state.operatorSize),
    operators: cloneData(state.operators),
    arrows: cloneData(state.arrows),
    boards: cloneData(state.boards),
    excelTable: cloneData(state.excelTable),
    view: {
      gap: viewState.gap,
      rowRule: viewState.rowRule,
      detailPreview: viewState.detailPreview,
      markersVisible: viewState.markersVisible,
      textSize: viewState.textSize,
      arrowColor: viewState.arrowColor
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
  state.operatorSize = normalizeOperatorSize(snapshot.operatorSize || state.operatorSize);
  state.operators = cloneData(snapshot.operators || {});
  state.arrows = cloneData(snapshot.arrows || {});
  state.boards = cloneData(snapshot.boards);
  state.excelTable = normalizeExcelTable(snapshot.excelTable || snapshot.excelRows);
  gridSpec.width = state.dimensions.width;
  gridSpec.height = state.dimensions.height;
  gridSpec.depth = state.dimensions.depth;
  viewState.gap = snapshot.view.gap;
  viewState.rowRule = snapshot.view.rowRule;
  viewState.detailPreview = snapshot.view.detailPreview;
  viewState.markersVisible = snapshot.view.markersVisible;
  viewState.textSize = snapshot.view.textSize;
  viewState.arrowColor = normalizeHexColor(snapshot.view.arrowColor) || viewState.arrowColor;
  viewState.selectedId = null;
  viewState.selectedIds.clear();

  rowRuleSelect.value = viewState.rowRule;
  detailPreviewSelect.value = viewState.detailPreview ? "on" : "off";
  markerVisibilitySelect.value = viewState.markersVisible ? "on" : "off";
  if (arrowColorInput) {
    arrowColorInput.value = viewState.arrowColor;
  }
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
  stopExcelEditing();

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
  stopExcelEditing();

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
    operatorSize: cloneData(state.operatorSize),
    operators: cloneData(state.operators),
    arrows: cloneData(state.arrows),
    view: {
      gap: viewState.gap,
      rowRule: viewState.rowRule,
      detailPreview: viewState.detailPreview,
      markersVisible: viewState.markersVisible,
      textSize: viewState.textSize,
      arrowColor: viewState.arrowColor
    },
    boards: cloneData(state.boards),
    excelTable: cloneData(state.excelTable)
  };
}

function applyPersistedState(payload) {
  if (!payload) {
    ensureBoards();
    return;
  }

  state.dimensions = cloneData(payload.dimensions || state.dimensions);
  state.sliceSizes = cloneData(payload.sliceSizes || state.sliceSizes);
  state.operatorSize = normalizeOperatorSize(payload.operatorSize || state.operatorSize);
  state.operators = cloneData(payload.operators || {});
  state.arrows = cloneData(payload.arrows || {});
  state.boards = cloneData(payload.boards || {});
  state.excelTable = normalizeExcelTable(payload.excelTable || payload.excelRows);

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
    viewState.arrowColor = normalizeHexColor(payload.view.arrowColor) || viewState.arrowColor;
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
  stopExcelEditing();

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

function getCellOrigin(coord) {
  const size = getCellSize(coord);
  return {
    x: getSliceOffset(state.sliceSizes.widths, coord.x),
    y: getSliceOffset(state.sliceSizes.heights, coord.y),
    z: getSliceOffset(state.sliceSizes.depths, coord.z) + size.depth / 2
  };
}

function getGlobalEdgePoint(coord, edgeNumber) {
  const size = getCellSize(coord);
  const origin = getCellOrigin(coord);
  const edge = getEdgeLabelSpecs(size).find((item) => item.number === edgeNumber);
  return {
    x: origin.x + edge.x,
    y: origin.y + edge.y,
    z: origin.z + edge.z
  };
}

function isMaxYMaxZEdge(coord, edge) {
  const size = getCellSize(coord);
  const origin = getCellOrigin(coord);
  const totals = getModelTotals();
  const globalY = origin.y + edge.y;
  const globalZ = origin.z + edge.z;
  const maxZ = getSliceOffset(state.sliceSizes.depths, state.dimensions.depth - 1)
    + state.sliceSizes.depths[state.dimensions.depth - 1]
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

function toOperatorSize(value, axis, fallback) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  const limit = OPERATOR_SIZE_LIMITS[axis];
  return clamp(parsed, limit.min, limit.max);
}

function normalizeOperatorSize(size = {}) {
  return {
    width: toOperatorSize(size.width, "width", 15),
    height: toOperatorSize(size.height, "height", 15),
    depth: toOperatorSize(size.depth, "depth", 15)
  };
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

function getDefaultOperatorText(axis, coord) {
  if (axis === "height") {
    return coord.y === 0 ? "-" : "=";
  }

  if (axis === "width") {
    return "+";
  }

  return ">";
}

function normalizeOperator(axis, coord, operator) {
  return {
    id: getOperatorKey(axis, coord.x, coord.y, coord.z),
    axis,
    coord: { ...coord },
    text: String(operator?.text || getDefaultOperatorText(axis, coord)).slice(0, 3),
    hidden: Boolean(operator?.hidden),
    boxHidden: Boolean(operator?.boxHidden)
  };
}

function ensureOperators() {
  const nextOperators = {};
  const specs = [];

  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width - 1; x += 1) {
        specs.push({ axis: "width", coord: { x, y, z } });
      }
    }
  }

  for (let z = 0; z < state.dimensions.depth; z += 1) {
    for (let y = 0; y < state.dimensions.height - 1; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        specs.push({ axis: "height", coord: { x, y, z } });
      }
    }
  }

  for (let z = 0; z < state.dimensions.depth - 1; z += 1) {
    for (let y = 0; y < state.dimensions.height; y += 1) {
      for (let x = 0; x < state.dimensions.width; x += 1) {
        specs.push({ axis: "depth", coord: { x, y, z } });
      }
    }
  }

  specs.forEach((spec) => {
    const key = getOperatorKeyFromSpec(spec);
    nextOperators[key] = normalizeOperator(spec.axis, spec.coord, state.operators[key]);
  });

  state.operators = nextOperators;
}

function buildOperators() {
  ensureOperators();
  operators = Object.values(state.operators).map((operator) => normalizeOperator(operator.axis, operator.coord, operator));
}

function isBoardKeyInBounds(key) {
  const coord = getCoordFromBoardKey(key);
  return Boolean(coord)
    && coord.x >= 0
    && coord.x < state.dimensions.width
    && coord.y >= 0
    && coord.y < state.dimensions.height
    && coord.z >= 0
    && coord.z < state.dimensions.depth;
}

function normalizeArrow(arrow) {
  const from = String(arrow?.from || "");
  const to = String(arrow?.to || "");
  if (!from || !to || from === to || !isBoardKeyInBounds(from) || !isBoardKeyInBounds(to)) {
    return null;
  }

  const color = normalizeHexColor(arrow?.color) || viewState.arrowColor;
  return {
    id: getArrowKey(from, to),
    from,
    to,
    color,
    hidden: Boolean(arrow?.hidden)
  };
}

function ensureArrows() {
  const nextArrows = {};
  Object.values(state.arrows || {}).forEach((arrow) => {
    const normalizedArrow = normalizeArrow(arrow);
    if (normalizedArrow) {
      nextArrows[normalizedArrow.id] = normalizedArrow;
    }
  });
  state.arrows = nextArrows;
}

function buildArrows() {
  ensureArrows();
  arrows = Object.values(state.arrows).map((arrow) => normalizeArrow(arrow)).filter(Boolean);
}

function getCellAt(x, y, z) {
  return cells.find((cell) => cell.coord.x === x && cell.coord.y === y && cell.coord.z === z);
}

function getCellById(cellId) {
  return cells.find((cell) => cell.id === cellId);
}

function getCellByBoardKey(key) {
  const coord = getCoordFromBoardKey(key);
  return coord ? getCellAt(coord.x, coord.y, coord.z) : null;
}

function getOperatorById(operatorId) {
  return operators.find((operator) => operator.id === operatorId);
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
  setExcelTableSelected(false);
  viewState.selectedId = cell.id;
  viewState.selectedIds = new Set([cell.id]);
  updateAllCellStates();
  updateAllOperatorStates();
  updateAllArrowStates();
  updateSelection();
  updateWindowControlButtons();
}

function selectOperator(operator) {
  setExcelTableSelected(false);
  viewState.selectedId = operator.id;
  viewState.selectedIds = new Set([operator.id]);
  updateAllCellStates();
  updateAllOperatorStates();
  updateAllArrowStates();
  updateSelection();
  updateWindowControlButtons();
}

function toggleSelectableSelection(item) {
  setExcelTableSelected(false);
  const selectedIds = new Set(viewState.selectedIds);

  if (selectedIds.has(item.id)) {
    selectedIds.delete(item.id);
  } else {
    selectedIds.add(item.id);
    viewState.selectedId = item.id;
  }

  viewState.selectedIds = selectedIds;
  if (!selectedIds.has(viewState.selectedId)) {
    const nextSelectedIds = Array.from(selectedIds);
    viewState.selectedId = nextSelectedIds[nextSelectedIds.length - 1] || null;
  }

  updateAllCellStates();
  updateAllOperatorStates();
  updateAllArrowStates();
  updateSelection();
  updateWindowControlButtons();
}

function selectCellFromEvent(cell, event) {
  if (event.ctrlKey) {
    toggleSelectableSelection(cell);
    return;
  }

  selectCell(cell);
}

function selectOperatorFromEvent(operator, event) {
  if (event.ctrlKey) {
    toggleSelectableSelection(operator);
    return;
  }

  selectOperator(operator);
}

function clearSelection() {
  setExcelTableSelected(false);
  viewState.selectedId = null;
  viewState.selectedIds.clear();
  updateAllCellStates();
  updateAllOperatorStates();
  updateAllArrowStates();
  selectionText.textContent = "尚未选择。";
  updateWindowControlButtons();
}

function setExcelTableSelected(isSelected) {
  viewState.excelTableSelected = isSelected;
  modelStage.classList.toggle("is-excel-table-selected", isSelected);
  excelTableRack?.classList.toggle("is-selected", isSelected);
}

function selectExcelTable() {
  if (editingState) {
    stopEditing({ commit: true });
  }

  viewState.selectedId = null;
  viewState.selectedIds.clear();
  updateAllCellStates();
  updateAllOperatorStates();
  updateAllArrowStates();
  setExcelTableSelected(true);
  selectionText.textContent = "已选择百叶窗 table。";
  updateWindowControlButtons();
}

function getSelectedCells() {
  return Array.from(viewState.selectedIds)
    .map((id) => getCellById(id))
    .filter(Boolean);
}

function getSelectedCellSequence() {
  return Array.from(viewState.selectedIds)
    .map((id) => getCellById(id))
    .filter(Boolean);
}

function getSelectedOperators() {
  return Array.from(viewState.selectedIds)
    .map((id) => getOperatorById(id))
    .filter(Boolean);
}

function getSelectedItemCount() {
  return getSelectedCells().length + getSelectedOperators().length;
}

function getSelectedArrowPairs() {
  const selectedCells = getSelectedCellSequence();
  if (selectedCells.length < 2 || getSelectedOperators().length > 0) {
    return [];
  }

  const pairs = [];
  for (let index = 0; index < selectedCells.length - 1; index += 1) {
    pairs.push({
      from: getBoardKeyFromCoord(selectedCells[index].coord),
      to: getBoardKeyFromCoord(selectedCells[index + 1].coord)
    });
  }
  return pairs;
}

function getOperatorBetweenCells(firstCell, secondCell) {
  const first = firstCell.coord;
  const second = secondCell.coord;
  const delta = {
    x: second.x - first.x,
    y: second.y - first.y,
    z: second.z - first.z
  };
  const distance = Math.abs(delta.x) + Math.abs(delta.y) + Math.abs(delta.z);
  if (distance !== 1) {
    return null;
  }

  let axis = null;
  const coord = {
    x: Math.min(first.x, second.x),
    y: Math.min(first.y, second.y),
    z: Math.min(first.z, second.z)
  };

  if (delta.x !== 0) {
    axis = "width";
  } else if (delta.y !== 0) {
    axis = "height";
  } else {
    axis = "depth";
  }

  const key = getOperatorKey(axis, coord.x, coord.y, coord.z);
  const operator = state.operators[key] || getOperatorById(key);
  return operator ? normalizeOperator(axis, coord, operator) : null;
}

function getOperatorBetweenSelectedCells() {
  const selectedCells = getSelectedCells();
  if (selectedCells.length !== 2 || getSelectedOperators().length > 0) {
    return null;
  }

  return getOperatorBetweenCells(selectedCells[0], selectedCells[1]);
}

function updateWindowControlButtons() {
  if (!minimizeBoardsButton || !maximizeBoardsButton || !minimizeBoxesButton || !maximizeBoxesButton || !showMiniOperatorButton || !hideMiniOperatorButton || !showArrowButton || !hideArrowButton) {
    return;
  }

  const selectedCount = getSelectedItemCount();
  const disabled = selectedCount === 0;
  const adjacentOperator = getOperatorBetweenSelectedCells();
  const miniOperatorDisabled = !adjacentOperator;
  const arrowPairs = getSelectedArrowPairs();
  const arrowButtonsDisabled = arrowPairs.length === 0;
  minimizeBoardsButton.disabled = disabled;
  maximizeBoardsButton.disabled = disabled;
  minimizeBoxesButton.disabled = disabled;
  maximizeBoxesButton.disabled = disabled;
  showMiniOperatorButton.disabled = miniOperatorDisabled;
  hideMiniOperatorButton.disabled = miniOperatorDisabled;
  showArrowButton.disabled = arrowButtonsDisabled;
  hideArrowButton.disabled = arrowButtonsDisabled;
  minimizeBoardsButton.title = disabled ? "先选中一个或多个小长方体或迷你方框" : `隐藏 ${selectedCount} 个选中内容`;
  maximizeBoardsButton.title = disabled ? "先选中一个或多个小长方体或迷你方框" : `恢复 ${selectedCount} 个选中内容`;
  minimizeBoxesButton.title = disabled ? "先选中一个或多个小长方体或迷你方框" : `隐藏 ${selectedCount} 个选中方框`;
  maximizeBoxesButton.title = disabled ? "先选中一个或多个小长方体或迷你方框" : `恢复 ${selectedCount} 个选中方框`;
  showMiniOperatorButton.title = miniOperatorDisabled ? "按住 Ctrl 选中两个相邻小长方体" : "显示这两个相邻方框之间的迷你框";
  hideMiniOperatorButton.title = miniOperatorDisabled ? "按住 Ctrl 选中两个相邻小长方体" : "隐藏这两个相邻方框之间的迷你框";
  showArrowButton.title = arrowButtonsDisabled ? "按住 Ctrl 按顺序选中两个或更多小长方体" : `按选择顺序创建 ${arrowPairs.length} 条箭头`;
  hideArrowButton.title = arrowButtonsDisabled ? "按住 Ctrl 按顺序选中两个或更多小长方体" : `按选择顺序去掉 ${arrowPairs.length} 条箭头`;
}

function setSelectedBoardsVisibility(hidden) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const selectedCells = getSelectedCells();
  const selectedOperators = getSelectedOperators();
  if (selectedCells.length === 0 && selectedOperators.length === 0) {
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
  selectedOperators.forEach((operator) => {
    state.operators[operator.id] = {
      ...normalizeOperator(operator.axis, operator.coord, state.operators[operator.id]),
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
  const selectedOperators = getSelectedOperators();
  if (selectedCells.length === 0 && selectedOperators.length === 0) {
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
  selectedOperators.forEach((operator) => {
    state.operators[operator.id] = {
      ...normalizeOperator(operator.axis, operator.coord, state.operators[operator.id]),
      boxHidden
    };
  });
  renderCells();
  updateSelection();
  updateWindowControlButtons();
  commitHistorySnapshot(beforeSnapshot);
}

function setSelectedMiniOperatorVisibility(visible) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const operator = getOperatorBetweenSelectedCells();
  if (!operator) {
    updateWindowControlButtons();
    return;
  }

  const beforeSnapshot = createHistorySnapshot();
  state.operators[operator.id] = {
    ...normalizeOperator(operator.axis, operator.coord, state.operators[operator.id]),
    hidden: !visible,
    boxHidden: !visible
  };
  renderCells();
  updateSelection();
  updateWindowControlButtons();
  commitHistorySnapshot(beforeSnapshot);
}

function setSelectedArrowsVisibility(visible) {
  if (editingState) {
    stopEditing({ commit: true });
  }

  const pairs = getSelectedArrowPairs();
  if (pairs.length === 0) {
    updateWindowControlButtons();
    return;
  }

  const beforeSnapshot = createHistorySnapshot();
  pairs.forEach((pair) => {
    const key = getArrowKey(pair.from, pair.to);
    if (visible) {
      state.arrows[key] = {
        id: key,
        from: pair.from,
        to: pair.to,
        color: normalizeHexColor(viewState.arrowColor) || "#357ded",
        hidden: false
      };
      return;
    }

    if (state.arrows[key]) {
      const arrow = normalizeArrow(state.arrows[key]);
      if (!arrow) {
        return;
      }
      state.arrows[key] = {
        ...arrow,
        hidden: true
      };
    }
  });
  renderCells();
  updateSelection();
  updateWindowControlButtons();
  commitHistorySnapshot(beforeSnapshot);
}

function setSelectedArrowsColor(color) {
  const nextColor = normalizeHexColor(color);
  if (!nextColor) {
    return;
  }

  viewState.arrowColor = nextColor;
  const pairs = getSelectedArrowPairs();
  const beforeSnapshot = createHistorySnapshot();
  pairs.forEach((pair) => {
    const key = getArrowKey(pair.from, pair.to);
    const arrow = normalizeArrow(state.arrows[key]);
    if (arrow && !arrow.hidden) {
      state.arrows[key] = {
        ...arrow,
        color: nextColor
      };
    }
  });
  renderCells();
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

function getOperatorCenter(operator) {
  const gap = getGap();
  const { x, y, z } = operator.coord;
  const baseCoord = { x, y, z };
  const baseOrigin = getCellOrigin(baseCoord);
  const baseSize = getCellSize(baseCoord);

  if (operator.axis === "width") {
    return {
      x: baseOrigin.x + baseSize.width + gap / 2,
      y: baseOrigin.y + baseSize.height / 2,
      z: baseOrigin.z
    };
  }

  if (operator.axis === "height") {
    return {
      x: baseOrigin.x + baseSize.width / 2,
      y: baseOrigin.y + baseSize.height + gap / 2,
      z: baseOrigin.z
    };
  }

  return {
    x: baseOrigin.x + baseSize.width / 2,
    y: baseOrigin.y + baseSize.height / 2,
    z: baseOrigin.z + baseSize.depth / 2 + gap / 2
  };
}

function operatorTransform(operator) {
  const center = getOperatorCenter(operator);
  return `translate3d(${center.x - state.operatorSize.width / 2}px, ${center.y - state.operatorSize.height / 2}px, ${center.z}px)`;
}

function setOperatorText(operator, text) {
  const nextText = String(text || "").trim().slice(0, 3);
  if (!nextText || nextText === operator.text) {
    return;
  }

  const beforeSnapshot = createHistorySnapshot();
  state.operators[operator.id] = {
    ...normalizeOperator(operator.axis, operator.coord, state.operators[operator.id]),
    text: nextText
  };
  renderCells();
  selectOperator(getOperatorById(operator.id));
  commitHistorySnapshot(beforeSnapshot);
}

function renderOperator(operator) {
  const element = document.createElement("article");
  let pointerStart = null;
  element.className = "operator-box";
  element.dataset.operatorId = operator.id;
  element.style.setProperty("--w", `${state.operatorSize.width}px`);
  element.style.setProperty("--h", `${state.operatorSize.height}px`);
  element.style.setProperty("--d", `${state.operatorSize.depth}px`);
  element.style.setProperty("--ow", `${state.operatorSize.width}px`);
  element.style.setProperty("--oh", `${state.operatorSize.height}px`);
  element.style.setProperty("--od", `${state.operatorSize.depth}px`);
  element.style.transform = operatorTransform(operator);
  element.setAttribute("aria-label", `迷你方框 ${operator.text}`);

  faces.forEach((faceName) => {
    const face = document.createElement("span");
    face.className = `face ${faceName}`;
    element.appendChild(face);
  });

  const symbolAnchor = document.createElement("span");
  symbolAnchor.className = "operator-symbol-anchor";
  symbolAnchor.dataset.baseTransform = `translate3d(${state.operatorSize.width / 2}px, ${state.operatorSize.height / 2}px, 0)`;

  const symbol = document.createElement("span");
  symbol.className = "operator-symbol";
  symbol.textContent = operator.text;
  symbolAnchor.appendChild(symbol);
  element.appendChild(symbolAnchor);

  element.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    pointerStart = {
      x: event.clientX,
      y: event.clientY
    };
  });

  element.addEventListener("pointerup", (event) => {
    if (!pointerStart) {
      return;
    }

    event.stopPropagation();
    const deltaX = Math.abs(event.clientX - pointerStart.x);
    const deltaY = Math.abs(event.clientY - pointerStart.y);
    pointerStart = null;

    if (deltaX + deltaY > 3) {
      return;
    }

    if (editingState) {
      stopEditing({ commit: true });
    }
    selectOperatorFromEvent(operator, event);
  });

  element.addEventListener("click", (event) => {
    event.stopPropagation();
  });
  element.addEventListener("dblclick", (event) => {
    event.preventDefault();
    event.stopPropagation();
    const nextText = window.prompt("输入运算符", operator.text);
    if (nextText !== null) {
      setOperatorText(operator, nextText);
    }
  });

  updateOperatorClasses(element, operator);
  return element;
}

function getCellCenter(cell) {
  const origin = getCellOrigin(cell.coord);
  const size = getCellSize(cell.coord);
  return {
    x: origin.x + size.width / 2,
    y: origin.y + size.height / 2,
    z: origin.z
  };
}

function getArrowEndpoints(arrow) {
  const fromCell = getCellByBoardKey(arrow.from);
  const toCell = getCellByBoardKey(arrow.to);
  if (!fromCell || !toCell) {
    return null;
  }

  return {
    from: getCellCenter(fromCell),
    to: getCellCenter(toCell),
    fromCell,
    toCell
  };
}

function getCellBounds(cell) {
  const origin = getCellOrigin(cell.coord);
  const size = getCellSize(cell.coord);
  return {
    minX: origin.x,
    maxX: origin.x + size.width,
    minY: origin.y,
    maxY: origin.y + size.height,
    minZ: origin.z - size.depth / 2,
    maxZ: origin.z + size.depth / 2
  };
}

function movePointAlongDirection(point, direction, distance) {
  return {
    x: point.x + direction.x * distance,
    y: point.y + direction.y * distance,
    z: point.z + direction.z * distance
  };
}

function getSegmentBoxIntersectionRange(start, end, bounds) {
  const delta = {
    x: end.x - start.x,
    y: end.y - start.y,
    z: end.z - start.z
  };
  let enter = 0;
  let exit = 1;

  const axes = [
    { coord: "x", min: bounds.minX, max: bounds.maxX },
    { coord: "y", min: bounds.minY, max: bounds.maxY },
    { coord: "z", min: bounds.minZ, max: bounds.maxZ }
  ];

  for (const axis of axes) {
    const startValue = start[axis.coord];
    const deltaValue = delta[axis.coord];
    if (Math.abs(deltaValue) < 0.0001) {
      if (startValue < axis.min || startValue > axis.max) {
        return null;
      }
      continue;
    }

    const first = (axis.min - startValue) / deltaValue;
    const second = (axis.max - startValue) / deltaValue;
    const axisEnter = Math.min(first, second);
    const axisExit = Math.max(first, second);
    enter = Math.max(enter, axisEnter);
    exit = Math.min(exit, axisExit);

    if (enter > exit) {
      return null;
    }
  }

  return {
    enter,
    exit
  };
}

function getPointOnSegment(start, end, t) {
  return {
    x: start.x + (end.x - start.x) * t,
    y: start.y + (end.y - start.y) * t,
    z: start.z + (end.z - start.z) * t
  };
}

function dotProduct(first, second) {
  return first.x * second.x + first.y * second.y + first.z * second.z;
}

function crossProduct(first, second) {
  return {
    x: first.y * second.z - first.z * second.y,
    y: first.z * second.x - first.x * second.z,
    z: first.x * second.y - first.y * second.x
  };
}

function normalizeVector(vector, fallback = { x: 1, y: 0, z: 0 }) {
  const length = Math.hypot(vector.x, vector.y, vector.z);
  if (length < 0.0001) {
    return fallback;
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
    z: vector.z / length
  };
}

function rotateXVector(vector, degrees) {
  const radians = degrees * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: vector.x,
    y: vector.y * cos - vector.z * sin,
    z: vector.y * sin + vector.z * cos
  };
}

function rotateYVector(vector, degrees) {
  const radians = degrees * Math.PI / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  return {
    x: vector.x * cos + vector.z * sin,
    y: vector.y,
    z: -vector.x * sin + vector.z * cos
  };
}

function getCameraDirectionInModelSpace() {
  return normalizeVector(
    rotateYVector(
      rotateXVector({ x: 0, y: 0, z: 1 }, -viewState.rotationX),
      -viewState.rotationY
    ),
    { x: 0, y: 0, z: 1 }
  );
}

function getArrowBillboardMatrix(direction) {
  const xAxis = normalizeVector(direction);
  const cameraDirection = getCameraDirectionInModelSpace();
  let zAxis = {
    x: cameraDirection.x - xAxis.x * dotProduct(cameraDirection, xAxis),
    y: cameraDirection.y - xAxis.y * dotProduct(cameraDirection, xAxis),
    z: cameraDirection.z - xAxis.z * dotProduct(cameraDirection, xAxis)
  };
  zAxis = normalizeVector(zAxis, Math.abs(xAxis.z) < 0.9 ? { x: 0, y: 0, z: 1 } : { x: 0, y: 1, z: 0 });
  const yAxis = normalizeVector(crossProduct(zAxis, xAxis), { x: 0, y: 1, z: 0 });

  return `matrix3d(${[
    xAxis.x, xAxis.y, xAxis.z, 0,
    yAxis.x, yAxis.y, yAxis.z, 0,
    zAxis.x, zAxis.y, zAxis.z, 0,
    0, 0, 0, 1
  ].join(", ")})`;
}

function getTrimmedArrowEndpoints(endpoints) {
  const vector = {
    x: endpoints.to.x - endpoints.from.x,
    y: endpoints.to.y - endpoints.from.y,
    z: endpoints.to.z - endpoints.from.z
  };
  const distance = Math.hypot(vector.x, vector.y, vector.z);
  if (distance <= 0.01) {
    return null;
  }

  const fromRange = getSegmentBoxIntersectionRange(endpoints.from, endpoints.to, getCellBounds(endpoints.fromCell));
  const toRange = getSegmentBoxIntersectionRange(endpoints.from, endpoints.to, getCellBounds(endpoints.toCell));
  if (!fromRange || !toRange) {
    return null;
  }

  const overlapT = ARROW_ENDPOINT_OVERLAP / distance;
  let startT = fromRange.exit - overlapT;
  let endT = toRange.enter + overlapT;

  if (startT >= endT) {
    const minLengthT = Math.min(1, ARROW_MIN_LENGTH / distance);
    const centerT = (fromRange.exit + toRange.enter) / 2;
    startT = centerT - minLengthT / 2;
    endT = centerT + minLengthT / 2;
  }

  startT = clamp(startT, 0, 1);
  endT = clamp(endT, 0, 1);
  if (startT >= endT) {
    return null;
  }

  return {
    from: getPointOnSegment(endpoints.from, endpoints.to, startT),
    to: getPointOnSegment(endpoints.from, endpoints.to, endT)
  };
}

function getArrowGeometry(arrow) {
  const endpoints = getArrowEndpoints(arrow);
  if (!endpoints) {
    return null;
  }
  const trimmedEndpoints = getTrimmedArrowEndpoints(endpoints);
  if (!trimmedEndpoints) {
    return null;
  }

  const midpoint = {
    x: (trimmedEndpoints.from.x + trimmedEndpoints.to.x) / 2,
    y: (trimmedEndpoints.from.y + trimmedEndpoints.to.y) / 2,
    z: (trimmedEndpoints.from.z + trimmedEndpoints.to.z) / 2
  };
  const vector = {
    x: trimmedEndpoints.to.x - trimmedEndpoints.from.x,
    y: trimmedEndpoints.to.y - trimmedEndpoints.from.y,
    z: trimmedEndpoints.to.z - trimmedEndpoints.from.z
  };
  const rawLength = Math.hypot(vector.x, vector.y, vector.z);
  const length = Math.max(ARROW_MIN_LENGTH, rawLength);
  const direction = normalizeVector(vector);

  return {
    midpoint,
    length,
    direction
  };
}

function updateArrowElement(element, arrow) {
  const geometry = getArrowGeometry(arrow);
  if (!geometry) {
    element.classList.add("is-hidden");
    return;
  }

  const baseTransform = `translate3d(${geometry.midpoint.x}px, ${geometry.midpoint.y}px, ${geometry.midpoint.z}px)`;
  const track = element.querySelector(".arrow-track");
  element.style.transform = baseTransform;
  element.style.setProperty("--arrow-color", arrow.color);
  element.classList.toggle("is-hidden", arrow.hidden);
  element.classList.toggle("is-selected", isArrowSelected(arrow));
  if (track) {
    track.style.width = `${geometry.length}px`;
    track.style.left = `${-geometry.length / 2}px`;
    track.style.transform = getArrowBillboardMatrix(geometry.direction);
  }
}

function selectArrowEndpoints(arrow) {
  const fromCell = getCellByBoardKey(arrow.from);
  const toCell = getCellByBoardKey(arrow.to);
  if (!fromCell || !toCell) {
    return;
  }

  viewState.selectedId = toCell.id;
  viewState.selectedIds = new Set([fromCell.id, toCell.id]);
  updateAllCellStates();
  updateAllOperatorStates();
  updateAllArrowStates();
  updateSelection();
  updateWindowControlButtons();
}

function isArrowSelected(arrow) {
  const selectedCells = getSelectedCellSequence();
  if (selectedCells.length !== 2) {
    return false;
  }

  return getBoardKeyFromCoord(selectedCells[0].coord) === arrow.from
    && getBoardKeyFromCoord(selectedCells[1].coord) === arrow.to;
}

function renderArrow(arrow) {
  const element = document.createElement("article");
  element.className = "arrow-link";
  element.dataset.arrowId = arrow.id;
  element.setAttribute("aria-label", `箭头 ${arrow.from} 到 ${arrow.to}`);

  const track = document.createElement("span");
  track.className = "arrow-track";
  const line = document.createElement("span");
  line.className = "arrow-line";
  const head = document.createElement("span");
  head.className = "arrow-head";
  track.append(line, head);
  element.appendChild(track);

  element.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
  });
  element.addEventListener("click", (event) => {
    event.stopPropagation();
    if (editingState) {
      stopEditing({ commit: true });
    }
    selectArrowEndpoints(arrow);
  });

  updateArrowElement(element, arrow);
  return element;
}

function renderExcelTableRows() {
  if (!excelTableRack) {
    return;
  }

  excelTableRack.replaceChildren();
  state.excelTable = normalizeExcelTable(state.excelTable);
  const columns = state.excelTable.columns;
  const contentWidth = columns.reduce((sum, column) => sum + column.width, 0);
  const tableWidth = EXCEL_TABLE_ROW_HEADER_WIDTH + contentWidth;
  const tableHeight = EXCEL_TABLE_HEADER_HEIGHT + state.excelTable.rows.reduce((sum, row) => sum + row.height, 0);
  const totalCuboidWidth = sumList(state.sliceSizes.widths) + (state.dimensions.width - 1) * getGap();
  const tableX = -totalCuboidWidth / 2 - EXCEL_TABLE_GAP_FROM_CUBOID - tableWidth;
  const gridTemplateColumns = `${EXCEL_TABLE_ROW_HEADER_WIDTH}px ${columns.map((column) => `${column.width}px`).join(" ")}`;
  excelTableRack.style.setProperty("--excel-table-width", `${tableWidth}px`);
  excelTableRack.style.setProperty("--excel-table-height", `${tableHeight}px`);
  excelTableRack.style.transform = `translate3d(${tableX}px, ${EXCEL_TABLE_POSITION.y}px, ${EXCEL_TABLE_POSITION.z}px)`;
  excelTableRack.appendChild(renderExcelColumnHeaderRow({ columns, gridTemplateColumns }));

  let rowY = EXCEL_TABLE_HEADER_HEIGHT;
  state.excelTable.rows.forEach((row, index) => {
    const element = document.createElement("div");
    element.className = `excel-table-row${row.kind ? ` is-${row.kind}` : ""}`;
    element.dataset.baseTransform = `translate3d(0px, ${rowY}px, 0px)`;
    element.style.gridTemplateColumns = gridTemplateColumns;
    element.style.height = `${row.height}px`;
    element.style.lineHeight = `${row.height - 1}px`;
    element.style.transform = element.dataset.baseTransform;
    element.addEventListener("pointerdown", (event) => {
      event.stopPropagation();
      selectExcelTable();
      handleExcelRowResizeHit(event);
    });

    const rowHeader = document.createElement("span");
    rowHeader.className = "excel-row-title";
    rowHeader.textContent = String(index + 1);
    const rowResizeHandle = document.createElement("span");
    rowResizeHandle.className = "excel-row-resize-handle";
    rowResizeHandle.dataset.rowIndex = String(index);
    rowResizeHandle.addEventListener("pointerdown", handleExcelRowResizeStart);
    rowHeader.appendChild(rowResizeHandle);
    element.appendChild(rowHeader);

    columns.forEach((column) => {
      const cell = document.createElement("span");
      const value = row.cells[column.id];
      cell.className = `excel-cell excel-cell-${column.id}`;
      cell.textContent = value;
      cell.title = value;
      cell.contentEditable = "true";
      cell.spellcheck = false;
      cell.dataset.rowIndex = String(index);
      cell.dataset.columnId = column.id;
      cell.addEventListener("focus", handleExcelCellFocus);
      cell.addEventListener("input", handleExcelCellInput);
      cell.addEventListener("blur", handleExcelCellBlur);
      cell.addEventListener("keydown", handleExcelCellKeydown);
      cell.addEventListener("paste", handleExcelCellPaste);

      element.appendChild(cell);
    });

    let columnEdge = 0;
    columns.forEach((column) => {
      columnEdge += column.width;
      const handle = document.createElement("span");
      handle.className = "excel-column-resize-handle";
      handle.dataset.columnId = column.id;
      handle.style.left = `${EXCEL_TABLE_ROW_HEADER_WIDTH + columnEdge}px`;
      handle.addEventListener("pointerdown", handleExcelColumnResizeStart);
      element.appendChild(handle);
    });

    excelTableRack.appendChild(element);
    rowY += row.height;
  });
}

function renderExcelColumnHeaderRow({ columns, gridTemplateColumns }) {
  const element = document.createElement("div");
  element.className = "excel-table-row excel-column-title-row";
  element.dataset.baseTransform = "translate3d(0px, 0px, 0px)";
  element.style.gridTemplateColumns = gridTemplateColumns;
  element.style.height = `${EXCEL_TABLE_HEADER_HEIGHT}px`;
  element.style.lineHeight = `${EXCEL_TABLE_HEADER_HEIGHT - 1}px`;
  element.style.transform = element.dataset.baseTransform;
  element.addEventListener("pointerdown", (event) => {
    event.stopPropagation();
    selectExcelTable();
  });

  const corner = document.createElement("span");
  corner.className = "excel-corner-title";
  element.appendChild(corner);

  columns.forEach((column, index) => {
    const title = document.createElement("span");
    title.className = "excel-column-title";
    title.textContent = String.fromCharCode(65 + index);
    element.appendChild(title);
  });

  let columnEdge = 0;
  columns.forEach((column) => {
    columnEdge += column.width;
    const handle = document.createElement("span");
    handle.className = "excel-column-title-resize-handle";
    handle.dataset.columnId = column.id;
    handle.style.left = `${EXCEL_TABLE_ROW_HEADER_WIDTH + columnEdge}px`;
    handle.addEventListener("pointerdown", handleExcelColumnResizeStart);
    element.appendChild(handle);
  });

  return element;
}

function handleExcelCellFocus() {
  if (!excelEditSnapshot) {
    excelEditSnapshot = createHistorySnapshot();
  }
}

function handleExcelCellInput(event) {
  const rowIndex = Number.parseInt(event.currentTarget.dataset.rowIndex, 10);
  const columnId = event.currentTarget.dataset.columnId;
  if (!Number.isInteger(rowIndex) || !columnId || !state.excelTable.rows[rowIndex]) {
    return;
  }

  state.excelTable.rows[rowIndex].cells[columnId] = event.currentTarget.textContent;
  markDirty();
}

function handleExcelCellBlur() {
  if (!excelEditSnapshot) {
    return;
  }

  const beforeSnapshot = excelEditSnapshot;
  excelEditSnapshot = null;
  commitHistorySnapshot(beforeSnapshot);
}

function handleExcelCellKeydown(event) {
  if (event.key === "Enter") {
    event.preventDefault();
    event.currentTarget.blur();
  }
}

function handleExcelCellPaste(event) {
  event.preventDefault();
  const text = event.clipboardData.getData("text/plain").replace(/[\r\n\t]+/g, " ");
  document.execCommand("insertText", false, text);
}

function stopExcelEditing() {
  if (document.activeElement?.classList?.contains("excel-cell")) {
    document.activeElement.blur();
  }
}

function getExcelTablePointerHit(event) {
  if (!excelTableRack) {
    return null;
  }

  const rows = [...excelTableRack.querySelectorAll(".excel-table-row")];
  const tableWidth = EXCEL_TABLE_ROW_HEADER_WIDTH
    + state.excelTable.columns.reduce((sum, column) => sum + column.width, 0);

  for (const rowElement of rows) {
    const rect = rowElement.getBoundingClientRect();
    if (
      rect.width <= 0
      || rect.height <= 0
      || event.clientX < rect.left
      || event.clientX > rect.right
      || event.clientY < rect.top
      || event.clientY > rect.bottom
    ) {
      continue;
    }

    const localX = ((event.clientX - rect.left) / rect.width) * tableWidth;
    const rowIndex = rowElement.classList.contains("excel-column-title-row")
      ? -1
      : Number.parseInt(rowElement.querySelector(".excel-cell")?.dataset.rowIndex, 10);
    let columnEdge = EXCEL_TABLE_ROW_HEADER_WIDTH;
    let columnId = null;
    let resizeColumnId = null;
    let nearestResizeDistance = Infinity;

    state.excelTable.columns.forEach((column) => {
      const start = columnEdge;
      const end = columnEdge + column.width;
      const distance = Math.abs(localX - end);
      if (localX >= start && localX <= end) {
        columnId = column.id;
      }
      if (distance <= EXCEL_COLUMN_RESIZE_HITBOX && distance < nearestResizeDistance) {
        resizeColumnId = column.id;
        nearestResizeDistance = distance;
      }
      columnEdge = end;
    });

    return {
      rowElement,
      rowIndex,
      columnId,
      resizeColumnId,
      inRowHeader: localX < EXCEL_TABLE_ROW_HEADER_WIDTH
    };
  }

  return null;
}

function focusExcelCell(rowIndex, columnId) {
  if (!Number.isInteger(rowIndex) || rowIndex < 0 || !columnId) {
    return;
  }

  const cell = excelTableRack?.querySelector(`.excel-cell[data-row-index="${rowIndex}"][data-column-id="${columnId}"]`);
  if (!cell) {
    return;
  }

  cell.focus();
  const range = document.createRange();
  range.selectNodeContents(cell);
  range.collapse(false);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
}

function handleExcelTablePointerCapture(event) {
  if (event.button !== 0 || excelTableRack?.contains(event.target)) {
    return;
  }

  const hit = getExcelTablePointerHit(event);
  if (!hit) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
  selectExcelTable();

  if (hit.resizeColumnId) {
    startExcelColumnResize(event, hit.resizeColumnId, excelTableRack);
    return;
  }

  if (!hit.inRowHeader && hit.columnId) {
    focusExcelCell(hit.rowIndex, hit.columnId);
  }
}

function handleExcelTableClickCapture(event) {
  if (excelTableRack?.contains(event.target)) {
    return;
  }

  const hit = getExcelTablePointerHit(event);
  if (!hit) {
    return;
  }

  event.preventDefault();
  event.stopImmediatePropagation();
}

function getExcelColumnResizeHit(event, rowElement) {
  const rect = rowElement.getBoundingClientRect();
  const tableWidth = EXCEL_TABLE_ROW_HEADER_WIDTH
    + state.excelTable.columns.reduce((sum, column) => sum + column.width, 0);
  if (rect.width <= 0 || tableWidth <= 0) {
    return null;
  }

  const localX = ((event.clientX - rect.left) / rect.width) * tableWidth;
  let columnEdge = EXCEL_TABLE_ROW_HEADER_WIDTH;
  let nearestHit = null;

  state.excelTable.columns.forEach((column) => {
    columnEdge += column.width;
    const distance = Math.abs(localX - columnEdge);
    if (distance <= EXCEL_COLUMN_RESIZE_HITBOX && (!nearestHit || distance < nearestHit.distance)) {
      nearestHit = {
        columnId: column.id,
        distance
      };
    }
  });

  return nearestHit;
}

function handleExcelRowResizeHit(event) {
  if (event.button !== 0 || event.target.classList.contains("excel-column-resize-handle")) {
    return;
  }

  const rowElement = event.currentTarget;
  const hit = getExcelColumnResizeHit(event, rowElement);
  if (!hit) {
    return;
  }

  startExcelColumnResize(event, hit.columnId, rowElement);
}

function handleExcelColumnResizeStart(event) {
  event.preventDefault();
  event.stopPropagation();
  startExcelColumnResize(event, event.currentTarget.dataset.columnId, event.currentTarget);
}

function startExcelColumnResize(event, columnId, captureElement) {
  selectExcelTable();
  stopExcelEditing();
  const column = state.excelTable.columns.find((item) => item.id === columnId);
  if (!column) {
    return;
  }

  event.preventDefault();
  excelColumnResizeState = {
    pointerId: event.pointerId,
    columnId,
    startX: event.clientX,
    startWidth: column.width,
    beforeSnapshot: createHistorySnapshot()
  };
  captureElement.setPointerCapture(event.pointerId);
  document.body.classList.add("is-resizing-excel-column");
}

function handleExcelColumnResizeMove(event) {
  if (!excelColumnResizeState || event.pointerId !== excelColumnResizeState.pointerId) {
    return;
  }

  const column = state.excelTable.columns.find((item) => item.id === excelColumnResizeState.columnId);
  if (!column) {
    return;
  }

  const delta = event.clientX - excelColumnResizeState.startX;
  column.width = Math.max(column.minWidth || EXCEL_COLUMN_WIDTH_MIN, Math.round(excelColumnResizeState.startWidth + delta / viewState.zoom));
  renderExcelTableRows();
  updateBillboards();
  markDirty();
}

function handleExcelColumnResizeEnd(event) {
  if (!excelColumnResizeState || event.pointerId !== excelColumnResizeState.pointerId) {
    return;
  }

  const beforeSnapshot = excelColumnResizeState.beforeSnapshot;
  excelColumnResizeState = null;
  document.body.classList.remove("is-resizing-excel-column");
  commitHistorySnapshot(beforeSnapshot);
}

function handleExcelRowResizeStart(event) {
  event.preventDefault();
  event.stopPropagation();
  selectExcelTable();
  stopExcelEditing();

  const rowIndex = Number.parseInt(event.currentTarget.dataset.rowIndex, 10);
  const row = state.excelTable.rows[rowIndex];
  if (!row) {
    return;
  }

  excelRowResizeState = {
    pointerId: event.pointerId,
    rowIndex,
    startY: event.clientY,
    startHeight: row.height,
    beforeSnapshot: createHistorySnapshot()
  };
  event.currentTarget.setPointerCapture(event.pointerId);
  document.body.classList.add("is-resizing-excel-row");
}

function handleExcelRowResizeMove(event) {
  if (!excelRowResizeState || event.pointerId !== excelRowResizeState.pointerId) {
    return;
  }

  const row = state.excelTable.rows[excelRowResizeState.rowIndex];
  if (!row) {
    return;
  }

  const delta = event.clientY - excelRowResizeState.startY;
  row.height = Math.max(EXCEL_ROW_HEIGHT_MIN, Math.round(excelRowResizeState.startHeight + delta / viewState.zoom));
  renderExcelTableRows();
  updateBillboards();
  markDirty();
}

function handleExcelRowResizeEnd(event) {
  if (!excelRowResizeState || event.pointerId !== excelRowResizeState.pointerId) {
    return;
  }

  const beforeSnapshot = excelRowResizeState.beforeSnapshot;
  excelRowResizeState = null;
  document.body.classList.remove("is-resizing-excel-row");
  commitHistorySnapshot(beforeSnapshot);
}

function renderCells() {
  syncSliceSizesToDimensions();
  state.operatorSize = normalizeOperatorSize(state.operatorSize);
  buildCells();
  buildOperators();
  buildArrows();
  cuboid.replaceChildren();
  cuboid.classList.toggle("has-detail-preview", viewState.detailPreview);
  cuboid.classList.toggle("has-markers", viewState.markersVisible);
  updateSpacingControls();
  setCuboidBounds();
  cells.forEach((cell) => {
    cuboid.appendChild(renderCell(cell));
  });
  operators.forEach((operator) => {
    cuboid.appendChild(renderOperator(operator));
  });
  arrows.forEach((arrow) => {
    cuboid.appendChild(renderArrow(arrow));
  });
  renderExcelTableRows();
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
  const { x, y, z } = getCellOrigin(coord);

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
  if (textSizeInput) {
    textSizeInput.value = viewState.textSize;
  }

  if (operatorWidthInput) {
    operatorWidthInput.value = state.operatorSize.width;
  }
  if (operatorHeightInput) {
    operatorHeightInput.value = state.operatorSize.height;
  }
  if (operatorDepthInput) {
    operatorDepthInput.value = state.operatorSize.depth;
  }
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
  operators.forEach((operator) => {
    const element = cuboid.querySelector(`[data-operator-id="${operator.id}"]`);
    if (element) {
      element.style.transform = operatorTransform(operator);
    }
  });
  arrows.forEach((arrow) => {
    const element = cuboid.querySelector(`[data-arrow-id="${arrow.id}"]`);
    if (element) {
      updateArrowElement(element, arrow);
    }
  });
  renderExcelTableRows();
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

function updateOperatorClasses(element, operator) {
  if (!element) {
    return;
  }

  element.classList.toggle("is-selected", viewState.selectedIds.has(operator.id));
  element.classList.toggle("is-operator-hidden", operator.hidden);
  element.classList.toggle("is-box-hidden", operator.boxHidden);
}

function updateAllCellStates() {
  cells.forEach((cell) => {
    const element = cuboid.querySelector(`[data-cell-id="${cell.id}"]`);
    updateCellClasses(element, cell);
  });
}

function updateAllOperatorStates() {
  operators.forEach((operator) => {
    const element = cuboid.querySelector(`[data-operator-id="${operator.id}"]`);
    updateOperatorClasses(element, operator);
  });
}

function updateAllArrowStates() {
  arrows.forEach((arrow) => {
    const element = cuboid.querySelector(`[data-arrow-id="${arrow.id}"]`);
    if (element) {
      updateArrowElement(element, arrow);
    }
  });
}

function updateSelection() {
  const selectedCells = getSelectedCells();
  const selectedOperators = getSelectedOperators();
  if (selectedCells.length === 0 && selectedOperators.length === 0) {
    selectionText.textContent = "尚未选择。";
    return;
  }

  if (selectedCells.length === 1 && selectedOperators.length === 0) {
    selectionText.textContent = getFullText(selectedCells[0]);
    return;
  }

  if (selectedCells.length === 0 && selectedOperators.length === 1) {
    selectionText.textContent = `迷你方框：${selectedOperators[0].text}`;
    return;
  }

  selectionText.textContent = `已选择 ${getSelectedItemCount()} 个对象。`;
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

  if (excelTableRack) {
    const isExcelBackside = Math.cos((viewState.rotationY * Math.PI) / 180) < 0;
    const excelRowTransform = `rotateY(${isExcelBackside ? 180 : 0}deg) rotateX(${-viewState.rotationX}deg)`;
    excelTableRack.querySelectorAll(".excel-table-row").forEach((row) => {
      row.style.transform = `${row.dataset.baseTransform} ${excelRowTransform}`;
    });
  }

  cuboid.querySelectorAll(".operator-symbol-anchor").forEach((anchor) => {
    anchor.style.transform = `${anchor.dataset.baseTransform} ${labelTransform}`;
  });

  arrows.forEach((arrow) => {
    const element = cuboid.querySelector(`[data-arrow-id="${arrow.id}"]`);
    if (element) {
      updateArrowElement(element, arrow);
    }
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

function syncOperatorSizeFromInputs({ allowFallback = true, beforeSnapshot = null } = {}) {
  if (!operatorWidthInput || !operatorHeightInput || !operatorDepthInput) {
    return;
  }

  if (editingState) {
    stopEditing({ commit: true });
  }

  const nextWidth = Number.parseInt(operatorWidthInput.value, 10);
  const nextHeight = Number.parseInt(operatorHeightInput.value, 10);
  const nextDepth = Number.parseInt(operatorDepthInput.value, 10);

  if (!allowFallback && [nextWidth, nextHeight, nextDepth].some((value) => Number.isNaN(value))) {
    return;
  }

  state.operatorSize = {
    width: toOperatorSize(operatorWidthInput.value, "width", state.operatorSize.width),
    height: toOperatorSize(operatorHeightInput.value, "height", state.operatorSize.height),
    depth: toOperatorSize(operatorDepthInput.value, "depth", state.operatorSize.depth)
  };
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
  updateAllOperatorStates();
  updateAllArrowStates();
  selectionText.textContent = "尚未选择。";
  updateWindowControlButtons();
  applyViewTransform();
}

wireFormatToolbar(topFormatToolbar);
updateFormatToolbarState();

scene.addEventListener("pointerdown", handleExcelTablePointerCapture, true);
scene.addEventListener("pointerdown", handlePointerDown);
scene.addEventListener("pointermove", handlePointerMove);
scene.addEventListener("pointerup", handlePointerUp);
scene.addEventListener("pointercancel", handlePointerUp);
scene.addEventListener("click", handleExcelTableClickCapture, true);
scene.addEventListener("wheel", handleWheel, { passive: false });
window.addEventListener("pointermove", handleExcelColumnResizeMove);
window.addEventListener("pointerup", handleExcelColumnResizeEnd);
window.addEventListener("pointercancel", handleExcelColumnResizeEnd);
window.addEventListener("pointermove", handleExcelRowResizeMove);
window.addEventListener("pointerup", handleExcelRowResizeEnd);
window.addEventListener("pointercancel", handleExcelRowResizeEnd);
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

showMiniOperatorButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedMiniOperatorVisibility(true);
});

hideMiniOperatorButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedMiniOperatorVisibility(false);
});

showArrowButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedArrowsVisibility(true);
});

hideArrowButton.addEventListener("click", (event) => {
  event.stopPropagation();
  setSelectedArrowsVisibility(false);
});

arrowColorInput?.addEventListener("input", () => {
  const color = normalizeHexColor(arrowColorInput.value);
  if (color) {
    viewState.arrowColor = color;
  }
});

arrowColorInput?.addEventListener("change", () => {
  setSelectedArrowsColor(arrowColorInput.value);
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

[operatorWidthInput, operatorHeightInput, operatorDepthInput].forEach((input) => {
  if (!input) {
    return;
  }

  const captureOperatorSizeSnapshot = () => {
    if (!operatorSizeChangeSnapshot) {
      operatorSizeChangeSnapshot = createHistorySnapshot();
    }
  };
  const commitOperatorSizeChange = () => {
    syncOperatorSizeFromInputs({ beforeSnapshot: operatorSizeChangeSnapshot });
    operatorSizeChangeSnapshot = null;
  };

  input.addEventListener("focus", captureOperatorSizeSnapshot);
  input.addEventListener("pointerdown", captureOperatorSizeSnapshot);
  input.addEventListener("input", () => syncOperatorSizeFromInputs({ allowFallback: false }));
  input.addEventListener("change", commitOperatorSizeChange);
  input.addEventListener("blur", commitOperatorSizeChange);
  input.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    captureOperatorSizeSnapshot();
    commitOperatorSizeChange();
    input.blur();
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

    if (editingState.editor.contains(event.target) || isInsideNote) {
      getActiveEditorBlock(editingState.editor)?.focus();
      return;
    }

    stopEditing({ commit: true });
    return;
  }

  if (viewState.excelTableSelected) {
    if (excelTableRack?.contains(event.target)) {
      return;
    }

    stopExcelEditing();
    setExcelTableSelected(false);
    selectionText.textContent = "尚未选择。";
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

  if (viewState.excelTableSelected) {
    event.preventDefault();
    stopExcelEditing();
    setExcelTableSelected(false);
    selectionText.textContent = "尚未选择。";
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
  if (arrowColorInput) {
    arrowColorInput.value = viewState.arrowColor;
  }
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
  get arrows() {
    return arrows;
  },
  viewState,
  ROW_RULES,
  resetView,
  saveBoardState
};
