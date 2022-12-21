## Onit test

Run project tests

### onit.config.[js|json]


Il file onit.config.js definisce una nuova sezione "test" nel quale contiene la configurazione da lanciare al comando **onit test**:


```js

	test: {
		"nomeSet":{ 
		
			// Si possono inserire qui i parametri del serve, per configurare il lancio di onit.
			"environment":{} // environment onit
			
			// parametri specifici del test
			"startup":"someFile.js",
			"beforeTest":"someFile2.js"
			"testFilesDirectories":["./src/test/cases", "../../onit-next/dist/test/cases"], // array di stirng 
			"shutdown":"pathToFile.js"
			"launchOnit":true,
			// Inserire le proprietà come voluto da mocha. Vedi lista di proprietà: https://mochajs.org/api/mocha,
			// Vengono passate direttamente a mocha. Vedi "Proprietà specifiche mocha" per info.
			"grep":"*", // https://mochajs.org/api/mocha#grep
			"timeout": "10s", //https://mochajs.org/api/mocha#timeout
		}
	}
```

**NomeSet** definisce cosa caricare per l'esecuzione del test. In fase di avvio, onit-cli chiede quale set utilizzare sulla falsariga di onit build.
1. Viene lanciato, se esiste, file di startup, che ha il compito di preparare l'ambiente per i test successivi (prima del lanciodi onit)
2. Opzionalmene, viene lanciato onit con la configurazione environment specificata,
3. Viene lanciato, se esiste, file beforeTest, che ha il compito di preparare l'ambiente per i test successivi. (dopo il lancio di onit)
4. Vengono lanciati i test di tutti i files puntati dall'array testFilesDirectories.
5. Viene lanciato, se esiste, il file shutdown con codice da eseguire in chiusura dei test

Ogni pacchetto dovrebbe definire i propri test, ma può richiamare files js da altri pacchetti.

Esempio: onit-prodocu non ha particolare codice da testare ad ora, ma può essere usato come entry point per i test. Esso definisce le fasi e quali test eseguire riferendosi a files js di altri pacchetti (onit-material-certificates ad esempio)


### File startup

Il file startup implementa una parte dell'avvio della fase. Viene chiamato **prima** dell'avvio di onit, pertanto NON si ha a disposizione una istanza onit per interazioni.
Usa questo file per eseguire eventuali inizializzazioni del database che devono essere eseguite prima dell'avvio di onit (ad esempio restore di dump).

La struttura del file è la seguente:

:warning: IV 20-09-2022: dovrò verificare se esiste soluzione, ma in questo file non usare **ExpressServer** come tipo di **startupFunction** come accade per gli altri files.
Questo perchè causa un caricamento pregresso di alcuni files di onit che mandano in errore il comando (al momento in cui vengono caricati non c'è ancora environment pronto)

```ts
import { cloneMongoDb, StartupFunction, TestEnvironment, checkMongoDbsAvailable } from '@mitech/onit-dev-tools';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const startup: StartupFunction<any> = async (testEnv: TestEnvironment<any>): Promise<TestEnvironment<any>>=> {
	// deleteMongodb(...); se richiesto
	// cloneMongoDb(...); se richiesto
}
```
	
	
### File beforeTest

Il file startup implementa una parte dell'avvio della fase. Viene chiamato DOPO l'avvio di onit, pertanto si ha a disposizione una istanza onit per interazioni.
L'ecosistema di test onit dovrebbe fornire una serie di funzioni per facilitare la scrittura di questo codice, come ad esempio la pulizia del database o la funzione di avvio onit
Potrebbe esistere quindi un pacchetto **@mitech/onit-test-engine** che mantiene queste funzioni (o in alternativa, aggiungerle al pacchetto **@mitech/onit-dev-tools** che esiste già)

NOTA: la ipotetica funzione helper di avvio onit deve lanciare onit con environment definito nel set. Deve anche ritornare l'istanza dell'applicazione per poter poi successivamente accedere direttamente a repo/controller/services


```ts
import { ExpressServer } from '@loopback/rest';
import { BeforeTestFunction, TestEnvironment } from '@mitech/onit-dev-tools';

export const beforeTest: BeforeTestFunction<ExpressServer> = async (testEnv: TestEnvironment<ExpressServer>): Promise<TestEnvironment<ExpressServer>>=> {
	// cleanDb(); se richiesto
	// loadDbinSomeWay() se richiesto
}
```

### File shutdown

Il file viene eseguito in coda ai test per eventuale codice di terminazione:

```ts
import { ShutdownFunction, TestEnvironment, MochaResult, deleteMongoDb } from '@mitech/onit-dev-tools';
import { ExpressServer } from '../server';

export const shutdown: ShutdownFunction<ExpressServer> = async (testEnv: TestEnvironment<ExpressServer>, mochaResult: MochaResult): Promise<void>=> {
	// cleanDb(); se richiesto
	// shutdownOnit(testEnvironment.onit) // se richiesto
}
```


### testFilesDirectories
Array di directories dalle quali caricare i files dei test da eseguire.

I singoli elementi di quetso array seguono il formato glob: https://www.npmjs.com/package/glob
Il file dovrebbe avere una struttura di questo tipo:

```ts
// ritorna testEnvironment del file startup. Non è possibile passare dati a mocha, pertanto molto probabilmente
// questo ritorna un valore globale settato in precedenza dallo startup
const testEnvironment = getTestEnvironment<ExpressServer>() 

describe('nomeTest',() => {
	
	it('should seturn some value #myTag1 #myTag2', async function () {
		const service = await testEnvironment.onit.get('services.someName');
		const result = await service.someFunction();
        assert.equal(result, 'expecting this string as result');
    });
	
}) // 
```

In questo modo, alla funzione viene passata l'istanza corrente di onit che può essere usata per chiamare le funzioni su repository/service/controller, indipendentemente da quale sia la sorgente dell'istanza stessa.

### LaunchOnit

Valore booleano, definisce se avviare o meno onit. Default true.

Utile per esecuzione unit test indipendenti da runtime.

### Proprietà specifiche mocha

All'interno del json di configurazione è possibile inserire qualsiasi proprietà attesa da mocha.

Vedi api mocha https://mochajs.org/api/mocha per lista completa.

Alcuni parametri degni di nota:

**grep** ([Vedi doc mocha](https://mochajs.org/api/mocha#grep+))

Il parametro può essere usato per il macth dei test effettivi da eseguire.
In questo modo si può decidere quali dei test caricati vengono effettivamente eseguiti. Il filtro avviene tramite match dei tag specificati nei singoli test, sotto la funzione "it".
Non è possibile inserire un array per piu match, mocha non lo supporta(é possibile però inserire una regex che matcha piu tag)
Questo parametro deve essere una stringa o una regex. Se omesso, non viene applicato alcun filtro pertanto vengono eseguiti tutti i test.

Esempio: dati i nomi
  "Funzione che ritorna xyz #a.a"
  "Funzione che ritorna xyz #a.b"
  "Funzione che ritorna xyz #a.b.c"
  "Funzione che ritorna xyz #b.c"
  "Funzione che ritorna xyz #b.c.d"
  
La funzione grep accetta in input una regex, pertanto:
- specificando ".\*" si vanno ad eseguire tutti i test
- con "a.\+" si eseguono i test per nomi **a, a.b, a.b.c** e così via.
  
Vedi grep per info: 

**timeout** ([Vedi doc mocha](https://mochajs.org/api/mocha#timeout))

Timeout run test. I test che non terminano entro questo timeout vengono considerati falliti.
