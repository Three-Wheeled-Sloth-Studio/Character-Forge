import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const repositoryRoot = process.cwd();
const port = Number(readArg("--port") ?? "5174");
const host = readArg("--host") ?? "localhost";
const indexPath = join(repositoryRoot, "apps", "web", "index.html");
const stylesPath = join(repositoryRoot, "apps", "web", "src", "styles.css");
const distRoot = resolve(repositoryRoot, "dist");
const buildInfoPath = join(distRoot, "build-info.json");

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname;

  if (pathname === "/__health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
    response.end(JSON.stringify({ app: "character-forge", status: "ready", build: readBuildInfo() }));
    return;
  }
  if (pathname === "/" || pathname === "/index.html") {
    return streamFile(indexPath, response);
  }
  if (pathname === "/styles.css") {
    return streamFile(stylesPath, response);
  }
  if (pathname.startsWith("/dist/")) {
    const relative = normalize(pathname.slice("/dist/".length)).replace(/^([.][.][/\\])+/, "");
    const filePath = resolve(distRoot, relative);
    if (!filePath.startsWith(distRoot)) return notFound(response);
    return streamFile(filePath, response);
  }
  return streamFile(indexPath, response);
});

server.listen(port, host, () => {
  const build = readBuildInfo();
  const identity = build ? ` v${build.version} ${String(build.commit).slice(0, 8)}${build.dirty ? "+dirty" : ""}` : "";
  console.log(`Character Forge${identity} ready at http://${host}:${port}`);
});

function readArg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function readBuildInfo() {
  try {
    return JSON.parse(readFileSync(buildInfoPath, "utf8"));
  } catch {
    return null;
  }
}

function streamFile(filePath, response) {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) return notFound(response);
  response.writeHead(200, {
    "Content-Type": contentType(filePath),
    "Cache-Control": "no-store",
  });
  createReadStream(filePath).pipe(response);
}

function notFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not found");
}

function contentType(filePath) {
  switch (extname(filePath)) {
    case ".html": return "text/html; charset=utf-8";
    case ".css": return "text/css; charset=utf-8";
    case ".js": return "text/javascript; charset=utf-8";
    case ".json": return "application/json; charset=utf-8";
    default: return "application/octet-stream";
  }
}
