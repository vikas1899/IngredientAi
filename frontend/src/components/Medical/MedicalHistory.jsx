import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/apiService';
import { Heart, Save, AlertCircle, CheckCircle, X, Shield, Info, Trash2, ChevronDown } from 'lucide-react';
import Navbar from '../Navbar';

const initialMedicalData = {
  allergies: '',
  diseases: '',
  age: '',
  life_stage: '',
  dietary_preferences: '',
  medications: '',
  skin_type: '',
  health_goals: '',
  region: ''
};

const MedicalHistory = () => {
  const [medicalData, setMedicalData] = useState(initialMedicalData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasExistingData, setHasExistingData] = useState(false);
  const [allergiesList, setAllergiesList] = useState([]);
  const [diseasesList, setDiseasesList] = useState([]);

  // Dropdown options
  const lifeStageOptions = [
    { value: '', label: 'Select life stage...' },
    { value: 'Child', label: 'Child (0-12)' },
    { value: 'Teenager', label: 'Teenager (13-19)' },
    { value: 'Adult', label: 'Adult (20-65)' },
    { value: 'Senior', label: 'Senior (65+)' },
    { value: 'Pregnant', label: 'Pregnant' },
    { value: 'Breastfeeding', label: 'Breastfeeding' }
  ];

  const skinTypeOptions = [
    { value: '', label: 'Select skin type...' },
    { value: 'Normal', label: 'Normal' },
    { value: 'Dry', label: 'Dry' },
    { value: 'Oily', label: 'Oily' },
    { value: 'Combination', label: 'Combination' },
    { value: 'Sensitive', label: 'Sensitive' },
    { value: 'Acne-prone', label: 'Acne-prone' }
  ];

  const regionOptions = [
    { value: '', label: 'Select region...' },
    { value: 'North America', label: 'North America' },
    { value: 'Europe', label: 'Europe' },
    { value: 'Asia', label: 'Asia' },
    { value: 'Africa', label: 'Africa' },
    { value: 'South America', label: 'South America' },
    { value: 'Oceania', label: 'Oceania' },
    { value: 'Middle East', label: 'Middle East' }
  ];

  const dietaryPreferencesOptions = [
    { value: '', label: 'Select dietary preferences...' },
    { value: 'No restrictions', label: 'No restrictions' },
    { value: 'Vegetarian', label: 'Vegetarian' },
    { value: 'Vegan', label: 'Vegan' },
    { value: 'Gluten-Free', label: 'Gluten-Free' },
    { value: 'Keto', label: 'Keto' },
    { value: 'Paleo', label: 'Paleo' },
    { value: 'Halal', label: 'Halal' },
    { value: 'Kosher', label: 'Kosher' },
    { value: 'Low-Sodium', label: 'Low-Sodium' },
    { value: 'Diabetic', label: 'Diabetic' }
  ];

  const healthGoalsOptions = [
    { value: '', label: 'Select health goals...' },
    { value: 'Weight Loss', label: 'Weight Loss' },
    { value: 'Weight Gain', label: 'Weight Gain' },
    { value: 'Muscle Building', label: 'Muscle Building' },
    { value: 'Better Skin', label: 'Better Skin' },
    { value: 'Heart Health', label: 'Heart Health' },
    { value: 'Digestive Health', label: 'Digestive Health' },
    { value: 'Energy Boost', label: 'Energy Boost' },
    { value: 'Immune Support', label: 'Immune Support' },
    { value: 'Anti-Aging', label: 'Anti-Aging' },
    { value: 'Mental Health', label: 'Mental Health' }
  ];

  useEffect(() => {
    loadMedicalHistory();
  }, []);

  const loadMedicalHistory = async () => {
    try {
      const response = await apiService.getMedicalHistory();
      
      if (response.success) {
        const loaded = {
          allergies: response.data.allergies || '',
          diseases: response.data.diseases || '',
          age: response.data.age || '',
          life_stage: response.data.life_stage || '',
          dietary_preferences: response.data.dietary_preferences || '',
          medications: response.data.medications || '',
          skin_type: response.data.skin_type || '',
          health_goals: response.data.health_goals || '',
          region: response.data.region || ''
        };
        setMedicalData(loaded);
        setHasExistingData(true);

        if (response.data.allergies && response.data.allergies !== 'None') {
          setAllergiesList(response.data.allergies.split(',').map(item => item.trim()).filter(Boolean));
        }
        if (response.data.diseases && response.data.diseases !== 'None') {
          setDiseasesList(response.data.diseases.split(',').map(item => item.trim()).filter(Boolean));
        }
      } else {
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
    
    if (name === 'allergies') {
      const newList = value.split(',').map(item => item.trim()).filter(Boolean);
      setAllergiesList(newList);
    } else if (name === 'diseases') {
      const newList = value.split(',').map(item => item.trim()).filter(Boolean);
      setDiseasesList(newList);
    }
    
    if (error) setError('');
    if (success) setSuccess('');
  };

  const removeAllergy = (allergyToRemove) => {
    const updatedList = allergiesList.filter(allergy => allergy !== allergyToRemove);
    setAllergiesList(updatedList);
    setMedicalData(prev => ({
      ...prev,
      allergies: updatedList.join(', ')
    }));
  };

  const removeDisease = (diseaseToRemove) => {
    const updatedList = diseasesList.filter(disease => disease !== diseaseToRemove);
    setDiseasesList(updatedList);
    setMedicalData(prev => ({
      ...prev,
      diseases: updatedList.join(', ')
    }));
  };

  const clearAllAllergies = () => {
    setAllergiesList([]);
    setMedicalData(prev => ({
      ...prev,
      allergies: ''
    }));
  };

  const clearAllDiseases = () => {
    setDiseasesList([]);
    setMedicalData(prev => ({
      ...prev,
      diseases: ''
    }));
  };

  const addQuickAllergy = (allergy) => {
    if (!allergiesList.includes(allergy)) {
      const updatedList = [...allergiesList, allergy];
      setAllergiesList(updatedList);
      setMedicalData(prev => ({
        ...prev,
        allergies: updatedList.join(', ')
      }));
    }
  };

  const addQuickDisease = (disease) => {
    if (!diseasesList.includes(disease)) {
      const updatedList = [...diseasesList, disease];
      setDiseasesList(updatedList);
      setMedicalData(prev => ({
        ...prev,
        diseases: updatedList.join(', ')
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const dataToSubmit = {
      allergies: medicalData.allergies.trim() || 'None',
      diseases: medicalData.diseases.trim() || 'None',
      age: medicalData.age || null,
      life_stage: medicalData.life_stage.trim() || 'None',
      dietary_preferences: medicalData.dietary_preferences.trim() || 'None',
      medications: medicalData.medications.trim() || 'None',
      skin_type: medicalData.skin_type.trim() || 'None',
      health_goals: medicalData.health_goals.trim() || 'None',
      region: medicalData.region.trim() || 'None',
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

  // NEW: clear all fields in a controlled way
  const handleClear = () => {
    setMedicalData(initialMedicalData);
    setAllergiesList([]);
    setDiseasesList([]);
    setError('');
    setSuccess('');
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

  const CustomSelect = ({ options, value, onChange, name, className = "" }) => {
    return (
      <div className="relative">
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`appearance-none w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 bg-white pr-10 ${className}`}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
      </div>
    );
  };

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
            {/* Allergies Section */}
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

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Add Common Allergies</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                    {commonAllergies.map((allergy) => (
                      <button
                        key={allergy}
                        type="button"
                        onClick={() => addQuickAllergy(allergy)}
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

                <div>
                  <label htmlFor="allergies" className="block text-sm font-semibold text-gray-700 mb-3">
                    Type your allergies (comma-separated):
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

            {/* Medical Conditions Section */}
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

                <div className="mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Add Common Conditions</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                    {commonConditions.map((condition) => (
                      <button
                        key={condition}
                        type="button"
                        onClick={() => addQuickDisease(condition)}
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

                <div>
                  <label htmlFor="diseases" className="block text-sm font-semibold text-gray-700 mb-3">
                    Type your medical conditions (comma-separated):
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
            
            {/* Additional Information Section with Dropdowns */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-6">
                <h3 className="text-xl font-semibold text-white">Additional Information</h3>
                <p className="text-green-100 text-sm mt-1">
                  Provide more details for a highly personalized analysis.
                </p>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">Age</label>
                  <input 
                    type="number" 
                    id="age" 
                    name="age" 
                    value={medicalData.age} 
                    onChange={handleInputChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900" 
                    placeholder="e.g., 30"
                    min="1"
                    max="150"
                  />
                </div>

                <div>
                  <label htmlFor="life_stage" className="block text-sm font-semibold text-gray-700 mb-2">Life Stage</label>
                  <CustomSelect
                    options={lifeStageOptions}
                    value={medicalData.life_stage}
                    onChange={handleInputChange}
                    name="life_stage"
                  />
                </div>

                <div>
                  <label htmlFor="skin_type" className="block text-sm font-semibold text-gray-700 mb-2">Skin Type</label>
                  <CustomSelect
                    options={skinTypeOptions}
                    value={medicalData.skin_type}
                    onChange={handleInputChange}
                    name="skin_type"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-semibold text-gray-700 mb-2">Region</label>
                  <CustomSelect
                    options={regionOptions}
                    value={medicalData.region}
                    onChange={handleInputChange}
                    name="region"
                  />
                </div>

                <div>
                  <label htmlFor="dietary_preferences" className="block text-sm font-semibold text-gray-700 mb-2">Dietary Preferences</label>
                  <CustomSelect
                    options={dietaryPreferencesOptions}
                    value={medicalData.dietary_preferences}
                    onChange={handleInputChange}
                    name="dietary_preferences"
                  />
                </div>

                <div>
                  <label htmlFor="health_goals" className="block text-sm font-semibold text-gray-700 mb-2">Health Goals</label>
                  <CustomSelect
                    options={healthGoalsOptions}
                    value={medicalData.health_goals}
                    onChange={handleInputChange}
                    name="health_goals"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="medications" className="block text-sm font-semibold text-gray-700 mb-2">Current Medications</label>
                  <textarea 
                    id="medications" 
                    name="medications" 
                    value={medicalData.medications} 
                    onChange={handleInputChange} 
                    rows="3" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500" 
                    placeholder="Comma-separated, e.g., Metformin, Aspirin"
                  />
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex flex-wrap justify-center gap-3">
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

                  <button
                    type="button"
                    onClick={handleClear}
                    disabled={saving}
                    className="inline-flex items-center px-6 py-4 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold bg-white hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all"
                    title="Clear all fields"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Clear Fields
                  </button>
                </div>

                <p className="text-sm text-gray-600 mt-3">
                  You can save even if both fields are empty to indicate no allergies or conditions
                </p>
              </div>
            </div>
          </form>

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
