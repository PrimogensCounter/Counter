// =======================
// COSTANTI PATCH E DATE
// =======================
const patchInizio = new Date("2026-08-12T00:00:00"); // inizio 7.0
const durataPatch = 42; // giorni
const msPerPatch = durataPatch * 24 * 60 * 60 * 1000;
const numPatchPrecalcolate = 25;

let destiniTotaliGlobali = 0; // terrà il totale dei destini calcolati

// =======================
// FUNZIONI AUSILIARIE
// =======================
function formatDateIT(date) {
    return date.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function salvaDataLocale(dataStr) {
    localStorage.setItem("dataTargetSalvata", dataStr);
}

function caricaDataLocale() {
    const dataSalvata = localStorage.getItem("dataTargetSalvata");
    if (dataSalvata) {
        const inputData = document.getElementById("dataTarget");
        if (inputData) inputData.value = dataSalvata;
    }
}

function formatDateLocal(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Quando selezioni una voce dal MENU A TENDINA -> aggiorna il CALENDARIO e ricalcola
function aggiornaDaSelect(selectId, inputId) {
    const select = document.getElementById(selectId);
    const input = document.getElementById(inputId);
    if (select && input && select.value) {
        input.value = select.value;
        aggiornaCalcolo();
        generaTabellaPatch();
    }
}

// Quando cambi la data dal CALENDARIO -> sincronizza il MENU A TENDINA e ricalcola
function aggiornaDaData(inputId, selectId) {
    const input = document.getElementById(inputId);
    const select = document.getElementById(selectId);
    if (input && select) {
        select.value = input.value;
        aggiornaCalcolo();
        generaTabellaPatch();
    }
}

window.addEventListener("load", () => {
    const oggi = new Date();
    const formatted = formatDateLocal(oggi);
    const dataInizio = document.getElementById("dataInizio");
    if (dataInizio && !dataInizio.value) {
        dataInizio.value = formatted;
    }

    caricaDataLocale();

    generaTuttePatch();
    popolaSelettoriFasi();

    if (dataInizio) {
        const sInizio = document.getElementById("selectInizio");
        if (sInizio) sInizio.value = dataInizio.value;
    }
    const dataTarget = document.getElementById("dataTarget");
    if (dataTarget) {
        const sFine = document.getElementById("selectFine");
        if (sFine) sFine.value = dataTarget.value;
    }

    caricaDestiniEPityDaLocale();
    generaTabellaPatch();
    aggiornaCalcolo();
    caricaStatiDaLocale();
});

// =======================
// GENERA TUTTE LE PATCH PRECALCOLATE
// =======================
let tuttePatch = [];

function generaTuttePatch() {
    let major = 7;
    let minor = 0;

    // Creiamo la data di inizio patch impostando esplicitamente anno, mese (0-indexed, quindi 7 = agosto) e giorno, evitando i fusi orari
    let data = new Date(2026, 7, 12, 0, 0, 0); // 12 agosto 2026

    for (let i = 0; i < numPatchPrecalcolate; i++) {
        let inizioF1 = new Date(data.getTime());

        // La fase 2 inizia esattamente 21 giorni dopo la fase 1
        let inizioF2 = new Date(data.getTime());
        inizioF2.setDate(inizioF2.getDate() + 21);

        tuttePatch.push({
            nome: `${major}.${minor}`,
            inizioFase1: inizioF1,
            inizioFase2: inizioF2
        });

        // passa alla patch successiva (aggiungendo 42 giorni esatti)
        if (minor === 8) {
            major += 1;
            minor = 0;
        } else {
            minor += 1;
        }

        data.setDate(data.getDate() + durataPatch);
    }
}
generaTuttePatch();

// =======================
// GENERA TABELLA PATCH (4 patch per riga)
// =======================
function generaTabellaPatch() {
    const tbody = document.querySelector("#tabellaPatch tbody");
    if (!tbody) return;
    tbody.innerHTML = "";

    const dataInizioInput = document.getElementById("dataInizio")?.value;
    let riferimento = dataInizioInput ? new Date(dataInizioInput) : new Date();
    riferimento.setHours(0, 0, 0, 0);

    const idxInizio = tuttePatch.findIndex(p => {
        const finePatch = new Date(p.inizioFase1.getTime() + durataPatch * 24 * 60 * 60 * 1000);
        return riferimento >= p.inizioFase1 && riferimento < finePatch;
    });
    const startIdx = idxInizio >= 0 ? idxInizio : 0;

    const patchDaMostrare = tuttePatch.slice(startIdx, startIdx + 8);

    const rowCount = Math.ceil(patchDaMostrare.length / 4);
    const colsPerRow = 4;

    const thead = document.querySelector("#tabellaPatch thead");
    if (thead) {
        thead.innerHTML = "";
        const trHead = document.createElement("tr");
        for (let i = 0; i < colsPerRow; i++) {
            ["Patch", "Inizio Fase 1", "Inizio Fase 2"].forEach(h => {
                const th = document.createElement("th");
                th.textContent = h;
                trHead.appendChild(th);
            });
        }
        thead.appendChild(trHead);
    }

    for (let r = 0; r < rowCount; r++) {
        const tr = document.createElement("tr");
        for (let c = 0; c < colsPerRow; c++) {
            const idx = r * colsPerRow + c;
            if (idx >= patchDaMostrare.length) continue;

            const patch = patchDaMostrare[idx];

            const tdNome = document.createElement("td");
            tdNome.textContent = patch.nome;
            tdNome.style.fontWeight = "bold";
            tr.appendChild(tdNome);

            const tdFase1 = document.createElement("td");
            tdFase1.textContent = formatDateIT(patch.inizioFase1);
            tr.appendChild(tdFase1);

            const tdFase2 = document.createElement("td");
            tdFase2.textContent = formatDateIT(patch.inizioFase2);
            tr.appendChild(tdFase2);
        }
        tbody.appendChild(tr);
    }
}

function popolaSelettoriFasi() {
    const selectInizio = document.getElementById("selectInizio");
    const selectFine = document.getElementById("selectFine");
    if (!selectInizio || !selectFine) return;

    selectInizio.innerHTML = '<option value="">-- Scegli fase --</option>';
    selectFine.innerHTML = '<option value="">-- Scegli fase --</option>';

    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);

    // Trova l'indice della patch odierna (la stessa logica usata nella tabella)
    const idxInizio = tuttePatch.findIndex(p => {
        const finePatch = new Date(p.inizioFase1.getTime() + durataPatch * 24 * 60 * 60 * 1000);
        return oggi >= p.inizioFase1 && oggi < finePatch;
    });
    const startIdx = idxInizio >= 0 ? idxInizio : 0;

    // Mostra un blocco di patch a partire da quella attuale (es. 5 patch in totale)
    const numPatchDaMostrare = 5;
    const fineIdx = Math.min(startIdx + numPatchDaMostrare, tuttePatch.length);

    for (let i = startIdx; i < fineIdx; i++) {
        let p = tuttePatch[i];

        let dataF1 = formatDateLocal(p.inizioFase1);
        let dataF2 = formatDateLocal(p.inizioFase2);

        let opt1 = document.createElement("option");
        opt1.value = dataF1;
        opt1.textContent = `Patch ${p.nome} - Fase 1`;
        selectInizio.appendChild(opt1);

        let opt2 = document.createElement("option");
        opt2.value = dataF2;
        opt2.textContent = `Patch ${p.nome} - Fase 2`;
        selectInizio.appendChild(opt2);

        let opt3 = document.createElement("option");
        opt3.value = dataF1;
        opt3.textContent = `Patch ${p.nome} - Fase 1`;
        selectFine.appendChild(opt3);

        let opt4 = document.createElement("option");
        opt4.value = dataF2;
        opt4.textContent = `Patch ${p.nome} - Fase 2`;
        selectFine.appendChild(opt4);
    }
}

// Aggiunge 20 giorni alla data di fine selezionata per coprire l'intera fase (21 giorni totali)
function impostaFineFase() {
    const inputFine = document.getElementById("dataTarget");
    const selectFine = document.getElementById("selectFine");

    if (!inputFine || !inputFine.value) {
        alert("Seleziona prima una fase dal menu a tendina o una data di fine.");
        return;
    }

    // Legge la data attualmente impostata nel campo fine
    let d = new Date(inputFine.value);
    d.setHours(0, 0, 0, 0);

    // Sposta la data in avanti di 20 giorni (giorno 0 + 20 giorni = 21 giorni totali della fase)
    d.setDate(d.getDate() + 20);

    // Aggiorna il campo input date con la nuova formattazione locale
    inputFine.value = formatDateLocal(d);

    // Deseleziona la tendina perché ora la data punta alla fine della fase e non più all'inizio
    if (selectFine) selectFine.value = "";

    // Ricalcola tutto
    aggiornaCalcolo();
}

// =======================
// CARICAMENTO E SALVATAGGIO
// =======================
function caricaStatiDaLocale() {
    const statoCheckboxes = JSON.parse(localStorage.getItem("checkboxStati") || "{}");
    const valoriInputNumber = JSON.parse(localStorage.getItem("inputNumberValori") || "{}");

    for (const [id, checked] of Object.entries(statoCheckboxes)) {
        const cb = document.getElementById(id);
        if (cb) cb.checked = checked;
    }

    for (const [id, valore] of Object.entries(valoriInputNumber)) {
        const input = document.getElementById(id);
        if (input) input.value = valore;
    }

    attaccaEventListeners();
}

function caricaDestiniEPityDaLocale() {
    const destiniPregressi = localStorage.getItem("destiniPregressi");
    const pity = localStorage.getItem("pity");
    const primoExtra = localStorage.getItem("primoExtra");
    const destiniExtra = localStorage.getItem("destiniExtra");

    if (destiniPregressi !== null) {
        const inputDestini = document.getElementById("destiniPregressi");
        if (inputDestini) inputDestini.value = destiniPregressi;
    }

    if (pity !== null) {
        const inputPity = document.getElementById("pity");
        if (inputPity) inputPity.value = pity;
    }

    if (primoExtra !== null) {
        const inputPrimoExtra = document.getElementById("primoExtra");
        if (inputPrimoExtra) inputPrimoExtra.value = primoExtra;
    }

    if (destiniExtra !== null) {
        const inputDestiniExtra = document.getElementById("destiniExtra");
        if (inputDestiniExtra) inputDestiniExtra.value = destiniExtra;
    }
}

// =======================
// EVENT LISTENERS
// =======================
function attaccaEventListeners() {
    const risultato = document.getElementById("risultato");
    if (!risultato) return;

    risultato.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener("change", () => {
            const statoCheckboxes = JSON.parse(localStorage.getItem("checkboxStati") || "{}");
            statoCheckboxes[cb.id] = cb.checked;
            localStorage.setItem("checkboxStati", JSON.stringify(statoCheckboxes));
            aggiornaCalcolo();
        });
    });

    risultato.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener("change", () => {
            const valoriInputNumber = JSON.parse(localStorage.getItem("inputNumberValori") || "{}");
            valoriInputNumber[input.id] = input.value;
            localStorage.setItem("inputNumberValori", JSON.stringify(valoriInputNumber));
            aggiornaCalcolo();
        });
    });
}

