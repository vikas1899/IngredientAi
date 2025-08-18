import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { Heart, Save, AlertCircle, CheckCircle, Plus, X, Shield, Info, Trash2 } from 'lucide-react';
import Navbar from '../Navbar';

const MedicalHistory = () => {
  const [medicalData, setMedicalData] = useState({
    allergies: '',
    diseases: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);
  const [allergiesList, setAllergiesList] = useState([]);
  const [diseasesList, setDiseasesList] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  const [newDisease, setNewDisease] = useState('');

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      const response = await apiService.getMedicalHistory();
      
      if (response.success) {
        setMedicalData({
          allergies: response.data.allergies || '',
          diseases: response.data.diseases || ''
        });
        setHasExistingData(true);
        
        // Parse comma-separated lists
        if (response.data.allergies && response.data.allergies !== 'None') {
          setAllergiesList(response.data.allergies.split(',').map(item => item.trim()).filter(Boolean));
        }
        if (response.data.diseases && response.data.diseases !== 'None') {
          setDiseasesList(response.data.diseases.split(',').map(item => item.trim()).filter(Boolean));
        }
      } else {
        // No medical history exists yet
        setHasExistingData(false);
      }
    } catch (err) {
      console.error('Error loading medical history:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedicalData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update corresponding lists when text is changed manually
    if (name === 'allergies') {
      const newList = value.split(',').map(item => item.trim()).filter(Boolean);
      setAllergiesList(newList);
    } else if (name === 'diseases') {
      const newList = value.split(',').map(item => item.trim()).filter(Boolean);
      setDiseasesList(newList);
    }
    
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const addAllergy = () => {
    if (newAllergy.trim() && !allergiesList.includes(newAllergy.trim())) {
      const updatedList = [...allergiesList, newAllergy.trim()];
      setAllergiesList(updatedList);
      setMedicalData(prev => ({
        ...prev,
        allergies: updatedList.join(', ')
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergyToRemove) => {
    const updatedList = allergiesList.filter(allergy => allergy !== allergyToRemove);
    setAllergiesList(updatedList);
    setMedicalData(prev => ({
      ...prev,
      allergies: updatedList.join(', ')
    }));
  };

  const addDisease = () => {
    if (newDisease.trim() && !diseasesList.includes(newDisease.trim())) {
      const updatedList = [...diseasesList, newDisease.trim()];
      setDiseasesList(updatedList);
      setMedicalData(prev => ({
        ...prev,
        diseases: updatedList.join(', ')
      }));
      setNewDisease('');
    }
  };

  const removeDisease = (diseaseToRemove) => {
    const updatedList = diseasesList.filter(disease => disease !== diseaseToRemove);
    setDiseasesList(updatedList);
    setMedicalData(prev => ({
      ...prev,
      diseases: updatedList.join(', ')
    }));
  };

  // Clear all allergies function
  const clearAllAllergies = () => {
    setAllergiesList([]);
    setMedicalData(prev => ({
      ...prev,
      allergies: ''
    }));
  };

  // Clear all diseases function
  const clearAllDiseases = () => {
    setDiseasesList([]);
    setMedicalData(prev => ({
      ...prev,
      diseases: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    // Get trimmed values
    const trimmedAllergies = medicalData.allergies.trim();
    const trimmedDiseases = medicalData.diseases.trim();

    // Prepare data - Send 'None' for empty fields to satisfy backend requirements
    const dataToSubmit = {
      allergies: trimmedAllergies || 'None',
      diseases: trimmedDiseases || 'None'
    };

    try {
      let response;
      if (hasExistingData) {
        response = await apiService.updateMedicalHistory(dataToSubmit);
      } else {
        response = await apiService.createMedicalHistory(dataToSubmit);
      }

      if (response.success) {
        setSuccess(hasExistingData ? 'Medical history updated successfully!' : 'Medical history saved successfully!');
        setHasExistingData(true);
        setTimeout(() => setSuccess(''), 5000);
      } else {
        if (typeof response.error === 'object') {
          const errorMessages = Object.values(response.error).flat();
          setError(errorMessages.join(', '));
        } else {
          setError(response.error || 'Failed to save medical history');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Error saving medical history:', err);
    } finally {
      setSaving(false);
    }
  };

  const commonAllergies = [
    'Peanuts', 'Tree nuts', 'Shellfish', 'Fish', 'Milk', 'Eggs', 
    'Soy', 'Wheat', 'Sesame', 'Shellac', 'Latex', 'Pollen', 'Dust mites'
  ];

  const commonConditions = [
    'Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'COPD',
    'Kidney Disease', 'Liver Disease', 'Celiac Disease', 'Lactose Intolerance',
    'High Cholesterol', 'Arthritis', 'Osteoporosis', 'Thyroid Disease'
  ];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading your medical information...</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Modern Header with Gradient */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-red-500 to-pink-500 rounded-full mb-6 shadow-lg">
              <Heart className="h-10 w-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-4">
              Medical Information
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Keep your medical information updated to receive personalized ingredient analysis and safety recommendations
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
                  <h3 className="text-sm font-medium text-green-800">Success</h3>
                  <p className="text-sm text-green-700 mt-1">{success}</p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Enhanced Allergies Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <AlertCircle className="h-6 w-6 text-white mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">Allergies & Sensitivities</h3>
                      <p className="text-red-100 text-sm mt-1">
                        Critical information for ingredient safety analysis
                      </p>
                    </div>
                  </div>
                  {/* Clear All Allergies Button */}
                  {allergiesList.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllAllergies}
                      className="flex items-center gap-2 px-4 py-2 bg-red-700 hover:bg-red-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      title="Clear all allergies"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-8">
                {/* Current Allergies Display */}
                {allergiesList.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Your Allergies</h4>
                      <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                        {allergiesList.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {allergiesList.map((allergy, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-xl hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-red-800 font-medium">{allergy}</span>
                          <button
                            type="button"
                            onClick={() => removeAllergy(allergy)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-200 rounded-full"
                            title="Remove allergy"
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Allergies Message */}
                {allergiesList.length === 0 && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <p className="text-green-800 font-medium">No allergies recorded</p>
                    </div>
                    <p className="text-green-700 text-sm mt-1 ml-8">
                      Your profile shows no allergies or sensitivities
                    </p>
                  </div>
                )}

                {/* Add New Allergy */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Add New Allergy
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter allergy or sensitivity"
                      value={newAllergy}
                      onChange={(e) => setNewAllergy(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                    />
                    <button
                      type="button"
                      onClick={addAllergy}
                      className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors duration-200 flex items-center font-medium shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Common Allergies */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Add Common Allergies</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {commonAllergies.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => {
                          if (!allergiesList.includes(allergy)) {
                            const updatedList = [...allergiesList, allergy];
                            setAllergiesList(updatedList);
                            setMedicalData(prev => ({
                              ...prev,
                              allergies: updatedList.join(', ')
                            }));
                          }
                        }}
                        className={`p-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                          allergiesList.includes(allergy)
                            ? 'bg-red-100 text-red-700 border-red-300 cursor-not-allowed opacity-60'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-red-300 hover:bg-red-50 hover:shadow-sm'
                        }`}
                        disabled={allergiesList.includes(allergy)}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Text Input */}
                <div>
                  <label htmlFor="allergies" className="block text-sm font-semibold text-gray-700 mb-3">
                    Or enter as comma-separated text:
                  </label>
                  <textarea
                    id="allergies"
                    name="allergies"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Peanuts, Tree nuts, Shellfish, Milk... (Leave empty if no allergies)"
                    value={medicalData.allergies}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Medical Conditions Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-6 w-6 text-white mr-3" />
                    <div>
                      <h3 className="text-xl font-semibold text-white">Medical Conditions</h3>
                      <p className="text-blue-100 text-sm mt-1">
                        Chronic conditions and ongoing health considerations
                      </p>
                    </div>
                  </div>
                  {/* Clear All Diseases Button */}
                  {diseasesList.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllDiseases}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                      title="Clear all conditions"
                    >
                      <Trash2 className="h-4 w-4" />
                      Clear All
                    </button>
                  )}
                </div>
              </div>
              
              <div className="p-8">
                {/* Current Conditions Display */}
                {diseasesList.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">Your Conditions</h4>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                        {diseasesList.length} items
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {diseasesList.map((disease, index) => (
                        <div
                          key={index}
                          className="group flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-xl hover:shadow-md transition-all duration-200"
                        >
                          <span className="text-blue-800 font-medium">{disease}</span>
                          <button
                            type="button"
                            onClick={() => removeDisease(disease)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-blue-200 rounded-full"
                            title="Remove condition"
                          >
                            <X className="h-4 w-4 text-blue-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Conditions Message */}
                {diseasesList.length === 0 && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <div className="flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                      <p className="text-green-800 font-medium">No medical conditions recorded</p>
                    </div>
                    <p className="text-green-700 text-sm mt-1 ml-8">
                      Your profile shows no chronic conditions or ongoing health issues
                    </p>
                  </div>
                )}

                {/* Add New Condition */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Add New Condition
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      placeholder="Enter medical condition"
                      value={newDisease}
                      onChange={(e) => setNewDisease(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addDisease())}
                    />
                    <button
                      type="button"
                      onClick={addDisease}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors duration-200 flex items-center font-medium shadow-sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </button>
                  </div>
                </div>

                {/* Common Conditions */}
                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Add Common Conditions</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {commonConditions.map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => {
                          if (!diseasesList.includes(condition)) {
                            const updatedList = [...diseasesList, condition];
                            setDiseasesList(updatedList);
                            setMedicalData(prev => ({
                              ...prev,
                              diseases: updatedList.join(', ')
                            }));
                          }
                        }}
                        className={`p-3 text-sm font-medium rounded-xl border-2 transition-all duration-200 ${
                          diseasesList.includes(condition)
                            ? 'bg-blue-100 text-blue-700 border-blue-300 cursor-not-allowed opacity-60'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50 hover:shadow-sm'
                        }`}
                        disabled={diseasesList.includes(condition)}
                      >
                        {condition}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raw Text Input */}
                <div>
                  <label htmlFor="diseases" className="block text-sm font-semibold text-gray-700 mb-3">
                    Or enter as comma-separated text:
                  </label>
                  <textarea
                    id="diseases"
                    name="diseases"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                    placeholder="e.g., Diabetes, Hypertension, Heart Disease... (Leave empty if no conditions)"
                    value={medicalData.diseases}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            {/* Submit Button - Always Enabled */}
            <div className="text-center">
              <button
                type="submit"
                disabled={saving}
                className={`relative inline-flex items-center px-12 py-4 text-white font-semibold text-lg rounded-xl shadow-lg focus:outline-none focus:ring-4 focus:ring-purple-300 transition-all duration-300 transform hover:scale-105 active:scale-95 ${
                  saving 
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 opacity-50 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-3" />
                    {hasExistingData ? 'Update Medical Information' : 'Save Medical Information'}
                  </>
                )}
              </button>
              <p className="text-sm text-gray-600 mt-3">
                You can save even if both fields are empty to indicate no allergies or conditions
              </p>
            </div>
          </form>

          {/* Enhanced Privacy Notice */}
          <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-8">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-amber-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-amber-800 mb-2">Privacy & Security</h3>
                  <p className="text-amber-700 leading-relaxed">
                    Your medical information is encrypted using industry-standard security protocols and stored in compliance with healthcare privacy regulations. This sensitive data is used exclusively to provide personalized ingredient analysis and safety recommendations. We never share your medical information with third parties, and you maintain full control to update or delete this information at any time.
                  </p>
                  <div className="mt-4 flex items-center text-sm text-amber-600">
                    <Info className="h-4 w-4 mr-2" />
                    <span>End-to-end encrypted • HIPAA compliant • Never shared</span>
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

export default MedicalHistory;
