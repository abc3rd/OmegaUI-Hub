import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Palette, Volume2, Trophy, User as UserIcon, LogOut, Sparkles, Box, Circle } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [colorScheme, setColorScheme] = useState('classic');
  const [boardMaterial, setBoardMaterial] = useState('wood');
  const [pieceStyle, setPieceStyle] = useState('standard');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userData = await base44.auth.me();
      setUser(userData);
      setColorScheme(userData.preferred_color_scheme || 'classic');
      setBoardMaterial(userData.board_material || 'wood');
      setPieceStyle(userData.piece_style || 'standard');
      setSoundEnabled(userData.sound_enabled ?? true);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await base44.auth.updateMe({
        preferred_color_scheme: colorScheme,
        board_material: boardMaterial,
        piece_style: pieceStyle,
        sound_enabled: soundEnabled
      });
      setUser({ 
        ...user, 
        preferred_color_scheme: colorScheme,
        board_material: boardMaterial,
        piece_style: pieceStyle,
        sound_enabled: soundEnabled 
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const colorSchemes = [
    { id: 'classic', name: 'Classic', light: '#F0D9B5', dark: '#B58863' },
    { id: 'modern', name: 'Modern', light: '#E8EAF6', dark: '#5C6BC0' },
    { id: 'neon', name: 'Neon', light: '#00FF88', dark: '#00AAFF' },
    { id: 'wood', name: 'Wood', light: '#DEB887', dark: '#8B4513' },
    { id: 'marble', name: 'Marble', light: '#F5F5F5', dark: '#708090' },
    { id: 'ocean', name: 'Ocean', light: '#B0E0E6', dark: '#4682B4' },
    { id: 'forest', name: 'Forest', light: '#90EE90', dark: '#228B22' },
    { id: 'sunset', name: 'Sunset', light: '#FFDAB9', dark: '#FF6347' }
  ];

  const materials = [
    { id: 'wood', name: 'Wood', icon: '🪵' },
    { id: 'marble', name: 'Marble', icon: '⚪' },
    { id: 'glass', name: 'Glass', icon: '💎' },
    { id: 'metal', name: 'Metal', icon: '⚙️' }
  ];

  const pieceStyles = [
    { id: 'standard', name: 'Standard', description: 'Classic chess pieces' },
    { id: 'modern', name: 'Modern', description: 'Contemporary geometric design' },
    { id: 'tall', name: 'Tall', description: 'Elongated elegant pieces' },
    { id: 'metallic', name: 'Metallic', description: 'Shiny metallic finish' },
    { id: 'glossy', name: 'Glossy', description: 'Smooth glossy appearance' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-950 p-4 md:p-8 pb-20 md:pb-8">
      <div className="container mx-auto max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-6 md:mb-8">
          Settings
        </h1>

        {user && (
          <Card className="bg-slate-900/50 border-slate-700 backdrop-blur mb-6">
            <CardHeader className="p-4 md:p-6">
              <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
                <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4 md:p-6 pt-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-300 text-sm">Name</Label>
                  <p className="text-white font-semibold">{user.full_name}</p>
                </div>
                <div>
                  <Label className="text-slate-300 text-sm">Email</Label>
                  <p className="text-white text-sm md:text-base">{user.email}</p>
                </div>
              </div>
              <div>
                <Label className="text-slate-300 flex items-center gap-2 text-sm">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  Current Rating
                </Label>
                <p className="text-2xl font-bold text-white">{user.chess_rating || 1200}</p>
                <p className="text-sm text-slate-400 mt-1">
                  {user.games_won || 0}W - {user.games_lost || 0}L - {user.games_drawn || 0}D
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-red-600 text-red-400 hover:bg-red-950 w-full md:w-auto text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur mb-6">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Palette className="w-4 h-4 md:w-5 md:h-5" />
              Board Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4 md:p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setColorScheme(scheme.id)}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    colorScheme === scheme.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-white font-semibold capitalize text-sm mb-2">{scheme.name}</div>
                  <div className="flex gap-1">
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: scheme.light }}
                    />
                    <div 
                      className="w-8 h-8 rounded" 
                      style={{ backgroundColor: scheme.dark }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur mb-6">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Box className="w-4 h-4 md:w-5 md:h-5" />
              Board Material
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
              {materials.map((material) => (
                <button
                  key={material.id}
                  onClick={() => setBoardMaterial(material.id)}
                  className={`p-3 md:p-4 rounded-lg border-2 transition-all ${
                    boardMaterial === material.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="text-3xl mb-2">{material.icon}</div>
                  <div className="text-white font-semibold text-sm">{material.name}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur mb-6">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Circle className="w-4 h-4 md:w-5 md:h-5" />
              Piece Style
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="space-y-2">
              {pieceStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPieceStyle(style.id)}
                  className={`w-full p-3 md:p-4 rounded-lg border-2 transition-all text-left ${
                    pieceStyle === style.id
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-slate-700 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-white font-semibold text-sm md:text-base">{style.name}</div>
                      <div className="text-slate-400 text-xs md:text-sm">{style.description}</div>
                    </div>
                    {pieceStyle === style.id && (
                      <Badge className="bg-blue-600">Selected</Badge>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700 backdrop-blur mb-6">
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-lg md:text-xl text-white flex items-center gap-2">
              <Volume2 className="w-4 h-4 md:w-5 md:h-5" />
              Audio Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6 pt-0">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-white font-semibold text-sm md:text-base">Sound Effects</Label>
                <p className="text-xs md:text-sm text-slate-400">Play sounds for moves and captures</p>
              </div>
              <Switch
                checked={soundEnabled}
                onCheckedChange={setSoundEnabled}
              />
            </div>
          </CardContent>
        </Card>

        <Button
          onClick={saveSettings}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-sm md:text-base"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}