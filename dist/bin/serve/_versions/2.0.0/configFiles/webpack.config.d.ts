import { GenericObject } from '../../../../../types';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
/**
 * Webpack serve config factory.
 * Some values may be changed at runtime (especially entry points and/or mode)
 *
 * @param {*} context: the webpack context path
 * @param {*} config
 * @param {*} packageJson the package.json content (js object) of the project to be webpacke'd.
 */
export declare function webpackConfigFactory(context: string, config: GenericObject, packageJson: GenericObject): Promise<{
    mode: string;
    context: string;
    devtool: string;
    module: {
        rules: ({
            test: RegExp;
            resolve: {
                fullySpecified: boolean;
            };
            use?: undefined;
        } | {
            test: RegExp;
            use: (string | {
                loader: string;
                options: {
                    url: boolean;
                    implementation?: undefined;
                };
            } | {
                loader: string;
                options: {
                    implementation: any;
                    url?: undefined;
                };
            })[];
            resolve?: undefined;
        } | {
            test: RegExp;
            use: {
                loader: string;
                options: {
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
            };
            resolve?: undefined;
        } | {
            test: RegExp;
            use: {
                loader: string;
                options: {
                    name: string;
                };
            }[];
            resolve?: undefined;
        })[];
    };
    optimization: {
        splitChunks: {
            chunks: string;
        };
    } & ({
        minimize: boolean;
        minimizer: (CssMinimizerPlugin<CssMinimizerPlugin.CssNanoOptionsExtended> | TerserPlugin<import("terser").MinifyOptions>)[];
    } | {
        minimize?: undefined;
        minimizer?: undefined;
    });
    entry: any;
    resolve: {
        extensions: string[];
    };
    plugins: any[];
    output: {
        path: string;
        filename: string;
    };
    externals: {
        react: string;
        'react-dom': string;
        moment: string;
        'prop-types': string;
        utility: string;
        d3: string;
        lodash: string;
        jquery: string;
    };
    stats: string;
}>;
