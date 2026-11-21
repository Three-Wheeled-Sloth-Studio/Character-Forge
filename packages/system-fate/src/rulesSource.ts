import type { RulesSourceReference } from "../../character-model/src/index.js";

// This date-stamped probe snapshot is not a claim that the official SRD has a 2026 edition.
// Confirm exact downloadable CC-BY SRD artifact and attribution before expanding content.
export const FATE_CONDENSED_PROBE_SOURCE = {
  id: "evil-hat-fate-condensed-ccby-probe-2026-11-21",
  systemId: "fate",
  editionId: "condensed",
  version: "probe-2026-11-21",
  title: "Fate Condensed (bounded architecture probe)",
  sourceUrl: "https://fate-srd.com/official-licensing-fate",
  license: {
    id: "CC-BY-3.0",
    url: "https://creativecommons.org/licenses/by/3.0/",
    creator: "Evil Hat Productions, LLC",
    workTitle: "Fate Condensed",
  },
} as const satisfies RulesSourceReference;
