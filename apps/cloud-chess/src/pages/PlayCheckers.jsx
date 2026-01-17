import React, { useState, useEffect, useRef, useCallback } from 'react';
import { CheckersEngine } from '../components/checkers/CheckersEngine.jsx';
import { SoundManager } from '../components/chess/SoundManager.jsx';
import CheckersBoard3D from '../components/checkers/CheckersBoard3D';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Play, RotateCcw, Flag, Volume2, VolumeX,
  Clock, Trophy, ChevronLeft, Sparkles, Settings, Circle
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function PlayCheckersPage() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const gameMode = urlParams.get('mode') || 'guest';
  const timeControl = urlParams.get('time') || 'blitz';
  const gameId = urlParams.get('gameId');

  const TIME_CONTROLS = {
    blitz: { initial: 180, increment: 2, name: 'Blitz (3+2)' },
    rapid: { initial: 600, increment: 0, name: 'Rapid (10+0)' },
    classical: { initial: 1800, increment: 0, name: 'Classical (30+0)' },
    unlimited: { initial: 999999, increment: 0, name: 'Unlimited' }
  };

  const engineRef = useRef(new CheckersEngine());
  const soundManagerRef = useRef(new SoundManager());
  const [position, setPosition] = useState(engineRef.current.position);
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [validMoves, setValidMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [lastMove, setLastMove] = useState(null);
  const [gameStatus, setGameStatus] = useState('active');
  const [currentTurn, setCurrentTurn] = useState('red');
  const [user, setUser] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [colorScheme, setColorScheme] = useState('classic');
  const [boardMaterial, setBoardMaterial] = useState('wood');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [animating, setAnimating] = useState(false);
  const [redTime, setRedTime] = useState(TIME_CONTROLS[timeControl].initial);
  const [blackTime, setBlackTime] = useState(TIME_CONTROLS[timeControl].initial);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const timerRef = useRef(null);

  const [isLocalMode, setIsLocalMode] = useState(gameMode === 'local');

  const handleGameEnd = useCallback(async (status, winner) => {
    setGameStatus(status);
    setIsTimerActive(false);
    soundManagerRef.current.play('gameEnd');

    const statusMessages = {
      win: winner === 'red' ? 'Red wins!' : 'Black wins!',
      draw: 'The game is a draw.',
      timeout: winner === 'red' ? 'Black ran out of time! Red wins!' : 'Red ran out of time! Black wins!',
      resignation: winner === 'red' ? 'Black resigned. Red wins!' : 'Red resigned. Black wins!'
    };

    toast.success(statusMessages[status]);

    if (user && gameMode === 'ranked') {
      await saveGame(status, winner);
    }
  }, [gameMode, user]);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      if (userData.preferred_color_scheme) setColorScheme(userData.preferred_color_scheme);
      if (userData.board_material) setBoardMaterial(userData.board_material);
      if (userData.sound_enabled !== undefined) setSoundEnabled(userData.sound_enabled);
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    soundManagerRef.current.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (!isTimerActive || !gameStarted || gameStatus !== 'active') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      if (currentTurn === 'red') {
        setRedTime(prev => {
          if (prev <= 1) {
            handleGameEnd('timeout', 'black');
            return 0;
          }
          return prev - 1;
        });
      } else {
        setBlackTime(prev => {
          if (prev <= 1) {
            handleGameEnd('timeout', 'red');
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, currentTurn, gameStarted, gameStatus, handleGameEnd]);

  const startGame = () => {
    setGameStarted(true);
    setIsTimerActive(timeControl !== 'unlimited');
    soundManagerRef.current.play('gameStart');
    toast.success('Game started! Good luck!');
  };

  const handleSquareClick = (square) => {
    if (!gameStarted || gameStatus !== 'active' || animating) return;

    if (selectedSquare) {
      if (validMoves.includes(square)) {
        makeMove(selectedSquare, square);
      } else {
        const moves = engineRef.current.getValidMoves(square);
        setSelectedSquare(square);
        setValidMoves(moves);
      }
    } else {
      const moves = engineRef.current.getValidMoves(square);
      if (moves.length > 0) {
        setSelectedSquare(square);
        setValidMoves(moves);
      }
    }
  };

  const makeMove = async (from, to) => {
    setAnimating(true);

    const captured = engineRef.current.getCaptureMoves(from, currentTurn, 
      engineRef.current.position[from]?.includes('King') || false);

    const success = engineRef.current.makeMove(from, to);

    if (success) {
      setPosition({ ...engineRef.current.position });
      setCurrentTurn(engineRef.current.currentTurn);
      setLastMove({ from, to });
      setMoveHistory([...engineRef.current.moveHistory]);

      if (captured.length > 0) {
        soundManagerRef.current.play('capture');
      } else {
        soundManagerRef.current.play('move');
      }

      if (engineRef.current.isGameOver()) {
        const winner = engineRef.current.getWinner();
        await handleGameEnd('win', winner);
      } else if (gameMode === 'ai' && engineRef.current.currentTurn === 'black' && engineRef.current.gameStatus === 'active') {
        setTimeout(() => makeAIMove(), 1000);
      }
    }

    setSelectedSquare(null);
    setValidMoves([]);
    setTimeout(() => setAnimating(false), 500);
  };

  const makeAIMove = () => {
    const allMoves = engineRef.current.getAllLegalMoves();
    if (allMoves.length > 0) {
      const randomMove = allMoves[Math.floor(Math.random() * allMoves.length)];
      makeMove(randomMove.from, randomMove.to);
    }
  };

  const saveGame = async (status, winner) => {
    try {
      const ratingChange = calculateRatingChange(winner);

      await base44.entities.CheckersGame.create({
        red_player_id: user.id,
        black_player_id: gameMode === 'ai' ? 'AI' : null,
        red_player_name: user.full_name,
        black_player_name: gameMode === 'ai' ? 'AI' : 'Guest',
        game_mode: gameMode,
        time_control: timeControl,
        initial_time: TIME_CONTROLS[timeControl].initial,
        increment: TIME_CONTROLS[timeControl].increment,
        moves: engineRef.current.moveHistory,
        status,
        winner,
        red_time_left: redTime,
        black_time_left: blackTime,
        rating_change_red: ratingChange
      });

      const updates = {
        checkers_games_played: (user.checkers_games_played || 0) + 1,
        checkers_rating: (user.checkers_rating || 1200) + ratingChange
      };

      if (winner === 'draw') {
        updates.checkers_games_drawn = (user.checkers_games_drawn || 0) + 1;
      } else if (winner === 'red') {
        updates.checkers_games_won = (user.checkers_games_won || 0) + 1;
      } else {
        updates.checkers_games_lost = (user.checkers_games_lost || 0) + 1;
      }

      await base44.auth.updateMe(updates);
      setUser({ ...user, ...updates });

      toast.success(`Rating: ${ratingChange >= 0 ? '+' : ''}${ratingChange}`);
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game data.');
    }
  };

  const calculateRatingChange = (winner) => {
    if (winner === 'draw') return 0;
    return winner === 'red' ? 25 : -25;
  };

  const resetGame = () => {
    engineRef.current.reset();
    setPosition(engineRef.current.position);
    setSelectedSquare(null);
    setValidMoves([]);
    setMoveHistory([]);
    setLastMove(null);
    setGameStatus('active');
    setCurrentTurn('red');
    setGameStarted(false);
    setRedTime(TIME_CONTROLS[timeControl].initial);
    setBlackTime(TIME_CONTROLS[timeControl].initial);
    setIsTimerActive(false);
    soundManagerRef.current.play('resetGame');
  };

  const resign = async () => {
    if (!gameStarted || gameStatus !== 'active') return;
    const winner = currentTurn === 'red' ? 'black' : 'red';
    await handleGameEnd('resignation', winner);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const redCount = engineRef.current.getPieceCount('red');
  const blackCount = engineRef.current.getPieceCount('black');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-2 md:p-4 pb-20 md:pb-4">
      <div className="container mx-auto max-w-7xl">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(createPageUrl('Home'))}
            className="text-slate-300 hover:text-white text-sm md:text-base p-2 md:p-4"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            <span className="hidden md:inline">Back</span>
            <span className="md:hidden">Back</span>
          </Button>

          <Badge className="bg-gradient-to-r from-red-600 to-orange-600 text-white text-xs md:text-sm">
            🎯 Checkers · {isLocalMode ? '📱 Local 2-Player' : gameMode === 'ranked' ? '🏆 Ranked' : gameMode === 'ai' ? '🤖 vs AI' : '⚡ Quick'} · {TIME_CONTROLS[timeControl].name}
          </Badge>
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-3 md:gap-6">
          <div className="space-y-3 md:space-y-4">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur overflow-hidden">
              <CardContent className="p-0">
                <div className="relative" style={{ aspectRatio: '1/1' }}>
                  {!gameStarted && (
                    <div className="absolute inset-0 z-10 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center p-4">
                        <Sparkles className="w-12 h-12 md:w-16 md:h-16 text-orange-400 mx-auto mb-3 md:mb-4 animate-pulse" />
                        <h3 className="text-xl md:text-2xl font-bold text-white mb-2">Ready to Play Checkers?</h3>
                        <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">Click to start the game</p>
                        <Button
                          size="lg"
                          onClick={startGame}
                          className="bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-sm md:text-base"
                        >
                          <Play className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                          Start Game
                        </Button>
                      </div>
                    </div>
                  )}
                  <CheckersBoard3D
                    position={position}
                    onSquareClick={handleSquareClick}
                    selectedSquare={selectedSquare}
                    validMoves={validMoves}
                    lastMove={lastMove}
                    colorScheme={colorScheme}
                    boardMaterial={boardMaterial}
                    animating={animating}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 md:flex gap-2 md:gap-3">
              <Button
                onClick={resetGame}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-800 text-xs md:text-sm"
              >
                <RotateCcw className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">New Game</span>
              </Button>
              <Button
                onClick={resign}
                variant="outline"
                size="sm"
                disabled={!gameStarted || gameStatus !== 'active'}
                className="border-red-600 text-red-400 hover:bg-red-950 text-xs md:text-sm"
              >
                <Flag className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                <span className="hidden md:inline">Resign</span>
              </Button>
              <Button
                onClick={() => setSoundEnabled(!soundEnabled)}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                {soundEnabled ? <Volume2 className="w-3 h-3 md:w-4 md:h-4" /> : <VolumeX className="w-3 h-3 md:w-4 md:h-4" />}
              </Button>
              <Button
                onClick={() => navigate(createPageUrl('Settings'))}
                variant="outline"
                size="sm"
                className="border-slate-600 text-white hover:bg-slate-800"
              >
                <Settings className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-3 md:space-y-4">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardContent className="p-3 md:p-4">
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <div>
                    <p className="text-xs md:text-sm text-slate-400">Black</p>
                    <p className="font-semibold text-white text-sm md:text-base flex items-center gap-2">
                      <Circle className="w-4 h-4 fill-black" />
                      {gameMode === 'ai' ? '🤖 AI' : 'Opponent'}
                    </p>
                    <p className="text-xs text-slate-400">{blackCount} pieces</p>
                  </div>
                  {timeControl !== 'unlimited' && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                      <span className={`text-lg md:text-xl font-mono ${currentTurn === 'black' && isTimerActive && gameStarted ? 'text-green-400' : 'text-white'}`}>
                        {formatTime(blackTime)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="h-px bg-slate-700 my-3 md:my-4" />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs md:text-sm text-slate-400">Red</p>
                    <p className="font-semibold text-white text-sm md:text-base flex items-center gap-2">
                      <Circle className="w-4 h-4 fill-red-600" />
                      {user?.full_name || 'You'}
                    </p>
                    <p className="text-xs text-slate-400">{redCount} pieces</p>
                    {user && gameMode === 'ranked' && (
                      <div className="flex items-center gap-1 mt-1">
                        <Trophy className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs md:text-sm text-yellow-500">{user.checkers_rating || 1200}</span>
                      </div>
                    )}
                  </div>
                  {timeControl !== 'unlimited' && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 md:w-4 md:h-4 text-slate-400" />
                      <span className={`text-lg md:text-xl font-mono ${currentTurn === 'red' && isTimerActive && gameStarted ? 'text-green-400' : 'text-white'}`}>
                        {formatTime(redTime)}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardContent className="p-3 md:p-4 text-center">
                <p className="text-xs md:text-sm text-slate-400 mb-2">Current Turn</p>
                <Badge className={currentTurn === 'red' ? 'bg-red-600 text-white' : 'bg-slate-800 text-white'}>
                  {currentTurn === 'red' ? '🔴 Red to move' : '⚫ Black to move'}
                </Badge>
                {engineRef.current.mustContinueCapture && (
                  <p className="text-orange-500 font-semibold mt-2 text-sm">Multi-capture available!</p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardContent className="p-3 md:p-4">
                <h3 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Move History</h3>
                <div className="space-y-1 max-h-48 md:max-h-64 overflow-y-auto">
                  {moveHistory.map((move, index) => (
                    <div key={index} className="flex items-center gap-2 text-xs md:text-sm">
                      <span className="text-slate-500">{index + 1}.</span>
                      <span className="text-slate-300">
                        {move.from} → {move.to}
                      </span>
                      {move.captured && move.captured.length > 0 && (
                        <span className="text-red-400">×{move.captured.length}</span>
                      )}
                    </div>
                  ))}
                  {moveHistory.length === 0 && (
                    <p className="text-slate-500 text-xs md:text-sm text-center py-6 md:py-8">
                      No moves yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {gameStatus !== 'active' && (
              <Card className="bg-gradient-to-r from-red-900/50 to-orange-900/50 border-red-700/50 backdrop-blur">
                <CardContent className="p-3 md:p-4 text-center">
                  <Trophy className="w-10 h-10 md:w-12 md:h-12 text-yellow-500 mx-auto mb-2 md:mb-3" />
                  <h3 className="text-lg md:text-xl font-bold text-white mb-2">Game Over</h3>
                  <p className="text-sm md:text-base text-slate-300">
                    {gameStatus === 'win' && `${engineRef.current.getWinner() === 'red' ? 'Red' : 'Black'} wins!`}
                    {gameStatus === 'draw' && 'Draw!'}
                    {gameStatus === 'resignation' && 'Resignation'}
                    {gameStatus === 'timeout' && 'Timeout'}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}