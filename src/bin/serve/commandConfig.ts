import { Command } from '../../types';

const config: Command = {

    description: 'Dev Run/serve utility. Lancia il progetto in ambiente di sviluppo',
    exec: './exec',
    params: [
        {
            name: 't',
            config: {
                type:'boolean',
                description:'Run tsc and node only' 
            } 
        },
        {
            name: 'n',
            config: {
                type:'boolean',
                description:'Esegui solo il processo node (Necessita di tsc eseguito almeno una volta)' 
            } 
        },
        {
            name: 'watch',
            config: {
                type:'boolean',
                description:'Abbinato a -t, esegue solo il watch&build senza lanciare node' 
            } 
        },
        {
            name: 'minimize',
            config: {
                type:'boolean',
                description:'Abbinato a -w, esegue build minificata' 
            } 
        },
        {
            name: 'prod',
            config: {
                type:'boolean',
                description:'Abbinato a -w, esegue build con flag production anzichè development' 
            } 
        },
        {
            name: 'exit',
            config: {
                type:'boolean',
                description:'Abbinato a -t esce subito dopo aver terminato tsc' 
            } 
        },
        {
            name: 'dangerouslyenablesmtpserver',
            config: {
                type:'boolean',
                description: 'Enable env EMAIL_SERVER variable' 
            } 
        },
        {
            name: 'w',
            config: {
                type:'boolean',
                description:'Run webpack only' 
            } 
        },
        {
            name: 'watch',
            config: {
                type:'boolean',
                description:'Watch on build' 
            } 
        },
        {
            name: 'c',
            config: {
                description:'Use the specified onit config file',
                type:'string' 
            } 
        },
        {
            name: 'd',
            config: {
                alias: 'debug',
                type:'boolean',
                description: 'Start node process with --inspact' 
            } 
        }
    ]
};

export default config;