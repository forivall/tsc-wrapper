
'use strict'

const assert = require('assert')
const tscWrapper = require('..')
const fs = require('fs.extra')

describe('compile', () => {

  beforeEach((cb) => {
    fs.mkdir('./test/out', cb)
  })

  afterEach((cb) => {
    fs.rmrf('./test/out', cb)
  })

  it('should reject if the config file doesnt exist', () => {
    return tscWrapper('./test/fixtures/noooope.json')
      .then(() => { throw new Error('expected resolution') })
      .catch((e) => { assert.equal(e.code, 'ENOENT') })
  })

  it('should reject file problems with config', () => {
    return tscWrapper('./test/fixtures/tsconfig-bad-json.json')
      .then(() => { throw new Error('expected resolution') })
      .catch((e) => { assert.equal(e.messageText, 'Failed to parse file \'./test/fixtures/tsconfig-bad-json.json\': Unexpected end of JSON input.') })
  })

  it('should reject with errors if tsc blows up', function () {
    this.slow(2000)
    return tscWrapper('./test/fixtures/tsconfig-invalid.json')
      .then(() => { throw new Error('expected resolution') })
      .catch((e) => { assert(e.length > 0) })
  })

  it('should take the happy path quite nicely', function () {
    this.slow(2000)
    return tscWrapper('./test/fixtures/tsconfig-valid.json')
      .then(() => {
        const result = fs.readFileSync('./test/out/good.js')
        assert(result.indexOf('comment') > -1)
        assert(result.indexOf('sourceMappingURL') > -1)
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          fs.stat('./test/out/good.js.map', (e) => {
            if (e) { reject(new Error('sourcemap not created')) }
            else { resolve() }
          })
        })
      })
  })

  it('should take the happy path quite nicely - prod', function () {
    this.slow(2000)
    return tscWrapper('./test/fixtures/tsconfig-valid.json', true)
      .then(() => {
        const result = fs.readFileSync('./test/out/good.js')
        assert(result.indexOf('comment') === -1)
        assert(result.indexOf('sourceMappingURL') === -1)
      })
      .then(() => {
        return new Promise((resolve, reject) => {
          fs.stat('./test/out/good.js.map', (e) => {
            if (!e) { reject(new Error('sourcemap created')) }
            else { resolve() }
          })
        })
      })
  })

})
