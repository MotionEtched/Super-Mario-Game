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
    y: 340,
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
            {x: 750, y: 320}
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
            {x: 750, y: 320}
        ]
    }
]

//Initialize Game

function initGame() {
    player.element = document.getElementById('mario');
    if (!player.element) {
        console.error('Mario element not found');
        return;
    }

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

    const level = levels[levelIndex];
    const gameArea = document.getElementById('game-area');

    //Reset player position
    player.x = 50;
    player.y = 340;
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

        pipe.append(pipeTopLeft, pipeTopRight, pipeBottomLeft, pipeBottomRight);
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
    document.getElementById('game-over-title').textContent = won ? 'Congratulations! You won!' : 'Game Over!';
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

window.addEventListener('keydown', (e) => {
    gameState.keys[e.code] = true;
    gameState.keys[e.key] = true;

    if (['Space', 'ArrowUp', 'KeyW', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    gameState.keys[e.code] = false;
    gameState.keys[e.key] = false;

    if (['Space', 'ArrowUp', 'KeyW', 'ArrowLeft', 'ArrowRight', 'KeyA', 'KeyD'].includes(e.code)) {
        e.preventDefault();
    }
});

//Game Loop

function gameLoop() {
    if (!gameState.gameRunning) return;
    update();
    requestAnimationFrame(gameLoop);
}

//Update Game Logic

function update() {
    console.log(gameState.keys);
    // Handles left and right movement
    if (gameState.keys['ArrowLeft'] || gameState.keys['KeyA'] || gameState.keys['a'] || gameState.keys['A']) {
        player.velocityX = -MOVE_SPEED;
    } else if (gameState.keys['ArrowRight'] || gameState.keys['KeyD'] || gameState.keys['d'] || gameState.keys['D']) {
        player.velocityX = MOVE_SPEED;
    } else {
        player.velocityX *= 0.8;
    }

    //Handle jumping
    if ((gameState.keys['Space'] || gameState.keys[' '] || gameState.keys['ArrowUp'] || gameState.keys['KeyW'] || gameState.keys['w'] || gameState.keys['W']) && player.grounded) {
        player.velocityY = JUMP_FORCE;
        player.grounded = false;
    }

    //Apply gravity
    if(!player.grounded) {
        player.velocityY += GRAVITY;
    }

    //Update player position
    player.x += player.velocityX;
    player.y += player.velocityY;

    //Platform Collision
    player.grounded = false;
    for (let platform of gameObjects.platforms) {
        if (checkCollision(player, platform)) {
            if (player.velocityY > 0) {             // Falling down
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
        }
    }

    //Pipe Collision
    for (let pipe of gameObjects.pipes) {
        if (checkCollision(player, pipe)) {
            if (player.velocityY > 0) {           // Falling down onto pipe
                player.y = pipe.y - player.height;
                player.velocityY = 0;
                player.grounded = true;
            }
        }
    }

    //enemy movement collision
    for (let enemy of gameObjects.enemies) {
        if (!enemy.alive) continue;
        enemy.x += enemy.direction * enemy.speed;

        let onPlatform = false;
        //Reverse direction on platform edges
        for (let platform of gameObjects.platforms) {
            if(enemy.x + enemy.width > platform.x &&
                enemy.x < platform.x + platform.width &&
                enemy.y + enemy.height >= platform.y -5 &&
                enemy.y + enemy.height <= platform.y +5
            ) {
                onPlatform = true;
                break;
            }
        }

        if (!onPlatform || enemy.x <=0 || enemy.x >= 800) {
            enemy.direction *= -1;
        }

        updateElementPosition(enemy.element, enemy.x, enemy.y);

        //Check collision with player-enemy
        if (checkCollision(player, enemy)) {
            if (player.velocityY > 0 && player.y < enemy.y) { // Player is falling onto enemy
                //Jump on enemy
                enemy.alive = false;
                enemy.element.remove();
                player.velocityY = JUMP_FORCE * 0.7;
                gameState.score += 100;
            } else{
                //hit by enemy
                if (player.big) {
                    player.big = false;
                    player.bigTimer = 0;
                    player.element.classList.remove('big');
                    player.width = 20;
                    player.height = 20;
                } else{
                    loselife();
                }
            }
        }
    }

     //coin collection
    for (let coin of gameObjects.coins) {
        if (!coin.collected && checkCollision(player, coin)) {
            coin.collected = true;
            coin.element.remove();
            gameState.score += 50;
        }
    }

    //Surprise blocks interaction
    for (let block of gameObjects.surpriseBlocks) {
        if (!block.hit && checkCollision(player, block) && player.velocityY < 0) {
            block.hit = true;
            block.element.classList.add('hit');

            if (block.type === 'mushroom') {
                player.big = true;
                player.bigTimer = 600; // Big state lasts for 10 seconds at 60fps
                player.element.classList.add('big');
                player.width = 30;
                player.height = 30;
                gameState.score += 100;
            } else if (block.type === 'coin') {
                gameState.score += 50;
            }
        }
    }

    //Pipe interaction(level completion)
    for (let pipe of gameObjects.pipes) {
        if (player.grounded &&
            player.x + player.width > pipe.x &&
            player.x < pipe.x + pipe.width &&
            Math.abs(player.y + player.height - pipe.y) < 5 &&
            gameState.keys['ArrowDown']) {
                nextLevel();

        }
    }

    //Fall death
    if (player.y > 400) {
        loselife();
    }


    updateElementPosition(player.element, player.x, player.y);

    document.getElementById('score').textContent = gameState.score;
     document.getElementById('lives').textContent = gameState.lives;
        document.getElementById('levels').textContent = gameState.level;

}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
    rect1.x + rect1.width > rect2.x &&
    rect1.y < rect2.y + rect2.height &&
    rect1.y + rect1.height > rect2.y;
}

function loselife() {
    gameState.lives--;
    if (gameState.lives <= 0) {
        showGameOver(false);
    } else {
        //Reset player position
        player.x = 50;
        player.y = 340;
        player.velocityX = 0;
        player.velocityY = 0;
        player.big = false;
        player.bigTimer = 0;
        player.element.classList.remove('big');
        player.width = 20;
        player.height = 20;
    }
}


function nextLevel() {
    gameState.level++;
    if (gameState.level > levels.length) {
        showGameOver(true);
    } else {
        loadLevel(gameState.level -1);
    }
}


function restartGame() {
    gameState = {
    score: 0,
    level: 1,
    lives: 3,
    gameRunning: true,
    keys: {}
}
    player.big = false;
    player.bigTimer = 0;
    player.element.classList.remove('big');
    player.width = 20;
    player.height = 20;

    document.getElementById('game-over').style.display = 'none';
    initGame();
}

document.getElementById('restart-button').addEventListener('click', restartGame);


//Start game
initGame();
