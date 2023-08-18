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
        return _board
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
        newBoard.move(id)
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
    const _minmax = () => {
        const max = (one, two) => {
            return one > two ? one : two;
        }
        const min = (one, two) => {
            return one < two ? one : two;
        }
    }
    const aiMove = () => {
        
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
        setCurrentPlayer
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
        const isEmpty = mainBoard.isSquareEmpty(id);

        mainBoard.move(id);
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