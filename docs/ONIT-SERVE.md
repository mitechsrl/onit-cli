## Onit serve

Permette il serve del progetto al path attuale. Richiede i files **onitbuild.config.[js|json]** (vedi sezione **onit build**) e **onitserve.config.[js|json]**

##### onitserve.config.[js|json]

Il file contiene una serie di istruzioni per il lancio del progetto in ambiente di sviluppo.

```
{
    "component": boolean, se true avvia il progetto corrente in modalità "component",
    "link": utility helper allo sviluppo per la gestione automatica di npm link,
    "loadComponents": Array<Object>, array di componenti da caricare, dove Object segue la signature definita in loadObject,
    "environment": Object, oggetto iniettato in environment app
}
```

##### Component

Con questa modalità, la directory corrente rappresenta un componente aggiuntivo di mitown, oppure una cartella contenente più componenti mitown. La discriminante utilizzata dal sistema per determinare la modalità da usare risiede nel package.json della directory di lancio del progetto: se esso viene interpretato come il package.json di un componente (tramite la proprietà **mitown** dello stesso) allora il sistema utiizza la modalità **singolo componente** , altrimenti procede con la modalità **multi componente**

**Modalità singolo componente**

Si usa questa modalità quando il componente aggiuntivo è unico e non si necessita di mantenere in sviluppo piu componenti.


La struttura della directory segue quindi:
```
node_modules
index.js <-- entry point del componente
onitserve.config.json
onitbuild.config.json
package.json <-- package.json del componente (integra come dipendenza @mitech/mitown versione dev)

```

Il sistema determina automaticamente i componenti da caricare, lancia *mitown* (che deve essere installato come dipendenza di sviluppo, nella versione mitown-dev) il quale carica in automatico il componente corrente. Con questo flag è possibile omettere del tutto loadComponents nel caso non si voglia caricare ulteriori componenti,


**Modalità multi-componente**

Si usa questa modalità quando occorre sviluppare piu componenti aggiuntivi allo stesso momento. In questa modalità, il sistem **NON** carica in automatico la directory corrente come componente in quanto il file package.json non contiene la proprietà **mitown**


La struttura della directory segue quindi:
```
node_modules
componente1/
   package.json
   onitbuild.config.json
componente2/
   package.json
   onitbuild.config.json
onitserve.config.json

package.json <-- package.json del progetto (integra come dipendenza @mitech/mitown versione dev, ma non la proprietà mitown)

```

In questo caso occorre definire la lista di componenti da caricare tramite la proprietà **loadComponents** del file **onitserve.config.json**. Un esempio di tale configurazione è rappresentata da:

```
"loadComponents": [
    {
        "enabled": true,
        "name": "componente1",
        "path": "./componente1"
    },
    {
        "enabled": true,
        "name": "componente2",
        "path": "./componente2"
    }
]
```

Il sistema determina i componenti da caricare in base alla lista loadComponents a cui aggiunge automaticamente tutti i componenti installati come dipendenza in node_modules. Successivamente lancia *mitown* (che deve essere installato come dipendenza di sviluppo, nella versione mitown-dev) il quale di conseguenza carica la lista di componenti determinata in precedenza.

##### link

```
[
    {
        "link": "something"
    }
]
```

Questo array di oggetti viene utilizzato per verificare la presenza dei moduli citati come symlink locali. Ad esempio, se il componente **something** è presente nella directory **node_modules/something** ma **non è un symlink**, il serve eseguirà il comando **npm link something**. Questo tool è utilizzabile per mitigare la problematica di perdita dei symlink in npm@6 

##### loadObject

```
{
    "enabled": boolean, carica/non caricare il componente
    "name": String, nome del componente da caricare. Deve rappresentare il nome della cartella da cui leggere il rispettivo file package.json
    "path": String, path relativo alla directory di lancio del serve per raggiungere il componente cercato 
}
```

##### Parametri

**-w** Lancia solo il serve di webpack

**-n** Lancia solo il serve dell'app node

**-debug** Avvia l'app node con il flag "--inspect", avviando quindi l'app in modalità debug. Vedi sezione debug.

**-reload** Abbinato a -debug, avvia il processo node con watch&reload.



##### Debug

Per avviare **il solo processo node backend** in debug, aggiungere il flag **-debug** al comando **onit serve**.
Questo causerà l'aggiunta del flag node **--inspect** al processo lanciato da nodemon.

E' possibile lanciare il debug tramite vscode (premendo F5 ad esempio) aggiungendo la configurazione di avvio al file **.vscode/launch.json**

Esempio di launch.json per vscode

```
{
    // Usare IntelliSense per informazioni sui possibili attributi.
    // Al passaggio del mouse vengono visualizzate le descrizioni degli attributi esistenti.
    // Per altre informazioni, visitare: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "node",
            "request": "launch",
            "name": "Avvia programma",
            "skipFiles": [
                "<node_internals>/**"
            ],
            "runtimeExecutable": "onit",
            "runtimeArgs":["serve", "-debug", "-reload]
        }
    ]
}

```