function conteggioPerGiornoMese(giornoDelMese, startDate, endDate) {
    let count = 0;
    let current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    while (current <= endDate) {
        if (current.getDate() === giornoDelMese) count++;
        current.setDate(current.getDate() + 1);
    }

    return count;
}

// =======================
// FUNZIONE CONTA INTERVALLO PATCH/FASE (CORRETTA)
// =======================
function contaIntervalloPatch(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (end < start) return { giorniTotali: 0, patchIntere: 0, fasi1: 0, fasi2: 0, giorniResidui: 0 };

    const giorniTotali = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const patchIntere = Math.floor(giorniTotali / durataPatch);
    const giorniResidui = giorniTotali % durataPatch;

    // 1. Creiamo una lista piatta di tutte le singole fasi in ordine cronologico
    let tutteFasi = [];
    tuttePatch.forEach(p => {
        let f1 = new Date(p.inizioFase1); f1.setHours(0, 0, 0, 0);
        let f2 = new Date(p.inizioFase2); f2.setHours(0, 0, 0, 0);
        tutteFasi.push({ tipo: 1, data: f1 });
        tutteFasi.push({ tipo: 2, data: f2 });
    });

    // 2. Troviamo l'indice della fase di inizio (l'ultima fase iniziata prima o lo stesso giorno di 'start')
    let startIndex = 0;
    for (let i = 0; i < tutteFasi.length; i++) {
        if (tutteFasi[i].data <= start) {
            startIndex = i;
        } else {
            break;
        }
    }

    // 3. Troviamo l'indice della fase di fine (l'ultima fase iniziata prima o lo stesso giorno di 'end')
    let endIndex = startIndex;
    for (let i = startIndex; i < tutteFasi.length; i++) {
        if (tutteFasi[i].data <= end) {
            endIndex = i;
        } else {
            break;
        }
    }

    // 4. Contiamo semplicemente quante Fasi 1 e Fasi 2 ci sono in quell'intervallo di indici!
    let fasi1 = 0;
    let fasi2 = 0;
    for (let i = startIndex; i <= endIndex; i++) {
        if (tutteFasi[i].tipo === 1) fasi1++;
        if (tutteFasi[i].tipo === 2) fasi2++;
    }

    return { giorniTotali, patchIntere, fasi1, fasi2, giorniResidui };
}

