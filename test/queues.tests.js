const queues = require('../src/queues')
const random = require('../src/random')
const config = require('../src/config').getStandardConfig(random)
const stories = require('../src/stories')
const assert = require('assert')

describe('queues', () => {
  describe('addStoryToQueue()', () => {
    it('should add a story to an empty queue', () => {
      const queue = []
      const story = stories.newStory(config)
      queues.addStoryToQueue(story, queue)

      assert.deepEqual(queue, [story])
    })

    it('should return the stories in priority order', () => {
      config.stories.nextId = 1
      const story1 = stories.newStory(config)
      const story2 = stories.newStory(config)
      const story3 = stories.newStory(config)
      const story4 = stories.newStory(config)

      story1.priority = 3
      story2.priority = 6
      story3.priority = 9
      story4.priority = 5

      const queue = []
      queues.addStoryToQueue(story1, queue)
      queues.addStoryToQueue(story2, queue)
      queues.addStoryToQueue(story3, queue)
      queues.addStoryToQueue(story4, queue)

      assert.deepEqual(queue, [story3, story2, story4, story1])
    })
  })

  describe('prioritizeQueue()', () => {
    it('should sort the queue into priority order', () => {
      const story1 = stories.newStory(config)
      const story2 = stories.newStory(config)
      const story3 = stories.newStory(config)

      story1.priority = 5
      story2.priority = 10
      story3.priority = 7

      const queue = [story1, story2, story3]
      queues.prioritizeQueue(queue)

      assert.deepEqual(queue, [story2, story3, story1])
    })
  })
})