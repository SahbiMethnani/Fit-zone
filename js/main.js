import { $ } from "./core/dom.js";
import { activerOnglet } from "./core/tabs.js";
import { chargerExercices, initExercices } from "./features/exercices.js";
import { chargerActus } from "./features/actus.js";
import { chargerFighters, initFighters } from "./features/fighters.js";

initExercices();
initFighters();

const sections = [
  ["exercices", chargerExercices],
  ["muscu", () => chargerActus("muscu")],
  ["mma", () => chargerActus("mma")],
  ["fighters", chargerFighters],
];

Promise.all(
  sections.map(async ([nom, charger]) => {
    let ok = false;
    try { ok = await charger(); } catch { ok = false; }
    if (ok) activerOnglet(nom);
    return ok;
  })
).then((res) => {
  if (!res.some(Boolean)) {
    $("etat").textContent =
      "Aucune source n'est accessible pour le moment. Vérifie ta connexion ou lance le site via un serveur local.";
  }
});