// =======================
// FUNZIONE AGGIORNA CALCOLO
// =======================
function aggiornaCalcolo() {
    if (window.inCalcolo) return;
    window.inCalcolo = true;

    const dataInizioInput = document.getElementById("dataInizio").value;
    const dataTargetInput = document.getElementById("dataTarget").value;

    if (!dataInizioInput || !dataTargetInput) {
        alert("Inserisci sia la data di inizio che la data di fine.");
        window.inCalcolo = false;
        return;
    }

    const dataInizio = new Date(dataInizioInput);
    dataInizio.setHours(0, 0, 0, 0);
    const dataFine = new Date(dataTargetInput);
    dataFine.setHours(0, 0, 0, 0);

    if (dataFine < dataInizio) {
        alert("La data fine deve essere uguale o successiva alla data inizio.");
        window.inCalcolo = false;
        return;
    }

    localStorage.setItem("dataInizioSalvata", dataInizioInput);
    salvaDataLocale(dataTargetInput);

    const { giorniTotali, patchIntere, fasi1, fasi2, giorniResidui } = contaIntervalloPatch(dataInizio, dataFine);

    document.getElementById("riepilogoPatch").innerHTML = `
        📦 <u>Riepilogo Patch e Fasi:</u><br>
        Patch intere: <b>${patchIntere}</b><br>
        Fasi 1 totali: <b>${fasi1}</b><br>
        Fasi 2 totali: <b>${fasi2}</b><br>
        Giorni totali considerati: <b>${giorniTotali}</b>
    `;

    const statoCheckboxesSalvati = JSON.parse(localStorage.getItem("checkboxStati") || "{}");
    const valoriInputNumberSalvati = JSON.parse(localStorage.getItem("inputNumberValori") || "{}");

    let totalePrimoGenerale = 0;
    let htmlTabella = `
        <table>
            <thead>
                <tr>
                    <th>Fonte</th>
                    <th>Primogem unitario</th>
                    <th>Occorrenze</th>
                    <th>Totale Primogem</th>
                    <th>Destini</th>
                    <th>Input</th>
                    <th>Info</th>
                </tr>
            </thead>
            <tbody>
    `;

    for (const [nome, fonte] of Object.entries(fontiPrimo)) {
        const nomeId = nome.replace(/\s+/g, "_");
        let statoCheckbox = fonte.checkbox ? (statoCheckboxesSalvati["cb_" + nomeId] ?? !!fonte.checkboxInclude) : false;
        let valoreInput = fonte.valore ? (valoriInputNumberSalvati["valore_" + nomeId] ?? "0") : "0";

        if (nome === "Cristalli") {
            let occorrenze = statoCheckbox ? 1 : 0;
            let totalePrimo = 0;
            if (occorrenze > 0) {
                const giorniPassati = Math.floor((dataFine - dataInizio) / (1000 * 60 * 60 * 24));
                const bonusOgni30 = Math.floor(giorniPassati / 30);
                const cristalliPosseduti = parseInt(valoreInput) || 0;
                totalePrimo = cristalliPosseduti + bonusOgni30 * 300;
            }
            totalePrimo = Math.floor(totalePrimo);
            totalePrimoGenerale += totalePrimo;
            const destini = Math.floor(totalePrimo / 160);
            let checkboxHtml = fonte.checkbox ? `<input type="checkbox" id="cb_${nomeId}" ${statoCheckbox ? "checked" : ""}>` : "";
            let inputHtml = `<input type="number" id="valore_${nomeId}" value="${valoreInput}" min="0" style="width:80px;">`;
            const infoHtml = fonte.info || "";

            htmlTabella += `
                <tr>
                    <td>${nome}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${destini}</td>
                    <td>${checkboxHtml} ${inputHtml}</td>
                    <td>${infoHtml}</td>
                </tr>
            `;
            continue;
        }

        if (nome === "Personaggi 4 stelle doppi") {
            const valoreStarglitter = parseFloat(valoreInput) || 0;
            const destiniInizialiStarglitter = statoCheckbox ? Math.floor(valoreStarglitter / 5) : 0;

            let checkboxHtml = fonte.checkbox ? `<input type="checkbox" id="cb_${nomeId}" ${statoCheckbox ? "checked" : ""}>` : "";
            let inputHtml = fonte.valore ? `<input type="number" id="valore_${nomeId}" value="${valoreInput}" min="0" style="width:60px;">` : "";
            const infoHtml = fonte.info || "";

            htmlTabella += `
                <tr>
                    <td>${nome}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${destiniInizialiStarglitter}</td>
                    <td>${checkboxHtml} ${inputHtml}</td>
                    <td>${infoHtml}</td>
                </tr>
            `;
            continue;
        }

        let occorrenze = 0;
        let totalePrimo = 0;

        if (nome === "Primogem extra") {
            // 1. Accesso giornaliero: 20 primo nei giorni 7, 14 e 21 di ogni mese
            const occorrenzeAccesso = Array.isArray([7, 14, 21])
                ? [7, 14, 21].reduce((sum, g) => sum + conteggioPerGiornoMese(g, dataInizio, dataFine), 0)
                : conteggioPerGiornoMese(7, dataInizio, dataFine);
            const primoAccesso = occorrenzeAccesso * 20;

            // 2. Eventi web: basati sulle patch intere (come deciso)
            const occorrenzeEventiWeb = patchIntere;
            const primoEventiWeb = occorrenzeEventiWeb * 60;

            // 3. Extra giornaliero: 1 primogem per ogni giorno totale di simulazione
            const primoGiorniSimulazione = giorniTotali * 1;

            // Somma totale delle Primogem per questa voce
            totalePrimo = primoAccesso + primoEventiWeb + primoGiorniSimulazione;

            // Per le occorrenze totali sommiamo tutto o lasciamo un valore indicativo complessivo
            occorrenze = occorrenzeAccesso + occorrenzeEventiWeb + giorniTotali;

            totalePrimoGenerale += totalePrimo;
            const destini = Math.floor(totalePrimo / 160);
            const infoHtml = fonte.info || "";

            htmlTabella += `
                <tr>
                    <td>${nome}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${totalePrimo}</td>
                    <td>${destini}</td>
                    <td>-</td>
                    <td>${infoHtml}</td>
                </tr>
            `;
            continue;
        } else if (fonte.valore) {
            occorrenze = parseInt(valoreInput) || 0;
        } else if (fonte.frequenza === "daily") {
            occorrenze = giorniTotali;
        } else if (fonte.giornoMese) {
            occorrenze = Array.isArray(fonte.giornoMese)
                ? fonte.giornoMese.reduce((sum, g) => sum + conteggioPerGiornoMese(g, dataInizio, dataFine), 0)
                : conteggioPerGiornoMese(fonte.giornoMese, dataInizio, dataFine);
        } else if (fonte.fase) {
            occorrenze = Array.isArray(fonte.fase)
                ? fonte.fase.reduce((sum, f) => sum + (f === 1 ? fasi1 : fasi2), 0)
                : (fonte.fase === 1 ? fasi1 : fasi2);
        } else if (typeof fonte.frequenza === "number") {
            occorrenze = fonte.frequenza * (patchIntere + (giorniResidui > 0 ? 1 : 0));
        }

        if (fonte.checkbox) {
            if (fonte.info?.toLowerCase().includes("fase") && statoCheckbox && occorrenze > 0) occorrenze--;
            if (fonte.info?.toLowerCase().includes("acquistato") && !statoCheckbox) occorrenze = 0;
        }

        totalePrimo = Math.floor(occorrenze * fonte.primo);
        if (nome === "Missioni Archon") {
            const bonusArchon = Math.floor(occorrenze / 2) * 500;
            totalePrimo += bonusArchon;
        }

        totalePrimoGenerale += totalePrimo;
        const destini = Math.floor(totalePrimo / 160);

        let checkboxHtml = fonte.checkbox ? `<input type="checkbox" id="cb_${nomeId}" ${statoCheckbox ? "checked" : ""}>` : "";
        let inputHtml = fonte.valore ? `<input type="number" id="valore_${nomeId}" value="${valoreInput}" min="0" style="width:60px;">` : "";
        const infoHtml = fonte.info || "";

        htmlTabella += `
            <tr>
                <td>${nome}</td>
                <td>${fonte.primo}</td>
                <td>${occorrenze}</td>
                <td>${totalePrimo}</td>
                <td>${destini}</td>
                <td>${checkboxHtml}${inputHtml}</td>
                <td>${infoHtml}</td>
            </tr>
        `;
    }

    htmlTabella += `</tbody></table>`;
    document.getElementById("risultato").innerHTML = htmlTabella;

    const statoCheckboxes = {};
    const valoriInputNumber = {};
    for (const [nome, fonte] of Object.entries(fontiPrimo)) {
        const nomeId = nome.replace(/\s+/g, "_");
        if (fonte.checkbox) {
            const cb = document.getElementById("cb_" + nomeId);
            if (cb) statoCheckboxes["cb_" + nomeId] = cb.checked;
        }
        if (fonte.valore) {
            const input = document.getElementById("valore_" + nomeId);
            if (input) valoriInputNumber["valore_" + nomeId] = input.value;
        }
    }
    localStorage.setItem("checkboxStati", JSON.stringify(statoCheckboxes));
    localStorage.setItem("inputNumberValori", JSON.stringify(valoriInputNumber));

    const destiniPregressi = parseInt(document.getElementById("destiniPregressi")?.value || "0");
    const pity = parseInt(document.getElementById("pity")?.value || "0");
    const primoExtra = parseInt(document.getElementById("primoExtra")?.value || "0");
    const destiniExtra = parseInt(document.getElementById("destiniExtra")?.value || "0");

    localStorage.setItem("destiniPregressi", destiniPregressi);
    localStorage.setItem("pity", pity);
    localStorage.setItem("primoExtra", primoExtra);
    localStorage.setItem("destiniExtra", destiniExtra);

    // 1. Base F2P: tutto ciò che è stato calcolato finora nella tabella + primogem extra manuali
    let primoF2P = totalePrimoGenerale + primoExtra;

    // 2. Calcolo automatico del valore del Welkin Moon per il periodo selezionato
    // 90 primogem al giorno per ogni giorno totale della simulazione
    let primoWelkinExtra = giorniTotali * 90;

    // 3. Calcolo automatico del valore del Battle Pass per il periodo selezionato
    // 660 primogem per ogni patch intera (o basato sulle fasi, es. 660 a patch)
    let occorrenzeBp = patchIntere + (giorniResidui > 0 ? 1 : 0);
    let primoBPExtra = occorrenzeBp * 660;

    // I 3 totali di Primogem combinati
    let primoWelkin = primoF2P + primoWelkinExtra;
    let primoFull = primoF2P + primoWelkinExtra + primoBPExtra;

    // Gestione personaggi 4 stelle doppi con la tua formula esatta
    const inputDoppi = document.getElementById("valore_Personaggi_4_stelle_doppi");
    const cbDoppi = document.getElementById("cb_Personaggi_4_stelle_doppi");

    let destiniExtraTotali = destiniPregressi + destiniExtra + Math.floor(primoExtra / 160);

    // Destini simulati base per i 3 profili (senza ancora considerare lo Starglitter del box né i 4* doppi)
    let destiniSimulatiF2P = Math.floor(primoF2P / 160) + destiniExtraTotali + pity;
    let destiniSimulatiWelkin = Math.floor(primoWelkin / 160) + destiniExtraTotali + pity;
    let destiniSimulatiFull = Math.floor(primoFull / 160) + destiniExtraTotali + pity;

    let destiniF2P = destiniSimulatiF2P;
    let destiniWelkin = destiniSimulatiWelkin;
    let destiniFull = destiniSimulatiFull;

    if (cbDoppi && cbDoppi.checked) {
        const valoreInserito = parseFloat(inputDoppi?.value || "0");
        if (valoreInserito > 0) {
            // 1. Destini da starglitter (numero nel box / 5)
            const destiniDaStarglitter = Math.floor(valoreInserito / 5);

            // Funzione di supporto che applica i passaggi esatti del tuo esempio
            function applicaCalcoloDoppi(destiniSimulati) {
                // Destini da convertire = destini simulati + destini da starglitter
                const destiniDaConvertire = destiniSimulati + destiniDaStarglitter;

                // Destini da 4* doppi = Math.floor((destini da convertire * 6.4) / 160)
                const destiniDaDoppi = Math.floor((destiniDaConvertire * 6.4) / 160);

                // Totale finale = destini da convertire + destini da 4* doppi
                return destiniDaConvertire + destiniDaDoppi;
            }

            destiniF2P = applicaCalcoloDoppi(destiniSimulatiF2P);
            destiniWelkin = applicaCalcoloDoppi(destiniSimulatiWelkin);
            destiniFull = applicaCalcoloDoppi(destiniSimulatiFull);
        }
    }

    // Stampa a schermo dei tre totali
    document.getElementById("totaleGenerale").innerHTML = `
        <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; margin-top: 10px;">
            <p style="margin: 6px 0;">🌱 <b>TOTALE DESTINI F2P:</b> <span style="color: #4ade80; font-size: 1.15em;">${Math.floor(destiniF2P)}</span></p>
            <p style="margin: 6px 0;">🌙 <b>TOTALE DESTINI WELKIN MOON:</b> <span style="color: #60a5fa; font-size: 1.15em;">${Math.floor(destiniWelkin)}</span></p>
            <p style="margin: 6px 0;">⚔️ <b>TOTALE DESTINI WM + BP:</b> <span style="color: #c084fc; font-size: 1.15em;">${Math.floor(destiniFull)}</span></p>
        </div>
    `;

    attaccaEventListeners();

    document.getElementById("primoExtra")?.addEventListener("input", aggiornaCalcolo);
    document.getElementById("destiniExtra")?.addEventListener("input", aggiornaCalcolo);

    destiniTotaliGlobali = Math.floor(destiniWelkin);

    window.inCalcolo = false;
}

