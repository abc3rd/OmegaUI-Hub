// Checkers game logic and move validation
export class CheckersEngine {
  constructor() {
    this.position = this.getInitialPosition();
    this.currentTurn = 'red';
    this.moveHistory = [];
    this.mustContinueCapture = null;
    this.gameStatus = 'active';
  }

  getInitialPosition() {
    return {
      'a1': 'black', 'c1': 'black', 'e1': 'black', 'g1': 'black',
      'b2': 'black', 'd2': 'black', 'f2': 'black', 'h2': 'black',
      'a3': 'black', 'c3': 'black', 'e3': 'black', 'g3': 'black',
      'b6': 'red', 'd6': 'red', 'f6': 'red', 'h6': 'red',
      'a7': 'red', 'c7': 'red', 'e7': 'red', 'g7': 'red',
      'b8': 'red', 'd8': 'red', 'f8': 'red', 'h8': 'red'
    };
  }

  reset() {
    this.position = this.getInitialPosition();
    this.currentTurn = 'red';
    this.moveHistory = [];
    this.mustContinueCapture = null;
    this.gameStatus = 'active';
  }

  getValidMoves(square) {
    const piece = this.position[square];
    if (!piece) return [];

    const color = piece.includes('King') ? piece.replace('King', '') : piece;
    if (color !== this.currentTurn) return [];

    if (this.mustContinueCapture && this.mustContinueCapture !== square) {
      return [];
    }

    const isKing = piece.includes('King');
    const captures = this.getCaptureMoves(square, color, isKing);
    
    if (captures.length > 0) return captures;
    
    const anyCaptures = this.hasAnyCaptures(color);
    if (anyCaptures) return [];

    return this.getNormalMoves(square, color, isKing);
  }

  hasAnyCaptures(color) {
    for (const [square, piece] of Object.entries(this.position)) {
      if (!piece) continue;
      const pieceColor = piece.includes('King') ? piece.replace('King', '') : piece;
      if (pieceColor === color) {
        const isKing = piece.includes('King');
        const captures = this.getCaptureMoves(square, color, isKing);
        if (captures.length > 0) return true;
      }
    }
    return false;
  }

  getNormalMoves(square, color, isKing) {
    const moves = [];
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);

    const directions = isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : color === 'red'
        ? [[-1, -1], [-1, 1]]
        : [[1, -1], [1, 1]];

    for (const [df, dr] of directions) {
      const newFile = file + df;
      const newRank = rank + dr;

      if (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
        const target = String.fromCharCode(newFile) + newRank;
        if (!this.position[target]) {
          moves.push(target);
        }
      }
    }

    return moves;
  }

  getCaptureMoves(square, color, isKing, capturedSoFar = []) {
    const moves = [];
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);

    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    for (const [df, dr] of directions) {
      const jumpFile = file + df;
      const jumpRank = rank + dr;
      const landFile = file + 2 * df;
      const landRank = rank + 2 * dr;

      if (landFile >= 97 && landFile <= 104 && landRank >= 1 && landRank <= 8) {
        const jumpSquare = String.fromCharCode(jumpFile) + jumpRank;
        const landSquare = String.fromCharCode(landFile) + landRank;

        const jumpPiece = this.position[jumpSquare];
        if (!jumpPiece || capturedSoFar.includes(jumpSquare)) continue;

        const jumpColor = jumpPiece.includes('King') ? jumpPiece.replace('King', '') : jumpPiece;
        if (jumpColor === color) continue;

        if (!this.position[landSquare]) {
          const tempPosition = { ...this.position };
          delete tempPosition[jumpSquare];
          tempPosition[landSquare] = this.position[square];
          delete tempPosition[square];

          const oldPosition = this.position;
          this.position = tempPosition;
          
          const furtherCaptures = this.getCaptureMoves(
            landSquare, 
            color, 
            isKing || this.shouldPromote(landSquare, color),
            [...capturedSoFar, jumpSquare]
          );
          
          this.position = oldPosition;

          if (furtherCaptures.length > 0) {
            moves.push(...furtherCaptures);
          } else {
            moves.push(landSquare);
          }
        }
      }
    }

    return moves;
  }

  shouldPromote(square, color) {
    const rank = parseInt(square[1]);
    return (color === 'red' && rank === 1) || (color === 'black' && rank === 8);
  }

  makeMove(from, to) {
    const piece = this.position[from];
    if (!piece) return false;

    const color = piece.includes('King') ? piece.replace('King', '') : piece;
    const isKing = piece.includes('King');

    const fromFile = from.charCodeAt(0);
    const fromRank = parseInt(from[1]);
    const toFile = to.charCodeAt(0);
    const toRank = parseInt(to[1]);

    const captured = [];
    
    if (Math.abs(fromFile - toFile) === 2) {
      const jumpFile = Math.floor((fromFile + toFile) / 2);
      const jumpRank = Math.floor((fromRank + toRank) / 2);
      const jumpSquare = String.fromCharCode(jumpFile) + jumpRank;
      
      captured.push(jumpSquare);
      delete this.position[jumpSquare];

      const tempPiece = this.shouldPromote(to, color) ? color + 'King' : piece;
      this.position[to] = tempPiece;
      delete this.position[from];

      const furtherCaptures = this.getCaptureMoves(to, color, tempPiece.includes('King'));
      
      if (furtherCaptures.length > 0) {
        this.mustContinueCapture = to;
      } else {
        this.mustContinueCapture = null;
        this.currentTurn = color === 'red' ? 'black' : 'red';
      }
    } else {
      this.position[to] = this.shouldPromote(to, color) ? color + 'King' : piece;
      delete this.position[from];
      this.mustContinueCapture = null;
      this.currentTurn = color === 'red' ? 'black' : 'red';
    }

    const move = { from, to, captured, timestamp: Date.now() };
    this.moveHistory.push(move);

    return true;
  }

  isGameOver() {
    for (const [square, piece] of Object.entries(this.position)) {
      if (!piece) continue;
      const color = piece.includes('King') ? piece.replace('King', '') : piece;
      if (color === this.currentTurn) {
        const moves = this.getValidMoves(square);
        if (moves.length > 0) return false;
      }
    }
    return true;
  }

  getWinner() {
    if (!this.isGameOver()) return null;
    return this.currentTurn === 'red' ? 'black' : 'red';
  }

  getAllLegalMoves() {
    const moves = [];
    for (const [square, piece] of Object.entries(this.position)) {
      if (!piece) continue;
      const color = piece.includes('King') ? piece.replace('King', '') : piece;
      if (color === this.currentTurn) {
        const validMoves = this.getValidMoves(square);
        moves.push(...validMoves.map(to => ({ from: square, to })));
      }
    }
    return moves;
  }

  getPieceCount(color) {
    return Object.values(this.position).filter(piece => {
      if (!piece) return false;
      const pieceColor = piece.includes('King') ? piece.replace('King', '') : piece;
      return pieceColor === color;
    }).length;
  }
}