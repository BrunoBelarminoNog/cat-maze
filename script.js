const containerScreenGame = document.getElementById('game');
const containerScreenStartGame = document.getElementById('play');
const containerScreenInstructions = document.getElementById('instructions');
const containerScreenSettings = document.getElementById('settings');
const containerScreenWinGame = document.getElementById('win_game');
const containerMapGame = document.getElementById('container_map_game');
const containerTimerGame = document.getElementById('timer');
const contentTimer = document.getElementById('timer_game')
const btnUp = document.querySelector('.up');
const btnDown = document.querySelector('.down');
const btnRight = document.querySelector('.right');
const btnLeft = document.querySelector('.left');
const btnStart = document.querySelector('.btn_start');
const btnReset = document.querySelector('.reset');
const optionsMenu = document.querySelectorAll('.option_menu');
const effects = document.querySelector('.effects')
const effectsOn = document.querySelector('.effects_on');
const effectsOff = document.querySelector('.effects_off');
const iconEffectOn = document.querySelector('#effects_notification .icon_effects-on');
const iconEffectOff = document.querySelector('#effects_notification .icon_effects-off'); 
const clock = document.getElementById('clock');

const map = [
    "WWWWWWWWWWWWWWWWWWWWW",
    "W   W     W     W W W",
    "W W W WWW WWWWW W W W",
    "W W W   W     W W   W",
    "W WWWWWWW W WWW W W W",
    "W         W     W W W",
    "W WWW WWWWW WWWWW W W",
    "W W   W   W W     W W",
    "W WWWWW W W W WWW W F",
    "S     W W W W W W WWW",
    "WWWWW W W W W W W W W",
    "W     W W W   W W W W",
    "W WWWWWWW WWWWW W W W",
    "W       W       W   W",
    "WWWWWWWWWWWWWWWWWWWWW",
];

let menu = {
    main: true,
    selected: 0,
    playing: false,
    instructions: false,
    settings: [false, false, {effects: true, selected: 0}],
    winnerScreen: false
}

let timer
let time = null;
let maxTimer = true
let min = 0
let sec = 0


map.forEach((element) => {
    const line = element.split("")
    line.map(e => {
        const containerCell = document.createElement('div')

        if(e === "W") {
            containerCell.classList.add('wall')
            containerCell.classList.add('pixel')
        }  else if(e === "S") {
            containerCell.classList.add('start')
            containerCell.classList.add('player')
            containerCell.classList.add('floor')
            containerCell.classList.add('pixel')
        } else if(e === "F") {
            containerCell.classList.add('finished')
            containerCell.classList.add('floor')
            containerCell.classList.add('pixel')
        } else {
            containerCell.classList.add('floor')
            containerCell.classList.add('pixel')
        }

        containerMapGame.appendChild(containerCell)
    })
})

document.addEventListener('keydown', (event) => {

    if (menu.main) {
        effectsSounds('click')
        selectOptionMenu(event)
        return
    }
   
    if (menu.playing) {
        effectsSounds('move')
        movePlayer(event)
        return
    } 

    if(menu.winnerScreen) {
        effectsSounds('click')
        returnMainMenu(event)
        return
    }

    if(menu.instructions) {
        effectsSounds('click')
        setInstructions(event);
        return
    }

    if(menu.settings[0] && menu.settings[1] === false) {
        effectsSounds('click')
        getConfiguration(event)
        return
    }

    if(menu.settings[0] && menu.settings[1]) {
        effectsSounds('click')
        setConfiguration(event)
        return
    }

});

document.addEventListener('keyup', (e) => {

    if(e.key === "ArrowRight") {
        btnRight.classList.remove('press_right')
    } else if(e.key === "ArrowLeft") {
        btnLeft.classList.remove('press_left')
    } else if (e.key === "ArrowUp") {
        btnUp.classList.remove('press_up')
    } else if (e.key === "ArrowDown") {
        btnDown.classList.remove('press_down')
    } else if (e.key === "Enter") {
        btnStart.classList.remove('press_btn_start')
    } else if (e.key === "Delete") {
        btnReset.classList.remove('press_reset')
    }
})


let position = ""
map.forEach((e, i) => {
    e.indexOf('S') !== -1 ? position = [i, e.indexOf('S')]: null
})

const mapGame = document.querySelectorAll('.pixel')
const totalPixelsGame = (map[0].length * map.length)
let previousPixelGame = 189

