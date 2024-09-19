const username = document.querySelector('.loginForm input')
const start = document.querySelector('#start')
const loginForm = document.querySelector('.loginForm')
const game = document.querySelector('.game')

username.addEventListener('input', e => {
    start.disabled = e.target.value === ''
})

start.addEventListener('click', () => {
  localStorage.setItem('username', username.value)
  loginForm.style.display = 'none'
  game.style.display = 'block'
  play()
})
