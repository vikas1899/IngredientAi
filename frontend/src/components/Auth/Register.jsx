import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  Eye,
  EyeOff,
  Camera,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UserPlus,
  Mail,
  Lock,
  User,
} from "lucide-react";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    repeat_password: "",
    first_name: "",
    last_name: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [focusedField, setFocusedField] = useState("");

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
    // Clear general error too
    if (errors.general) {
      setErrors((prev) => ({
        ...prev,
        general: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email format is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.repeat_password) {
      newErrors.repeat_password = "Please confirm your password";
    } else if (formData.password !== formData.repeat_password) {
      newErrors.repeat_password = "Passwords do not match";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const result = await register(formData);
      if (result.success) {
        navigate("/dashboard");
      } else {
        if (typeof result.error === "object") {
          setErrors(result.error);
        } else {
          setErrors({
            general: result.error || "Registration failed. Please try again.",
          });
        }
      }
    } catch {
      setErrors({ general: "An unexpected error occurred. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const getFieldIcon = (fieldName) => {
    switch (fieldName) {
      case "first_name":
      case "last_name":
        return <User className="h-4 w-4 text-gray-400" />;
      case "username":
        return <UserPlus className="h-4 w-4 text-gray-400" />;
      case "email":
        return <Mail className="h-4 w-4 text-gray-400" />;
      case "password":
      case "repeat_password":
        return <Lock className="h-4 w-4 text-gray-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-100 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-purple-400/20 to-pink-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-indigo-400/20 to-cyan-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative flex items-center justify-center min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-18 w-18 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300 relative">
              <Camera className="h-9 w-9 text-white" />
              <Sparkles className="h-4 w-4 text-purple-200 absolute top-2 right-2" />
            </div>
            <h2 className="mt-6 text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
              Create your account
            </h2>
            <p className="mt-2 text-base text-gray-600 font-medium">
              Join IngredientAI to start analyzing ingredients
            </p>
          </div>

          {/* Registration Form */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 relative">
            <div className="p-8">
              {/* General Error */}
              {errors.general && (
                <div className="bg-red-50/90 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 flex items-center relative z-10">
                  <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="text-sm font-medium">{errors.general}</span>
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* First Name and Last Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label
                      htmlFor="first_name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      First Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {getFieldIcon("first_name")}
                      </div>
                      <input
                        id="first_name"
                        name="first_name"
                        type="text"
                        required
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.first_name
                            ? "border-red-300 ring-red-500 bg-red-50/50"
                            : focusedField === "first_name"
                              ? "ring-purple-500 border-purple-300 bg-white shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                        placeholder="First name"
                        value={formData.first_name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("first_name")}
                        onBlur={() => setFocusedField("")}
                      />
                    </div>
                    {errors.first_name && (
                      <p className="text-xs text-red-600">
                        {errors.first_name}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="last_name"
                      className="block text-sm font-semibold text-gray-700"
                    >
                      Last Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        {getFieldIcon("last_name")}
                      </div>
                      <input
                        id="last_name"
                        name="last_name"
                        type="text"
                        required
                        className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.last_name
                            ? "border-red-300 ring-red-500 bg-red-50/50"
                            : focusedField === "last_name"
                              ? "ring-purple-500 border-purple-300 bg-white shadow-lg"
                              : "border-gray-200 hover:border-gray-300"
                        }`}
                        placeholder="Last name"
                        value={formData.last_name}
                        onChange={handleChange}
                        onFocus={() => setFocusedField("last_name")}
                        onBlur={() => setFocusedField("")}
                      />
                    </div>
                    {errors.last_name && (
                      <p className="text-xs text-red-600">{errors.last_name}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label
                    htmlFor="username"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("username")}
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.username
                          ? "border-red-300 ring-red-500 bg-red-50/50"
                          : focusedField === "username"
                            ? "ring-purple-500 border-purple-300 bg-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField("")}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-600">{errors.username}</p>
                  )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("email")}
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      className={`w-full pl-10 pr-4 py-3 bg-gray-50/50 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.email
                          ? "border-red-300 ring-red-500 bg-red-50/50"
                          : focusedField === "email"
                            ? "ring-purple-500 border-purple-300 bg-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("email")}
                      onBlur={() => setFocusedField("")}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("password")}
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50/50 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.password
                          ? "border-red-300 ring-red-500 bg-red-50/50"
                          : focusedField === "password"
                            ? "ring-purple-500 border-purple-300 bg-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField("")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <label
                    htmlFor="repeat_password"
                    className="block text-sm font-semibold text-gray-700"
                  >
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {getFieldIcon("repeat_password")}
                    </div>
                    <input
                      id="repeat_password"
                      name="repeat_password"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      className={`w-full pl-10 pr-12 py-3 bg-gray-50/50 border rounded-xl text-gray-900 placeholder-gray-500 transition-all duration-300 focus:outline-none focus:ring-2 focus:border-transparent ${
                        errors.repeat_password
                          ? "border-red-300 ring-red-500 bg-red-50/50"
                          : focusedField === "repeat_password"
                            ? "ring-purple-500 border-purple-300 bg-white shadow-lg"
                            : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Confirm your password"
                      value={formData.repeat_password}
                      onChange={handleChange}
                      onFocus={() => setFocusedField("repeat_password")}
                      onBlur={() => setFocusedField("")}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.repeat_password && (
                    <p className="text-xs text-red-600">
                      {errors.repeat_password}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:shadow-none"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white mr-3"></div>
                        <span>Creating account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <span>Create account</span>
                        <ArrowRight className="ml-2 h-5 w-5 transform group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    )}
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-purple-600 hover:text-purple-500 transition-colors duration-200 hover:underline"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-500 bg-white/60 backdrop-blur-sm rounded-full px-6 py-2 inline-block border border-gray-200/50">
              🛡️ By creating an account, you agree to our Terms of Service
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
