import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Wand2, 
  BookOpen, 
  FileText, 
  Zap, 
  Star, 
  Trophy, 
  Target,
  Loader2,
  CheckCircle,
  AlertCircle,
  Database,
  Settings,
  Play,
  Award,
  Flame,
  Rocket,
  Brain,
  Search,
  Filter,
  Download,
  Eye,
  Tag,
  Calendar,
  User,
  Layers,
  Palette,
  Globe,
  TrendingUp,
  Crown,
  Clock,
  Activity,
  BarChart3,
  Edit,
  Lock,
  Key,
  Trash2
} from 'lucide-react';
import { useUserAuth } from '../contexts/UserAuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { dbService } from '../services/database';
import levelAccessService from '../services/levelAccessService';
import EngineFormModal from './EngineFormModal';
import GenerateModal from './GenerateModal';
import SubEngineEditModal from './SubEngineEditModal';
import EngineSettingsModal from './EngineSettingsModal';
import UltraLoader from './UltraLoader';
import UltraInput from './UltraInput';
import UltraButton from './UltraButton';
import UltraCard from './UltraCard';
import { ultraToast } from '../utils/ultraToast';
import { supabase } from '../lib/supabase';

const ContentStudio = () => {
  const { user, loading: authLoading } = useUserAuth();
  const { isDark } = useTheme();
  const [userEngines, setUserEngines] = useState([]);
  const [filteredEngines, setFilteredEngines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEngine, setSelectedEngine] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [userStats, setUserStats] = useState({
    totalCreations: 0,
    level: 'Creator',
    xp: 0,
    streak: 0
  });
  
  // Default engines state
  const [defaultEngines, setDefaultEngines] = useState([]);
  const [loadingDefaultEngines, setLoadingDefaultEngines] = useState(false);

  // Engine categories state
  const [categories, setCategories] = useState([
    { id: 'all', name: 'All Engines', icon: Globe, count: 0 },
    { id: 'book', name: 'Book Generation', icon: BookOpen, count: 0 },
    { id: 'content', name: 'Content Creation', icon: FileText, count: 0 },
    { id: 'marketing', name: 'Marketing', icon: Target, count: 0 },
    { id: 'creative', name: 'Creative Writing', icon: Palette, count: 0 },
    { id: 'technical', name: 'Technical', icon: Zap, count: 0 }
  ]);

  useEffect(() => {
    if (user) {
      initializeUser();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    filterEngines();
  }, [searchQuery, selectedCategory, userEngines]);

  // Load default engines
  useEffect(() => {
    const loadDefaultEngines = async () => {
      if (!user?.id) return
      
      try {
        setLoadingDefaultEngines(true)
        const engines = await dbService.getDefaultEngines(user.id)
        setDefaultEngines(engines)
      } catch (error) {
        console.error('Error loading default engines:', error)
        ultraToast.error('Failed to load default engines')
      } finally {
        setLoadingDefaultEngines(false)
      }
    }

    loadDefaultEngines()
  }, [user?.id])

  const initializeUser = async () => {
    try {
      setLoading(true);
      
      console.log('🔍 ContentStudio user object:', user);
      console.log('🔍 User ID:', user?.user_id || user?.id);
      
      const userId = user?.user_id || user?.id;
      if (!userId) {
        throw new Error('User ID is missing from user object');
      }
      
      // Set user in level access service
      levelAccessService.setCurrentUser(user);
      
      await loadUserEngines(userId);
      await loadUserStats(userId);
    } catch (error) {
      setError(`Initialization failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const loadUserEngines = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_engines')
        .select(`
          id,
          user_id,
          engine_id,
          name,
          description,
          config,
          nodes,
          edges,
          models,
          api_key,
          api_key_created_at,
          status,
          created_at,
          updated_at,
          ai_engines (
            name,
            description,
            metadata,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('status', 'active');

      if (error) throw error;

      const engines = data || [];
      console.log('🔍 Loaded engines:', engines.length)
      console.log('🔍 First engine structure:', engines[0])
      setUserEngines(engines);
      
      // Update category counts
      const updatedCategories = categories.map(category => ({
        ...category,
        count: category.id === 'all' 
          ? engines.length 
          : engines.filter(e => getEngineCategory(e.ai_engines?.name || e.name) === category.id).length
      }));
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error loading user engines:', error);
      setError(`Failed to load engines: ${error.message}`);
    }
  };

  const filterEngines = () => {
    let filtered = userEngines;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(engine => 
        getEngineCategory(engine.ai_engines?.name || engine.name) === selectedCategory
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(engine => 
        engine.name.toLowerCase().includes(query) ||
        engine.description?.toLowerCase().includes(query) ||
        engine.ai_engines?.name?.toLowerCase().includes(query) ||
        engine.ai_engines?.description?.toLowerCase().includes(query)
      );
    }

    setFilteredEngines(filtered);
  };

  const getEngineCategory = (engineName) => {
    const name = engineName?.toLowerCase() || '';
    if (name.includes('book') || name.includes('ebook')) return 'book';
    if (name.includes('content') || name.includes('article')) return 'content';
    if (name.includes('marketing') || name.includes('campaign')) return 'marketing';
    if (name.includes('creative') || name.includes('story')) return 'creative';
    if (name.includes('technical') || name.includes('documentation')) return 'technical';
    return 'content'; // Default category
  };

  const loadUserStats = async (userId) => {
    try {
      // Get execution count
      const { data: executions, error: execError } = await supabase
        .from('engine_executions')
        .select('id')
        .eq('user_id', userId);

      if (execError) throw execError;

      // Calculate XP and level
      const totalCreations = executions?.length || 0;
      const xp = totalCreations * 10; // 10 XP per creation
      const level = getLevelFromXP(xp);

      setUserStats({
        totalCreations,
        level,
        xp,
        streak: 0 // TODO: Implement streak logic
      });
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const getLevelFromXP = (xp) => {
    if (xp < 100) return 'Novice';
    if (xp < 300) return 'Creator';
    if (xp < 600) return 'Expert';
    if (xp < 1000) return 'Master';
    return 'Legend';
  };

  const handleDeleteUserEngine = async (userEngine) => {
    try {
      const confirmDelete = window.confirm(`Delete your engine "${userEngine.name || userEngine.ai_engines?.name}"? This will remove access and its API key.`)
      if (!confirmDelete) return
      const { error } = await supabase
        .from('user_engines')
        .delete()
        .eq('id', userEngine.id)
        .eq('user_id', user?.id || user?.user_id)
      if (error) throw error
      ultraToast.success('Engine deleted')
      initializeUser()
    } catch (e) {
      console.error('Delete user engine failed:', e)
      ultraToast.error('Failed to delete engine')
    }
  }

  const getEngineIcon = (engineName, metadata) => {
    // Try to get icon from metadata first
    if (metadata?.icon) {
      return metadata.icon;
    }

    // Fallback to name-based icons
    const name = engineName.toLowerCase();
    if (name.includes('book')) return 'BookOpen';
    if (name.includes('report')) return 'FileText';
    if (name.includes('content')) return 'Sparkles';
    if (name.includes('story')) return 'BookOpen';
    if (name.includes('article')) return 'FileText';
    if (name.includes('email')) return 'Mail';
    if (name.includes('social')) return 'Share';
    if (name.includes('marketing')) return 'Target';
    
    return 'Wand2'; // Default icon
  };

  const getIconComponent = (iconName) => {
    const icons = {
      Sparkles, Wand2, BookOpen, FileText, Zap, Star, Trophy, Target,
      Play, Award, Flame, Rocket, CheckCircle, AlertCircle, Database, Settings,
      Brain, Search, Filter, Download, Eye, Tag, Calendar, User, Layers,
      Palette, Globe, TrendingUp, Crown, Clock, Activity, BarChart3
    };
    return icons[iconName] || Wand2;
  };

  const getEngineColor = (engineName) => {
    const name = engineName?.toLowerCase() || '';
    if (name.includes('book') || name.includes('ebook')) return '#3B82F6';
    if (name.includes('content') || name.includes('article')) return '#10B981';
    if (name.includes('marketing') || name.includes('campaign')) return '#F59E0B';
    if (name.includes('creative') || name.includes('story')) return '#EC4899';
    if (name.includes('technical') || name.includes('documentation')) return '#8B5CF6';
    return '#6366F1'; // Default color
  };

  const getDifficultyIcon = (tier) => {
    switch (tier?.toLowerCase()) {
      case 'starter': return '🟢';
      case 'pro': return '🟡';
      case 'enterprise': return '🔴';
      default: return '⚪';
    }
  };

  const getEngineTags = (engineName) => {
    const name = engineName?.toLowerCase() || '';
    const tags = [];
    
    if (name.includes('book')) tags.push('book', 'ebook');
    if (name.includes('content')) tags.push('content', 'article');
    if (name.includes('marketing')) tags.push('marketing', 'campaign');
    if (name.includes('creative')) tags.push('creative', 'story');
    if (name.includes('technical')) tags.push('technical', 'docs');
    
    return tags.length > 0 ? tags.slice(0, 3) : ['ai', 'content'];
  };

  const handleGenerateClick = (engine) => {
    console.log('🚀 Generate clicked for:', engine);
    setSelectedEngine(engine);
    setShowGenerateModal(true);
  };

  const handleSettingsClick = (engine) => {
    console.log('⚙️ Settings clicked for:', engine);
    setSelectedEngine(engine);
    setShowSettingsModal(true);
  };

  const handleEngineClick = (engine) => {
    console.log('🔍 Engine clicked:', engine);
    console.log('🔍 Setting selectedEngine:', engine);
    console.log('🔍 Setting showFormModal: true');
    setSelectedEngine(engine);
    setShowFormModal(true);
  };

  const handleFormComplete = () => {
    setShowFormModal(false);
    setSelectedEngine(null);
    // Refresh stats
    if (user && user.user_id) {
      loadUserStats(user.user_id);
    }
  };


  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <div 
          className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center card-elevated theme-animate"
        >
          <Database className="w-10 h-10" style={{ color: 'var(--theme-primary)' }} />
        </div>
        <h1 className="text-3xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          Welcome to Content Studio
        </h1>
        <p className="mb-8" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-lg)' }}>
          Please log in to access your AI content creation tools
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          className="btn btn-primary"
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: 'var(--theme-primary)' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading your engines...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-background)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-2 text-gradient">
            🚀 AI Studio
          </h1>
          <p className="text-lg" style={{ color: 'var(--color-text-muted)' }}>
            Choose from your powerful AI engines to create amazing content
          </p>
          
          {/* User Stats */}
          <div className="flex items-center justify-center mt-6 gap-4 flex-wrap">
            <div className="flex items-center px-4 py-2.5 rounded-lg" style={{ background: 'var(--color-surface)' }}>
              <Trophy className="w-4 h-4 mr-2.5" style={{ color: 'var(--color-primary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {userStats.level}
              </span>
            </div>
            <div className="flex items-center px-4 py-2.5 rounded-lg" style={{ background: 'var(--color-surface)' }}>
              <Star className="w-4 h-4 mr-2.5" style={{ color: 'var(--color-secondary)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {userStats.xp} XP
              </span>
            </div>
            <div className="flex items-center px-4 py-2.5 rounded-lg" style={{ background: 'var(--color-surface)' }}>
              <Flame className="w-4 h-4 mr-2.5" style={{ color: 'var(--color-warning)' }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                {userStats.totalCreations} Creations
              </span>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <UltraInput
                type="text"
                placeholder="Search AI engines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                icon={Search}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto">
              {categories.map((category) => (
                <UltraButton
                  key={category.id}
                  variant={selectedCategory === category.id ? 'primary' : 'secondary'}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  <category.icon className="w-4 h-4 mr-2" />
                  {category.name}
                  <span className="ml-2 px-2 py-1 rounded-full text-xs" style={{ 
                    background: 'var(--color-surface)', 
                    color: 'var(--color-text)' 
                  }}>
                    {category.count}
                  </span>
                </UltraButton>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Error Display */}
        {error && (
          <motion.div
            className="mb-6 p-4 rounded-lg flex items-center gap-3"
            style={{ 
              background: 'var(--color-surface)',
              borderLeft: '3px solid var(--color-error)'
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" style={{ color: 'var(--color-error)' }} />
            <p className="flex-1" style={{ color: 'var(--color-text)' }}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              style={{ color: 'var(--color-text-muted)' }}
            >
              ×
            </button>
          </motion.div>
        )}

        {/* Default Engines Section */}
        {defaultEngines.length > 0 && (
          <motion.div
            className="mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
                  ⭐ Your Default Engines
                </h2>
                <p style={{ color: 'var(--color-text-muted)' }}>
                  Quick access to your most-used AI engines
                </p>
              </div>
              {loadingDefaultEngines && (
                <UltraLoader type="pulse" size="sm" />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {defaultEngines.map((userEngine, index) => {
                const engine = userEngine.engine || userEngine.ai_engines;
                const iconName = getEngineIcon(engine?.name, engine?.metadata);
                const IconComponent = getIconComponent(iconName);
                const engineColor = getEngineColor(engine?.name || userEngine.name);
                
                return (
                  <motion.div
                    key={userEngine.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.02 }}
                  >
                    <UltraCard className="h-full hover:scale-105 transition-transform duration-300">
                      <div className="p-6 h-full flex flex-col">
                        {/* Engine Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center"
                              style={{ background: `${engineColor}20` }}
                            >
                              <IconComponent className="w-6 h-6" style={{ color: engineColor }} />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg" style={{ color: 'var(--color-text)' }}>
                                {userEngine.name}
                              </h3>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 text-xs font-medium rounded-full">
                                  Default
                                </span>
                                <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 text-xs font-medium rounded-full">
                                  {engine?.tier || 'Pro'}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                              4.8
                            </span>
                          </div>
                        </div>

                        {/* Description */}
                        <p className="text-sm mb-4 flex-1" style={{ color: 'var(--color-text-muted)' }}>
                          {userEngine.description || engine?.description || 'AI-powered content generation'}
                        </p>

                        {/* Stats */}
                        <div className="flex items-center justify-between mb-4 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                          <div className="flex items-center gap-4">
                            <span className="flex items-center gap-1">
                              <Activity className="w-4 h-4" />
                              Active
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-4 h-4" />
                              Ready
                            </span>
                          </div>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(userEngine.created_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          <UltraButton
                            variant="primary"
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedEngine(userEngine);
                              setShowGenerateModal(true);
                            }}
                          >
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate
                          </UltraButton>
                          <UltraButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedEngine(userEngine);
                              setShowSettingsModal(true);
                            }}
                          >
                            <Settings className="w-4 h-4" />
                          </UltraButton>
                          {/* Enterprise Edit Button */}
                          {(user?.tier === 'enterprise' || user?.tier === 'ENTERPRISE') ? (
                            <UltraButton
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEngine(userEngine);
                                setShowEditModal(true);
                              }}
                              title="Edit Engine (Enterprise)"
                            >
                              <Edit className="w-4 h-4" />
                            </UltraButton>
                          ) : (
                            <div className="relative group">
                              <UltraButton
                                variant="secondary"
                                size="sm"
                                disabled
                                className="opacity-50 cursor-not-allowed"
                              >
                                <Lock className="w-4 h-4" />
                              </UltraButton>
                              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                Edit available for Enterprise users
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </UltraCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Engines Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredEngines.length === 0 && userEngines.length > 0 ? (
            <div className="col-span-full text-center py-12">
              <Wand2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                No engines found
              </h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Try adjusting your search criteria or browse all engines
              </p>
            </div>
          ) : filteredEngines.length === 0 && userEngines.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Wand2 className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--color-text-muted)' }} />
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-text)' }}>
                No Engines Assigned Yet
              </h3>
              <p className="text-sm mb-6" style={{ color: 'var(--color-text-muted)' }}>
                Contact your admin to get engines assigned to your account
              </p>
              <UltraButton
                variant="primary"
                onClick={() => window.location.href = '/contact'}
              >
                Request Access
              </UltraButton>
            </div>
          ) : (
            filteredEngines.map((userEngine, index) => {
              const engine = userEngine.ai_engines;
              const iconName = getEngineIcon(engine?.name || userEngine.name, engine?.metadata);
              const IconComponent = getIconComponent(iconName);
              const engineColor = getEngineColor(engine?.name || userEngine.name);
              
              return (
                <motion.div
                  key={userEngine.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8 }}
                  className="h-full"
                >
                  <div 
                    className="relative h-full rounded-2xl overflow-hidden group cursor-pointer"
                    style={{
                      background: isDark 
                        ? 'rgba(30, 30, 40, 0.6)' 
                        : 'rgba(255, 255, 255, 0.8)',
                      backdropFilter: 'blur(20px)',
                      border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}`,
                      boxShadow: isDark
                        ? '0 8px 32px rgba(0, 0, 0, 0.3)'
                        : '0 8px 32px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {/* Animated gradient overlay on hover */}
                    <motion.div
                      className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background: `linear-gradient(135deg, ${engineColor}15, transparent)`,
                        pointerEvents: 'none'
                      }}
                    />
                    
                    {/* Status indicator dot */}
                    <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-2 h-2 rounded-full bg-green-500"
                      />
                      <span className="text-xs font-medium" style={{ color: 'var(--color-text-muted)' }}>
                        Active
                      </span>
                    </div>

                    <div className="p-6 h-full flex flex-col relative z-10">
                      {/* Engine Header */}
                      <div className="flex items-start gap-4 mb-4">
                        <motion.div
                          whileHover={{ rotate: 360, scale: 1.1 }}
                          transition={{ duration: 0.6 }}
                          className="w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0"
                          style={{ 
                            background: `linear-gradient(135deg, ${engineColor}30, ${engineColor}10)`,
                            boxShadow: `0 4px 24px ${engineColor}40`
                          }}
                        >
                          <IconComponent className="w-8 h-8" style={{ color: engineColor }} />
                        </motion.div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-bold text-xl leading-tight" style={{ color: 'var(--color-text)' }}>
                              {engine?.name || userEngine.name}
                            </h3>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <Star className="w-4 h-4 text-yellow-500 fill-current" />
                              <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                                4.7
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {userEngine.is_default && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold rounded-full flex items-center gap-1"
                              >
                                <Star className="w-3 h-3 fill-current" />
                                Default
                              </motion.span>
                            )}
                            <span 
                              className="px-2 py-1 text-xs font-bold rounded-full"
                              style={{ 
                                background: `${engineColor}20`,
                                color: engineColor
                              }}
                            >
                              {getDifficultyIcon(engine?.tier || 'Pro')} {engine?.tier || 'Pro'}
                            </span>
                            {userEngine.api_key && (
                              <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full flex items-center gap-1">
                                <Key className="w-3 h-3" />
                                API Ready
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-sm mb-4 flex-1 leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                        {engine?.description || userEngine.description || 'Create professional content with this AI-powered engine'}
                      </p>

                      {/* Token Prediction */}
                      {userEngine.tokenPrediction && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mb-4 p-3 rounded-xl"
                          style={{
                            background: isDark ? 'rgba(99, 102, 241, 0.1)' : 'rgba(99, 102, 241, 0.05)',
                            border: '1px solid rgba(99, 102, 241, 0.2)'
                          }}
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--color-text-muted)' }}>Est. Tokens</span>
                            <span className="font-bold text-indigo-600 dark:text-indigo-400">
                              ~{userEngine.tokenPrediction.totalTokens?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs mt-1">
                            <span style={{ color: 'var(--color-text-muted)' }}>Est. Cost</span>
                            <span className="font-bold text-green-600 dark:text-green-400">
                              ${userEngine.tokenPrediction.estimatedCost?.toFixed(4) || '0.00'}
                            </span>
                          </div>
                        </motion.div>
                      )}

                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {getEngineTags(engine?.name || userEngine.name).slice(0, 3).map((tag) => (
                          <motion.span
                            key={tag}
                            whileHover={{ scale: 1.05 }}
                            className="px-2 py-1 rounded-full text-xs font-medium"
                            style={{ 
                              background: `${engineColor}15`,
                              color: engineColor,
                              border: `1px solid ${engineColor}30`
                            }}
                          >
                            #{tag}
                          </motion.span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 mt-auto">
                        <motion.div className="flex-1" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                          <UltraButton
                            variant="primary"
                            size="sm"
                            className="w-full font-bold"
                            onClick={() => {
                              setSelectedEngine(userEngine);
                              setShowGenerateModal(true);
                            }}
                          >
                            <Rocket className="w-4 h-4 mr-2" />
                            Generate
                          </UltraButton>
                        </motion.div>
                        
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <UltraButton
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setSelectedEngine(userEngine);
                              setShowSettingsModal(true);
                            }}
                            title="Settings & API"
                            className="w-10 h-10 p-0 flex items-center justify-center"
                          >
                            <Settings className="w-4 h-4" />
                          </UltraButton>
                        </motion.div>

                        {/* Delete engine (user-owned copy) */}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <UltraButton
                            variant="secondary"
                            size="sm"
                            onClick={() => handleDeleteUserEngine(userEngine)}
                            title="Delete Engine"
                            className="w-10 h-10 p-0 flex items-center justify-center"
                          >
                            <Trash2 className="w-4 h-4" />
                          </UltraButton>
                        </motion.div>
                        
                        {/* Enterprise Edit Button */}
                        {(user?.tier === 'enterprise' || user?.tier === 'ENTERPRISE') ? (
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <UltraButton
                              variant="secondary"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEngine(userEngine);
                                setShowEditModal(true);
                              }}
                              title="Edit Engine (Enterprise)"
                              className="w-10 h-10 p-0 flex items-center justify-center"
                            >
                              <Edit className="w-4 h-4" />
                            </UltraButton>
                          </motion.div>
                        ) : (
                          <div className="relative group">
                            <motion.div whileHover={{ scale: 1.05 }}>
                              <UltraButton
                                variant="secondary"
                                size="sm"
                                disabled
                                className="w-10 h-10 p-0 flex items-center justify-center opacity-50 cursor-not-allowed"
                              >
                                <Lock className="w-4 h-4" />
                              </UltraButton>
                            </motion.div>
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl">
                              <div className="font-bold mb-1">Enterprise Feature</div>
                              <div className="text-gray-300">Upgrade to edit engines</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>

        {/* Modals */}
        {showGenerateModal && selectedEngine && (
          <GenerateModal
            isOpen={showGenerateModal}
            engine={selectedEngine}
            onClose={() => setShowGenerateModal(false)}
            onExecutionComplete={handleFormComplete}
          />
        )}

        {showSettingsModal && selectedEngine && (
          <EngineSettingsModal
            isOpen={showSettingsModal}
            engine={selectedEngine}
            user={user}
            onClose={() => setShowSettingsModal(false)}
          />
        )}

        {showEditModal && selectedEngine && (
          <SubEngineEditModal
            engine={selectedEngine}
            onClose={() => {
              setShowEditModal(false)
              setSelectedEngine(null)
            }}
            onSave={() => {
              initializeUser()
              ultraToast.success('Engine updated successfully!')
            }}
          />
        )}

        {showFormModal && selectedEngine && (
          <EngineFormModal
            isOpen={showFormModal}
            engine={selectedEngine}
            onClose={() => setShowFormModal(false)}
            onExecutionComplete={handleFormComplete}
          />
        )}
      </div>
    </div>
  );
};

export default ContentStudio;
