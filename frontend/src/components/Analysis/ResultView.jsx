import React from "react";
import {
  CheckCircle,
  AlertTriangle,
  Lightbulb,
  Eye,
  Zap,
  Target,
  Camera,
  Activity,
  Brain,
  Shield,
  ThumbsUp,
  ThumbsDown,
  TrendingUp,
  Award,
  Package,
  Star,
  Info,
  AlertCircle,
  RotateCcw,
  History,
  XCircle,
  Heart,
  Pill,
  Sparkles,
  Clock,
  FileImage,
  Beaker,
  ChevronsDown,
  Leaf,
  Hash,
  Calendar,
  Users,
  Trash2,
  Loader,
  ArrowLeft,
  Download,
  Share,
  FileText,
  AlertOctagon,
} from "lucide-react";

/**
 * **ALERT**: This component assumes flat `ingredients` array in result. If you use `ingredient_groups`,
 * add a mapping loop before rendering (see `AnalysisDetails` for working example).
 **/

// Visual helpers: align to AnalysisDetails conventions
const getSeverityColor = (severity) => {
  switch (severity) {
    case "low":
      return "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 border-l-4 border-l-blue-400";
    case "medium":
      return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 border-l-4 border-l-amber-400";
    case "high":
      return "bg-gradient-to-r from-red-50 to-orange-50 border-red-200 border-l-4 border-l-red-400";
    default:
      return "bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200 border-l-4 border-l-gray-400";
  }
};
const getSafetyLevelColor = (level) => {
  switch (level) {
    case "safe":
      return "text-emerald-600";
    case "caution":
      return "text-amber-600";
    case "danger":
      return "text-red-600";
    default:
      return "text-gray-600";
  }
};

// Empty/legacy state rendering, with tips as in AnalysisDetails
const renderLegacyAnalysisResult = (analysisText) => {
  if (!analysisText || typeof analysisText !== "string") {
    return (
      <div className="text-center py-8">
        <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
        <h4 className="text-xl font-semibold text-emerald-800 mb-2">
          Analysis Completed Successfully
        </h4>
        <p className="text-emerald-700">
          Your ingredient analysis has been processed.
        </p>
      </div>
    );
  }
  if (
    analysisText.toLowerCase().includes("no valid ingredients are detected")
  ) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-amber-500 mx-auto mb-6" />
        <h4 className="text-2xl font-semibold text-amber-800 mb-4">
          No Ingredients Detected
        </h4>
        <p className="text-amber-700 leading-relaxed mb-6 max-w-2xl mx-auto">
          {analysisText}
        </p>
        <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 max-w-2xl mx-auto">
          <h5 className="font-bold text-amber-800 mb-4 flex items-center justify-center">
            <Lightbulb className="h-5 w-5 mr-2" />
            Tips
          </h5>
          <ul className="text-sm text-amber-700 space-y-2">
            <li className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Ensure image shows clear ingredient text
            </li>
            <li className="flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Check product category matches image
            </li>
            <li className="flex items-center">
              <Zap className="h-4 w-4 mr-2" />
              Use better lighting or higher resolution
            </li>
            <li className="flex items-center">
              <Camera className="h-4 w-4 mr-2" />
              Avoid blur and cropping the text
            </li>
          </ul>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-200">
      <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <FileImage className="h-5 w-5 mr-2" />
        Analysis Results
      </h4>
      <div className="prose prose-sm max-w-none text-gray-700">
        {analysisText.split("\n").map((line, index) => (
          <p key={index} className="mb-2">
            {line}
          </p>
        ))}
      </div>
    </div>
  );
};

