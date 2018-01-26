const createDev = (config) => {
  return {
    id: 'dev-' + config.devs.nextId++
  }
}

const devsLib = {
  createDev
}

module.exports = devsLib
