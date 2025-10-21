// =======================
// COSTANTI PATCH E DATE
// =======================
const patchInizio = new Date("2025-07-30T00:00:00"); // inizio 5.8
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

window.addEventListener("load", () => {
    // Data inizio = sempre oggi
    const oggi = new Date();
    const formatted = oggi.toISOString().split('T')[0]; // formato YYYY-MM-DD
    const dataInizio = document.getElementById("dataInizio");
    if (dataInizio) {
        dataInizio.value = formatted;
    }

    // Data fine = caricata da localStorage (se esiste)
    caricaDataLocale();

    // Carica il resto
    generaTabellaPatch();
    caricaDestiniEPityDaLocale();
    aggiornaCalcolo();
    caricaStatiDaLocale();
});

// =======================
// GENERA TUTTE LE PATCH PRECALCOLATE
// =======================
let tuttePatch = []; // array di oggetti {nome, inizioFase1, inizioFase2}

function generaTuttePatch() {
    let major = 5;
    let minor = 8;
    let data = new Date(patchInizio);

    for (let i = 0; i < numPatchPrecalcolate; i++) {
        tuttePatch.push({
            nome: `${major}.${minor}`,
            inizioFase1: new Date(data),
            inizioFase2: new Date(data.getTime() + 21 * 24 * 60 * 60 * 1000)
        });

        // passa alla patch successiva
        if (minor === 8) { 
            major += 1;
            minor = 0;
        } else {
            minor += 1;
        }

        data = new Date(data.getTime() + msPerPatch);
    }
}

// Chiamiamo subito questa funzione all'avvio
generaTuttePatch();

// =======================
// GENERA TABELLA PATCH (4 patch per riga)
// =======================
function generaTabellaPatch() {
    const tbody = document.querySelector("#tabellaPatch tbody");
    tbody.innerHTML = "";

    const oggi = new Date();
    oggi.setHours(0,0,0,0);

    const idxInizio = tuttePatch.findIndex(p => oggi >= p.inizioFase1 && oggi < new Date(p.inizioFase1.getTime() + durataPatch*24*60*60*1000));
    const startIdx = idxInizio >= 0 ? idxInizio : 0;

    const patchDaMostrare = tuttePatch.slice(startIdx, startIdx + 8); // mostra massimo 8 patch

    const rowCount = Math.ceil(patchDaMostrare.length / 4);
    const colsPerRow = 4;

    // Intestazioni
    const thead = document.querySelector("#tabellaPatch thead");
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

    // Genera righe
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
    current.setHours(0,0,0,0);

    while (current <= endDate) {
        if (current.getDate() === giornoDelMese) count++;
        current.setDate(current.getDate() + 1);
    }

    return count;
}

// =======================
// FUNZIONE CONTA INTERVALLO PATCH/FASE
// =======================
function contaIntervalloPatch(startDate, endDate) {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(endDate);
    end.setHours(0, 0, 0, 0);

    if (end < start) return { giorniTotali: 0, patchIntere: 0, fasi1: 0, fasi2: 0 };

    const giorniTotali = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    const patchIntere = Math.floor(giorniTotali / durataPatch);
    const giorniResidui = giorniTotali % durataPatch;

    // Conta quante fasi 1 e 2 sono attive nel periodo
    let fasi1 = 0, fasi2 = 0;
    tuttePatch.forEach(p => {
        if (!(end < p.inizioFase1 || start > new Date(p.inizioFase1.getTime() + 20 * 24 * 60 * 60 * 1000))) fasi1++;
        if (!(end < p.inizioFase2 || start > new Date(p.inizioFase2.getTime() + 20 * 24 * 60 * 60 * 1000))) fasi2++;
    });

    return { giorniTotali, patchIntere, fasi1, fasi2, giorniResidui };
}

