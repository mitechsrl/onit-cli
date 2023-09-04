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
            name: 'b',
            config: {
                type:'boolean',
                description:'Run backends dev builds and serve the node app. Same as -t, but renamed for better comprehension' 
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
                description:'Used with -t or -w, exit after the fuirs successfull build' 
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
                description:'Run webpack only. The app will not be launched' 
            } 
        },
        {
            name: 'f',
            config: {
                type:'boolean',
                description:'Run frontend dev builds only. Same as -w, but renamed for better comprehension' 
            } 
        },
        {
            name: 'watch',
            config: {
                type:'boolean',
                description:'Used with -t or -w, just watch and rebuild without launching the app' 
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
                description: 'Start node process with --inspect' 
            } 
        },
        {
            name: 'preserve-symlinks',
            config: {
                type:'boolean',
                description: 'Same as node --preserve-symlinks. Valid when launching app with debug flag' 
            } 
        }
    ]
};

export default config;