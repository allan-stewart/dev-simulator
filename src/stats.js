const getQueueStats = (queue, config) => {
  const valueRanges = calculateValueRanges(config)
  return {
    totalStories: queue.length,
    lowValueCount: queue.filter(x => x.value < valueRanges.lowBelow).length,
    mediumValueCount: queue.filter(x => x.value >= valueRanges.lowBelow && x.value <= valueRanges.highAbove).length,
    highValueCount: queue.filter(x => x.value > valueRanges.highAbove).length,
    totalValue: queue.reduce((total, story) => total + story.value, 0)
  }
}

const calculateValueRanges = (config) => {
  const min = config.stories.minValue
  const max = config.stories.maxValue
  const step = (max - min) / 3
  return {
    lowBelow: Math.round(min + step),
    highAbove: Math.round(max - step)
  }
}

const statsLib = {
  getQueueStats
}

module.exports = statsLib
