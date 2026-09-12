import type { JsonObject } from "../../character-model/src/index.js";
import {
  createGeneratedSeed,
  evaluateRandomTable,
  RANDOM_TABLE_EVALUATOR_VERSION,
  type RandomTable,
} from "../../generator-core/src/index.js";
import type { BrpFinishingFieldKey } from "./finishing.js";

export const BRP_FLAVOR_SUGGESTION_SOURCE = {
  id: "character-forge.brp.flavor-inspiration",
  version: "1",
} as const;
export const BRP_FLAVOR_SUGGESTION_TABLE_VERSION = "1" as const;

export interface BrpFlavorSuggestionResult extends JsonObject {
  fieldKey: BrpFinishingFieldKey;
  value: string;
}

export interface BrpFlavorSuggestionProvenance extends JsonObject {
  evaluatorVersion: typeof RANDOM_TABLE_EVALUATOR_VERSION;
  fieldKey: BrpFinishingFieldKey;
  tableId: string;
  tableVersion: typeof BRP_FLAVOR_SUGGESTION_TABLE_VERSION;
  sourceId: typeof BRP_FLAVOR_SUGGESTION_SOURCE.id;
  sourceVersion: typeof BRP_FLAVOR_SUGGESTION_SOURCE.version;
  seed: string;
  drawIndex: number;
  selectedEntryId: string;
}

export interface BrpFlavorSuggestion {
  result: BrpFlavorSuggestionResult;
  provenance: BrpFlavorSuggestionProvenance;
}

export interface BrpFlavorSuggestionOptions {
  seed?: string;
  drawIndex?: number;
}

function table(
  fieldKey: BrpFinishingFieldKey,
  entries: readonly { id: string; value: string }[],
): RandomTable<BrpFlavorSuggestionResult> {
  return {
    id: `brp-uge.${fieldKey}.inspiration`,
    version: BRP_FLAVOR_SUGGESTION_TABLE_VERSION,
    source: BRP_FLAVOR_SUGGESTION_SOURCE,
    entries: entries.map((entry) => ({
      id: `${fieldKey}:${entry.id}`,
      result: { fieldKey, value: entry.value },
    })),
  };
}

