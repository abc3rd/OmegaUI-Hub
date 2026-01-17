// Chess game logic and move validation
export class ChessEngine {
  constructor() {
    this.position = this.getInitialPosition();
    this.currentTurn = 'w';
    this.moveHistory = [];
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameStatus = 'active';
  }

  getInitialPosition() {
    return {
      'a8': 'bR', 'b8': 'bN', 'c8': 'bB', 'd8': 'bQ', 'e8': 'bK', 'f8': 'bB', 'g8': 'bN', 'h8': 'bR',
      'a7': 'bP', 'b7': 'bP', 'c7': 'bP', 'd7': 'bP', 'e7': 'bP', 'f7': 'bP', 'g7': 'bP', 'h7': 'bP',
      'a2': 'wP', 'b2': 'wP', 'c2': 'wP', 'd2': 'wP', 'e2': 'wP', 'f2': 'wP', 'g2': 'wP', 'h2': 'wP',
      'a1': 'wR', 'b1': 'wN', 'c1': 'wB', 'd1': 'wQ', 'e1': 'wK', 'f1': 'wB', 'g1': 'wN', 'h1': 'wR'
    };
  }

  reset() {
    this.position = this.getInitialPosition();
    this.currentTurn = 'w';
    this.moveHistory = [];
    this.castlingRights = { wK: true, wQ: true, bK: true, bQ: true };
    this.enPassantSquare = null;
    this.halfMoveClock = 0;
    this.fullMoveNumber = 1;
    this.gameStatus = 'active';
  }

  toFEN() {
    let fen = '';
    for (let rank = 8; rank >= 1; rank--) {
      let emptySquares = 0;
      for (let file = 0; file < 8; file++) {
        const square = String.fromCharCode(97 + file) + rank;
        const piece = this.position[square];
        if (piece) {
          if (emptySquares > 0) {
            fen += emptySquares;
            emptySquares = 0;
          }
          const pieceChar = piece[1];
          fen += piece[0] === 'w' ? pieceChar : pieceChar.toLowerCase();
        } else {
          emptySquares++;
        }
      }
      if (emptySquares > 0) fen += emptySquares;
      if (rank > 1) fen += '/';
    }
    fen += ` ${this.currentTurn}`;
    return fen;
  }

  getValidMoves(square) {
    const piece = this.position[square];
    if (!piece || piece[0] !== this.currentTurn) return [];

    const [color, type] = piece.split('');
    const moves = [];

    switch (type) {
      case 'P':
        moves.push(...this.getPawnMoves(square, color));
        break;
      case 'N':
        moves.push(...this.getKnightMoves(square, color));
        break;
      case 'B':
        moves.push(...this.getBishopMoves(square, color));
        break;
      case 'R':
        moves.push(...this.getRookMoves(square, color));
        break;
      case 'Q':
        moves.push(...this.getQueenMoves(square, color));
        break;
      case 'K':
        moves.push(...this.getKingMoves(square, color));
        break;
    }

    return moves.filter(move => !this.wouldBeInCheck(square, move, color));
  }

  getPawnMoves(square, color) {
    const moves = [];
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);
    const direction = color === 'w' ? 1 : -1;
    const startRank = color === 'w' ? 2 : 7;

    const forward = String.fromCharCode(file) + (rank + direction);
    if (!this.position[forward]) {
      moves.push(forward);
      
      if (rank === startRank) {
        const doubleForward = String.fromCharCode(file) + (rank + 2 * direction);
        if (!this.position[doubleForward]) {
          moves.push(doubleForward);
        }
      }
    }

    for (const fileOffset of [-1, 1]) {
      const captureFile = file + fileOffset;
      if (captureFile >= 97 && captureFile <= 104) {
        const captureSquare = String.fromCharCode(captureFile) + (rank + direction);
        const targetPiece = this.position[captureSquare];
        if (targetPiece && targetPiece[0] !== color) {
          moves.push(captureSquare);
        }
        if (captureSquare === this.enPassantSquare) {
          moves.push(captureSquare);
        }
      }
    }

