import { Command } from '../../types';

const config: Command = {
    description: 'Test utility',
    exec: './exec',
    params: [{
        name:'c',
        config: {
            type:'string',
            description: 'Onit config file'
        }
    },
    {
        name:'n',
        config: {
            alias:'no-rebuild',
            type:'boolean',
            description: 'Do not rebuild'
        }
    },
    {
        name:'t',
        config: {
            type:'string',
            description: 'Quick grep override. Replaces the one provided from config file'
        }
    },
    {
        name: 's',
        config: {
            alias: 'suite',
            type:'string',
            description: 'Name of the test suite for direct launch without user interation. Must match the test full name.' 
        } 
    },
    {
        name: 'd',
        config: {
            alias: 'debug',
            type:'boolean',
            description: 'Start node process with --inspect' 
        } 
    },
    {
        name: 'preserve-symlinks',
        config: {
            type:'boolean',
            description: 'Same as node --preserve-symlinks. Valid when launching app with debug flag' 
        } 
    }]
};

export default config;