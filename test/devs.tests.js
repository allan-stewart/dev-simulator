const devs = require('../src/devs')
const random = require('../src/random')
const config = require('../src/config').getStandardConfig(random)
const assert = require('assert')

describe('dev', () => {
  describe('createDev()', () => {
    let dev

    before(() => dev = devs.createDev(config))

    it('should set the dev id', () => {
      assert.equal(dev.id, 'dev-1')
    })

    it('should set the ids of subsequent devs correctly', () => {
      assert.equal(devs.createDev(config).id, 'dev-2')
      assert.equal(devs.createDev(config).id, 'dev-3')
    })
  })
})