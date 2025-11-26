import React, { useState } from 'react';
import { 
  BookOpen, 
  Settings, 
  Target, 
  Users, 
  TrendingUp, 
  Zap, 
  Shield, 
  FileText,
  ChevronDown,
  Check,
  Loader,
  X
} from 'lucide-react';
import { professionalFlowLoader } from '../../services/professionalFlowLoader';

const ProfessionalFlowSelector = ({ 
  onFlowSelect, 
  onClose, 
  isVisible 
}) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(false);

  const categories = {
    all: { name: 'All Flows', icon: FileText, color: 'slate' },
    'Business & Strategy': { name: 'Business & Strategy', icon: TrendingUp, color: 'blue' },
    'Technical & Training': { name: 'Technical & Training', icon: Settings, color: 'green' },
    'Personal Development': { name: 'Personal Development', icon: Users, color: 'purple' },
    'Marketing & Content': { name: 'Marketing & Content', icon: Target, color: 'orange' }
  };

  const flowCategories = professionalFlowLoader.getFlowsByCategory();
  const allFlows = professionalFlowLoader.getAllFlows();

  const getFilteredFlows = () => {
    if (selectedCategory === 'all') {
      return allFlows;
    }
    const categoryFlowIds = flowCategories[selectedCategory] || [];
    return allFlows.filter(flow => categoryFlowIds.includes(flow.id));
  };

  const handleFlowSelect = async (flowId) => {
    setLoading(true);
    try {
      await onFlowSelect(flowId);
      onClose();
    } catch (error) {
      console.error('Error loading flow:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFlowIcon = (flowId) => {
    const iconMap = {
      businessEbook: BookOpen,
      technicalManual: Settings,
      marketingCampaign: Target,
      selfHelpGuide: Users,
      financialGuide: TrendingUp,
      trainingManual: Settings,
      contentMarketingSuite: Target,
      productLaunchPlaybook: Zap,
      leadershipProgram: Shield,
      customerSuccessPlaybook: Users
    };
    return iconMap[flowId] || FileText;
  };

  const getFlowColor = (flowId) => {
    const colorMap = {
      businessEbook: 'blue',
      technicalManual: 'green',
      marketingCampaign: 'orange',
      selfHelpGuide: 'purple',
      financialGuide: 'emerald',
      trainingManual: 'teal',
      contentMarketingSuite: 'pink',
      productLaunchPlaybook: 'red',
      leadershipProgram: 'indigo',
      customerSuccessPlaybook: 'yellow'
    };
    return colorMap[flowId] || 'slate';
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-slate-200 rounded-t-3xl p-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-slate-800">Professional Flow Templates</h2>
                <p className="text-slate-600 mt-1">Choose from 10 expertly crafted content creation flows</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center transition-colors duration-200"
            >
              <X className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex flex-wrap gap-3">
            {Object.entries(categories).map(([key, category]) => {
              const Icon = category.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                    selectedCategory === key
                      ? `bg-${category.color}-100 text-${category.color}-700 border-2 border-${category.color}-300`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Flows Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getFilteredFlows().map((flow) => {
              const Icon = getFlowIcon(flow.id);
              const color = getFlowColor(flow.id);
              return (
                <div
                  key={flow.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer group"
                  onClick={() => handleFlowSelect(flow.id)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        {flow.type}
                      </span>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-200">
                    {flow.name}
                  </h3>
                  
                  <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                    {flow.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Settings className="w-4 h-4" />
                      <span>{flow.nodes.length} nodes</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {loading ? (
                        <Loader className="w-4 h-4 animate-spin text-purple-600" />
                      ) : (
                        <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors duration-200">
                          <Check className="w-3 h-3 text-purple-600" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 rounded-b-3xl">
          <div className="text-center">
            <p className="text-sm text-slate-600">
              All flows are professionally crafted with industry best practices and can be customized to your specific needs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalFlowSelector;
