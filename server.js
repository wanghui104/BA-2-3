const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const PORT = Number.parseInt(process.env.PORT || "3000", 10);
const ROOT = __dirname;
const STATE_FILE = path.join(ROOT, "board-state.json");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8"
};

function sendJson(response, status, payload) {
  response.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(JSON.stringify(payload));
}

async function readRequestBody(request) {
  const chunks = [];
  for await (const chunk of request) {
    chunks.push(chunk);
  }

  return Buffer.concat(chunks).toString("utf8");
}

async function handleStateRequest(request, response) {
  if (request.method === "GET") {
    try {
      const content = await fs.readFile(STATE_FILE, "utf8");
      sendJson(response, 200, JSON.parse(content));
    } catch (error) {
      if (error.code === "ENOENT") {
        sendJson(response, 200, null);
        return;
      }

      sendJson(response, 500, { error: "Unable to read board state." });
    }
    return;
  }

  if (request.method === "POST") {
    try {
      const body = await readRequestBody(request);
      const payload = JSON.parse(body);
      const content = `${JSON.stringify(payload, null, 2)}\n`;
      await fs.writeFile(STATE_FILE, content, "utf8");
      sendJson(response, 200, { ok: true });
    } catch (error) {
      sendJson(response, 400, { error: "Unable to save board state." });
    }
    return;
  }

  sendJson(response, 405, { error: "Method not allowed." });
}

async function handleStaticRequest(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host}`);
  const decodedPath = decodeURIComponent(requestUrl.pathname);
  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.slice(1);
  const filePath = path.resolve(ROOT, relativePath);

  if (!filePath.startsWith(ROOT)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const extension = path.extname(filePath);
    response.writeHead(200, {
      "Content-Type": MIME_TYPES[extension] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(content);
  } catch (error) {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  if (request.url.startsWith("/api/state")) {
    await handleStateRequest(request, response);
    return;
  }

  await handleStaticRequest(request, response);
});

server.listen(PORT, () => {
  console.log(`Board server running at http://localhost:${PORT}/`);
  console.log("Press Ctrl+C to stop the server.");
});
