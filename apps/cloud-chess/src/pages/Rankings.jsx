import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Crown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function RankingsPage() {
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRankings();
  }, []);

  const loadRankings = async () => {
    try {
      const [allPlayers, user] = await Promise.all([
        base44.entities.User.list('-chess_rating'),
        base44.auth.me().catch(() => null)
      ]);
      
      setPlayers(allPlayers.filter(p => p.games_played > 0));
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading rankings:', error);
    }
    setIsLoading(false);
  };

  const getRankIcon = (rank) => {
    if (rank === 0) return <Crown className="w-5 h-5 md:w-6 md:h-6 text-yellow-500" />;
    if (rank === 1) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-gray-400" />;
    if (rank === 2) return <Medal className="w-5 h-5 md:w-6 md:h-6 text-amber-700" />;
    return <Trophy className="w-4 h-4 md:w-5 md:h-5 text-slate-500" />;
  };

  const getRankBadge = (rank) => {
    if (rank === 0) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
    if (rank === 1) return 'bg-gradient-to-r from-gray-400 to-gray-500';
    if (rank === 2) return 'bg-gradient-to-r from-amber-700 to-amber-800';
    return 'bg-slate-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8 pb-20 md:pb-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6 md:mb-8">
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2">
            Global Rankings
          </h1>
          <p className="text-sm md:text-base text-slate-300">
            Compete for the top spot on the leaderboard
          </p>
        </div>

        {!isLoading && players.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card className="bg-gradient-to-br from-gray-800/50 to-slate-900/50 border-gray-600 backdrop-blur md:mt-8 order-2 md:order-1">
              <CardContent className="p-4 md:p-6 text-center">
                <Medal className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-2 md:mb-3" />
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{players[1]?.full_name}</h3>
                <p className="text-2xl md:text-3xl font-bold text-gray-400 mb-2">{players[1]?.chess_rating || 1200}</p>
                <p className="text-slate-400 text-xs md:text-sm">
                  {players[1]?.games_won}W - {players[1]?.games_lost}L
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-600/30 to-yellow-800/30 border-yellow-600 backdrop-blur md:scale-110 order-1 md:order-2">
              <CardContent className="p-4 md:p-6 text-center">
                <Crown className="w-12 h-12 md:w-16 md:h-16 text-yellow-500 mx-auto mb-2 md:mb-3 animate-pulse" />
                <Badge className="bg-yellow-500 text-slate-900 mb-2 text-xs md:text-sm">Champion</Badge>
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-1">{players[0]?.full_name}</h3>
                <p className="text-3xl md:text-4xl font-bold text-yellow-500 mb-2">{players[0]?.chess_rating || 1200}</p>
                <p className="text-slate-300 text-xs md:text-sm">
                  {players[0]?.games_won}W - {players[0]?.games_lost}L
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-800/50 to-slate-900/50 border-amber-700 backdrop-blur md:mt-8 order-3">
              <CardContent className="p-4 md:p-6 text-center">
                <Medal className="w-10 h-10 md:w-12 md:h-12 text-amber-700 mx-auto mb-2 md:mb-3" />
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{players[2]?.full_name}</h3>
                <p className="text-2xl md:text-3xl font-bold text-amber-700 mb-2">{players[2]?.chess_rating || 1200}</p>
                <p className="text-slate-400 text-xs md:text-sm">
                  {players[2]?.games_won}W - {players[2]?.games_lost}L
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-500" />
              Full Leaderboard
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-2">
              {isLoading ? (
                Array(10).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 md:gap-4 p-3 md:p-4">
                    <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-24 md:w-32 mb-2" />
                      <Skeleton className="h-3 w-20 md:w-24" />
                    </div>
                    <Skeleton className="h-5 w-12 md:h-6 md:w-16" />
                  </div>
                ))
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-lg transition-colors ${
                      player.id === currentUser?.id
                        ? 'bg-blue-900/30 border border-blue-700'
                        : 'hover:bg-slate-800/50'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center ${getRankBadge(index)}`}>
                      {index < 3 ? getRankIcon(index) : <span className="font-bold text-white text-sm md:text-base">{index + 1}</span>}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-white text-sm md:text-base truncate">{player.full_name}</h3>
                        {player.id === currentUser?.id && (
                          <Badge className="bg-blue-600 text-xs">You</Badge>
                        )}
                      </div>
                      <p className="text-xs md:text-sm text-slate-400">
                        {player.games_won}W-{player.games_lost}L
                        <span className="hidden md:inline">
                          {' • '}
                          {player.games_played > 0 
                            ? `${Math.round((player.games_won / player.games_played) * 100)}% Win Rate`
                            : '0% Win Rate'
                          }
                        </span>
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xl md:text-2xl font-bold text-white">{player.chess_rating || 1200}</p>
                      <p className="text-xs text-slate-400 hidden md:block">{player.games_played || 0} games</p>
                    </div>
                  </div>
                ))
              )}

              {!isLoading && players.length === 0 && (
                <div className="text-center py-8 md:py-12">
                  <Trophy className="w-12 h-12 md:w-16 md:h-16 text-slate-600 mx-auto mb-4" />
                  <p className="text-sm md:text-base text-slate-400">No ranked players yet. Be the first to play!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}