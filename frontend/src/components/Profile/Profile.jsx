import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  User,
  Save,
  AlertCircle,
  CheckCircle,
  Mail,
  UserCheck,
  Calendar,
  Shield,
  Trash2,
  Edit3,
  Camera,
  Upload,
} from "lucide-react";
import Navbar from "../Navbar";
import { apiService } from "../../services/apiService";

const Profile = () => {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [errors, setErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [busyDelete, setBusyDelete] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [avatarPreview, _setAvatarPreview] = useState(null);

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        email: user.email || "",
        first_name: user.first_name || "",
        last_name: user.last_name || "",
      });
      // Set avatar preview if user has an avatar URL
    }
  }, [user]);

  // Check if form has changes
  const hasChanges = useMemo(() => {
    return (
      formData.username !== (user?.username || "") ||
      formData.email !== (user?.email || "") ||
      formData.first_name !== (user?.first_name || "") ||
      formData.last_name !== (user?.last_name || "")
    );
  }, [formData, user]);

  // Warn on unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditing && hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isEditing, hasChanges]);

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

    // Clear general messages
    if (error) setError("");
    if (success) setSuccess("");
  };

  const getAvatarInitials = () => {
    const firstName = formData.first_name || user?.first_name || "";
    const lastName = formData.last_name || user?.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = "First name must be at least 2 characters";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = "Last name must be at least 2 characters";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setError("");
    setSuccess("");

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      // Create FormData for file upload if avatar is selected
      let submitData = formData;

      const result = await updateProfile(submitData);
      if (result.success) {
        setSuccess("Profile updated successfully!");
        setIsEditing(false);
        setTimeout(() => setSuccess(""), 5000);
      } else {
        if (typeof result.error === "object") {
          setErrors(result.error);
        } else {
          setError(result.error || "Failed to update profile");
        }
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      username: user?.username || "",
      email: user?.email || "",
      first_name: user?.first_name || "",
      last_name: user?.last_name || "",
    });
    setErrors({});
    setError("");
    setSuccess("");
  };

  const handleDeleteAccount = async () => {
    if (busyDelete) return;

    setBusyDelete(true);
    try {
      const result = await apiService.deleteAccount();

      if (result.success) {
        // Call logout to clear auth context
        logout();

        // Redirect to login with success message
        navigate("/login", {
          replace: true,
          state: { message: "Your account has been successfully deleted." },
        });
      } else {
        setError(result.error || "Failed to delete account");
        setShowDeleteConfirm(false);
      }
    } catch {
      setError("An unexpected error occurred while deleting your account");
      setShowDeleteConfirm(false);
    } finally {
      setBusyDelete(false);
    }
  };

  return (
    <>
      <Navbar />

      {/* Delete Confirmation Modal with Backdrop Blur */}
      {showDeleteConfirm && (
        <DeleteConfirmationModal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDeleteAccount}
          loading={busyDelete}
        />
      )}

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full mb-6 shadow-lg">
              <User className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Profile Settings
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Manage your personal information and account preferences
            </p>
          </div>

          {/* Enhanced Messages */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl shadow-sm">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-xl shadow-sm animate-fade-in">
              <div className="flex items-start">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-green-800">
                    Success
                  </h3>
                  <p className="text-sm text-green-700 mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Profile Overview Card */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-8 text-center">
                  {/* Avatar Section */}
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Profile Avatar"
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-white bg-opacity-20 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                        <span className="text-2xl font-bold">
                          {getAvatarInitials() || (
                            <User className="h-12 w-12" />
                          )}
                        </span>
                      </div>
                    )}

                    {/* Camera overlay when editing */}
                    {isEditing && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity duration-200">
                        <Camera className="h-6 w-6 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <h2 className="text-xl font-semibold text-white mb-1">
                    {formData.first_name} {formData.last_name}
                  </h2>
                  <p className="text-blue-100 text-sm">@{formData.username}</p>
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="truncate">{formData.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-3 text-gray-400" />
                    <span>
                      Member since:{" "}
                      {user?.date_joined
                        ? (() => {
                            const d = new Date(user.date_joined);
                            return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`;
                          })()
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <UserCheck className="h-4 w-4 mr-3 text-gray-400" />
                    <span className="flex items-center">
                      Status:
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3 space-y-8">
              {/* Profile Form */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Edit3 className="h-6 w-6 text-gray-600 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-900">
                        Personal Information
                      </h3>
                    </div>
                    {!isEditing && (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                      >
                        Edit Profile
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* First Name and Last Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label
                          htmlFor="first_name"
                          className="block text-sm font-semibold text-gray-700 mb-3"
                        >
                          First Name
                        </label>
                        <input
                          id="first_name"
                          name="first_name"
                          type="text"
                          required
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 ${
                            isEditing
                              ? `border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.first_name ? "border-red-500 focus:ring-red-500" : ""}`
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          }`}
                          placeholder="First name"
                          value={formData.first_name}
                          onChange={handleChange}
                        />
                        {errors.first_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.first_name}
                          </p>
                        )}
                      </div>

                      <div>
                        <label
                          htmlFor="last_name"
                          className="block text-sm font-semibold text-gray-700 mb-3"
                        >
                          Last Name
                        </label>
                        <input
                          id="last_name"
                          name="last_name"
                          type="text"
                          required
                          disabled={!isEditing}
                          className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 ${
                            isEditing
                              ? `border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.last_name ? "border-red-500 focus:ring-red-500" : ""}`
                              : "border-gray-200 bg-gray-50 cursor-not-allowed"
                          }`}
                          placeholder="Last name"
                          value={formData.last_name}
                          onChange={handleChange}
                        />
                        {errors.last_name && (
                          <p className="mt-2 text-sm text-red-600 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            {errors.last_name}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-semibold text-gray-700 mb-3"
                      >
                        Username
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        required
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 ${
                          isEditing
                            ? `border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.username ? "border-red-500 focus:ring-red-500" : ""}`
                            : "border-gray-200 bg-gray-50 cursor-not-allowed"
                        }`}
                        placeholder="Username"
                        value={formData.username}
                        onChange={handleChange}
                      />
                      {errors.username && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.username}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-semibold text-gray-700 mb-3"
                      >
                        Email Address
                      </label>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 border rounded-xl transition-all duration-200 text-gray-900 ${
                          isEditing
                            ? `border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`
                            : "border-gray-200 bg-gray-50 cursor-not-allowed"
                        }`}
                        placeholder="Email address"
                        value={formData.email}
                        onChange={handleChange}
                      />
                      {errors.email && (
                        <p className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Action Buttons */}
                    {isEditing && (
                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors duration-200 font-medium"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !hasChanges}
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-lg"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                              Updating...
                            </div>
                          ) : (
                            <div className="flex items-center">
                              <Save className="h-4 w-4 mr-2" />
                              Update Profile
                            </div>
                          )}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>

              {/* Account Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-200">
                  <div className="flex items-center">
                    <Shield className="h-6 w-6 text-green-600 mr-3" />
                    <h3 className="text-xl font-semibold text-gray-900">
                      Account Information
                    </h3>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        User ID
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {user?.id}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Account Status
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Member Since
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {user?.date_joined
                          ? new Date(user.date_joined).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : "N/A"}
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 mb-1">
                        Last Updated
                      </div>
                      <div className="text-lg font-semibold text-gray-900">
                        {user?.updated_at
                          ? new Date(user.updated_at).toLocaleDateString()
                          : "Never"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Danger Zone */}
              <div className="bg-white rounded-2xl shadow-lg border border-red-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 px-8 py-6 border-b border-red-200">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-red-600 mr-3" />
                    <h3 className="text-xl font-semibold text-red-900">
                      Danger Zone
                    </h3>
                  </div>
                </div>
                <div className="p-8">
                  <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-6">
                    <div className="flex items-start">
                      <Trash2 className="h-6 w-6 text-red-600 mr-4 mt-1 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-red-800 mb-2">
                          Delete Account
                        </h4>
                        <p className="text-red-700 mb-6 leading-relaxed">
                          Permanently delete your account and all associated
                          data. This action cannot be undone and will remove
                          your profile, medical history, ingredient analysis
                          history, and all personal data.
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-red-600">
                            <span className="font-medium">Warning:</span> This
                            will delete all your data permanently
                          </div>
                          <button
                            type="button"
                            disabled={busyDelete}
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors duration-200 font-medium shadow-sm"
                          >
                            {busyDelete ? "Deleting..." : "Delete"}
                          </button>
                        </div>
                      </div>
                    </div>
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

// Delete Confirmation Modal Component with Backdrop Blur
const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [confirmText, setConfirmText] = useState("");
  const expectedText = "DELETE";

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (confirmText === expectedText && !loading) {
      onConfirm();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && confirmText === expectedText && !loading) {
      handleConfirm();
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full relative shadow-2xl">
        <div className="text-center mb-6">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Delete Account
          </h3>
          <p className="text-gray-600">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type "{expectedText}" to confirm:
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder={expectedText}
            autoFocus
          />
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || confirmText !== expectedText}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                Deleting...
              </div>
            ) : (
              "Delete Account"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
