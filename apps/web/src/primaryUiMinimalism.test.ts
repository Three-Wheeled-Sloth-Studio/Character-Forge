import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  autoAllocateBrpCreatorState,
  createDefaultBrpCreatorState,
  previewBrpCreatorState,
} from "./brpCreatorState.js";
import { brpCreatorHtml } from "./brpCreatorPanelView.js";

const mainSource = readFileSync("apps/web/src/main.ts", "utf8");
const workspaceSource = readFileSync("apps/web/src/creatorWorkspace.ts", "utf8");
const dndModeSource = readFileSync("apps/web/src/dndCreatorPanel.ts", "utf8");
const dndGuidedSource = readFileSync("apps/web/src/dndGuidedCreatorPanel.ts", "utf8");
const dndNarrativeSource = readFileSync("apps/web/src/dndNarrativeCreatorPanel.ts", "utf8");
const dndQuickSource = readFileSync("apps/web/src/dndQuickCreatorPanel.ts", "utf8");
const brpEquipmentSource = readFileSync("apps/web/src/brpEquipmentControls.ts", "utf8");
const brpFinishingSource = readFileSync("apps/web/src/brpFinishingControls.ts", "utf8");
const brpStylesSource = readFileSync("apps/web/src/brpCreatorStyles.ts", "utf8");

describe("primary creator UI minimalism", () => {
  it("keeps application and rules-system chrome task focused", () => {
    expect(mainSource).not.toContain("Translation magic comes later");
    expect(mainSource).not.toContain("Your generated character will stay visible here");
    expect(workspaceSource).not.toContain("System-specific generation controls stay below");
    expect(workspaceSource).not.toContain('id="creator-randomization-help"');
    expect(workspaceSource).toContain("⚄<sup>⚅</sup>");
    expect(workspaceSource).toContain("randomizeAll.title = help");
  });

  it("has no post-render primary UI compatibility layer", () => {
    expect(workspaceSource).not.toContain("creatorPresentationAdapter");
    expect(workspaceSource).not.toContain("applyPrimaryCreatorMinimalism");
    expect(workspaceSource).not.toContain("new MutationObserver");
    expect(existsSync("apps/web/src/creatorPresentationAdapter.ts")).toBe(false);
    expect(existsSync("apps/web/src/primaryUiMinimalism.ts")).toBe(false);
  });

  it("renders accepted BRP minimalism directly from the BRP view", () => {
    const state = autoAllocateBrpCreatorState(createDefaultBrpCreatorState());
    const preview = previewBrpCreatorState(state);
    const html = brpCreatorHtml(state, preview);

    expect(html).toContain("Basic Roleplaying | UGE 2023 | ORC 1.05");
    expect(html).not.toContain("BRP UGE creator");
    expect(html).toContain("<strong>Allocation</strong>");
    expect(html).toContain('class="creator-inline-help"');
    expect(html).toContain("<strong>Allocation:</strong> Ready");
    expect(html).toContain("<strong>Rules check:</strong> Ready");
    expect(html).not.toContain("currently implemented source-backed subset");
    expect(html).not.toContain("BRP explicitly supports creating a profession");
    expect(html).not.toContain("Suggestions use the source-safe first-slice catalog");
    expect(html).not.toContain("Ride and Martial Arts remain outside");
    expect(html).not.toContain("Heroic age causality remains retained in native state");
  });

  it("keeps D&D Guided and Narrative primary chrome minimal at their render owners", () => {
    expect(dndModeSource).not.toContain("Guided Mechanical exposes detailed choices");
    expect(dndQuickSource).not.toContain("system-owned first-slice Quick generator");
    expect(dndQuickSource).not.toContain("opaque character and native-state IDs");
    expect(dndGuidedSource).toContain('.creator-heading p:not(.eyebrow)');
    expect(dndGuidedSource).toContain("Started from Guided Narrative. Changes here are authoritative.");
    expect(dndNarrativeSource).not.toContain("Answer a few preference questions");
    expect(dndNarrativeSource).not.toContain("Every narrative question includes");
    expect(dndNarrativeSource).not.toContain("These choices have already been narrowed");
    expect(dndNarrativeSource).not.toContain("Build now to use the current Guided Narrative defaults");
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
