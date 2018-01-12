const stories = require('../src/stories')
const random = require('../src/random')
const config = require('../src/config').getStandardConfig(random)
const assert = require('assert')

const assertInRange = (value, min, max) => {
  assert((value >= min && value <= max), `${value} is out of range [${min}, ${max}]`)
}

describe('stories', () => {
  describe('createStory()', () => {
    let story
    before(() => story = stories.newStory(config))

    it('should set the story id correctly', () => {
      assert.equal(story.id, 'story-1')
    })

    it('should set the value', () => {
      assertInRange(story.value, config.stories.minValue, config.stories.maxValue)
    })

    it('should create tasks', () => {
      const workDuration = story.tasks[0].duration
      const expectedReviewDuration = workDuration * config.stories.codeReviewMultiplier
      assert.deepEqual(story.tasks, [
        {name: 'work', duration: workDuration, remaining: workDuration},
        {name: 'code-review', duration: expectedReviewDuration, remaining: expectedReviewDuration}
      ])
    })

    it('should set the work duration in range', () => {
      assertInRange(story.tasks[0].duration, config.stories.minWork, config.stories.maxWork)
    })

    it('should set the ids of subsequent stories correctly', () => {
      assert.equal(stories.newStory(config).id, 'story-2')
      assert.equal(stories.newStory(config).id, 'story-3')
    })
  })
})
