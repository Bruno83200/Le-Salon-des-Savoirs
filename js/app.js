import {
  CATEGORIES as cats,
  KEY,
  cellCategory,
  destinations,
  shuffle,
  freshGame,
  validSave,
} from "./engine.js";
const $ = (s) => document.querySelector(s),
  esc = (s) =>
    String(s ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
const app = $("#app"),
  colors = ["#ffc943", "#ff73af", "#49c5ff", "#75dc7f", "#bb91ff", "#ff9a57"];
const defaults = ["Camille", "Alex", "Charlie", "Lou", "Sacha", "Noa"];
let questions = [],
  state = null,
  route = "",
  timer = null,
  busy = false,
  notice = "",
  audio;
let prefs = read("salon-options-v05", { sound: false, motion: true }),
  history = read("salon-history-v05", []);
let draft = {
    count: 2,
    mode: "board",
    duration: 0,
    difficulty: "all",
    names: [...defaults],
    avatars: [0, 1, 2, 3, 4, 5],
  },
  scoreTab = "current";
function read(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function store(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    toast("Stockage local indisponible : gardez cet onglet ouvert.");
    return false;
  }
}
function persist() {
  if (state) {
    const saved = store(KEY, state);
    $("#save-status").textContent = saved
      ? "● Partie sauvegardée sur cet appareil"
      : "Sauvegarde indisponible sur cet appareil";
  }
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").classList.add("show");
  clearTimeout(toast.timeout);
  toast.timeout = setTimeout(() => $("#toast").classList.remove("show"), 4500);
}
function go(name) {
  if (location.hash === "#" + name) render();
  else location.hash = name;
}
// Les redirections remplacent l’URL pour ne pas piéger le bouton Retour.
function redirect(name) {
  window.history.replaceState(null, "", "#" + name);
  render();
}
function sound(ok = true) {
  if (!prefs.sound) return;
  try {
    audio ??= new (window.AudioContext || window.webkitAudioContext)();
    audio.resume();
    const o = audio.createOscillator(),
      g = audio.createGain();
    o.connect(g);
    g.connect(audio.destination);
    o.frequency.setValueAtTime(ok ? 523 : 220, audio.currentTime);
    o.frequency.setValueAtTime(ok ? 784 : 165, audio.currentTime + 0.12);
    g.gain.setValueAtTime(0.06, audio.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.35);
    o.start();
    o.stop(audio.currentTime + 0.4);
  } catch {}
}
function avatar(i = 0) {
  i = (((Number(i) || 0) % 6) + 6) % 6;
  const skin = [
      "#f7c88c",
      "#f6c8a9",
      "#d8a275",
      "#b97951",
      "#f8d7b0",
      "#cf9566",
    ][i],
    hair = ["#49302c", "#b84231", "#263746", "#242834", "#81512d", "#422d43"][
      i
    ];
  return `<svg class="avatar" viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="40" r="38" fill="${colors[i]}"/><path d="M13 80Q13 59 40 58Q67 59 67 80" fill="${["#4b6d9e", "#ec7e87", "#4e9fbd", "#668b65", "#8670aa", "#d0854e"][i]}"/><path d="M20 49Q12 10 40 10Q69 10 60 52L50 61H29Z" fill="${hair}"/><ellipse cx="40" cy="37" rx="19" ry="23" fill="${skin}"/><path d="M20 31Q19 10 40 11Q63 12 60 31Q48 28 46 21Q31 32 20 31" fill="${hair}"/><circle cx="33" cy="38" r="2.1" fill="#263147"/><circle cx="48" cy="38" r="2.1" fill="#263147"/><path d="M34 49Q40 54 47 48" fill="none" stroke="#8c4938" stroke-width="2" stroke-linecap="round"/>${i === 2 ? '<g fill="none" stroke="#263147" stroke-width="2"><rect x="25" y="32" width="13" height="12" rx="4"/><rect x="42" y="32" width="13" height="12" rx="4"/><path d="M38 36h4"/></g>' : ""}<path d="M35 62L40 69L45 62" fill="#fff" opacity=".7"/></svg>`;
}
function wedges(medals = [], large = false) {
  return `<span class="collection ${large ? "large" : ""}">${cats.map((c, i) => `<span class="mini-wedge ${medals.includes(i) ? "collected" : ""}" style="--c:${c.color}" title="${esc(c.name)} : ${medals.includes(i) ? "obtenu" : "à obtenir"}"><span class="sr-only">${esc(c.short)} ${medals.includes(i) ? "obtenu" : "à obtenir"}</span></span>`).join("")}</span>`;
}
function wheel(medals = [0, 1, 2, 3, 4, 5], className = "") {
  return `<svg class="medal-wheel ${className}" viewBox="0 0 200 200" aria-hidden="true"><circle cx="100" cy="100" r="96" fill="#08264f" stroke="#bfd6f1" stroke-width="2"/>${cats
    .map((c, i) => {
      let a = ((i * 60 - 90) * Math.PI) / 180,
        b = (((i + 1) * 60 - 90) * Math.PI) / 180;
      return `<path d="M100 100L${100 + 89 * Math.cos(a)} ${100 + 89 * Math.sin(a)}A89 89 0 0 1 ${100 + 89 * Math.cos(b)} ${100 + 89 * Math.sin(b)}Z" fill="${medals.includes(i) ? c.color : "#183e65"}" stroke="#08264f" stroke-width="5"/>`;
    })
    .join("")}<circle cx="100" cy="100" r="9" fill="#f5e1a6"/></svg>`;
}
function point(r, a) {
  a = (a * Math.PI) / 180;
  return [310 + r * Math.cos(a), 310 + r * Math.sin(a)];
}
function board(preview = false) {
  const p = state?.players[state.current],
    legal =
      !preview && state?.phase === "move" ? destinations(p.pos, state.die) : [];
  let cells = "";
  for (let i = 0; i < 36; i++) {
    const a = i * 10 - 95,
      b = a + 10,
      outer = 282,
      inner = 244,
      c = cellCategory(i),
      coords = [
        point(inner, a + 0.6),
        point(outer, a + 0.6),
        point(outer, b - 0.6),
        point(inner, b - 0.6),
      ],
      mid = point(263, i * 10 - 90),
      isMedal = i % 6 === 0;
    cells += `<g class="board-cell ${legal.includes(i) ? "reachable" : ""}" ${legal.includes(i) ? `role="button" tabindex="0" data-destination="${i}" aria-label="Case ${i + 1}, ${cats[c].name}${isMedal ? ", médaillon" : ""}"` : ""}><path d="M${coords.map((x) => x.join(" ")).join("L")}Z" fill="${cats[c].color}" stroke="#d5e5ef" stroke-width="1.5"/><text x="${mid[0]}" y="${mid[1] + 4}" text-anchor="middle" fill="${isMedal ? "#fff9ce" : "#07345c"}" font-size="${isMedal ? 18 : 10}" font-weight="800">${isMedal ? "◆" : i + 1}</text></g>`;
  }
  const spokes = cats
    .map((c, i) => {
      const [x, y] = point(190, i * 60 - 90),
        [x2, y2] = point(117, i * 60 - 90);
      return `<path d="M${x2} ${y2}L${x} ${y}" stroke="${c.color}" opacity=".55" stroke-width="3"/><circle cx="${x}" cy="${y}" r="23" fill="#103d70" stroke="${c.color}"/><text x="${x}" y="${y + 7}" text-anchor="middle" fill="${c.color}" font-size="23">${c.symbol}</text>`;
    })
    .join("");
  const tokens = preview
    ? ""
    : state.players
        .map((p, i) => {
          let [x, y] = point(262, p.pos * 10 - 90);
          let group = state.players.filter((j) => j.pos === p.pos),
            slot = group.indexOf(p);
          x += (slot - (group.length - 1) / 2) * 16;
          return `<g class="pawn ${i === state.current ? "active-pawn" : ""}" aria-label="${esc(p.name)}, case ${p.pos + 1}"><circle cx="${x}" cy="${y - 4}" r="15" fill="${colors[i]}" stroke="#fff" stroke-width="3"/><text x="${x}" y="${y + 1}" text-anchor="middle" fill="#07345c" font-size="13" font-weight="900">${i + 1}</text></g>`;
        })
        .join("");
  return `<svg class="game-board" viewBox="0 0 620 620" aria-label="Plateau circulaire de 36 cases. Les six cases losange rapportent un médaillon."><defs><radialGradient id="board-glow"><stop stop-color="#1364a2"/><stop offset="1" stop-color="#062957"/></radialGradient></defs><circle cx="310" cy="318" r="293" fill="#001c3d" opacity=".7"/><circle cx="310" cy="310" r="291" fill="url(#board-glow)" stroke="#f3cf7e" stroke-width="3"/><circle cx="310" cy="310" r="235" fill="none" stroke="#6189af" stroke-dasharray="2 8"/>${spokes}${cells}<circle cx="310" cy="310" r="104" fill="#092e59" stroke="#5d99cc" stroke-width="2"/><g transform="translate(247 220) scale(.63)">${cats
    .map((c, i) => {
      let a = ((i * 60 - 90) * Math.PI) / 180,
        b = (((i + 1) * 60 - 90) * Math.PI) / 180;
      return `<path d="M100 100L${100 + 83 * Math.cos(a)} ${100 + 83 * Math.sin(a)}A83 83 0 0 1 ${100 + 83 * Math.cos(b)} ${100 + 83 * Math.sin(b)}Z" fill="${c.color}" stroke="#08264f" stroke-width="5"/>`;
    })
    .join(
      "",
    )}</g><text x="310" y="363" fill="#fff6d6" font-family="Georgia,serif" font-style="italic" font-size="22" text-anchor="middle">Le Salon</text><text x="310" y="384" fill="#9ec8ef" font-size="10" letter-spacing="3" text-anchor="middle">DES SAVOIRS</text>${tokens}</svg>`;
}
function title(kicker, heading, sub = "") {
  return `<div class="page-title"><p class="eyebrow">${kicker}</p><h1>${heading}</h1>${sub ? `<p>${sub}</p>` : ""}</div>`;
}
function chips() {
  return `<div class="category-strip">${cats.map((c) => `<span><i style="--c:${c.color}">${c.symbol}</i>${c.short}</span>`).join("")}</div>`;
}
function home() {
  return `<section class="home screen"><div class="hero-copy"><div class="edition"><span></span> UNE SOIRÉE. SIX UNIVERS.</div><h1>Le Salon<br><em>des Savoirs</em><span class="logo-stars">◆ ◆ ◆ ◆ ◆ ◆</span></h1><p class="hero-tagline">Un peu de hasard.<br>Beaucoup de bonnes réponses.</p><p class="hero-description">Lancez le dé, explorez les six couleurs et remplissez votre collection. En solo ou autour de la même table.</p><div class="hero-actions"><button class="primary big" data-action="new">▶ &nbsp; ${state ? "Nouvelle partie" : "À vous de jouer"}</button>${state ? `<button class="secondary" data-action="resume">Reprendre ma partie →</button>` : ""}</div><div class="home-links"><a href="#regles"><span>▤</span>Les règles</a><a href="#scores"><span>♜</span>Les scores</a><a href="#options"><span>⚙</span>Les options</a></div></div><div class="hero-art" aria-hidden="true"><div class="orbit-label">LA CURIOSITÉ EST UN JEU.</div><div class="hero-board">${board(true)}</div><span class="floating-wedge wedge-one"></span><span class="floating-wedge wedge-two"></span><span class="floating-wedge wedge-three"></span><span class="hero-die">⚄</span><div class="hero-badge"><b>624</b><span>questions pour<br>se surprendre</span></div></div><div class="home-bottom"><div><span class="tiny-label">LE TOUR DE LA QUESTION</span><h2>À chacun sa couleur.</h2></div>${chips()}<div class="home-facts"><span>01–06 <small>joueurs locaux</small></span><span>100% <small>dans votre navigateur</small></span><span>∞ <small>raisons de rejouer</small></span></div><p class="home-signature">© Bruno CULOT (2026).</p></div></section>`;
}
function setup() {
  return `<section class="screen setup-screen">${title("FAITES UNE PLACE À LA CURIOSITÉ", "Qui entre dans la partie ?", "Choisissez vos joueurs. Un seul écran, toute la tablée.")}<form id="setup-form"><div class="setup-toolbar"><div><span class="field-label">Nombre de joueurs</span><div class="count-picker">${[1, 2, 3, 4, 5, 6].map((n) => `<button type="button" data-count="${n}" class="${draft.count === n ? "selected" : ""}" aria-pressed="${draft.count === n}" ${draft.mode === "training" && n !== 1 ? "disabled" : ""}>${n}</button>`).join("")}</div></div><span class="setup-hint">${draft.count === 1 ? "Le défi solo, à votre rythme." : "Une équipe de curieux, chacun son tour."}</span></div><div class="setup-grid"><div class="player-picker players-${draft.count}">${Array.from({ length: draft.count }, (_, i) => `<article class="player-card" style="--player:${colors[i]}"><span class="player-number">JOUEUR ${i + 1}</span><button class="avatar-picker" type="button" data-avatar="${i}" aria-label="Changer l’avatar du joueur ${i + 1}">${avatar(draft.avatars[i])}<span>↻</span></button><label><span class="sr-only">Prénom du joueur ${i + 1}</span><input name="player${i}" maxlength="24" required value="${esc(draft.names[i])}" autocomplete="off"></label><span class="mini-wedge collected" style="--c:${colors[i]}"></span><small>Cliquer sur l’avatar pour changer</small></article>`).join("")}</div><aside class="settings-panel glass"><p class="eyebrow">VOTRE FAÇON DE JOUER</p><label>Mode de jeu<select id="mode"><option value="board" ${draft.mode === "board" ? "selected" : ""}>Le plateau · solo ou entre amis</option><option value="training" ${draft.mode === "training" ? "selected" : ""}>Entraînement · solo, sans dé</option></select></label><label>Difficulté<select id="difficulty">${[
    ["all", "Tous les niveaux"],
    ["facile", "Facile · 42 par rubrique"],
    ["moyen", "Moyen · 42 par rubrique"],
    ["difficile", "Difficile · 20 par rubrique"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${draft.difficulty === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select></label><label>Temps par question<select id="duration">${[
    [0, "À votre rythme"],
    [20, "20 secondes"],
    [40, "40 secondes"],
  ]
    .map(
      ([v, t]) =>
        `<option value="${v}" ${draft.duration === v ? "selected" : ""}>${t}</option>`,
    )
    .join(
      "",
    )}</select></label><p class="muted">${draft.mode === "board" ? "Six médaillons à collectionner, puis une dernière question pour gagner." : "Chaque bonne réponse remplit votre collection. Pas de dé, pas d’adversaire."}</p></aside></div><div class="setup-bottom"><a class="back-link" href="#accueil">← Retour à l’accueil</a><button class="primary big" type="submit">▶ &nbsp; Lancer la partie</button><span>Tout est prêt ? À vous de jouer.</span></div></form></section>`;
}
function playerCard(p, i) {
  return `<div class="board-player ${i === state.current ? "is-turn" : ""}" style="--player:${colors[i]}">${avatar(p.avatar ?? i)}<div><b>${esc(p.name)}</b>${wedges(p.medals)}<small>${p.correct} bonne${p.correct > 1 ? "s" : ""} réponse${p.correct > 1 ? "s" : ""} · ${p.medals.length}/6</small></div>${i === state.current ? '<span class="turn-dot" title="À son tour"></span>' : ""}</div>`;
}
function die(value = 1) {
  const patterns = {
    1: [5],
    2: [1, 9],
    3: [1, 5, 9],
    4: [1, 3, 7, 9],
    5: [1, 3, 5, 7, 9],
    6: [1, 3, 4, 6, 7, 9],
  };
  return `<span class="die" aria-label="Dé : ${value}">${Array.from({ length: 9 }, (_, i) => `<i class="${patterns[value].includes(i + 1) ? "dot" : ""}"></i>`).join("")}</span>`;
}
function game() {
  const p = state.players[state.current],
    training = state.mode === "training",
    six = p.medals.length === 6;
  return `<section class="screen board-screen"><div class="board-heading"><div><p class="eyebrow">${training ? "ENTRAÎNEMENT SOLO" : "AUTOUR DE LA TABLE"} · TOUR ${state.turn}</p><h1>À vous, <em>${esc(p.name)}.</em></h1></div><a class="pill-link" href="#scores">♜ &nbsp; Voir les scores</a></div><div class="board-layout"><aside class="players-rail">${state.players.map(playerCard).join("")}<div class="collection-note"><span>◆</span><p>${training ? "Chaque bonne réponse rapporte le médaillon de sa rubrique." : "Visez les cases ◆ pour remporter un médaillon de leur couleur."}</p></div></aside><div class="board-stage">${board()}<span class="stage-caption">${training ? "SIX UNIVERS POUR S’ENTRAÎNER" : "36 CASES · DEUX SENS · SIX MÉDAILLONS"}</span></div><aside class="turn-panel glass"><p class="eyebrow">${state.phase === "move" ? "CHOISISSEZ VOTRE CHEMIN" : "LE HASARD FAIT BIEN LES CHOSES"}</p><div id="die-display">${die(state.die || 1)}</div><h2>${training ? "Un univers à explorer." : state.phase === "move" ? `Un ${state.die} ! Où allez-vous ?` : "On lance le dé ?"}</h2><p class="muted">${training ? "Choisissez une rubrique ou laissez le hasard décider." : state.phase === "move" ? "Deux destinations sont éclairées sur le plateau. À vous de choisir." : "Une bonne réponse : vous rejouez. Une erreur : la main passe."}</p>${
    training
      ? `<label>Votre rubrique<select id="training-category"><option value="all">Les six univers</option>${cats.map((c) => `<option value="${c.id}" ${state.trainingCategory === c.id ? "selected" : ""}>${c.name}</option>`).join("")}</select></label><button class="primary" data-action="draw">Piocher une question →</button>`
      : state.phase === "move"
        ? `<div class="destinations">${destinations(p.pos, state.die)
            .map(
              (i) =>
                `<button class="destination" data-destination="${i}" style="--c:${cats[cellCategory(i)].color}"><span>${cats[cellCategory(i)].symbol}</span><span>${cats[cellCategory(i)].short}<small>Case ${i + 1} ${i % 6 === 0 ? "· ◆ Médaillon" : ""}</small></span><b>→</b></button>`,
            )
            .join("")}</div>`
        : `<button class="primary" id="roll" data-action="roll">Lancer le dé &nbsp; ⚄</button>`
  }${six ? `<button class="final-button" id="center" data-action="final" ${state.phase !== "roll" ? "disabled" : ""}>✦ ${training ? "Terminer le défi" : "Jouer la grande finale"} →</button>` : ""}<div class="turn-summary">${wedges(p.medals)}<span><b>${p.medals.length}</b> / 6 couleurs réunies</span></div></aside></div><div class="board-bottom"><a class="back-link" href="#accueil">← Pause / accueil</a><span>La partie est sauvegardée automatiquement.</span><a href="#regles">Un doute sur les règles ?</a></div></section>`;
}
function currentQuestion() {
  return questions.find((q) => q.id === state?.active?.id);
}
function questionScreen() {
  const q = currentQuestion(),
    a = state.active,
    c = cats[a.cat],
    p = state.players[state.current];
  return `<section class="screen question-screen" style="--category:${c.color}"><div class="question-top"><span class="category-pill"><i>${c.symbol}</i>${c.name}</span><span>${esc(p.name)} · Question ${p.total + 1}</span><span class="timer" id="timer">${state.duration ? "…" : "À votre rythme"}</span></div><div class="question-context"><span>${a.final ? "✦ LA GRANDE FINALE" : a.medal ? "◆ POUR UN MÉDAILLON" : "✧ POUR LE PLAISIR DE SAVOIR"}</span><span>${q.difficulty} · ${esc(q.theme)}</span></div><div class="question-paper"><div class="question-illustration" aria-hidden="true"><div class="symbol-orbit">${c.symbol}</div><span>${c.short}</span></div><div><p class="eyebrow">À VOUS DE FAIRE LE BON CHOIX</p><h1 id="question-text">${esc(q.question)}</h1></div></div><div class="answers" id="answers">${a.choices.map((v, i) => `<button class="answer" data-choice="${i}"><span class="answer-letter">${"ABCD"[i]}</span><span>${esc(v)}</span><span class="answer-arrow">↗</span></button>`).join("")}</div><div class="question-bottom"><a class="back-link" href="#accueil">← Accueil / reprendre plus tard</a><span>Une seule bonne réponse. Faites confiance à votre curiosité.</span><button class="quiet-button" data-action="skip">Passer la question →</button></div></section>`;
}
function feedback() {
  const q = currentQuestion(),
    a = state.active,
    c = cats[a.cat];
  return `<section class="screen feedback-screen ${a.ok ? "success" : "failure"}"><div class="feedback-burst" aria-hidden="true"></div><div class="result-mark">${a.ok ? "✓" : "×"}</div><p class="eyebrow">${a.ok ? "BIEN VU, LES CURIEUX !" : a.selected === null ? "LE TEMPS OU L’ENVIE VOUS A MANQUÉ" : "ON EN APPREND TOUS LES JOURS"}</p><h1>${a.ok ? "Bonne réponse !" : "Ce n’était pas celle-ci…"}</h1><p class="result-sub">${a.ok ? (a.final ? "La victoire vous tend les bras." : a.newMedal ? "Une nouvelle couleur dans votre collection !" : "Votre curiosité vous fait rejouer.") : "La prochaine sera peut-être la bonne."}</p>${a.ok && a.newMedal ? `<div class="earned-piece" style="--c:${c.color}"><span class="mini-wedge collected"></span><small>+1 MÉDAILLON · ${c.short.toUpperCase()}</small></div>` : ""}<div class="explanation-card"><div class="explanation-symbol" style="--c:${c.color}">${c.symbol}</div><div><p class="eyebrow">LA BONNE RÉPONSE</p><h2>${esc(q.answer)}</h2><p>${esc(q.explanation)}</p></div></div><div class="result-choices">${a.choices.map((v, i) => `<span class="${v === q.answer ? "right" : v === a.selected ? "wrong" : ""}"><b>${"ABCD"[i]}</b>${esc(v)}${v === q.answer ? " ✓" : v === a.selected ? " ×" : ""}</span>`).join("")}</div><div class="source-line">${q.verifiedAt ? `<span class="checked-note">✓ Réponse et explication contrôlées · ${esc(q.verifiedAt)}</span>` : "<span>Question issue de l’archive · non vérifiée indépendamment</span>"}<a href="${esc(q.sourceUrl)}" target="_blank" rel="noopener noreferrer">${q.verifiedAt ? "Référence de vérification" : "Source archivée"} ↗</a><small>${esc(q.author)} · <a href="${esc(q.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(q.license)}</a></small></div><div class="feedback-actions"><button class="quiet-button" data-action="flag">⚑ Signaler cette question</button><button class="primary big" id="continue" data-action="continue">${a.ok && a.final ? "Voir le podium" : "Continuer"} &nbsp; →</button><span>${a.ok || state.mode === "training" ? "À vous de rejouer." : `Au tour de ${esc(state.players[(state.current + 1) % state.players.length].name)}.`}</span></div></section>`;
}
function scores() {
  const players = state?.players ?? [];
  return `<section class="screen scores-screen">${title("CHAQUE BONNE RÉPONSE COMPTE", "La collection des curieux.", "Des couleurs, des découvertes et un petit esprit de compétition.")}<div class="tab-bar"><button data-tab="current" class="${scoreTab === "current" ? "active" : ""}">Partie en cours</button><button data-tab="history" class="${scoreTab === "history" ? "active" : ""}">Parties terminées <span>${history.length}</span></button></div>${scoreTab === "history" ? `<div class="history-list">${history.length ? history.map((h) => `<article class="glass history-card"><span>♛</span><div><h2>${esc(h.winner)}</h2><p>${esc(new Date(h.date).toLocaleDateString("fr-FR"))} · ${h.mode === "training" ? "Entraînement" : "Plateau"} · ${h.players.length} joueur${h.players.length > 1 ? "s" : ""}</p></div><b>${h.correct} bonnes réponses</b></article>`).join("") : '<div class="empty-state"><span>♜</span><h2>Le palmarès reste à écrire.</h2><p>Votre première partie terminée apparaîtra ici.</p></div>'}</div>` : players.length ? `<div class="scores-grid">${players.map((p, i) => `<article class="score-card glass" style="--player:${colors[i]}"><div class="score-person">${avatar(p.avatar ?? i)}<div><span class="eyebrow">JOUEUR ${i + 1}</span><h2>${esc(p.name)}</h2></div><b>${p.medals.length}<small>/ 6</small></b></div><div class="score-content">${wheel(p.medals)}<div class="score-bars">${cats.map((c, i) => `<div><span style="color:${c.color}">${c.symbol}</span><span>${c.short}</span><i><b style="background:${c.color};width:${p.medals.includes(i) ? 100 : 0}%"></b></i><strong>${p.medals.includes(i) ? "✓" : "—"}</strong></div>`).join("")}</div></div><div class="score-stats"><span><b>${p.correct}</b> bonnes réponses</span><span><b>${p.total ? Math.round((p.correct / p.total) * 100) : 0}%</b> de réussite</span><span><b>${p.total}</b> questions jouées</span></div></article>`).join("")}</div>` : '<div class="empty-state"><span>♜</span><h2>La table est encore vide.</h2><p>Lancez une partie pour voir vos premières couleurs.</p><button class="primary" data-action="new">Commencer une partie →</button></div>'}<div class="page-bottom"><a class="back-link" href="${state ? "#plateau" : "#accueil"}">← ${state ? "Retour à la partie" : "Retour à l’accueil"}</a>${state?.phase === "won" ? '<a class="pill-link" href="#victoire">Voir le podium →</a>' : ""}</div></section>`;
}
function victory() {
  const winner = state.players[state.current],
    rank = [...state.players]
      .map((p, i) => ({ ...p, index: i }))
      .sort((a, b) =>
        a.index === state.current
          ? -1
          : b.index === state.current
            ? 1
            : b.medals.length - a.medals.length || b.correct - a.correct,
      );
  return `<section class="screen victory-screen"><div class="confetti" aria-hidden="true">${Array.from({ length: 35 }, (_, i) => `<i style="--x:${(i * 37) % 100}%;--y:${(i * 23) % 95}%;--c:${colors[i % 6]};--r:${i * 41}deg"></i>`).join("")}</div>${title("LE SALON VOUS APPLAUDIT", "La curiosité a gagné !", `Bravo, ${esc(winner.name)}. Six couleurs réunies${state.mode === "training" ? "" : " et une finale réussie"}.`)}<div class="winner-crown">♛</div><div class="podium">${rank
    .slice(0, 3)
    .map(
      (p, i) =>
        `<div class="podium-person place-${i + 1}" style="--player:${colors[p.index]}">${avatar(p.avatar ?? p.index)}<h2>${esc(p.name)}</h2><p>${p.medals.length}/6 couleurs · ${p.correct} bonnes réponses</p><div class="podium-step">${i + 1}</div></div>`,
    )
    .join("")}</div>${
    rank.length > 3
      ? `<p class="other-players">${rank
          .slice(3)
          .map((p, i) => `${i + 4}. ${esc(p.name)} · ${p.medals.length}/6`)
          .join(" &nbsp; / &nbsp; ")}</p>`
      : ""
  }<div class="victory-actions"><a class="secondary" href="#scores">Voir tous les scores</a><button class="primary big" data-action="new">↻ &nbsp; On remet ça ?</button><a class="back-link" href="#accueil">Retour au menu</a></div></section>`;
}
function rules() {
  return `<section class="screen rules-screen">${title("LE GUIDE DU SALON", "Six couleurs. Une belle soirée.", "Deux minutes de lecture, et le plaisir de jouer.")}<div class="rules-layout"><div class="rules-list">${[
    [
      "01",
      "Lancez, puis choisissez.",
      "Sur le plateau circulaire, le dé détermine deux destinations : dans un sens ou dans l’autre. Cliquez sur une case éclairée ou sur le bouton de la rubrique proposée.",
    ],
    [
      "02",
      "Faites le bon choix.",
      "Quatre propositions, une seule bonne réponse. Si vous répondez juste, vous rejouez. Sinon, la main passe au joueur suivant. En solo, vous poursuivez simplement votre défi.",
    ],
    [
      "03",
      "Réunissez les six couleurs.",
      "Une bonne réponse sur une case ◆ vous offre le médaillon de sa rubrique. Les autres cases améliorent votre score et vous permettent de rejouer, mais ne donnent pas de médaillon. Chaque couleur ne se gagne qu’une fois.",
    ],
    [
      "04",
      "Ouvrez la grande finale.",
      "Avec les six médaillons, le bouton « Jouer la grande finale » se débloque avant de lancer le dé. Une question dans une rubrique aléatoire vous sépare de la victoire. Une erreur ? Réessayez à votre prochain tour. Le centre n’est pas une destination de déplacement dans cette version simplifiée.",
    ],
  ]
    .map(
      ([n, h, t]) =>
        `<article><span>${n}</span><div><h2>${h}</h2><p>${t}</p></div></article>`,
    )
    .join(
      "",
    )}</div><aside class="rules-aside glass">${wheel()}<h2>À chacun son univers.</h2>${chips()}<div class="rule-tip"><b>Et en entraînement ?</b><p>Solo, sans dé. Choisissez une rubrique ; chaque bonne réponse remplit votre collection. Avec les six couleurs, vous pouvez terminer le défi, ou continuer à apprendre.</p></div></aside></div><div class="rules-notes"><p><b>Le temps, c’est vous qui choisissez.</b> Sans chrono, 20 ou 40 secondes. Le temps continue si vous consultez un autre écran, fermez l’onglet ou rechargez la page.</p><p><b>Une question déjà vue ?</b> Les questions ne se répètent pas dans leur rubrique et leur niveau avant épuisement du paquet. Le paquet est alors remélangé.</p><p><b>Clavier et sauvegarde.</b> Tout se joue avec Tab et Entrée. La partie reste dans ce navigateur : aucun compte, aucune transmission de vos prénoms ou scores.</p></div><div class="page-bottom"><a class="back-link" href="${state ? "#plateau" : "#accueil"}">← ${state ? "Retour à la partie" : "Retour à l’accueil"}</a><button class="primary" data-action="new">J’ai compris, jouons →</button></div></section>`;
}
function options() {
  return `<section class="screen narrow-screen">${title("LES PETITS RÉGLAGES", "Le salon, à votre goût.")}<div class="glass options-card"><div><span><b>Petits sons de jeu</b><small>Un signal pour les bonnes réponses et le dé.</small></span><button class="switch ${prefs.sound ? "on" : ""}" role="switch" aria-checked="${prefs.sound}" aria-label="Sons de jeu" data-action="sound"><i></i></button></div><div><span><b>Animations</b><small>Dé animé et transitions entre les écrans.</small></span><button class="switch ${prefs.motion ? "on" : ""}" role="switch" aria-checked="${prefs.motion}" aria-label="Animations" data-action="motion"><i></i></button></div><p class="muted">Le mode, le niveau et le chronomètre se choisissent avant de lancer une nouvelle partie. Ces préférences sont mémorisées sur cet appareil.</p></div><div class="page-bottom"><a class="back-link" href="${state ? "#plateau" : "#accueil"}">← Retour ${state ? "à la partie" : "à l’accueil"}</a></div></section>`;
}
function credits() {
  return `<section class="screen narrow-screen">${title("EN TOUTE TRANSPARENCE", "Les coulisses du Salon.")}<div class="glass credits-card"><h2>Un jeu original, une nouvelle interface.</h2><p>Version 0.5 · HTML, CSS et JavaScript. Graphismes vectoriels originaux et sons Web Audio locaux. Inspiré de l’ambiance des jeux de culture générale, sans affiliation avec Hasbro ou Trivial Pursuit. Aucun élément graphique de la maquette n’a été découpé ou reproduit.</p><h2>624 questions · six rubriques</h2><p>104 questions par rubrique : 42 faciles, 42 moyennes et 20 difficiles. Les niveaux sont hérités ou attribués éditorialement, sans étalonnage statistique.</p><p><b>27 QCM</b> rédigés pour le projet avec réponse et explication contrôlées contre une référence indiquée le 20 octobre 2026. Références : France Diplomatie, UNESCO, ONU, NASA, BIPM, musée d’Orsay, Academy, CNOSF et CIO. Le journal documente également une limite d’accès au palmarès des Oscars.</p><p><b>597 QCM hérités</b> d’une archive ancienne, avec contrôles de structure et sélection éditoriale, mais sans vérification factuelle indépendante exhaustive. Une erreur reste possible. Trois anciennes questions ont été retirées faute d’appui suffisamment précis.</p><p>Archive : <a href="https://www.openquizzdb.org/" target="_blank" rel="noopener">OpenQuizzDB — Fourni par Openquizzdb.org</a>. Auteurs : Philippe Bresoux, Catherine De Smeytere et Edouard Swit. Copie de Zeuh, commit figé du 12 février 2022. Corpus adapté et nouvelles formulations sous <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener">CC BY-SA 4.0</a>. Les organismes de référence ne sont pas les auteurs de nos nouvelles formulations.</p><div class="doc-links"><a href="./CREDITS.md" target="_blank" rel="noopener">Crédits détaillés ↗</a><a href="./docs/VERIFICATION-v0.4.md" target="_blank" rel="noopener">Journal de vérification ↗</a><a href="./docs/QUALITE-DONNEES.md" target="_blank" rel="noopener">Bilan qualité ↗</a></div><h2>Votre partie vous appartient.</h2><p>Prénoms, scores, préférences et signalements restent dans votre navigateur. Aucun compte, publicité, analyse d’audience ou envoi automatique. L’historique conserve au maximum les 30 dernières parties terminées.</p><button class="secondary" data-action="export">Exporter mes questions signalées (JSON)</button></div><div class="page-bottom"><a class="back-link" href="#accueil">← Retour à l’accueil</a></div></section>`;
}
function render() {
  clearInterval(timer);
  try {
    route = decodeURIComponent(location.hash.slice(1) || "accueil");
  } catch {
    redirect("accueil");
    return;
  }
  if (
    ["plateau", "question", "resultat", "victoire"].includes(route) &&
    !state
  ) {
    redirect("accueil");
    return;
  }
  if (state) {
    if (route === "question" && state.phase !== "question") {
      redirect(state.phase === "feedback" ? "resultat" : "plateau");
      return;
    }
    if (route === "resultat" && state.phase !== "feedback") {
      redirect(state.phase === "question" ? "question" : "plateau");
      return;
    }
    if (route === "victoire" && state.phase !== "won") {
      redirect("plateau");
      return;
    }
    if (
      route === "plateau" &&
      ["question", "feedback", "won"].includes(state.phase)
    ) {
      redirect(
        state.phase === "question"
          ? "question"
          : state.phase === "feedback"
            ? "resultat"
            : "victoire",
      );
      return;
    }
  }
  const pages = {
    accueil: home,
    joueurs: setup,
    plateau: game,
    question: questionScreen,
    resultat: feedback,
    scores,
    regles: rules,
    options,
    credits,
    victoire: victory,
  };
  if (!Object.hasOwn(pages, route)) {
    redirect("accueil");
    return;
  }
  document.body.classList.toggle("no-motion", !prefs.motion);
  app.innerHTML = pages[route]();
  app.dataset.screen = route;
  app.classList.remove("enter");
  void app.offsetWidth;
  app.classList.add("enter");
  $("#nav-game").hidden = !state;
  document.querySelectorAll("[data-nav]").forEach((el) => {
    const active =
      el.dataset.nav === route ||
      (el.dataset.nav === "plateau" &&
        ["question", "resultat", "victoire"].includes(route));
    if (active) el.setAttribute("aria-current", "page");
    else el.removeAttribute("aria-current");
  });
  document.title =
    ({
      accueil: "Le savoir se partage",
      joueurs: "Choix des joueurs",
      plateau: "Le plateau",
      question: "À vous de répondre",
      resultat: "La réponse",
      scores: "Les scores",
      regles: "Les règles",
      victoire: "Bravo !",
      options: "Options",
      credits: "Crédits",
    }[route] || "") + " · Le Salon des Savoirs";
  window.scrollTo(0, 0);
  app.focus({ preventScroll: true });
  if (state?.phase === "question") {
    tick();
    timer = setInterval(tick, 200);
  }
  if (notice) {
    toast(notice);
    notice = "";
  }
}
function syncDraft() {
  document
    .querySelectorAll('[name^="player"]')
    .forEach((el, i) => (draft.names[i] = el.value));
  for (const id of ["mode", "difficulty", "duration"])
    if ($("#" + id))
      draft[id] =
        id === "duration" ? Number($("#" + id).value) : $("#" + id).value;
}
async function newGame() {
  if (state && state.phase !== "won") {
    const dialog = $("#confirm-dialog");
    dialog.showModal();
    const value = await new Promise((resolve) =>
      dialog.addEventListener("close", () => resolve(dialog.returnValue), {
        once: true,
      }),
    );
    if (value !== "replace") return;
  }
  go("joueurs");
}
function startGame() {
  syncDraft();
  const names = draft.names
    .slice(0, draft.count)
    .map((n, i) => n.trim() || defaults[i]);
  state = freshGame(names, draft.mode, draft.duration, draft.difficulty);
  state.id =
    Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 7);
  state.players.forEach((p, i) => (p.avatar = draft.avatars[i]));
  state.corpus = "salon-624-v04";
  persist();
  go("plateau");
}
function ask(cat, medal = false, final = false) {
  let eligible = questions.filter(
    (q) =>
      q.category === cats[cat].id &&
      (state.difficulty === "all" ||
        !state.difficulty ||
        q.difficulty === state.difficulty),
  );
  let pool = eligible.filter((q) => !state.used.includes(q.id));
  if (!pool.length) {
    let ids = new Set(eligible.map((q) => q.id));
    state.used = state.used.filter((id) => !ids.has(id));
    pool = eligible;
    notice = "Vous avez vu tout ce paquet : il a été remélangé.";
  }
  if (!pool.length) {
    toast("Aucune question disponible pour ce choix.");
    return;
  }
  const q = pool[Math.floor(Math.random() * pool.length)];
  state.used.push(q.id);
  state.active = {
    id: q.id,
    cat,
    medal,
    final,
    choices: shuffle(q.choices),
    deadline: state.duration ? Date.now() + state.duration * 1000 : 0,
  };
  state.phase = "question";
  persist();
  go("question");
}
function tick() {
  if (state?.phase !== "question" || !state.active.deadline) return;
  const left = Math.max(
    0,
    Math.ceil((state.active.deadline - Date.now()) / 1000),
  );
  if ($("#timer")) {
    $("#timer").textContent = left + " s";
    $("#timer").classList.toggle("urgent", left <= 5);
  }
  if (!left) answer(null);
}
function answer(choice) {
  if (state?.phase !== "question") return;
  if (state.active.deadline && Date.now() >= state.active.deadline)
    choice = null;
  clearInterval(timer);
  let a = state.active,
    q = currentQuestion(),
    p = state.players[state.current];
  a.selected = choice;
  a.ok = choice === q.answer;
  p.total++;
  if (a.ok) {
    p.correct++;
    if ((a.medal || state.mode === "training") && !p.medals.includes(a.cat)) {
      p.medals.push(a.cat);
      a.newMedal = true;
    }
  }
  state.phase = "feedback";
  sound(a.ok);
  persist();
  go("resultat");
}
function recordWin() {
  state.phase = "won";
  state.id ??= Date.now().toString(36);
  if (!history.some((h) => h.id === state.id)) {
    let p = state.players[state.current];
    history.unshift({
      id: state.id,
      date: new Date().toISOString(),
      winner: p.name,
      correct: p.correct,
      mode: state.mode,
      players: state.players.map((p) => ({ ...p })),
    });
    history = history.slice(0, 30);
    store("salon-history-v05", history);
  }
  persist();
  go("victoire");
}
function next() {
  if (state?.phase !== "feedback") return;
  const a = state.active;
  if (a.ok && a.final) {
    state.active = null;
    recordWin();
    return;
  }
  if (!a.ok && state.mode !== "training") {
    state.current = (state.current + 1) % state.players.length;
    state.turn++;
  }
  state.active = null;
  state.die = 0;
  state.phase = "roll";
  persist();
  go("plateau");
}
async function roll() {
  if (state?.phase !== "roll" || busy) return;
  busy = true;
  const button = $("#roll"),
    display = $("#die-display");
  button.disabled = true;
  display.classList.add("rolling");
  const rollingState = state,
    result = 1 + Math.floor(Math.random() * 6);
  if (prefs.motion) {
    let frame = 0;
    await new Promise((resolve) => {
      const id = setInterval(() => {
        display.innerHTML = die((frame++ % 6) + 1);
        if (frame === 9) {
          clearInterval(id);
          resolve();
        }
      }, 65);
    });
  }
  if (state !== rollingState) {
    busy = false;
    return;
  }
  state.die = result;
  state.phase = "move";
  busy = false;
  sound();
  persist();
  if (route === "plateau") render();
}
function move(i) {
  if (
    state?.phase !== "move" ||
    !destinations(state.players[state.current].pos, state.die).includes(i)
  )
    return;
  state.players[state.current].pos = i;
  ask(cellCategory(i), i % 6 === 0);
}
function downloadFlags() {
  const data = read("salon-flags-v1", []),
    blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    }),
    url = URL.createObjectURL(blob),
    a = document.createElement("a");
  a.href = url;
  a.download = "questions-signalees-salon.json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(`${data.length} signalement(s) exporté(s).`);
}
const actions = {
  new: newGame,
  resume: () => go("plateau"),
  options: () => go("options"),
  roll,
  draw: () => {
    if (state?.phase === "roll")
      ask(
        state.trainingCategory === "all"
          ? Math.floor(Math.random() * 6)
          : cats.findIndex((c) => c.id === state.trainingCategory),
      );
  },
  continue: next,
  skip: () => answer(null),
  final: () => {
    if (
      state?.phase === "roll" &&
      state.players[state.current].medals.length === 6
    ) {
      if (state.mode === "training") recordWin();
      else ask(Math.floor(Math.random() * 6), false, true);
    }
  },
  sound: () => {
    prefs.sound = !prefs.sound;
    store("salon-options-v05", prefs);
    sound();
    render();
  },
  motion: () => {
    prefs.motion = !prefs.motion;
    store("salon-options-v05", prefs);
    render();
  },
  flag: () => {
    if (!state?.active) return;
    const q = currentQuestion(),
      flags = read("salon-flags-v1", []);
    if (flags.some((f) => f.id === q.id)) {
      toast("Cette question figure déjà dans vos signalements.");
      return;
    }
    flags.push({
      id: q.id,
      question: q.question,
      answer: q.answer,
      source: q.source,
      sourceUrl: q.sourceUrl,
      flaggedAt: new Date().toISOString(),
    });
    store("salon-flags-v1", flags);
    toast("Question marquée. Export disponible dans les crédits.");
  },
  export: downloadFlags,
};
document.addEventListener("click", (e) => {
  const b = e.target.closest(
    "[data-action],[data-count],[data-avatar],[data-destination],[data-choice],[data-tab]",
  );
  if (!b || b.disabled) return;
  if (b.dataset.action) {
    actions[b.dataset.action]?.();
    return;
  }
  if (b.dataset.count) {
    syncDraft();
    draft.count = Number(b.dataset.count);
    render();
  } else if (b.dataset.avatar !== undefined) {
    syncDraft();
    const i = Number(b.dataset.avatar);
    draft.avatars[i] = (draft.avatars[i] + 1) % 6;
    render();
  } else if (b.dataset.destination !== undefined)
    move(Number(b.dataset.destination));
  else if (b.dataset.choice !== undefined)
    answer(state.active.choices[Number(b.dataset.choice)]);
  else if (b.dataset.tab) {
    scoreTab = b.dataset.tab;
    render();
  }
});
document.addEventListener("keydown", (e) => {
  const target = e.target.closest("g[data-destination]");
  if (target && ["Enter", " "].includes(e.key)) {
    e.preventDefault();
    move(Number(target.dataset.destination));
  }
});
document.addEventListener("change", (e) => {
  if (["mode", "difficulty", "duration"].includes(e.target.id)) {
    syncDraft();
    if (draft.mode === "training") draft.count = 1;
    render();
  }
  if (e.target.id === "training-category") {
    state.trainingCategory = e.target.value;
    persist();
  }
});
document.addEventListener("submit", (e) => {
  if (e.target.id === "setup-form") {
    e.preventDefault();
    startGame();
  }
});
window.addEventListener("hashchange", () => {
  if (questions.length) render();
});
async function init() {
  try {
    const response = await fetch("./data/questions.json");
    if (!response.ok) throw Error("HTTP " + response.status);
    questions = await response.json();
    const saved = read(KEY, null);
    if (validSave(saved)) {
      state = saved;
      state.difficulty ??= "all";
      state.id ??= Date.now().toString(36);
      if (state.active && !questions.some((q) => q.id === state.active.id)) {
        state.active = null;
        state.phase = "roll";
        state.die = 0;
        notice =
          "La question en cours a été retirée du corpus. Votre progression est conservée.";
        persist();
      }
      if (state.phase === "feedback" && typeof state.active?.ok !== "boolean") {
        state.active = null;
        state.phase = "roll";
        persist();
      }
    }
    render();
  } catch (error) {
    app.innerHTML = `<section class="empty-state"><h1>Le salon n’a pas pu s’ouvrir.</h1><p>Les questions doivent être chargées depuis un serveur web. Sous Windows, lancez DEMARRER-WINDOWS.bat, puis ouvrez http://localhost:3000.</p><button class="primary" onclick="location.reload()">Réessayer</button></section>`;
    console.error(error);
  }
}
init();
