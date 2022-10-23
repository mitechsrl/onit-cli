export declare function babelConfig(env: string): {
    cacheDirectory: boolean;
    cacheCompression: boolean;
    plugins: (string | (string | {
        removeImport: boolean;
    })[])[];
    presets: ((string | {
        development: boolean;
    })[] | (string | {
        targets: string;
    })[])[];
};
