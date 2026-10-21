const { chromium } = require("playwright");
const assert = require("node:assert/strict");
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1366, height: 900 } });
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  const screen = async (s) =>
    p.waitForFunction(
      (s) => document.querySelector("#app")?.dataset.screen === s,
      s,
    );
  await p.goto("http://localhost:3000/#joueurs");
  await screen("joueurs");
  const qs = await (
    await p.request.get("http://localhost:3000/data/questions.json")
  ).json();
  const state = () =>
    p.evaluate(() => JSON.parse(localStorage.getItem("salon-savoirs-v1")));
  await p.locator("#mode").selectOption("training");
  await p.locator("#setup-form button[type=submit]").click();
  await screen("plateau");
  for (const cat of [
    "geography",
    "entertainment",
    "history",
    "arts",
    "science",
    "sports",
  ]) {
    await p.locator("#training-category").selectOption(cat);
    await p.locator("[data-action=draw]").click();
    await screen("question");
    const s = await state(),
      q = qs.find((q) => q.id === s.active.id);
    await p.locator("[data-choice]").filter({ hasText: q.answer }).click();
    await screen("resultat");
    assert((await state()).active.newMedal);
    await p.locator("#continue").click();
    await screen("plateau");
  }
  assert.equal((await state()).players[0].medals.length, 6);
  await p.locator("#center").click();
  await screen("victoire");
  assert.equal((await state()).players[0].correct, 6);
  assert.equal((await state()).players[0].total, 6);
  // Contrôle des 27 nouvelles références avec la nouvelle interface.
  let template = await state();
  for (const q of qs.filter((q) => q.verifiedAt)) {
    const s = structuredClone(template);
    s.phase = "question";
    s.active = {
      id: q.id,
      cat: [
        "geography",
        "entertainment",
        "history",
        "arts",
        "science",
        "sports",
      ].indexOf(q.category),
      medal: false,
      final: false,
      choices: q.choices,
      deadline: 0,
    };
    await p.evaluate((s) => {
      localStorage.setItem("salon-savoirs-v1", JSON.stringify(s));
      location.hash = "question";
    }, s);
    await p.reload();
    await screen("question");
    await p.locator("[data-choice]").filter({ hasText: q.answer }).click();
    await screen("resultat");
    assert.equal(await p.locator(".checked-note").count(), 1);
    assert.equal(
      await p.locator(".source-line>a").getAttribute("href"),
      q.sourceUrl,
    );
  }
  // Reprise d'une ancienne sauvegarde dont la question a été retirée.
  template.phase = "question";
  template.active = {
    id: "oqdb-206-7",
    cat: 4,
    choices: ["a", "b", "c", "d"],
    deadline: 0,
  };
  await p.evaluate((s) => {
    localStorage.setItem("salon-savoirs-v1", JSON.stringify(s));
    location.hash = "plateau";
  }, template);
  await p.reload();
  await screen("plateau");
  assert.equal((await state()).phase, "roll");
  assert.equal((await state()).players[0].correct, 6);
  // Six joueurs ; affichage 320, 390, 768 et 1366 pixels.
  await p.evaluate(() => {
    localStorage.removeItem("salon-savoirs-v1");
    location.hash = "joueurs";
  });
  await p.reload();
  await screen("joueurs");
  await p.locator('[data-count="6"]').click();
  await p.locator("#setup-form button[type=submit]").click();
  await screen("plateau");
  assert.equal(await p.locator(".board-player").count(), 6);
  for (const width of [320, 390, 768, 1366]) {
    await p.setViewportSize({ width, height: 900 });
    assert.equal(
      await p.evaluate(() => document.documentElement.scrollWidth > innerWidth),
      false,
      "plateau6 " + width,
    );
  }
  // Un sous-répertoire de déploiement, sans routes serveur personnalisées.
  await p.route("**/salon/**", async (route) => {
    const url = route.request().url().replace("/salon/", "/");
    const response = await p.request.get(url);
    await route.fulfill({ response });
  });
  await p.goto("http://localhost:3000/salon/index.html#accueil");
  await screen("accueil");
  assert.equal(await p.locator(".hero-copy h1").count(), 1);
  await p.locator("[data-action=resume]").click();
  await screen("plateau");
  assert.deepEqual(errors, []);
  console.log(
    "PASS extra : six médaillons et victoire entraînement sans état injecté ; 27 références ; migration retrait ; six joueurs, 320/390/768/1366 px ; déploiement sous-dossier simulé.",
  );
  await b.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
