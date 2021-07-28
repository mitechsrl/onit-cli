# Onit-cli
Onit dev CLI utility

### Installazione da repository git
 - Clona questo repository
 - npm install && npm link

### Installazione da npm
```
npm install -g @mitech/onit-cli
```

# Comandi 

[onit serve](ONIT-SERVE.md)
[onit doc](ONIT-DOC.md)
[onit build](ONIT-BUILD.md)
[onit labels](ONIT-LABELS.md)

```
onit serve # utility serve di sviluppo
onit build # utility build progetto
onit doc #tuility estrazione/generazione documentazione
onit labels # utility gestione lebels
```

### Files di configurazione locali/globali

I comandi **serve** e **build** necessitano di files di configurazione(vedi rispettive sezioni per info).

I files di configurazione possono esssere locali/globali:

- globali: file nominato **onit.config.[js,json]**, contenente configurazioni statiche e/o globali per la funzione richiesta, indipendenti dal sistema, il quale è previsto possa essere posto **in staging git**

- locali: file nominato **onit.config.local.[js,json]**, contenente configurazioni specifiche del sistema corrente, come puntamenti a files esterni al progetto oppure configurazioni locali configurate dallo sviluppatore. Tale file **non è previsto venga messo in staging git**. Usa questo file per aggiungere comandi custom o dipendenti dalla struttura fs locale.

Il sistema legge automaticamente il file **.local** ed esegue un merge della sua configurazione con quella del file **non .local**.


### Windows powershll

Note per windows powershell:

** Esecuzione cmdlet per default**

Lanciando il comando **onit**, powershell esegue per default il comando **onit.cmd** anzichè **onit.ps1** dipendentemente dalla variabile di ambiente di windows **PATHEXT**. Verificare in quella variabile se la dicitura **.ps1** è presente. Deve essere specificata in ordine **prima** di **.cmd**.
