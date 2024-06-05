# Engines

Onit-cli support multiple engines for the onit projects. Yoou must define which engine need to be executed when serving or building the project.

Add the **engines** property to your **onit.config.js** file with the following structure:

```json
{
    "engines": {
        "backend": {
            "lb4": true
        },
        "frontend": {
            "onit-webpack": true,
            "nextjs": true
        }
    }
}

```

## Backend engines

Defines the server-side app engine.

Available: **lb4**

Default: **lb4:true**

## Frontend engines

Defines the frontend engines.

Available: **onit-webpack**, **nextjs**

Default: **onit-webpack:true**
