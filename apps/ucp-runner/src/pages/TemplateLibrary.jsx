import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  FileCode,
  Search,
  Filter,
  FolderOpen,
  Plus,
  RefreshCw,
  Coins,
  Tag,
  Package,
  ChevronDown,
  ChevronRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TemplateRepo, PacketRepo, initDB } from '@/components/ucp/UCPDatabase';
import { getDemoTemplates } from '@/components/ucp/DemoTemplates';

const CATEGORIES = [
  { id: 'all', name: 'All Templates', icon: FileCode },
  { id: 'General', name: 'General', icon: FolderOpen },
  { id: 'API', name: 'API & Webhooks', icon: Package },
  { id: 'Data', name: 'Data Processing', icon: RefreshCw },
  { id: 'Notifications', name: 'Notifications', icon: Tag }
];

export default function TemplateLibrary() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [packetCounts, setPacketCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('recent'); // recent, reuse, name

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    await initDB();
    
    let allTemplates = await TemplateRepo.listAll();
    
    if (allTemplates.length === 0) {
      const demos = getDemoTemplates();
      for (const tpl of demos) {
        await TemplateRepo.insert({ ...tpl, category: 'API' });
      }
      allTemplates = await TemplateRepo.listAll();
    }
    
    // Get packet counts per template
    const packets = await PacketRepo.listRecent(100);
    const counts = {};
    packets.forEach(pkt => {
      if (pkt.templateId) {
        counts[pkt.templateId] = (counts[pkt.templateId] || 0) + 1;
      }
    });
    
    setPacketCounts(counts);
    setTemplates(allTemplates);
    setLoading(false);
  };

  // Filter and sort templates
  const filteredTemplates = templates
    .filter(tpl => {
      const matchesSearch = searchQuery === '' || 
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.intent.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (tpl.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || tpl.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.createdAt - a.createdAt;
      if (sortBy === 'reuse') return (b.reuseCount || 0) - (a.reuseCount || 0);
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });

  // Get unique categories from templates
  const templateCategories = [...new Set(templates.map(t => t.category || 'General'))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl">
                  <FileCode className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Template Library</h1>
                  <p className="text-sm text-slate-400">{templates.length} templates</p>
                </div>
              </div>
            </div>
            <Link to={createPageUrl('Compile')}>
              <Button className="bg-violet-500 hover:bg-violet-600">
                <Plus className="w-4 h-4 mr-2" />
                New
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Search and Filter Bar */}
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates by name, intent, or tags..."
              className="pl-10 bg-slate-800 border-slate-700 text-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className={`border-slate-700 ${showFilters ? 'bg-violet-500/20 border-violet-500' : ''}`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Filters Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 space-y-4">
                {/* Sort */}
                <div>
                  <label className="text-sm text-slate-400 mb-2 block">Sort by</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'recent', label: 'Recent' },
                      { id: 'reuse', label: 'Most Used' },
                      { id: 'name', label: 'Name' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setSortBy(opt.id)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                          sortBy === opt.id 
                            ? 'bg-violet-500 text-white' 
                            : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const count = cat.id === 'all' 
              ? templates.length 
              : templates.filter(t => (t.category || 'General') === cat.id).length;
            
            if (cat.id !== 'all' && !templateCategories.includes(cat.id) && count === 0) return null;
            
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-violet-500 text-white'
                    : 'bg-slate-800/50 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.name}
                <span className="text-xs opacity-70">({count})</span>
              </button>
            );
          })}
        </div>

        {/* Templates Grid */}
        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-4 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-slate-700 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-5 bg-slate-700 rounded w-1/3 mb-2" />
                    <div className="h-4 bg-slate-700 rounded w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-8 text-center">
            <FileCode className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">No templates found</p>
            <p className="text-sm text-slate-500 mt-1">
              {searchQuery ? 'Try a different search term' : 'Create your first template'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3">
            {filteredTemplates.map((template) => (
              <Link key={template.id} to={createPageUrl(`TemplateDetail?templateId=${template.id}`)}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={{ scale: 1.01 }}
                  className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 hover:border-violet-500/30 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-violet-500/20 rounded-lg">
                      <FileCode className="w-6 h-6 text-violet-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white truncate">{template.name}</h3>
                        {template.category && template.category !== 'General' && (
                          <span className="px-2 py-0.5 bg-slate-700/50 text-slate-400 text-xs rounded">
                            {template.category}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1 mb-2">{template.intent}</p>
                      
                      {/* Tags */}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap mb-2">
                          {template.tags.slice(0, 3).map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 text-xs rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <RefreshCw className="w-3 h-3" />
                          {template.reuseCount || 0}x reused
                        </span>
                        <span className="flex items-center gap-1">
                          <Coins className="w-3 h-3 text-emerald-400" />
                          {template.baselinePromptTokens + template.baselineCompletionTokens} tokens/run
                        </span>
                        {packetCounts[template.id] > 0 && (
                          <span className="flex items-center gap-1">
                            <Package className="w-3 h-3 text-cyan-400" />
                            {packetCounts[template.id]} packets
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-500" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}