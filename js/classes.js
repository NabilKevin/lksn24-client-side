class ActionListener 
{
  constructor() {
    this.keys = {
      ArrowRight: {
        isClicked: false
      },
      ArrowDown: {
        isClicked: false
      },
      ArrowUp: {
        isClicked: false
      },
      ArrowLeft: {
        isClicked: false
      }

    }

    window.addEventListener('keydown', this.keyDown.bind(this))
  }
  
  keyDown(e) {
    switch(e.key) {
      case 'ArrowUp':
        this.keys.ArrowUp.isClicked = true
        break
      case 'ArrowLeft':
        this.keys.ArrowLeft.isClicked = true
        break
      case 'ArrowRight':
        this.keys.ArrowRight.isClicked = true
        break
      case 'ArrowDown':
        this.keys.ArrowDown.isClicked = true
        break
    }
  }
}

class Game extends ActionListener 
{
  constructor() {
    super({})
    this.canvas = document.querySelector('canvas')
    this.ctx = this.canvas.getContext('2d')
    this.canvas.width = 1000
    this.canvas.height = 600
    this.isStarted = false
    this.life = 5
    this.stage = 1
  }
  animate() {
    window.requestAnimationFrame(this.animate.bind(this))
    this.update()
  }
}

class BlindMaze extends Game
{
  constructor() {
    super({})

    this.entities = {
      'mazes': [...Array(10)].map((_, colIndex) => [...Array(10)].map((_, rowIndex) => new Maze({
        ctx: this.ctx,
        position: {
          x: 200 + (rowIndex * 60),
          y: 0 + (colIndex * 60)
        },
        color: 'black'
      }))),
      'walls': this.generateWalls(),
      'finishLine': new FinishLine({
        ctx: this.ctx,
        position: {
          x: 60 * 10 + 200,
          y: Math.floor(Math.random() * 9) * 60
        },
        color: 'lime'
      }),
      'hearts': [...Array(5)].map((a, i) => new Heart({
        ctx: this.ctx,
        width: 15,
        height: 15,
        color: 'red',
        stroke: 'red',
        position: {
          x: 800 + (i * 20),
          y: 0
        }
      }))
    }
    
    this.wallsPositions = [...Object.values(this.entities.walls)].map(pos => pos.map(p => p.position)).reduce((a, b) => [...a,...b]);
    
    this.finish = this.entities.finishLine.position

    this.entities['player'] = new Player({
        position: {
          x: 200,
          y: 60 * 4
        },
        ctx: this.ctx,
        color: 'red',
        stroke: 'red',
        wallsPositions: this.wallsPositions,
        finishLine: this.finish
      })
    
    
    this.animate()
  }

  start() {
    isStarted = true
    this.entities.walls = []
    realPlay()
  }

  restart() {
    clearTimeout(startTime)
    wantRestart = false
    isStarted = false
    this.entities.walls = this.generateWalls()
    this.stage += 1
    play()
  }

  gameOver() {
    const save = confirm(`Game Over\nUsername: ${localStorage.getItem('username')}\nStage: ${this.stage}\nSave score?`)
    if(save) {
      localStorage.setItem('leaderboard', JSON.parse(`${localStorage.getItem('username'), this.stage}`))
    }
  }

  generateWalls() {
    return (
      [...Array(Math.round(Math.random() * (7 - 2) + 2))]
        .map((_, colIndex) => [
          ...[...Array(Math.round(Math.random() * (9 - 2) + 2))]
            .map((_, rowIndex) => new Wall({
              ctx: this.ctx,
              position: {
                x: 200 + (Math.round((Math.random() * (8-1) + 1)) * 60),
                y: 0 + (Math.round((Math.random() * (9-1) + 1)) * 60)
              },
              color: 'gray'
          })),
      ]
    )
    )
  }
  update() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    [...Object.values(this.entities)].forEach(entity => {
      if(Array.isArray(entity)) {
        entity.forEach(enti => {
          if(Array.isArray(enti)) {
            enti.forEach(e => {
              e.update()
            })
          } else {
            enti.update()
          }
        })
      } else {
        entity.update()
      }
    })
    if(wantRestart) {
      this.restart()
    }
    if(isCollusion) {
      this.life -= 1
      isCollusion = false
      this.entities.hearts[this.life].isFilled = false
      if(this.life <= 0) {
        this.gameOver()
      }
    }
  }
}

