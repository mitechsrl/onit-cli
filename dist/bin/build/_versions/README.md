## Builder versioning

Add a subfolder named with the version here. Then put a index.ts file in it which export as default a function to be called.

The function must follow the signature:

```ts
export default async function build(onitConfigFile: OnitConfigFile, argv: yargs.ArgumentsCamelCase<unknown>): Promise<void> {
}
```