// =======================
// FUNZIONE AGGIORNA CALCOLO (AGGIORNATA)
// =======================
function aggiornaCalcolo() {
    const dataInizioInput = document.getElementById("dataInizio").value;
    const dataTargetInput = document.getElementById("dataTarget").value;

    if (!dataInizioInput || !dataTargetInput) {
        alert("Inserisci sia la data di inizio che la data di fine.");
        return;
    }

    const dataInizio = new Date(dataInizioInput);
    dataInizio.setHours(0, 0, 0, 0);

    const dataFine = new Date(dataTargetInput);
    dataFine.setHours(0, 0, 0, 0);

    if (dataFine < dataInizio) {
        alert("La data fine deve essere uguale o successiva alla data inizio.");
        return;
    }

    // Salvataggio locale
    localStorage.setItem("dataInizioSalvata", dataInizioInput);
    salvaDataLocale(dataTargetInput);

    // Funzione helper aggiornata: calcola giorni totali e patch/fasi
    const { giorniTotali, patchIntere, fasi1, fasi2, giorniResidui } = contaIntervalloPatch(dataInizio, dataFine);

    // Aggiorna riepilogo
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

    // =======================
    // Date Fase 1 e Evento Ultimo Attivo
    // =======================
    const dateFasi1 = [];
    for (let i = 0; i <= patchIntere; i++) {
        const giornoFase1 = new Date(tuttePatch[0].inizioFase1.getTime() + i * msPerPatch);
        giornoFase1.setHours(0, 0, 0, 0);
        if (giornoFase1 <= dataTarget) {
            dateFasi1.push(giornoFase1);
        }
    }

    const eventoUltimoAttivo = dateFasi1.filter(dataFase1 => {
        const fineValidita = new Date(dataFase1.getTime() + 7 * 24 * 60 * 60 * 1000);
        return dataInizio < fineValidita;
    }).length;

    for (const [nome, fonte] of Object.entries(fontiPrimo)) {
        const nomeId = nome.replace(/\s+/g, "_");
        let statoCheckbox = fonte.checkbox ? (statoCheckboxesSalvati["cb_" + nomeId] ?? !!fonte.checkboxInclude) : false;
        let valoreInput = fonte.valore ? (valoriInputNumberSalvati["valore_" + nomeId] ?? "0") : "0";

        // Cristalli
        if (nome === "Cristalli") {
            let occorrenze = statoCheckbox ? 1 : 0;
            let totalePrimo = 0;
            if (occorrenze > 0) {
                const giorniPassati = Math.floor((dataFine - dataInizio) / (1000 * 60 * 60 * 24));
                const bonusOgni30 = Math.floor(giorniPassati / 30);

                // valore inserito dall’utente
                const cristalliPosseduti = parseInt(valoreInput) || 0;

                totalePrimo = cristalliPosseduti + bonusOgni30 * 300;
            }
            totalePrimoGenerale += totalePrimo;
            const destini = Math.floor(totalePrimo / 160);

            // HTML per checkbox + input
            let checkboxHtml = fonte.checkbox ? `<input type="checkbox" id="cb_${nomeId}" ${statoCheckbox ? "checked" : ""}>` : "";
            let inputHtml = `<input type="number" id="valore_${nomeId}" value="${valoreInput}" min="0" style="width:80px;">`;
            const infoHtml = fonte.info || "";

            htmlTabella += `
        <tr>
            <td>${nome}</td>
            <td>-</td>
            <td>${occorrenze}</td>
            <td>${totalePrimo}</td>
            <td>${destini}</td>
            <td>${checkboxHtml}</td>
            <td>${inputHtml} ${infoHtml}</td>
        </tr>
    `;
            continue;
        }

        // Altri casi
        let occorrenze = 0;
        if (fonte.valore) {
            occorrenze = parseInt(valoreInput) || 0;
        } else if (fonte.frequenza === "daily") {
            occorrenze = giorniTotali;
        } else if (fonte.giornoMese) {
            occorrenze = Array.isArray(fonte.giornoMese)
                ? fonte.giornoMese.reduce((sum, g) => sum + conteggioPerGiornoMese(g, dataInizio, dataFine), 0)
                : conteggioPerGiornoMese(fonte.giornoMese, dataInizio, dataFine);        } else if (fonte.fase) {
            occorrenze = Array.isArray(fonte.fase)
                ? fonte.fase.reduce((sum,f) => sum + (f===1?fasi1:fasi2),0)
                : (fonte.fase===1?fasi1:fasi2);
        } else if (typeof fonte.frequenza === "number") {
            occorrenze = fonte.frequenza * (patchIntere + (giorniResidui>0?1:0));
        }

        // Missioni del mondo
        if (nome==="Missioni del mondo") {
            const inputExplorazione = document.getElementById("valore_Esplorazione_mondo");
            if(inputExplorazione){
                occorrenze = parseInt(inputExplorazione.value||"0");
                const inputMissioniMondo = document.getElementById("valore_"+nomeId);
                if(inputMissioniMondo) inputMissioniMondo.value = occorrenze;
            }
        }

        // Checkbox generici
        if(fonte.checkbox){
            if(fonte.info?.toLowerCase().includes("fase") && statoCheckbox && occorrenze>0) occorrenze--;
            if(fonte.info?.toLowerCase().includes("acquistato") && !statoCheckbox) occorrenze=0;
        }

        let totalePrimo = occorrenze * fonte.primo;

// 🔹 Bonus extra per Missioni Archon
if (nome === "Missioni Archon") {
    const bonusArchon = Math.floor(occorrenze / 2) * 500;
    totalePrimo += bonusArchon;
}
        totalePrimoGenerale += totalePrimo;
        const destini = Math.floor(totalePrimo / 160);

        let checkboxHtml = fonte.checkbox ? `<input type="checkbox" id="cb_${nomeId}" ${statoCheckbox?"checked":""}>` : "";
        if(fonte.valore){
            checkboxHtml += `<input type="number" id="valore_${nomeId}" value="${valoreInput}" min="0" style="width:60px;" ${nome==="Missioni del mondo"?"disabled":""}>`;
        }

        const infoHtml = fonte.info || "";

        htmlTabella += `
            <tr>
                <td>${nome}</td>
                <td>${fonte.primo}</td>
                <td>${occorrenze}</td>
                <td>${totalePrimo}</td>
                <td>${destini}</td>
                <td>${checkboxHtml}</td>
                <td>${infoHtml}</td>
            </tr>
        `;
    }

    htmlTabella += `</tbody></table>`;
    document.getElementById("risultato").innerHTML = htmlTabella;

    // Salvataggio locali
    const statoCheckboxes = {};
    const valoriInputNumber = {};
    for (const [nome, fonte] of Object.entries(fontiPrimo)) {
        const nomeId = nome.replace(/\s+/g,"_");
        if(fonte.checkbox){
            const cb = document.getElementById("cb_"+nomeId);
            if(cb) statoCheckboxes["cb_"+nomeId] = cb.checked;
        }
        if(fonte.valore){
            const input = document.getElementById("valore_"+nomeId);
            if(input) valoriInputNumber["valore_"+nomeId] = input.value;
        }
    }
    localStorage.setItem("checkboxStati", JSON.stringify(statoCheckboxes));
    localStorage.setItem("inputNumberValori", JSON.stringify(valoriInputNumber));

    const destiniPregressi = parseInt(document.getElementById("destiniPregressi")?.value || "0");
    const pity = parseInt(document.getElementById("pity")?.value || "0");

    // NUOVI INPUT
    const primoExtra = parseInt(document.getElementById("primoExtra")?.value || "0");
    const destiniExtra = parseInt(document.getElementById("destiniExtra")?.value || "0");

    // salvataggio locale
    localStorage.setItem("destiniPregressi", destiniPregressi);
    localStorage.setItem("pity", pity);
    localStorage.setItem("primoExtra", primoExtra);
    localStorage.setItem("destiniExtra", destiniExtra);

    // calcoli finali
    const totalePrimoFinale = totalePrimoGenerale + primoExtra;
    const destiniBase = Math.floor(totalePrimoFinale / 160);
    const destiniTotali = destiniBase + destiniPregressi + pity + destiniExtra;

    document.getElementById("totaleGenerale").innerHTML = `
    <p>
    🔮 <b>Totale Primogem:</b> ${totalePrimoFinale} &nbsp;&nbsp; | 
    <b>Destini Calcolati:</b> ${destiniBase} &nbsp;&nbsp; | 
    <b>+ Pregressi:</b> ${destiniPregressi} &nbsp;&nbsp; | 
    <b>+ Pity:</b> ${pity} &nbsp;&nbsp; | 
    <b>+ Extra:</b> ${destiniExtra} &nbsp;&nbsp; ⇒ 
    <b>Totale Finali:</b> ${destiniTotali}
    </p>
`;


    attaccaEventListeners();
    // Assicura che gli input extra facciano ricalcolare subito
    document.getElementById("primoExtra")?.addEventListener("input", aggiornaCalcolo);
    document.getElementById("destiniExtra")?.addEventListener("input", aggiornaCalcolo);

    destiniTotaliGlobali = destiniTotali;
}

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
                    if (Math.random() < 0.5) {
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

