const addStoryToQueue = (story, queue) => {
  queue.push(story)
  prioritizeQueue(queue)
}

const prioritizeQueue = (queue) => {
  queue.sort((a, b) => b.priority - a.priority)
}

module.exports = {
  addStoryToQueue,
  prioritizeQueue
}