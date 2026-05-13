# 2x2x3 知识长方体开发说明

这个文件放项目结构、功能记录、后续开发说明。日常使用步骤请看 `README.md`。

## 1. 概念原型

- 大模型是一个 2x2x3 的透明长方体。
- 12 个小长方体代表 12 个可填写知识 cell。
- 相邻 cell 之间保留链接关系，用来表达知识匹配、类比、递进或互相印证。
- 每个 cell 的文字面板在视觉上尽量朝向屏幕，后续旋转时会改成真正的 billboard 行为。
- 部分 cell 先做成淡化状态，用来模拟之后的“隐藏 / 变淡 / 看穿后排内容”功能。

## 2. 数据结构

当前保存模型已经改成结构化数据。每个白板保存为 `boards[key]`，每一行文字是一个 block。

示例：

```json
{
  "schemaVersion": 1,
  "dimensions": {
    "width": 3,
    "height": 2,
    "depth": 2
  },
  "boards": {
    "0-0-0": {
      "id": "0-0-0",
      "blocks": [
        {
          "id": "block-1",
          "type": "heading",
          "text": "核心论点",
          "marks": []
        },
        {
          "id": "block-2",
          "type": "bullet",
          "text": "定义问题",
          "marks": []
        }
      ],
      "links": []
    }
  }
}
```

这个结构是为了后续继续扩展：

- superscript 可以放进 block 的 `marks`
- bullet point 可以通过 block 的 `type` 表达
- bullet point 之间的线可以放进 board 的 `links`

当前坐标定义：

- `x`: 横向，一共 3 格
- `y`: 纵向，一共 2 格
- `z`: 深度，一共 2 层

## 3. 静态模型

已实现：

- 透明 2x2x3 cell 网格
- 每个 cell 的空白知识面板
- 三维坐标轴
- 邻接链接提示点
- 淡化 cell 的视觉状态

## 4. 交互功能

已实现：

- 鼠标拖动旋转
- 滚轮 zoom in / out
- 点击 cell 选中，并在隐藏状态文本里同步当前 cell 摘要
- 双击文字面板编辑白板文字
- 文字面板随视角做反向旋转，尽量保持朝向屏幕
- 坐标轴跟随长方体一起旋转
- 重置视角按钮
- `Ctrl+Z` / `Ctrl+Y` 退一步和进一步，最多保留最近 10 次操作
- 左上角按钮支持退一步、进一步、保存
- `Ctrl+S` 保存当前白板状态
- 关闭网页前，如果有未保存修改，浏览器会提醒
- 本地 Node 服务器读写 `board-state.json`

还未实现：

- superscript
- bullet point 专门编辑体验
- 不同 bullet point 之间的连接线
- 根据文字内容自动决定连接线
- 更完整的学习模式
- 更精确的 3D billboard 排序和遮挡处理

## 5. 文件说明

- `index.html`: 页面结构。
- `styles.css`: 视觉样式。
- `app.js`: 3D 白板渲染、编辑、undo/redo、保存状态。
- `server.js`: 本地服务器，负责打开网页和读写 `board-state.json`。
- `board-state.json`: 保存后的白板内容，由保存功能自动生成或覆盖。
