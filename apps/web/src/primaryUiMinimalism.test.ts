import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");
const workspaceSource = readFileSync("apps/web/src/creatorWorkspace.ts", "utf8");
const presentationAdapterSource = readFileSync("apps/web/src/creatorPresentationAdapter.ts", "utf8");
const minimalismSource = readFileSync("apps/web/src/primaryUiMinimalism.ts", "utf8");
const dndModeSource = readFileSync("apps/web/src/dndCreatorPanel.ts", "utf8");
const dndQuickSource = readFileSync("apps/web/src/dndQuickCreatorPanel.ts", "utf8");
const brpEquipmentSource = readFileSync("apps/web/src/brpEquipmentControls.ts", "utf8");
const brpFinishingSource = readFileSync("apps/web/src/brpFinishingControls.ts", "utf8");
const brpStylesSource = readFileSync("apps/web/src/brpCreatorStyles.ts", "utf8");

describe("Stage 0 primary creator UI minimalism", () => {
  it("keeps application and rules-system chrome task focused", () => {
    expect(mainSource).not.toContain("Translation magic comes later");
    expect(mainSource).not.toContain("Your generated character will stay visible here");
    expect(workspaceSource).not.toContain("System-specific generation controls stay below");
    expect(workspaceSource).not.toContain('id="creator-randomization-help"');
    expect(workspaceSource).toContain("⚄<sup>⚅</sup>");
    expect(workspaceSource).toContain("randomizeAll.title = help");
  });

  it("keeps temporary presentation cleanup out of workspace orchestration", () => {
    expect(workspaceSource).not.toContain("applyPrimaryCreatorMinimalism");
    expect(workspaceSource).not.toContain("new MutationObserver");
    expect(presentationAdapterSource).toContain("mountPresentedBrpCreator");
    expect(presentationAdapterSource).toContain("observer.disconnect()");
    expect(presentationAdapterSource).toContain("mountPresentedDndCreator");
  });

  it("removes explanatory prose from D&D mode and Quick generation chrome", () => {
    expect(dndModeSource).not.toContain("Guided Mechanical exposes detailed choices");
    expect(dndQuickSource).not.toContain("system-owned first-slice Quick generator");
    expect(dndQuickSource).not.toContain("opaque character and native-state IDs");
  });

  it("moves BRP source and allocation detail out of the primary task surface", () => {
    expect(minimalismSource).toContain('headingTitle?.textContent?.trim() === "BRP UGE creator"');
    expect(minimalismSource).toContain('allocationTitle.textContent = "Allocation"');
    expect(minimalismSource).toContain('allocationStatus.innerHTML = "<strong>Allocation:</strong> Ready"');
    expect(minimalismSource).toContain('validation.innerHTML = "<strong>Rules check:</strong> Ready"');
    expect(minimalismSource).toContain('helpIcon("Allocation rules"');
    expect(minimalismSource).toContain("Ride and Martial Arts remain outside");
  });

  it("removes nonessential BRP finishing and equipment explanations", () => {
    expect(brpEquipmentSource).not.toContain("BRP assumes ordinary setting-appropriate clothing");
    expect(brpFinishingSource).not.toContain("descriptive native state");
    expect(brpFinishingSource).not.toContain("Distinctive Features rules are not enabled");
  });

  it("normalizes BRP checkboxes instead of inheriting full-width text input sizing", () => {
    expect(brpStylesSource).toContain('.brp-creator-panel input[type="checkbox"]');
    expect(brpStylesSource).toContain("width: 1rem");
    expect(brpStylesSource).toContain("height: 1rem");
  });
});