// Structured JSON result renderer—emulates AnalysisDetails section layout
const renderJsonAnalysisResult = (analysisResult) => {
  if (!analysisResult || typeof analysisResult === "string")
    return renderLegacyAnalysisResult(analysisResult);
  const {
    no_valid_ingredients,
    analysis_summary = {},
    ingredients = [],
    health_alerts = [],
    recommendation = {},
    alternatives = [],
    key_advice,
  } = analysisResult;

  // No ingredient case, same UX as AnalysisDetails
  if (no_valid_ingredients)
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
            {key_advice ||
              "Could not process the image clearly. Please try again with better lighting and ensure the ingredient list is visible."}
          </p>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
            <h5 className="font-bold text-amber-800 mb-4 flex items-center text-lg">
              <Lightbulb className="h-5 w-5 mr-3" />
              Tips
            </h5>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-700">
              <div className="flex items-start space-x-2">
                <Eye className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Ensure clear text</span>
              </div>
              <div className="flex items-start space-x-2">
                <Zap className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Use good lighting</span>
              </div>
              <div className="flex items-start space-x-2">
                <Target className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Verify category</span>
              </div>
              <div className="flex items-start space-x-2">
                <Camera className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <span>Higher resolution</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  const safetyScore = analysis_summary.safety_score || 0;
  const safetyLevel = analysis_summary.safety_level || "unknown";
  const concernCount = analysis_summary.concern_count ?? 0;
  const filteredHealthAlerts =
    health_alerts?.filter((a) => a.type !== "none") || [];

  return (
    <div className="space-y-8">
      {/* Summary Card: Safety Score, Concerns, Verdict */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Analysis Summary</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-600">
                  Safety Score
                </p>
                <p
                  className={`text-2xl font-bold ${getSafetyLevelColor(safetyLevel)}`}
                >
                  {safetyScore}%
                </p>
              </div>
              <Shield className="h-8 w-8 text-emerald-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-600">Concerns</p>
                <p className="text-2xl font-bold text-amber-700">
                  {concernCount}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Verdict</p>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-bold text-blue-700 capitalize">
                    {recommendation.verdict || "N/A"}
                  </p>
                  {recommendation.verdict === "recommend" ? (
                    <ThumbsUp className="h-6 w-6 text-blue-500" />
                  ) : (
                    <ThumbsDown className="h-6 w-6 text-blue-500" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {analysis_summary.main_verdict && (
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6 border border-gray-200 mb-4">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-amber-500 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-gray-800 mb-2">
                  Main Verdict
                </h4>
                <p className="text-gray-700 leading-relaxed">
                  {analysis_summary.main_verdict}
                </p>
              </div>
            </div>
          </div>
        )}
        {analysis_summary.detailed_explanation && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <div className="flex items-start gap-3">
              <FileText className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h4 className="font-bold text-lg text-blue-800 mb-2">
                  Detailed Explanation
                </h4>
                <p className="text-blue-700 leading-relaxed">
                  {analysis_summary.detailed_explanation}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Ingredients Analysis (flat list, not grouped like AnalysisDetails) */}
      {ingredients.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
              <Beaker className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Ingredient Analysis
            </h3>
          </div>
          <div className="space-y-4">
            {ingredients.map((ingredient, i) => {
              const { bg, text, badge, icon } = {
                safe: {
                  bg: "bg-emerald-50 border-emerald-200",
                  text: "text-emerald-800",
                  badge: "bg-emerald-100 text-emerald-700 border-emerald-300",
                  icon: <CheckCircle className="h-4 w-4 text-emerald-600" />,
                },
                caution: {
                  bg: "bg-amber-50 border-amber-200",
                  text: "text-amber-800",
                  badge: "bg-amber-100 text-amber-700 border-amber-300",
                  icon: <AlertTriangle className="h-4 w-4 text-amber-600" />,
                },
                danger: {
                  bg: "bg-red-50 border-red-200",
                  text: "text-red-800",
                  badge: "bg-red-100 text-red-700 border-red-300",
                  icon: <XCircle className="h-4 w-4 text-red-600" />,
                },
              }[ingredient.status] || {
                bg: "bg-gray-50 border-gray-200",
                text: "text-gray-800",
                badge: "bg-gray-100 text-gray-700 border-gray-300",
                icon: <Info className="h-4 w-4 text-gray-600" />,
              };
              return (
                <div
                  key={i}
                  className={`p-6 ${bg} border-l-4 ${bg.includes("emerald") ? "border-l-emerald-400" : bg.includes("amber") ? "border-l-amber-400" : bg.includes("red") ? "border-l-red-400" : "border-l-gray-400"}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      {icon}
                      <h5 className={`font-bold text-lg ${text}`}>
                        {ingredient.name}
                      </h5>
                    </div>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full border ${badge}`}
                    >
                      {(ingredient.status || "unknown").toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className={`text-sm font-semibold ${text} mb-1`}>
                        Purpose:
                      </p>
                      <p className={`text-sm ${text} opacity-90`}>
                        {ingredient.purpose || "Not specified"}
                      </p>
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${text} mb-1`}>
                        Concern Level:
                      </p>
                      <p className={`text-sm ${text} opacity-90 capitalize`}>
                        {ingredient.concern_level || "Not specified"}
                      </p>
                    </div>
                  </div>
                  <div className="mb-3">
                    <p className={`text-sm font-semibold ${text} mb-1`}>
                      Summary:
                    </p>
                    <p className={`text-sm ${text} opacity-90 leading-relaxed`}>
                      {ingredient.quick_summary || "No summary available"}
                    </p>
                  </div>
                  {ingredient.why_flagged && (
                    <div className="bg-white/50 rounded-lg p-3 border border-white/30">
                      <div className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-amber-800 mb-1">
                            Why Flagged:
                          </p>
                          <p className="text-xs text-amber-700">
                            {ingredient.why_flagged}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  {ingredient.user_specific_risk && (
                    <div className="bg-red-100/50 rounded-lg p-3 border border-red-200/50 mt-3">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="h-4 w-4 text-red-600" />
                        <p className="text-xs font-semibold text-red-800">
                          User-Specific Risk Identified
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Health Alerts */}
      {filteredHealthAlerts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
              <AlertOctagon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Health Alerts</h3>
          </div>
          <div className="space-y-4">
            {filteredHealthAlerts.map((alert, index) => {
              const severityInfo = getSeverityColor(alert.severity);
              return (
                <div key={index} className={`${severityInfo} rounded-2xl p-6`}>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 flex items-center justify-center">
                      <AlertTriangle className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-lg text-gray-800">
                          {alert.title || "Health Alert"}
                        </h4>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border border-red-200 text-red-700 bg-red-100`}
                        >
                          {(alert.severity || "unknown").toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {alert.description || alert.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Alternatives */}
      {alternatives.length > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              Recommended Alternatives
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {alternatives.map((alt, i) => (
              <div
                key={i}
                className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-800 mb-2">
                      {alt.name}
                    </h4>
                    <p className="text-sm text-green-700 mb-2 leading-relaxed">
                      {alt.why}
                    </p>
                    {alt.benefit && (
                      <div className="bg-white/50 rounded-lg p-2 border border-green-200/50">
                        <p className="text-xs font-semibold text-green-800 mb-1">
                          Benefit
                        </p>
                        <p className="text-xs text-green-700">{alt.benefit}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Key Advice */}
      {key_advice && (
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">Expert Advice</h3>
          </div>
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-6 w-6 text-indigo-500 mt-1" />
              <p className="text-indigo-700 leading-relaxed">{key_advice}</p>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Metadata */}
      <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8">
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
              {(recommendation.confidence || "low").toUpperCase()}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span className="font-semibold text-gray-700">Safe to Try</span>
            </div>
            <p className="text-lg font-bold text-gray-800">
              {recommendation.safe_to_try ? "Yes" : "No"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to safely retrieve properties from nested result
const getResultProperty = (result, property, fallback = "") =>
  result?.[property] || fallback;

// Decide which renderer to use
const renderAnalysisResult = (result) => {
  const analysisResult = result?.result;
  if (typeof analysisResult === "object" && analysisResult !== null) {
    return renderJsonAnalysisResult(analysisResult);
  } else {
    return renderLegacyAnalysisResult(analysisResult);
  }
};

// **** MAIN COMPONENT ****
const ResultView = ({ result, startNewAnalysis, navigateToHistory }) => {
  // TODO: If you want PDF export, share, delete, image view, use this pattern:
  // const navigate = useNavigate();
  // const [pdfBlob, setPdfBlob] = useState(null);
  // const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // const [deleting, setDeleting] = useState(false);
  // const handleDownload = () => { /* see AnalysisDetails for PDF generation */ };
  // const handleShare = async () => { /* see AnalysisDetails for Web Share API */ };
  // Then, add UI controls as in AnalysisDetails header

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="p-8">
        {/* Header: Analysis Report */}
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
                {new Date(
                  getResultProperty(result, "timestamp"),
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
              <span className="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-lg">
                <Package className="h-4 w-4 mr-2" />
                {getResultProperty(result, "category")}
              </span>
            </div>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={startNewAnalysis}
              className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 rounded-xl transition-all duration-200 font-medium shadow-lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              New Analysis
            </button>
            <button
              onClick={navigateToHistory}
              className="flex items-center px-6 py-3 bg-white text-gray-700 hover:bg-gray-50 rounded-xl transition-all duration-200 font-medium border-2 border-gray-200"
            >
              <History className="h-5 w-5 mr-2" />
              View History
            </button>
            {/* TODO: Add Download and Share buttons here as in AnalysisDetails if you want PDF features */}
          </div>
        </div>

        {/* Render the analysis content */}
        <div className="space-y-8">{renderAnalysisResult(result)}</div>
      </div>
    </div>
  );
};

export default ResultView;
