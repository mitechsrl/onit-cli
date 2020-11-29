# Onit-cli
Onit dev CLI utility

### Installazione
 - Clona questo repository
 - npm install && npm link


# Comandi 

```
onit serve  # utility serve di sviluppo
onit link # utility generazione tags di dipendenza 
onit build # utility build progetto
onit labels # utility gestione lebels
```


### onit serve
Permette il serve del progetto al path attuale. Richiede i files **onitbuild.config.[js|json]** (vedi sezione **onit build**) e **onitrun.config.[js|json]**

##### onitrun.config.[js|json]

Il file contiene una serie di istruzioni per il lancio del progetto in ambiente di sviluppo.

```
{
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

### onit build
Permette il build del progetto e la creazione dei files destinati alla pacchettizzazione tramite npm. Richiede i files **onitbuild.config.[js|json]**

##### onitbuild.config.[js|json]

```

module.exports = {
    dependencies: Array<String>, lista di dipendenze del progetto. Vedi Sezione **dipendenze build**
    export: {
        webpack: Object, configurazione webpack aggiuntiva iniettata da questo componente. Vedi **Export webpack**
    },

    buildTargets: Object, configurazione targets di build. Deve essere definito almeno un build target. Vedi sezione **build target**

};

```

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
        buildExtraSteps: [{
            name: 'myCommand',
            cmd: ['cmd -param1 -param2 -param3],
            cwd: '$_BUILD_DIR'
        }]
    }
}
```


## TODO
**versioning cli**
Legare la versione di onit-cli (oppure del build/serve) al file onitbuild e onitRun (tramite un parametro in questi files)
In questo modo si può specificare quale versione è richiesta dal progetto su cui operare.
