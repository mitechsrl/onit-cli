// list of supported providers
export const supportedTranslationProviders = [
    {
        provider:'azure',
        name:'Microsoft Azure translator',
        
        fields: [
        // this is the inquirer config to ask for additional values
            { type:'input', name:'key', message:'Rest api key' },
            { type:'input', name:'location', message:'Cloud service location/area' }
        ]
    },

    {
        provider:'google',
        name:'Google translate',
        fields: [
            // this is the inquirer config to ask for additional values
            { type:'input', name:'projectId', message:'Project id' },
            { type:'input', name:'location', message:'Cloud service location/area' },
            // this is a complex json. Not very nice to enter it as text but i'm not going
            // to ask the user for >10 fields!
            { type:'input', name:'applicationCredentials', message:'Application credentials JSON. Paste here the stringified json:' }
        ]
    }
];