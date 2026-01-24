import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../services/apiService";
import {
  Camera,
  History,
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Plus,
  Activity,
} from "lucide-react";
import Navbar from "../Navbar";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recentAnalyses, setRecentAnalyses] = useState([]);
  const [hasMedicalHistory, setHasMedicalHistory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAnalyses: 0,
    recentAnalyses: 0,
    riskWarnings: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const parseAnalysisResult = useCallback((result) => {
    if (!result) return { status: "safe" };
    if (typeof result === "string") {
      try {
        const parsed = JSON.parse(result);
        return parseAnalysisResult(parsed);
      } catch {
        const lower = result.toLowerCase();
        if (
          lower.includes("avoid") ||
          lower.includes("danger") ||
          lower.includes("not recommended")
        ) {
          return { status: "danger" };
        }
        if (lower.includes("caution") || lower.includes("moderate")) {
          return { status: "caution" };
        }
        return { status: "safe" };
      }
    }
    if (typeof result === "object") {
      const verdict = result.recommendation?.verdict;
      if (verdict === "avoid") return { status: "danger" };
      if (verdict === "caution") return { status: "caution" };
      return { status: "safe" };
    }
    return { status: "safe" };
  }, []);

  const loadDashboardData = useCallback(async () => {
    try {
      const medicalCheck = await apiService.checkMedicalHistory();
      if (medicalCheck.success)
        setHasMedicalHistory(medicalCheck.data.has_medical_history);

      const historyResponse = await apiService.getAnalysisHistory(1);
      if (historyResponse.success) {
        const analyses = historyResponse.data.results || [];
        setRecentAnalyses(analyses.slice(0, 5));

        // Calculate total analyses
        const totalAnalyses = historyResponse.data.count || 0;

        // Calculate recent analyses within last 1 day
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 1);
        const recentAnalysesCount = analyses.filter(
          (a) => new Date(a.timestamp) >= sevenDaysAgo,
        ).length;

        // Calculate risk warnings based on parsed status
        const riskWarningsCount = analyses.filter((a) => {
          const { status } = parseAnalysisResult(a.result);
          return status === "danger" || status === "caution";
        }).length;

        setStats({
          totalAnalyses,
          recentAnalyses: recentAnalysesCount,
          riskWarnings: riskWarningsCount,
        });
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [parseAnalysisResult]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600/20 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">
              Loading your dashboard...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8 text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center mr-4">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Welcome back, {user?.first_name || user?.username}!
                </h1>
                <p className="text-gray-600 font-medium">
                  Analyze ingredients and stay informed about your dietary needs
                </p>
              </div>
            </div>
          </div>

          {/* Medical History Warning */}
          {!hasMedicalHistory && (
            <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">
                    Complete Your Profile
                  </h3>
                  <p className="text-amber-700 mb-4">
                    Add your medical history and allergies to get personalized
                    ingredient analysis and better safety recommendations.
                  </p>
                  <button
                    onClick={() => navigate("/medical-history")}
                    className="inline-flex items-center px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors duration-200"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medical Information
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Total Analyses
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.totalAnalyses}
                  </p>
                  {stats.totalAnalyses > 0 && (
                    <p className="text-sm text-green-600 font-medium mt-1">
                      All time
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Recent Activity
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.recentAnalyses}
                  </p>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    Recent items
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
                  <History className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
                    Risk Warnings
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stats.riskWarnings}
                  </p>
                  <p className="text-sm text-amber-600 font-medium mt-1">
                    {stats.riskWarnings > 0 ? "Needs attention" : "All clear"}
                  </p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            {/* Quick Actions - Takes 2 columns on xl screens */}
            <div className="xl:col-span-2">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                  <h3 className="text-xl font-bold text-white flex items-center">
                    <Sparkles className="h-5 w-5 mr-2" />
                    Quick Actions
                  </h3>
                  <p className="text-blue-100 mt-1">
                    Get started with these common tasks
                  </p>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => navigate("/analyze")}
                      className="group bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                          <Camera className="h-6 w-6 text-white" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-blue-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Analyze New Image
                      </h4>
                      <p className="text-sm text-gray-600">
                        Upload and analyze ingredient lists with AI-powered
                        detection
                      </p>
                    </button>

                    <button
                      onClick={() => navigate("/history")}
                      className="group bg-gradient-to-br from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border-2 border-gray-200 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
                          <History className="h-6 w-6 text-white" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        View History
                      </h4>
                      <p className="text-sm text-gray-600">
                        Browse and review all your past ingredient analyses
                      </p>
                    </button>

                    <button
                      onClick={() => navigate("/medical-history")}
                      className="group bg-gradient-to-br from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 border-2 border-red-200 rounded-xl p-6 transition-all duration-300 transform hover:scale-105 hover:shadow-lg md:col-span-2"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
                          <Heart className="h-6 w-6 text-white" />
                        </div>
                        <ArrowRight className="h-5 w-5 text-red-600 group-hover:translate-x-1 transition-transform" />
                      </div>
                      <h4 className="font-bold text-gray-900 text-lg mb-2">
                        Medical Information
                      </h4>
                      <p className="text-sm text-gray-600">
                        Manage your allergies, conditions, and dietary
                        restrictions for personalized analysis
                      </p>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Analyses - Takes 1 column on xl screens */}
            <div className="xl:col-span-1">
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden h-full">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">
                      Recent Analyses
                    </h3>
                    <button
                      onClick={() => navigate("/history")}
                      className="text-sm text-purple-100 hover:text-white font-medium underline hover:no-underline transition-colors"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {recentAnalyses.length > 0 ? (
                    <div className="space-y-4">
                      {recentAnalyses.map((analysis) => (
                        <div
                          key={analysis.id}
                          className="bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 rounded-xl p-4 cursor-pointer transition-all duration-200 transform hover:scale-105 border border-gray-200"
                          onClick={() => navigate(`/history/${analysis.id}`)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-3">
                                <Camera className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900 capitalize">
                                  {analysis.category}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDate(analysis.timestamp)}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center">
                              {analysis.result &&
                              analysis.result
                                .toLowerCase()
                                .includes("warning") ? (
                                <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                                </div>
                              ) : (
                                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Camera className="h-8 w-8 text-gray-400" />
                      </div>
                      <p className="text-gray-500 mb-4 font-medium">
                        No analyses yet
                      </p>
                      <button
                        onClick={() => navigate("/analyze")}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Start your first analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Tips Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Tips for Better Analysis
              </h3>
              <p className="text-green-100 mt-1">
                Follow these guidelines to get the most accurate results
              </p>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Clear Images
                    </p>
                    <p className="text-gray-600">
                      Ensure ingredient lists are clearly visible and well-lit
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Complete Medical History
                    </p>
                    <p className="text-gray-600">
                      Keep your allergies and medical conditions updated
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <Activity className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Regular Checks
                    </p>
                    <p className="text-gray-600">
                      Regularly analyze products you consume frequently
                    </p>
                  </div>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                    <AlertTriangle className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg mb-2">
                      Review Results
                    </p>
                    <p className="text-gray-600">
                      Always review analysis results and consult professionals
                      when needed
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
