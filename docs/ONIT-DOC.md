## Onit doc

Onit documentation generator tool

### Config file

Il comando **onit doc** richiede la definizione del file **onitdocumentation.config.js**, il quale presenta una struttura come definita:

```js
module.export = {
    ignore: [string], 
    chapters: {
        chapterNumber: chapterConfig
    },
}
```

##### ignore
Array di stringhe, descrive, utilizzando il formato [gitignore](https://git-scm.com/docs/gitignore), la lista dei files/directory da non scansionare per la ricerca di documentazione.

E' vivamente consigliato l'inserimento dei seguenti valori di default: 
```
    [
        './node_modules/**/*',
        './build/**/*',
        './assets/**/*',
        './dist/**/*',
        './dist-fe/**/*',
        './docs/**/*',
        './onit-doc/**/*'
    ]
```

##### chapters
Chapters identifica la lista di capitoli e le loro proprietà

- **chapterNumber**, *string* è un valore del tipo "n", "n1.n2", "n1.n2.n3", ad esempio "1", "1.1", "1.1.1", il quale identifica la numerazione del capitolo.
    La numerazione identifica anche la gerarchia delle voci, settanto la voce "1.2.3" come figlia di "1.2", a sua volta figlia di "1".

- **chapterConfig**, *object* è un oggetto contenente le seguenti proprietà

    ```js
    {
        title: string, // titolo del capitolo
        index: object, // se valorizzato, crea un file di indice per la voce corrente. Le coppie chiave-valore di object verranno inserite nell'header jackill del file index generato senza subire alterazioni. Il file di index viene automaticamente generto se esistono dei fligli della voce corrente (in base a chapterNumber)
        page: object, // se valorizzato, crea un file di pagina per la voce corrente. Le coppie chiave-valore di object verranno inserite nell'header jackill del file generato senza subire alterazioni. Il file page viene automaticamente generato se la scansione del progetto rileva dei frammenti di codice-commento per la rispettiva chapterNumber 
    },
    ```

### Custom tags

Oltre ai tag di [JsDoc](https://jsdoc.app/), sono disponibili alcuni tag aggiuntivi per la definizione della struttura di documentazione proprietaria di Onit.


**@onitTitle**
Definisce il titolo della sezione di commento

```
/**
* @onitTitle this is a title!
*/
```

Aggiungere, subito dopo il tag @onitTitle, uno dei valori **h2, h3, h4** per pilotare la dimensione del titolo.

```
/**
* @onitTitle h3 this is a title!
*/
```
Il default di tale valore è **h2**

**@onitChapter** 
Definisce il capitolo di appartenenza della sezione di commento corrente. Accetta un unico valore, corrispondente ad una chiave come definita in *onitdocumentation.config.js -> chapters*

```
/**
* @onitChapter 1.2.3
*/
```

**@onitPriority**
Definisce l'ordinamento con cui inserire blocchi di codice referenti allo stesso capitolo. Accetta un solo parametro, il valore numerico dell'ordine.

```
/**
* @onitPriority 2000
*/
```

**@onitDoc** 
Definisce l'inizio del blocco di testo contente la documentazione da estrapolare. Il blocco di testo termina quando occorre una delle seguenti ragioni:

- Chiusura del blocco del commento

    ```
    /**
    * @onitDoc 
    * testo
    * testo
    * testo
    */
    ```

- Occorrenza di un tag JSDoc

    ```
    /**
    * @onitDoc 
    * testo estrapolato
    * testo estrapolato
    * @param ...
    * Testo non estrapolato
    */
    ```

##### Immagini
Utiluzzare il classito tag markdown per la gestione delle immagini:

```
![Stormtroopocat](/path/to/image.png)
```

NOTA: il path dell'immagine deve essere relativo al path del file **onitdocumentation.config.[js|json]** utilizzato

##### Riferimenti interni
In relazione all'uso di **@onitDoc**, è possibile inserire in un qualsiasi punto del testo del commento uno dei tag seguenti:

**[@onitChapter n1.n2.n3#Info](for more info)**
Viene risolto con un link verso il capitolo *n1.n2.n3*, con anchor *#Info*. Il testo visualizzato è *for more info*.

**[@onitChapter n1.n2.n3](for more info)**
Viene risolto con un link verso il capitolo *n1.n2.n3*. Il testo visualizzato è *for more info*.

**[@onitChapter n1.n2.n3#Info]**
Viene risolto con un link verso il capitolo *n1.n2.n3*, con anchor *#Info*. Il testo visualizzato è l'url web del capitolo selezionato.

**[@onitChapter n1.n2.n3]**
Viene risolto con un link verso il capitolo *n1.n2.n3*. Il testo visualizzato è l'url web del capitolo selezionato.

##### Include di codic sorgente
Utilizzare il tag 
```
[@onitSrc path transformFunction]
```

Per includere nel punto di chiamata un file esterno rappresentato da **path**. 
**path** deve essere uin path relativo al file in cui si richiede tale inclusione. E' possibile utilizzare un parametero aggiuntivo, **transformFunction** per preprocessare il contenuto del file prima della sua inclusione. Se omesso, il file viene incluso in toto senza alcuna trasformazione.

Esempi di **transformFunction** disponibili:

- **model**: se path rappresenta un file **json** di modello, model ne esegue l'estrazione dei valori delle **properties** e delle **relazioni**

##### Esempio 

**Codice commento**
```
/**
* @onitTitle This is a title
* @onitChapter 1.2.3
* @onitDoc 
* Hello, this is a markdown-formatted comment. If you want to go to chaper 1.2.3, [@onitChapter 1.2.3#hello](click here)
* Some other text
* **i'm bold**
* Use triple backquote for code blocks
*/
```

**onitdocumentation.config.js**

```js
const config = {
    ignore: [
        './node_modules/**/*',
        './build/**/*',
        './onit-doc/**/*',
    ],
    chapters: {
        '1': {
            title: 'Backend',
            index: { nav_order: 1 }
        },
        '1.1': {
            title: 'Database initialization',
        },
        '1.2': {
            title: 'Mailer',
        },
        '2': {
            title: 'Frontend',
            index: { nav_order: 2 }
        },
        '2.1': {
            title: 'React',
            page: {} // automatically added if block codes for this chapter are found
        },
        '2.2': {
            title: 'Render'
        }
    }
}

```

