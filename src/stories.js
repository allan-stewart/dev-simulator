const newStory = (config) => {
  const workDuration = config.random.randomInt(config.stories.minWork, config.stories.maxWork)
  const reviewDuration = workDuration * config.stories.codeReviewMultiplier

  return {
    id: 'story-' + config.stories.nextId++,
    value: config.random.randomInt(config.stories.minValue, config.stories.maxValue),
    tasks: [
      {name: 'work', duration: workDuration, remaining: workDuration},
      {name: 'code-review', duration: reviewDuration, remaining: reviewDuration}
    ]
  }
}

module.exports = {
  newStory
}