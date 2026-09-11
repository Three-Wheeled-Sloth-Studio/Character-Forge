import type { CharacterDocument } from "../../../packages/character-model/src/index.js";
import { quickGenerateDnd5eFirstSlice } from "../../../packages/system-dnd5e/src/index.js";

export function mountDndQuickCreatorPanel(
  root: HTMLElement,
  onCharacter: (character: CharacterDocument) => void,
): void {
  root.innerHTML = `
    <section class="creator-panel compact-creator dnd-quick-creator">
      <div class="creator-heading">
        <p class="eyebrow">D&D 5E 2024 · Quick Generate</p>
        <h2>Quick character</h2>
      </div>
      <form id="dnd-quick-form" class="creator-form">
        <label>Character name
          <input id="dnd-quick-name" type="text" maxlength="80" placeholder="Optional · generated if blank" />
        </label>
        <label>Generation seed
          <input id="dnd-quick-seed" type="text" maxlength="160" placeholder="Optional · generated if blank" autocomplete="off" />
        </label>
        <p id="dnd-quick-error" class="form-error" role="alert"></p>
        <button type="submit" class="primary-action">Generate character</button>
      </form>
    </section>`;

  const form = requiredElement(root, "#dnd-quick-form", HTMLFormElement);
  const nameInput = requiredElement(root, "#dnd-quick-name", HTMLInputElement);
  const seedInput = requiredElement(root, "#dnd-quick-seed", HTMLInputElement);
  const error = requiredElement(root, "#dnd-quick-error", HTMLElement);

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    error.textContent = "";
    try {
      onCharacter(quickGenerateDnd5eFirstSlice({
        name: nameInput.value,
        seed: seedInput.value,
      }));
    } catch (caught) {
      error.textContent = caught instanceof Error ? caught.message : "Quick character generation failed.";
    }
  });
}

function requiredElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const element = root.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Required D&D Quick creator element ${selector} was not found.`);
  return element;
}
