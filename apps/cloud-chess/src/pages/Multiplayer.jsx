
import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Users, Plus, Search, Clock, Trophy, Zap, 
  Copy, Check, Loader2, RefreshCw, Globe, Wifi
} from 'lucide-react';
import { toast } from 'sonner';

export default function MultiplayerPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [lobbies, setLobbies] = useState([]);
  const [myLobby, setMyLobby] = useState(null);
  const [joinCode, setJoinCode] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeControl, setTimeControl] = useState('blitz');
  const [isRanked, setIsRanked] = useState(true);
  const [hostColor, setHostColor] = useState('random');
  const [gameType, setGameType] = useState('chess');

  useEffect(() => {
    loadUser();
    const interval = setInterval(loadLobbies, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      await loadLobbies();
    } catch (error) {
      navigate(createPageUrl('Home'));
    }
  };

  const loadLobbies = async () => {
    try {
      const allLobbies = await base44.entities.GameLobby.filter(
        { status: 'waiting' },
        '-created_date',
        20
      );
      setLobbies(allLobbies);

      if (user) {
        const userLobby = await base44.entities.GameLobby.filter(
          { host_id: user.id },
          '-created_date',
          1
        );
        
        if (userLobby.length > 0 && userLobby[0].status !== 'finished') {
          setMyLobby(userLobby[0]);
          
          if (userLobby[0].status === 'playing' && userLobby[0].game_id) {
            // Note: The playerColor parameter might need to be determined more robustly
            // if the lobby object doesn't contain enough info for the joining player.
            // For now, it assumes the game already started and the color is determined in joinLobby.
            // The `mode` parameter here indicates it's a multiplayer game.
            navigate(createPageUrl('Play', `gameId=${userLobby[0].game_id}&mode=multiplayer`));
          }
        } else {
          setMyLobby(null);
        }
      }
    } catch (error) {
      console.error('Error loading lobbies:', error);
    }
    setIsLoading(false);
  };

  const generateLobbyCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const createLobby = async () => {
    if (!user) return;

    try {
      const lobbyCode = generateLobbyCode();
      const lobby = await base44.entities.GameLobby.create({
        host_id: user.id,
        host_name: user.full_name,
        lobby_code: lobbyCode,
        status: 'waiting',
        time_control: timeControl,
        is_ranked: isRanked,
        host_color: hostColor,
        game_type: gameType
      });

      setMyLobby(lobby);
      toast.success('Lobby created! Share the code with your friend.');
    } catch (error) {
      toast.error('Failed to create lobby');
    }
  };

  const joinLobby = async (lobby) => {
    if (!user) return;

    try {
      // Logic to determine actual colors based on host_color preference
      const actualColor = lobby.host_color === 'random' 
        ? (Math.random() > 0.5 ? 'white' : 'black')
        : (lobby.host_color === 'white' ? 'black' : 'white');

      const whiteId = actualColor === 'white' ? user.id : lobby.host_id;
      const blackId = actualColor === 'black' ? user.id : lobby.host_id;
      const whiteName = actualColor === 'white' ? user.full_name : lobby.host_name;
      const blackName = actualColor === 'black' ? user.full_name : lobby.host_name;

      const TIME_CONTROLS = {
        blitz: { initial: 180, increment: 2 },
        rapid: { initial: 600, increment: 0 },
        classical: { initial: 1800, increment: 0 },
        unlimited: { initial: 999999, increment: 0 }
      };

      const timeSettings = TIME_CONTROLS[lobby.time_control];

      // IMPORTANT: This currently creates a ChessGame.
      // If other game types (like checkers) are to be supported for actual play,
      // this part needs to be conditional based on `lobby.game_type`.
      const game = await base44.entities.ChessGame.create({
        white_player_id: whiteId,
        black_player_id: blackId,
        white_player_name: whiteName,
        black_player_name: blackName,
        game_mode: lobby.is_ranked ? 'ranked' : 'multiplayer',
        time_control: lobby.time_control,
        initial_time: timeSettings.initial,
        increment: timeSettings.increment,
        moves: [],
        current_fen: '', // This is chess-specific. For checkers, it would be different.
        current_turn: 'w', // This is chess-specific.
        status: 'active',
        white_time_left: timeSettings.initial,
        black_time_left: timeSettings.initial,
        last_move_time: Date.now(),
        white_online: true,
        black_online: true
      });

      await base44.entities.GameLobby.update(lobby.id, {
        guest_id: user.id,
        guest_name: user.full_name,
        game_id: game.id,
        status: 'playing'
      });

      navigate(createPageUrl('Play', `gameId=${game.id}&mode=multiplayer&playerColor=${actualColor}`));
    } catch (error) {
      toast.error('Failed to join lobby');
    }
  };

  const joinByCode = async () => {
    if (!joinCode || joinCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    try {
      const lobbies = await base44.entities.GameLobby.filter(
        { lobby_code: joinCode, status: 'waiting' },
        '-created_date',
        1
      );

      if (lobbies.length === 0) {
        toast.error('Lobby not found or already started');
        return;
      }

      await joinLobby(lobbies[0]);
    } catch (error) {
      toast.error('Failed to join lobby');
    }
  };

  const cancelLobby = async () => {
    if (!myLobby) return;

    try {
      await base44.entities.GameLobby.update(myLobby.id, {
        status: 'finished'
      });
      setMyLobby(null);
      toast.success('Lobby cancelled');
    } catch (error) {
      toast.error('Failed to cancel lobby');
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const TIME_CONTROL_INFO = {
    blitz: { name: 'Blitz', time: '3+2', icon: Zap },
    rapid: { name: 'Rapid', time: '10+0', icon: Clock },
    classical: { name: 'Classical', time: '30+0', icon: Trophy },
    unlimited: { name: 'Unlimited', time: '∞', icon: Globe }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8 pb-20 md:pb-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Online Multiplayer
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Play with friends anywhere in the world! Create a game or join with a code.
          </p>
        </div>

        {!myLobby ? (
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
                  <Plus className="w-5 h-5 text-green-500" />
                  Create Game Lobby
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Game Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setGameType('chess')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        gameType === 'chess'
                          ? 'border-blue-500 bg-blue-900/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">♔</div>
                      <div className="text-white font-semibold text-sm">Chess</div>
                    </button>
                    <button
                      onClick={() => setGameType('checkers')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        gameType === 'checkers'
                          ? 'border-red-500 bg-red-900/20'
                          : 'border-slate-700 hover:border-slate-600'
                      }`}
                    >
                      <div className="text-2xl mb-1">🎯</div>
                      <div className="text-white font-semibold text-sm">Checkers</div>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Time Control</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(TIME_CONTROL_INFO).map(([key, info]) => {
                      const Icon = info.icon;
                      return (
                        <button
                          key={key}
                          onClick={() => setTimeControl(key)}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            timeControl === key
                              ? 'border-blue-500 bg-blue-900/20'
                              : 'border-slate-700 hover:border-slate-600'
                          }`}
                        >
                          <Icon className="w-4 h-4 mx-auto mb-1 text-slate-300" />
                          <div className="text-white font-semibold text-sm">{info.name}</div>
                          <div className="text-slate-400 text-xs">{info.time}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm text-slate-300 mb-2 block">Your Color</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['white', 'black', 'random'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setHostColor(color)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          hostColor === color
                            ? 'border-blue-500 bg-blue-900/20'
                            : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div className="text-white font-semibold text-sm capitalize">{color}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50">
                  <span className="text-sm text-slate-300">Ranked Game</span>
                  <button
                    onClick={() => setIsRanked(!isRanked)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isRanked ? 'bg-blue-600' : 'bg-slate-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isRanked ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                <Button
                  onClick={createLobby}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Lobby
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="p-4 md:p-6">
                <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-blue-500" />
                  Join with Code
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4 md:p-6 pt-0">
                <div>
                  <label className="text-sm text-slate-300 mb-2 block">
                    Enter 6-digit lobby code
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="123456"
                    className="bg-slate-800 border-slate-700 text-white text-center text-2xl tracking-widest"
                  />
                </div>
                <Button
                  onClick={joinByCode}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  disabled={joinCode.length !== 6}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Join Game
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 border-green-700/50 backdrop-blur mb-8">
            <CardContent className="p-6 md:p-8 text-center">
              <Loader2 className="w-12 h-12 text-green-400 mx-auto mb-4 animate-spin" />
              <h3 className="text-2xl font-bold text-white mb-2">Waiting for Opponent...</h3>
              <p className="text-slate-300 mb-2">Playing: {myLobby.game_type === 'chess' ? '♔ Chess' : '🎯 Checkers'}</p>
              <p className="text-slate-300 mb-6">Share this code with your friend</p>
              
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="bg-slate-900 px-6 py-4 rounded-xl">
                  <span className="text-4xl font-bold text-white tracking-widest">
                    {myLobby.lobby_code}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyCode(myLobby.lobby_code)}
                  className="border-slate-600 hover:bg-slate-800"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-400" />
                  ) : (
                    <Copy className="w-5 h-5 text-slate-300" />
                  )}
                </Button>
              </div>

              <div className="flex gap-3 justify-center">
                <Button
                  variant="outline"
                  onClick={loadLobbies}
                  className="border-slate-600 text-white hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button
                  variant="outline"
                  onClick={cancelLobby}
                  className="border-red-600 text-red-400 hover:bg-red-950"
                >
                  Cancel Lobby
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-500" />
              Available Games ({lobbies.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 text-blue-500 mx-auto mb-4 animate-spin" />
                <p className="text-slate-400">Loading lobbies...</p>
              </div>
            ) : lobbies.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No available games. Create one to get started!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {lobbies.map((lobby) => {
                  const timeInfo = TIME_CONTROL_INFO[lobby.time_control];
                  const TimeIcon = timeInfo.icon;
                  
                  return (
                    <div
                      key={lobby.id}
                      className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-white">{lobby.host_name}</h3>
                          {lobby.is_ranked && (
                            <Badge className="bg-yellow-600 text-xs">Ranked</Badge>
                          )}
                           {lobby.game_type && (
                            <Badge variant="outline" className="text-xs border-slate-600 text-slate-300 capitalize">
                               {lobby.game_type === 'chess' ? 'Chess' : 'Checkers'}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            <TimeIcon className="w-3 h-3" />
                            {timeInfo.name} ({timeInfo.time})
                          </span>
                          <span>•</span>
                          <span className="capitalize">{lobby.host_color} pieces</span>
                        </div>
                      </div>
                      <Button
                        onClick={() => joinLobby(lobby)}
                        disabled={lobby.host_id === user?.id}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Wifi className="w-4 h-4 mr-2" />
                        Join
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
