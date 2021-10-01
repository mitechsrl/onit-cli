## Onit serve

Permette il serve del progetto al path attuale.

##### onit.config.[js|json]

Il file contiene una serie di istruzioni per il lancio del progetto in ambiente di sviluppo.

```
{
    "component": boolean, se true avvia il progetto corrente in modalità "component",
    "link": utility helper allo sviluppo per la gestione automatica di npm link,
    serve:{
        "environment": Object, oggetto iniettato in environment app
    }
}
```

##### Component

Con questa modalità, la directory corrente rappresenta un componente aggiuntivo di mitown.
In caso component sia settato a true, il serve avvia onit direttamente dalle dipendenze in node_modules.
Nel caso sia settato a false, si assume che la cartella corrente contenga onit, pertanto il sistema lancia direttamente il file js iniziale di onit.

##### link

```
[
    {
        "link": "something",
        "target":"Absolutepath"
    }
]
```

Questo array di oggetti viene utilizzato per verificare la presenza dei moduli citati come symlink locali. Ad esempio, se il componente **something** è presente nella directory **node_modules/something** ma **non è un symlink**, il serve eseguirà il comando **npm link something**. Questo tool è utilizzabile per mitigare la problematica di perdita dei symlink in npm@6 

Se **target** è specificato, viene creato un symlink alla directory specificata. Il target è un path assoluto. Questo permette di avere diverse versioni in uso dello stesso pacchetto in diversi progetti (occorre clonare piu volte lo stesso progetto in path diversi e gestire da se le versioni)
##### Environment

Oggetto strutturato come 
```
{
    propertyName1: someValue1,
    propertyName2: someValue2,
    propertyName3: someValue3,
}
```

Questo oggetto viene iniettato automaticamente nel **process.env** dell'istanza di onit lanciata.
**someValue** può essere di qualsiasi tipo, gli ogetti nel caso vengono stringificati prima di essere passati nel process.env (Process.env suporta dolo stringhe) 

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
