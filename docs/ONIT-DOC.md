[IT](./ONIT-DOC-IT.md), [EN](./ONIT-DOC.md)

# Onit doc

Onit documentation generator tool.

The onit documentation ecosystem is based on [tsdoc](https://tsdoc.org/), [jsdoc](https://jsdoc.app/).
The **onit doc** tool uses industry standard libraries to find and process process jsdoc comment blocks in the reference project, then build a series of markdown files which can be converted to html with jekill.


See the **examples** section for more into

## Config file

The **onit doc** command needs a **onitdocumentation.config.js** config file, which describes a structure like the following one:

```js
module.export = {
    ignore: [string],
    chapters: [chapter],
}
```

#### ignore
String array, describes the files/directories which must not be processed. The lines must follows the [gitignore](https://git-scm.com/docs/gitignore) format.

The default ignore includes
```
./node_modules/**/*
./dist/**/*
./dist-fe/**/*
```

You also should include your documentation outpuit directory to avoid output files to be processed again.

#### chapters
Chapters defines a nested tree which describes the chapter structure, properties and children.
A single *chapter* object is an object defined as follows:

```js
chapter = {
    title: string, // REQUIRED, chapter title
    chapter: string // REQUIRED, chaper label, used to link a block comment to this specific object,
    index: object, // OPTIONAL, if defined, create a index file for the current object. This is a key-value object whose properties-values are added to jeckill index file without alterations. The index file is automaically added if this object includes the children property.
    page: object, // OPTIONAL, if defined, create a page file for the current object.  This is a key-value object whose properties-values are added to jeckill index file without alterations. The page file is automatically added if the project scan finds comment blocks matching this object chapter label. 
    children: [chapter] // OPTIONAL, Array of children chapters definitions. 
}
```

## Custom jsdoc tags
This tool implements some custom jsdoc tags that you can use toghjeter with [JsDoc](https://jsdoc.app/) ones: 

**@title**
Defines the block comment title

```js
/**
* @title this is a title!
* @title # This is a h1 title
* @title ## This is a h2 title
* @title ### This is a h3 title
* @title #### This is a h4 title
*/
```
You can use '#' to define the 'hX' of the title as defined by [markdown](https://www.markdownguide.org/basic-syntax/). The default is h2.

**@chapter** 
Defines the chapter label of the current commen block. It accepts a string value which must match one of the *onitdocumentation.config.js -> chapters* defined chapter labels.

```js
/**
* @chapter label
*/
```

**@priority**
Defines the sorting priority of this comment block when more comment blocks match the same chapter label. It accept a single integer value.

```js
/**
* @priority 2000
*/
```

**@summary** 
Defines the comment block main text. This tag is optional in case you just start with the main documentation after opening a comment block. 
If you use other tags before the main text, you needs to instruct jsdoc where this block will start.

#### Images
You can use standard markdown syntax to define images:

```
![Stormtroopocat](../relative/path/to/image.png)
```

The path image must be relative to the file including the image tag.

#### Internal references
You can insert internal referneces to your main text (**@summary**), which will be resolved to hypertext links to navigate into the documentation

**[@link chapterLabel#Info](for more info)**
Resolved with a link to the *chapterLabel* page, to *#info* anchor. The displayed text is *for more info*.

**[@link chapterLabel](for more info)**
Resolved with a link to the *chapterLabel* page. The displayed text is *for more info*.

**[@link chapterLabel#Info]**
Resolved with a link to the *chapterLabel* page, to *#info* anchor. The displayed text is the destination webpage url.

**[@link chapterLabel]**
Resolved with a link to the *chapterLabel* page. The displayed text is the destination webpage url.

#### Include file with preprocess
Using the tag
```
[@src path transformFunction]
```
You can include the source code of **path** file.
**path** must be relative to the file using the @src tag. You can use a **transformFunction** parameter, which will process the source code before adding the result to the current comment block. By default, the transform function will include the source code without any modification as standard markdown code block.

Available **transformFunction**:

- **lb4model**: 
    Process the file to extract lb4 model properties, then output a structured, human-readable model documentation,

- **lb4repository**
    Process the file to exract repository properties and methods, then output a structured, human-readable model documentation.

- **includeFullFile**
    Include the file source code without any changes.


#### Processed files

```
*.md, *.ts
```

NOTE: **.md** files are processed like a single comment block. Use a single **@chapter** for markdown file.

#### Examples

**Comment block**
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
    baseUrl: '/onit-docs', // optional, if set it must start with '/'
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


