const initializeTeam = (config, libs) => {
  const devs = createDevs(config, libs.devs.createDev)
  return {
    config,
    libs,
    readyQueue: [],
    inProgressQueue: [],
    completedStories: [],
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
  let stories = team.inProgressQueue.filter(story => {
    return !team.assigned.some(assignment => assignment.story == story)
  })
  let unassignableDevs = []
  while (team.unassigned.length > 0 && stories.length > 0) {
    const devs = getDevsForAssignment(team)
    const story = getNextAvailableStory(team, stories, devs)
    if (story) {
      stories = stories.filter(x => x != story)
      const nextTask = getNextTaskForAssignment(story)
      nextTask.devs = devs.map(x => x.id)
      team.assigned.push({story, devs})
    } else {
      unassignableDevs = unassignableDevs.concat(devs)
    }
  }
  team.unassigned = team.unassigned.concat(unassignableDevs)
}

const getNextAvailableStory = (team, stories, devs) => {
  if (team.config.devs.collaboration == 'solo') {
    const dev = devs[0]
    return stories.find(story => !story.tasks[0].devs.includes(dev.id))
  }
  return stories[0]
}

const getNextTaskForAssignment = (story) => {
  return story.tasks.find(task => !task.finished)
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
  const wipLimit = team.config.queues.inProgress.wipLimit;
  while (team.unassigned.length > 0 && team.readyQueue.length > 0 && (wipLimit == 0 || team.inProgressQueue.length < wipLimit)) {
    const devs = getDevsForAssignment(team)
    const story = team.readyQueue.shift()
    team.assigned.push({story, devs})
    team.libs.queues.addStoryToQueue(story, team.inProgressQueue)
    const nextTask = getNextTaskForAssignment(story)
    nextTask.devs = devs.map(x => x.id)
  }
}

const performWork = (team) => {
  team.assigned.forEach(assignment => {
    let devMultipliers = assignment.devs.map(dev => getDevMultiplier(team.config.random, team.inProgressQueue.length))
    let work = Math.max(...devMultipliers)
    let task = assignment.story.tasks.find(x => !x.finished)
    task.remaining = Math.max(0, task.remaining - work)

    if (task.name != 'code-review' && assignment.devs.length > 1) {
      task = assignment.story.tasks[1]
      task.remaining = Math.max(0, task.remaining - work)
    }
  })
}
const getDevMultiplier = (random, numberOfStoriesInQueue) => {
  return Math.max(Math.random(), .01) / Math.max(numberOfStoriesInQueue, 1)
}

const processFinishedWork = (team) => {
  team.assigned.forEach(assignment => {
    team.libs.stories.updateStoryPriority(assignment.story)
    let shouldReassign = assignment.story.tasks.some(x => x.remaining <= 0 && !x.finished)
    if (shouldReassign) {
      team.unassigned = team.unassigned.concat(assignment.devs)
      assignment.devs = []
    }

    assignment.story.tasks.forEach(task => task.finished = task.remaining <= 0)

    if (assignment.story.tasks.every(task => task.finished)) {
      team.libs.queues.removeStoryFromQueue(assignment.story, team.inProgressQueue)
      team.completedStories.push(assignment.story)
    }
  })

  team.assigned = team.assigned.filter(x => x.devs.length > 0)
  team.libs.queues.prioritizeQueue(team.inProgressQueue)
}

const teamsLib = {
  initializeTeam,
  addStoryToReadyQueue,
  assignWork,
  performWork,
  processFinishedWork
}

module.exports = teamsLib