// =======================
// Variabile globale per salvare i risultati dell’ultima simulazione
// =======================
window.simResultsGlobal = [];

// =======================
// Variabile globale per salvare i risultati dell’ultima simulazione
// =======================
window.simResultsGlobal = [];

// --- SIMULAZIONE COMPLETA ---
function simulaPull() {
    const totDestini = destiniTotaliGlobali;
    const targetPersonaggi = parseInt(document.getElementById("simPersonaggi").value);
    const targetArmi = parseInt(document.getElementById("simArmi").value);
    const numSim = parseInt(document.getElementById("numSim").value);
    const primoGarantito = document.getElementById("primoGarantito").checked;

    if (totDestini <= 0) {
        alert("Impossibile simulare: il totale dei destini è 0 o non calcolato.");
        return;
    }

    const softProbPersonaggi = [0.2062, 0.1394, 0.0942, 0.0637, 0.043, 0.0291, 0.0197, 0.0133, 0.009, 0.006, 0.0041, 0.0027, 0.0018, 0.0012, 0.0026];
    const softProbArmi = [0.232, 0.1568, 0.106, 0.0717, 0.0484, 0.0327, 0.0222, 0.015, 0.0101, 0.0068, 0.0046, 0.003, 0.002, 0.0015];

    let successoTot = 0;
    let sommaPersonaggi = 0, sommaArmi = 0;

    const simResults = [];

    for (let sim = 0; sim < numSim; sim++) {
        let destini = totDestini;

        // --- PERSONAGGI ---
        let personaggi = 0, pityPersonaggi50 = 0, pullCountPersonaggi = 0, primoUsato = false;
        let total5starDuringCharPhase = 0;

        while (destini > 0 && personaggi < targetPersonaggi) {
            destini--;
            pullCountPersonaggi++;
            let prob5Star = 0.00485333;
            if (pullCountPersonaggi >= 75 && pullCountPersonaggi <= 89) prob5Star = softProbPersonaggi[pullCountPersonaggi - 75];
            else if (pullCountPersonaggi === 90) prob5Star = 1;

            if (Math.random() < prob5Star) {
                total5starDuringCharPhase++;
                if (primoGarantito && !primoUsato) {
                    personaggi++;
                    primoUsato = true;
                    pityPersonaggi50 = 0;
                } else {
                    if (pityPersonaggi50 === 1 || Math.random() < 0.5) {
                        personaggi++;
                        pityPersonaggi50 = 0;
                    } else pityPersonaggi50 = 1;
                }
                pullCountPersonaggi = 0;
            }
        }
        if (personaggi >= targetPersonaggi) successoTot++;

        const destiniAfterChars = destini;

        // --- ARMI ---
        let armiDetail = [];
        let prossimo5050Garantito = false; // indica se il prossimo 5★ è garantito dopo aver perso un 50/50
        let pullCountArmi = 0;

        while (destini > 0 && armiDetail.filter(a => a.target).length < targetArmi) {
            destini--;
            pullCountArmi++;

            // probabilità 5★ armi
            let prob5StarArmi = 0.004375;
            if (pullCountArmi >= 66 && pullCountArmi <= 79) prob5StarArmi = softProbArmi[pullCountArmi - 66];
            else if (pullCountArmi === 80) prob5StarArmi = 1;

            if (Math.random() < prob5StarArmi) {
                let armaType = "arma"; // default 5★ normale
                let isTarget = false;

                if (prossimo5050Garantito) {
                    // il 5★ successivo dopo un 50/50 perso è garantito
                    isTarget = true;
                    armaType = "armatargetpersa";
                    prossimo5050Garantito = false; // resetta il 50/50
                } else {
                    // nuovo 50/50
                    if (Math.random() < 0.375) {
                        isTarget = true;
                        armaType = "armatargetvinta";
                    } else {
                        isTarget = false; // perso il 50/50
                        armaType = "arma";
                        prossimo5050Garantito = true; // il prossimo 5★ sarà garantito
                    }
                }

                armiDetail.push({ type: armaType, target: isTarget });
                pullCountArmi = 0; // reset pull count per il pity
                pullRimanenti = destini; // aggiorna i pull rimanenti
            }
        }

        sommaPersonaggi += total5starDuringCharPhase;
        sommaArmi += armiDetail.length;

        simResults.push({
            total5starDuringCharPhase,
            destiniAfterChars,
            destiniFinal: destini,
            destiniRimanenti: destini,
            armiDetail,
            pullRimanenti: destini
        });
    }

    window.simResultsGlobal = simResults;

    // Probabilità personaggi
    const percPersonaggi = ((successoTot / numSim) * 100).toFixed(2);

    // Probabilità armi
    const successoArmi = simResults.filter(r => r.armiDetail.filter(a => a.target).length >= targetArmi).length;
    const percArmi = ((successoArmi / numSim) * 100).toFixed(2);

    // Medie
    const mediaPersonaggi = (sommaPersonaggi / numSim).toFixed(2);
    const mediaArmi = (sommaArmi / numSim).toFixed(2);

    document.getElementById("risultatoPersonaggi").innerHTML = `
    <h3>Risultati Generali</h3>
    <p>📊 Probabilità di ottenere ${targetPersonaggi} personaggi 5★: <b>${percPersonaggi}%</b></p>
    <p>📊 Probabilità di ottenere ${targetArmi} armi 5★: <b>${percArmi}%</b></p>
    <p>🧮 Media personaggi 5★ totali: <b>${mediaPersonaggi}</b></p>
    <p>🧮 Media armi 5★ totali: <b>${mediaArmi}</b></p>
`;

    analisiDestiniVS5StarInteractive();
}

