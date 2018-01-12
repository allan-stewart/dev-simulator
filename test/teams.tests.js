const teams = require('../src/teams')
const random = require('../src/random')
const configs = require('../src/config')
const devs = require('../src/devs')
const stories = require('../src/stories')
const queues = require('../src/queues')
const assert = require('assert')

describe('teams', () => {
  describe('initializeTeam()', () => {
    let team
    let config

    before(() => {
      config = configs.getStandardConfig(random)
      team = teams.initializeTeam(config, devs.createDev)
    })

    it('should contain the config', () => {
      assert.deepEqual(team.config, config)
    })

    it('should create an empty ready queue', () => {
      assert.deepEqual(team.readyQueue, [])
    })

    it('should create an empty in progress queue', () => {
      assert.deepEqual(team.inProgressQueue, [])
    })

    it('should create the developers', () => {
      assert.equal(team.devs.length, config.devs.count)
    })

    it('should have all devs unassigned', () => {
      assert.equal(team.unassigned.length, config.devs.count)
    })

    it('should have no assigned work', () => {
      assert.deepEqual(team.assigned, [])
    })
  })

  describe('addStoryToReadyQueue', () => {
    it('should add the story to an empty ready queue', () => {
      const config = configs.getStandardConfig(random)
      const team = teams.initializeTeam(config, devs.createDev)
      const story = stories.newStory(config)

      teams.addStoryToReadyQueue(story, team, queues.addStoryToQueue)
      assert.deepEqual(team.readyQueue, [story])
    })

    it('should drop the lowest priority story if the a WIP limit is set', () => {
      const config = configs.getStandardConfig(random)
      config.queues.ready.wipLimit = 2
      const team = teams.initializeTeam(config, devs.createDev)
      const story1 = stories.newStory(config)
      const story2 = stories.newStory(config)
      const story3 = stories.newStory(config)

      story1.priority = 5
      story2.priority = 7
      story3.priority = 10

      teams.addStoryToReadyQueue(story1, team, queues.addStoryToQueue)
      teams.addStoryToReadyQueue(story2, team, queues.addStoryToQueue)
      teams.addStoryToReadyQueue(story3, team, queues.addStoryToQueue)

      assert.deepEqual(team.readyQueue, [story3, story2])
    })
  })
})