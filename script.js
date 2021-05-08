const containerConsole = document.querySelector('.console')
const containerScreenGame = document.getElementById('game');
const containerScreenStartGame = document.getElementById('play');
const containerScreenRecords = document.getElementById('records');
const containerScreenInstructions = document.getElementById('instructions');
const containerScreenSettings = document.getElementById('settings');
const containerScreenWinGame = document.getElementById('win_game');
const containerMapGame = document.getElementById('container_map_game');
const containerTimerGame = document.getElementById('timer');
const contentTimer = document.getElementById('timer_game');
const alertWin = document.querySelector('.alert_win');
const alertRecord = document.querySelector('.alert_record')
const btnUp = document.querySelector('.up');
const btnDown = document.querySelector('.down');
const btnRight = document.querySelector('.right');
const btnLeft = document.querySelector('.left');
const btnStart = document.querySelector('.btn_start');
const btnReset = document.querySelector('.btn_reset');
const optionsMenu = document.querySelectorAll('.option_menu');
const optionsSettings = document.querySelectorAll('.option_settings');
const themeOptions = document.querySelectorAll('.theme_option');
const themeClassic = document.querySelector('.theme_classic');
const themeNight = document.querySelector('.theme_night');
const themeSweet = document.querySelector('.theme_sweet');
const effects = document.querySelector('.effects')
const effectsOn = document.querySelector('.effects_on');
const effectsOff = document.querySelector('.effects_off');
const iconEffectOn = document.querySelector('#effects_notification .icon_effects-on');
const iconEffectOff = document.querySelector('#effects_notification .icon_effects-off');
const clock = document.getElementById('clock');
const soundClick = new Audio("./assets/sounds/click.wav");
const soundMove = new Audio("./assets/sounds/move.wav");
const soundWin = new Audio("./assets/sounds/final_level.wav");
const meow = new Audio("./assets/sounds/attention-meow.wav");
const helpKeyboardArrows = document.querySelector('.keyboard_arrows');
const helpKeyboardEnter = document.querySelector('.keyboard_enter');
const helpKeyboardDelete = document.querySelector('.keyboard_delete');

const Menu = {
    main: {
        show: true,
        selected: 0
    },
    playing: false,
    records: false,
    instructions: false,
    settings: {
        show: false,
        selected: 0,
        effects: {
            show: false,
            turned_on: true,
            selected: 0
        },
        themes: {
            show: false,
            list: ['default', 'night', 'sweet'],
            selected: 0
        }
    },
    winnerScreen: false,
    consoleBack: false
}

const Record = {
    records: [],
    setRecord: (records) => {
        localStorage.setItem('records', records)
    },
    getRecord: () => {
        const result = localStorage.getItem('records')

        if(result) {
            Record.records = result.split(",")
        }

        return result
    },
    isRecord: (time) => {
        if(Record.records) {
            if(time < Math.max(...Record.records) || Record.records.length < 3) {

                if(Record.records.length === 3) Record.records.pop()
    
                Record.records.push(time)
    
                Record.records.sort((a, b) => a - b)
                Record.setRecord(Record.records)
    
                return true
            }
        } else {
            Record.records = [time]
            Record.setRecord(Record.records)
    
            return true
        }
        
        return false
    }
}
Record.getRecord()

let map 
let mapGame
let totalPixelsGame
let previousPixelGame
let finalPixelGame
let position

let recordGame = false

let timer
let time = null;
let min = 0
let sec = 0

document.addEventListener('keydown', (event) => {

    if (Menu.main.show) {
        effectsSounds('click')
        selectOptionMenu(event)
        return
    }

    if (Menu.playing) {
        effectsSounds('move')
        movePlayer(event)
        return
    }

    if (Menu.winnerScreen) {
        effectsSounds('click')
        returnMainMenu(event)
        return
    }

    if(Menu.records) {
        effectsSounds('click')
        setRecords(event)
        return
    }

    if (Menu.instructions) {
        effectsSounds('click')
        setInstructions(event);
        return
    }

    if (Menu.settings.show && !Menu.settings.effects.show && !Menu.settings.themes.show) {
        effectsSounds('click')
        getConfiguration(event)
        return
    }

    if (Menu.settings.show && (Menu.settings.effects.show || Menu.settings.themes.show)) {
        effectsSounds('click')
        setConfiguration(event)
        return
    }

    if(Menu.consoleBack) {
        effectsSounds('click')
        navConsoleBack(event)
        return
    }

});

