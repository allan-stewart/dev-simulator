const getStandardConfig = (random) => {
  return {
    random,
    stories: {
      nextId: 1,
      minValue: 1,
      maxValue: 3,
      minWork: 1,
      maxWork: 16,
      codeReviewMultiplier: .1
    }
  }
}

module.exports = {
  getStandardConfig
}
