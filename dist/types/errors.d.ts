export declare class StringError extends Error {
}
export declare class NotFoundError extends Error {
}
export declare class ParseError extends Error {
    filename: string;
    constructor(message: string, filename: string);
}