document.addEventListener('keyup', (e) => {

    if (e.key === "ArrowRight") {
        btnRight.classList.remove('press_right')
    } else if (e.key === "ArrowLeft") {
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

function currentMap() {
    let previousMap = localStorage.getItem('mapID')
    previousMap ? previousMap = parseInt(previousMap) : null
    
    if(previousMap === null || previousMap === 5) {
        previousMap = 0
        localStorage.setItem('mapID', previousMap)

        return previousMap
    }

    const currentMap = previousMap + 1
    localStorage.setItem('mapID', currentMap);

    return currentMap
}   

function newGame() {
    containerMapGame.innerHTML = "";

    const mapId = currentMap()
    map = maps[mapId]

    map.forEach((element) => {
        const line = element.split("")
        line.map(e => {
            const containerCell = document.createElement('div')
    
            if (e === "W") {
                containerCell.classList.add('wall')
                containerCell.classList.add('pixel')
            } else if (e === "S") {
                containerCell.classList.add('start')
                containerCell.classList.add('player')
                containerCell.classList.add('floor')
                containerCell.classList.add('pixel')
            } else if (e === "F") {
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

    let endPosition

    map.forEach((e, i) => {
        e.indexOf('S') !== -1 ? position = [i, e.indexOf('S')] : null
        e.indexOf('F') !== -1 ? endPosition = [i, e.indexOf('F')] : null

    })

    mapGame = document.querySelectorAll('.pixel');
    totalPixelsGame = (map[0].length * map.length);
    previousPixelGame = position[0] * 21 + position[1];
    finalPixelGame = endPosition[0] * 21 + endPosition[1]
}

function movePlayer(event) {

    if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');

        if (map[position[0] - 1][position[1]] === "W" || position[0] === 0) {
            // event.preventDefault()
        } else {
            position[0] = position[0] - 1
        }
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');
        if (map[position[0] + 1][position[1]] === "W" || position[0] === map.length - 1) {
            // event.preventDefault()
        } else {
            position[0] = position[0] + 1
        }
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')
        if (map[position[0]][position[1] - 1] === "W" || position[1] === 0) {
            // event.preventDefault()
        } else {
            position[1] = position[1] - 1
        }
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
        if (map[position[0]][position[1] + 1] === "W" || position[1] === map[0].length - 1) {
            // event.preventDefault()
        } else {
            position[1] = position[1] + 1
        }
    }
    
    if(event.key === "Enter") {
        btnStart.classList.add('press_btn_start')
    }

    if (event.key === "Delete") {
        btnReset.classList.add('press_reset')

        Menu.playing = false;
        Menu.main.show = true;

        clearInterval(timer)
        time = null
        contentTimer.innerHTML = "0:00"

        containerTimerGame.classList.add('hidden');
        containerScreenGame.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden')

        position = [9, 0]
    }


    renderPosition(position, event)
}

function renderPosition(position, event) {
    const pixelGame = (position[0] * 21) + (position[1])

    mapGame[previousPixelGame].classList.remove('player')
    mapGame[previousPixelGame].classList.remove('moveUp')
    mapGame[previousPixelGame].classList.remove('moveRight')
    mapGame[previousPixelGame].classList.remove('moveDown')
    mapGame[previousPixelGame].classList.remove('moveLeft')

    mapGame[pixelGame].classList.add('player')

    if(event) {
        if (event.key === "ArrowUp") {
            mapGame[pixelGame].classList.add('moveUp');
            setTimeout (()=>{
            }, 100)
        } else if (event.key === "ArrowRight") {
            mapGame[pixelGame].classList.add('moveRight');
            setTimeout (()=>{
            }, 100)
        } else if (event.key === "ArrowDown") {
            mapGame[pixelGame].classList.add('moveDown');
            setTimeout (()=>{
            }, 100)
        } else if (event.key === "ArrowLeft") {
            mapGame[pixelGame].classList.add('moveLeft');
            setTimeout (()=>{
            }, 100)
        }
    }
    
    previousPixelGame = pixelGame

    checkResult(pixelGame)
}

function timerGame() {
    if (time >= 60) {

        min = Math.floor(time / 60)
        sec = time - (min * 60)
        if (sec < 10) {
            sec = `0${sec}`
        }
    }

    if (time < 60 && time > 0) {
        min = 0
        sec = time
        if (sec < 10) {
            sec = `0${sec}`
        }
    }

    if (!time) {
        min = 0
        sec = `00`
    }

    contentTimer.innerHTML = `${min}:${sec}`

    time = time + 1
}

function checkResult(pixelMap) {
    if (pixelMap === finalPixelGame) {
        containerScreenGame.classList.add('hidden');
        containerScreenWinGame.classList.remove('hidden');

        clearInterval(timer)

        recordGame = Record.isRecord(time - 1)

        setTimeout(() => {
            effectsSounds('win')
        }, 500)

        if(recordGame) {
            alertRecord.classList.remove('hidden');
            alertWin.classList.add('hidden');
        } else {
            alertRecord.classList.add('hidden');
            alertWin.classList.remove('hidden');
        }

        Menu.playing = false
        Menu.winnerScreen = true

        position = [9, 0]
        renderPosition(position)
    }
}

function returnMainMenu(event) {
    if (event.key === "Enter" || event.key === "Delete") {
        event.key === "Enter" ? btnStart.classList.add('press_btn_start') : btnReset.classList.add('press_reset')
        Menu.winnerScreen = false
        Menu.main.show = true

        time = null
        recordGame = false
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

        if (Menu.main.selected === 1) {
            optionsMenu[1].classList.remove('selected');
            optionsMenu[0].classList.add('selected');

            Menu.main.selected = 0
        } else if (Menu.main.selected === 2) {
            optionsMenu[2].classList.remove('selected');
            optionsMenu[1].classList.add('selected');

            Menu.main.selected = 1
        } else if (Menu.main.selected === 3){
            optionsMenu[3].classList.remove('selected')
            optionsMenu[2].classList.add('selected')

            Menu.main.selected = 2
        }

        event.preventDefault();

    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');

        if (Menu.main.selected === 0) {
            optionsMenu[0].classList.remove('selected')
            optionsMenu[1].classList.add('selected')

            Menu.main.selected = 1
        } else if (Menu.main.selected === 1) {
            optionsMenu[1].classList.remove('selected')
            optionsMenu[2].classList.add('selected')

            Menu.main.selected = 2
        } else if (Menu.main.selected === 2){
            optionsMenu[2].classList.remove('selected')
            optionsMenu[3].classList.add('selected')

            Menu.main.selected = 3
        }

        event.preventDefault();
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')

    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
        if (Menu.main.selected === 0) {
            newGame()

            containerScreenStartGame.classList.add('hidden');
            containerScreenGame.classList.remove('hidden');
            Menu.playing = true;
            Menu.main.show = false;

            timer = setInterval(timerGame, 1000);
            containerTimerGame.classList.remove('hidden');

            event.preventDefault()
        } else if (Menu.main.selected === 1) {
            updateRecords();

            containerScreenStartGame.classList.add('hidden');
            containerScreenRecords.classList.remove('hidden');
            Menu.records = true
            Menu.main.show = false;
            event.preventDefault()
        } else if (Menu.main.selected === 2) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenInstructions.classList.remove('hidden');
            Menu.instructions = true;
            Menu.main.show = false;
            event.preventDefault()
        } else if (Menu.main.selected === 3) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenSettings.classList.remove('hidden');
            Menu.settings.show = true;
            Menu.main.show = false;
            event.preventDefault()
        }

    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')

        if (Menu.main.selected === 0) {
            newGame()
            containerScreenStartGame.classList.add('hidden');
            containerScreenGame.classList.remove('hidden');
            Menu.playing = true;
            Menu.main.show = false;

            timer = setInterval(timerGame, 1000);
            containerTimerGame.classList.remove('hidden');

            event.preventDefault()
        } else if (Menu.main.selected === 1) {
            updateRecords();

            containerScreenStartGame.classList.add('hidden');
            containerScreenRecords.classList.remove('hidden');
            Menu.records = true
            Menu.main.show = false;
            event.preventDefault()
        } else if (Menu.main.selected === 2) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenInstructions.classList.remove('hidden');
            Menu.instructions = true;
            Menu.main.show = false;
            event.preventDefault()
        } else if (Menu.main.selected === 3) {
            containerScreenStartGame.classList.add('hidden');
            containerScreenSettings.classList.remove('hidden');
            Menu.settings.show = true;
            Menu.main.show = false;
            event.preventDefault()
        }

    } else if (event.key === "Delete") {
        btnReset.classList.add('press_reset');
    }
}

function setRecords(event) {
    if (event.key === "Delete") {
        btnReset.classList.add('press_reset')

        containerScreenRecords.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        Menu.records = false;

        Menu.main.show = true
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')

        containerScreenRecords.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        Menu.records = false;
        Menu.main.show = true
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');
    } else if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');
    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')
    }
}

function setInstructions(event) {
    if (event.key === "Delete") {
        btnReset.classList.add('press_reset')

        containerScreenInstructions.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        Menu.instructions = false;

        Menu.main.show = true
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')

        containerScreenInstructions.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        Menu.instructions = false;
        Menu.main.show = true
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');
    } else if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');
    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')
    }
}

function getConfiguration(event) {

    if (event.key === "Delete") {
        btnReset.classList.add('press_reset')

        containerScreenSettings.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        optionsSettings[1].querySelector('p').classList.remove('selected');
        optionsSettings[0].querySelector('p').classList.add('selected');
        Menu.settings.show = false;
        Menu.settings.selected = 0
        Menu.main.show = true
        event.preventDefault()

    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')

        containerScreenSettings.classList.add('hidden');
        containerScreenStartGame.classList.remove('hidden');
        optionsSettings[1].querySelector('p').classList.remove('selected');
        optionsSettings[0].querySelector('p').classList.add('selected');
        Menu.settings.show = false;
        Menu.settings.selected = 0
        Menu.main.show = true
        event.preventDefault()

    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')

        if (Menu.settings.selected === 0) {
            optionsSettings[0].querySelector('p').classList.remove('selected');
            Menu.settings.effects.show = true

            if (Menu.settings.effects.turned_on) {
                effectsOn.classList.add('selected')
                Menu.settings.effects.selected = 0
            } else {
                effectsOff.classList.add('selected')
                Menu.settings.effects.selected = 1
            }


        } else if (Menu.settings.selected === 1) {
            optionsSettings[1].querySelector('p').classList.remove('selected');

            if (Menu.settings.themes.selected === 0) {
                themeClassic.classList.add('selected')
            } else if (Menu.settings.themes.selected === 1) {
                themeNight.classList.add('selected')
            } else if (Menu.settings.themes.selected === 2) {
                themeSweet.classList.add('selected')
            }

            Menu.settings.themes.show = true

        }

        event.preventDefault()

    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');

        if (Menu.settings.selected === 0) {
            optionsSettings[0].querySelector('p').classList.remove('selected');
            optionsSettings[1].querySelector('p').classList.add('selected');

            Menu.settings.selected = 1
        }

        event.preventDefault()

    } else if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');

        if (Menu.settings.selected === 1) {
            optionsSettings[1].querySelector('p').classList.remove('selected');
            optionsSettings[0].querySelector('p').classList.add('selected');

            Menu.settings.selected = 0
        } else {
            event.preventDefault()
        }

    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')

        if (Menu.settings.selected === 0) {
            optionsSettings[0].querySelector('p').classList.remove('selected');

            if (Menu.settings.effects.turned_on) {
                effectsOn.classList.add('selected')
            } else {
                effectsOff.classList.add('selected')
            }

            Menu.settings.effects.show = true

        } else if (Menu.settings.selected === 1) {
            optionsSettings[1].querySelector('p').classList.remove('selected');

            if (Menu.settings.themes.selected === 0) {
                themeClassic.classList.add('selected')
            } else if (Menu.settings.themes.selected === 1) {
                themeNight.classList.add('selected')
            } else if (Menu.settings.themes.selected === 2) {
                themeSweet.classList.add('selected')
            }

            Menu.settings.themes.show = true
        }

        event.preventDefault()
    }
}

function setConfiguration(event) {

    if (event.key === "Delete") {
        btnReset.classList.add('press_reset')

        containerScreenSettings.classList.add('hidden');
        effectsOff.classList.remove('selected');
        effectsOn.classList.remove('selected');
        themeClassic.classList.remove('selected');
        themeNight.classList.remove('selected');
        themeSweet.classList.remove('selected');
        containerScreenStartGame.classList.remove('hidden');
        optionsSettings[0].querySelector('p').classList.add('selected');
        optionsSettings[1].querySelector('p').classList.remove('selected');
        Menu.settings.show = false;
        Menu.settings.effects.show = false;
        Menu.settings.themes.show = false;
        Menu.settings.selected = 0
        Menu.main.show = true

        event.preventDefault()
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')

        if (Menu.settings.effects.show) {

            if (Menu.settings.effects.selected === 1) {
                effectsOn.classList.add('selected');
                effectsOff.classList.remove('selected');

                Menu.settings.effects.selected = 0
            } else if (Menu.settings.effects.selected === 0) {
                effectsOn.classList.remove('selected');
                optionsSettings[0].querySelector('p').classList.add('selected');

                Menu.settings.effects.show = false
            }
            event.preventDefault()

        } else if (Menu.settings.themes.show) {
            themeOptions[Menu.settings.themes.selected].classList.remove('selected');
            optionsSettings[1].querySelector('p').classList.add('selected');

            Menu.settings.themes.show = false
        }

    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')

        if (Menu.settings.effects.show) {
            if (Menu.settings.effects.selected === 0) {
                effectsOn.classList.remove('selected');
                effectsOff.classList.add('selected');
                Menu.settings.effects.selected = 1
            }
        }

        event.preventDefault()
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');

        if (Menu.settings.themes.show && Menu.settings.themes.selected < 2 && Menu.settings.themes.selected >= 0) {
            themeOptions[Menu.settings.themes.selected].classList.remove('selected');
            themeOptions[Menu.settings.themes.selected + 1].classList.add('selected');

            Menu.settings.themes.selected++
        }

        event.preventDefault()

    } else if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');

        if (Menu.settings.themes.show && Menu.settings.themes.selected <= 2 && Menu.settings.themes.selected > 0) {
            themeOptions[Menu.settings.themes.selected].classList.remove('selected');
            themeOptions[Menu.settings.themes.selected - 1].classList.add('selected');

            Menu.settings.themes.selected--
        }

        event.preventDefault()

    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')

        if (Menu.settings.effects.show) {

            if (Menu.settings.effects.selected === 0) {
                effectsOff.classList.remove('active');
                effectsOn.classList.add('active');
                Menu.settings.effects.turned_on = true;
                iconEffectOff.classList.add('hidden');
                iconEffectOn.classList.remove('hidden');

            } else {
                effectsOff.classList.add('active');
                effectsOn.classList.remove('active');
                Menu.settings.effects.turned_on = false;
                iconEffectOff.classList.remove('hidden');
                iconEffectOn.classList.add('hidden');

            }

        } else if (Menu.settings.themes.show) {

            if (Menu.settings.themes.selected === 0) {
                document.querySelector('html').classList.add(`${Menu.settings.themes.list[0]}`)
                document.querySelector('html').classList.remove(`theme-${Menu.settings.themes.list[1]}`)
                document.querySelector('html').classList.remove(`theme-${Menu.settings.themes.list[2]}`)
            } else if (Menu.settings.themes.selected === 1) {
                document.querySelector('html').classList.remove(`${Menu.settings.themes.list[0]}`)
                document.querySelector('html').classList.add(`theme-${Menu.settings.themes.list[1]}`)
                document.querySelector('html').classList.remove(`theme-${Menu.settings.themes.list[2]}`)
            } else if (Menu.settings.themes.selected === 2) {
                document.querySelector('html').classList.remove(`${Menu.settings.themes.list[0]}`)
                document.querySelector('html').classList.remove(`theme-${Menu.settings.themes.list[1]}`)
                document.querySelector('html').classList.add(`theme-${Menu.settings.themes.list[2]}`)
            }

            themeOptions.forEach((el, i) => {
                if (i === Menu.settings.themes.selected) {
                    el.classList.add('active')
                } else {
                    el.classList.remove('active')
                }
            })

        }

        event.preventDefault()
    }

}

