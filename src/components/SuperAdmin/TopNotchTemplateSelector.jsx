import React from 'react';
import { X, Star, Zap, Target, Crown, Sparkles } from 'lucide-react';
import { TOP_NOTCH_TEMPLATES } from '../../data/flows';

const TopNotchTemplateSelector = ({ isVisible, onClose, onFlowSelect }) => {
  console.log('TopNotchTemplateSelector render - isVisible:', isVisible);
  if (!isVisible) return null;

  const categories = {
    business: { label: 'Business & Strategy', icon: Target, color: 'from-blue-500 to-indigo-600' },
    fiction: { label: 'Creative Fiction', icon: Sparkles, color: 'from-purple-500 to-pink-600' },
    marketing: { label: 'Marketing & Sales', icon: Zap, color: 'from-green-500 to-teal-600' },
    'self-help': { label: 'Personal Development', icon: Star, color: 'from-yellow-500 to-orange-600' },
    technical: { label: 'Technical & Education', icon: Crown, color: 'from-gray-500 to-slate-600' },
    health: { label: 'Health & Wellness', icon: Star, color: 'from-emerald-500 to-green-600' },
    finance: { label: 'Financial Mastery', icon: Target, color: 'from-yellow-600 to-amber-600' },
    leadership: { label: 'Leadership Excellence', icon: Crown, color: 'from-indigo-600 to-purple-600' },
    creative: { label: 'Creative Arts', icon: Sparkles, color: 'from-pink-500 to-rose-600' },
    education: { label: 'Educational Design', icon: Star, color: 'from-cyan-500 to-blue-600' },
    productivity: { label: 'Productivity Systems', icon: Zap, color: 'from-teal-500 to-cyan-600' },
    relationships: { label: 'Communication & Relationships', icon: Star, color: 'from-rose-500 to-pink-600' },
    mindfulness: { label: 'Mindfulness & Meditation', icon: Sparkles, color: 'from-violet-500 to-purple-600' },
    creativity: { label: 'Innovation & Creativity', icon: Zap, color: 'from-orange-500 to-red-600' }
  };

  const groupedTemplates = Object.entries(TOP_NOTCH_TEMPLATES).reduce((acc, [key, template]) => {
    const category = template.category || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push({ key, ...template });
    return acc;
  }, {});

  const handleTemplateSelect = (template) => {
    console.log('Template selected:', template);
    onFlowSelect(template);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-600 to-pink-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Top-Notch Templates</h2>
              <p className="text-purple-100">15 Professional, Role-Separated Workflows</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-6">
          {Object.entries(groupedTemplates).map(([categoryId, templates]) => {
            const categoryInfo = categories[categoryId] || { label: categoryId, icon: Star, color: 'from-gray-500 to-gray-600' };
            const CategoryIcon = categoryInfo.icon;

            return (
              <div key={categoryId} className="mb-8">
                <div className={`flex items-center space-x-3 mb-4 p-3 rounded-lg bg-gradient-to-r ${categoryInfo.color} text-white`}>
                  <CategoryIcon className="w-5 h-5" />
                  <h3 className="text-lg font-semibold">{categoryInfo.label}</h3>
                  <span className="bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
                    {templates.length} Template{templates.length !== 1 ? 's' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {templates.map((template) => (
                    <div
                      key={template.key}
                      onClick={() => handleTemplateSelect(template)}
                      className="group bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] border border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${categoryInfo.color} flex items-center justify-center text-white text-lg font-bold shadow-md`}>
                          <CategoryIcon className="w-5 h-5" />
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${categoryInfo.color} text-white`}>
                          {template.complexity || 'Professional'}
                        </span>
                      </div>

                      <h4 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {template.name}
                      </h4>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                        {template.description}
                      </p>

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3" />
                          <span>Professional Grade</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Zap className="w-3 h-3" />
                          <span>Role Separated</span>
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TopNotchTemplateSelector;
