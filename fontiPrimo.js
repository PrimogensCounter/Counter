const fontiPrimo = {
    "Missioni Giornaliere": {
        primo: 60,
        frequenza: "daily",
        info: "10 primo per ogni missione giornaliera + 20 primo",
    },
    "Blessing moon": {
        primo: 90,
        frequenza: "daily",
        checkbox: true,
        checkboxInclude: true,
        info: "Spunta se acquistato"
    },
    "Evento grande": {
        primo: 1240,
        frequenza: 1,
        checkbox: true,
        info: "spunta se l'hai già fatto in questa fase",
        fase: 1,
    },
    "Evento piccolo": {
        primo: 420,
        frequenza: [1, 1],
        checkbox: true,
        info: "spunta se l'hai già fatto in questa fase",
        fase: [1, 2]
    },
    "Teatro immaginario": {
        primo: 800,
        frequenza: 1,
        giornoMese: 1,
        info: "si aggiorna ogni primo del mese",
    },
    "Abisso spirale": {
        primo: 800,
        frequenza: 1,
        giornoMese: 16,
        info: "si aggiorna ogni 16 del mese",
    },
"Stygian Onslaught": {
        primo: 450,
        frequenza: 1,
        fase: 1,
        info: "si attiva 7 giorni dopo l'inizio di una nuova patch",
    },
    "Prova personaggio": {
        primo: 40,
        frequenza: 2,
        fase: [1, 2],
        checkbox: true,
        info: "spunta se l'hai già fatto in questa fase",
    },
    "Evento live": {
        primo: 300,
        frequenza: 1,
        fase: 2,
        checkbox: true,
        info: "spunta se hai già ritirato i premi in questa fase",
    },
    "Manutenzione server": {
        primo: 600,
        frequenza: 1,
        fase: 1,
        checkbox: true,
        info: "spunta se hai già ritirato i premi in questa fase",
    },
    "Battle pass": {
        primo: 660, // 680 per fase 1 e 2
        frequenza: 1,
        checkbox: true,
        checkboxInclude: true,
        info: "Spunta se acquistato",
        fase: [1, 2],
    },
    "Negozio Paimon": {
        primo: 800,
        frequenza: 1,
        giornoMese: 1,
        info: "Si aggiorna ogni primo del mese",
    },
    "Accesso giornaliero": {
        primo: 20,
        frequenza: 1,
        giornoMese: [7, 14, 21],
        info: "Regalano 20 primo il giorno 7, 14 e 21 di ogni mese",
    },
    "Eventi web": {
        primo: 60,
        frequenza: 1,
        info: "Più o meno 1 ogni fase, ma può variare",
    },
    "Esplorazione mondo": {
        primo: 2200,
        valore: true,
        info: "Aggiungi 1 ogni patch con mappa (generalmente ogni 2 o 3 patch)",
    },
    "Missioni Archon": {
        primo: 220,
        valore: true,
        info: "Aggiungi 1 se verranno aggiunte missioni Archon",
    },
    "Missioni del mondo": {
        primo: 200,
        valore: true,
        info: "Generalmente 1 ogni nuova mappa",
    },
    "Missioni personaggio": {
        primo: 160,
        valore: true,
        info: "Generalmente 1 ogni patch, ma può variare",
    },
    "Cristalli": {
        primo: 0, // non serve più un valore fisso
        checkbox: true,
        valore: true, // permette di avere l’input number
        info: "Inserisci i cristalli che possiedi"
    },

    "Personaggi 4 stelle doppi": {
        primo: 6.4,
        valore: true,
        frequenza: 1,
        info: "Inserisci il numero di totale di destini",
    },
}
