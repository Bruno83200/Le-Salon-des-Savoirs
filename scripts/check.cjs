const fs = require("node:fs"),
  assert = require("node:assert/strict");
(async () => {
  const code = fs.readFileSync("js/engine.js", "utf8");
  const e = await import(
    "data:text/javascript;base64," + Buffer.from(code).toString("base64")
  );
  const qs = JSON.parse(fs.readFileSync("data/questions.json", "utf8"));
  assert.equal(qs.length, 624);
  assert.equal(new Set(qs.map((q) => q.id)).size, 624);
  for (const c of e.CATEGORIES) {
    assert.equal(qs.filter((q) => q.category === c.id).length, 104);
  }
  for (const cat of e.CATEGORIES) {
    for (const [level, n] of [
      ["facile", 42],
      ["moyen", 42],
      ["difficile", 20],
    ])
      assert.equal(
        qs.filter((q) => q.category === cat.id && q.difficulty === level)
          .length,
        n,
      );
  }
  const checked = qs.filter(
    (q) => q.factCheckStatus === "answer-and-explanation-reference-checked",
  );
  assert.equal(checked.length, 27);
  assert(
    checked.every(
      (q) =>
        q.verifiedAt === "2026-10-20" &&
        q.verificationScope &&
        q.sourceUrl.startsWith("https://"),
    ),
  );
  for (const id of ["oqdb-206-7", "oqdb-151-9", "oqdb-70-19"])
    assert(!qs.some((q) => q.id === id));
  for (const q of qs) {
    assert.equal(q.choices.length, 4);
    assert.equal(new Set(q.choices).size, 4);
    assert(q.choices.includes(q.answer));
    assert(
      q.explanation && q.source && q.author && q.sourceUrl && q.licenseUrl,
    );
    assert.equal(q.license, "CC BY-SA 4.0");
    assert(
      !/[<>\x80-\x9f]/.test(
        q.question + q.choices.join("") + q.answer + q.explanation,
      ),
    );
  }
  for (let p = 0; p < 36; p++)
    for (let d = 1; d <= 6; d++) {
      const ds = e.destinations(p, d);
      assert.equal(ds.length, 2);
      assert(ds.every((x) => x >= 0 && x < 36));
    }
  assert.deepEqual(
    Array.from({ length: 6 }, (_, i) => e.cellCategory(i * 6)),
    [0, 1, 2, 3, 4, 5],
  );
  const s = e.freshGame(["Camille", "Alex"], "board", 0);
  assert(e.validSave(s));
  assert(!e.validSave({ ...s, current: 7 }));
  assert(!e.validSave({ ...s, version: 2 }));
  assert(!e.validSave({ ...s, phase: "question" }));
  assert.deepEqual(e.shuffle([1, 2, 3]).sort(), [1, 2, 3]);
  console.log(
    "OK : 624 questions, 6 catégories, 216 déplacements, 6 cases médaillon et validation des sauvegardes.",
  );
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
