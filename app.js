//Game Constants

const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 2.5;
const ENEMY_SPEED = 1;

//Game State

let gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameRunning: true,
    keys: {}
}

//Player Object

let player = {
    element: document.getElementById('mario'),
    x: 50,
    y: 0,
    width: 20,
    height: 20,
    velocityX: 0,
    velocityY: 0,
    grounded: false,
    big: false,
    bigTimer: 0
}


//Game objects arrays

let gameObjects = {
    platforms: [],
    enemies: [],
    coins: [],
    surpriseBlocks: [],
    pipes: [],
}


//Levels

const levels = [
    //Level 1
    {
        platforms: [
            {x: 0, y: 360, width: 400, height: 40, type: 'ground'},
            {x: 500, y: 360, width: 300, height: 40, type: 'ground'},
            {x: 200, y: 280, width: 60, height: 20, type: 'floating'},
            {x: 300, y: 240, width: 60, height: 20, type: 'floating'},
            {x: 600, y: 280, width: 80, height: 20, type: 'floating'}
        ],
        enemies: [
            {x: 250, y:344, type: 'brown'},
            {x: 550, y:344, type: 'brown'}
        ],
        coins: [
            {x: 220, y: 260},
            {x: 320, y: 220},
            {x: 620, y: 260}    
        ],
        surpriseBlocks: [
            {x: 250, y: 220, type: 'mushroom'}
        ],
        pipes: [
            {x: 750, y: 300}
        ]
    },
    //level 2
    {
        platforms: [
            {x: 0, y: 360, width: 400, height: 40, type: 'blue'},
            {x: 300, y: 360, width: 300, height: 40, type: 'blue'},
            {x: 600, y: 280, width: 60, height: 20, type: 'blue'},
            {x: 150, y: 240, width: 60, height: 20, type: 'blue'},
            {x: 250, y: 280, width: 80, height: 20, type: 'blue'},
            {x: 350, y: 280, width: 80, height: 20, type: 'blue'},
            {x: 450, y: 280, width: 80, height: 20, type: 'blue'},
            {x: 550, y: 280, width: 80, height: 20, type: 'blue'}
        ],
        enemies: [
            {x: 350, y:344, type: 'purple'},
            {x: 650, y:344, type: 'purple'},
            {x: 570, y:264, type: 'purple'}
        ],
        coins: [
            {x: 170, y: 280},
            {x: 270, y: 260},
            {x: 370, y: 240},
            {x: 470, y: 220},
            {x: 570, y: 260}   
        ],
        surpriseBlocks: [
            {x: 200, y: 260, type: 'coin'},
            {x: 400, y: 220, type: 'mushroom'}
        ],
        pipes: [
            {x: 750, y: 300}
        ]
    }
]

//Initialize Game

function initGame() {
    loadLevel(gameState.level -1);
    gameLoop();
}

function loadLevel(levelIndex) {
    if (levelIndex >= levels.length) {
        showGameOver(true)
        return;
    }

    //Clearing existing objects
    clearLevel();

    const level = level[levelIndex];
    const gameArea = document.getElementById('game-area');

    //Reset player position
    player.x = 50;
    player.y = 300;
    player.velocityX = 0;
    player.velocityY = 0;
    player.big = false;
    player.bigTimer = 0;
    player.element.className = ''
    updateElementPosition(player.element, player.x, player.y);

    //Create Platforms
    level.platforms.forEach((platformData, index) => {
        const platform = createElement('div', `platform ${platformData.type}`, {
            left: platformData.x +'px',
            top: platformData.y +'px',
            width: platformData.width + 'px',
            height: platformData.height + 'px',
        })
        gameArea.appendChild(platform);
        gameObjects.platforms.push({
            element: platform,
            ...platformData,
            id: 'platform-' + index
        });
    })

    //Create Enemies
    level.enemies.forEach((enemyData, index) => {
        const enemy = createElement('div', `enemy ${enemyData.type}`, {
            left: enemyData.x +'px',
            top: enemyData.y +'px',
        })
        gameArea.appendChild(enemy);
        gameObjects.enemies.push({
            element: enemy,
            x: enemyData.x,
            y: enemyData.y,
            width: 20,
            height: 20,
            direction: -1,
            speed: ENEMY_SPEED,
            id: 'enemy-' + index,
            alive: true
        });
    })

    //Create Coins
    level.coins.forEach((coinData, index) => {
        const coin = createElement('div', 'coin',{
            left: coinData.x +'px',
            top: coinData.y +'px',
        })
        gameArea.appendChild(coin);
        gameObjects.coins.push({
            element: coin,
            x: coinData.x,
            y: coinData.y,
            width: 20,
            height: 20,
            collected: false,
            id: 'coin-' + index
        });
    })

    //Create Surprise Blocks
    level.surpriseBlocks.forEach((blockData, index) => {
        const block = createElement('div', 'surprise-block', {
            left: blockData.x +'px',
            top: blockData.y +'px',
        })
        gameArea.appendChild(block);
        gameObjects.surpriseBlocks.push({
            element: block,
            x: blockData.x,
            y: blockData.y,
            width: 20,
            height: 20,
            type: blockData.type,
            hit: false,
            id: 'block-' + index
        });
    })

    //Create Pipes
    level.pipes.forEach((pipeData, index) => {
        const pipe = createElement('div', 'pipe', {
            left: pipeData.x +'px',
            top: pipeData.y +'px',
        })
        const pipeTopLeft = createElement('div', 'pipe-top');
        const pipeTopRight = createElement('div', 'pipe-top-right');
        const pipeBottomLeft = createElement('div', 'pipe-bottom');
        const pipeBottomRight = createElement('div', 'pipe-bottom-right');

        pipe.appendChild(pipeTopLeft, pipeTopRight, pipeBottomLeft, pipeBottomRight);
        gameArea.appendChild(pipe);
        gameObjects.pipes.push({
            element: pipe,
            x: pipeData.x,
            y: pipeData.y,
            width: 40,
            height: 40,
            id: 'pipe-' + index
        });
    })
}

function updateElementPosition(element, x, y) {
    element.style.left = x + 'px';
    element.style.top = y + 'px';
}

function createElement(type, className, styles = {}) {
    const element = document.createElement('div');
    element.className = className;
    Object.assign(element.style, styles);
    return element;
}

function showGameOver(won) {
    gameState.gameRunning = false;
    document.getElementById('game-over').textContent = won? 'Congratulations! You won!' : 'Game Over!';
    document.getElementById('final-score').textContent = gameState.score;
    document.getElementById('game-over').style.display = 'block';
}

function clearLevel() {
    //const gameArea = document.getElementById('game-area');
    Object.values(gameObjects).flat().forEach(obj => {
        if (obj.element && obj.element.parentNode) {
            obj.element.remove();
        }
    })

    gameObjects = {
        platforms: [],
        enemies: [],
        coins: [],
        surpriseBlocks: [],
        pipes: [],
    }
}

//Input Handling

document.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;

    if (e.code === "Space") {
        e.preventDefault();
    }
});

document.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
});

//Game Loop

function gameLoop() {
    if (!gameState.gameRunning) return;
    update();
    requestAnimationFrame(gameLoop);
}

//Update Game Logic

function update() {

}



//Start game
initGame();