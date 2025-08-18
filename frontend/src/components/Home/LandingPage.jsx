import React, { useState, useEffect } from "react";
import {
  Camera,
  Shield,
  Heart,
  Brain,
  AlertTriangle,
  CheckCircle,
  Upload,
  Scan,
  BarChart3,
} from "lucide-react";

const LandingPage = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [activeStep, setActiveStep] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 4);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(stepInterval);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const features = [
    {
      icon: <Camera className="h-8 w-8" />,
      title: "Smart OCR Analysis",
      description:
        "Advanced AI-powered OCR reads ingredient lists from any photo with 99.9% accuracy, even in poor lighting conditions",
      color: "from-blue-500 to-cyan-500",
      gradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
    },
    {
      icon: <Heart className="h-8 w-8" />,
      title: "Personalized Health Insights",
      description:
        "Deep analysis based on your complete medical history, allergies, dietary preferences, and genetic predispositions",
      color: "from-rose-500 to-pink-500",
      gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
    },
    {
      icon: <AlertTriangle className="h-8 w-8" />,
      title: "Instant Risk Assessment",
      description:
        "Real-time warnings about potentially harmful ingredients with severity scoring and alternative suggestions",
      color: "from-amber-500 to-orange-500",
      gradient: "bg-gradient-to-br from-amber-50 to-orange-50",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI Health Advisor",
      description:
        "Personalized recommendations and health impact predictions based on your unique biological profile",
      color: "from-emerald-500 to-teal-500",
      gradient: "bg-gradient-to-br from-emerald-50 to-teal-50",
    },
  ];

  const steps = [
    {
      icon: <Upload className="h-12 w-12" />,
      title: "Upload Image",
      description: "Take a photo or upload an image of any ingredient list",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: <Scan className="h-12 w-12" />,
      title: "AI Analysis",
      description:
        "Our OCR extracts text and LLM analyzes ingredients against your health profile",
      color: "from-purple-500 to-pink-500",
    },
    {
      icon: <BarChart3 className="h-12 w-12" />,
      title: "Get Results",
      description:
        "Receive detailed analysis with personalized health effects and recommendations",
      color: "from-emerald-500 to-teal-500",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-gradient-to-br from-pink-500/10 to-orange-500/10 blur-3xl animate-pulse"></div>

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>

        {/* Dynamic cursor glow */}
        <div
          className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-blue-400/10 to-purple-400/10 blur-3xl pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        ></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header
          className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
            isScrolled
              ? "bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50"
              : "bg-transparent"
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-4">
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"></div>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                  IngredientAI
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <a
                  href="/login"
                  className="px-4 py-2 text-slate-300 hover:text-white font-medium transition-all duration-200 hover:bg-slate-800/50 rounded-lg"
                >
                  Sign In
                </a>
                <a
                  href="/register"
                  className="px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full font-medium hover:shadow-lg hover:shadow-blue-500/25 hover:scale-105 transition-all duration-200 border border-blue-400/20"
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto text-center">
            <div className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-xl px-4 py-2 rounded-full text-blue-400 text-sm font-medium mb-8 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span>AI-Powered OCR + LLM Analysis</span>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
            </div>

            <h1 className="text-6xl md:text-8xl font-bold text-white mb-8 leading-tight">
              Decode Every
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent animate-pulse">
                Ingredient
              </span>
            </h1>

            <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Snap a photo of any ingredient list and get instant AI analysis
              tailored to your medical history, allergies, and health goals.
              Powered by advanced OCR and LLM technology.
            </p>

            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <a
                href="/register"
                className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-semibold hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border border-blue-400/20"
              >
                <Camera className="w-5 h-5 group-hover:animate-bounce" />
                <span>Analyze Now - Free</span>
                <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </a>
              <button className="group px-8 py-4 bg-slate-800/50 backdrop-blur text-slate-300 rounded-full text-lg font-semibold border border-slate-600/50 hover:bg-slate-700/50 hover:border-slate-500/50 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2">
                <div className="w-5 h-5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Interactive Demo */}
            <div className="relative max-w-5xl mx-auto">
              <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-500">
                <div className="bg-slate-900/80 rounded-2xl p-6 shadow-inner border border-slate-700/30">
                  <div className="flex items-center space-x-2 mb-6">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse delay-100"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse delay-200"></div>
                    </div>
                    <span className="text-slate-400 text-sm ml-4">
                      IngredientAI Analysis Dashboard
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {/* OCR Results */}
                    <div className="space-y-3">
                      <h3 className="text-emerald-400 font-semibold mb-3 flex items-center space-x-2">
                        <Scan className="w-4 h-4" />
                        <span>OCR Extracted Text</span>
                      </h3>

                      <div className="bg-gray-900 text-sm  rounded-xl font-mono overflow-x-auto leading-relaxed shadow-lg">
                        <pre className="text-gray-100">
                          <span className="text-emerald-400 ">{"{                                                    "}</span>
                          {"\n"}  <span className="text-yellow-300">"Sodium Benzoate"</span>: <span className="text-pink-400">"0.02%"</span>,                                      
                          {"                  \n"}  <span className="text-yellow-300">"High Fructose Corn Syrup"</span>: <span className="text-pink-400">"15g"</span>,
                          {"            \n"}  <span className="text-yellow-300">"Artificial Food Coloring (Yellow 5)"</span>: <span className="text-pink-400">"5mg"</span>,
                          {" \n"}  <span className="text-yellow-300">"Monosodium Glutamate (MSG)"</span>: <span className="text-pink-400">"1g"</span>,
                          {"           \n"}  <span className="text-yellow-300">"Partially Hydrogenated Oils"</span>: <span className="text-pink-400">"3g"</span>
                          {"           \n"}<span className="text-emerald-400">{"}                                                   "}</span>
                        </pre>
                      </div>
                    </div>


                    {/* Analysis Results */}
                    <div className="space-y-3">
                      <h3 className="text-purple-400 font-semibold mb-3 flex items-center space-x-2">
                        <Brain className="w-4 h-4" />
                        <span>AI Health Analysis</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                          <span className="text-red-400 text-sm">
                            High Risk: Shellfish allergen detected
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                          <AlertTriangle className="w-4 h-4 text-yellow-400" />
                          <span className="text-yellow-400 text-sm">
                            Moderate: High sodium content
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 p-2 bg-green-500/10 border border-green-500/20 rounded-lg">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 text-sm">
                            Safe: No diabetes conflicts
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating elements */}
              
              <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-gradient-to-br from-pink-500 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-2xl animate-pulse">
                <Heart className="w-6 h-6" />
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">
                How It Works
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Three simple steps to get personalized ingredient analysis
                powered by cutting-edge AI
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className={`relative p-8 rounded-3xl transition-all duration-700 cursor-pointer ${
                    activeStep === index
                      ? "bg-slate-800/80 backdrop-blur-xl shadow-2xl scale-105 border border-slate-600/50"
                      : "bg-slate-800/40 backdrop-blur-lg hover:bg-slate-800/60 hover:scale-102"
                  }`}
                >
                  {/* Step number */}
                  <div className="absolute -top-4 left-8 w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm border-2 border-slate-950">
                    {index + 1}
                  </div>

                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white mb-6 mx-auto group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {step.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4 text-center">
                    {step.title}
                  </h3>

                  <p className="text-slate-300 leading-relaxed text-center">
                    {step.description}
                  </p>

                  {/* Progress indicator */}
                  {activeStep === index && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-b-3xl animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>

            {/* Process visualization */}
            <div className="flex justify-center items-center space-x-4 mb-8">
              {steps.map((_, index) => (
                <React.Fragment key={index}>
                  <div
                    className={`w-4 h-4 rounded-full transition-all duration-300 ${
                      activeStep >= index
                        ? "bg-gradient-to-r from-blue-500 to-purple-600"
                        : "bg-slate-700"
                    }`}
                  ></div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 w-16 transition-all duration-300 ${
                        activeStep > index
                          ? "bg-gradient-to-r from-blue-500 to-purple-600"
                          : "bg-slate-700"
                      }`}
                    ></div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Features Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">
                Advanced AI Technology
              </h2>
              <p className="text-xl text-slate-300 max-w-3xl mx-auto">
                Cutting-edge features designed to protect your health with
                precision and intelligence
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className={`group p-8 rounded-3xl transition-all duration-700 cursor-pointer border ${
                    activeFeature === index
                      ? "bg-slate-800/80 backdrop-blur-xl shadow-2xl scale-105 border-slate-600/50"
                      : "bg-slate-800/40 backdrop-blur-lg hover:bg-slate-800/60 hover:shadow-xl hover:scale-102 border-slate-700/30"
                  }`}
                  onMouseEnter={() => setActiveFeature(index)}
                >
                  <div
                    className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${feature.color} flex items-center justify-center text-white mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}
                  >
                    {feature.icon}
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>

                  <p className="text-slate-300 leading-relaxed">
                    {feature.description}
                  </p>

                  {/* Active indicator */}
                  {activeFeature === index && (
                    <div className="mt-6 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Stats Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900/50 backdrop-blur-xl">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  number: "99.9%",
                  label: "OCR Accuracy",
                  icon: "🎯",
                  color: "from-blue-500 to-cyan-500",
                },
                {
                  number: "100K+",
                  label: "Lives Protected",
                  icon: "🛡️",
                  color: "from-emerald-500 to-teal-500",
                },
                {
                  number: "0.08s",
                  label: "Analysis Speed",
                  icon: "⚡",
                  color: "from-yellow-500 to-orange-500",
                },
                {
                  number: "500+",
                  label: "Health Conditions",
                  icon: "❤️",
                  color: "from-pink-500 to-rose-500",
                },
              ].map((stat, index) => (
                <div
                  key={index}
                  className="text-center group hover:scale-110 transition-all duration-300"
                >
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-2xl mb-4 mx-auto shadow-lg group-hover:shadow-xl`}
                  >
                    {stat.icon}
                  </div>
                  <div
                    className={`text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2`}
                  >
                    {stat.number}
                  </div>
                  <div className="text-slate-300 font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Enhanced Testimonials */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-white mb-6">
                Real Stories, Real Impact
              </h2>
              <p className="text-xl text-slate-300 max-w-2xl mx-auto">
                Discover how IngredientAI is transforming lives through
                intelligent ingredient analysis
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  quote:
                    "The OCR accuracy is mind-blowing. It caught a hidden shellfish extract that could have been life-threatening!",
                  author: "Sarah M.",
                  role: "Severe Allergy Management",
                  rating: 5,
                  avatar: "🦐",
                  condition: "Shellfish Allergy",
                },
                {
                  quote:
                    "Finally, an app that understands my diabetes. It flags hidden sugars and carbs I never knew existed.",
                  author: "Michael R.",
                  role: "Type 2 Diabetes",
                  rating: 5,
                  avatar: "🍬",
                  condition: "Diabetes Management",
                },
                {
                  quote:
                    "As a nutritionist, I recommend this to all my clients. The LLM analysis is incredibly detailed and accurate.",
                  author: "Dr. Emily L.",
                  role: "Clinical Nutritionist",
                  rating: 5,
                  avatar: "👩‍⚕️",
                  condition: "Professional Use",
                },
              ].map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-slate-800/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-slate-700/30 group"
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-xl mr-4 group-hover:scale-110 transition-transform duration-300">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <div className="flex mb-1">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <span key={i} className="text-yellow-400 text-lg">
                            ⭐
                          </span>
                        ))}
                      </div>
                      <div className="text-xs text-emerald-400 font-medium">
                        {testimonial.condition}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-300 mb-4 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div>
                    <div className="font-semibold text-white">
                      {testimonial.author}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive CTA Section */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-emerald-600/20 backdrop-blur-sm"></div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <div className="bg-slate-800/80 backdrop-blur-xl rounded-3xl p-12 shadow-2xl border border-slate-700/50">
              <h2 className="text-5xl font-bold text-white mb-6">
                Transform Your Health Journey
              </h2>
              <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                Join over 100,000 users who trust IngredientAI's advanced OCR
                and LLM technology to make informed decisions about their health
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
                <a
                  href="/register"
                  className="group px-10 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-lg font-bold hover:shadow-2xl hover:shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center space-x-3 border border-blue-400/30"
                >
                  <Camera className="w-6 h-6 group-hover:animate-bounce" />
                  <span>Start Free Analysis</span>
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </a>

                <div className="flex items-center space-x-2 text-slate-400 text-sm">
                  <Shield className="w-4 h-4" />
                  <span>No credit card required</span>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="flex justify-center items-center space-x-8 text-slate-400 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>HIPAA Compliant</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span>FDA Guidelines</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Enterprise Security</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Footer */}
        <footer className="bg-slate-950/90 backdrop-blur-xl text-white py-16 px-4 sm:px-6 lg:px-8 border-t border-slate-800/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-2xl shadow-lg">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-emerald-400 bg-clip-text text-transparent">
                    IngredientAI
                  </span>
                </div>
                <div className="space-y-2 text-slate-400 text-sm">
                  <div>© 2025 IngredientAI. All rights reserved.</div>
                  <div>Privacy Policy | Terms of Service | Contact Us</div>
                </div>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Product</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>
                    <a href="/features" className="hover:text-white">
                      Features
                    </a>
                  </li>
                  <li>
                    <a href="/pricing" className="hover:text-white">
                      Pricing
                    </a>
                  </li>
                  <li>
                    <a href="/demo" className="hover:text-white">
                      Demo
                    </a>
                  </li>
                  <li>
                    <a href="/register" className="hover:text-white">
                      Get Started
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Company</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>
                    <a href="/about" className="hover:text-white">
                      About Us
                    </a>
                  </li>
                  <li>
                    <a href="/blog" className="hover:text-white">
                      Blog
                    </a>
                  </li>
                  <li>
                    <a href="/careers" className="hover:text-white">
                      Careers
                    </a>
                  </li>
                  <li>
                    <a href="/contact" className="hover:text-white">
                      Contact
                    </a>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4">Support</h4>
                <ul className="space-y-2 text-slate-400 text-sm">
                  <li>
                    <a href="/help" className="hover:text-white">
                      Help Center
                    </a>
                  </li>
                  <li>
                    <a href="/terms" className="hover:text-white">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="/privacy" className="hover:text-white">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="/status" className="hover:text-white">
                      Status
                    </a>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center text-slate-400 text-sm">
              Made with ❤️ by Vikas Jaygude
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
