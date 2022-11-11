[IT](./ONIT-DOC-IT.md), [EN](./ONIT-DOC.md)

# Onit doc

Strumento generazione documentazione onit

L'ecosistema di documentazione onit è basato su standard come [tsdoc](https://tsdoc.org/) e [jsdoc](https://jsdoc.app/).
Lo strumento **onit doc** utilizza librerie standard per trovare e processare i blocchi commento nel progetto corrente, dopodichè produce una serie di files markdown che possono essere convertiti in html con strumenti come jekill.


## File di configurazione

Il comando **onit doc** richiede la definizione del file **onitdocumentation.config.js**, il quale presenta una struttura come definita:

```js
module.export = {
    ignore: [string],
    chapters: [chapter],
}
```

#### ignore
Array di stringhe, descrive, utilizzando il formato [gitignore](https://git-scm.com/docs/gitignore), la lista dei files/directory da non scansionare per la ricerca di documentazione.

La lista ignore di default include le seguenti righe
```
./node_modules/**/*
./dist/**/*
./dist-fe/**/*
```

E' vivamente consigliato inserire nella lista ignore la directory di output della documentazione, per evitare il riprocessamento dei files generati.

#### chapters
Chapters definisce un albero che identifica la lista di capitoli, i loro figli e le loro proprietà. 
*chapter* è un oggetto contenente le seguenti proprietà:

```js
chapter = {
    title: string, // REQUIRED, titolo del capitolo
    chapter: string // REQUIRED, label utilizzata per indirizzare i blocchi dei commenti,
    index: object, // OPTIONAL, se valorizzato, crea un file di indice per la voce corrente. Le coppie chiave-valore di object verranno inserite nell'header jackill del file index generato senza subire alterazioni. Il file di index viene automaticamente generto se esistono dei fligli della voce corrente (in base a children)
    page: object, // OPTIONAL, se valorizzato, crea un file di pagina per la voce corrente. Le coppie chiave-valore di object verranno inserite nell'header jackill del file generato senza subire alterazioni. Il file page viene automaticamente generato se la scansione del progetto rileva dei frammenti di codice-commento per la rispettiva label 
    children: [chapter] // OPTIONAL, eventuali chapter figli
}
```

## Custom tags

Oltre ai tag di [JsDoc](https://jsdoc.app/), sono disponibili alcuni tag aggiuntivi per la definizione della struttura di documentazione proprietaria di Onit.


**@title**
Definisce il titolo della sezione di commento

```js
/**
* @title this is a title!
*/
```

E' possibile definire la dimensione del titolo con uno o più #: #=h1, ##=h2, ###=h3 e così via.
```js
/**
* @title ### this is a title!
*/
```
Il default di tale valore è **h2**

**@chapter** 
Definisce il capitolo di appartenenza della sezione di commento corrente. Accetta un unico valore, corrispondente ad una label chapter come definita in *onitdocumentation.config.js -> chapters*

```js
/**
* @chapter label
*/
```

**@priority**
Definisce l'ordinamento con cui inserire blocchi di codice referenti allo stesso capitolo. Accetta un solo parametro, il valore numerico dell'ordine.

```js
/**
* @priority 2000
*/
```

**@summary** 
Definisce l'inizio del blocco di testo contente la documentazione da estrapolare.
Il tag è opzionale se il testo del summary è la prima entità all'interno del blocco commento. Nel caso come prima entità vengano inseriti diversi altri tags, allora per **iniziare** il blocco del summary è necessario l'uso del tag

**@prop** 
Come @param, ma targetizzato alla documentazione di props react.

#### Immagini
Utiluzzare il classito tag markdown per la gestione delle immagini:

```
![Stormtroopocat](/path/to/image.png)
```

Il path dell'immagine deve essere relativo al path del file in cui si va a inserire il commento.

#### Riferimenti interni
In relazione all'uso di **@summary**, è possibile inserire in un qualsiasi punto del testo del commento uno dei tag seguenti:

**[@link chapterLabel#Info](for more info)**
Viene risolto con un link verso il capitolo *chapterLabel*, con anchor *#Info*. Il testo visualizzato è *for more info*.

**[@link chapterLabel](for more info)**
Viene risolto con un link verso il capitolo *chapterLabel*. Il testo visualizzato è *for more info*.

**[@link chapterLabel#Info]**
Viene risolto con un link verso il capitolo *chapterLabel*, con anchor *#Info*. Il testo visualizzato è l'url web del capitolo selezionato.

**[@link chapterLabel]**
Viene risolto con un link verso il capitolo *chapterLabel*. Il testo visualizzato è l'url web del capitolo selezionato.

#### Include di codice sorgente
Utilizzare il tag 
```
[@src path transformFunction]
```

Per includere nel punto di chiamata un file esterno rappresentato da **path**. 
**path** deve essere uin path relativo al file in cui si richiede tale inclusione. E' possibile utilizzare un parametero aggiuntivo, **transformFunction** per preprocessare il contenuto del file prima della sua inclusione. Se omesso, il file viene incluso in toto senza alcuna trasformazione.

Esempi di **transformFunction** disponibili:

- **lb4model**: 
    Processa il file indicato ed esrapola le proprietà del modello con relativi commenti, producendo una pagina di documentazione human-readable.

- **lb4repository**
    Processa il file indicato ed estapola le definizioni dei metodi/proprietà con relativi commenti, producendo una pagina di documentazione human-readable.

- **includeFullFile**
    Include il codice sorgente del file indicato

NOTA: la risoluzione delle inclusioni è ricorsiva, pertanto soggetta a dipendenza ciclica.
  
#### Files processati

*.md, *.ts

NOTA: I files .md vengono processati come un unico blocco commento. Utilizzare un unico @chapter per file markdown.

#### Esempio 

**Codice commento**
```
/**
* @title This is a title
* @chapter LABEL
* @summary 
* Hello, this is a markdown-formatted comment. If you want to go to chaper 1.2.3, [@chapter 1.2.3#hello](click here)
* Some other text
* **i'm bold**
* Use triple backquote for code blocks
*/
```

**onitdocumentation.config.js**
Example config

```js
const config = {
    ignore: [
        './node_modules/**/*',
        './build/**/*',
        './onit-doc/**/*',
    ],
    chapters: [

        {
            chapter:'LABEL1', 
            title:'title', 
            children: [
                {chapter:'LABEL2', title:'title'}
            ]
        },
        {
            chapter:'LABEL3', 
            title:'title', 
            index: { nav_order: 1 }
            children: [
                {chapter:'LABEL4', title:'title'}
            ]
        }
    ]
}

```


