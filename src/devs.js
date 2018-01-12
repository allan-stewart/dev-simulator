const createDev = (config) => {
  return {
    id: 'dev-' + config.devs.nextId++
  }
}

module.exports = {
  createDev
}