function effectsSounds(effect) {
    if (!Menu.settings.effects.turned_on) {
        return
    }

    if (effect === "click") {
        soundClick.play();
    } else if (effect === "move") {
        soundMove.play()
    } else if (effect === "win") {
        soundWin.play()
    }
}

setInterval(function () {
    clock.innerHTML = ((new Date).toLocaleString().substr(11, 5));
}, 1000);

$('.js-tilt').tilt({
    glare: true,
    maxGlare: .4,
    perspective: 800,
    speed: 1000
})

function updateRecords() {
    containerScreenRecords.querySelector('.records_times').innerHTML = ""
    let minutes
    let seconds
    
    if(Record.records.length === 0) {
        containerScreenRecords.querySelector('.records_times').innerHTML = `<p>Ainda não possui nenhum record gravado!</p>`
    }

    Record.records.forEach((el, index) => {
        const containerRank = document.createElement('div');
        const rankIndex = document.createElement('span');
        const rankContent = document.createElement('span');

        containerRank.classList.add('record_item');
        rankIndex.classList.add('record_index');
        rankContent.classList.add('record_content');


        if (el >= 60) {

            minutes = Math.floor(el / 60)
            if(minutes < 60) {
                minutes = `0${minutes}`
            }
            seconds = el - (minutes * 60)
            if (seconds < 10) {
                seconds = `0${seconds}`
            }
        }
    
        if (el < 60 && el > 0) {
            minutes = `00`
            seconds = el
            if (seconds < 10) {
                seconds = `0${seconds}`
            }
        }

        rankIndex.innerText = `${index + 1}º - `
        rankContent.innerText = `${minutes}:${seconds}`
        
        containerRank.appendChild(rankIndex);
        containerRank.appendChild(rankContent);
        containerScreenRecords.querySelector('.records_times').appendChild(containerRank);
    })
}

