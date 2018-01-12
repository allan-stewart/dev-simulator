const addStoryToQueue = (story, queue) => {
  queue.push(story)
  queue.sort((a, b) => b.priority - a.priority)
}

module.exports = {
  addStoryToQueue
}