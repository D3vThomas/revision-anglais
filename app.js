"use strict";
const DATA = window.CESI_DATA,
    KEY = "cesi-recall-v1";
const labels = {
    words: "Mots métier",
    expressions: "Expressions",
    definitions: "Définitions",
};
const $ = (s) => document.querySelector(s),
    esc = (s) =>
        String(s).replace(
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
const norm = (s) =>
    s.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("fr");
const shuffle = (a) => {
    a = [...a];
    for (let i = a.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
let saved = { items: {}, sessions: [] },
    storageOK = true;
try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (raw && raw.items && Array.isArray(raw.sessions)) saved = raw;
} catch (e) {
    storageOK = false;
}
let cat = "words",
    view = "train",
    size = "10",
    direction = "en",
    session = null,
    clock = null;
const state = (id) =>
    saved.items[id] || { attempts: 0, correct: 0, streak: 0, error: false };
function persist() {
    try {
        localStorage.setItem(KEY, JSON.stringify(saved));
    } catch (e) {
        storageOK = false;
    }
    $("#save-status").textContent = storageOK
        ? "Progression enregistrée sur cet appareil"
        : "Sauvegarde indisponible · exporter les progrès";
}
function record(item, ok) {
    let s = state(item.id);
    s.attempts++;
    s.correct += Number(ok);
    s.streak = ok ? s.streak + 1 : 0;
    s.error = !ok;
    s.last = new Date().toISOString();
    saved.items[item.id] = s;
    persist();
}
function pool(c = cat) {
    return DATA.filter((d) => d.category === c);
}
function summary(c) {
    let p = pool(c);
    return {
        total: p.length,
        seen: p.filter((d) => state(d.id).attempts).length,
        mastered: p.filter((d) => state(d.id).streak >= 3).length,
        errors: p.filter((d) => state(d.id).error).length,
        attempts: p.reduce((a, d) => a + state(d.id).attempts, 0),
        correct: p.reduce((a, d) => a + state(d.id).correct, 0),
    };
}
function categories() {
    return `<div class="categories">${Object.entries(labels)
        .map(([c, l], i) => {
            let s = summary(c);
            return `<button class="category ${cat === c ? "active" : ""}" data-cat="${c}" aria-pressed="${cat === c}"><span class="eyebrow">0${i + 1}</span><span class="num">${s.total}</span><strong>${l}</strong><small>${s.mastered} / ${s.total} maîtrisés</small><div class="bar"><span style="width:${(s.mastered / s.total) * 100}%"></span></div></button>`;
        })
        .join("")}</div>`;
}
const modes = [
    ["typing", "Aa", "Traduction écrite", "Retrouve la traduction exacte."],
    ["flash", "↔", "Flashcards", "Retourne la carte, puis évalue-toi."],
    ["qcm", "☷", "QCU examen", "Une question, quatre propositions."],
    ["recall", "∅", "Partir de rien", "Retrouve toute la liste sans indice."],
    ["pairs", "⇄", "Association", "Relie chaque élément à sa paire."],
    ["blank", "_", "Mot manquant", "Complète la traduction anglaise."],
    ["rebuild", "≡", "Reconstruction", "Remets les mots dans le bon ordre."],
    ["reverse", "↗", "Terme → définition", "Reconnais le bon texte anglais."],
    [
        "recognize",
        "✓",
        "Reconnaissance",
        "Ce terme et ce texte vont-ils ensemble ?",
    ],
    ["errors", "↺", "Revoir mes erreurs", "Travaille les entrées à revoir."],
    ["timed", "◷", "Défi chrono", "90 secondes pour répondre juste."],
];
function home() {
    let s = summary(cat);
    $("#main").innerHTML =
        `<div class="topline"><div><p class="eyebrow">APPRENDRE. RETENIR. RECOMMENCER.</p><h1>À toi de jouer.</h1><p class="lead">Choisis ta liste et ta façon de réviser.</p></div><span class="badge">MAALSI · A4</span></div>${categories()}<div class="workspace"><section><div class="panel featured"><p class="eyebrow">COMME LE JOUR J</p><h2>L’examen blanc</h2><p>50 mots, 50 expressions et 25 définitions.<br>Quatre choix. Une seule bonne réponse.</p><button class="primary" data-start="exam">Lancer les 125 questions ↗</button></div><div class="settings"><label>Taille de la série<select id="size"><option value="10">10 questions</option><option value="20">20 questions</option><option value="all">Toute la liste</option></select></label><label>Sens de traduction<select id="direction"><option value="en">Français → Anglais</option><option value="fr">Anglais → Français</option></select></label></div><h2>Varie les entraînements</h2><p class="subtle">Les séries sont mélangées à chaque départ.${cat === "definitions" ? " Pour les définitions, jamais de paragraphe à retaper." : ""}</p><div class="modes">${modes
            .filter((m) =>
                cat === "definitions"
                    ? !["typing", "blank", "rebuild"].includes(m[0])
                    : !["reverse", "recognize"].includes(m[0]),
            )
            .map(
                (m) =>
                    `<button class="mode" data-start="${m[0]}"><span class="mode-icon">${m[1]}</span><strong>${m[2]}</strong><span>${m[3]}</span></button>`,
            )
            .join(
                "",
            )}</div></section><section class="panel side-panel"><p class="eyebrow">TA LISTE DU MOMENT</p><h2>${labels[cat]}</h2><div class="statbig">${s.mastered}<span class="subtle"> / ${s.total}</span></div><p class="subtle">entrées maîtrisées</p><div class="bar"><span style="width:${(s.mastered / s.total) * 100}%"></span></div><p>${s.seen} déjà rencontrées<br>${s.errors} à revoir</p><hr><p class="subtle">Une entrée est maîtrisée après 3 bonnes réponses consécutives, tous modes confondus, y compris l’autoévaluation des flashcards.</p><button class="secondary" data-view="stats">Voir mes progrès</button></section></div><div class="notice">Le PDF annonce 50 expressions, mais en contient 51. Elles sont toutes conservées ici. L’examen blanc en tire 50 au hasard. Les textes restent ceux du document ; seuls les retours à la ligne de mise en page sont réunis.</div>`;
    $("#size").value = size;
    $("#direction").value = direction;
    $("#size").onchange = (e) => (size = e.target.value);
    $("#direction").onchange = (e) => (direction = e.target.value);
}
function navigate(v) {
    clearInterval(clock);
    session = null;
    view = v;
    document
        .querySelectorAll("nav button")
        .forEach((b) => b.classList.toggle("active", b.dataset.view === v));
    if (v === "train") home();
    if (v === "library") library();
    if (v === "stats") stats();
}
function library() {
    $("#main").innerHTML =
        `<p class="eyebrow">LE DOCUMENT, À PORTÉE DE MAIN</p><h1>Le répertoire.</h1><p class="lead">Les formulations du PDF, sans correction ni traduction ajoutée.</p>${categories()}<label for="search">Rechercher dans cette liste</label><input class="search" id="search" placeholder="Un mot, une expression, une définition…"><div class="panel" id="entries"></div>`;
    $("#search").oninput = renderEntries;
    renderEntries();
}
function renderEntries() {
    let q = norm($("#search").value);
    let rows = pool().filter((d) =>
        norm(
            [d.fr, d.en, d.definitionFr || "", d.definitionEn || ""].join(" "),
        ).includes(q),
    );
    $("#entries").innerHTML = rows.length
        ? rows
              .map(
                  (d) =>
                      `<article class="entry"><div><small>FR · ${d.id.split("-")[1]}</small><br><strong>${esc(d.fr)}</strong>${d.definitionFr ? `<p>${esc(d.definitionFr)}</p>` : ""}</div><div><small>EN</small><br><strong>${esc(d.en)}</strong>${d.definitionEn ? `<p>${esc(d.definitionEn)}</p>` : ""}</div></article>`,
              )
              .join("")
        : '<p class="empty">Aucune entrée trouvée.</p>';
}
function stats() {
    $("#main").innerHTML =
        `<p class="eyebrow">CHAQUE RÉVISION COMPTE</p><h1>Ta progression.</h1><p class="lead">Maîtrise = 3 bonnes réponses consécutives sur une entrée.</p><div class="stats-grid">${Object.keys(
            labels,
        )
            .map((c) => {
                let s = summary(c);
                return `<div class="panel"><h2>${labels[c]}</h2><div class="statbig">${s.mastered}<span class="subtle"> / ${s.total}</span></div><p>Maîtrisées · ${s.seen} rencontrées</p><progress value="${s.mastered}" max="${s.total}"></progress><p>${s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0} % de réussite<br>${s.attempts} réponses · ${s.errors} à revoir</p></div>`;
            })
            .join("")}</div><h2>Dernières sessions</h2><div class="panel">${
            saved.sessions.length
                ? saved.sessions
                      .slice(-10)
                      .reverse()
                      .map(
                          (s) =>
                              `<div class="found row"><strong>${esc(s.name)}</strong><span>${s.correct} / ${s.attempts} réponses justes</span><small>${new Date(s.date).toLocaleString("fr-FR")}</small></div>`,
                      )
                      .join("")
                : '<p class="subtle">Tes sessions terminées apparaîtront ici.</p>'
        }</div><div class="actions"><button class="secondary" id="export">Exporter ma progression</button><label class="secondary">Importer une sauvegarde<input type="file" id="import" accept="application/json" hidden></label><button class="danger" id="reset">Réinitialiser</button></div><p id="transfer" role="status"></p><p class="subtle">La sauvegarde est propre au navigateur et à cet emplacement du site. Exporte-la avant de déplacer le dossier ou de changer de navigateur.</p>`;
    $("#export").onclick = () => {
        let a = document.createElement("a");
        let u = URL.createObjectURL(
            new Blob([JSON.stringify(saved, null, 2)], {
                type: "application/json",
            }),
        );
        a.href = u;
        a.download = "progression-cesi.json";
        a.click();
        setTimeout(() => URL.revokeObjectURL(u), 1000);
    };
    $("#import").onchange = async (e) => {
        try {
            let x = JSON.parse(await e.target.files[0].text());
            if (
                !x.items ||
                !Array.isArray(x.sessions) ||
                x.sessions.some(
                    (s) =>
                        !Number.isFinite(s.correct) ||
                        !Number.isFinite(s.attempts) ||
                        typeof s.name !== "string" ||
                        !Number.isFinite(Date.parse(s.date)),
                )
            )
                throw Error();
            for (let [id, s] of Object.entries(x.items)) {
                if (
                    !DATA.some((d) => d.id === id) ||
                    !["attempts", "correct", "streak"].every(
                        (k) => Number.isInteger(s[k]) && s[k] >= 0,
                    ) ||
                    s.correct > s.attempts ||
                    s.streak > s.correct ||
                    typeof s.error !== "boolean"
                )
                    throw Error();
            }
            if (
                confirm(
                    "Remplacer la progression actuelle par cette sauvegarde ?",
                )
            ) {
                saved = x;
                persist();
                stats();
                $("#transfer").textContent = "Sauvegarde importée.";
            }
        } catch {
            $("#transfer").textContent =
                "Ce fichier ne contient pas une sauvegarde valide.";
        }
    };
    $("#reset").onclick = () => {
        if (
            confirm(
                "Effacer toute la progression et les sessions de cet appareil ?",
            )
        ) {
            saved = { items: {}, sessions: [] };
            persist();
            stats();
        }
    };
}
function start(mode) {
    clearInterval(clock);
    let p = pool();
    if (mode === "errors") p = p.filter((d) => state(d.id).error);
    if (mode === "exam")
        p = [
            ...pool("words"),
            ...shuffle(pool("expressions")).slice(0, 50),
            ...pool("definitions"),
        ];
    p = shuffle(p);
    if (!["exam", "recall", "timed"].includes(mode))
        p = p.slice(0, size === "all" ? p.length : Number(size));
    session = {
        mode,
        queue: p,
        index: 0,
        correct: 0,
        attempts: 0,
        answered: false,
        found: [],
        matched: [],
        selected: null,
        started: Date.now(),
        end: mode === "timed" ? Date.now() + 90000 : null,
    };
    if (!p.length) {
        $("#main").innerHTML =
            '<div class="panel"><h1>Tout est à jour.</h1><p>Aucune erreur à réviser dans cette liste.</p><button class="primary" data-view="train">Retour aux jeux</button></div>';
        return;
    }
    renderSession();
    if (mode === "timed")
        clock = setInterval(() => {
            if (!session) return;
            const left = Math.max(
                0,
                Math.ceil((session.end - Date.now()) / 1000),
            );
            if ($("#timer")) $("#timer").textContent = left + " s";
            if (left === 0) finish();
        }, 250);
}
function modeName() {
    return session.mode === "exam"
        ? "Examen blanc"
        : modes.find((m) => m[0] === session.mode)?.[2] || "Révision";
}
function frame(content) {
    $("#main").innerHTML =
        `<div class="session-head"><button class="secondary" id="quit">← Quitter</button><span class="badge">${esc(modeName())}</span><span class="timer" id="timer">${session.end ? Math.max(0, Math.ceil((session.end - Date.now()) / 1000)) + " s" : session.mode === "recall" ? session.found.length + " / " + session.queue.length : session.index + " / " + session.queue.length}</span></div><progress value="${session.mode === "recall" ? session.found.length : session.index}" max="${session.queue.length}" aria-label="Progression de la série"></progress>${content}`;
    $("#quit").onclick = () => {
        if (
            confirm(
                "Terminer cette session ? Les réponses déjà données sont conservées.",
            )
        )
            finish();
    };
}
function target(d) {
    if (d.category === "definitions") return d.en;
    return d[direction];
}
function prompt(d) {
    if (d.category === "definitions") return d.definitionEn;
    return d[direction === "en" ? "fr" : "en"];
}
function canonical(d) {
    return `<strong>${esc(d.fr)}</strong><br>${esc(d.en)}${d.definitionEn ? `<p>${esc(d.definitionEn)}</p><p>${esc(d.definitionFr)}</p>` : ""}`;
}
function renderSession() {
    if (session.index >= session.queue.length) {
        finish();
        return;
    }
    session.answered = false;
    if (session.mode === "recall") {
        renderRecall();
        return;
    }
    if (session.mode === "pairs") {
        renderPairs();
        return;
    }
    const d = session.queue[session.index],
        m = session.mode;
    let actual = ["exam", "timed", "errors"].includes(m) ? "qcm" : m;
    session.actual = actual;
    let q = prompt(d),
        a = target(d);
    if (["exam", "timed", "errors"].includes(m) || actual === "qcm") {
        q = d.category === "definitions" ? d.definitionEn : d.fr;
        a = d.en;
    }
    if (actual === "reverse") {
        q = d.en;
        a = d.definitionEn;
    }
    session.answer = a;
    let content = "";
    if (["qcm", "reverse"].includes(actual)) {
        const field = actual === "reverse" ? "definitionEn" : "en";
        let choices = shuffle([
            d,
            ...shuffle(pool(d.category).filter((x) => x.id !== d.id)).slice(
                0,
                3,
            ),
        ]);
        content = `<div class="choices">${choices.map((x, i) => `<button class="choice" data-choice="${x.id}"><b>${i + 1}</b><span>${esc(x[field])}</span></button>`).join("")}</div>`;
    }
    if (actual === "typing")
        content = `<form class="answer-form" id="answer-form"><input id="answer" aria-label="Ta traduction" autocomplete="off" spellcheck="false" placeholder="${direction === "en" ? "Écris en anglais…" : "Écris en français…"}" required><button class="primary">Vérifier</button></form><p class="subtle">Casse et espaces ignorés. Accents, ponctuation et formulations conservés.</p>`;
    if (actual === "flash")
        content = `<button class="flash" id="flip">${esc(q)}<br><small class="subtle">Cliquer pour retourner</small></button><div id="flash-actions"></div>`;
    if (actual === "blank") {
        a = d.en;
        let tokens = a.split(" "),
            index = Math.floor(Math.random() * tokens.length);
        session.answer = tokens[index];
        q = d.fr;
        content = `<p class="prompt long">${tokens.map((t, i) => (i === index ? "________" : esc(t))).join(" ")}</p><form class="answer-form" id="answer-form"><input id="answer" aria-label="Mot manquant" autocomplete="off" required placeholder="Le mot manquant…"><button class="primary">Vérifier</button></form>`;
    }
    if (actual === "rebuild") {
        session.tokens = shuffle(
            d.en.split(" ").map((text, id) => ({ text, id })),
        );
        session.chosen = [];
        session.answer = d.en;
        q = d.fr;
        content =
            '<p class="subtle">Clique sur les mots dans l’ordre. Clique sur un mot choisi pour le retirer.</p><div class="tokens" id="chosen"></div><div class="tokens" id="bank"></div><button class="primary" id="check-build">Vérifier l’ordre</button>';
    }
    if (actual === "recognize") {
        session.recognition = Math.random() < 0.5;
        let candidate = session.recognition
            ? d
            : shuffle(pool("definitions").filter((x) => x.id !== d.id))[0];
        q = d.definitionEn;
        content = `<h2>${esc(candidate.en)}</h2><p>Ce terme correspond-il à cette définition ?</p><div class="actions"><button class="secondary" data-recognize="yes">Oui</button><button class="secondary" data-recognize="no">Non</button></div>`;
    }
    frame(
        `<section class="panel question"><p class="eyebrow">${labels[d.category]} · ${actual === "reverse" ? "TERME → DÉFINITION" : d.category === "definitions" ? "DÉFINITION → TERME" : actual === "typing" ? (direction === "en" ? "FRANÇAIS → ANGLAIS" : "ANGLAIS → FRANÇAIS") : "RÉVISION"}</p>${actual !== "flash" ? `<div class="prompt ${d.category === "definitions" ? "long" : ""}">${esc(q)}</div>` : ""}${content}<div id="feedback" aria-live="polite"></div><div class="actions"><button class="secondary" id="skip">Je ne sais pas</button></div></section>`,
    );
    if ($("#answer-form"))
        $("#answer-form").onsubmit = (e) => {
            e.preventDefault();
            if (!session.answered)
                grade(norm($("#answer").value) === norm(session.answer));
        };
    document
        .querySelectorAll("[data-choice]")
        .forEach((b) => (b.onclick = () => grade(b.dataset.choice === d.id)));
    document
        .querySelectorAll("[data-recognize]")
        .forEach(
            (b) =>
                (b.onclick = () =>
                    grade(
                        (b.dataset.recognize === "yes") === session.recognition,
                    )),
        );
    if ($("#flip")) {
        let back = false;
        $("#flip").onclick = () => {
            back = !back;
            $("#flip").innerHTML = back ? canonical(d) : esc(q);
            $("#flash-actions").innerHTML =
                '<p class="subtle">Autoévaluation : avais-tu trouvé la réponse avant de retourner ?</p><div class="actions"><button class="primary" id="know">Je savais</button><button class="secondary" id="notknow">À revoir</button></div>';
            $("#know").onclick = () => grade(true);
            $("#notknow").onclick = () => grade(false);
        };
    }
    if (actual === "rebuild") {
        renderTokens();
        $("#check-build").onclick = () =>
            grade(
                norm(
                    session.chosen
                        .map(
                            (id) =>
                                session.tokens.find((t) => t.id === id).text,
                        )
                        .join(" "),
                ) === norm(d.en),
            );
    }
    $("#skip").onclick = () => grade(false);
    if ($("#answer")) $("#answer").focus();
}
function renderTokens() {
    for (let area of ["chosen", "bank"]) {
        $("#" + area).innerHTML = (
            area === "chosen"
                ? session.chosen.map((id) =>
                      session.tokens.find((t) => t.id === id),
                  )
                : session.tokens.filter((t) => !session.chosen.includes(t.id))
        )
            .map(
                (t) =>
                    `<button class="token" data-token="${t.id}">${esc(t.text)}</button>`,
            )
            .join("");
        $("#" + area)
            .querySelectorAll("button")
            .forEach(
                (b) =>
                    (b.onclick = () => {
                        if (session.answered) return;
                        let id = Number(b.dataset.token);
                        session.chosen = session.chosen.includes(id)
                            ? session.chosen.filter((x) => x !== id)
                            : [...session.chosen, id];
                        renderTokens();
                    }),
            );
    }
}
function grade(ok) {
    if (!session || session.answered) return;
    if (session.end && Date.now() >= session.end) {
        finish();
        return;
    }
    session.answered = true;
    let d = session.queue[session.index];
    record(d, ok);
    session.attempts++;
    session.correct += Number(ok);
    document
        .querySelectorAll(".question button,.question input")
        .forEach((b) => (b.disabled = true));
    $("#feedback").innerHTML =
        `<div class="feedback ${ok ? "good" : "bad"}"><strong>${ok ? "Bien joué." : "À revoir."}</strong><p>Réponse exacte du document :</p>${canonical(d)}</div><button class="primary" id="next">${session.index + 1 === session.queue.length ? "Voir le bilan" : "Continuer →"}</button>`;
    $("#next").onclick = () => {
        session.index++;
        renderSession();
    };
    $("#next").focus();
}
function renderRecall() {
    frame(
        `<section class="panel question"><p class="eyebrow">${labels[cat]} · SANS INDICE</p><h1>Tout retrouver.</h1><p>${cat === "definitions" ? "Retrouve les intitulés anglais (le « : » final est facultatif)." : `Retrouve les ${direction === "en" ? "traductions anglaises" : "entrées françaises"}, dans l’ordre que tu veux.`}</p><form class="answer-form" id="recall-form"><input id="recall-answer" aria-label="Une entrée de la liste" autocomplete="off" required placeholder="Une entrée te revient ?"><button class="primary">Ajouter</button></form><p id="recall-message" role="status"></p><div id="found-list"></div><button class="secondary" id="end-recall">Terminer et voir les éléments manquants</button></section>`,
    );
    $("#recall-form").onsubmit = (e) => {
        e.preventDefault();
        let value = norm($("#recall-answer").value);
        const normalizeRecall = (s) =>
            cat === "definitions" ? norm(s).replace(/\s*:$/, "") : norm(s);
        let d = session.queue.find(
            (d) => normalizeRecall(target(d)) === normalizeRecall(value),
        );
        if (!d) {
            $("#recall-message").textContent =
                "Pas de correspondance exacte dans cette liste. Réessaie.";
            return;
        }
        if (session.found.includes(d.id)) {
            $("#recall-message").textContent = "Déjà retrouvé !";
            return;
        }
        session.found.push(d.id);
        record(d, true);
        session.attempts++;
        session.correct++;
        renderRecall();
        $("#recall-message").textContent = "Retrouvé : " + target(d);
        if (session.found.length === session.queue.length) finish();
    };
    $("#found-list").innerHTML = session.found
        .map(
            (id) =>
                `<div class="found">${esc(target(DATA.find((d) => d.id === id)))}</div>`,
        )
        .join("");
    $("#end-recall").onclick = finish;
    $("#recall-answer").focus();
}
function renderPairs() {
    if (
        !session.batch ||
        session.batch.every((d) => session.matched.includes(d.id))
    ) {
        session.batch = session.queue.slice(session.index, session.index + 4);
        session.right = shuffle(session.batch);
        session.selected = null;
    }
    frame(
        `<section class="panel question"><p class="eyebrow">ASSOCIATION · ${labels[cat]}</p><h2>Retrouve les paires.</h2><p class="subtle">Choisis à gauche, puis à droite.${cat === "definitions" ? " Relie le terme anglais à sa définition anglaise." : ""}</p><div class="pairs"><div class="paircol">${session.batch.map((d) => `<button class="pair ${session.matched.includes(d.id) ? "matched" : ""}" data-left="${d.id}" ${session.matched.includes(d.id) ? "disabled" : ""}>${esc(cat === "definitions" ? d.en : d.fr)}</button>`).join("")}</div><div class="paircol">${session.right.map((d) => `<button class="pair ${session.matched.includes(d.id) ? "matched" : ""}" data-right="${d.id}" ${session.matched.includes(d.id) ? "disabled" : ""}>${esc(cat === "definitions" ? d.definitionEn : d.en)}</button>`).join("")}</div></div><div id="pair-message" aria-live="polite"></div><div id="pair-next"></div></section>`,
    );
    document.querySelectorAll("[data-left]").forEach(
        (b) =>
            (b.onclick = () => {
                session.selected = b.dataset.left;
                document
                    .querySelectorAll("[data-left]")
                    .forEach((x) => x.classList.toggle("selected", x === b));
            }),
    );
    document.querySelectorAll("[data-right]").forEach(
        (b) =>
            (b.onclick = () => {
                if (!session.selected) {
                    $("#pair-message").textContent =
                        "Choisis d’abord un élément à gauche.";
                    return;
                }
                let d = DATA.find((d) => d.id === session.selected),
                    ok = d.id === b.dataset.right;
                record(d, ok);
                session.attempts++;
                session.correct += Number(ok);
                if (ok) {
                    session.matched.push(d.id);
                    session.index++;
                    session.selected = null;
                    if (
                        session.batch.every((x) =>
                            session.matched.includes(x.id),
                        )
                    ) {
                        document
                            .querySelectorAll(".pair")
                            .forEach((x) => (x.disabled = true));
                        $("#pair-message").textContent =
                            "Toutes les paires sont retrouvées.";
                        $("#pair-next").innerHTML =
                            '<button class="primary" id="next-pairs">Continuer →</button>';
                        $("#next-pairs").onclick = renderSession;
                    } else renderPairs();
                } else {
                    $("#pair-message").innerHTML =
                        `<div class="feedback bad">Cette paire ne correspond pas. La bonne association :<br>${canonical(d)}</div>`;
                    session.selected = null;
                    document
                        .querySelectorAll("[data-left]")
                        .forEach((x) => x.classList.remove("selected"));
                }
            }),
    );
}
function finish() {
    if (!session) return;
    clearInterval(clock);
    let s = session,
        name = modeName(),
        missing =
            s.mode === "recall"
                ? s.queue.filter((d) => !s.found.includes(d.id))
                : [];
    if (s.mode === "recall")
        missing.forEach((d) => {
            record(d, false);
            s.attempts++;
        });
    if (s.attempts)
        saved.sessions.push({
            name,
            date: new Date().toISOString(),
            correct: s.correct,
            attempts: s.attempts,
        });
    saved.sessions = saved.sessions.slice(-100);
    persist();
    let completed = s.mode === "exam" && s.attempts === 125,
        gradeLetter =
            s.correct >= 100
                ? "A"
                : s.correct >= 75
                  ? "B"
                  : s.correct >= 50
                    ? "C"
                    : "D";
    $("#main").innerHTML =
        `<p class="eyebrow">${esc(name)} · BILAN</p><h1>${s.attempts ? "Une session de plus." : "À bientôt pour réviser."}</h1><div class="panel"><div class="statbig">${s.correct}<span class="subtle"> / ${s.attempts} réponses justes</span></div><p>${s.attempts ? Math.round((s.correct / s.attempts) * 100) : 0} % de réussite · ${Math.round((Date.now() - s.started) / 1000)} secondes</p>${completed ? `<h2>Note indicative : ${gradeLetter}</h2><p class="subtle">Barème du document : A 100–125 · B 75–99 · C 50–74 · D 0–49.</p>` : ""}${s.mode === "exam" && !completed ? "<p>Examen interrompu : aucune note attribuée.</p>" : ""}<div class="actions"><button class="primary" data-start="${s.mode}">Rejouer une série</button><button class="secondary" data-view="train">Choisir un autre jeu</button><button class="secondary" data-view="stats">Ma progression</button></div></div>${missing.length ? `<h2>${missing.length} entrées à retrouver la prochaine fois</h2><div class="panel">${missing.map((d) => `<div class="found">${canonical(d)}</div>`).join("")}</div>` : ""}`;
    session = null;
}
document.addEventListener("click", (e) => {
    let b = e.target.closest("[data-view],[data-cat],[data-start]");
    if (!b) return;
    if (b.dataset.view) navigate(b.dataset.view);
    if (b.dataset.cat) {
        cat = b.dataset.cat;
        view === "library" ? library() : home();
    }
    if (b.dataset.start) start(b.dataset.start);
    if (b.dataset.view || b.dataset.start) window.scrollTo(0, 0);
});
if (document.modelContext?.registerTool) {
    try {
        Promise.resolve(
            document.modelContext.registerTool({
                name: "read_learning_progress",
                description:
                    "Lire la progression locale par catégorie, sans la modifier.",
                inputSchema: {
                    type: "object",
                    properties: {},
                    additionalProperties: false,
                },
                annotations: { readOnlyHint: true },
                execute: () =>
                    Object.fromEntries(
                        Object.keys(labels).map((c) => [c, summary(c)]),
                    ),
            }),
        ).catch(() => {});
    } catch (e) {}
}
persist();
navigate("train");
