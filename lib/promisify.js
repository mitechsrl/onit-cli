
/*************************************************************************
*
* Copyright (C) 2019 - Mitech srl
* __________________
*
* NOTICE:  All information contained in this file is, and remains
* property of Mitech srl.
* The intellectual and technical concepts contained herein are proprietary to
* Mitech Srl.
* Dissemination of this information or reproduction of this material
* is strictly forbidden unless prior written permission is obtained
* from Mitech srl.
*
***************************************************************************/

'use strict';

/*
  Costruisce una promise al di sopra di una funzione asincrona con gestione callback
  object: Oggetto contenente la funzione
  memberFunction: Nome della funzione membro
  onlyResolve: forza l'uso del solo resolve
*/

module.exports = {

    /* build a promise around a standard callback style function, where the callback must be the last
    parameter of the original function.

    object: object containing the function
    memberFunction: the string representing the name of member function
    onlyResolve: If false(default) errors of original callback function are thrown by rejecting the promise.
                 If true, make the promise do only resolve even in case of error. In this case
                 the resolved data is a js object with two fields: error, result.
                 error is set only on case of original callback error, result is set only in case
                 of original callback success.
                 onlyResolve = true is designed to be used when this promise is managed among others with Promise.all
    */

    promisify: function (object, memberFunction, onlyResolve = false) {
        return (...args) => {
            return new Promise((resolve, reject) => {
                object[memberFunction](...args, (error, result) => {
                    if (onlyResolve) {
                        if (error) resolve({ error: error });
                        else resolve({ result: result });
                        return;
                    }

                    if (error) reject(error);
                    else resolve(result);
                });
            });
        };
    },

    /**
     * build a promise who will resolve to an empty array, regardless of passed arguments
     * FIXME: deprecated, use Promise.resolve()

    emptyResolvingPromise: function () {
        return (...args) => new Promise((resolve, reject) => resolve([]));
    },
    */

    /* Run a bunch of max N promises in parallel. When a promise perform a resolve, another promise is picked from the promise list and executed.
    This process stop when all the promises have resolved and then all the results are returned via a promise.

    In short terms, works like a Promise.all with a max of N concurrent running promises

    promiseArray:  the list of functions who return promises to be run.
                   QUESTION: wtf is a function who return a promise?
                   ANSWER: if we do promiseArray.push(new promise...), the promise is run instantly (when the promise is created)
                           we need to do promiseArray.push( function(){ return new promise...}) so we can 'delay' the promise creation (and execution)
                           when we need it.
    parallelCount: the maximum count of parallel promises permitted. Setting this to 1 will run the promises sequentially.
    */
    parallelize: function (arrayOfFunctionReturningPromises, parallelCount) {
        return new Promise(resolve => {
            if (arrayOfFunctionReturningPromises.length === 0) {
                return resolve([]);
            }

            let promiseIndex = 0;
            const c = Math.min(arrayOfFunctionReturningPromises.length, parallelCount);
            let countdown = c;
            const results = [];

            // when a chain finish this is the callback to be executed.
            // It resolve if no more chain are running.
            const oneChainFinished = function () {
                countdown--;
                if (countdown === 0) {
                    resolve(results);
                }
            };

            // grab a promise from the promises array
            const nextPromise = function () {
                if (promiseIndex >= arrayOfFunctionReturningPromises.length) { return null; }
                promiseIndex++;
                return { index: promiseIndex - 1, promise: arrayOfFunctionReturningPromises[promiseIndex - 1] };
            };

            // create C running chain of promises. Every time a promise resolve, another one is rabbed from the input array and executed

            for (var i = 0; i < c; i++) {
                const p = nextPromise();
                p.promise(p.index).then(async result => {
                    results[p.index] = result;
                    while (true) {
                        const p = nextPromise();
                        if (p == null) {
                            break;
                        }
                        const result = await p.promise(p.index);
                        results[p.index] = result;
                    }
                    // no more promises to be run. This chain stops here
                    oneChainFinished();
                });
            }
        });
    }
};
