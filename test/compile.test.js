
'use strict'

const assert = require('assert')
const {promisify} = require('util')
const fs = require('fs.extra')

const tscWrapper = require('..')

const mkdir = promisify(fs.mkdir)
const rmrf = promisify(fs.rmrf)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

describe('compile', () => {

  beforeEach(() => mkdir('./test/out'))

  afterEach(() => rmrf('./test/out'))

  it('should reject if the config file doesnt exist', async () => {
    let result = null
    let error = null

    try {
      result = await tscWrapper('./test/fixtures/noooope.json')
    } catch (err) {
      error = err
    }

    assert.equal(result, null)
    assert.equal(error.code, 'ENOENT')
  })

  it('should reject file problems with config', async () => {
    let result = null
    let error = null

    try {
      result = await tscWrapper('./test/fixtures/tsconfig-bad-json.json')
    } catch (err) {
      error = err
    }

    assert.equal(result, null)
    assert.equal(error.messageText, 'Failed to parse file \'./test/fixtures/tsconfig-bad-json.json\': Unexpected end of JSON input.')
  })

  it('should reject with errors if tsc blows up', async function () {
    let result = null
    let error = null
    this.slow(2000)

    try {
      result = await tscWrapper('./test/fixtures/tsconfig-invalid.json')
    } catch (err) {
      error = err
    }

    assert.equal(result, null)
    assert(error.length > 0)
  })

  it('should take the happy path quite nicely', async function () {
    this.slow(2000)

    await tscWrapper('./test/fixtures/tsconfig-valid.json')

    const result = await readFile('./test/out/good.js')
    assert(result.indexOf('comment') > -1)
    assert(result.indexOf('sourceMappingURL') > -1)

    const sourcemap = await stat('./test/out/good.js.map')
    assert(sourcemap)
  })

})
