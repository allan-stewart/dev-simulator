const runner = require('./src/runner')
const random = require('./src/random')
const config = require('./src/config').getStandardConfig(random)
const teams = require('./src/teams')
const stories = require('./src/stories')
const devs = require('./src/devs')
const queues = require('./src/queues')
const stats = require('./src/stats')

const libs = { teams, stories, devs, queues, random }

config.stories.maxValue = 10

const run = (collaboration, readyWip, inProgressWip) => {
  config.devs.collaboration = collaboration // solo, pair, mob
  config.queues.ready.wipLimit = readyWip
  config.queues.inProgress.wipLimit = inProgressWip

  let runnerState = runner.initialize(config, libs)

  while (runnerState.elapsedTime < 1000) {
    runner.advance(runnerState, 1)
  }

  return {
    iterations: runnerState.elapsedTime,
    collaboration: config.devs.collaboration,
    wipLimits: {
      ready: config.queues.ready.wipLimit,
      inProgress: config.queues.inProgress.wipLimit
    },
    ready: stats.getQueueStats(runnerState.team.readyQueue, config),
    inProgress: stats.getQueueStats(runnerState.team.inProgressQueue, config),
    finished: stats.getQueueStats(runnerState.team.completedStories, config)
  }
}

let output = [
  run('solo', 0, 0),
  run('pair', 0, 0),
  run('mob', 0, 0),
  run('solo', 5, 2),
  run('pair', 5, 2),
  run('mob', 5, 2)
]

console.log(JSON.stringify(output, null, 2))
