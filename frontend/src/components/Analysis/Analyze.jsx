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
import ResultView from './ResultView';

const Analyze = () => {
  // State variables for managing file, preview, category, loading, errors, warnings, results, and drag state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [result, setResult] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);

  // Predefined categories for user selection
  const categories = [
    'Food & Beverages',
    'Cosmetics & Skincare', 
    'Pharmaceuticals',
    'Supplements',
    'Personal Care',
    'Household Products'
  ];

  // Handle file selection from input or drop, validate size and type, and generate preview URL
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

  // Manage drag events to style drag area when active
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  // Handle drop event by extracting and validating image file
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

  // Clear file selection and reset related states
  const clearFile = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setWarning('');
    setResult(null);

    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // Submit the selected file and category to API service and handle response
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validations before submission
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

      // Handle the API response states
      if (response.success) {
        if (response.analysisStatus === 'successful') {
          if (response.hasProcessingError) {
            // AI parsing failed despite successful analysis: advise user
            const advice = response.data.analysis.result.key_advice;
            setWarning(advice || 'Please retake photo with better lighting and ensure ingredient list is clearly visible');
          } else {
            // All good: set the result for display
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
        // API returned failure
        setError(response.error);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [selectedFile, category, previewUrl]);

  // Resets for starting a new analysis
  const startNewAnalysis = useCallback(() => {
    clearFile();
    setCategory('');
  }, [clearFile]);

  // Navigate user to history page
  const navigateToHistory = useCallback(() => {
    if (window.location.pathname !== '/history') {
      window.location.href = '/history';
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Navbar/>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header and instructions */}
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

        {/* Main like: show results if available or input form if not */}
        {result ? (
          <ResultView 
            result={result} 
            startNewAnalysis={startNewAnalysis} 
            navigateToHistory={navigateToHistory} 
          />
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Error message block */}
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

            {/* Warning message block */}
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

            {/* File upload and category selection section */}
            <div className="p-8 space-y-10">
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

              {/* Category selection buttons and custom input */}
                <div className="space-y-6">
                   <div className="mt-6">
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Or enter a custom category (e.g., Baby Products, Pet Food)..."
                    className="w-full border-2 border-gray-300 rounded-2xl shadow-sm px-6 py-4 text-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  />
                </div>
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
               
              </div>

              {/* Submit button */}
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
        )}
      </div>
    </div>
  );
};

export default Analyze;
