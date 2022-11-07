"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    description: 'Dev Run/serve utility. Lancia il progetto in ambiente di sviluppo',
    exec: './exec',
    params: [
        {
            name: 't',
            config: {
                type: 'boolean',
                description: 'Esegui tsc e node'
            }
        },
        {
            name: 'n',
            config: {
                type: 'boolean',
                description: 'Esegui solo il processo node (Necessita di tsc eseguito almeno una volta)'
            }
        },
        {
            name: 'watch',
            config: {
                type: 'boolean',
                description: 'Abbinato a -t, esegue solo il watch&build senza lanciare node'
            }
        },
        {
            name: 'minimize',
            config: {
                type: 'boolean',
                description: 'Abbinato a -w, esegue build minificata'
            }
        },
        {
            name: 'prod',
            config: {
                type: 'boolean',
                description: 'Abbinato a -w, esegue build con flag production anzichè development'
            }
        },
        {
            name: 'exit',
            config: {
                type: 'boolean',
                description: 'Abbinato a -t esce subito dopo aver terminato tsc'
            }
        },
        {
            name: 'dangerouslyenablesmtpserver',
            config: {
                type: 'boolean',
                description: 'Abilita env EMAIL_SERVER. Usa con cautela'
            }
        },
        {
            name: 'w',
            config: {
                type: 'boolean',
                description: 'Esegui solo webpack'
            }
        },
        {
            name: 'c',
            config: {
                description: 'Utilizza il file di serve specificato',
                type: 'string'
            }
        },
        {
            name: 'd',
            config: {
                alias: 'debug',
                type: 'boolean',
                description: 'Avvia il processo node con il flag --inspact'
            }
        }
    ]
};
exports.default = config;
//# sourceMappingURL=commandConfig.js.map