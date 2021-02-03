# Onit-cli
Onit dev CLI utility

### Installazione
 - Clona questo repository
 - npm install && npm link


# Comandi 

```
onit serve # utility serve di sviluppo
onit build # utility build progetto
onit link # utility generazione tags di dipendenza 
onit labels # utility gestione lebels
```


### onit serve
Permette il serve del progetto al path attuale. Richiede i files **onitbuild.config.[js|json]** (vedi sezione **onit build**) e **onitserve.config.[js|json]**

##### onitserve.config.[js|json]

Il file contiene una serie di istruzioni per il lancio del progetto in ambiente di sviluppo.

```
{
    "component": boolean, se true avvia il progetto corrente in modalità "component", ovvero il progetto corrente deve rappresentare un componente aggiuntivo di mitown. Il sistema determina automaticamente i componenti da caricare, lancia *mitown* (che deve essere installato come dipendenza di sviluppo, nella versione mitown-dev) il quale carica in automatico il componente corrente. Con questo flag è possibile omettere del tutto loadComponents nel caso non si voglia caricare ulteriori componenti,
    "loadComponents": Array<Object>, array di componenti da caricare, dove Object segue la signature definita in loadObject,
    "environment": Object, oggetto iniettato in environment app
}
```

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
**-debug** Avvia l'app node con il flag "--inspect", avviando quindi l'app in modalità debug



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
            "runtimeArgs":["serve", "-debug"]
        }
    ]
}

```

### onit build
Permette il build del progetto e la creazione dei files destinati alla pacchettizzazione tramite npm. Richiede i files **onitbuild.config.[js|json]**

##### onitbuild.config.[js|json]

```

module.exports = {
    builderVersion: String, versione (in formato stile npm) del builder richiesto. 
    dependencies: Array<String>, lista di dipendenze del progetto. Vedi Sezione **dipendenze build**
    export: {
        webpack: Object, configurazione webpack aggiuntiva iniettata da questo componente. Vedi **Export webpack**
    },

    buildTargets: Object, configurazione targets di build. Deve essere definito almeno un build target. Vedi sezione **build target**

};

