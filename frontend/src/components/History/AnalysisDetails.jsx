import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../../services/apiService';
import { 
  ArrowLeft, AlertTriangle, CheckCircle, Camera, Download, Share, FileText, 
  Shield, AlertOctagon, Clock, Sparkles, XCircle, Info, Star, Target,
  TrendingUp, Zap, Users, Activity, Hash, Calendar, Eye, Award, Beaker
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

  const getStatusInfo = (verdict, safetyScore) => {
    if (verdict === 'avoid') {
      return {
        icon: <XCircle className="h-6 w-6 text-red-600" />,
        text: 'Not Recommended',
        bgColor: 'bg-red-50 border-red-200',
        textColor: 'text-red-800',
        gradientBg: 'bg-gradient-to-r from-red-100 to-pink-100'
      };
    } else if (verdict === 'caution') {
      return {
        icon: <AlertTriangle className="h-6 w-6 text-amber-600" />,
        text: 'Use with Caution',
        bgColor: 'bg-amber-50 border-amber-200',
        textColor: 'text-amber-800',
        gradientBg: 'bg-gradient-to-r from-amber-100 to-orange-100'
      };
    } else if (verdict === 'safe' || verdict === 'recommend') {
      return {
        icon: <CheckCircle className="h-6 w-6 text-emerald-600" />,
        text: 'Safe to Use',
        bgColor: 'bg-emerald-50 border-emerald-200',
        textColor: 'text-emerald-800',
        gradientBg: 'bg-gradient-to-r from-emerald-100 to-teal-100'
      };
    } else {
      return {
        icon: <Info className="h-6 w-6 text-gray-600" />,
        text: 'Analysis Complete',
        bgColor: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-800',
        gradientBg: 'bg-gradient-to-r from-gray-100 to-slate-100'
      };
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return {
          bg: 'bg-gradient-to-r from-red-50 to-orange-50 border-red-200',
          badge: 'bg-red-100 text-red-700',
          icon: 'bg-gradient-to-r from-red-500 to-orange-500'
        };
      case 'medium':
        return {
          bg: 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200',
          badge: 'bg-yellow-100 text-yellow-700',
          icon: 'bg-gradient-to-r from-yellow-500 to-amber-500'
        };
      case 'low':
        return {
          bg: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200',
          badge: 'bg-blue-100 text-blue-700',
          icon: 'bg-gradient-to-r from-blue-500 to-indigo-500'
        };
      default:
        return {
          bg: 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200',
          badge: 'bg-gray-100 text-gray-700',
          icon: 'bg-gradient-to-r from-gray-500 to-slate-500'
        };
    }
  };

  const getIngredientStatusColor = (status) => {
    switch (status) {
      case 'safe':
        return 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200';
      case 'caution':
        return 'bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200';
      case 'danger':
        return 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200';
      default:
        return 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200';
    }
  };

  const getIngredientIconColor = (status) => {
    switch (status) {
      case 'safe':
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      case 'caution':
        return 'bg-gradient-to-r from-yellow-500 to-amber-500';
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-pink-500';
      default:
        return 'bg-gradient-to-r from-gray-500 to-slate-500';
    }
  };

const handleDownload = () => {
  // Initialize jsPDF document with point units and A4 size
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Margins for horizontal (X) and vertical (Y) padding
  const marginX = 40;
  const marginY = 40;

  // Variable to track vertical position while drawing content
  let cursorY = marginY;

  // -- HEADER SECTION --
  // Dark rectangle header background
  doc.setFillColor(60, 60, 100);
  doc.rect(0, 0, pageWidth, 50, 'F');

  // Slightly lighter band below header for gradient effect
  doc.setFillColor(100, 90, 150);
  doc.rect(0, 50, pageWidth, 10, 'F');

  // Header text centered, white, bold, large font
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('Ingredient Analysis Report', pageWidth / 2, 35, { align: 'center' });

  // Move cursor below header for next content
  cursorY = 70;

  // -- METADATA BOXES SECTION --
  // Array of key metadata labels and their values
  const metaData = [
    { label: 'Category', value: analysis.category || 'N/A' },
    { label: 'Analysis Date', value: new Date(analysis.timestamp).toLocaleDateString() },
    { label: 'Safety Score', value: (parsedAnalysis.analysis_summary?.safety_score ?? 'N/A') + '%' },
    { label: 'Health Alerts', value: parsedAnalysis.health_alerts?.length || 0 }
  ];

  // Calculate width of each metadata box with spacing
  const boxWidth = (pageWidth - marginX * 2 - (metaData.length - 1) * 15) / metaData.length;
  const boxHeight = 50;

  // Set font style for labels
  doc.setFontSize(12);
  doc.setTextColor(60, 60, 60);
  doc.setFont('helvetica', 'normal');

  // Draw each metadata box with shadow and background, position horizontally
  metaData.forEach((item, i) => {
    const boxX = marginX + i * (boxWidth + 15);
    const boxY = cursorY;

    // Shadow effect (offset rectangle)
    doc.setFillColor(240, 240, 250);
    doc.roundedRect(boxX + 3, boxY + 3, boxWidth, boxHeight, 6, 6, 'F');

    // Background rectangle (main box)
    doc.setFillColor(250, 250, 255);
    doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 6, 6, 'F');

    // Draw metadata label
    doc.setTextColor(100, 100, 130);
    doc.text(item.label, boxX + 12, boxY + 20);

    // Draw metadata value in bold, darker color
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(40, 40, 90);
    doc.text(item.value.toString(), boxX + 12, boxY + 40);
  });

  // Advance vertical cursor below metadata boxes with padding
  cursorY += boxHeight + 30;

  // -- LEGEND SECTION (Color code explanation) --
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('Legend - Ingredient Status Colors', marginX, cursorY);

  // Legend entries with color boxes and descriptions
  const legendItems = [
    { label: 'SAFE', color: [198, 239, 206], description: 'Low risk, safe to use ingredients.' },
    { label: 'CAUTION', color: [255, 235, 156], description: 'Medium risk, use with caution.' },
    { label: 'DANGER', color: [255, 199, 206], description: 'High risk, avoid use if possible.' }
  ];

  const squareSize = 14; // Size of color square
  let legendY = cursorY + 20; // Starting Y position for legend items
  const maxDescWidth = pageWidth - marginX * 2 - 100; // Available width for description text

  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'normal');

  // Draw each legend color square, label, and wrapped description
  legendItems.forEach(({ label, color, description }) => {
    doc.setFillColor(...color);
    doc.rect(marginX, legendY - squareSize + 3, squareSize, squareSize, 'F');

    doc.text(label, marginX + squareSize + 8, legendY);

    const wrappedDesc = doc.splitTextToSize(description, maxDescWidth);
    doc.text(wrappedDesc, marginX + squareSize + 60, legendY);

    // Increase vertical cursor based on wrapped description line count and line height
    legendY += wrappedDesc.length * 14;
  });

  // Update cursorY for next section with padding
  cursorY = legendY + 30;

  // -- INGREDIENTS OVERVIEW --
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('Ingredients Overview', marginX, cursorY);

  cursorY += 20;
  doc.setFontSize(11);
  doc.setTextColor(20, 20, 20);
  doc.setFont('helvetica', 'normal');

  // Join all ingredient names and wrap text to fit page width
  const ingredientNames = parsedAnalysis.ingredients?.map(i => i.name).join(', ') || 'N/A';
  const wrappedIngredients = doc.splitTextToSize(ingredientNames, pageWidth - marginX * 2);
  doc.text(wrappedIngredients, marginX, cursorY);

  // Advance cursorY by number of lines * line height + padding
  cursorY += wrappedIngredients.length * 14 + 20;

  // -- INGREDIENTS TABLE --
  // Color mapping for status values
  const statusColors = {
    safe: [198, 239, 206],
    caution: [255, 235, 156],
    danger: [255, 199, 206],
    default: [220, 220, 220]
  };

  // Prepare table body with color-coded status cell background
  const tableBody = parsedAnalysis.ingredients?.map(i => {
    const fillColor = statusColors[i.status?.toLowerCase()] || statusColors.default;
    return [
      { content: i.name, styles: { fillColor: [255, 255, 255] } },
      { content: i.status?.toUpperCase() || '', styles: { fillColor } },
      { content: i.concern_level || '', styles: { fillColor: [255, 255, 255] } },
      { content: i.quick_summary || '', styles: { fillColor: [255, 255, 255] } }
    ];
  }) || [];

  // Draw table, update cursorY after table has been rendered
  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['Ingredient', 'Status', 'Risk', 'Notes']],
    body: tableBody,
    headStyles: {
      fillColor: [60, 60, 100],
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 250]
    },
    styles: {
      fontSize: 10,
      cellPadding: 8,
      valign: 'middle'
    },
    columnStyles: {
      0: { cellWidth: 150 },
      1: { cellWidth: 70, halign: 'center' },
      2: { cellWidth: 70, halign: 'center' },
      3: { cellWidth: pageWidth - marginX * 2 - 290 }
    },
    didDrawPage: (data) => {
      // Update cursor position after table rendering for next section
      cursorY = data.cursor.y + 30;
    }
  });

  // -- AI RECOMMENDATION SECTION --
  // Add new page if not enough space for recommendation box
  if (cursorY + 80 > pageHeight - marginY) {
    doc.addPage();
    cursorY = marginY;
  }

  // Draw rounded rectangle background
  doc.setFillColor(230, 240, 255);
  doc.roundedRect(marginX, cursorY - 10, pageWidth - marginX * 2, 80, 10, 10, 'F');

  // Recommendation section heading
  doc.setFontSize(14);
  doc.setTextColor(40, 60, 100);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Recommendation', marginX + 12, cursorY + 20);

  // Recommendation text with wrapping
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(20, 20, 20);

  const recommendationText = parsedAnalysis.recommendation?.reason || 'No recommendation provided.';
  const wrappedRecommendation = doc.splitTextToSize(recommendationText, pageWidth - marginX * 2 - 24);
  doc.text(wrappedRecommendation, marginX + 12, cursorY + 40);

  cursorY += 90;

  // -- KEY ADVICE SECTION (optional) --
  if (parsedAnalysis.key_advice) {
    const adviceText = parsedAnalysis.key_advice;
    const wrappedAdvice = doc.splitTextToSize(adviceText, pageWidth - marginX * 2 - 24);
    const adviceHeight = wrappedAdvice.length * 14 + 30;

    // Add new page if not enough space
    if (cursorY + adviceHeight > pageHeight - marginY) {
      doc.addPage();
      cursorY = marginY;
    }

    // Rounded rectangle background
    doc.setFillColor(255, 248, 220);
    doc.roundedRect(marginX, cursorY - 10, pageWidth - marginX * 2, adviceHeight, 10, 10, 'F');

    // Key advice heading
    doc.setFontSize(14);
    doc.setTextColor(130, 90, 10);
    doc.setFont('helvetica', 'bold');
    doc.text('Key Advice', marginX + 12, cursorY + 20);

    // Advice text with wrapping
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 50, 10);

    doc.text(wrappedAdvice, marginX + 12, cursorY + 40);

    cursorY += adviceHeight + 20;
  }

  // -- FOOTER SECTION (Page numbers) --
  const pageCount = doc.internal.getNumberOfPages();
  doc.setFontSize(9);
  doc.setTextColor(150);

  // Loop over each page and add page number centered at bottom
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 20, { align: 'center' });
  }

  // Finally, save/download the PDF with a dynamic filename including analysis ID and date
  doc.save(`analysis-${analysis.id}-${new Date(analysis.timestamp).toISOString().split('T')[0]}.pdf`);
};


  const handleShare = async () => {
    const shareData = {
      title: 'Ingredient Analysis Results',
      text: `Check out my ingredient analysis results from IngredientAI`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Analysis URL copied to clipboard!');
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

  // FIXED: Parse the JSON string from analysis.result
  let parsedAnalysis = null;
  try {
    parsedAnalysis = typeof analysis.result === 'string' 
      ? JSON.parse(analysis.result) 
      : analysis.result;
  } catch (e) {
    console.error('Error parsing analysis result:', e);
    parsedAnalysis = { no_valid_ingredients: true };
  }


  const statusInfo = getStatusInfo(parsedAnalysis?.recommendation?.verdict, parsedAnalysis?.analysis_summary?.safety_score);

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
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
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
                    </div>
                    {/* Status Badge */}
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Enhanced Image Section */}
            <div className="xl:col-span-1">
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 sticky top-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Camera className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Analyzed Image</h3>
                </div>
                
                {analysis.image_url ? (
                  <div className="space-y-6">
                    <div className="relative group">
                      <img
                        src={analysis.image_url}
                        alt="Analyzed ingredient list"
                        className="w-full rounded-2xl shadow-lg border border-gray-200 group-hover:shadow-2xl transition-all duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Category</span>
                        <span className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-bold capitalize shadow-lg">
                          {analysis.category}
                        </span>
                      </div>
                      {parsedAnalysis?.ingredients?.length > 0 && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-600">Ingredients Found</span>
                          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold">
                            {parsedAnalysis.ingredients.length}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-600">Analysis Date</span>
                        <span className="text-sm text-gray-700 font-medium">
                          {new Date(analysis.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                      <Camera className="h-12 w-12 text-gray-400" />
                    </div>
                    <p className="text-gray-500 font-semibold text-lg">Image not available</p>
                    <p className="text-gray-400 text-sm mt-2">Analysis was performed on text input</p>
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Analysis Results */}
            <div className="xl:col-span-2">
              <div className="space-y-8">
                {/* Analysis Summary */}
                {parsedAnalysis?.analysis_summary && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Target className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">Analysis Summary</h3>
                    </div>

                    <div className={`${statusInfo.gradientBg} rounded-2xl p-6 border ${statusInfo.bgColor.split(' ')[1]} shadow-lg mb-6`}>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">{parsedAnalysis.analysis_summary.safety_score}%</div>
                          <div className="text-sm text-gray-600 font-medium">Safety Score</div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-1000"
                              style={{ width: `${parsedAnalysis.analysis_summary.safety_score}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">{parsedAnalysis.health_alerts?.length || 0}</div>
                          <div className="text-sm text-gray-600 font-medium">Health Alerts</div>
                          <div className={`mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                            (parsedAnalysis.health_alerts?.length || 0) > 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {(parsedAnalysis.health_alerts?.length || 0) > 0 ? 'Has Concerns' : 'No Concerns'}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-3xl font-bold text-gray-900">{parsedAnalysis.ingredients?.length || 0}</div>
                          <div className="text-sm text-gray-600 font-medium">Ingredients</div>
                          <div className="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">
                            Analyzed
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 pt-6 border-t border-gray-300">
                        <p className="text-gray-800 font-semibold text-center text-lg">{parsedAnalysis.analysis_summary.main_verdict}</p>
                        <div className="flex items-center justify-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600 font-medium capitalize">
                              {parsedAnalysis.analysis_summary.safety_level} Level
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-gray-600" />
                            <span className="text-sm text-gray-600 font-medium">
                              {parsedAnalysis.analysis_summary.should_use ? 'Recommended' : 'Not Recommended'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Health Alerts - Only show if there are alerts */}
                {parsedAnalysis?.health_alerts && parsedAnalysis.health_alerts.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                        <AlertTriangle className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Health Alerts ({parsedAnalysis.health_alerts.length})
                      </h3>
                    </div>

                    <div className="space-y-4">
                      {parsedAnalysis.health_alerts.map((alert, index) => {
                        const severityColors = getSeverityColor(alert.severity);
                        return (
                          <div
                            key={index}
                            className={`border rounded-2xl p-6 shadow-lg ${severityColors.bg}`}
                          >
                            <div className="flex items-start gap-4">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md ${severityColors.icon}`}>
                                <AlertTriangle className="h-6 w-6 text-white" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${severityColors.badge}`}>
                                    {alert.severity?.toUpperCase() || 'MEDIUM'}
                                  </span>
                                  <span className="text-sm font-semibold text-gray-600 bg-white/70 px-2 py-1 rounded-md">
                                    {alert.ingredient}
                                  </span>
                                  <span className="text-xs text-gray-500 bg-white/50 px-2 py-1 rounded-md">
                                    {alert.type?.replace('_', ' ').toUpperCase()}
                                  </span>
                                </div>
                                <p className="font-semibold text-gray-800 mb-3 text-lg">{alert.message}</p>
                                <div className="bg-white/70 rounded-lg p-3">
                                  <p className="text-sm text-gray-700">
                                    <strong className="text-gray-900">Recommended Action:</strong> {alert.action}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Ingredients List */}
                {parsedAnalysis?.ingredients && parsedAnalysis.ingredients.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Beaker className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Analyzed Ingredients ({parsedAnalysis.ingredients.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {parsedAnalysis.ingredients.map((ingredient, index) => {
                        const statusColors = getIngredientStatusColor(ingredient.status);
                        const iconColors = getIngredientIconColor(ingredient.status);
                        
                        return (
                          <div
                            key={index}
                            className={`border rounded-xl p-5 shadow-md hover:shadow-lg transition-all duration-200 ${statusColors}`}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md ${iconColors}`}>
                                <span className="text-white font-bold text-sm">{index + 1}</span>
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 mb-2 text-lg">{ingredient.name}</h4>
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    ingredient.status === 'safe' ? 'bg-emerald-100 text-emerald-700' :
                                    ingredient.status === 'caution' ? 'bg-yellow-100 text-yellow-700' :
                                    ingredient.status === 'danger' ? 'bg-red-100 text-red-700' :
                                    'bg-gray-100 text-gray-700'
                                  }`}>
                                    {ingredient.status?.toUpperCase()}
                                  </span>
                                  <span className="px-2 py-1 bg-white/70 text-gray-600 rounded-full text-xs font-medium">
                                    {ingredient.concern_level} risk
                                  </span>
                                  {ingredient.user_specific_risk && (
                                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                                      Personal Risk
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-700 mb-2 leading-relaxed">{ingredient.quick_summary}</p>
                                {ingredient.why_flagged && ingredient.why_flagged !== 'None' && (
                                  <div className="bg-white/70 rounded-md p-2 mt-2">
                                    <p className="text-xs text-gray-600">
                                      <strong>Why flagged:</strong> {ingredient.why_flagged}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                  {/* Alternatives Section */}
                {parsedAnalysis?.alternatives && parsedAnalysis.alternatives.length > 0 && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Sparkles className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        Recommended Alternatives ({parsedAnalysis.alternatives.length})
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      {parsedAnalysis.alternatives.map((alternative, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md">
                              <CheckCircle className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-xl font-bold text-gray-900 mb-3">{alternative.name}</h4>
                              
                              <div className="space-y-4">
                                <div className="bg-white/70 rounded-lg p-4">
                                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <Info className="h-4 w-4 text-blue-500" />
                                    Why This Alternative?
                                  </h5>
                                  <p className="text-gray-700 leading-relaxed">{alternative.why}</p>
                                </div>
                                
                                <div className="bg-gradient-to-r from-emerald-100 to-green-100 rounded-lg p-4">
                                  <h5 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                                    <Star className="h-4 w-4 text-emerald-500" />
                                    Key Benefits
                                  </h5>
                                  <p className="text-gray-700 leading-relaxed font-medium">{alternative.benefit}</p>
                                </div>
                              </div>
                              
                              <div className="mt-4 flex items-center gap-2">
                                <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
                                  Alternative #{index + 1}
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                                  Recommended
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                

                {/* Recommendation */}
                {parsedAnalysis?.recommendation && (
                  <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900">AI Recommendation</h3>
                    </div>

                    <div className={`border rounded-2xl p-8 shadow-lg ${
                      parsedAnalysis.recommendation.safe_to_try 
                        ? 'bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200'
                        : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-200'
                    }`}>
                      <div className="text-center mb-6">
                        <div className={`text-4xl font-bold mb-3 ${
                          parsedAnalysis.recommendation.safe_to_try ? 'text-emerald-700' : 'text-red-700'
                        }`}>
                          {parsedAnalysis.recommendation.safe_to_try ? '✅ Safe to Use' : '❌ Not Recommended'}
                        </div>
                        <span className="inline-block px-6 py-3 bg-white/80 rounded-full text-lg font-bold text-gray-800 capitalize shadow-lg">
                          {parsedAnalysis.recommendation.verdict}
                        </span>
                      </div>
                      
                      <div className="bg-white/70 rounded-xl p-6 mb-6">
                        <h4 className="font-bold text-gray-900 mb-3 text-lg">Our Analysis:</h4>
                        <p className="text-gray-800 leading-relaxed font-medium text-lg">
                          {parsedAnalysis.recommendation.reason}
                        </p>
                      </div>
                      
                      <div className="flex items-center justify-center gap-6">
                        <div className="flex items-center gap-2">
                          <Star className="h-6 w-6 text-yellow-500" />
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {parsedAnalysis.recommendation.confidence}
                            </div>
                            <div className="text-sm text-gray-600">Confidence</div>
                          </div>
                        </div>
                        <div className="h-8 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2">
                          <Shield className="h-6 w-6 text-blue-500" />
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {parsedAnalysis.recommendation.safe_to_try ? 'Yes' : 'No'}
                            </div>
                            <div className="text-sm text-gray-600">Safe to Try</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Key Advice */}
                {parsedAnalysis?.key_advice && (
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shadow-lg">
                        <Zap className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold">💡 Key Advice</h3>
                    </div>
                    <div className="bg-white/10 rounded-2xl p-6">
                      <p className="text-xl leading-relaxed font-medium">{parsedAnalysis.key_advice}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Enhanced Action Buttons */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-5 w-5 text-white" />
              </div>
              What would you like to do next?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button
                onClick={() => navigate('/analyze')}
                className="group flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <Camera className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-lg">Analyze Another</div>
                  <div className="text-sm opacity-90">Start new analysis</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/history')}
                className="group flex items-center justify-center gap-3 p-6 bg-white text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 hover:shadow-lg transition-all duration-200"
              >
                <TrendingUp className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-lg">View All Results</div>
                  <div className="text-sm text-gray-500">Browse history</div>
                </div>
              </button>
              <button
                onClick={() => navigate('/medical-history')}
                className="group flex items-center justify-center gap-3 p-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl hover:from-emerald-600 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                <Shield className="h-6 w-6 group-hover:scale-110 transition-transform duration-200" />
                <div className="text-left">
                  <div className="font-bold text-lg">Update Profile</div>
                  <div className="text-sm opacity-90">Medical history</div>
                </div>
              </button>
            </div>
          </div>

          {/* Enhanced Medical Disclaimer */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-8 shadow-2xl">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <AlertOctagon className="h-8 w-8 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="text-2xl font-bold text-amber-900 mb-4">🏥 Medical Disclaimer</h4>
                <div className="space-y-4">
                  <p className="text-amber-800 leading-relaxed text-lg">
                    This AI-powered analysis is designed for <strong>informational purposes only</strong> and should never replace professional medical advice. 
                    Our system analyzes ingredients based on available data and your provided medical history, but it cannot account for all 
                    individual health factors, drug interactions, or personal sensitivities.
                  </p>
                  <p className="text-amber-800 leading-relaxed">
                    Always consult qualified healthcare providers for medical decisions, dietary restrictions, and before making changes to your diet, 
                    supplements, or medication routine. Individual responses to ingredients can vary significantly.
                  </p>
                  <div className="mt-6 p-4 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border border-amber-300 shadow-lg">
                    <div className="flex items-center gap-3 mb-2">
                      <Activity className="h-5 w-5 text-amber-600" />
                      <p className="text-amber-900 font-bold">Emergency Protocol</p>
                    </div>
                    <p className="text-amber-800 font-medium">
                      📞 If you experience any adverse reactions, discontinue use immediately and seek medical attention. 
                      For emergencies, contact your local emergency services.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showDeleteConfirm && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="absolute inset-0 backdrop-blur-sm" onClick={handleDeleteCancel}></div>
    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl relative z-10 animate-fade-in">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Trash2 className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Analysis</h3>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Are you sure you want to delete this analysis? This action cannot be undone.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={handleDeleteCancel}
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-semibold"
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteConfirm}
            disabled={deleting}
            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center gap-2"
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
