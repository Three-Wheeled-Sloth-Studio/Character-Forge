import type { RulesSourceReference } from "../../character-model/src/index.js";

export const BRP_UGE_ORC_1_05_SOURCE = {
  id: "chaosium-brp-uge-orc-1.05",
  systemId: "brp",
  editionId: "uge-2023",
  version: "1.05",
  title: "Basic Roleplaying: Universal Game Engine ORC Content Document",
  sourceUrl: "https://www.chaosium.com/blogdownload-the-free-basic-roleplaying-orc-content-document-sell-the-games-you-create-royaltyfree/",
  publishedDate: "2024-03-06",
  license: {
    id: "ORC-1.0",
    url: "https://www.chaosium.com/orc-license/",
    creator: "Chaosium Inc.",
    workTitle: "Basic Roleplaying: Universal Game Engine",
  },
} as const satisfies RulesSourceReference;

export const BRP_UGE_CORRECTIONS_VERSION = "1.05" as const;
