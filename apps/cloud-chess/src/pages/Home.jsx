import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Zap, Crown, Sparkles, Clock, Brain, Wifi, Monitor } from 'lucide-react';

export default function HomePage() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 md:w-96 h-64 md:h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 md:py-12">
        <header className="text-center mb-8 md:mb-16">
          <div className="inline-block mb-4 md:mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 blur-2xl opacity-50 animate-pulse" />
              <h1 className="relative text-4xl md:text-6xl lg:text-8xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Game Arena
              </h1>
            </div>
          </div>
          <p className="text-base md:text-xl text-slate-300 max-w-2xl mx-auto px-4">
            Play Chess & Checkers anywhere! Solo, Local 2-Player, or Online Multiplayer
          </p>
        </header>

        {user && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-12">
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-slate-400 flex items-center gap-1 md:gap-2">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4 text-yellow-500" />
                  Chess Rating
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-white">{user.chess_rating || 1200}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-slate-400 flex items-center gap-1 md:gap-2">
                  <Trophy className="w-3 h-3 md:w-4 md:h-4 text-orange-500" />
                  Checkers
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-white">{user.checkers_rating || 1200}</p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-slate-400">Total Games</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-white">
                  {(user.games_played || 0) + (user.checkers_games_played || 0)}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
              <CardHeader className="pb-2 md:pb-3 p-3 md:p-6">
                <CardTitle className="text-xs md:text-sm text-slate-400">Win Rate</CardTitle>
              </CardHeader>
              <CardContent className="p-3 md:p-6 pt-0">
                <p className="text-xl md:text-3xl font-bold text-green-400">
                  {(() => {
                    const totalGames = (user.games_played || 0) + (user.checkers_games_played || 0);
                    const totalWins = (user.games_won || 0) + (user.checkers_games_won || 0);
                    return totalGames > 0 ? Math.round((totalWins / totalGames) * 100) : 0;
                  })()}%
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <span className="text-3xl">♔</span> Chess Games
          </h2>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
            <Card className="bg-gradient-to-br from-green-900/50 to-green-950/50 border-green-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Wifi className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Online Multiplayer</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Play with friends anywhere! Create a game lobby or join with a code
                </p>
                <Link to={createPageUrl('Multiplayer')} className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-sm md:text-base">
                    <Wifi className="w-4 h-4 mr-2" />
                    Play Online
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-purple-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Monitor className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Local 2-Player</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Pass the device! Play with someone sitting next to you
                </p>
                <Link to={createPageUrl('Play', 'mode=local')} className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base">
                    <Monitor className="w-4 h-4 mr-2" />
                    Local Play
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-950/50 border-orange-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Brain className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">vs AI</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Practice your skills against computer opponent
                </p>
                <Link to={createPageUrl('Play', 'mode=ai')} className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm md:text-base">
                    <Brain className="w-4 h-4 mr-2" />
                    Play AI
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-blue-900/50 to-blue-950/50 border-blue-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-blue-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Ranked Match</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Compete for ratings and climb the leaderboard
                </p>
                <Link to={createPageUrl('Play', 'mode=ranked')} className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-sm md:text-base">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ranked
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/50 to-pink-950/50 border-pink-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Zap className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Quick Game</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Jump in fast without affecting your ranking
                </p>
                <Link to={createPageUrl('Play', 'mode=guest')} className="block">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-sm md:text-base">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Play
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-indigo-900/50 to-indigo-950/50 border-indigo-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Time Modes</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Blitz (3+2), Rapid (10+0), Classical (30+0)
                </p>
                <Link to={createPageUrl('Play', 'mode=ranked&time=blitz')} className="block">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-sm md:text-base">
                    <Clock className="w-4 h-4 mr-2" />
                    Choose Time
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 flex items-center gap-2">
            <span className="text-3xl">🎯</span> Checkers Games
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            <Card className="bg-gradient-to-br from-green-900/50 to-green-950/50 border-green-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Wifi className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Online Multiplayer</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Challenge friends online to checkers matches
                </p>
                <Link to={createPageUrl('Multiplayer')} className="block">
                  <Button className="w-full bg-green-600 hover:bg-green-700 text-sm md:text-base">
                    <Wifi className="w-4 h-4 mr-2" />
                    Play Online
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-900/50 to-purple-950/50 border-purple-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Monitor className="w-6 h-6 md:w-8 md:h-8 text-purple-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Local 2-Player</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Pass & play checkers on the same device
                </p>
                <Link to={createPageUrl('PlayCheckers', 'mode=local')} className="block">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-sm md:text-base">
                    <Monitor className="w-4 h-4 mr-2" />
                    Local Play
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-900/50 to-orange-950/50 border-orange-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-orange-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Brain className="w-6 h-6 md:w-8 md:h-8 text-orange-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">vs AI</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Practice checkers against computer
                </p>
                <Link to={createPageUrl('PlayCheckers', 'mode=ai')} className="block">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700 text-sm md:text-base">
                    <Brain className="w-4 h-4 mr-2" />
                    Play AI
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/50 to-red-950/50 border-red-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Trophy className="w-6 h-6 md:w-8 md:h-8 text-red-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Ranked</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Compete in ranked checkers matches
                </p>
                <Link to={createPageUrl('PlayCheckers', 'mode=ranked')} className="block">
                  <Button className="w-full bg-red-600 hover:bg-red-700 text-sm md:text-base">
                    <Trophy className="w-4 h-4 mr-2" />
                    Ranked
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-pink-900/50 to-pink-950/50 border-pink-700/50 backdrop-blur hover:scale-105 transition-transform">
              <CardHeader className="p-4 md:p-6">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-pink-500/20 rounded-2xl flex items-center justify-center mb-3 md:mb-4">
                  <Zap className="w-6 h-6 md:w-8 md:h-8 text-pink-400" />
                </div>
                <CardTitle className="text-xl md:text-2xl text-white">Quick Game</CardTitle>
              </CardHeader>
              <CardContent className="p-4 md:p-6 pt-0">
                <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6">
                  Jump into a casual checkers game
                </p>
                <Link to={createPageUrl('PlayCheckers', 'mode=guest')} className="block">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700 text-sm md:text-base">
                    <Zap className="w-4 h-4 mr-2" />
                    Quick Play
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8 mb-8 md:mb-12">
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
                <Crown className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
                Competitive Rankings
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm md:text-base text-slate-300 mb-4">
                ELO-based ranking system with seasonal leaderboards. Track your progress and compete for the top spots.
              </p>
              <Link to={createPageUrl('Rankings')}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 w-full md:w-auto text-sm md:text-base">
                  View Rankings
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                Stunning 3D Graphics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0">
              <p className="text-sm md:text-base text-slate-300 mb-4">
                Immersive 3D experience with realistic pieces, smooth animations, and customizable themes.
              </p>
              <Link to={createPageUrl('Settings')}>
                <Button variant="outline" className="border-slate-600 text-white hover:bg-slate-800 w-full md:w-auto text-sm md:text-base">
                  Customize Board
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {!user && !isLoading && (
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700/50 backdrop-blur text-center">
            <CardContent className="py-8 md:py-12 px-4">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">
                Ready to Begin Your Journey?
              </h2>
              <p className="text-sm md:text-base text-slate-300 mb-4 md:mb-6 max-w-2xl mx-auto">
                Sign in to save your progress, compete in ranked matches, and climb the global leaderboard.
              </p>
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 w-full md:w-auto text-sm md:text-base"
                onClick={() => base44.auth.redirectToLogin()}
              >
                Sign In to Play
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}