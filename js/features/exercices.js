import { $, esc, nettoyer, tronquer, urlSure } from "../core/dom.js";
import { getJSON } from "../core/http.js";
import { noterSource } from "../core/sources-status.js";

let exercices = [];

export async function chargerExercices() {
  const cat = $("categorie").value;
  let url = "https://wger.de/api/v2/exerciseinfo/?language=2&limit=40";
  if (cat) url += "&category=" + cat;
  try {
    const data = await getJSON(url);
    exercices = data.results || [];
    if (!exercices.length) return false;
    noterSource("wger");
    afficherExercices();
    return true;
  } catch {
    return false;
  }
}

function afficherExercices() {
  const filtre = $("filtre").value.toLowerCase();
  const html = exercices
    .map((ex) => {
      const t = (ex.translations || []).find((x) => x.language === 2) || (ex.translations || [])[0];
      if (!t || !t.name) return "";
      if (filtre && !t.name.toLowerCase().includes(filtre)) return "";
      const img = urlSure(ex.images && ex.images[0] && ex.images[0].image);
      const muscles = (ex.muscles || []).map((m) => `<span class="tag">${esc(m.name_en || m.name)}</span>`).join("");
      return `
        <article class="card">
          ${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
          <div class="body">
            <h3>${esc(t.name)}</h3>
            <div>${muscles}</div>
            <p>${esc(tronquer(nettoyer(t.description)))}</p>
          </div>
        </article>`;
    })
    .join("");
  $("liste-exercices").innerHTML = html || '<p class="message">Aucun exercice trouvé.</p>';
}

export function initExercices() {
  $("categorie").addEventListener("change", chargerExercices);
  $("filtre").addEventListener("input", afficherExercices);
}