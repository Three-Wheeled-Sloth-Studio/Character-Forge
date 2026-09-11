export function applyPrimaryCreatorMinimalism(root: HTMLElement): void {
  minimizeBrpCreator(root);
  minimizeDndGuidedCreator(root);
  minimizeDndNarrativeCreator(root);
}

function minimizeBrpCreator(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>(".brp-creator-panel");
  if (!panel) return;

  const heading = panel.querySelector<HTMLElement>(".creator-heading");
  const eyebrow = heading?.querySelector<HTMLElement>(".eyebrow");
  if (eyebrow?.textContent?.trim() === "Basic Roleplaying") {
    eyebrow.textContent = "Basic Roleplaying | UGE 2023 | ORC 1.05";
  }
  const headingTitle = heading?.querySelector<HTMLElement>("h2");
  if (headingTitle?.textContent?.trim() === "BRP UGE creator") headingTitle.remove();
  for (const paragraph of heading?.querySelectorAll<HTMLParagraphElement>("p:not(.eyebrow)") ?? []) paragraph.remove();

  const profile = panel.querySelector<HTMLSelectElement>("#brp-campaign-profile");
  const profileLabel = profile?.closest("label");
  const profileNote = profileLabel?.querySelector<HTMLElement>(".muted");
  if (profileNote) {
    const note = profileNote.textContent?.trim() ?? "";
    if (note.startsWith("This reopened character keeps")) {
      profileNote.className = "form-error compact-status-note";
      profileNote.textContent = "Existing BRP rules retained until you choose a current profile.";
    } else {
      if (note) profileLabel?.setAttribute("title", note);
      profileNote.remove();
    }
  }

  for (const muted of panel.querySelectorAll<HTMLElement>("span.muted")) {
    if (muted.textContent?.includes("Heroic age causality remains retained in native state.")) muted.remove();
  }

  const allocationHeading = panel.querySelector<HTMLElement>(".brp-skill-heading");
  const allocationTitle = allocationHeading?.querySelector<HTMLElement>("strong");
  if (allocationTitle?.textContent?.trim() === "Skill allocation") allocationTitle.textContent = "Allocation";
  const allocationExplanation = allocationHeading?.querySelector<HTMLParagraphElement>("p.muted");
  if (allocationExplanation) {
    if (!allocationHeading?.querySelector(".creator-inline-help")) {
      allocationTitle?.insertAdjacentElement("afterend", helpIcon("Allocation rules", allocationExplanation.textContent?.trim() ?? ""));
    }
    allocationExplanation.remove();
  }

  const allocationStatus = panel.querySelector<HTMLElement>("[data-allocation-status]");
  if (allocationStatus?.dataset.allocationStatus === "ready") {
    if (allocationStatus.textContent?.replace(/\s+/g, " ").trim() !== "Allocation: Ready") {
      allocationStatus.innerHTML = "<strong>Allocation:</strong> Ready";
    }
  } else if (allocationStatus?.dataset.allocationStatus === "blocked") {
    const statusTitle = allocationStatus.querySelector<HTMLElement>("strong");
    if (statusTitle && statusTitle.textContent?.trim() !== "Allocation: Needs attention") {
      statusTitle.textContent = "Allocation: Needs attention";
    }
  }

  const validation = panel.querySelector<HTMLElement>("#brp-validation");
  if (validation?.classList.contains("valid-feedback")) {
    if (validation.textContent?.replace(/\s+/g, " ").trim() !== "Rules check: Ready") {
      validation.innerHTML = "<strong>Rules check:</strong> Ready";
    }
  }

  const suggestion = panel.querySelector<HTMLElement>(".brp-suggestion-note");
  if (suggestion) {
    const match = suggestion.textContent?.trim().match(/^Suggested [^.]+\./);
    if (match && suggestion.textContent?.trim() !== match[0]) suggestion.textContent = match[0];
  }

  for (const paragraph of panel.querySelectorAll<HTMLParagraphElement>("fieldset > p.muted")) {
    const text = paragraph.textContent?.trim() ?? "";
    if (text.includes("currently implemented source-backed subset")
      || text.startsWith("BRP explicitly supports creating a profession")
      || text.startsWith("Suggestions use the source-safe first-slice catalog.")) {
      paragraph.remove();
      continue;
    }
    if (text.startsWith("Fixed skills:") && text.includes("Ride and Martial Arts remain outside")) {
      paragraph.textContent = text.split(" Ride and Martial Arts remain outside")[0] ?? text;
    }
  }
}

function minimizeDndGuidedCreator(root: HTMLElement): void {
  const heading = root.querySelector<HTMLElement>("#dnd-guided-mode-host .creator-heading");
  if (!heading) return;
  for (const paragraph of heading.querySelectorAll<HTMLParagraphElement>("p:not(.eyebrow)")) {
    const text = paragraph.textContent?.trim() ?? "";
    if (text.startsWith("Started from Guided Narrative.")) {
      if (text !== "Started from Guided Narrative. Changes here are authoritative.") {
        paragraph.textContent = "Started from Guided Narrative. Changes here are authoritative.";
      }
    } else {
      paragraph.remove();
    }
  }
}

function minimizeDndNarrativeCreator(root: HTMLElement): void {
  const panel = root.querySelector<HTMLElement>(".dnd-narrative-creator");
  if (!panel) return;
  for (const paragraph of panel.querySelectorAll<HTMLParagraphElement>(".creator-heading > p:not(.eyebrow)")) paragraph.remove();
  for (const paragraph of panel.querySelectorAll<HTMLParagraphElement>("form > p.muted")) {
    if (paragraph.id !== "dnd-narrative-resolution") paragraph.remove();
  }
  for (const paragraph of panel.querySelectorAll<HTMLParagraphElement>("fieldset > p.muted")) {
    if (paragraph.id !== "dnd-narrative-mapping-summary") paragraph.remove();
  }
}

function helpIcon(label: string, help: string): HTMLSpanElement {
  const icon = document.createElement("span");
  icon.className = "creator-inline-help";
  icon.tabIndex = 0;
  icon.textContent = "i";
  icon.title = help;
  icon.setAttribute("role", "img");
  icon.setAttribute("aria-label", help ? `${label}: ${help}` : label);
  return icon;
}