function movePlayer(event) {

    if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');
       if(map[position[0] - 1][position[1]] === "W" || position[0] === 0) {
           event.preventDefault()
        } else {
           position[0] = position[0] - 1
        }
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');
        if(map[position[0] + 1 ][position[1]] === "W" || position[0] === map.length - 1) {
            event.preventDefault()
         } else {
            position[0] = position[0] + 1
         }
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')
        if(map[position[0]][position[1] - 1] === "W" || position[1] === 0) {
            event.preventDefault()
        } else {
            position[1] = position[1] - 1
        }
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
        if(map[position[0]][position[1] + 1] === "W" || position[1] === map[0].length - 1) {
            event.preventDefault()
        } else {
            position[1] = position[1] + 1
        }
    }

    if(event.key === "Delete") {
        btnReset.classList.add('press_reset')

        menu.playing = false;
        menu.main = true;

        clearInterval(timer)
        time = null
        contentTimer.innerHTML = "0:00"

        containerTimerGame.classList.add('hidden');

        containerScreenGame.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden')
        
        position = [9, 0]
    }

    renderPosition(position)
}

function renderPosition(position) {
    const pixelGame = (position[0] * 21) + (position[1])

    mapGame[previousPixelGame].classList.remove('player')
    mapGame[pixelGame].classList.add('player')

    previousPixelGame = pixelGame

    checkResult(pixelGame)
}

function timerGame() {
    if(time >= 60) {

        min = Math.floor(time / 60)
        sec = time - (min * 60)
        if(sec < 10) {
            sec = `0${sec}`
        }
    } 

    if(time < 60 && time > 0) {
        min = 0
        sec = time
        if(sec < 10) {
            sec = `0${sec}`
        }
    }

    if(!time) {
        min = 0
        sec = `00`
    }

    contentTimer.innerHTML = `${min}:${sec}`

    time = time + 1
}

function checkResult(pixelMap) {
    if(pixelMap === 188) {
        containerScreenGame.classList.add('hidden');
        containerScreenWinGame.classList.remove('hidden');
        
        clearInterval(timer)

        setTimeout(()=> {
            effectsSounds('win')
        }, 500)

        menu.playing = false
        menu.winnerScreen = true

        position = [9, 0]
        renderPosition(position)
    }
}

function returnMainMenu(event) {
    if(event.key === "Enter" || event.key === "Delete") {
        event.key === "Enter" ? btnStart.classList.add('press_btn_start') : btnReset.classList.add('press_reset')
        menu.winnerScreen = false
        menu.main = true

        time = null
        contentTimer.innerHTML = "0:00"

        containerTimerGame.classList.add('hidden');
        containerScreenWinGame.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        event.preventDefault()
    }
}

function selectOptionMenu(event) {
    if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');
       
        if(menu.selected === 1){
            optionsMenu[1].classList.remove('selected');
            optionsMenu[0].classList.add('selected');

            menu.selected = 0
        } else if (menu.selected === 2) {
            optionsMenu[2].classList.remove('selected');
            optionsMenu[1].classList.add('selected');

            menu.selected = 1
        } else {
            event.preventDefault()
        }

    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');

        if(menu.selected === 0){
            optionsMenu[0].classList.remove('selected')
            optionsMenu[1].classList.add('selected')

            menu.selected = 1
        } else if (menu.selected === 1){
            optionsMenu[1].classList.remove('selected')
            optionsMenu[2].classList.add('selected')

            menu.selected = 2
        } else {
            event.preventDefault()
        }
        
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')
        
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
        if(menu.selected === 0) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenGame.classList.remove('hidden');
            menu.playing = true;
            menu.main = false;

            timer = setInterval(timerGame, 1000);
            containerTimerGame.classList.remove('hidden');

            event.preventDefault()
        } else if (menu.selected === 1) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenInstructions.classList.remove('hidden');
            menu.instructions = true;
            menu.main = false;
            event.preventDefault()
        } else if (menu.selected === 2) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenSettings.classList.remove('hidden');
            menu.settings[0] = true;
            menu.main = false;
            event.preventDefault()
        }

    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')

        if(menu.selected === 0) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenGame.classList.remove('hidden');
            menu.playing = true;
            menu.main = false;

            timer = setInterval(timerGame, 1000);
            containerTimerGame.classList.remove('hidden');
         
            event.preventDefault()
        } else if (menu.selected === 1) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenInstructions.classList.remove('hidden');
            menu.instructions = true;
            menu.main = false;

            event.preventDefault()
        } else if (menu.selected === 2) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenSettings.classList.remove('hidden');
            menu.settings[0] = true;
            menu.main = false;

            event.preventDefault()
        }
    }
}