class Sprite 
{
  constructor({
    ctx,
    position = {
      x: 0,
      y: 0
    },
    color = 'black',
    width = 60,
    height = 60,
    stroke = 'white'
  }) {
    this.ctx = ctx;
    this.position = position;
    this.color = color
    this.height = height
    this.width = width
    this.stroke = stroke
    
  }

  draw() {
    this.ctx.beginPath()
    this.ctx.fillStyle = this.color
    this.ctx.strokeStyle = this.stroke
    this.ctx.rect(this.position.x, this.position.y, this.width, this.height)
    this.ctx.fill()
    this.ctx.stroke()
    this.ctx.closePath()
  }

  update() {
    this.draw()
  }
}

class Maze extends Sprite 
{
  constructor({
    ctx,
    position,
    color,
    width,
    height
  }) {
    super({
      ctx,
      position,
      color,
      width,
      height
    })
  }
}

class Wall extends Sprite
{
  constructor({
    ctx,
    position,
    color,
    width,
    height
  }) {
    super({
      ctx,
      position,
      color,
      width,
      height
    })
  }
}

class Player extends Sprite
{
  constructor({
    ctx,
    position,
    color,
    width,
    height,
    wallsPositions,
    finishLine
  }) {
    super({
      ctx,
      position,
      color,
      width,
      height
    })
    this.wallsPositions = wallsPositions
    this.game = new Game();
    this.finishLine = finishLine
  }

  update() {
    super.update()
    this.move()
  }
  collusion() {
    this.wallsPositions.forEach(wall => {
      if(wall.x === this.position.x && wall.y === this.position.y) {
        alert('You hit a wall')
        isCollusion = true
        this.resetPos()
      }
      
    })
    if(this.isFinish()) {
      alert('Berhasil')
      wantRestart = true
      this.resetPos()
    }
    
  }

  resetPos() {
    this.position = {
      x: 200,
      y: 60 * 4
    }
  }

  isFinish() {
    return this.finishLine.x === this.position.x && this.finishLine.y === this.position.y;
    
  }

  move() {
    if(isStarted) {
      if(this.game.keys.ArrowUp.isClicked) {
        if(this.position.y >= this.height) {
          this.position.y -= this.height
        }
        this.collusion()
        this.game.keys.ArrowUp.isClicked = false
      }
      if(this.game.keys.ArrowLeft.isClicked) {
        if(this.position.x >= this.width + 200) {
          this.position.x -= this.width
        }
        this.collusion()
        this.game.keys.ArrowLeft.isClicked = false
      }
      if(this.game.keys.ArrowRight.isClicked) {
        if(this.position.x + this.width < this.width * 10 + 200 || this.position.y === this.finishLine.y) {
          this.position.x += this.width
        }
        this.collusion()
        this.game.keys.ArrowRight.isClicked = false
      }
      if(this.game.keys.ArrowDown.isClicked) {
        if(this.position.y + this.height < this.game.canvas.height) {
          this.position.y += this.height
        }
        this.collusion()
        this.game.keys.ArrowDown.isClicked = false
      }
    }
  }
}

class FinishLine extends Sprite 
{
  constructor({
    ctx,
    position,
    color,
    width,
    height
  }) {
    super({
      ctx,
      position,
      color,
      width,
      height
    })
  }
}

class Heart extends Sprite 
{
  constructor({
    ctx,
    position,
    color,
    width,
    height,
    isFilled = true
  }) {
    super({
      ctx,
      position,
      color,
      width,
      height
    }),
    this.isFilled = true
  }
  draw() {
    this.ctx.beginPath()
    this.ctx.fillStyle = this.color
    this.ctx.strokeStyle = this.stroke
    this.ctx.rect(this.position.x, this.position.y, this.width, this.height)
    if(this.isFilled) {
      this.ctx.fill()
    }
    this.ctx.stroke()
    this.ctx.closePath()
  }
}