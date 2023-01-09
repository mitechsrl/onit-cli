## 3.0.0
- BREAKING: **Full rewrite in typescript**. Now the parameter parser engine is [yargs](https://www.npmjs.com/package/yargs), which means some commands might have slightly different parameters now. Single letter params are unchanged, but multi letter params (like "exit") now needs to be called with **double** dashes
- Updated **onit doc** for better output. The custom onit tag now does not have anymore the onit prefix to better fit the naming of jsdoc tags
- Added V3.0.0 serve & build with support to [nextjs](https://nextjs.org/)

## 2.4.0
- Updated **onit doc** command for better comment blocks management. 

## 2.3.0
- Added commands **onit create app**, **onit create service**, **onit create model**, **onit create relation**, **onit create repository**, **onit create service**    

## 2.2.0
- Added command **onit test**

## 2.1.0
- Added ModuleFederationPlugin to frontend webpack config

## 2.0.0
- BREAKING: Changed version management logic. Now using production, uat, beta, test.
- removed the *--max-old-space-size=4096* automatic flag on node process. If you want to use it, set it in the *onit.config.js* file, as *nodeArgs = ['--max-old-space-size=4096']* in the *serve* section

