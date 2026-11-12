import { $, esc, nettoyer, tronquer, urlSure } from "../core/dom.js";
import { noterSource } from "../core/sources-status.js";
import { SOURCES } from "./actus-sources.js";

export async function chargerActus(cle) {
  const essais = await Promise.allSettled(
    SOURCES[cle].map(async (s) => (await s.get()).map((i) => ({ ...i, source: s.nom })))
  );
  let items = [];
  const ok = [];
  essais.forEach((r, idx) => {
    if (r.status === "fulfilled" && r.value.length) {
      items = items.concat(r.value);
      ok.push(SOURCES[cle][idx].nom);
      noterSource(SOURCES[cle][idx].nom);
    }
  });
  if (!items.length) return false;
  items.sort((a, b) => b.date - a.date);
  afficherActus(cle, items, ok, "tous");
  return true;
}

function afficherActus(cle, items, ok, filtre) {
  $("chips-" + cle).innerHTML = ["tous", ...ok]
    .map((n) => `<button class="chip ${n === filtre ? "active" : ""}" data-s="${esc(n)}">${n === "tous" ? "Toutes les sources" : esc(n)}</button>`)
    .join("");
  $("chips-" + cle).querySelectorAll(".chip").forEach((b) => {
    b.onclick = () => afficherActus(cle, items, ok, b.dataset.s);
  });
  $("liste-" + cle).innerHTML = items
    .filter((i) => filtre === "tous" || i.source === filtre)
    .map((i) => {
      const img = urlSure(i.image);
      const lien = urlSure(i.lien);
      return `
        <article class="card">
          ${img ? `<img src="${esc(img)}" alt="" loading="lazy" onerror="this.remove()">` : ""}
          <div class="body">
            <h3>${esc(nettoyer(i.titre))}</h3>
            <p>${esc(tronquer(nettoyer(i.resume), 130))}</p>
            <p class="src">${esc(i.source)} ${i.date ? "· " + new Date(i.date).toLocaleDateString("fr-FR") : ""} ${esc(i.extra)}</p>
            ${lien ? `<a href="${esc(lien)}" target="_blank" rel="noopener">Lire →</a>` : ""}
          </div>
        </article>`;
    })
    .join("");
}