// --- MOSTRA ARMI FILTRATE ---
function mostraArmiFiltrate(sims, titolo) {
    if (sims.length === 0) {
        document.getElementById("analisiArmiFiltrate").innerHTML = `<p>Nessuna simulazione in questa classe.</p>`;
        return;
    }

    // Raggruppamento per numero di target raggiunti
    let countsArmi = {};

    for (const r of sims) {
        const targetRaggiunti = r.armiDetail.filter(a => a.target).length;
        const total5Star = r.armiDetail.length;

        if (!countsArmi[targetRaggiunti]) countsArmi[targetRaggiunti] = { sims: 0, sottoclassi: {} };
        countsArmi[targetRaggiunti].sims++;

        if (!countsArmi[targetRaggiunti].sottoclassi[total5Star])
            countsArmi[targetRaggiunti].sottoclassi[total5Star] = 0;

        countsArmi[targetRaggiunti].sottoclassi[total5Star]++;
    }

    const maxTarget = Math.max(...Object.keys(countsArmi).map(k => parseInt(k)));

    let tableHtml = `<h3>${titolo}</h3><table border="1" style="border-collapse:collapse;">
        <thead>
            <tr>
                <th>Target raggiunti</th>
                <th># Simulazioni</th>
                <th>Frequenza %</th>
                <th>#5★ totali pullati</th>
                <th># Simulazioni</th>
                <th>Frequenza %</th>
            </tr>
        </thead>
        <tbody>`;

    for (let k = 0; k <= maxTarget; k++) {
        const obj = countsArmi[k] || { sims: 0, sottoclassi: {} };
        const freqTarget = (obj.sims / sims.length * 100).toFixed(2);
        const sottoclassiKeys = Object.keys(obj.sottoclassi).map(x => parseInt(x)).sort((a, b) => a - b);

        let firstRow = true;
        for (const key of sottoclassiKeys) {
            const subCount = obj.sottoclassi[key];
            const subFreq = ((subCount / obj.sims) * 100).toFixed(2);

            tableHtml += `<tr>
                ${firstRow ? `<td rowspan="${sottoclassiKeys.length}">${k}</td>
                              <td rowspan="${sottoclassiKeys.length}">${obj.sims}</td>
                              <td rowspan="${sottoclassiKeys.length}">${freqTarget}%</td>` : ""}
                <td>${key}</td>
                <td>${subCount}</td>
                <td>${subFreq}%</td>
            </tr>`;

            firstRow = false;
        }

        // Se non ci sono sottoclassi (es. nessun 5★ totale), crea riga vuota
        if (sottoclassiKeys.length === 0) {
            tableHtml += `<tr>
                <td>${k}</td>
                <td>${obj.sims}</td>
                <td>${freqTarget}%</td>
                <td>0</td>
                <td>0</td>
                <td>0%</td>
            </tr>`;
        }
    }

    tableHtml += `</tbody></table>`;

    // --- Calcolo percentili pull rimanenti (solo destini >= 1) ---
    const pullRimanentiArray = sims
        .map(r => r.pullRimanenti)
        .filter(x => x >= 1)
        .sort((a, b) => a - b);

    function percentile(arr, p) {
        if (arr.length === 0) return 0;
        const idx = (p / 100) * (arr.length - 1);
        const lower = Math.floor(idx), upper = Math.ceil(idx);
        if (lower === upper) return arr[lower];
        return arr[lower] + (arr[upper] - arr[lower]) * (idx - lower);
    }

    const perc10 = percentile(pullRimanentiArray, 10);
    const perc25 = percentile(pullRimanentiArray, 25);
    const perc50 = percentile(pullRimanentiArray, 50);
    const perc75 = percentile(pullRimanentiArray, 75);
    const perc90 = percentile(pullRimanentiArray, 90);

    tableHtml += `<p>📊 Destini rimanenti percentili: 10° - <b>${perc10}</b> | 25° - <b>${perc25}</b> | 50° - <b>${perc50}</b> | 75° - <b>${perc75}</b> | 90° - <b>${perc90}</b></p>`;

    document.getElementById("analisiArmiFiltrate").innerHTML = tableHtml;
}

