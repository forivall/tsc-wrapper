# TypeScript Compile Wrapper

A utility to compile typescript files from code instead of using tsc

Most of this is taken verbatim from the following:
https://github.com/Microsoft/TypeScript/wiki/Using-the-Compiler-API

This functionality isn't exposed with a single function call, so here it is.

## Requirements

* Node4+

## Usage

This module exports a single function that accepts the following parameters:

* fileName - needs to point to the tsconfig.json file - from `process.cwd`
* isProd - when true: deletes inlineSourceMap and sourceRoot from config and sets removeComments to true

It returns a promise that will reject if:

* there are errors with the concfig file
* there are compile errors
* other errors (i.e. permissions outputting files)

If it resolves, you should have generated typescript files (according to your tsconfig options)

## Example

```js
const tscWrapper = require('tsc-wrapper')
const fileName = './tsconfig.json'
const isProd = process.env.NODE_ENV === 'production'
tscWrapper(fileName, isProd)
  .then(() => console.log('compile successful!'))
  .catch((e) => console.error('compile returned errors', e))
```
