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
    }]
};

export default config;