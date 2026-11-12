import { $, esc, tronquer, urlSure } from "../core/dom.js";
import { getJSON } from "../core/http.js";
import { noterSource } from "../core/sources-status.js";

const FIGHTERS_DEFAUT = ["Conor McGregor", "Jon Jones", "Islam Makhachev", "Khabib Nurmagomedov", "Francis Ngannou", "Alex Pereira"];

async function viaSportsDB(nom, max) {
  const d = await getJSON("https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=" + encodeURIComponent(nom));
  noterSource("TheSportsDB");
  return (d.player || [])
    .filter((p) => p.strSport === "Fighting")
    .slice(0, max)
    .map((p) => ({
      nom: p.strPlayer,
      image: p.strCutout || p.strThumb || "",
      tags: [p.strNationality, p.strHeight, p.strWeight].filter(Boolean),
      sous: [p.dateBorn && "Né le " + p.dateBorn, p.strBirthLocation].filter(Boolean).join(" · "),
      desc: p.strDescriptionEN || "",
      source: "TheSportsDB",
    }));
}

async function viaWikipedia(nom, max) {
  const url =
    "https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&generator=search" +
    `&gsrsearch=${encodeURIComponent(nom + " mixed martial artist")}&gsrlimit=${max}` +
    "&prop=extracts|pageimages&exintro=1&explaintext=1&exchars=400&piprop=thumbnail&pithumbsize=400";
  const d = await getJSON(url);
  noterSource("Wikipedia");
  return Object.values((d.query && d.query.pages) || {})
    .sort((a, b) => a.index - b.index)
    .filter((p) => /mixed martial|fighter|kickbox|boxer|wrestler/i.test(p.extract || ""))
    .map((p) => ({
      nom: p.title,
      image: (p.thumbnail && p.thumbnail.source) || "",
      tags: [],
      sous: "",
      desc: p.extract,
      source: "Wikipedia",
    }));
}

async function trouverFighters(noms, max) {
  const essais = await Promise.allSettled(
    noms.flatMap((n) => [viaSportsDB(n, max), viaWikipedia(n, max)])
  );
  const tous = essais.filter((r) => r.status === "fulfilled").flatMap((r) => r.value);
  const vus = new Map();
  tous.forEach((f) => {
    const k = f.nom.toLowerCase();
    if (!vus.has(k)) vus.set(k, f);
  });
  return [...vus.values()];
}

function afficherFighters(liste) {
  $("liste-fighters").innerHTML = liste.length
    ? liste
        .map(
          (f) => `
        <article class="card">
          ${urlSure(f.image) ? `<img src="${esc(f.image)}" alt="${esc(f.nom)}" loading="lazy" onerror="this.remove()">` : ""}
          <div class="body">
            <h3>${esc(f.nom)}</h3>
            <div>${f.tags.map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
            ${f.sous ? `<p>${esc(f.sous)}</p>` : ""}
            <p>${esc(tronquer(f.desc || "Pas de description.", 240))}</p>
            <p class="src">${esc(f.source)}</p>
          </div>
        </article>`
        )
        .join("")
    : '<p class="message">Aucun combattant trouvé.</p>';
}

export async function chargerFighters() {
  const liste = await trouverFighters(FIGHTERS_DEFAUT, 1);
  if (!liste.length) return false;
  afficherFighters(liste);
  return true;
}

export function initFighters() {
  $("form-fighter").addEventListener("submit", async (e) => {
    e.preventDefault();
    const nom = $("nom-fighter").value.trim();
    if (!nom) return chargerFighters();
    $("liste-fighters").innerHTML = '<p class="message">Recherche en cours…</p>';
    afficherFighters(await trouverFighters([nom], 5));
  });
}