// --- ANALISI DESTINI VS 5★ ---
function analisiDestiniVS5StarInteractive() {
    if (!window.simResultsGlobal || window.simResultsGlobal.length === 0) {
        alert("Prima esegui una simulazione!");
        return;
    }

    const simResults = window.simResultsGlobal;
    const totaleSim = simResults.length;

    // Separiamo i casi con 0 destini
    const zeroDestini = simResults.filter(r => r.destiniAfterChars === 0);
    const conDestini = simResults.filter(r => r.destiniAfterChars > 0);

    const destiniArray = conDestini.map(r => r.destiniAfterChars);
    const minDestini = Math.min(...destiniArray);
    const maxDestini = Math.max(...destiniArray);

    const numClassi = 10;
    const classeSize = Math.ceil((maxDestini - minDestini + 1) / numClassi);

    const classi = [];

    // Prima riga per 0 destini
    if (zeroDestini.length > 0) {
        classi.push({ start: 0, end: 0, sims: zeroDestini, counts5Star: {} });
        for (const r of zeroDestini) {
            const key5 = r.total5starDuringCharPhase;
            classi[0].counts5Star[key5] = (classi[0].counts5Star[key5] || 0) + 1;
        }
    }

    // Classi successive per destini > 0
    for (let i = 0; i < numClassi; i++) {
        const start = minDestini + i * classeSize;
        const end = Math.min(start + classeSize - 1, maxDestini);

        const simsInClasse = conDestini.filter(r => r.destiniAfterChars >= start && r.destiniAfterChars <= end);
        if (simsInClasse.length === 0) continue;

        const counts5Star = {};
        for (const r of simsInClasse) {
            const key5 = r.total5starDuringCharPhase;
            counts5Star[key5] = (counts5Star[key5] || 0) + 1;
        }

        classi.push({ start, end, sims: simsInClasse, counts5Star });
    }

    // --- Calcola le percentuali cumulative (dal basso verso l'alto) ---
    let percentuali = classi.map(c => (c.sims.length / totaleSim * 100));
    let cumulative = [];
    let running = 0;
    for (let i = percentuali.length - 1; i >= 0; i--) {
        running += percentuali[i];
        cumulative[i] = running.toFixed(2);
    }

    // Costruzione HTML
    let html = `<table border="1" style="border-collapse:collapse;"><thead><tr>
        <th>Classe destini rimanenti</th>
        <th># Simulazioni</th>
        <th>% sul totale</th>
        <th>% cumulata</th>
        <th>#5★ usciti</th>
        <th># Sim in sottocategoria</th>
    </tr></thead><tbody>`;

    classi.forEach((c, idx) => {
        const sorted5Star = Object.keys(c.counts5Star).map(k => parseInt(k)).sort((a, b) => a - b);
        let classePrinted = false;

        for (const k of sorted5Star) {
            html += `<tr>`;

            if (!classePrinted) {
                html += `<td rowspan="${sorted5Star.length}" class="clickClasse" data-start="${c.start}" data-end="${c.end}">` +
                    (c.start === 0 && c.end === 0 ? "target 5★ non raggiunto" : `${c.start}-${c.end}`) +
                    `</td>`;
                html += `<td rowspan="${sorted5Star.length}">${c.sims.length}</td>`;
                html += `<td rowspan="${sorted5Star.length}">${percentuali[idx].toFixed(2)}%</td>`;
                html += `<td rowspan="${sorted5Star.length}">${cumulative[idx]}%</td>`; // NEW
                classePrinted = true;
            }
            html += `<td class="clickSottoclasse" data-start="${c.start}" data-end="${c.end}" data-5star="${k}">${k}</td>`;
            html += `<td>${c.counts5Star[k]}</td></tr>`;
        }
    });

    html += `</tbody></table>`;

    const container = document.getElementById("analisiDestini5Star");
    if (container) container.innerHTML = html;
    // Event listener click
    document.querySelectorAll('.clickClasse').forEach(td => {
        td.addEventListener('click', () => {
            const start = parseInt(td.dataset.start);
            const end = parseInt(td.dataset.end);
            filtraArmiPerClasse(start, end);
        });
    });

    document.querySelectorAll('.clickSottoclasse').forEach(td => {
        td.addEventListener('click', () => {
            const start = parseInt(td.dataset.start);
            const end = parseInt(td.dataset.end);
            const stars = parseInt(td.dataset['5star']);
            filtraArmiPerSottoclasse(start, end, stars);
        });
    });
}

function filtraArmiPerClasse(start, end) {
    const sims = window.simResultsGlobal.filter(r => r.destiniAfterChars >= start && r.destiniAfterChars <= end);
    mostraArmiFiltrate(sims, `Classe destini ${start}-${end}`);
}

function filtraArmiPerSottoclasse(start, end, stars) {
    const sims = window.simResultsGlobal.filter(r =>
        r.destiniAfterChars >= start &&
        r.destiniAfterChars <= end &&
        r.total5starDuringCharPhase === stars
    );
    mostraArmiFiltrate(sims, `Classe ${start}-${end} - #5★ ${stars}`);
}
