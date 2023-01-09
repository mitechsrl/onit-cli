# Create command

Commands are automatically generated based on the directory of their config file in the **bin/** folder.

Examples:
- **onit build** runs the configuration at **/bin/build/commandConfig.ts**
- **onit create app** runs the configuration at  **/bin/create/app/commandConfig.ts**
- **onit build -p 1 -c 3 -d 4** runs the configuration at  **/bin/build/commandConfig.ts** with **argv** valorized as ```{p:1,c:3, d:4}```

To create a new command you need to create the directory **/bin/your/command** and add a  **commandConfig.ts** file to it, with the following conent:

```js
import { Command } from '../../types';

// src\types\command.ts
const config: Command = {
    description: 'Some info',
    exec: './exec', // File to be run at command startup. Omit extension. 
    longHelp: 'Some long info to be displayed when using -h',
    params: [] // Array of parameters. See command.ts for info
};

export default config;
```
Create the **exec** file, (which is exec.ts in this case, based on the name defined in the exec property of **commandConfig.ts**)


```js
import yargs from 'yargs';
import { logger } from '../../lib/logger';
import { CommandExecFunction } from '../../types';

const exec: CommandExecFunction = async (argv: yargs.ArgumentsCamelCase<unknown>) => {
    // parameters can be obtained from argv.
    // Add here your implementation 
    logger.warn('Hello!');
};

// You must export the exec fuction as default
export default exec;
```

Run ```npm run build``` to build your changes.

TIP:
Although it is not recommended, i suggest commit the files in **dist** directory.
This just to make life easier for the devs who get the cli from github. Just pull & npm install and you're ready, no need to build.