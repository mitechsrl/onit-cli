# Onit build

Permette il build del progetto e la creazione dei files destinati alla pacchettizzazione tramite npm.

## onit.config.[js|json]

```js
module.exports = {
    link: [] // array, gestione automatica di npm link,
    export: {
        webpack: {} // Object, configurazione webpack aggiuntiva iniettata da questo componente. Vedi **Export webpack**
    },

    copyFiles: {},
    
    engines: {},

    build:{
        environment: {} // Env variables to be attached to the build process
        version: '' // String, versione (in formato stile npm) del builder richiesto.      
        targets: {} // Object, configurazione targets di build. Deve essere definito almeno un build target. Vedi sezione **build target**
    }
};

```

### Link

Vedi [link in ONIT-SERVE.md](./ONIT-SERVE.md)

### Copy files

Vedi [COPY-FILES.md](COPY-FILES.md) per info su copia files in fase di serve

### Engines

Vedi [ENGINES.md](ENGINES.md) per info engines

#### Export

La sezione export.webpack definisce un oggetto seguente la struttura della configurazione standard di webpack(vedi <https://webpack.js.org/configuration/>) il quale viene mergiato all'interno della configurazione standard di build. In particolare, questo oggetto rappresenta di fatto una configurazione aggiuntiva che il componente dichiara a webpack.

La configurazione tipica esportata rappresenta una voce di alias. In questo modo, il pacchetto di turno può rendere disponibile i propri componenti react  a chiunque voglia usarli eseguendo un import tramite l'alias definito

```js
{
    // this is a standard webpack config json
    resolve: {
        alias: {
            ReactComponents: path.resolve(__dirname, './client/components/react')
        }
    }
}
```

I componenti dipendenti da questo, possono utilizzare il seguente codice per importare componenti react da altri pacchetti

```ts
import component from 'ReactComponents\component.jsx'
```

##### Build version

Indica che il progetto richiede una specifica versione del builder di onit-cli. Se omesso usa l'ultima versione disponibile nella onit-cli, altrimenti risolve la versione utilizzabile tramite le logiche semver. Occorre pertanto fornire una stringa di versione in stile npm.

Vedi <https://semver.org/lang/it/>

##### Build targets

```json
{
    [buildTargetName]: {
        mode: 'production',
        version: {
            propose: true
            additional: {
                name: 'Versione successiva da repository npm',
                cmd: 'npm view "$_PACKAGE_NAME" versions --json'
            }
        },
        beforeSteps: [{
            name: 'myCommand',
            cmd: 'cmd -param1 -param2 -param3',
            cwd: '$_BUILD_DIR'
        }]
        afterSteps: [{
            name: 'myCommand',
            cmd: 'cmd -param1 -param2 -param3',
            cwd: '$_BUILD_DIR'
        }]
    }
}
```

**mode** specifica se la build deve essere uno tra **production**, **uat**, **beta**, **test**.
Production crea una build di rpoduzione, mentre uat, beta, test producono versioni versioni non produzione. I tre tag differiscono solo nelle logiche di versionamento.
Vedi la sezione **version** per info aggiuntive.

**version** abilita la gestione della versione del pacchetto in fase du build. La gestione viene abilitata se **version.propose** valuta true, e in caso affermativo, mostra **prima** del build un menu a selezione che permette all'utente la selezione della versione da applicare prima della compilazione (in questo modo si elimina la necessità di aumentare manualmente la versione in package.json prima o dopo il build).

Nel caso di **production** il menu presenta le seguenti voci:

- Mantieni la versione attuale: non fa nulla.
- Incrementa a X.Y.Z: propone la versione **patch** successiva a quella trovata in package.json. Se selezionata, scrive in automatico la nuova versione in package.json e package-lock.json
- Build precedente a X.Y.Z, incrementa a X.Y.Z': legge, se esiste, il package.json nella directory di build e propone la versione **patch** successiva a quella trovata.

In caso di **uat**, **beta** e **test** le voci presentae sono le stesse ma la versione successiva è calcolata con logica **prerelease** e **beta**. Vedi <https://www.npmjs.com/package/semver>, sezione increment

**additional** rappresenta un comando shell che può essere eseguito per aggiungere una voce di menu alla lista precedente. Il comando deve mandare in output una delle seguenti informazioni:

- singola stringa della versione attuale **NON** incrementata
- singola stringa in formato json della versione attuale **NON** incrementata
- Array json di molteplici versioni **NON** incrementate.

In ogni caso il comando deve ritornaruna o piu informazioni rappresentante la versione base **NON** già incrementata, poichè l'incremento viene calcolato in automatico secondo le logiche interne.

E' possibile specificare una serie di **variabili** che vengono sostituite nei comandi tramite una semplice string replace:

```js
$_PROJECT_DIR // path assoluta del progetto da compilare
$_PACKAGE_NAME // nome del pacchetto come trovato nel package.json del progetto da compilare
$_BUILD_DIR // path assoluta alla cartella di build del progetto
```

Sfruttando queste variabili, è possibile definire il comando additional come **npm view "$_PACKAGE_NAME" versions --json**, il quale verifica la versione pubblicata su repository npm e pertanto la voce di menu aggiuntiva presentata propone la versione successiva all'ultima versione presente nel repository npm.

**afterSteps** rappresenta un array di comandi eseguibili in automatico **DOPO** il termine del build del progetto. La console chiede conferma all'esecuzione dei comandi prima della build, in modo da dare maggiore controllo all'utente sulle operazioni post-build.

Ogni comando deve essere nel formato:

```ts
{
    name: string // nome del comando poposto in console,
    cmd: string|array // comando (o array di comandi) da eseguire. E' possibile usare le variabili definite in precedenza per personalizzare il comando. Se viene passato un array di comandi, essi vengono eseguiti sequanzialmente.
    cwd: string // path di esecuzione del comando. E' possibile usare le variabili per personalizzare il path, ad esempio inserendo **'$_BUILD_DIR'** l'esecuzione avviene nella directory di build
}
```

**beforeSteps**, come **afterSteps** ma esegue i comadi prima della build effettiva.

**.onitbuildignore** può essere utilizzato per ignorare alcuni files dal processo di build (i quali quindi non finiranno nel pacchetto di build). Il formato è simile a **.gitignore** (Vedi <https://git-scm.com/docs/gitignore>)
