import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const repositoryRoot = process.cwd();
const distRoot = join(repositoryRoot, "dist");
const packageJson = JSON.parse(readFileSync(join(repositoryRoot, "package.json"), "utf8"));
const commit = process.env.CHARACTER_FORGE_BUILD_SHA?.trim()
  || process.env.GITHUB_SHA?.trim()
  || git(["rev-parse", "HEAD"], "unknown");
const dirty = process.env.CI ? false : git(["status", "--porcelain"], "").trim().length > 0;
const buildInfo = {
  version: String(packageJson.version ?? "dev"),
  commit,
  builtAt: new Date().toISOString(),
  dirty,
};

mkdirSync(distRoot, { recursive: true });
writeFileSync(join(distRoot, "build-info.json"), `${JSON.stringify(buildInfo, null, 2)}\n`, "utf8");
writeFileSync(
  join(distRoot, "build-info.js"),
  `globalThis.__CHARACTER_FORGE_BUILD__ = Object.freeze(${JSON.stringify(buildInfo)});\n`,
  "utf8",
);

console.log(`Character Forge build ${buildInfo.version} ${buildInfo.commit.slice(0, 8)}${dirty ? "+dirty" : ""}`);

function git(args, fallback) {
  try {
    return execFileSync("git", args, { cwd: repositoryRoot, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
  } catch {
    return fallback;
  }
}
