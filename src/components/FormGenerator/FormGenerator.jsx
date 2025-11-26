import React, { useState } from 'react';
import { 
  BookOpen, 
  User, 
  Target, 
  Palette, 
  Settings, 
  FileText, 
  Image, 
  Upload,
  Check,
  AlertCircle,
  Loader,
  Sparkles
} from 'lucide-react';

const FormGenerator = ({ 
  inputFields = [], 
  flowName = "Content Creation Flow",
  onSubmit,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [activeSection, setActiveSection] = useState(0);

  // Group fields by sections
  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: BookOpen,
      color: 'blue',
      fields: inputFields.filter(field => 
        ['book_title', 'topic', 'book_type', 'niche', 'target_audience'].includes(field.variable)
      )
    },
    {
      id: 'content',
      title: 'Content Specifications',
      icon: FileText,
      color: 'green',
      fields: inputFields.filter(field => 
        ['word_count', 'chapter_count', 'tone', 'accent', 'writing_style'].includes(field.variable)
      )
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      icon: Settings,
      color: 'purple',
      fields: inputFields.filter(field => 
        ['include_images', 'image_placement', 'cover_image_option', 'cover_image_style', 'branding_style', 'book_template'].includes(field.variable)
      )
    },
    {
      id: 'author',
      title: 'Author Details',
      icon: User,
      color: 'orange',
      fields: inputFields.filter(field => 
        ['author_name', 'author_bio', 'author_expertise'].includes(field.variable)
      )
    },
    {
      id: 'publishing',
      title: 'Publishing & Marketing',
      icon: Target,
      color: 'pink',
      fields: inputFields.filter(field => 
        ['publishing_goals', 'marketing_strategy', 'distribution_channels'].includes(field.variable)
      )
    }
  ].filter(section => section.fields.length > 0);

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    inputFields.forEach(field => {
      if (field.required && !formData[field.variable]) {
        newErrors[field.variable] = `${field.name} is required`;
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const fieldId = `field-${field.variable}`;
    const hasError = errors[field.variable];
    
    const baseClasses = `
      w-full px-4 py-3 rounded-xl border-2 transition-all duration-200
      bg-white/90 backdrop-blur-sm text-slate-800 placeholder-slate-500
      focus:outline-none focus:ring-4 focus:ring-opacity-50
      ${hasError 
        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
        : 'border-slate-200 focus:border-blue-500 focus:ring-blue-200'
      }
    `;

    switch (field.type) {
      case 'select':
        return (
          <select
            id={fieldId}
            value={formData[field.variable] || ''}
            onChange={(e) => handleInputChange(field.variable, e.target.value)}
            className={baseClasses}
            required={field.required}
          >
            <option value="">Select {field.name}</option>
            {field.options?.map((option, index) => (
              <option key={index} value={typeof option === 'string' ? option : option.id}>
                {typeof option === 'string' ? option : option.name}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={formData[field.variable] || ''}
            onChange={(e) => handleInputChange(field.variable, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className={`${baseClasses} min-h-[100px] resize-none`}
            required={field.required}
            rows={4}
          />
        );

      case 'number':
        return (
          <input
            id={fieldId}
            type="number"
            value={formData[field.variable] || ''}
            onChange={(e) => handleInputChange(field.variable, parseInt(e.target.value))}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className={baseClasses}
            required={field.required}
            min={field.min || 1}
            max={field.max || 1000}
          />
        );

      case 'boolean':
        return (
          <div className="flex items-center space-x-3">
            <input
              id={fieldId}
              type="checkbox"
              checked={formData[field.variable] || false}
              onChange={(e) => handleInputChange(field.variable, e.target.checked)}
              className="w-5 h-5 text-blue-600 bg-white border-2 border-slate-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label htmlFor={fieldId} className="text-slate-700 font-medium">
              {field.name}
            </label>
          </div>
        );

      default:
        return (
          <input
            id={fieldId}
            type="text"
            value={formData[field.variable] || ''}
            onChange={(e) => handleInputChange(field.variable, e.target.value)}
            placeholder={`Enter ${field.name.toLowerCase()}...`}
            className={baseClasses}
            required={field.required}
          />
        );
    }
  };

  const getSectionIcon = (section) => {
    const Icon = section.icon;
    return (
      <div className={`w-12 h-12 bg-gradient-to-r from-${section.color}-500 to-${section.color}-600 rounded-2xl flex items-center justify-center shadow-lg`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">{flowName}</h1>
            <p className="text-slate-600 mt-1">Fill out the form below to generate your content</p>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {sections.map((section, index) => (
            <div key={section.id} className="flex items-center">
              <button
                onClick={() => setActiveSection(index)}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-200 ${
                  activeSection === index
                    ? `bg-${section.color}-500 text-white shadow-lg scale-110`
                    : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                {index + 1}
              </button>
              {index < sections.length - 1 && (
                <div className={`w-8 h-1 mx-2 rounded ${
                  activeSection > index ? `bg-${section.color}-500` : 'bg-slate-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Current Section */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className={`bg-gradient-to-r from-${sections[activeSection]?.color}-500 to-${sections[activeSection]?.color}-600 p-6`}>
            <div className="flex items-center gap-4">
              {getSectionIcon(sections[activeSection])}
              <div>
                <h2 className="text-2xl font-bold text-white">{sections[activeSection]?.title}</h2>
                <p className="text-white/80 mt-1">
                  {sections[activeSection]?.fields.length} field{sections[activeSection]?.fields.length !== 1 ? 's' : ''} to complete
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            {sections[activeSection]?.fields.map((field) => (
              <div key={field.variable} className="space-y-2">
                <label htmlFor={`field-${field.variable}`} className="block text-sm font-semibold text-slate-700">
                  {field.name}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                
                {renderField(field)}
                
                {errors[field.variable] && (
                  <div className="flex items-center gap-2 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {errors[field.variable]}
                  </div>
                )}
                
                {field.description && (
                  <p className="text-slate-500 text-sm">{field.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            type="button"
            onClick={() => setActiveSection(Math.max(0, activeSection - 1))}
            disabled={activeSection === 0}
            className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300"
          >
            Previous
          </button>

          <div className="flex items-center gap-4">
            {activeSection === sections.length - 1 ? (
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold text-lg shadow-2xl hover:shadow-green-500/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Generating Content...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Generate Content
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveSection(Math.min(sections.length - 1, activeSection + 1))}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold transition-all duration-200 hover:shadow-lg"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default FormGenerator;
