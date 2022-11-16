declare const logger: {
    rawLog: (message: any) => boolean;
    log: (message: string) => void;
    error: (message: any) => void;
    warn: (message: string) => void;
    info: (message: string) => void;
    success: (message: string) => void;
    verbose: (message: string) => void;
    debug: (message: string) => void;
};
export { logger };
