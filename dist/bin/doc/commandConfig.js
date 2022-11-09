"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Documentation generation utility. WARNING: experimental',
    longHelp: 'Generate documentation for the project at current directory',
    exec: './exec',
    params: [{
            name: 'o',
            config: {
                type: 'string',
                description: 'Output path.  Default ./onit-docs'
            }
        },
        {
            name: 'p',
            config: {
                type: 'string',
                description: 'Project path to process. If omitted, defaults to current working directory'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map