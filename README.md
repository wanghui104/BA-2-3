# 知识长方体使用说明

这个文件只记录日常怎么打开、保存、退出。项目结构和开发说明在 `DEV_NOTES.md`。

## 开始一轮编辑

1. 打开 PowerShell。

2. 进入项目目录：

```powershell
cd "C:\E drive\Dropbox\Study\myproject\project 25_05_09 BA 2-3"
```

3. 启动服务器：

```powershell
node .\server.js
```

4. 看到下面两行，表示服务器已经启动：

```text
Board server running at http://localhost:3000/
Press Ctrl+C to stop the server.
```

5. 在浏览器打开：

```text
http://localhost:3000/
```

页面会自动读取上次保存的 `board-state.json`。

## 修改和保存

1. 双击白板文字，修改内容。
2. 按 `Enter` 提交这次文字编辑。
3. 左上角如果显示“未保存”，说明内容还没有写入文件。
4. 点击左上角“保存”，或者按 `Ctrl+S`。
5. 左上角显示“已保存”，说明内容已经写入 `board-state.json`。

## 退出这一轮

1. 关闭浏览器里的网页。
2. 回到 PowerShell。
3. 按 `Ctrl+C` 停止服务器。
4. 如果回到类似下面的提示符，说明服务器已经成功关闭：

```powershell
PS C:\E drive\Dropbox\Study\myproject\project 25_05_09 BA 2-3>
```

如果 PowerShell 询问是否终止批处理作业，输入 `Y` 并回车。

## 下一轮继续

1. 重新进入项目目录。
2. 重新运行：

```powershell
node .\server.js
```

3. 再次打开：

```text
http://localhost:3000/
```

你应该能看到上一轮保存过的白板内容。

## 常用快捷键

- `Ctrl+S`: 保存
- `Ctrl+Z`: 退一步
- `Ctrl+Y`: 进一步
- `Ctrl+Shift+Z`: 进一步
