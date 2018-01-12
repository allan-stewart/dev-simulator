const newStory = (config) => {
  const workDuration = config.random.randomInt(config.stories.minWork, config.stories.maxWork)
  const reviewDuration = workDuration * config.stories.codeReviewMultiplier

  const story = {
    id: 'story-' + config.stories.nextId++,
    value: config.random.randomInt(config.stories.minValue, config.stories.maxValue),
    tasks: [
      {name: 'work', duration: workDuration, remaining: workDuration},
      {name: 'code-review', duration: reviewDuration, remaining: reviewDuration}
    ]
  }

  updateStoryPriority(story)

  return story
}

const updateStoryPriority = (story) => {
  const remaining = story.tasks.reduce((total, task) => total + task.remaining, 0)
  story.priority = story.value / remaining
}

module.exports = {
  newStory,
  updateStoryPriority
}