let audioMeowControl = 0
let controlFlip

containerConsole.addEventListener('click', () => {
    containerConsole.querySelector('.console-inner').classList.toggle('flip')
    
    if(Menu.main.show) {
        Menu.main.show = false;
        Menu.consoleBack = true;    
        controlFlip = 'main'
    } else if(Menu.instructions ){
        Menu.instructions = false;
        Menu.consoleBack = true; 
        controlFlip = 'instructions'
    } else if(Menu.settings.show  ){
        Menu.settings.show  = false;
        Menu.consoleBack = true; 
        controlFlip = 'settings'
    } else if(Menu.winnerScreen ){
        Menu.winnerScreen = false;
        Menu.consoleBack = true; 
        controlFlip = 'winnerScreen'
    } else if(Menu.playing ){
        Menu.playing = false;
        Menu.consoleBack = true; 
        controlFlip = 'playing'
    } else {
        if(controlFlip === 'main') {
            Menu.main.show = true;
        } else if (controlFlip === "instructions") {
            Menu.instructions = true
        } else if (controlFlip === "settings") {
            Menu.settings.show = true
        } else if (controlFlip === "winnerScreen") {
            Menu.winnerScreen = true
        } else if (controlFlip === "playing") {
            Menu.playing = true
        } 
        Menu.consoleBack = false;
    }
   
    if(audioMeowControl === 0) {
        audioMeowControl = 1
    } else {
        meow.play()
        audioMeowControl = 0
    }
})

