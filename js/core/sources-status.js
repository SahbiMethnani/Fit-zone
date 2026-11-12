import { $ } from "./dom.js";

const sourcesOk = new Set();

export function noterSource(nom) {
  sourcesOk.add(nom);
  $("sources-ok").textContent = [...sourcesOk].join(" · ");
}