const addStoryToQueue = (story, queue) => {
  queue.push(story)
  prioritizeQueue(queue)
}

const prioritizeQueue = (queue) => {
  queue.sort((a, b) => b.priority - a.priority)
}

const removeStoryFromQueue = (story, queue) => {
  const index = queue.indexOf(story)
  if (index >= 0) {
    queue.splice(index, 1)
  }
}

const queuesLib = {
  addStoryToQueue,
  prioritizeQueue,
  removeStoryFromQueue
}

module.exports = queuesLib
