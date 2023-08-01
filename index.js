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
                gameBoard.move(e.currentTarget.getAttribute("data-id"), "X");
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
    let currentPlayer

    const getCurrentPlayer = () => {
        return currentPlayer
    }

    return {
        getCurrentPlayer
    }
})()



gameBoard.resetBoard();
displayController.render();

