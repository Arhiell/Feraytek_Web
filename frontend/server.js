const http = require("http");
const fs = require("fs");
const path = require("path");

const root = __dirname;

const types = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".jsx": "application/javascript",
  ".json": "application/json"
};

const server = http.createServer((req, res) => {
  if (req.url === "/favicon.ico") {
    res.writeHead(200, { "Content-Type": "image/x-icon" });
    res.end("");
    return;
  }
  if (req.url.startsWith("/api/")) {
    const options = {
      hostname: "localhost",
      port: 3000,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: "localhost:3000"
      }
    };
    const proxy = http.request(options, (pr) => {
      const headers = { ...pr.headers };
      res.writeHead(pr.statusCode || 500, headers);
      pr.pipe(res);
    });
    req.pipe(proxy);
    proxy.on("error", () => {
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ message: "Proxy error" }));
    });
    return;
  }
  const url = req.url === "/" ? "/index.html" : req.url;
  const file = path.join(root, url);
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain" }); res.end("Not found"); return; }
    const ext = path.extname(file);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    res.end(data);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Frontend escuchando en http://localhost:${PORT}`);
});