```
##### builderVersion
Indica che il progetto richiede una specifica versione del builder di onit-cli. Se omesso usa l'ultima versione disponibile nella onit-cli, altrimenti risolve la versione utilizzabile tramite le logiche semver. Occorre pertanto fornire una stringa di versione in stile npm.

Vedi https://semver.org/lang/it/

##### Dipendenze build
Le dipendenze di build sono definite dalla proprietà **dependencies: Array<String>**.

L'array di dipendenze contiene la lista di nomi dei moduli da cui ottenere informazioni aggiuntive necessarie per il build. Ogni elemento di questo array deve essere definito in base a:

- Link cartella componente: Se in precedenza era stato creato un tag tramite **onit link**, il primo tentativo di risoluzione verifica se la stringa inserita è presente come tag link. In caso affermativo, il componente alla directory rappresentata dal tag viene utilizzato, in caso contrario viene eseguita una ricerca per cartella come descritto nel punto successivo.

- Nome cartella componente: la stringa "myComponent" causa la ricerca della cartella "myComponent" dal path corrente "in su". In particolare, il processo di build tenta la ricerca del modulo voluto in './myComponent', '../myComponent', '../../myComponent', '../../../myComponent' e così via.

In caso nessuna ricerca vada a buon fine, il build viene interrotto.

##### Export webpack

La sezione export.webpack definisce un oggetto seguente la struttura della configurazione standard di webpack(vedi https://webpack.js.org/configuration/) il quale viene mergiato all'interno della configurazione standard di build. In particolare, questo oggetto rappresenta di fatto una configurazione aggiuntiva che il componente dichiara a webpack.

La configurazione tipica esportata rappresenta una voce di alias. In questo modo, il pacchetto di turno può rendere disponibile i propri componenti react  a chiunque voglia usarli eseguendo un import tramite l'alias definito

```
{
    // this is a standard webpack config json
    resolve: {
        alias: {
            MitownReactComponents: path.resolve(__dirname, './client/components/react')
        }
    }
}
```

I componenti dipendenti da questo, possono utilizzare il seguente codice per importare componenti react da altri pacchetti

```
import component from 'MitownReactComponents\component.jsx'
```

##### Build targets

```
{
    [buildTargetName]: {
        mode: 'production',
        version: {
            propose: true
            additional: {
                name: 'Versione successiva da repository npm',
                cmd: 'npm view "$_PACKAGE_NAME" version'
            }
        },
        buildExtraSteps: [{
            name: 'myCommand',
            cmd: 'cmd -param1 -param2 -param3',
            cwd: '$_BUILD_DIR'
        }]
    }
}
```

**mode** specifica se la build deve essere **production** oppure **development**. Le logiche di build nei due casi sono le stesse, ma le logiche di versionamento sono diverse, in particolare con **development** il sistema propone un versionamento più dinamico che non interferisce con le versioni di produzione già pubblicate. Vedi la sezione **version** per info aggiuntive.

**version** abilita la gestione della versione del pacchetto in fase du build. La gestione viene abilitata se **version.propose** valuta true, e in caso affermativo, mostra **prima** del build un menu a selezione che permette all'utente la selezione della versione da applicare prima della compilazione (in questo modo si elimina la necessità di aumentare manualmente la versione in package.json prima o dopo il build).

Nel caso di **production** il menu presenta le seguenti voci:

- Mantieni la versione attuale: non fa nulla.
- Incrementa a X.Y.Z: propone la versione **patch** successiva a quella trovata in package.json. Se selezionata, scrive in automatico la nuova versione in package.json e package-lock.json
- Build precedente a X.Y.Z, incrementa a X.Y.Z': legge, se esiste, il package.json nella directory di build e propone la versione **patch** successiva a quella trovata.

In caso di **development**, le voci presentae sono le stesse ma la versione successiva è calcolata con logica **prerelease** e **beta**. Vedi https://www.npmjs.com/package/semver, sezione increment

**additional** rappresenta un comando shell che può essere eseguito per aggiungere una voce di menu alla lista precedente. Il comando deve ritornare una stringa rappresentante la versione base **NON** già incrementata, poichè l'incremento viene calcolato in automatico secondo le logiche interne. 

E' possibile specificare una serie di **variabili** che vengono sostituite nei comandi tramite una semplice string replace:

```
$_PROJECT_DIR: path assoluta del progetto da compilare
$_PACKAGE_NAME: nome del pacchetto come trovato nel package.json del progetto da compilare
$_BUILD_DIR: path assoluta alla cartella di build del progetto
```
Sfruttando queste variabili, è possibile definire il comando additional come **npm view "$_PACKAGE_NAME" version**, il quale verifica la versione pubblicata su repository npm e pertanto la voce di menu aggiuntiva presentata propone la versione successiva all'ultima versione presente nel repository npm.

**buildExtraSteps** rappresenta un array di comandi eseguibili in automatico **DOPO** il termine del build del progetto. La console chiede conferma all'esecuzione dei comandi prima della build, in modo da dare maggiore controllo all'utente sulle operazioni post-build.

Ogni comando deve essere nel formato:

```
{
    name: string, nome del comando poposto in console,
    cmd: string, comando essettivo eseguito. E' possibile usare le variabili definite in precedenza per personalizzare il comando
    cwd: string, path di esecuzione del comando. E' possibile usare le variabili per personalizzare il path, ad esempio inserendo **'$_BUILD_DIR'** l'esecuzione avviene nella directory di build
}
```

**.onitbuildignore** può essere utilizzato per ignorare alcuni files dal processo di build (i quali quindi non finiranno nel pacchetto di build). Il formato è simile a **.gitignore** (Vedi https://git-scm.com/docs/gitignore)

### onit link
Utility per la gestione di tags di dipendenza.
Similmente a **npm link**, eseguendo **onit link** all'interno di una directory rapresentante un pacchetto npm (quindi con package.json), memorizza nel sistema una coppia **<packageName, projectPath>**, la quale permette poi l'uso di **packageName** come stringa di dipendenza in **onitBuild.package.[js|json]/dependencies**. Il sistema in fase di build utilizzerà quindi le definizioni opportune trovate in **projectPath** per compilare il progetto attuale.

**onit link list** mostra la lsta di links memorizzati, **onit link delete** elimina un tag precedentemente creato 


### onit labels
TODO


