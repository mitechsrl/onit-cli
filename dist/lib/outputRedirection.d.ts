/**
 * Create a console proxy to write data to a file stream
 * @returns
 */
export declare function setupOutputRedirection(): Promise<void>;
/**
 * Close the write stream to file
 */
export declare function closeOutputRedirection(): void;
