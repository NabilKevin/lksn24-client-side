const textTime = document.querySelector('.time')

let wantRestart = false
let isStarted = false
let condition = null
let isCollusion = false
const playTime = 20
const countDown = 10
let time;

const games = new BlindMaze()

let startTime = () => setTimeout(() => {
  time -= 1
  textTime.textContent = time + 's'

  if(time < 0) {
    if(condition === 'realPlay') {
      games.gameOver()
    } else {
      games.start()
    }
    return 
  } else {
    startTime(condition)
  }
  
}, 1000)

const realPlay = () => {
  clearTimeout(startTime)
  time = playTime
  textTime.textContent = time + 's'
  condition = 'realPlay'
  startTime()
}

const play = () => {
  clearTimeout(startTime)
  time = countDown
  textTime.textContent = time + 's'
  condition = 'play'
  startTime()
}
