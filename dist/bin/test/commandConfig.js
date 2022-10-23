"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Test utility',
    exec: './exec',
    params: [{
            name: 'c',
            config: {
                type: 'string',
                description: 'Onit config file'
            }
        },
        {
            name: 'n',
            config: {
                alias: 'no-rebuild',
                type: 'boolean',
                description: 'Do not rebuild'
            }
        },
        {
            name: 't',
            config: {
                type: 'string',
                description: 'Quick grep override. Replaces the one provided from config file'
            }
        }]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map