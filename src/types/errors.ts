export class StringError extends Error { }

export class NotFoundError extends Error{ }

export class ParseError extends Error{
    public filename:string;
    constructor(message:string, filename:string){
        super(message);
        this.filename = filename;
    }
}
