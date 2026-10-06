const http = require("node:http");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const root = __dirname;
const files = new Map([
  ["/", ["index.html", "text/html; charset=utf-8"]],
  ["/index.html", ["index.html", "text/html; charset=utf-8"]],
  ["/styles.css", ["styles.css", "text/css; charset=utf-8"]],
  ["/app.js", ["app.js", "text/javascript; charset=utf-8"]],
  ["/school-welcome.svg", ["school-welcome.svg", "image/svg+xml"]]
]);
const port = Number(process.env.PORT || 8765);
const host = process.env.HOST || "0.0.0.0";

const server = http.createServer((request, response) => {
  const entry = files.get(new URL(request.url, "http://localhost").pathname);
  if (!entry) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  fs.readFile(path.join(root, entry[0]), (error, content) => {
    if (error) {
      console.error(`Could not read ${entry[0]}:`, error);
      response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Could not load preview file");
      return;
    }
    response.writeHead(200, { "Content-Type": entry[1] });
    response.end(content);
  });
});

server.on("error", error => {
  console.error(`Could not start preview server on ${host}:${port}:`, error.message);
  process.exitCode = 1;
});

server.listen(port, host, () => {
  console.log(`Preview available locally at http://127.0.0.1:${port}/`);
  if (host === "0.0.0.0" || host === "::") {
    const addresses = Object.values(os.networkInterfaces())
      .flatMap(entries => entries || [])
      .filter(entry => entry.family === "IPv4" && !entry.internal)
      .map(entry => entry.address);
    if (addresses.length) {
      console.log("On other devices connected to the same network:");
      for (const address of addresses) console.log(`  http://${address}:${port}/`);
    } else {
      console.log("No LAN IPv4 address found. Check the network connection.");
    }
  } else {
    console.log(`Preview bound to ${host}; other devices can use http://${host}:${port}/`);
  }
  console.log("Demo server only: do not expose it to the public internet.");
});
