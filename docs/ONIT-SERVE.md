# Onit serve

Permette il serve del progetto al path attuale.

## onit.config.[js|json]

Il file contiene una serie di istruzioni per il lancio del progetto in ambiente di sviluppo.

```js
{
    component: true //boolean, se true avvia il progetto corrente in modalità "component",
    link: [],// utility helper allo sviluppo per la gestione automatica di npm link,
    copyFiles: {} // copia files arbitrari
    engines: {} // engines config
    serve: {
        nodeArgs: ['string'], // Array of node arguments to be passed o the served subprocess
        environment: {} // Env variables to be attached to the served process
        main: "./path/to/js", // string, main js file to launch
        componentsScanDirs: ['string'] // directories to be scanned for components
        'pm2-dev-ecosystem': [] // Array of pm2 app definitions. Launches them at serve, closes themon exit
        checkPackageLockPotentialConflicts: true // prints potential @mitech packages warnings
    },
    
}
```

### Component

Con questa modalità, la directory corrente rappresenta un componente aggiuntivo di onit.
In caso component sia settato a true, il serve avvia onit direttamente dalle dipendenze in node_modules.
Nel caso sia settato a false, si assume che la cartella corrente contenga onit, pertanto il sistema lancia direttamente il file js iniziale di onit.

### link

:warning: Deprecato e rimosso con serve V3

```json
[
    {
        "link": "something",
        "target":"Some path"
    }
]
```

Questo array di oggetti viene utilizzato per verificare la presenza dei moduli citati come symlink locali. Ad esempio, se il componente **something** è presente nella directory **node_modules/something** ma **non è un symlink**, il serve eseguirà il comando **npm link something**. Questo tool è utilizzabile per mitigare la problematica di perdita dei symlink in npm@6

Se **target** è specificato, viene creato un symlink alla directory specificata. Se il target specificato è un path relativo, esso deve essere relativo al file *.onit.js in cui è definito. é possibile utilizzare path assoluti.
Questo permette di avere diverse versioni in uso dello stesso pacchetto in diversi progetti (occorre clonare piu volte lo stesso progetto in path diversi e gestire da se le versioni)

### Copy files

Vedi [COPY-FILES.md](COPY-FILES.md) per info su copia files in fase di serve

### Engines

Vedi [ENGINES.md](ENGINES.md) per info engines

### serve.environment

Oggetto strutturato come

```js
{
    propertyName1: someValue1,
    propertyName2: someValue2,
    propertyName3: someValue3,
}
```

Questo oggetto viene iniettato automaticamente nel **process.env** dell'istanza di onit lanciata.
**someValue** può essere di qualsiasi tipo, gli ogetti nel caso vengono stringificati prima di essere passati nel process.env (Process.env suporta dolo stringhe)

### serve.pm2-dev-ecosystem

Array di app pm2. Vedi [pm2 ecosystem](https://pm2.keymetrics.io/docs/usage/application-declaration/) per maggiorni info.

Al serve, onit-cli lancia in automatico le app specificate in questo array.

Le app vengono chiuse al termine di onit-cli.

### Parametri

**-w** Lancia solo il serve di webpack

**-n** Lancia solo il serve dell'app node

**--debug** Avvia l'app node con il flag "--inspect", avviando quindi l'app in modalità debug. Vedi sezione debug.

**--reload** Abbinato a --debug, avvia il processo node con watch&reload.

**--dangerouslyenablesmtpserver** Abilita la variabile di ambiente SMTP_SERVER, in caso contrario non viene inserita nell'environment. Questo è un flag per assicurarsi che nessuna mail venga mai inviata in sviluppo.

**--exit** esce dopo la build iniziale

### Debug

Per avviare **il solo processo node backend** in debug, aggiungere il flag **-debug** al comando **onit serve**.
Questo causerà l'aggiunta del flag node **--inspect** al processo lanciato da nodemon.

E' possibile lanciare il debug tramite vscode (premendo F5 ad esempio) aggiungendo la configurazione di avvio al file **.vscode/launch.json**

Esempio di launch.json per vscode

```json
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

## Versioni

### 2.X

TODO

### 3.X

Vedi [V3 README](..\\src\\bin\\serve\\_versions\\3.0.0\\README.md)

### 4.X

Vedi [V4 README](..\\src\\bin\\serve\\_versions\\4.0.0\\README.md)
