const boardFactory = (preset = []) => {
    let _board;
    let  _currentPlayerID = 0;
    
    const restartBoard = () => {
        _board = [];
        while(_board.length < 9) {
            _board.push(null);
        }
        _currentPlayerID = 0;
    }
    
    if(preset = []) {
        restartBoard();
    }

    const getBoard = () => {
        return _board
    }
    const move = (preid, sign) => {
        const id = +preid;
        if(_board[id] === null) {
            _board.splice(id, 1, sign);
        }
        _switchPlayer();
    }
    const hasEmptySquare = () => {
        return _board.includes(null)
    }
    const isSquareEmpty = (preid) => {
        const id = +preid;
        return _board[id] === null;
    }
    const getWinner = () => {
        function getIndexes(...args) {
            values = []
            args.forEach(e => {
                const value = _board[e] 
                values.push(value);
            })
            return values 
        }
        function checkBars(bars) {
            function checkBar(bar) {
                let sign = bar[0];
                if(sign == null) {
                    return false
                }
                return bar.every(e => e === sign) ? sign : false
            }

            let winner = false;
            bars.forEach(bar => {
                if(checkBar(bar)) {
                    winner = checkBar(bar);
                }
            })
            if(winner === false && !hasEmptySquare()) {
                winner = "TIE"
            }

            return winner
        }

        function horizontal() {
            const bars = [_board.slice(0, 3), _board.slice(3, 6), _board.slice(6, 9)]
            return checkBars(bars);
        } 
        function vertical() {
            const bars = [getIndexes(0, 3, 6), getIndexes(1, 4, 7), getIndexes(2, 5, 8)];
            return checkBars(bars);
        }
        function diagonal() {
            const bars = [getIndexes(0, 4, 8), getIndexes(2, 4, 6)];
            return checkBars(bars);
        }

        return horizontal() || vertical() || diagonal()
    }
    const _switchPlayer = () => {
        _currentPlayerID = _currentPlayerID === 0 ? 1 : 0;
    }
    const getCurrentPlayerID = () => {
        return _currentPlayerID;
    }

    return {
        restartBoard,
        getBoard,
        getWinner,
        move,
        hasEmptySquare,
        isSquareEmpty,
        getCurrentPlayerID,
    }
}

const playerController = (() => {
    let _players = []

    const add = (isAi = false) => {
        if(_players.length >= 2) {
            throw new Error('max 2 players')
        }
        const sign = _players.length === 0 ? "X" : "O";
        const player = {isAi, sign}
        
        _players.push(player);
    }
    const restart = () => {
        _players = []
    } 
    const getPlayer = (id) => {
        return  _players[id]
    }
    return {
        add,
        restart,
        getPlayer
    }
})()

const gameController = (() => {
    const move = (id) => {
        const playerID = mainBoard.getCurrentPlayerID();
        const sign = playerController.getPlayer(playerID).sign;
        const isEmpty = mainBoard.isSquareEmpty(id);

        mainBoard.move(id, sign);
        displayController.render();

        const outcome = mainBoard.getWinner()
        _handleOutcome(outcome);

    }
    const restart = () => {
        mainBoard.restartBoard();
        displayController.restart();

    }
    const _handleOutcome = (outcome) => {
        switch(outcome) {
            case 'X':
                displayController.setDisplay("X won!");
                displayController.disableClicking();
                break;
            case 'O':
                displayController.setDisplay("O won!");
                displayController.disableClicking();
                break;
            case 'TIE':
                displayController.setDisplay("It's a tie!");
                displayController.disableClicking();

                break;
            case false:
                break;
        }

    }
    return {
        move,
        restart
    }
})()


const displayController = (() => {
    const xsign = document.getElementById("x-sign");
    const osign = document.getElementById("o-sign");
    const _mainNode = document.getElementById("board");
    let _squareNodes = [];

    const _initial = () => {
        const _restartButton = document.getElementById("restart");
        _restartButton.addEventListener("click", gameController.restart)

        for(i = 0; i < 9; i++) {
            const node = document.createElement("div");
            node.setAttribute('data-id', `${i}`);
            _mainNode.appendChild(node);
            _squareNodes.push(node);
        }
        enableClicking();
    }   
    
    const enableClicking = () => {
        _squareNodes.forEach((node) => {
            node.addEventListener("click", _callMove);
        })
    }
    const disableClicking = () => {
        _squareNodes.forEach((node) => {
            node.removeEventListener("click", _callMove);
        })
    }
    const _callMove = (event) => {
        const node = event.currentTarget
        const id = node.getAttribute("data-id");
        const text = node.textContent
        if(!text) {
            gameController.move(id);
            _switchPlayer()
        }
    }
    const _switchPlayer = () => {

        const xclass = xsign.classList.contains("player-active")

        xsign.classList.toggle("player-active")
        osign.classList.toggle("player-active")
    }
    const _restartPlayer = () => {
        xsign.classList.add("player-active")
        osign.classList.remove("player-active");
    }
    const render = () => {
        const board = mainBoard.getBoard();
        
        _squareNodes.forEach((element, index) => {
            element.textContent = board[index];
        })
    }
    const restart = () => {
        render();
        _restartPlayer();
        setDisplay();
        enableClicking();
    }   
    const setDisplay = (text) => {
        const display = document.getElementById("result-display");
        display.textContent = text;
    }

    _initial();

    return {
        enableClicking,
        disableClicking,
        render,
        restart,
        setDisplay
    }
})()



const mainBoard = boardFactory();


playerController.add()
playerController.add()