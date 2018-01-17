const runner = require('../src/runner')
const random = require('../src/random')
const config = require('../src/config').getStandardConfig(random)
const assert = require('assert')
const teams = require('../src/teams')
const stories = require('../src/stories')
const devs = require('../src/devs')
const queues = require('../src/queues')

const libs = {teams, stories, devs, queues, random}

describe('runner', () => {
  describe('initialize', () => {
    it('returns a runner state', () => {
      const state = runner.initialize(config, libs)
      assert(state.team, 'team was not set')
      assert.equal(state.elapsedTime, 0)
      assert.equal(state.nextStoryAt, 0)
    })
  })

  describe('advance', () => {
    let state

    before(() => {
      state = runner.initialize(config, libs)
      runner.advance(state, 2)
    })

    it('advances the time by the specified amount', () => {      
      assert.equal(state.elapsedTime, 2)
    })

    it('updates nextStoryAt as stories are added', () => {
      assert.notEqual(state.nextStoryAt, 0)
    })

    it('adds stories', () => {
      const storyCount = state.team.readyQueue.length + state.team.inProgressQueue.length + state.team.completedStories.length
      assert.notEqual(storyCount, 0)
    })

    it('assigns work and updates progress', () => {
      const firstStory = state.team.readyQueue.concat(state.team.inProgressQueue).concat(state.team.completedStories)[0]
      assert.notEqual(firstStory.tasks[0].remaining < firstStory.tasks[0].duration)
    })
  })
})