import { Command } from '../../types';

const config: Command = {
    description: 'Documentation generation utility. WARNING: experimental',
    longHelp: 'Generate documentation for the project at current directory',
    exec: './exec',
    params: [{
        name:'o',
        config: {
            type:'string',
            description: 'Output path.  Default ./onit-docs'
        }
    },
    {
        name:'p',
        config: {
            type:'string',
            description: 'Project path to process. If omitted, defaults to current working directory'
        }
    }]
};

export default config;