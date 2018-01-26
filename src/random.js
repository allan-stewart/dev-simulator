const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const randomLib = {
  randomInt
}

module.exports = randomLib
