const teams = require('../src/teams')
const random = require('../src/random')
const configs = require('../src/config')
const devs = require('../src/devs')
const stories = require('../src/stories')
const queues = require('../src/queues')
const assert = require('assert')

const libs = {devs, queues, stories}

const createStoryWithPriority = (priority, config) => {
 let story = stories.newStory(config)
 story.priority = priority
 return story
}

describe('teams', () => {
  describe('initializeTeam()', () => {
    let team
    let config

    before(() => {
      config = configs.getStandardConfig(random)
      team = teams.initializeTeam(config, libs)
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

    it('should have no completed stories', () => {
      assert.deepEqual(team.completedStories, [])
    })
  })

  describe('addStoryToReadyQueue', () => {
    it('should add the story to an empty ready queue', () => {
      const config = configs.getStandardConfig(random)
      const team = teams.initializeTeam(config, libs)
      const story = stories.newStory(config)

      teams.addStoryToReadyQueue(story, team)
      assert.deepEqual(team.readyQueue, [story])
    })

    it('should drop the lowest priority story if the a WIP limit is set', () => {
      const config = configs.getStandardConfig(random)
      config.queues.ready.wipLimit = 2
      const team = teams.initializeTeam(config, libs)
      const story1 = createStoryWithPriority(5, config)
      const story2 = createStoryWithPriority(7, config)
      const story3 = createStoryWithPriority(10, config)

      teams.addStoryToReadyQueue(story1, team)
      teams.addStoryToReadyQueue(story2, team)
      teams.addStoryToReadyQueue(story3, team)

      assert.deepEqual(team.readyQueue, [story3, story2])
    })
  })

  describe('assignWork()', () => {
    describe('when working solo', () => {
      it('should pull work from the ready queue as needed', () => {
        const team = teams.initializeTeam(configs.getStandardConfig(random), libs)
        const stories = [
          createStoryWithPriority(3, team.config),
          createStoryWithPriority(2, team.config),
          createStoryWithPriority(1, team.config),
          createStoryWithPriority(0, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [])
        assert.deepEqual(team.inProgressQueue, stories)
        assert.deepEqual(team.unassigned, [])
        assert.deepEqual(team.assigned, [
          {story: stories[0], devs: [team.devs[0]]},
          {story: stories[1], devs: [team.devs[1]]},
          {story: stories[2], devs: [team.devs[2]]},
          {story: stories[3], devs: [team.devs[3]]}
        ])
      })

      it('should NOT pull work after hitting the inProgress wip limit', () => {
        const config = configs.getStandardConfig(random)
        config.queues.inProgress.wipLimit = 2
        const team = teams.initializeTeam(config, libs)
        const stories = [
          createStoryWithPriority(3, team.config),
          createStoryWithPriority(2, team.config),
          createStoryWithPriority(1, team.config),
          createStoryWithPriority(0, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [stories[2], stories[3]])
        assert.deepEqual(team.inProgressQueue, [stories[0], stories[1]])
        assert.deepEqual(team.unassigned, [team.devs[2], team.devs[3]])
        assert.deepEqual(team.assigned, [
          {story: stories[0], devs: [team.devs[0]]},
          {story: stories[1], devs: [team.devs[1]]}
        ])
      })

      it('should leave devs unassigned if there is not enough work', () => {
        const team = teams.initializeTeam(configs.getStandardConfig(random), libs)
        const stories = [
          createStoryWithPriority(0, team.config),
          createStoryWithPriority(1, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [])
        assert.deepEqual(team.inProgressQueue, stories.concat().reverse())
        assert.deepEqual(team.unassigned, [team.devs[2], team.devs[3]])
        assert.deepEqual(team.assigned, [
          {story: stories[1], devs: [team.devs[0]]},
          {story: stories[0], devs: [team.devs[1]]}
        ])
      })

      it('should assign unfinished inProgress stories first', () => {
        const team = teams.initializeTeam(configs.getStandardConfig(random), libs)
        const stories = [
          createStoryWithPriority(0, team.config),
          createStoryWithPriority(1, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
        const inProgressStory = createStoryWithPriority(2, team.config)
        team.inProgressQueue.push(inProgressStory)
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [])
        assert.deepEqual(team.inProgressQueue, [inProgressStory, stories[1], stories[0]])
        assert.deepEqual(team.unassigned, [team.devs[3]])
        assert.deepEqual(team.assigned, [
          {story: inProgressStory, devs: [team.devs[0]]},
          {story: stories[1], devs: [team.devs[1]]},
          {story: stories[0], devs: [team.devs[2]]}
        ])
      })

      it('should not change existing assignments', () => {
        const team = teams.initializeTeam(configs.getStandardConfig(random), libs)
        const story1 = createStoryWithPriority(1, team.config)
        const story2 = createStoryWithPriority(2, team.config)
        const story3 = createStoryWithPriority(3, team.config)
        
        teams.addStoryToReadyQueue(story1, team)
        teams.addStoryToReadyQueue(story2, team)
        teams.assignWork(team)
        teams.addStoryToReadyQueue(story3, team)
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [])
        assert.deepEqual(team.inProgressQueue, [story3, story2, story1])
        assert.deepEqual(team.unassigned, [team.devs[3]])
        assert.deepEqual(team.assigned, [
          {story: story2, devs: [team.devs[0]]},
          {story: story1, devs: [team.devs[1]]},
          {story: story3, devs: [team.devs[2]]}
        ])
      })
    })

    describe('when pairing', () => {
      it('should assign work in pairs', () => {
        const team = teams.initializeTeam(configs.getStandardConfig(random), libs)
        team.config.devs.collaboration = 'pair'
        const stories = [
          createStoryWithPriority(2, team.config),
          createStoryWithPriority(1, team.config),
          createStoryWithPriority(0, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [stories[2]])
        assert.deepEqual(team.inProgressQueue, [stories[0], stories[1]])
        assert.deepEqual(team.unassigned, [])
        assert.deepEqual(team.assigned, [
          {story: stories[0], devs: [team.devs[0], team.devs[1]]},
          {story: stories[1], devs: [team.devs[2], team.devs[3]]}
        ])
      })

      it('should assign a solo person if there is an odd number of devs', () => {
        const config = configs.getStandardConfig(random)
        config.devs.collaboration = 'pair'
        config.devs.count = 5
        const team = teams.initializeTeam(config, libs)
        const stories = [
          createStoryWithPriority(2, team.config),
          createStoryWithPriority(1, team.config),
          createStoryWithPriority(0, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [])
        assert.deepEqual(team.inProgressQueue, stories)
        assert.deepEqual(team.unassigned, [], 'incorrect unassigned users')
        assert.deepEqual(team.assigned, [
          {story: stories[0], devs: [team.devs[0], team.devs[1]]},
          {story: stories[1], devs: [team.devs[2], team.devs[3]]},
          {story: stories[2], devs: [team.devs[4]]}
        ])
      })
    })

    describe('when mobbing', () => {
      it('should assign the whole team to one story', () => {
        const config = configs.getStandardConfig(random)
        config.devs.collaboration = 'mob'
        config.devs.count = 3
        const team = teams.initializeTeam(config, libs)
        const stories = [
          createStoryWithPriority(2, team.config),
          createStoryWithPriority(1, team.config),
          createStoryWithPriority(0, team.config)
        ]
        stories.forEach(story => teams.addStoryToReadyQueue(story, team))
  
        teams.assignWork(team)
  
        assert.deepEqual(team.readyQueue, [stories[1], stories[2]])
        assert.deepEqual(team.inProgressQueue, [stories[0]])
        assert.deepEqual(team.unassigned, [], 'incorrect unassigned users')
        assert.deepEqual(team.assigned, [
          {story: stories[0], devs: team.devs}
        ])
      })
    })
  })
  
  describe('performWork()', () => {
    describe('when working solo', () => {
      let config, team, story1, story2

      beforeEach(() => {
        config = configs.getStandardConfig(random)
        config.devs.count = 3
        team = teams.initializeTeam(config, libs)
        story1 = stories.newStory(config)
        story1.tasks[0].remaining = 2
        story1.tasks[1].remaining = 1
        story2 = stories.newStory(config)
        story2.tasks[0].remaining = 0
        story2.tasks[1].remaining = .7
        teams.addStoryToReadyQueue(story1, team)
        teams.addStoryToReadyQueue(story2, team)
        teams.assignWork(team)
        teams.performWork(team)
      })

      it('should decrease story 1 work remaining by 1', () => {
        assert.equal(story1.tasks[0].remaining, 1)
      })

      it('should NOT decrease story 1 code review remaining', () => {
        assert.equal(story1.tasks[1].remaining, 1)
      })

      it('should NOT decrease story 2 work remaining below 0', () => {
        assert.equal(story2.tasks[0].remaining, 0)
      })

      it('should decrease story 2 code review remaining', () => {
        assert.equal(story2.tasks[1].remaining, 0)
      })
    })

    describe('when working in a pair', () => {
      let config, team, story1, story2

      beforeEach(() => {
        config = configs.getStandardConfig(random)
        config.devs.collaboration = 'pair'
        config.devs.count = 3
        team = teams.initializeTeam(config, libs)
        story1 = stories.newStory(config)
        story1.priority = 10
        story1.tasks[0].remaining = 3
        story1.tasks[1].remaining = 2
        story2 = stories.newStory(config)
        story2.priority = 5
        story2.tasks[0].remaining = 0
        story2.tasks[1].remaining = .7
        teams.addStoryToReadyQueue(story1, team)
        teams.addStoryToReadyQueue(story2, team)
        teams.assignWork(team)
        teams.performWork(team)
      })

      it('should decrease story 1 work remaining by 1', () => {
        assert.equal(story1.tasks[0].remaining, 2)
      })

      it('should decrease story 1 code review remaining', () => {
        assert.equal(story1.tasks[1].remaining, 1)
      })

      it('should NOT decrease story 2 work remaining below 0', () => {
        assert.equal(story2.tasks[0].remaining, 0)
      })

      it('should decrease story 2 code review remaining', () => {
        assert.equal(story2.tasks[1].remaining, 0)
      })
    })

    describe('when working in a mob', () => {
      let config, team, story1, story2

      beforeEach(() => {
        config = configs.getStandardConfig(random)
        config.devs.collaboration = 'mob'
        config.devs.count = 3
        team = teams.initializeTeam(config, libs)
        story1 = stories.newStory(config)
        story1.priority = 10
        story1.tasks[0].remaining = 3
        story1.tasks[1].remaining = 2
        story2 = stories.newStory(config)
        story2.priority = 5
        story2.tasks[0].remaining = 0
        story2.tasks[1].remaining = .7
        teams.addStoryToReadyQueue(story1, team)
        teams.addStoryToReadyQueue(story2, team)
        teams.assignWork(team)
        teams.performWork(team)
      })

      it('should decrease story 1 work remaining by 1', () => {
        assert.equal(story1.tasks[0].remaining, 2)
      })

      it('should decrease story 1 code review remaining', () => {
        assert.equal(story1.tasks[1].remaining, 1)
      })

      it('should NOT decrease story 2 work remaining', () => {
        assert.equal(story2.tasks[0].remaining, 0)
      })

      it('should NOT story 2 code review remaining', () => {
        assert.equal(story2.tasks[1].remaining, .7)
      })
    })
  })

  describe('processFinishedWork()', () => {
    let config, team, story1, story2
    
    beforeEach(() => {
      config = configs.getStandardConfig(random)
      config.devs.collaboration = 'pair'
      config.devs.count = 5
      team = teams.initializeTeam(config, libs)
      story1 = stories.newStory(config)
      story1.priority = 10
      story1.tasks[0].remaining = 0
      story1.tasks[1].remaining = 1
      story2 = stories.newStory(config)
      story2.value = 2
      story2.priority = 5
      story2.tasks[0].remaining = 2
      story2.tasks[1].remaining = 1
      story3 = stories.newStory(config)
      story3.value = 3
      story3.priority = 2
      story3.tasks[0].remaining = 0
      story3.tasks[1].remaining = 2
      teams.addStoryToReadyQueue(story1, team)
      teams.addStoryToReadyQueue(story2, team)
      teams.addStoryToReadyQueue(story3, team)
      teams.assignWork(team)
      teams.performWork(team)
      teams.processFinishedWork(team)
    })

    it('should remove the finished stories from the inProgress queue and reprioritize', () => {
      assert.deepEqual(team.inProgressQueue, [story3, story2])
    })

    it('should unassign developers from stories with finished work', () => {
      assert.deepEqual(team.unassigned, [team.devs[0], team.devs[1], team.devs[4]])
    })

    it('should update the assignments', () => {
      assert.deepEqual(team.assigned, [{story: story2, devs: [team.devs[2], team.devs[3]]}])
    })

    it('should update story2 priority', () => {
      assert.equal(story2.priority, story2.value)
    })

    it('should update story3 priority', () => {
      assert.equal(story3.priority, story3.value)
    })

    it('should update the completed stories', () => {
      assert.deepEqual(team.completedStories, [story1])
    })
  })
})