    return moves;
  }

  getKnightMoves(square, color) {
    const moves = [];
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);
    const offsets = [
      [-2, -1], [-2, 1], [-1, -2], [-1, 2],
      [1, -2], [1, 2], [2, -1], [2, 1]
    ];

    for (const [df, dr] of offsets) {
      const newFile = file + df;
      const newRank = rank + dr;
      if (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
        const target = String.fromCharCode(newFile) + newRank;
        const targetPiece = this.position[target];
        if (!targetPiece || targetPiece[0] !== color) {
          moves.push(target);
        }
      }
    }

    return moves;
  }

  getBishopMoves(square, color) {
    return this.getSlidingMoves(square, color, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
  }

  getRookMoves(square, color) {
    return this.getSlidingMoves(square, color, [[1, 0], [-1, 0], [0, 1], [0, -1]]);
  }

  getQueenMoves(square, color) {
    return this.getSlidingMoves(square, color, [
      [1, 0], [-1, 0], [0, 1], [0, -1],
      [1, 1], [1, -1], [-1, 1], [-1, -1]
    ]);
  }

  getSlidingMoves(square, color, directions) {
    const moves = [];
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);

    for (const [df, dr] of directions) {
      let newFile = file + df;
      let newRank = rank + dr;

      while (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
        const target = String.fromCharCode(newFile) + newRank;
        const targetPiece = this.position[target];

        if (!targetPiece) {
          moves.push(target);
        } else {
          if (targetPiece[0] !== color) {
            moves.push(target);
          }
          break;
        }

        newFile += df;
        newRank += dr;
      }
    }

    return moves;
  }

  getKingMoves(square, color) {
    const moves = [];
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);

    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        
        const newFile = file + df;
        const newRank = rank + dr;
        
        if (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
          const target = String.fromCharCode(newFile) + newRank;
          const targetPiece = this.position[target];
          if (!targetPiece || targetPiece[0] !== color) {
            moves.push(target);
          }
        }
      }
    }

    if (color === 'w' && square === 'e1') {
      if (this.castlingRights.wK && !this.position['f1'] && !this.position['g1']) {
        if (!this.isSquareUnderAttack('e1', 'b') && !this.isSquareUnderAttack('f1', 'b')) {
          moves.push('g1');
        }
      }
      if (this.castlingRights.wQ && !this.position['d1'] && !this.position['c1'] && !this.position['b1']) {
        if (!this.isSquareUnderAttack('e1', 'b') && !this.isSquareUnderAttack('d1', 'b')) {
          moves.push('c1');
        }
      }
    } else if (color === 'b' && square === 'e8') {
      if (this.castlingRights.bK && !this.position['f8'] && !this.position['g8']) {
        if (!this.isSquareUnderAttack('e8', 'w') && !this.isSquareUnderAttack('f8', 'w')) {
          moves.push('g8');
        }
      }
      if (this.castlingRights.bQ && !this.position['d8'] && !this.position['c8'] && !this.position['b8']) {
        if (!this.isSquareUnderAttack('e8', 'w') && !this.isSquareUnderAttack('d8', 'w')) {
          moves.push('c8');
        }
      }
    }

    return moves;
  }

  wouldBeInCheck(from, to, color) {
    const tempPosition = { ...this.position };
    tempPosition[to] = tempPosition[from];
    delete tempPosition[from];

    return this.isInCheck(tempPosition, color);
  }

  isInCheck(position = this.position, color = this.currentTurn) {
    const kingSquare = Object.entries(position).find(
      ([, piece]) => piece === `${color}K`
    )?.[0];

    if (!kingSquare) return false;

    return this.isSquareUnderAttack(kingSquare, color === 'w' ? 'b' : 'w', position);
  }

  isSquareUnderAttack(square, byColor, position = this.position) {
    for (const [sq, piece] of Object.entries(position)) {
      if (piece && piece[0] === byColor) {
        const attackedSquares = this.getAttackedSquares(sq, piece, position);
        if (attackedSquares.includes(square)) return true;
      }
    }
    return false;
  }

  getAttackedSquares(square, piece, position) {
    const [color, type] = piece.split('');
    const file = square.charCodeAt(0);
    const rank = parseInt(square[1]);

    switch (type) {
      case 'P':
        const attacks = [];
        const direction = color === 'w' ? 1 : -1;
        for (const fileOffset of [-1, 1]) {
          const attackFile = file + fileOffset;
          if (attackFile >= 97 && attackFile <= 104) {
            const attackRank = rank + direction;
            if (attackRank >= 1 && attackRank <= 8) {
              attacks.push(String.fromCharCode(attackFile) + attackRank);
            }
          }
        }
        return attacks;
      case 'N':
        return this.getKnightMoves(square, color);
      case 'B':
        return this.getBishopMoves(square, color);
      case 'R':
        return this.getRookMoves(square, color);
      case 'Q':
        return this.getQueenMoves(square, color);
      case 'K':
        const kingMoves = [];
        for (let df = -1; df <= 1; df++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (df === 0 && dr === 0) continue;
            const newFile = file + df;
            const newRank = rank + dr;
            if (newFile >= 97 && newFile <= 104 && newRank >= 1 && newRank <= 8) {
              kingMoves.push(String.fromCharCode(newFile) + newRank);
            }
          }
        }
        return kingMoves;
      default:
        return [];
    }
  }

  makeMove(from, to, promotion = 'Q') {
    const piece = this.position[from];
    if (!piece) return false;

    const [color, type] = piece.split('');
    const captured = this.position[to];

    const move = {
      from,
      to,
      piece,
      captured,
      castlingRights: { ...this.castlingRights },
      enPassantSquare: this.enPassantSquare
    };

    if (type === 'K') {
      if (from === 'e1' && to === 'g1') {
        this.position['f1'] = this.position['h1'];
        delete this.position['h1'];
      } else if (from === 'e1' && to === 'c1') {
        this.position['d1'] = this.position['a1'];
        delete this.position['a1'];
      } else if (from === 'e8' && to === 'g8') {
        this.position['f8'] = this.position['h8'];
        delete this.position['h8'];
      } else if (from === 'e8' && to === 'c8') {
        this.position['d8'] = this.position['a8'];
        delete this.position['a8'];
      }

      this.castlingRights[color === 'w' ? 'wK' : 'bK'] = false;
      this.castlingRights[color === 'w' ? 'wQ' : 'bQ'] = false;
    }

    if (type === 'P' && to === this.enPassantSquare) {
      const capturedPawnSquare = to[0] + from[1];
      delete this.position[capturedPawnSquare];
    }

    if (from === 'a1' || to === 'a1') this.castlingRights.wQ = false;
    if (from === 'h1' || to === 'h1') this.castlingRights.wK = false;
    if (from === 'a8' || to === 'a8') this.castlingRights.bQ = false;
    if (from === 'h8' || to === 'h8') this.castlingRights.bK = false;

    this.position[to] = piece;
    delete this.position[from];

    if (type === 'P' && (to[1] === '8' || to[1] === '1')) {
      this.position[to] = color + promotion;
    }

    if (type === 'P' && Math.abs(parseInt(from[1]) - parseInt(to[1])) === 2) {
      const direction = color === 'w' ? 1 : -1;
      this.enPassantSquare = from[0] + (parseInt(from[1]) + direction);
    } else {
      this.enPassantSquare = null;
    }

    this.moveHistory.push(move);
    this.currentTurn = color === 'w' ? 'b' : 'w';
    this.halfMoveClock = captured || type === 'P' ? 0 : this.halfMoveClock + 1;
    if (color === 'b') this.fullMoveNumber++;

    return true;
  }

  isCheckmate() {
    if (!this.isInCheck()) return false;
    return this.getAllLegalMoves().length === 0;
  }

  isStalemate() {
    if (this.isInCheck()) return false;
    return this.getAllLegalMoves().length === 0;
  }

  isDraw() {
    if (this.halfMoveClock >= 100) return true;

    const pieces = Object.values(this.position);
    if (pieces.length === 2) return true;
    if (pieces.length === 3) {
      if (pieces.some(p => p[1] === 'B' || p[1] === 'N')) return true;
    }

    return false;
  }

  getAllLegalMoves() {
    const moves = [];
    for (const [square, piece] of Object.entries(this.position)) {
      if (piece && piece[0] === this.currentTurn) {
        const validMoves = this.getValidMoves(square);
        moves.push(...validMoves.map(to => ({ from: square, to })));
      }
    }
    return moves;
  }
}