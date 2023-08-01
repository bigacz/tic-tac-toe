const gameBoard = (() => {
    let _board = [];

    const getBoard = () => {
        return _board
    }
    const resetBoard = () => {
        _board = [];
        while(_board.length < 9) {
            _board.push(null);
        }
    }
    const move = (preindex, player) => {
        const index = +preindex;
        if(_board[index] === null) {
            _board.splice(index, 1, player);
            displayController.render();
            gameController.switchPlayer();
            console.log(gameBoard.checkWin())
            return true
        } else {
            return false
        }
    }
    const checkWin = () => {
        const board = gameBoard.getBoard();

        function getIndexes(...args) {
            values = []
            args.forEach(e => {
                const value = board[e] 
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
                return bar.every(e => e === sign)
            }

            let win = false;
            bars.forEach(bar => {
                if(checkBar(bar)) {
                    win = true;
                }
            })

            return win
        }

        function horizontal() {
            const bars = [board.slice(0, 3), board.slice(3, 6), board.slice(6, 9)]
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

    return {
        getBoard,
        resetBoard,
        move,
        checkWin
    }
})();

const displayController = (() => {
    const _boardNode = document.getElementById('board');
    let childNodes = [];

    const initial = () => {
        for(i = 0; i < 9; i++) {
            const node = document.createElement('div');
            node.setAttribute('data-id', `${i}`)
            _boardNode.appendChild(node);
            node.addEventListener("click", (e) =>
            {
                gameBoard.move(e.currentTarget.getAttribute("data-id"), gameController.getCurrentPlayer().sign);
            })

            childNodes.push(node);
        }

    }

    const render = () => {
        const board = gameBoard.getBoard();

        childNodes.forEach((element, index) => {
            element.textContent = board[index];
        })
    }

    initial();

    return {
        render
    }

})()

const gameController = (() => {
    let _players = [];
    let currentPlayerID = 0;

    const _playerFactory = (ai) => {
        const sign = (_players.length > 0 ) ? "O" : "X";
        const isAi = !!ai;

        return {sign, isAi};
    }
    const addPlayer = (ai) => {
        if(_players.length < 2) {
            const newPlayer = _playerFactory(ai);
            _players.push(newPlayer);
        } else {
            throw new Error("Max 2 players")
        }
    }
    const switchPlayer = () => {
        currentPlayerID = currentPlayerID === 0 ? 1 : 0;
    }

    const getCurrentPlayer = () => {
        return _players[currentPlayerID]
    }

    return {
        addPlayer,
        switchPlayer,
        getCurrentPlayer
    }
})()


gameController.addPlayer(false);
gameController.addPlayer(true);

gameBoard.resetBoard();
displayController.render();

