import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import {
  ArrowLeft, AlertTriangle, CheckCircle, Camera, Download, Share, FileText,
  Shield, AlertOctagon, Clock, Sparkles, XCircle, Info, Star, Target,
  TrendingUp, Zap, Users, Activity, Hash, Calendar, Eye, Award, Beaker, 
  ChevronsDown, Leaf, Heart, Lightbulb, AlertCircle, ThumbsUp, ThumbsDown
} from 'lucide-react';
import Navbar from '../Navbar';
import { Trash2, Loader } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const AnalysisDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [openGroup, setOpenGroup] = useState(0);

  const loadAnalysisDetails = useCallback(async () => {
    try {
      const response = await apiService.getAnalysisDetails(id);

      if (response.success) {
        setAnalysis(response.data);
      } else {
        setError(response.error || 'Failed to load analysis details');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadAnalysisDetails();
  }, [loadAnalysisDetails]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusInfo = (verdict) => {
    if (verdict === 'avoid') {
      return {
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        text: 'Not Recommended',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        gradientClass: 'from-red-500 to-red-600'
      };
    } else if (verdict === 'caution') {
      return {
        icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
        text: 'Use with Caution',
        bgColor: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-800',
        gradientClass: 'from-amber-500 to-orange-500'
      };
    } else if (verdict === 'safe' || verdict === 'recommend') {
      return {
        icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
        text: 'Safe to Use',
        bgColor: 'bg-emerald-50 border-emerald-200',
        textColor: 'text-emerald-800',
        gradientClass: 'from-emerald-500 to-green-500'
      };
    } else {
      return {
        icon: <Info className="h-6 w-6 text-gray-600" />,
        text: 'Analysis Complete',
        bgColor: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-800',
        gradientClass: 'from-gray-500 to-slate-500'
      };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
          badge: 'bg-red-100 text-red-700 border-red-200',
          icon: 'bg-gradient-to-r from-red-500 to-orange-500'
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
          icon: 'bg-gradient-to-r from-yellow-500 to-amber-500'
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: 'bg-gradient-to-r from-blue-500 to-indigo-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
          badge: 'bg-gray-100 text-gray-700 border-gray-200',
          icon: 'bg-gradient-to-r from-gray-500 to-slate-500'
        };
    }
  };

  const getIngredientStatusInfo = (status) => {
    switch (status) {
      case 'safe':
        return {
          bg: 'bg-emerald-50 border-emerald-200',
          text: 'text-emerald-800',
          badge: 'bg-emerald-100 text-emerald-700 border-emerald-300',
          icon: <CheckCircle className="h-4 w-4 text-emerald-600" />
        };
      case 'caution':
        return {
          bg: 'bg-amber-50 border-amber-200',
          text: 'text-amber-800',
          badge: 'bg-amber-100 text-amber-700 border-amber-300',
          icon: <AlertTriangle className="h-4 w-4 text-amber-600" />
        };
      case 'danger':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-800',
          badge: 'bg-red-100 text-red-700 border-red-300',
          icon: <XCircle className="h-4 w-4 text-red-600" />
        };
      default:
        return {
          bg: 'bg-gray-50 border-gray-200',
          text: 'text-gray-800',
          badge: 'bg-gray-100 text-gray-700 border-gray-300',
          icon: <Info className="h-4 w-4 text-gray-600" />
        };
    }
  };

  const createPdfDocument = (analysis, parsedAnalysis) => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginX = 40;
    let cursorY = 40;

    // Header
    doc.setFillColor(60, 60, 100);
    doc.rect(0, 0, pageWidth, 50, 'F');
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('Ingredient Analysis Report', pageWidth / 2, 35, { align: 'center' });
    cursorY = 80;

    // Summary
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 90);
    doc.text('Analysis Summary', marginX, cursorY);
    cursorY += 20;

    const summaryText = parsedAnalysis.analysis_summary?.detailed_explanation || 'No summary available.';
    const wrappedSummary = doc.splitTextToSize(summaryText, pageWidth - marginX * 2);
    doc.setFontSize(11);
    doc.setTextColor(20, 20, 20);
    doc.text(wrappedSummary, marginX, cursorY);
    cursorY += wrappedSummary.length * 14 + 20;

    // Ingredient Groups Table
    doc.setFontSize(16);
    doc.setTextColor(40, 40, 90);
    doc.text('Ingredient Analysis by Group', marginX, cursorY);
    cursorY += 20;

    const tableBody = [];
    parsedAnalysis.ingredient_groups?.forEach(group => {
      tableBody.push([{ content: group.group_name, colSpan: 4, styles: { fontStyle: 'bold', fillColor: [230, 240, 255] } }]);
      group.ingredients.forEach(i => {
        tableBody.push([
          i.name,
          i.purpose || 'N/A',
          i.status?.toUpperCase() || 'N/A',
          i.quick_summary || 'N/A'
        ]);
      });
    });

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [['Ingredient', 'Purpose', 'Status', 'Summary']],
      body: tableBody,
      headStyles: {
        fillColor: [60, 60, 100],
        textColor: 255,
        fontStyle: 'bold'
      },
      styles: {
        fontSize: 10,
        cellPadding: 8,
        valign: 'middle'
      },
      didDrawPage: (data) => {
        cursorY = data.cursor.y + 30;
      }
    });

    return doc;
  };

  const handleDownload = () => {
    const doc = createPdfDocument(analysis, parsedAnalysis);
    doc.save(`analysis-${analysis.id}-${new Date(analysis.timestamp).toISOString().split('T')[0]}.pdf`);
  };

  const generatePdfBlob = () => {
    const doc = createPdfDocument(analysis, parsedAnalysis);
    return doc.output('blob');
  };

  const handleShare = async () => {
    try {
      const pdfBlob = generatePdfBlob();
      const file = new File([pdfBlob], 'ingredient-analysis.pdf', { type: 'application/pdf' });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'Ingredient Analysis Results',
          text: 'Check out my ingredient analysis results from IngredientAI',
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Sharing is not supported on this device/browser. The analysis URL has been copied to clipboard.');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share the analysis PDF.');
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const response = await apiService.deleteAnalysis(id);
      if (response.success) {
        navigate('/history');
      } else {
        alert('Failed to delete analysis. Please try again.');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('An error occurred while deleting. Please try again.');
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-400 to-purple-400 opacity-20 animate-pulse"></div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Loading analysis details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Analysis</h2>
            <p className="text-gray-600 mb-8">{error}</p>
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Back to History
            </button>
          </div>
        </div>
      </>
    );
  }

  if (!analysis) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-12 text-center max-w-md">
            <div className="w-20 h-20 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Camera className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Analysis Not Found</h2>
            <p className="text-gray-600 mb-8">The requested analysis could not be found.</p>
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
            >
              Back to History
            </button>
          </div>
        </div>
      </>
    );
  }

  let parsedAnalysis = null;
  try {
    parsedAnalysis = typeof analysis.result === 'string'
      ? JSON.parse(analysis.result)
      : analysis.result;
  } catch (e) {
    console.error('Error parsing analysis result:', e);
    parsedAnalysis = { no_valid_ingredients: true };
  }

  const statusInfo = getStatusInfo(parsedAnalysis?.recommendation?.verdict);

  return (
    <>
      <Navbar />
      <div className={`min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${showDeleteConfirm ? 'filter blur-sm pointer-events-none select-none' : ''}`}>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          
          {/* Enhanced Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/history')}
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 px-4 py-2 rounded-xl hover:bg-white/50 transition-all duration-200"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="font-medium">Back to History</span>
            </button>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex items-start gap-6">
                  <div className={`w-20 h-20 bg-gradient-to-r ${statusInfo.gradientClass} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                    <FileText className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent capitalize mb-2">
                      {analysis.category} Analysis Report
                    </h1>
                    <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-4">
                      <div className="flex items-center">
                        <Clock className="h-5 w-5 mr-2" />
                        <span className="font-medium">{formatDate(analysis.timestamp)}</span>
                      </div>
                      <div className="flex items-center">
                        <Hash className="h-5 w-5 mr-2" />
                        <span className="font-medium">ID: {analysis.id}</span>
                      </div>
                      {parsedAnalysis?.analysis_summary?.safety_score && (
                        <div className="flex items-center">
                          <Shield className="h-5 w-5 mr-2 text-emerald-500" />
                          <span className="font-medium">Safety: {parsedAnalysis.analysis_summary.safety_score}%</span>
                        </div>
                      )}
                      {parsedAnalysis?.analysis_summary?.concern_count !== undefined && (
                        <div className="flex items-center">
                          <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                          <span className="font-medium">Concerns: {parsedAnalysis.analysis_summary.concern_count}</span>
                        </div>
                      )}
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border ${statusInfo.bgColor}`}>
                      {statusInfo.icon}
                      <span className={`font-semibold ${statusInfo.textColor}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 hover:shadow-md transition-all duration-200"
                  >
                    <Download className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={handleShare}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 hover:shadow-md transition-all duration-200"
                  >
                    <Share className="h-4 w-4" />
                    Share
                  </button>
                  <button
                    onClick={handleDeleteClick}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={deleting}
                  >
                    {deleting ? <Loader className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            
            {/* Left Column - Image */}
            <div className="xl:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Analyzed Image</h3>
                </div>

                {analysis.image_url ? (
                  <img
                    src={analysis.image_url}
                    alt="Analyzed ingredient list"
                    className="w-full rounded-2xl shadow-lg border border-gray-200"
                  />
                ) : (
                  <div className="text-center py-16">
                    <Camera className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-semibold">Image not available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Analysis Details */}
            <div className="xl:col-span-2 space-y-8">
              
              {/* Analysis Summary */}
              {parsedAnalysis?.analysis_summary && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Analysis Summary</h3>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-emerald-600">Safety Score</p>
                          <p className="text-2xl font-bold text-emerald-700">{parsedAnalysis.analysis_summary.safety_score}%</p>
                        </div>
                        <Shield className="h-8 w-8 text-emerald-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-amber-600">Concerns</p>
                          <p className="text-2xl font-bold text-amber-700">{parsedAnalysis.analysis_summary.concern_count || 0}</p>
                        </div>
                        <AlertCircle className="h-8 w-8 text-amber-500" />
                      </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-600">Verdict</p>
                          <p className="text-lg font-bold text-blue-700 capitalize">{parsedAnalysis.recommendation?.verdict || 'N/A'}</p>
                        </div>
                        {parsedAnalysis.recommendation?.verdict === 'recommend' ? 
                          <ThumbsUp className="h-8 w-8 text-blue-500" /> : 
                          <ThumbsDown className="h-8 w-8 text-blue-500" />
                        }
                      </div>
                    </div>
                  </div>

                  {/* Main Verdict */}
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 mb-4 border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-6 w-6 text-amber-500 mt-1" />
                      <div>
                        <h4 className="font-bold text-lg text-gray-800 mb-2">Main Verdict</h4>
                        <p className="text-gray-700 leading-relaxed">{parsedAnalysis.analysis_summary.main_verdict}</p>
                      </div>
                    </div>
                  </div>

                  {/* Detailed Explanation */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-start gap-3">
                      <FileText className="h-6 w-6 text-blue-500 mt-1" />
                      <div>
                        <h4 className="font-bold text-lg text-blue-800 mb-2">Detailed Explanation</h4>
                        <p className="text-blue-700 leading-relaxed">{parsedAnalysis.analysis_summary.detailed_explanation}</p>
                      </div>
                    </div>
                  </div>

                  {/* Nutritional Highlights (if applicable) */}
                  {parsedAnalysis.analysis_summary.nutritional_highlights && 
                   parsedAnalysis.analysis_summary.nutritional_highlights !== "Not applicable to soap." && (
                    <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                      <div className="flex items-start gap-3">
                        <Leaf className="h-6 w-6 text-green-500 mt-1" />
                        <div>
                          <h4 className="font-bold text-lg text-green-800 mb-2">Nutritional Highlights</h4>
                          <p className="text-green-700">{parsedAnalysis.analysis_summary.nutritional_highlights}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ingredient Groups */}
              {parsedAnalysis?.ingredient_groups && parsedAnalysis.ingredient_groups.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Beaker className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Ingredient Analysis</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {parsedAnalysis.ingredient_groups.map((group, index) => (
                      <div key={index} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                        <button
                          className="w-full text-left p-6 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 transition-all duration-200 flex justify-between items-center"
                          onClick={() => setOpenGroup(openGroup === index ? -1 : index)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <span className="text-white font-bold text-sm">{index + 1}</span>
                            </div>
                            <h4 className="text-lg font-bold text-gray-800">{group.group_name}</h4>
                            <span className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full border border-blue-200">
                              {group.ingredients.length} ingredient{group.ingredients.length !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <ChevronsDown 
                            className={`h-5 w-5 text-gray-500 transform transition-transform duration-200 ${
                              openGroup === index ? 'rotate-180' : ''
                            }`} 
                          />
                        </button>
                        
                        {openGroup === index && (
                          <div className="divide-y divide-gray-100">
                            {group.ingredients.map((ingredient, i) => {
                              const statusInfo = getIngredientStatusInfo(ingredient.status);
                              return (
                                <div key={i} className={`p-6 ${statusInfo.bg} border-l-4 ${statusInfo.bg.includes('emerald') ? 'border-l-emerald-400' : statusInfo.bg.includes('amber') ? 'border-l-amber-400' : statusInfo.bg.includes('red') ? 'border-l-red-400' : 'border-l-gray-400'}`}>
                                  <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      {statusInfo.icon}
                                      <h5 className={`font-bold text-lg ${statusInfo.text}`}>{ingredient.name}</h5>
                                    </div>
                                    <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusInfo.badge}`}>
                                      {ingredient.status?.toUpperCase() || 'UNKNOWN'}
                                    </span>
                                  </div>
                                  
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                      <p className={`text-sm font-semibold ${statusInfo.text} mb-1`}>Purpose:</p>
                                      <p className={`text-sm ${statusInfo.text} opacity-90`}>{ingredient.purpose || 'Not specified'}</p>
                                    </div>
                                    <div>
                                      <p className={`text-sm font-semibold ${statusInfo.text} mb-1`}>Concern Level:</p>
                                      <p className={`text-sm ${statusInfo.text} opacity-90 capitalize`}>{ingredient.concern_level || 'Not specified'}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="mb-3">
                                    <p className={`text-sm font-semibold ${statusInfo.text} mb-1`}>Summary:</p>
                                    <p className={`text-sm ${statusInfo.text} opacity-90 leading-relaxed`}>{ingredient.quick_summary || 'No summary available'}</p>
                                  </div>
                                  
                                  {ingredient.why_flagged && (
                                    <div className="bg-white/50 rounded-lg p-3 border border-white/30">
                                      <div className="flex items-start gap-2">
                                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                                        <div>
                                          <p className="text-xs font-semibold text-amber-800 mb-1">Why This Was Flagged:</p>
                                          <p className="text-xs text-amber-700">{ingredient.why_flagged}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                  
                                  {ingredient.user_specific_risk && (
                                    <div className="bg-red-100/50 rounded-lg p-3 border border-red-200/50 mt-3">
                                      <div className="flex items-center gap-2">
                                        <AlertOctagon className="h-4 w-4 text-red-600" />
                                        <p className="text-xs font-semibold text-red-800">User-Specific Risk Identified</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Health Alerts */}
              {parsedAnalysis?.health_alerts && parsedAnalysis.health_alerts.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                      <AlertOctagon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Health Alerts</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {parsedAnalysis.health_alerts.map((alert, index) => {
                      const severityInfo = getSeverityColor(alert.severity);
                      return (
                        <div key={index} className={`${severityInfo.bg} border rounded-2xl p-6`}>
                          <div className="flex items-start gap-4">
                            <div className={`w-10 h-10 ${severityInfo.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
                              <AlertTriangle className="h-5 w-5 text-white" />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-bold text-lg text-gray-800">{alert.title || 'Health Alert'}</h4>
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${severityInfo.badge}`}>
                                  {alert.severity?.toUpperCase() || 'UNKNOWN'}
                                </span>
                              </div>
                              <p className="text-gray-700 leading-relaxed">{alert.description || alert.message}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Recommendations & Alternatives */}
              {parsedAnalysis?.alternatives && parsedAnalysis.alternatives.length > 0 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Sparkles className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Recommended Alternatives</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {parsedAnalysis.alternatives.map((alternative, index) => (
                      <div key={index} className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <h4 className="font-bold text-green-800 mb-2">{alternative.name}</h4>
                            <p className="text-sm text-green-700 mb-2 leading-relaxed">{alternative.why}</p>
                            <div className="bg-white/50 rounded-lg p-2 border border-green-200/50">
                              <p className="text-xs font-semibold text-green-800 mb-1">Benefit:</p>
                              <p className="text-xs text-green-700">{alternative.benefit}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Advice */}
              {parsedAnalysis?.key_advice && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Heart className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900">Expert Advice</h3>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                    <div className="flex items-start gap-3">
                      <Lightbulb className="h-6 w-6 text-indigo-500 mt-1" />
                      <p className="text-indigo-700 leading-relaxed">{parsedAnalysis.key_advice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Analysis Metadata */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-slate-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Activity className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Analysis Details</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <TrendingUp className="h-5 w-5 text-blue-500" />
                      <span className="font-semibold text-gray-700">Confidence</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 capitalize">
                      {parsedAnalysis?.recommendation?.confidence || 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Shield className="h-5 w-5 text-green-500" />
                      <span className="font-semibold text-gray-700">Safe to Try</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800">
                      {parsedAnalysis?.recommendation?.safe_to_try ? 'Yes' : 'No'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-center gap-3 mb-2">
                      <Zap className="h-5 w-5 text-purple-500" />
                      <span className="font-semibold text-gray-700">Status</span>
                    </div>
                    <p className="text-lg font-bold text-gray-800 capitalize">
                      {parsedAnalysis?.metadata?.status || 'Completed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="absolute inset-0 backdrop-blur-sm bg-black/20" onClick={handleDeleteCancel}></div>
          <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl relative z-10 animate-fade-in border border-white/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-red-100 to-red-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Analysis</h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete this analysis? This action cannot be undone and all data will be permanently removed.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-semibold border border-gray-200"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-semibold disabled:opacity-50 flex items-center gap-2 shadow-lg"
                >
                  {deleting ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalysisDetails;