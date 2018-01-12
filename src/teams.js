const initializeTeam = (config, libs) => {
  const devs = createDevs(config, libs.devs.createDev)
  return {
    config,
    libs,
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

const addStoryToReadyQueue = (story, team) => {
  team.libs.queues.addStoryToQueue(story, team.readyQueue)
  const wipLimit = team.config.queues.ready.wipLimit
  if (wipLimit > 0 && team.readyQueue.length > wipLimit) {
    team.readyQueue = team.readyQueue.slice(0, wipLimit)
  }
}

const assignWork = (team) => {
  assignInProgressWork(team)
  pullWorkFromReadyQueue(team)
}

const assignInProgressWork = (team) => {
  const stories = team.inProgressQueue.filter(story => {
    return !team.assigned.some(assignment => assignment.story == story)
  })
  while (team.unassigned.length > 0 && stories.length > 0) {
    const devs = getDevsForAssignment(team)
    const story = stories.shift()
    team.assigned.push({story, devs})
  }
}

const getDevsForAssignment = (team) => {
  if (team.config.devs.collaboration == 'mob') {
    team.unassigned = []
    return team.devs
  }
  if (team.config.devs.collaboration == 'pair') {
    return team.unassigned.length > 1 ? [team.unassigned.shift(), team.unassigned.shift()] : [team.unassigned.shift()]
  }
  return [team.unassigned.shift()]
}

const pullWorkFromReadyQueue = (team) => {
  while (team.unassigned.length > 0 && team.readyQueue.length > 0) {
    const devs = getDevsForAssignment(team)
    const story = team.readyQueue.shift()
    team.assigned.push({story, devs})
    team.libs.queues.addStoryToQueue(story, team.inProgressQueue)
  }
}

const performWork = (team) => {
  team.assigned.forEach(assignment => {
    let workRemaining = assignment.story.tasks[0].remaining
    assignment.story.tasks[0].remaining = Math.max(0, workRemaining - 1)
 
    if (workRemaining == 0 || assignment.devs.length > 1) {
      let reviewRemaining = assignment.story.tasks[1].remaining
      assignment.story.tasks[1].remaining = Math.max(0, reviewRemaining - 1)
    }
  })
}

const processFinishedWork = (team) => {
  team.assigned.forEach(assignment => {
    if (!assignment.story.tasks.some(task => task.remaining > 0)) {
      team.libs.queues.removeStoryFromQueue(assignment.story, team.inProgressQueue)
      team.unassigned = team.unassigned.concat(assignment.devs)
      assignment.devs = []
    }
  })

  team.assigned = team.assigned.filter(x => x.devs.length > 0)
}

module.exports = {
  initializeTeam,
  addStoryToReadyQueue,
  assignWork,
  performWork,
  processFinishedWork
}