function setInstructions(event) {
    if(event.key === "Delete" ) {
        btnReset.classList.add('press_reset')

        containerScreenInstructions.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        menu.instructions = false;

        menu.main = true
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')

        containerScreenInstructions.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        menu.instructions = false;
        menu.main = true
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');
    } else if (event.key === "ArrowUp"){
        btnUp.classList.add('press_up');
    }
}

function getConfiguration(event) {

    if(menu.settings[0]) {

        if(event.key === "Delete" ) {
            btnReset.classList.add('press_reset')

            containerScreenSettings.classList.add('hidden');
            containerScreenStartGame.classList.remove('hidden');
            menu.settings[0] = false;
            menu.main = true
            event.preventDefault()
    
        } else if (event.key === "ArrowLeft") {
            btnLeft.classList.add('press_left')
    
            containerScreenSettings.classList.add('hidden');
            containerScreenStartGame.classList.remove('hidden');
            menu.settings[0] = false;
            menu.main = true
            event.preventDefault()
    
        } else if (event.key === "ArrowRight") {
            btnRight.classList.add('press_right')
            effects.classList.remove('selected');

            if(menu.settings[2].effects) {
                effectsOn.classList.add('selected')
                menu.settings[2].selected = 0
                menu.settings[1] = true
            } else {
                effectsOff.classList.add('selected')
                menu.settings[2].selected = 1
                menu.settings[1] = true
            }

            event.preventDefault()

        } else if (event.key === "ArrowDown") {
            btnDown.classList.add('press_down');
        } else if (event.key === "ArrowUp"){
            btnUp.classList.add('press_up');
    
        } else if (event.key === "Enter") {
            btnStart.classList.add('press_btn_start')
            effects.classList.remove('selected');

            if(menu.settings[2].effects) {
                effectsOn.classList.add('selected')
                menu.settings[2].selected = 0
                menu.settings[1] = true
            } else {
                effectsOff.classList.add('selected')
                menu.settings[2].selected = 1
                menu.settings[1] = true
            }

            event.preventDefault()
        }
    }
}

function setConfiguration(event) {

    if(menu.settings[1]) {

        if(event.key === "Delete" ) {
            btnReset.classList.add('press_reset')

            containerScreenSettings.classList.add('hidden');
            effectsOff.classList.remove('selected');
            effectsOn.classList.remove('selected');
            effects.classList.add('selected')
            containerScreenStartGame.classList.remove('hidden');
            menu.settings[0] = false;
            menu.settings[1] = false;
            menu.main = true
            
            event.preventDefault()
        } else if (event.key === "ArrowLeft") {
            btnLeft.classList.add('press_left')
    
            if(menu.settings[2].selected === 1) {
                effectsOn.classList.add('selected');
                effectsOff.classList.remove('selected');
                
                menu.settings[2].selected = 0
            } else if (menu.settings[2].selected === 0) {
                effectsOn.classList.remove('selected');
                effects.classList.add('selected');

                menu.settings[1] = false
                event.preventDefault()
            } else {
                event.preventDefault()
            }
    
        } else if (event.key === "ArrowRight") {
            btnRight.classList.add('press_right')

            if(menu.settings[2].selected === 0) {
                effectsOn.classList.remove('selected');
                effectsOff.classList.add('selected');
                menu.settings[2].selected = 1
            }
            
            event.preventDefault()
        } else if (event.key === "ArrowDown") {
            btnDown.classList.add('press_down');
        } else if (event.key === "ArrowUp"){
            btnUp.classList.add('press_up');
    
        } else if (event.key === "Enter") {
            btnStart.classList.add('press_btn_start')
            
            if(menu.settings[2].selected === 0) {
                effectsOff.classList.remove('active');
                effectsOn.classList.add('active');
                menu.settings[2].effects = true;
                iconEffectOff.classList.add('hidden');
                iconEffectOn.classList.remove('hidden');

            } else {
                effectsOff.classList.add('active');
                effectsOn.classList.remove('active');
                menu.settings[2].effects = false;
                iconEffectOff.classList.remove('hidden');
                iconEffectOn.classList.add('hidden');
            }
            event.preventDefault()
        }
    }
}

function effectsSounds(effect) {
    if(!menu.settings[2].effects) {
        return
    }

    if(effect === "click") {
        const soundClick = new Audio("./assets/sounds/click.wav");
        soundClick.play();
    } else if(effect === "move") {
        const soundMove = new Audio("./assets/sounds/move.wav");
        soundMove.play()
    } else if(effect === "win") {
        const soundWin = new Audio("./assets/sounds/final-level.wav");
        soundWin.play()
    }
}

setInterval(function () {
    clock.innerHTML = ((new Date).toLocaleString().substr(11, 5));  
}, 1000);
    
