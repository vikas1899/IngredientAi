import React, { useState, useRef, useCallback } from 'react'; 
import { 
  Camera, Upload, X, AlertCircle, CheckCircle, Loader, FileImage, 
  Sparkles, History, RotateCcw, Shield, AlertTriangle, XCircle,
  TrendingUp, Star, Clock, ArrowRight, Info, Zap, Target, Heart,
  Activity, Lightbulb, Package, Award, Users, ThumbsUp, ThumbsDown,
  Eye, Brain, Pill, Leaf
} from 'lucide-react';
import Navbar from '../Navbar';
import { apiService } from '../../services/apiService';

const Analyze = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    'Food & Beverages',
    'Cosmetics & Skincare', 
    'Pharmaceuticals',
    'Supplements',
    'Personal Care',
    'Household Products'
  ];

  const handleFileSelect = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setError('');
      setWarning('');
      setResult(null);
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please drop an image file');
      return;
    }

    handleFileSelect({ target: { files: [file] } });
  }, [handleFileSelect]);

  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setWarning('');
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }
    if (!category) {
      setError('Please select a category');
      return;
    }

    setLoading(true);
    setError('');
    setWarning('');

    try {
      const response = await apiService.analyzeIngredients(selectedFile, category);
      console.log(typeof response)
      console.log(response)
      console.log(typeof response.response)
      console.log(response.alternatives);
      
      if (response.success) {
        if (response.analysisStatus === 'successful') {
          if (response.hasProcessingError) {
            // Analysis completed but AI parsing failed
            const advice = response.data.analysis.result.key_advice;
            setWarning(advice || 'Please retake photo with better lighting and ensure ingredient list is clearly visible');
          } else {
            // Complete success
            setResult({
              id: response.data.analysis.id,
              category: response.data.analysis.category,
              image_url: previewUrl,
              result: response.data.analysis.result,
              timestamp: response.data.analysis.created_at,
              message: response.data.message
            });
          }
        }
      } else {
        // Complete failure
        setError(response.error);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, category, previewUrl]);

  const startNewAnalysis = useCallback(() => {
    clearFile();
    setCategory('');
  }, [clearFile]);

  const navigateToHistory = useCallback(() => {
    if (window.location.pathname !== '/history') {
      window.location.href = '/history';
    }
  }, []);

  // Helper functions for styling based on status/severity
  const getStatusColor = (status) => {
    switch(status) {
      case 'safe': return 'text-green-700 bg-green-50 border-green-200';
      case 'caution': return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'danger': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'safe': return <CheckCircle className="h-5 w-5" />;
      case 'caution': return <AlertTriangle className="h-5 w-5" />;
      case 'danger': return <XCircle className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'low': return 'text-green-800 bg-green-100 border-green-300';
      case 'medium': return 'text-yellow-800 bg-yellow-100 border-yellow-300';
      case 'high': return 'text-red-800 bg-red-100 border-red-300';
      default: return 'text-gray-800 bg-gray-100 border-gray-300';
    }
  };

  const getVerdictStyle = (verdict) => {
    switch(verdict) {
      case 'recommend': return 'bg-green-500 text-white border-green-600';
      case 'caution': return 'bg-yellow-500 text-white border-yellow-600';
      case 'avoid': return 'bg-red-500 text-white border-red-600';
      default: return 'bg-gray-500 text-white border-gray-600';
    }
  };

  const getSafetyLevelColor = (level) => {
    switch(level) {
      case 'safe': return 'text-green-600';
      case 'caution': return 'text-yellow-600';
      case 'danger': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getAlertIcon = (type) => {
    switch(type) {
      case 'allergy_match': return <AlertTriangle className="h-5 w-5" />;
      case 'condition_risk': return <Heart className="h-5 w-5" />;
      case 'interaction_warning': return <Pill className="h-5 w-5" />;
      default: return <Info className="h-5 w-5" />;
    }
  };

  // Enhanced analysis result renderer for new JSON structure
  const renderJsonAnalysisResult = (analysisResult) => {
    if (!analysisResult || typeof analysisResult === 'string') {
      return renderLegacyAnalysisResult(analysisResult);
    }

    const {
      no_valid_ingredients,
      analysis_summary = {},
      ingredients = [],
      health_alerts = [],
      recommendation = {},
      alternatives = [],
      key_advice
    } = analysisResult;

    // Handle no valid ingredients case
    if (no_valid_ingredients) {
      return (
        <div className="text-center py-16">
          <div className="bg-gradient-to-br from-amber-100 to-orange-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="h-12 w-12 text-amber-600" />
          </div>
          <h4 className="text-3xl font-bold text-amber-800 mb-6">
            Processing Issue Detected
          </h4>
          <div className="max-w-2xl mx-auto">
            <p className="text-lg text-amber-700 leading-relaxed mb-8">
              {key_advice || "Could not process the image clearly. Please try again with better lighting and ensure the ingredient list is clearly visible."}
            </p>
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
              <h5 className="font-bold text-amber-800 mb-4 flex items-center text-lg">
                <Lightbulb className="h-5 w-5 mr-3" />
                Tips to improve results:
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
                <div className="flex items-start space-x-2">
                  <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Ensure clear, readable ingredient text</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Use proper lighting and focus</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Verify correct product category</span>
                </div>
                <div className="flex items-start space-x-2">
                  <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>Try a higher resolution image</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const safetyScore = analysis_summary.safety_score || 0;
    const safetyLevel = analysis_summary.safety_level || 'unknown';
    const concernCount = analysis_summary.concern_count || 0;

    const filteredHealthAlerts = health_alerts?.filter(alert => alert.type !== 'none') || [];

    return (
      <div className="space-y-10">
        {/* Enhanced Analysis Summary Card */}
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-3xl border border-blue-200 shadow-xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/30 to-transparent rounded-full transform translate-x-16 -translate-y-16"></div>
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                <div className="bg-blue-500 rounded-xl p-2 mr-4">
                  <Activity className="h-6 w-6 text-white" />
                </div>
                Analysis Summary
              </h3>
              <div className={`px-4 py-2 rounded-full text-sm font-bold border-2 ${getVerdictStyle(recommendation.verdict)}`}>
                {recommendation.verdict?.toUpperCase() || 'UNKNOWN'}
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-6">
              {/* Safety Score */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      className="text-gray-200"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${2 * Math.PI * 40}`}
                      strokeDashoffset={`${2 * Math.PI * 40 * (1 - safetyScore / 100)}`}
                      className={`transition-all duration-1000 ${getSafetyLevelColor(safetyLevel)}`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-2xl font-bold ${getSafetyLevelColor(safetyLevel)}`}>
                      {safetyScore}
                    </span>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-600 mb-1">Safety Score</div>
                <div className={`text-lg font-bold ${getSafetyLevelColor(safetyLevel)}`}>
                  {safetyLevel.charAt(0).toUpperCase() + safetyLevel.slice(1)}
                </div>
              </div>
              
              {/* Health Concerns */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4 bg-gradient-to-br from-red-100 to-red-200 rounded-full">
                  <span className="text-3xl font-bold text-red-600">{concernCount}</span>
                </div>
                <div className="text-sm font-medium text-gray-600 mb-1">Health Concerns</div>
                <div className="text-lg font-bold text-red-600">
                  {concernCount === 0 ? 'None Found' : `${concernCount} Issues`}
                </div>
              </div>
              
              {/* Confidence Level */}
              <div className="text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <div className="text-sm font-medium text-gray-600 mb-1">AI Confidence</div>
                <div className={`text-lg font-bold ${
                  recommendation.confidence === 'high' ? 'text-green-600' :
                  recommendation.confidence === 'medium' ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {recommendation.confidence?.toUpperCase() || 'LOW'}
                </div>
              </div>
            </div>
            
            {/* Main Verdict */}
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-white/50">
              <h4 className="font-bold text-gray-900 mb-3 flex items-center text-lg">
                <Target className="h-5 w-5 mr-2" />
                Expert Assessment
              </h4>
              <p className="text-gray-800 font-medium leading-relaxed">
                {analysis_summary.main_verdict || "Analysis completed successfully."}
              </p>
            </div>
          </div>
        </div>
        

        {/* Health Alerts - Enhanced */}
        {filteredHealthAlerts && filteredHealthAlerts.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="bg-red-500 rounded-xl p-2 mr-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              Health Alerts
              <span className="ml-3 px-3 py-1 bg-red-100 text-red-700 text-sm font-bold rounded-full">
                {filteredHealthAlerts.length}
              </span>
            </h3>
            <div className="grid gap-6">
              {filteredHealthAlerts.map((alert, index) => (
                <div key={index} className={`relative overflow-hidden rounded-2xl border-l-8 ${
                  alert.severity === 'high' ? 'border-red-500 bg-gradient-to-r from-red-50 to-red-25' :
                  alert.severity === 'medium' ? 'border-yellow-500 bg-gradient-to-r from-yellow-50 to-yellow-25' :
                  'border-blue-500 bg-gradient-to-r from-blue-50 to-blue-25'
                } shadow-lg`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center mb-3">
                          <div className={`p-2 rounded-lg mr-3 ${getSeverityColor(alert.severity)}`}>
                            {getAlertIcon(alert.type)}
                          </div>
                          <div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(alert.severity)}`}>
                              {alert.severity?.toUpperCase()} RISK
                            </span>
                            <div className="text-sm text-gray-600 mt-1 font-medium">
                              Ingredient: {alert.ingredient}
                            </div>
                          </div>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mb-2">{alert.message}</h4>
                        <div className="bg-white/70 rounded-lg p-3 border">
                          <p className="text-sm text-gray-700">
                            <span className="font-semibold">Recommended Action:</span> {alert.action}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ingredients Analysis - Enhanced */}
        {ingredients && ingredients.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="bg-purple-500 rounded-xl p-2 mr-4">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              Ingredient Analysis
              <span className="ml-3 px-3 py-1 bg-purple-100 text-purple-700 text-sm font-bold rounded-full">
                {ingredients.length}
              </span>
            </h3>
            <div className="grid gap-4">
              {ingredients.map((ingredient, index) => (
                <div key={index} className={`relative overflow-hidden rounded-2xl border-2 shadow-md hover:shadow-lg transition-shadow ${getStatusColor(ingredient.status)}`}>
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2">{ingredient.name}</h4>
                        <p className="text-gray-700 font-medium leading-relaxed">{ingredient.quick_summary}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        {ingredient.user_specific_risk && (
                          <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full border border-red-600">
                            PERSONAL RISK
                          </span>
                        )}
                        <div className={`p-2 rounded-full border-2 ${getStatusColor(ingredient.status)}`}>
                          {getStatusIcon(ingredient.status)}
                        </div>
                      </div>
                    </div>
                    {ingredient.why_flagged && (
                      <div className="bg-white/70 rounded-lg p-4 border border-gray-200">
                        <h5 className="font-semibold text-gray-900 mb-2 flex items-center">
                          <Info className="h-4 w-4 mr-2" />
                          Why This Ingredient Was Flagged:
                        </h5>
                        <p className="text-sm text-gray-700">{ingredient.why_flagged}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Recommendation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-gray-50 rounded-3xl border-2 border-gray-200 shadow-xl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-green-200/20 to-transparent rounded-full transform -translate-x-16 -translate-y-16"></div>
          <div className="relative p-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center mb-6">
              <div className="bg-green-500 rounded-xl p-2 mr-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              Our Expert Recommendation
            </h3>
            <div className={`relative overflow-hidden rounded-2xl p-8 text-center shadow-lg ${
              recommendation.safe_to_try 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' 
                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white'
            }`}>
              <div className="relative z-10">
                <div className="text-4xl mb-4">
                  {recommendation.safe_to_try ? (
                    <div className="flex items-center justify-center space-x-2">
                      <ThumbsUp className="h-12 w-12" />
                      <span>✅</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <ThumbsDown className="h-12 w-12" />
                      <span>❌</span>
                    </div>
                  )}
                </div>
                <h4 className="text-2xl font-bold mb-4">
                  {recommendation.safe_to_try ? 'Safe to Use' : 'Not Recommended'}
                </h4>
                <p className="text-lg font-medium leading-relaxed opacity-90">
                  {recommendation.reason || "Based on our analysis of the ingredients and your health profile."}
                </p>
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12"></div>
            </div>
          </div>
        </div>

        {/* Enhanced Alternatives Section */}
        {alternatives && alternatives.length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <div className="bg-yellow-500 rounded-xl p-2 mr-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              Better Alternatives for You
              <span className="ml-3 px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-bold rounded-full">
                {alternatives.length} Found
              </span>
            </h3>
            <div className="grid gap-6 md:grid-cols-2">
              {alternatives.map((alternative, index) => (
                <div key={index} className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 shadow-lg hover:shadow-xl transition-all duration-300 group">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 rounded-lg p-2">
                          <Package className="h-5 w-5 text-white" />
                        </div>
                        <h4 className="text-xl font-bold text-green-800 group-hover:text-green-900 transition-colors">
                          {alternative.name}
                        </h4>
                      </div>
                      <Award className="h-6 w-6 text-green-600" />
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-white/70 rounded-lg p-4 border border-green-100">
                        <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                          <Lightbulb className="h-4 w-4 mr-2" />
                          Why We Recommend This:
                        </h5>
                        <p className="text-green-700 text-sm leading-relaxed">{alternative.why}</p>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg p-4 border border-green-200">
                        <h5 className="font-semibold text-green-800 mb-2 flex items-center">
                          <Heart className="h-4 w-4 mr-2" />
                          Key Benefits for You:
                        </h5>
                        <p className="text-green-700 text-sm font-medium">{alternative.benefit}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent transform translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Key Advice */}
        {key_advice && (
          <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white rounded-3xl shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full transform translate-x-32 -translate-y-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full transform -translate-x-24 translate-y-24"></div>
            
            <div className="relative p-8 z-10">
              <h3 className="text-2xl font-bold flex items-center mb-6">
                <div className="bg-white/20 rounded-xl p-2 mr-4">
                  <Zap className="h-6 w-6" />
                </div>
                Expert's Key Advice
              </h3>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                <p className="text-xl font-medium leading-relaxed">{key_advice}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Legacy renderer for string-based results (keeping for backward compatibility)
  const renderLegacyAnalysisResult = (analysisText) => {
    if (!analysisText || typeof analysisText !== 'string') {
      return (
        <div className="text-center py-8">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-green-800 mb-2">
            Analysis Completed Successfully
          </h4>
          <p className="text-green-700">Your ingredient analysis has been processed.</p>
        </div>
      );
    }

    if (analysisText.toLowerCase().includes('no valid ingredients are detected')) {
      return (
        <div className="text-center py-12">
          <AlertCircle className="h-16 w-16 text-amber-400 mx-auto mb-6" />
          <h4 className="text-2xl font-semibold text-amber-800 mb-4">
            No Ingredients Detected
          </h4>
          <p className="text-amber-700 leading-relaxed mb-6 max-w-2xl mx-auto">{analysisText}</p>
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 max-w-2xl mx-auto">
            <h5 className="font-bold text-amber-800 mb-4 flex items-center justify-center">
              <Lightbulb className="h-5 w-5 mr-2" />
              Tips to improve results:
            </h5>
            <ul className="text-sm text-amber-700 space-y-2">
              <li className="flex items-center"><Eye className="h-4 w-4 mr-2" />Ensure the image shows clear ingredient text</li>
              <li className="flex items-center"><Target className="h-4 w-4 mr-2" />Check that the product category matches your image</li>
              <li className="flex items-center"><Zap className="h-4 w-4 mr-2" />Try better lighting or higher resolution image</li>
              <li className="flex items-center"><Camera className="h-4 w-4 mr-2" />Make sure text is not blurry or cut off</li>
            </ul>
          </div>
        </div>
      );
    }

    // For other legacy text results, display in a simple format
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileImage className="h-5 w-5 mr-2" />
          Analysis Results
        </h4>
        <div className="prose prose-sm max-w-none text-gray-700">
          {analysisText.split('\n').map((line, index) => (
            <p key={index} className="mb-2">{line}</p>
          ))}
        </div>
      </div>
    );
  };

  const getResultProperty = (property, fallback = '') => {
    return result?.[property] || fallback;
  };

  const renderAnalysisResult = () => {
    const analysisResult = getResultProperty('result');
    
    // Check if result is JSON object or string
    if (typeof analysisResult === 'object' && analysisResult !== null) {
      return renderJsonAnalysisResult(analysisResult);
    } else {
      return renderLegacyAnalysisResult(analysisResult);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <header className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-2xl">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-6xl py-2 font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-6">
            AI Ingredient Analysis
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Upload an image of ingredient lists and get personalized AI-powered analysis 
            tailored to your health profile and dietary needs. Our advanced AI examines 
            each ingredient for safety, potential risks, and provides expert recommendations.
          </p>
        </header>

        {/* Main Content */}
        {!result ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Enhanced Error Display */}
            {error && (
              <div className="mx-8 mt-8">
                <div className="flex items-start bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-red-500 rounded-full p-2">
                      <AlertCircle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-red-800 mb-2">Analysis Error</h4>
                    <p className="text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Warning Display */}
            {warning && (
              <div className="mx-8 mt-8">
                <div className="flex items-start bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                  <div className="flex-shrink-0 mr-4">
                    <div className="bg-amber-500 rounded-full p-2">
                      <AlertTriangle className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-amber-800 mb-2">Processing Notice</h4>
                    <p className="text-amber-700">{warning}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="p-8 space-y-10">
              {/* Enhanced File Upload Section */}
              {!previewUrl ? (
                <div className="space-y-6">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                    <div className="bg-blue-100 rounded-xl p-2 mr-4">
                      <FileImage className="h-6 w-6 text-blue-600" />
                    </div>
                    Upload Product Image
                  </h2>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex flex-col items-center justify-center border-3 border-dashed rounded-3xl p-16 cursor-pointer transition-all duration-300 ${
                      dragActive
                        ? 'border-blue-400 bg-blue-50 scale-105 shadow-xl'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50 hover:shadow-lg'
                    }`}
                  >
                    <div className="text-center">
                      <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-6 transition-all ${
                        dragActive ? 'bg-blue-500 scale-110' : 'bg-gray-100 hover:bg-blue-100'
                      }`}>
                        <Upload className={`h-12 w-12 transition-colors ${
                          dragActive ? 'text-white' : 'text-gray-400 hover:text-blue-500'
                        }`} />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        {dragActive ? 'Drop your image here!' : 'Drag & drop your image here'}
                      </h3>
                      <p className="text-gray-600 mb-6 text-lg">or click to browse files</p>
                      <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 rounded-xl text-sm font-bold border border-blue-200">
                        📱 PNG, JPG, GIF • Max 10MB
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                      <div className="bg-green-100 rounded-xl p-2 mr-4">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      Image Ready for Analysis
                    </h2>
                    <button
                      type="button"
                      onClick={clearFile}
                      className="flex items-center px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors font-medium"
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Change Image
                    </button>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative inline-block group">
                      <img
                        src={previewUrl}
                        alt="Selected ingredient list"
                        className="min-w-48 min-h-48 max-w-full max-h-96 rounded-2xl shadow-2xl border-4 border-white object-contain"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300" />
                      <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <p className="text-sm font-medium">Ready for AI analysis</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Category Selection */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-gray-900 flex items-center">
                  <div className="bg-purple-100 rounded-xl p-2 mr-4">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                  Select Product Category
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`group p-6 text-left rounded-2xl border-2 transition-all duration-200 ${
                        category === cat
                          ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-purple-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:shadow-md'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className={`p-2 rounded-lg transition-colors ${
                          category === cat ? 'bg-purple-500' : 'bg-gray-200 group-hover:bg-purple-200'
                        }`}>
                          <Package className={`h-5 w-5 ${
                            category === cat ? 'text-white' : 'text-gray-600 group-hover:text-purple-600'
                          }`} />
                        </div>
                        {category === cat && <CheckCircle className="h-5 w-5 text-purple-600" />}
                      </div>
                      <div className="font-bold text-lg">{cat}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-6">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Or enter a custom category (e.g., Baby Products, Pet Food)..."
                    className="w-full border-2 border-gray-300 rounded-2xl shadow-sm px-6 py-4 text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
              </div>

              {/* Enhanced Submit Button */}
              <div className="text-center pt-8">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || !selectedFile || !category}
                  className="group relative inline-flex items-center px-12 py-6 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white text-xl font-bold rounded-3xl shadow-2xl hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
                  <div className="relative z-10 flex items-center">
                    {loading ? (
                      <>
                        <Loader className="animate-spin h-7 w-7 mr-4" />
                        <span>AI is Analyzing Your Ingredients...</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-white/20 rounded-full p-2 mr-4">
                          <Brain className="h-7 w-7" />
                        </div>
                        <span>Start AI-Powered Analysis</span>
                        <ArrowRight className="h-6 w-6 ml-3 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
                
                {(!selectedFile || !category) && (
                  <p className="text-gray-500 mt-4 flex items-center justify-center">
                    <Info className="h-4 w-4 mr-2" />
                    Please upload an image and select a category to continue
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Enhanced Results display section
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            <div className="p-8">
              {/* Enhanced Header with result info */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 space-y-4 lg:space-y-0">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-3 flex items-center">
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl p-3 mr-4">
                      <Activity className="h-8 w-8 text-white" />
                    </div>
                    Analysis Complete
                  </h2>
                  <div className="flex flex-wrap items-center text-sm text-gray-600 space-x-6">
                    <span className="flex items-center bg-gray-100 px-3 py-1 rounded-lg">
                      <Clock className="h-4 w-4 mr-2" />
                      {new Date(getResultProperty('timestamp')).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    <span className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                      <Package className="h-4 w-4 mr-2" />
                      {getResultProperty('category')}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-4">
                  <button
                    onClick={startNewAnalysis}
                    className="flex items-center px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-xl transition-colors shadow-lg font-medium"
                  >
                    <RotateCcw className="h-5 w-5 mr-2" />
                    New Analysis
                  </button>
                  <button
                    onClick={navigateToHistory}
                    className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors border-2 border-gray-200 font-medium"
                  >
                    <History className="h-5 w-5 mr-2" />
                    View History
                  </button>
                </div>
              </div>

              {/* Analysis results content */}
              <div className="space-y-8">
                {renderAnalysisResult()}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Analyze;