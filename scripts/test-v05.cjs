const { chromium } = require("playwright");
const path = require("node:path");
const os = require("node:os");
const assert = require("node:assert/strict");
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1050 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  const qs = await (
    await page.request.get("http://localhost:3000/data/questions.json")
  ).json();
  const save = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem("salon-savoirs-v1")));
  const screen = async (s) => {
    await page.waitForFunction(
      (s) => document.querySelector("#app")?.dataset.screen === s,
      s,
    );
  };
  const goto = async (s) => {
    await page.evaluate((s) => (location.hash = s), s);
    await screen(s);
  };
  const answerCorrect = async () => {
    const s = await save(),
      q = qs.find((q) => q.id === s.active.id);
    await page.locator("[data-choice]").filter({ hasText: q.answer }).click();
    await screen("resultat");
  };
  await page.goto("http://localhost:3000");
  await screen("accueil");
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-accueil.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.locator(".hero-actions [data-action=new]").click();
  await screen("joueurs");
  await page.locator('[data-count="4"]').click();
  await page.locator("[name=player0]").fill("Émilie");
  await page.locator('[data-avatar="0"]').click();
  assert.equal(await page.locator("[name=player0]").inputValue(), "Émilie");
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-joueurs.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.locator("#setup-form button[type=submit]").click();
  await screen("plateau");
  assert.equal((await save()).players.length, 4);
  assert.equal(await page.locator(".board-player").count(), 4);
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-plateau.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.locator("#roll").click();
  await page.locator(".destinations button").first().waitFor();
  let s = await save();
  assert(s.die >= 1 && s.die <= 6);
  assert.equal(await page.locator("g[data-destination]").count(), 2);
  await page.locator(".destinations button").first().click();
  await screen("question");
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-question.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await screen("question");
  assert.equal(await page.locator("[data-choice]").count(), 4);
  await answerCorrect();
  s = await save();
  assert.equal(s.players[0].correct, 1);
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-reponse.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.reload();
  await screen("resultat");
  assert.equal((await save()).players[0].correct, 1);
  await page.locator("#continue").click();
  await screen("plateau");
  assert.equal((await save()).current, 0);
  await page.locator("#roll").click();
  await page.locator(".destinations button").first().waitFor();
  await page.locator("g[data-destination]").first().focus();
  await page.keyboard.press("Enter");
  await screen("question");
  s = await save();
  let q = qs.find((q) => q.id === s.active.id),
    wrong = s.active.choices.find((x) => x !== q.answer);
  await page.locator("[data-choice]").filter({ hasText: wrong }).click();
  await screen("resultat");
  assert.equal(await page.locator(".result-choices .right").count(), 1);
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-erreur.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page.locator("[data-action=flag]").click();
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("salon-flags-v1")).length,
    ),
    1,
  );
  await page.locator("#continue").click();
  await screen("plateau");
  assert.equal((await save()).current, 1);
  await goto("scores");
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-scores.png"),
    fullPage: true,
    animations: "disabled",
  });
  assert.equal(await page.locator(".score-card").count(), 4);
  await goto("regles");
  await goto("options");
  await page.locator("[data-action=motion]").click();
  assert.equal(
    await page.locator("[data-action=motion]").getAttribute("aria-checked"),
    "false",
  );
  await goto("accueil");
  await page.locator(".hero-actions [data-action=new]").click();
  await page.locator("#confirm-dialog [value=cancel]").click();
  await screen("accueil");
  assert.equal((await save()).players[0].correct, 1);
  // La finale est atteinte par un état de test, pas en simulant des heures de tirage.
  await page.evaluate(() => {
    let s = JSON.parse(localStorage.getItem("salon-savoirs-v1"));
    s.players[s.current].medals = [0, 1, 2, 3, 4, 5];
    localStorage.setItem("salon-savoirs-v1", JSON.stringify(s));
  });
  await page.reload();
  await screen("accueil");
  await page.locator("[data-action=resume]").click();
  await screen("plateau");
  await page.locator("#center").click();
  await screen("question");
  assert((await save()).active.final);
  await answerCorrect();
  await page.locator("#continue").click();
  await screen("victoire");
  assert.equal((await save()).phase, "won");
  await page.screenshot({
    path: path.join(os.tmpdir(), "salon-v05-victoire.png"),
    fullPage: true,
    animations: "disabled",
  });
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("salon-history-v05")).length,
    ),
    1,
  );
  await page.reload();
  await screen("victoire");
  assert.equal(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem("salon-history-v05")).length,
    ),
    1,
  );
  await goto("scores");
  await page.locator("[data-tab=history]").click();
  assert.equal(await page.locator(".history-card").count(), 1);
  // Nouveau défi d'entraînement, chronomètre, signalement, export.
  await goto("accueil");
  await page.locator(".hero-actions [data-action=new]").click();
  await screen("joueurs");
  await page.locator("#mode").selectOption("training");
  assert.equal(await page.locator(".player-card").count(), 1);
  await page.locator("#difficulty").selectOption("facile");
  await page.locator("#duration").selectOption("20");
  await page.locator("#setup-form button[type=submit]").click();
  await screen("plateau");
  await page.locator("#training-category").selectOption("science");
  await page.locator("[data-action=draw]").click();
  await screen("question");
  s = await save();
  q = qs.find((q) => q.id === s.active.id);
  assert.equal(q.category, "science");
  assert.equal(q.difficulty, "facile");
  assert(s.active.deadline > Date.now());
  await answerCorrect();
  assert.equal((await save()).players[0].medals.length, 1);
  await page.locator("#continue").click();
  await screen("plateau");
  await page.locator("[data-action=draw]").click();
  await screen("question");
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem("salon-savoirs-v1"));
    s.active.deadline = Date.now() - 1;
    localStorage.setItem("salon-savoirs-v1", JSON.stringify(s));
  });
  await page.reload();
  await screen("resultat");
  assert.equal((await save()).active.selected, null);
  await goto("credits");
  const dl = page.waitForEvent("download");
  await page.locator("[data-action=export]").click();
  assert((await dl).suggestedFilename().endsWith(".json"));
  // Tous les écrans gardent une largeur mobile sans débordement.
  await page.setViewportSize({ width: 390, height: 844 });
  for (const r of [
    "accueil",
    "joueurs",
    "plateau",
    "resultat",
    "scores",
    "regles",
    "options",
    "credits",
  ]) {
    if (r === "plateau") {
      // un résultat en cours est repris au lieu d'être abandonné
      await goto("resultat");
      await page.locator("#continue").click();
      await screen("plateau");
    } else if (r === "resultat") {
      await page.locator("[data-action=draw]").click();
      await screen("question");
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
      );
      await page.locator("[data-action=skip]").click();
      await screen("resultat");
    } else await goto(r);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      "débordement " + r,
    );
    if (["accueil", "resultat", "joueurs"].includes(r))
      await page.screenshot({
        path: path.join(os.tmpdir(), "salon-v05-mobile-" + r + ".png"),
        fullPage: true,
        animations: "disabled",
      });
  }
  assert.deepEqual(errors, []);
  console.log(
    "PASS v0.5 : accueil, 4 joueurs/avatars, dé, destinations clavier, QCM, correction, reprise, tours, médaillon, finale/podium/historique, entraînement/niveau/chrono, export, 9 écrans mobile.",
  );
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
