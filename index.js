const max = (one, two) => {
    return one > two ? one : two;
}
const min = (one, two) => {
    return one < two ? one : two;
}


const boardFactory = (preset = []) => {
    let _board = preset;
    let  _currentPlayerID = 0;
    let _lastMove;
    
    const restartBoard = () => {
        _board = [];
        while(_board.length < 9) {
            _board.push(null);
        }
        _currentPlayerID = 0;
    }
    const getBoard = () => {
        return [..._board]
    }
    const move = (preid) => {
        const id = +preid;
        if(_board[id] === null) {
            const currentPlayer = playerController.getPlayer(_currentPlayerID);
            const sign = currentPlayer.sign;
            _board.splice(id, 1, sign);
            setCurrentPlayer();
            _lastMove = id;
        }
    }
    const hasEmptySquare = () => {
        return _board.includes(null)
    }
    const getEmptySquares = () => {
        let emptySquares = [];
        _board.forEach((value, index) => {
            if(value === null) {
                emptySquares.push(index);
            }
        })
        return emptySquares
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
    const setCurrentPlayer = () => {
        const countSign = (sign) => {
            const counter = _board.reduce((total, current) => {
                if(current === sign) {
                    return ++total
                }
                return total
            }, 0)
            return counter
        }

        const xcount = countSign("X");
        const ocount = countSign("O");

        _currentPlayerID = xcount === ocount ? 0 : 1;
    }
    const getCurrentPlayerID = () => {
        return _currentPlayerID;
    }
    const rateMove = (id, maxSign) => {
        const minSign = maxSign === "X" ? "O" : "X";
        const boardCopy = [..._board];
        const newBoard = boardFactory(boardCopy);
        if(id) {
            newBoard.move(id)
        }
        const outcome = newBoard.getWinner();

        switch(outcome) {
            case maxSign:
                return 1;
            case minSign:
                return -1;
            case 'TIE':
                return 0;
            case false:
                return 0;
        }
    }
    const aiMove = () => {
        const emptySquares = getEmptySquares();
        const sign = playerController.getPlayer(_currentPlayerID).sign;
        
        let squareId = 0;
        let score = -1;
        emptySquares.forEach((value) => {
            const newScore = rateMove(value, sign);
            if(newScore > score) {
                score = newScore;
                squareId = value
            }
        })
        move(squareId);
        displayController.render();

        const outcome = mainBoard.getWinner()
        gameController.handleOutcome(outcome);
        displayController.switchPlayer();
    }

    if(_board.length === 0) {
        restartBoard();
    }
    setCurrentPlayer();

    return {
        restartBoard,
        getBoard,
        getWinner,
        move,
        hasEmptySquare,
        isSquareEmpty,
        getCurrentPlayerID,
        rateMove,
        aiMove,
        setCurrentPlayer,
        getEmptySquares,
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
    const changeMode = (id) => {
        restart();
        switch(id) {
            case 0:
                add(false);
                add(false);
                break;
            case 1:
                add(false);
                add(true);
                break;

        }
    }
    const initial = () => {
        add(false);
        add(false);
    }
    
    
    return {
        add,
        restart,
        getPlayer,
        changeMode,
        initial
    }
})()

const gameController = (() => {
    let _isOver = false;
    let _currentMode = 0;

    const changeMode = () => {
        _currentMode = _currentMode === 0 ? 1 : 0;
        playerController.changeMode(_currentMode);
        restart();
    }
    const move = (id) => {
        const isEmpty = mainBoard.isSquareEmpty(id);

        mainBoard.move(id);
        displayController.render();
        checkWin();

        const playerId = mainBoard.getCurrentPlayerID();
        const player = playerController.getPlayer(playerId);
        if(player.isAi) {
            mainBoard.aiMove();
            checkWin();
        }
    }
    const checkWin = () => {
        const outcome = mainBoard.getWinner()
        handleOutcome(outcome);
    }
    const getCurrentMode = () => {
        return _currentMode;
    }
    const restart = () => {
        _isOver = false;
        mainBoard.restartBoard();
        displayController.restart();

        const playerOne = playerController.getPlayer(0);
        const playerTwo = playerController.getPlayer(1);

        if(playerOne.isAi) {
            mainBoard.aiMove();
            checkWin();
        }
        if(playerOne.isAi && playerTwo.isAi) {
            do {
                mainBoard.aiMove();
                checkWin();
                console.log("elo")
            } while(!_isOver)
        }

    }
    const handleOutcome = (outcome) => {
        switch(outcome) {
            case 'X':
                displayController.setDisplay("X won!");
                displayController.disableClicking();
                _isOver = true;
                break;
            case 'O':
                displayController.setDisplay("O won!");
                displayController.disableClicking();
                _isOver = true;
                break;
            case 'TIE':
                displayController.setDisplay("It's a tie!");
                displayController.disableClicking();
                _isOver = true;

                break;
            case false:
                break;
        }
    }

    return {
        move,
        restart,
        handleOutcome,
        changeMode,
        getCurrentMode
    }
})()


const displayController = (() => {
    const xsign = document.getElementById("x-sign");
    const osign = document.getElementById("o-sign");
    const restartButton = document.getElementById("restart");
    const _modeButton = document.getElementById("mode-button")
    const _mainNode = document.getElementById("board");
    let _squareNodes = [];

    const _initial = () => {
        restartButton.addEventListener("click", gameController.restart)
        _modeButton.addEventListener("click", changeMode)

        for(i = 0; i < 9; i++) {
            const node = document.createElement("div");
            node.setAttribute('data-id', `${i}`);
            _mainNode.appendChild(node);
            _squareNodes.push(node);
        }
        enableClicking();
    }   
    const changeMode = () => {
        gameController.changeMode();
        const mode = gameController.getCurrentMode();
        switch(mode) {
            case 0:
                _modeButton.textContent = "AI"
                break;
            case 1:
                _modeButton.textContent = "HUMANS"
                break;
        }
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
            switchPlayer()
        }
    }
    const switchPlayer = () => {
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
        setDisplay,
        switchPlayer
    }
})()

const mainBoard = boardFactory();

playerController.initial();

gameController.restart();