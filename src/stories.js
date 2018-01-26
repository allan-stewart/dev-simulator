const newStory = (config) => {
  const workDuration = config.random.randomInt(config.stories.minWork, config.stories.maxWork)
  const reviewDuration = workDuration * config.stories.codeReviewMultiplier

  const story = {
    id: 'story-' + config.stories.nextId++,
    value: config.random.randomInt(config.stories.minValue, config.stories.maxValue),
    tasks: [
      {name: 'work', duration: workDuration, remaining: workDuration, devs: [], finished: false},
      {name: 'code-review', duration: reviewDuration, remaining: reviewDuration, devs: [], finished: false}
    ]
  }

  updateStoryPriority(story)

  return story
}

const updateStoryPriority = (story) => {
  const remaining = story.tasks.reduce((total, task) => total + task.remaining, 0)
  story.priority = story.value / remaining
}

const storiesLib = {
  newStory,
  updateStoryPriority
}

module.exports = storiesLib
