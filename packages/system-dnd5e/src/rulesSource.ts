import type { RulesSourceReference } from "../../character-model/src/index.js";

export const DND5E_SRD_5_2_1_SOURCE = {
  id: "wotc-srd-5.2.1",
  systemId: "dnd5e",
  editionId: "2024",
  version: "5.2.1",
  title: "System Reference Document 5.2.1",
  sourceUrl: "https://www.dndbeyond.com/srd",
  publishedDate: "2025-05-01",
  license: {
    id: "CC-BY-4.0",
    url: "https://creativecommons.org/licenses/by/4.0/",
    creator: "Wizards of the Coast LLC",
    workTitle: "System Reference Document 5.2.1 (SRD 5.2.1)",
  },
} as const satisfies RulesSourceReference;
