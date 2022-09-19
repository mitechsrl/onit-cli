## Onit test

Run project tests

### onit.config.[js|json]

Aggiungi la configurzione di test al file onit.config.[js|json]

```js
{
    test:{

        prova1: { // name of the test set
            // You can add any serve property here, see <onit serve docs>
            environment: {} // Environment variables, same as in serve

            startup: './dist/test/startup.js', // startup stript. 
            beforeTest: './dist/test/beforeTest.js' // beforeTest script
            testFilesDirectories: ['./dist/test/cases/*'], // tests scan directories
            matchNameTag: '.*', // test name matching regex
            shutdown: './dist/test/shutdown.js', // shutdown script
            launchOnit: true // Lancia onit. Default true
            
        }
    
    }
}
```

#### Startup file

Opzionale, questo file viene eseguito subito dopo la selezione del set di test. 
In questo momento non si ha a disposizione una istanza onit, pertanto usa lo script per eseguire setup preliminari, come restore di database o generazione dello stesso.

Il file deve presentare la seguente struttura: 

```ts
import { StartupFunction, TestEnvironment } from '@mitech/onit-dev-tools';
export const startup: StartupFunction = async (): Promise<TestEnvironment> => {
    const testEnv: TestEnvironment = {};
    // cleanDb(); se richiesto
	// loadDbinSomeWay() se richiesto
    return testEnv;
};

```
Il comando serve chiamerà la funzione startup in automatico.



#### beforeTest file

Questo file vie eseguito subito prima il lancio di mocha. In questo momento si ha a disposizione una instanza onit tramite **testEnv.onit**.
L'istanza lbApp è accesibile tramite **testEnv.onit.lbApp**.


Utilizza questo file per eseguire inizializzazioni tramite onit.

Il file deve presentare la seguente struttura: 

```ts
import { BeforeTestFunction, TestEnvironment } from '@mitech/onit-dev-tools';

export const beforeTest: BeforeTestFunction<ExpressServer> = async (testEnv: TestEnvironment<ExpressServer>): Promise<TestEnvironment<ExpressServer>> => {
    
    // do something
    return testEnv;
};
```


#### Shutdown file
Opzionale, questo file viene chiamato dopo la terminazione dei test e dopo la chiusura dell'istanza onit.

Utilizza questo file per eventuale codice di pulizia finale.

Il file deve presentare la seguente struttura: 

```ts
import { ShutdownFunction, TestEnvironment, MochaResult } from '@mitech/onit-dev-tools';

export const shutdown: ShutdownFunction<ExpressServer> = async (testEnv: TestEnvironment<ExpressServer>, mochaResult: MochaResult): Promise<void>=> {
    // console.log('Shutdown');
};
```

#### Test files directories

Array di directories dalle quali caricare i files dei test da eseguire.
I singoli elementi di quetso array seguono il formato [glob](https://www.npmjs.com/package/glob).
Il file dovrebbe avere una struttura di questo tipo:

```ts
// ritorna testEnvironment del file startup. Non è possibile passare dati a mocha, pertanto molto probabilmente
// questo ritorna un valore globale settato in precedenza dallo startup
const testEnvironment = getTestEnvironment<ExpressServer>() 

describe('nomeTest',() => {
	it('should seturn some value #myTag1 #myTag2', async function () {
		const service = await testEnvironment.onit.lbApp.get('services.someName');
		const result = await service.someFunction();
        assert.equal(result, 'expecting this string as result');
    });
})
```

Il motore utilizzarto per eseguire i test è [mocha](https://mochajs.org/).
Per maggiori info, vedi vedi https://loopback.io/doc/en/lb4/Testing-your-application.html


**matchNameTag** 
Il parametro può essere usato per il macth dei test effettivi da eseguire.

La stringa specificata è una regex che deve eseguire match sui tag descritti nella sezione *it* del test.

Il match viene eseguito tramite la funzione [grep](https://mochajs.org/api/mocha#grep) di mocha. Non è possibile inserire un array per piu match, mocha non lo supporta(é possibile però inserire una regex che matcha piu tag).
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

