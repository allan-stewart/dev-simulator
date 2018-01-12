const initializeTeam = (config, createDev) => {
  const devs = createDevs(config, createDev)
  return {
    config,
    readyQueue: [],
    inProgressQueue: [],
    devs,
    unassigned: devs.concat(),
    assigned: []
  }
}

const createDevs = (config, createDev) => {
  const devs = []
  let count = config.devs.count
  while (count > 0) {
    count--
    devs.push(createDev(config))
  }
  return devs
}

const addStoryToReadyQueue = (story, team, addStoryToQueue) => {
  addStoryToQueue(story, team.readyQueue)
  const wipLimit = team.config.queues.ready.wipLimit
  if (wipLimit > 0 && team.readyQueue.length > wipLimit) {
    team.readyQueue = team.readyQueue.slice(0, wipLimit)
  }
}

module.exports = {
  initializeTeam,
  addStoryToReadyQueue
}
