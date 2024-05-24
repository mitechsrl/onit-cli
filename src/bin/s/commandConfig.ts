import { Command } from '../../types';
import { default as serveConfig } from '../serve/commandConfig';

const config: Command = {

    description: 'Short version of "serve" for lazy people.',
    exec: './exec',
    params: serveConfig.params
};

export default config;