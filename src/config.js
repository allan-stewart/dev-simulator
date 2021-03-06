const getStandardConfig = (random) => {
  return {
    random,
    stories: {
      nextId: 1,
      minValue: 1,
      maxValue: 3,
      minWork: 1,
      maxWork: 16,
      codeReviewMultiplier: .1,
      newEvery: {min: 1, max: 5}
    },
    devs: {
      nextId: 1,
      count: 4,
      collaboration: 'solo'
    },
    queues: {
      ready: {
        wipLimit: 0
      },
      inProgress: {
        wipLimit: 0
      }
    }
  }
}

const configLib = {
  getStandardConfig
}

module.exports = configLib