function navConsoleBack(event) {
    if (event.key === "Delete") {
        btnReset.classList.add('press_keyboard_delete')
        helpKeyboardDelete.classList.add('press_keyboard')
        setTimeout(()=> {
            helpKeyboardDelete.classList.remove('press_keyboard')
        }, 300)

        if(controlFlip === 'main') {
            Menu.main.show = true;
        } else if (controlFlip === "instructions") {
            Menu.instructions = true
        } else if (controlFlip === "settings") {
            Menu.settings.show = true
        } else if (controlFlip === "winnerScreen") {
            Menu.winnerScreen = true
        } else if (controlFlip === "playing") {
            Menu.playing = true
        } 
        Menu.consoleBack = false;
        setTimeout(()=> {
            containerConsole.querySelector('.console-inner').classList.remove('flip')

            if(audioMeowControl === 0) {
                audioMeowControl = 1
            } else {
                meow.play()
                audioMeowControl = 0
            }
        }, 400)
    } else if (event.key === "ArrowLeft") {
        btnLeft.classList.add('press_left')
        helpKeyboardArrows.classList.add('press_keyboard')
        setTimeout(()=> {
            helpKeyboardArrows.classList.remove('press_keyboard')
        }, 300)
    } else if (event.key === "ArrowRight") {
        btnRight.classList.add('press_right')
        helpKeyboardArrows.classList.add('press_keyboard')
        setTimeout(()=> {
            helpKeyboardArrows.classList.remove('press_keyboard')
        }, 300)
    } else if (event.key === "ArrowDown") {
        btnDown.classList.add('press_down');
        helpKeyboardArrows.classList.add('press_keyboard')
        setTimeout(()=> {
            helpKeyboardArrows.classList.remove('press_keyboard')
        }, 300)
    } else if (event.key === "ArrowUp") {
        btnUp.classList.add('press_up');
        helpKeyboardArrows.classList.add('press_keyboard')
        setTimeout(()=> {
            helpKeyboardArrows.classList.remove('press_keyboard')
        }, 300)
    } else if (event.key === "Enter") {
        btnStart.classList.add('press_btn_start')
        helpKeyboardEnter.classList.add('press_keyboard')
        setTimeout(()=> {
            helpKeyboardEnter.classList.remove('press_keyboard')
        }, 300)

        }
}