import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../../services/apiService";
import {
  Camera,
  ChevronLeft,
  ChevronRight,
  Search,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Eye,
  TrendingUp,
  Shield,
  XCircle,
  Sparkles,
  Target,
  Clock,
  FileImage,
  Info,
  Filter,
  Trash2,
  Loader,
} from "lucide-react";
import Navbar from "../Navbar";

const History = () => {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiService.getAnalysisHistory(currentPage);
      if (response.success) {
        const data = response.data;
        setAnalyses(data.results || []);
        setTotalCount(data.count || 0);
        setTotalPages(Math.ceil((data.count || 0) / 10));
      } else {
        setError(response.error || "Failed to load analysis history");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, [currentPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // DELETE FUNCTIONALITY
  const handleDeleteClick = (e, analysisId) => {
    e.stopPropagation(); // Prevent navigation when clicking delete
    setShowDeleteConfirm(analysisId);
  };

  const handleDeleteConfirm = async (analysisId) => {
    setDeletingId(analysisId);
    try {
      const response = await apiService.deleteAnalysis(analysisId);
      if (response.success) {
        // Remove from local state
        setAnalyses((prev) =>
          prev.filter((analysis) => analysis.id !== analysisId),
        );
        setTotalCount((prev) => prev - 1);
        setShowDeleteConfirm(null);
        // If current page becomes empty and it's not page 1, go to previous page
        const newAnalysesCount = analyses.length - 1;
        if (newAnalysesCount === 0 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
      } else {
        alert("Failed to delete analysis. Please try again.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("An error occurred while deleting. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // FIXED: Enhanced analysis result parser with correct status mapping
  const parseAnalysisResult = (result) => {
    if (!result)
      return { status: "safe", summary: "Analysis completed", details: null };

    // Handle string format that contains JSON
    if (typeof result === "string") {
      try {
        const parsedResult = JSON.parse(result);
        return parseAnalysisResult(parsedResult);
      } catch {
        const resultLower = result.toLowerCase();
        if (
          resultLower.includes("not recommended") ||
          resultLower.includes("avoid") ||
          resultLower.includes("danger")
        ) {
          return { status: "danger", summary: result, details: null };
        }
        if (
          resultLower.includes("caution") ||
          resultLower.includes("moderate")
        ) {
          return { status: "caution", summary: result, details: null };
        }
        return { status: "safe", summary: result, details: null };
      }
    }

    // Handle object format
    if (typeof result === "object") {
      const {
        no_valid_ingredients,
        analysis_summary,
        recommendation,
        health_alerts = [],
        ingredients = [],
      } = result;

      if (no_valid_ingredients) {
        return {
          status: "unknown",
          summary: "No ingredients detected",
          details: result,
          safetyScore: 0,
          concerns: 0,
        };
      }

      let status = "safe"; // default
      if (recommendation?.verdict === "avoid") {
        status = "danger";
      } else if (recommendation?.verdict === "caution") {
        status = "caution";
      } else if (
        recommendation?.verdict === "recommend" ||
        recommendation?.verdict === "safe"
      ) {
        status = "safe";
      }

      return {
        status,
        summary:
          analysis_summary?.main_verdict ||
          recommendation?.reason ||
          "Analysis completed",
        details: result,
        safetyScore: analysis_summary?.safety_score || 0,
        concerns: health_alerts.length,
        ingredientCount: ingredients.length,
        confidence: recommendation?.confidence,
        verdict: recommendation?.verdict,
      };
    }

    return { status: "safe", summary: "Analysis completed", details: null };
  };

  // Enhanced status badge with correct status display
  const getStatusBadge = (analysisData) => {
    const { status, safetyScore, concerns } = analysisData;

    switch (status) {
      case "danger":
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-red-50 text-red-700 rounded-full border border-red-200">
              <XCircle className="h-3 w-3" />
              Not Recommended
            </span>
            {concerns > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-semibold rounded-full">
                {concerns} alerts
              </span>
            )}
          </div>
        );
      case "caution":
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-200">
              <AlertTriangle className="h-3 w-3" />
              Use with Caution
            </span>
            {concerns > 0 && (
              <span className="px-2 py-1 bg-amber-100 text-amber-600 text-xs font-semibold rounded-full">
                {concerns} concerns
              </span>
            )}
          </div>
        );
      case "unknown":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-gray-50 text-gray-700 rounded-full border border-gray-200">
            <Info className="h-3 w-3" />
            No Data
          </span>
        );
      default: // safe
        return (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
              <CheckCircle className="h-3 w-3" />
              Safe to Use
            </span>
            {safetyScore > 0 && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-600 text-xs font-semibold rounded-full">
                {safetyScore}% safe
              </span>
            )}
          </div>
        );
    }
  };

  // Enhanced filtering logic
  const filteredAnalyses = analyses.filter((analysis) => {
    const analysisData = parseAnalysisResult(analysis.result);
    // Filter by status
    if (filterStatus !== "all" && analysisData.status !== filterStatus) {
      return false;
    }
    // Filter by search term
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      (analysis.category &&
        analysis.category.toLowerCase().includes(searchLower)) ||
      (analysisData.summary &&
        analysisData.summary.toLowerCase().includes(searchLower)) ||
      (analysis.id && analysis.id.toString().includes(searchLower))
    );
  });

  // FIXED: Enhanced stats calculation with correct counting
  const stats = analyses.reduce(
    (acc, analysis) => {
      const data = parseAnalysisResult(analysis.result);
      acc.total++;
      // Count based on the status
      switch (data.status) {
        case "safe":
          acc.safe = (acc.safe || 0) + 1;
          break;
        case "caution":
          acc.caution = (acc.caution || 0) + 1;
          break;
        case "danger":
          acc.danger = (acc.danger || 0) + 1;
          break;
        case "unknown":
          acc.unknown = (acc.unknown || 0) + 1;
          break;
        default:
          acc.safe = (acc.safe || 0) + 1;
      }
      return acc;
    },
    { total: 0, safe: 0, caution: 0, danger: 0, unknown: 0 },
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading your analysis history...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Main content with blurred background when modal is open */}
      <div
        className={`relative min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 transition-all duration-300
                    ${showDeleteConfirm ? "filter blur-sm pointer-events-none select-none" : ""}`}
      >
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
              <TrendingUp className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl py-2 font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-4">
              Analysis History
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Review your past ingredient analyses and track your product safety
              journey over time.
            </p>
          </header>

          {error && (
            <div className="mb-8 p-6 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-4 shadow-lg">
              <div className="flex-shrink-0 p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">
                  Error Loading History
                </h4>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Search and Filter Bar */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by category, ingredients, or analysis ID..."
                    className="block w-full pl-12 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-lg"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="lg:w-64">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Filter className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="block w-full pl-12 pr-8 py-4 text-gray-900 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 text-lg appearance-none"
                  >
                    <option value="all">All Analyses</option>
                    <option value="safe">Safe Products</option>
                    <option value="caution">Use with Caution</option>
                    <option value="danger">Not Recommended</option>
                    <option value="unknown">No Data</option>
                  </select>
                </div>
              </div>
            </div>

            {(searchTerm || filterStatus !== "all") && (
              <div className="mt-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Found {filteredAnalyses.length} result
                  {filteredAnalyses.length !== 1 ? "s" : ""}
                  {searchTerm && ` for "${searchTerm}"`}
                  {filterStatus !== "all" && ` in ${filterStatus} category`}
                </div>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Stats Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {stats.total}
                  </p>
                  <p className="text-gray-600 font-medium">Total Analyses</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    {stats.safe}
                  </p>
                  <p className="text-gray-600 font-medium">Safe Products</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                    {stats.caution}
                  </p>
                  <p className="text-gray-600 font-medium">Use with Caution</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {stats.danger}
                  </p>
                  <p className="text-gray-600 font-medium">Not Recommended</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl">
                  <XCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Analysis List */}
          {filteredAnalyses.length > 0 ? (
            <div className="space-y-6">
              {filteredAnalyses.map((analysis) => {
                const analysisData = parseAnalysisResult(analysis.result);
                return (
                  <div
                    key={analysis.id}
                    className="group bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 hover:shadow-2xl hover:bg-white/95 transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-8">
                      <div className="flex items-start gap-8">
                        {/* Image Thumbnail */}
                        <div
                          className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden border-2 border-white shadow-lg cursor-pointer"
                          onClick={() => navigate(`/history/${analysis.id}`)}
                        >
                          {analysis.image_url ? (
                            <img
                              src={analysis.image_url}
                              alt="Analysis"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          ) : (
                            <FileImage className="h-10 w-10 text-gray-400" />
                          )}
                        </div>
                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-4">
                            <div
                              className="cursor-pointer flex-1"
                              onClick={() =>
                                navigate(`/history/${analysis.id}`)
                              }
                            >
                              <h3 className="text-2xl font-bold text-gray-900 capitalize group-hover:text-blue-700 transition-colors duration-200 mb-2">
                                {analysis.category} Analysis
                              </h3>
                              <div className="flex items-center gap-4 text-gray-500 mb-3">
                                <div className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-2" />
                                  <span className="text-sm font-medium">
                                    {formatDate(analysis.timestamp)}
                                  </span>
                                </div>
                                <div className="flex items-center">
                                  <Target className="h-4 w-4 mr-2" />
                                  <span className="text-sm font-medium">
                                    ID: {analysis.id}
                                  </span>
                                </div>
                              </div>
                            </div>
                            {getStatusBadge(analysisData)}
                          </div>
                          {/* Metrics */}
                          {analysisData.details && (
                            <div
                              className="flex items-center gap-6 mb-4 text-sm cursor-pointer"
                              onClick={() =>
                                navigate(`/history/${analysis.id}`)
                              }
                            >
                              {analysisData.safetyScore > 0 && (
                                <div className="flex items-center gap-2">
                                  <Shield className="h-4 w-4 text-blue-500" />
                                  <span className="font-medium text-gray-600">
                                    Safety: {analysisData.safetyScore}%
                                  </span>
                                </div>
                              )}
                              {analysisData.ingredientCount > 0 && (
                                <div className="flex items-center gap-2">
                                  <Sparkles className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium text-gray-600">
                                    {analysisData.ingredientCount} ingredients
                                  </span>
                                </div>
                              )}
                              {analysisData.confidence && (
                                <div className="flex items-center gap-2">
                                  <Target className="h-4 w-4 text-yellow-500" />
                                  <span className="font-medium text-gray-600">
                                    {analysisData.confidence} confidence
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Action Buttons */}
                          <div className="flex items-center justify-between">
                            <div
                              className="text-sm text-gray-500 cursor-pointer"
                              onClick={() =>
                                navigate(`/history/${analysis.id}`)
                              }
                            >
                              Click to view comprehensive analysis details
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() =>
                                  navigate(`/history/${analysis.id}`)
                                }
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg"
                              >
                                <Eye className="h-4 w-4" />
                                View Analysis
                              </button>
                              <button
                                onClick={(e) =>
                                  handleDeleteClick(e, analysis.id)
                                }
                                disabled={deletingId === analysis.id}
                                className="inline-flex items-center gap-2 px-4 py-3 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === analysis.id ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-8 mt-8">
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-sm text-gray-600 font-medium">
                      Showing {(currentPage - 1) * 10 + 1} to{" "}
                      {Math.min(currentPage * 10, totalCount)} of {totalCount}{" "}
                      results
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                      >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                      </button>
                      <div className="flex items-center gap-1">
                        {Array.from(
                          { length: Math.min(5, totalPages) },
                          (_, i) => {
                            const page = i + 1;
                            return (
                              <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200 ${
                                  currentPage === page
                                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-md"
                                }`}
                              >
                                {page}
                              </button>
                            );
                          },
                        )}
                      </div>
                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-md"
                      >
                        Next
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg border border-white/20 p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {searchTerm || filterStatus !== "all"
                    ? "No matching analyses found"
                    : "No analyses found"}
                </h3>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  {searchTerm || filterStatus !== "all"
                    ? `No analyses match your current filters. Try adjusting your search terms or filter settings.`
                    : "Start analyzing ingredients to see your history here. Your AI-powered analysis journey begins with a single scan!"}
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {(searchTerm || filterStatus !== "all") && (
                    <button
                      onClick={() => {
                        setSearchTerm("");
                        setFilterStatus("all");
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      <Filter className="h-5 w-5" />
                      Clear Filters
                    </button>
                  )}
                  <button
                    onClick={() => navigate("/analyze")}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Sparkles className="h-5 w-5" />
                    Start New Analysis
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal (outside blurred main content, always on top) */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="absolute inset-0 backdrop-blur-sm"
            onClick={handleDeleteCancel}
          ></div>
          <div
            className={`bg-white/95 rounded-2xl p-8 max-w-md mx-4 shadow-2xl relative z-10 ${showDeleteConfirm ? "animate-fade-in" : ""}`}
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Delete Analysis
              </h3>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Are you sure you want to delete this analysis? This action
                cannot be undone and all data will be permanently removed.
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={handleDeleteCancel}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors duration-200 font-semibold"
                  disabled={deletingId === showDeleteConfirm}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteConfirm(showDeleteConfirm)}
                  disabled={deletingId === showDeleteConfirm}
                  className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 font-semibold disabled:opacity-50 flex items-center gap-2"
                >
                  {deletingId === showDeleteConfirm ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
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

export default History;
