const stats = require('../src/stats')
const stories = require('../src/stories')
const random = require('../src/random')
const config = require('../src/config').getStandardConfig(random)
const assert = require('assert')

describe('stats', () => {
  describe('getQueueStats()', () => {
    let result

    before(() => {
      let queue = []
      queue.push(stories.newStory(config))
      queue.push(stories.newStory(config))
      queue.push(stories.newStory(config))
      queue.push(stories.newStory(config))
      queue.push(stories.newStory(config))

      queue.forEach((story, index) => story.value = (index * .5) + 1)

      result = stats.getQueueStats(queue, config)
    })

    it('should return the number of stories in the queue', () => assert.equal(result.totalStories, 5))
    it('should return the number of low value stories', () => assert.equal(result.lowValueCount, 2))
    it('should return the number of medium value stories', () => assert.equal(result.mediumValueCount, 1))
    it('should return the number of high value stories', () => assert.equal(result.highValueCount, 2))
    it('should return the total value', () => assert.equal(result.totalValue, 10))
  })
})
