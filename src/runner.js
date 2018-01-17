const initialize = (config, libs) => {
  const team = libs.teams.initializeTeam(config, libs)
  return {
    libs,
    team,
    elapsedTime: 0,
    nextStoryAt: 0
  }
}

const advance = (state, steps) => {
  for (i = 0; i < steps; i++) {
    advanceOneStep(state)    
  }
}

const advanceOneStep = (state, steps) => {
  newStoriesMayArrive(state)
  state.libs.teams.assignWork(state.team)
  state.libs.teams.performWork(state.team)
  state.libs.teams.processFinishedWork(state.team)
  state.elapsedTime++
}

const newStoriesMayArrive = (state) => {
  if (state.nextStoryAt == state.elapsedTime) {
    const story = state.libs.stories.newStory(state.team.config)
    state.libs.teams.addStoryToReadyQueue(story, state.team)
    state.nextStoryAt = state.elapsedTime + state.libs.random.randomInt(state.team.config.stories.newEvery.min, state.team.config.stories.newEvery.max)
  }
}

module.exports = {
  initialize,
  advance
}