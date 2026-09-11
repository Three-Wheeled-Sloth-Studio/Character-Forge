import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");

describe("Character Forge product shell", () => {
  it("keeps product identity primary and studio identity subordinate", () => {
    const productTitle = mainSource.indexOf("<h1>Character Forge</h1>");
    const studioMark = mainSource.indexOf("Three-Wheeled Sloth Studio");

    expect(mainSource).toContain('<p class="eyebrow">Parchment Worlds module</p>');
    expect(productTitle).toBeGreaterThan(-1);
    expect(studioMark).toBeGreaterThan(productTitle);
    expect(mainSource).toContain('<p class="muted">Three-Wheeled Sloth Studio</p>');
  });
});