export const BRP_FLAVOR_SUGGESTION_TABLES: Record<BrpFinishingFieldKey, RandomTable<BrpFlavorSuggestionResult>> = {
  sizeDescription: table("sizeDescription", [
    { id: "compact", value: "Compact and wiry, with a low center of gravity." },
    { id: "broad", value: "Broad-shouldered and solidly built, with an unhurried stance." },
    { id: "lean", value: "Tall and lean, all long limbs and economical movement." },
    { id: "sturdy", value: "Shorter than average, sturdy, and stronger-looking than expected." },
    { id: "rangy", value: "Rangy and narrow-framed, with a slightly stooped posture." },
    { id: "average", value: "Average in height and build, easy to overlook in a crowd." },
  ]),
  appearance: table("appearance", [
    { id: "watchful", value: "Watchful eyes, practical clothes, and a habit of keeping every button fastened." },
    { id: "weathered", value: "A weathered face, wind-tossed hair, and clothing repaired more carefully than replaced." },
    { id: "precise", value: "Immaculate grooming, precise posture, and one conspicuously well-kept accessory." },
    { id: "scarred", value: "An old scar near one eyebrow, steady hands, and a direct, assessing gaze." },
    { id: "tired", value: "Permanent shadows beneath the eyes, rumpled clothes, and surprisingly polished shoes." },
    { id: "bright", value: "Bright, expressive eyes, an easy smile, and one piece of clothing chosen for flair rather than utility." },
    { id: "reserved", value: "Reserved expression, neatly trimmed hair, and understated clothing in muted tones." },
    { id: "restless", value: "Restless hands, unevenly cut hair, and clothes marked by frequent travel or hard use." },
    { id: "formal", value: "Formal bearing, carefully maintained clothes, and a small personal detail that quietly breaks the symmetry." },
    { id: "open", value: "Open expression, relaxed posture, and comfortable clothes chosen for movement rather than display." },
    { id: "angular", value: "Angular features, closely kept hair, and a coat or jacket that has clearly seen years of service." },
    { id: "distinctive", value: "A distinctive streak in the hair, alert eyes, and an otherwise deliberately ordinary presentation." },
  ]),
  mannerisms: table("mannerisms", [
    { id: "doorways", value: "Counts doorways under their breath when entering an unfamiliar place." },
    { id: "hands", value: "Folds their hands behind their back whenever they are thinking." },
    { id: "names", value: "Repeats a person's name once after being introduced, as if filing it away." },
    { id: "silence", value: "Lets silences stretch several seconds longer than most people find comfortable." },
    { id: "objects", value: "Straightens nearby objects while listening, usually without noticing." },
    { id: "motto", value: "Frequently says, 'We can know more than we know now.'" },
  ]),
  reputation: table("reputation", [
    { id: "reliable", value: "Known for keeping promises even when doing so becomes inconvenient." },
    { id: "difficult", value: "Respected for competence, but considered exhausting to argue with." },
    { id: "discreet", value: "People trust them with awkward facts because they rarely gossip." },
    { id: "lucky", value: "Has an undeserved reputation for being lucky at exactly the right moment." },
    { id: "stubborn", value: "Known for following a question long after sensible people would have dropped it." },
    { id: "generous", value: "Remembered as unexpectedly generous with time, introductions, and small favors." },
  ]),
  personalItem: table("personalItem", [
    { id: "compass", value: "A dented brass compass inherited from a relative who never explained where it came from." },
    { id: "postcard", value: "A postcard written years ago but never mailed." },
    { id: "key", value: "An old iron key that no longer opens anything they know of." },
    { id: "notebook", value: "A pocket notebook filled with addresses, quotations, and unexplained dates." },
    { id: "watch", value: "A stopped wristwatch kept for sentimental rather than practical reasons." },
    { id: "photograph", value: "A creased photograph with one person's face carefully folded out of sight." },
  ]),
  background: table("background", [
    { id: "port", value: "Raised in a busy port district, educated unevenly, and accustomed to meeting people from very different walks of life." },
    { id: "small-town", value: "Grew up in a small community where privacy was scarce and reputations lasted for generations." },
    { id: "institution", value: "Spent formative years inside a large institution and learned early how unofficial systems differ from written rules." },
    { id: "travel", value: "Moved frequently while young, leaving them comfortable arriving somewhere new and poor at putting down roots." },
    { id: "family-trade", value: "Expected to continue a family trade, learned it well, then deliberately chose another life." },
    { id: "late-start", value: "Came to their current path later than most after years spent doing respectable work they never particularly loved." },
  ]),
  beliefs: table("beliefs", [
    { id: "institutions", value: "Institutions should answer to the people affected by their decisions." },
    { id: "evidence", value: "A comforting explanation is less valuable than an uncomfortable fact." },
    { id: "loyalty", value: "Loyalty is earned through conduct, not titles, uniforms, or family names." },
    { id: "mercy", value: "Mercy matters most when there is a good reason not to offer it." },
    { id: "privacy", value: "Everyone is entitled to keep some part of themselves beyond public judgment." },
    { id: "duty", value: "Once you accept responsibility for something, inconvenience is no longer an excuse." },
  ]),
};

export function suggestBrpFinishingField(
  fieldKey: BrpFinishingFieldKey,
  options: BrpFlavorSuggestionOptions = {},
): BrpFlavorSuggestion {
  const tableDefinition = BRP_FLAVOR_SUGGESTION_TABLES[fieldKey];
  const seed = options.seed?.trim() || createGeneratedSeed(`brp-${fieldKey}`);
  const evaluation = evaluateRandomTable<BrpFlavorSuggestionResult>(tableDefinition, {
    seed,
    drawIndex: options.drawIndex ?? 0,
  });

  return {
    result: { ...evaluation.result },
    provenance: {
      evaluatorVersion: evaluation.provenance.evaluatorVersion,
      fieldKey,
      tableId: tableDefinition.id,
      tableVersion: BRP_FLAVOR_SUGGESTION_TABLE_VERSION,
      sourceId: BRP_FLAVOR_SUGGESTION_SOURCE.id,
      sourceVersion: BRP_FLAVOR_SUGGESTION_SOURCE.version,
      seed: evaluation.provenance.seed,
      drawIndex: evaluation.provenance.drawIndex,
      selectedEntryId: evaluation.provenance.selectedEntryId,
    },
  };
}
