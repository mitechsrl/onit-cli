export declare const npmExecutable: string;
export declare const npxExecutable: string;
/**
 * Check for newer versions and show a info in the console
 * This is just for a reminder, doesn't do anything else.
 * Check is performed once a day
 */
export declare function npmVersionCheck(): Promise<void>;
