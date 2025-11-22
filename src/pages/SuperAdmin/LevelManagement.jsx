import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Check, X, Plus, Save, RefreshCw, Settings, Crown } from 'lucide-react';

const LevelManagement = () => {
  const [levelAccess, setLevelAccess] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddLevelModal, setShowAddLevelModal] = useState(false);
  const [showAddFeatureModal, setShowAddFeatureModal] = useState(false);
  const [newLevel, setNewLevel] = useState({
    level_name: '',
    display_name: '',
    description: '',
    tier_level: 1,
    credits_monthly: 1000,
    monthly_limit: 1000,
    is_active: true
  });
  const [newFeature, setNewFeature] = useState({
    feature_name: '',
    feature_description: '',
    default_access: {}
  });

  // Fetch levels and level access data
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch levels
      const { data: levelsData, error: levelsError } = await supabase
        .from('levels')
        .select('*')
        .order('tier_level', { ascending: true });

      if (levelsError) throw levelsError;

      // Fetch level access
      const { data: levelAccessData, error: levelAccessError } = await supabase
        .from('level_access')
        .select('*')
        .order('level_name', { ascending: true });

      if (levelAccessError) throw levelAccessError;

      setLevels(levelsData || []);
      setLevelAccess(levelAccessData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Toggle access for a specific feature
  const toggleAccess = async (levelAccessId, featureColumn, currentValue) => {
    try {
      setSaving(true);

      const { error } = await supabase
        .from('level_access')
        .update({ [featureColumn]: !currentValue })
        .eq('id', levelAccessId);

      if (error) throw error;

      // Update local state
      setLevelAccess(prev => 
        prev.map(item => 
          item.id === levelAccessId 
            ? { ...item, [featureColumn]: !currentValue }
            : item
        )
      );
    } catch (error) {
      console.error('Error updating access:', error);
    } finally {
      setSaving(false);
    }
  };

  // Add new feature
  const addFeature = async () => {
    try {
      setSaving(true);
      
      // Add the new feature column to all existing level_access rows
      const updates = levelAccess.map(level => ({
        id: level.id,
        [newFeature.feature_name]: newFeature.default_access[level.level_name] || false
      }));

      for (const update of updates) {
        const { id, ...updateData } = update;
        const { error } = await supabase
          .from('level_access')
          .update(updateData)
          .eq('id', id);
        
        if (error) throw error;
      }

      setNewFeature({
        feature_name: '',
        feature_description: '',
        default_access: {}
      });
      
      setShowAddFeatureModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding feature:', error);
    } finally {
      setSaving(false);
    }
  };

  // Add new level
  const addLevel = async () => {
    try {
      setSaving(true);
      
      // Insert into levels table
      const { data: newLevelData, error: levelError } = await supabase
        .from('levels')
        .insert([newLevel])
        .select()
        .single();

      if (levelError) throw levelError;

      // Create corresponding level_access row with all features disabled by default
      const { error: accessError } = await supabase
        .from('level_access')
        .insert([{
          level_id: newLevelData.id,
          level_name: newLevel.level_name,
          // All features disabled by default
          ebook_creation: false,
          report_creation: false,
          guide_creation: false,
          manual_creation: false,
          fiction_creation: false,
          autobiography_creation: false,
          whitepaper_creation: false,
          blog_post_creation: false,
          email_sequence_creation: false,
          social_media_creation: false,
          gpt4_access: false,
          claude_access: false,
          gemini_access: false,
          custom_model_access: false,
          pdf_export: false,
          epub_export: false,
          docx_export: false,
          html_export: false,
          markdown_export: false,
          txt_export: false,
          custom_workflow_creation: false,
          workflow_sharing: false,
          workflow_templates: false,
          multi_chapter_books: false,
          single_chapter_books: false,
          image_generation: false,
          cover_design: false,
          table_of_contents: false,
          chapter_outlines: false,
          bibliography_generation: false,
          index_generation: false,
          company_watermark: false,
          custom_branding: false,
          white_label: false,
          custom_domain: false,
          usage_analytics: false,
          token_tracking: false,
          cost_tracking: false,
          performance_metrics: false,
          user_behavior_analytics: false,
          team_collaboration: false,
          user_management: false,
          role_based_access: false,
          comment_system: false,
          api_access: false,
          webhook_support: false,
          third_party_integration: false,
          custom_integrations: false
        }]);

      if (accessError) throw accessError;

      setNewLevel({
        level_name: '',
        display_name: '',
        description: '',
        tier_level: 1,
        credits_monthly: 1000,
        monthly_limit: 1000,
        is_active: true
      });
      
      setShowAddLevelModal(false);
      fetchData();
    } catch (error) {
      console.error('Error adding level:', error);
    } finally {
      setSaving(false);
    }
  };

  // Get all feature columns (excluding system columns)
  const getFeatureColumns = () => {
    if (levelAccess.length === 0) return [];
    
    const systemColumns = ['id', 'level_id', 'level_name', 'is_active', 'created_at', 'updated_at'];
    return Object.keys(levelAccess[0]).filter(key => !systemColumns.includes(key));
  };

  // Get level display name
  const getLevelDisplayName = (levelName) => {
    const level = levels.find(l => l.name === levelName);
    return level ? level.display_name : levelName;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Level Management</h1>
          <p className="text-gray-300">Manage feature access across all levels</p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowAddLevelModal(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Add New Level
          </button>
          <button
            onClick={() => setShowAddFeatureModal(true)}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add New Feature
          </button>
        </div>

        {/* Level Access Table */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-800/50 to-blue-800/50">
                <tr>
                  <th className="px-6 py-4 text-left text-white font-semibold">Feature</th>
                  {levels.map((level) => (
                    <th key={level.id} className="px-4 py-4 text-center text-white font-semibold text-sm">
                      {level.display_name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getFeatureColumns().map(feature => (
                  <tr key={feature} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">
                        {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </div>
                    </td>
                    {levels.map((level) => {
                      const levelAccessRow = levelAccess.find(la => la.level_name === level.name);
                      const hasAccess = levelAccessRow ? levelAccessRow[feature] : false;
                      
                      return (
                        <td key={level.id} className="px-4 py-4 text-center">
                          <button
                            onClick={() => levelAccessRow && toggleAccess(levelAccessRow.id, feature, hasAccess)}
                            disabled={saving || !levelAccessRow}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                              hasAccess
                                ? 'bg-green-500 hover:bg-green-600 text-white shadow-lg'
                                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
                            } ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110'}`}
                          >
                            {hasAccess ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Level Modal */}
        {showAddLevelModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 border border-gray-200 transform transition-all duration-300">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Add New Level</h3>
                <button
                  onClick={() => setShowAddLevelModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Level Name</label>
                  <input
                    type="text"
                    value={newLevel.level_name}
                    onChange={(e) => setNewLevel({...newLevel, level_name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., enterprise"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={newLevel.display_name}
                    onChange={(e) => setNewLevel({...newLevel, display_name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Enterprise"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newLevel.description}
                    onChange={(e) => setNewLevel({...newLevel, description: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    rows="3"
                    placeholder="Level description..."
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tier Level</label>
                    <input
                      type="number"
                      value={newLevel.tier_level}
                      onChange={(e) => setNewLevel({...newLevel, tier_level: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900"
                      min="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Credits</label>
                    <input
                      type="number"
                      value={newLevel.credits_monthly}
                      onChange={(e) => setNewLevel({...newLevel, credits_monthly: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900"
                      min="0"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Limit</label>
                  <input
                    type="number"
                    value={newLevel.monthly_limit}
                    onChange={(e) => setNewLevel({...newLevel, monthly_limit: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white text-gray-900"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={addLevel}
                  disabled={saving || !newLevel.level_name || !newLevel.display_name}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white py-2 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Creating...' : 'Create Level'}
                </button>
                <button
                  onClick={() => setShowAddLevelModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add Feature Modal */}
        {showAddFeatureModal && (
          <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 border border-gray-200 transform transition-all duration-300">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Add New Feature</h3>
                <button
                  onClick={() => setShowAddFeatureModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feature Name</label>
                  <input
                    type="text"
                    value={newFeature.feature_name}
                    onChange={(e) => setNewFeature({...newFeature, feature_name: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    placeholder="e.g., video_generation"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Feature Description</label>
                  <textarea
                    value={newFeature.feature_description}
                    onChange={(e) => setNewFeature({...newFeature, feature_description: e.target.value})}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 bg-white text-gray-900 placeholder-gray-500"
                    rows="3"
                    placeholder="Description of what this feature does..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Access by Level</label>
                  <div className="space-y-2">
                    {levels.map(level => (
                      <div key={level.id} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{level.display_name}</span>
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={newFeature.default_access[level.name] || false}
                            onChange={(e) => setNewFeature({
                              ...newFeature,
                              default_access: {
                                ...newFeature.default_access,
                                [level.name]: e.target.checked
                              }
                            })}
                            className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={addFeature}
                  disabled={saving || !newFeature.feature_name}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-2 px-4 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Adding...' : 'Add Feature'}
                </button>
                <button
                  onClick={() => setShowAddFeatureModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LevelManagement;