import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  Settings, 
  Plus, 
  X, 
  Sliders, 
  Sparkles, 
  Clock, 
  Info, 
  Save, 
  Check, 
  Lock, 
  Mail, 
  MessageSquareCode, 
  CheckSquare, 
  ArrowRight,
  ShieldCheck,
  Zap,
  AlertCircle,
  Globe,
  MapPin,
  Upload
} from "lucide-react";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";

export default function JobPreferences() {
  // Page load and submit states
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(""); // "", "success"
  const [toast, setToast] = useState({ message: "", type: "" }); // type: "success" | "error" | ""

  // Preference fields states
  const [roles, setRoles] = useState([]);
  const [roleInput, setRoleInput] = useState("");
  const [searchPlan, setSearchPlan] = useState([]);

  const [locations, setLocations] = useState([]);
  const [locationInput, setLocationInput] = useState("");

  const [profile, setProfile] = useState(null);

  // Resume upload states
  const fileInputRef = useRef(null);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      setUploadError("Only PDF resumes are supported.");
      setUploadSuccess(false);
      return;
    }

    const formData = new FormData();
    formData.append("resume", file);

    try {
      setUploadingResume(true);
      setUploadError(null);
      setUploadSuccess(false);
      const res = await axios.post("http://localhost:5000/api/resume/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data && res.data.success && res.data.profile) {
        setProfile(res.data.profile);
        setUploadSuccess(true);
        showToast("Resume parsed and synced successfully!", "success");
        setTimeout(() => setUploadSuccess(false), 5000);
      } else {
        throw new Error(res.data?.message || "Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      const errMsg = err.response?.data?.error || err.message || "Failed to upload resume.";
      setUploadError(errMsg);
      showToast(errMsg, "error");
    } finally {
      setUploadingResume(false);
    }
  };

  // Work Mode Toggles
  const [remoteAllowed, setRemoteAllowed] = useState(true);
  const [hybridAllowed, setHybridAllowed] = useState(true);
  const [onsiteAllowed, setOnsiteAllowed] = useState(true);

  // Search Settings
  const [minimumMatchScore, setMinimumMatchScore] = useState(70);
  const [jobsAgeDays, setJobsAgeDays] = useState(7);
  const [maxDailyJobs, setMaxDailyJobs] = useState(50);

  // Country Preference (Phase 5.6)
  const [preferredCountry, setPreferredCountry] = useState("India");

  // Helper to trigger toast notification
  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast({ message: "", type: "" });
    }, 4000);
  };

  // 1. GET: Load existing preferences & candidate profile automatically on page load
  useEffect(() => {
    let isMounted = true;
    async function fetchPreferencesAndProfile() {
      try {
        setLoading(true);
        const [prefsRes, profileRes] = await Promise.all([
          axios.get("http://localhost:5000/api/preferences"),
          axios.get("http://localhost:5000/api/resume/profile").catch(err => {
            console.warn("No candidate profile found yet or failed to load:", err);
            return { data: { success: false, profile: null } };
          })
        ]);
        
        if (isMounted) {
          if (prefsRes.data && prefsRes.data.success && prefsRes.data.preferences) {
            const prefs = prefsRes.data.preferences;
            setRoles(prefs.target_roles || []);
            setLocations(prefs.preferred_locations || []);
            setRemoteAllowed(prefs.remote_allowed !== undefined ? prefs.remote_allowed : true);
            setPreferredCountry(prefs.preferred_country || "India");
            
            // Set extra search settings from backend/local file
            if (prefs.minimum_match_score !== undefined) setMinimumMatchScore(prefs.minimum_match_score);
            if (prefs.jobs_age_days !== undefined) setJobsAgeDays(prefs.jobs_age_days);
            if (prefs.max_daily_jobs !== undefined) setMaxDailyJobs(prefs.max_daily_jobs);
            
            // Populate initial search plan
            setSearchPlan(prefsRes.data.searchPlan || []);
          }
          
          if (profileRes.data && profileRes.data.success && profileRes.data.profile) {
            setProfile(profileRes.data.profile);
          }
        }
      } catch (err) {
        console.error("Failed to load job preferences:", err);
        if (isMounted) {
          showToast("Failed to load existing preferences", "error");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchPreferencesAndProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. POST: Save preferences to backend using UPSERT strategy
  const handleSavePreferences = async () => {
    try {
      setSaving(true);
      setSaveStatus("");

      const payload = {
        target_roles: roles,
        preferred_locations: locations,
        remote_allowed: remoteAllowed,
        preferred_country: preferredCountry,
        minimum_match_score: minimumMatchScore,
        jobs_age_days: jobsAgeDays,
        max_daily_jobs: maxDailyJobs
      };

      const response = await axios.post("http://localhost:5000/api/preferences", payload);

      if (response.data && response.data.success) {
        setSaveStatus("success");
        showToast("Preferences Updated", "success");
        if (response.data.searchPlan) {
          setSearchPlan(response.data.searchPlan);
        }
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        throw new Error("API responded with failure");
      }
    } catch (err) {
      console.error("Failed to save job preferences:", err);
      showToast("Unable to save preferences. Please check your connection.", "error");
    } finally {
      setSaving(false);
    }
  };

  // Add role handler
  const handleAddRole = (e) => {
    e?.preventDefault();
    const cleanRole = roleInput.trim();
    if (!cleanRole) return;
    
    if (roles.length >= 20) {
      showToast("Maximum of 20 target roles allowed", "error");
      return;
    }
    
    // Duplicate check case-insensitive
    const exists = roles.some(r => r.toLowerCase() === cleanRole.toLowerCase());
    if (exists) {
      showToast("Role is already in your list", "error");
      return;
    }

    setRoles([...roles, cleanRole]);
    setRoleInput("");
  };

  // Remove role handler
  const handleRemoveRole = (roleToRemove) => {
    setRoles(roles.filter(r => r !== roleToRemove));
  };

  // Add location handler
  const handleAddLocation = (e) => {
    e?.preventDefault();
    const cleanLocation = locationInput.trim();
    if (!cleanLocation) return;
    
    if (locations.length >= 20) {
      showToast("Maximum of 20 locations allowed", "error");
      return;
    }
    
    const exists = locations.some(l => l.toLowerCase() === cleanLocation.toLowerCase());
    if (exists) {
      showToast("Location is already in your list", "error");
      return;
    }

    setLocations([...locations, cleanLocation]);
    setLocationInput("");
  };

  // Remove location handler
  const handleRemoveLocation = (locationToRemove) => {
    setLocations(locations.filter(l => l !== locationToRemove));
  };

  // Fetch search plan preview when states change
  useEffect(() => {
    let active = true;
    async function fetchPreview() {
      try {
        // Only run preview if page has loaded initial data
        if (loading) return;

        const payload = {
          target_roles: roles,
          preferred_locations: locations,
          remote_allowed: remoteAllowed,
          preferred_country: preferredCountry
        };

        const response = await axios.post("http://localhost:5000/api/preferences/preview-search-plan", payload);
        if (active && response.data && response.data.success) {
          setSearchPlan(response.data.searchPlan || []);
        }
      } catch (err) {
        console.error("Failed to fetch search plan preview", err);
      }
    }

    // Debounce to prevent rapid API requests when user is typing/adding tags
    const timer = setTimeout(() => {
      fetchPreview();
    }, 400);

    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [roles, locations, remoteAllowed, preferredCountry, loading]);

  // Count active work modes
  const getActiveWorkModesCount = () => {
    let count = 0;
    if (remoteAllowed) count++;
    if (hybridAllowed) count++;
    if (onsiteAllowed) count++;
    return count;
  };

  // Render Loader Skeleton
  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 bg-slate-900 rounded-xl"></div>
          <div className="space-y-2 flex-1">
            <div className="h-6 bg-slate-900 rounded w-1/4"></div>
            <div className="h-4 bg-slate-900 rounded w-1/2"></div>
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-48 bg-slate-900 rounded-2xl"></div>
            <div className="h-48 bg-slate-900 rounded-2xl"></div>
            <div className="h-32 bg-slate-900 rounded-2xl"></div>
            <div className="h-44 bg-slate-900 rounded-2xl"></div>
          </div>
          <div className="space-y-6">
            <div className="h-64 bg-slate-900 rounded-2xl"></div>
            <div className="h-52 bg-slate-900 rounded-2xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification Banner */}
      {toast.message && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-2.5 px-4.5 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-scale-in ${
          toast.type === "error" 
            ? "bg-error-red/10 border-error-red/35 text-error-red" 
            : "bg-success-green/10 border-success-green/35 text-success-green"
        }`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <ShieldCheck className="w-4 h-4 shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border-custom/40 pb-5">
        <div className="flex items-center gap-4 relative">
          <div className="absolute -inset-1.5 rounded-xl bg-violet-600/20 blur-md animate-pulse"></div>
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-slate-950 border border-border-custom text-violet-400">
            <Settings className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-main tracking-tight">
              Job Preferences
            </h1>
            <p className="text-xs sm:text-sm text-text-sec mt-1 max-w-xl">
              Configure the job roles, locations, and preferences that JobScout AI will use to discover opportunities daily.
            </p>
          </div>
        </div>

        {/* Desktop Save Action */}
        <div className="hidden sm:block">
          <Button 
            variant="primary"
            onClick={handleSavePreferences}
            disabled={saving}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold cursor-pointer shadow-lg shadow-blue-500/10 min-w-[150px]"
          >
            {saving ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : saveStatus === "success" ? (
              <>
                <Check className="w-4 h-4" />
                Preferences Updated
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Preferences
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Form Sections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Target Roles */}
          <Card className="bg-[#111827] border border-border-custom/60 p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F9FAFB]">Target Roles</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Tell JobScout AI which roles you are actively targeting.</p>
            </div>

            <form onSubmit={handleAddRole} className="flex gap-2">
              <input
                type="text"
                value={roleInput}
                onChange={(e) => setRoleInput(e.target.value)}
                placeholder="e.g. Full Stack Developer, React Engineer..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-border-custom rounded-xl text-xs sm:text-sm text-text-main placeholder-text-sec outline-hidden focus:border-blue-500/50 hover:border-slate-800 transition-all"
              />
              <Button type="submit" variant="secondary" className="px-4 text-xs font-semibold shrink-0 cursor-pointer">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            {/* Chips Area */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {roles.length > 0 ? (
                roles.map((role) => (
                  <div 
                    key={role} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-950/30 text-primary-blue border border-blue-500/20 rounded-xl text-xs font-medium hover:border-blue-500/40 transition-colors animate-scale-in"
                  >
                    <span>✓</span>
                    <span>{role}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveRole(role)}
                      className="p-0.5 rounded-full hover:bg-blue-950/80 text-primary-blue hover:text-blue-200 cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-2 text-[11px] text-text-sec flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-text-sec opacity-70" />
                  <span>No roles added yet. Please specify at least one target role.</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-sec border-t border-border-custom/30 pt-3">
              <span>Enter to submit</span>
              <span>{roles.length} / 20 roles maximum</span>
            </div>
          </Card>

          {/* Section 2: Preferred Locations */}
          <Card className="bg-[#111827] border border-border-custom/60 p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F9FAFB]">Preferred Locations</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Specify locations where you want JobScout AI to search.</p>
            </div>

            <form onSubmit={handleAddLocation} className="flex gap-2">
              <input
                type="text"
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="e.g. Bangalore, Remote, Pune..."
                className="flex-1 px-4 py-2.5 bg-slate-950 border border-border-custom rounded-xl text-xs sm:text-sm text-text-main placeholder-text-sec outline-hidden focus:border-blue-500/50 hover:border-slate-800 transition-all"
              />
              <Button type="submit" variant="secondary" className="px-4 text-xs font-semibold shrink-0 cursor-pointer">
                <Plus className="w-4 h-4" />
              </Button>
            </form>

            {/* Chips Area */}
            <div className="flex flex-wrap gap-2.5 pt-2">
              {locations.length > 0 ? (
                locations.map((loc) => (
                  <div 
                    key={loc} 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-950/30 text-violet-400 border border-violet-500/20 rounded-xl text-xs font-medium hover:border-violet-500/40 transition-colors animate-scale-in"
                  >
                    <span>✓</span>
                    <span>{loc}</span>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveLocation(loc)}
                      className="p-0.5 rounded-full hover:bg-violet-950/80 text-violet-400 hover:text-violet-200 cursor-pointer transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-2 text-[11px] text-text-sec flex items-center gap-2">
                  <Info className="w-3.5 h-3.5 text-text-sec opacity-70" />
                  <span>No locations added yet. Please specify at least one location (like "Remote").</span>
                </div>
              )}
            </div>
            <div className="flex justify-between items-center text-[10px] text-text-sec border-t border-border-custom/30 pt-3">
              <span>Enter to submit</span>
              <span>{locations.length} / 20 locations maximum</span>
            </div>
          </Card>

          {/* Section 3: Work Preferences */}
          <Card className="bg-[#111827] border border-border-custom/60 p-6 space-y-4 shadow-xl">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F9FAFB]">Work Preferences</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Toggle what workplace requirements you are willing to accept.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Remote Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-border-custom/40">
                <div>
                  <span className="text-xs font-bold text-text-main">Remote Jobs</span>
                  <p className="text-[10px] text-text-sec mt-0.5">Work from anywhere</p>
                </div>
                <button
                  type="button"
                  onClick={() => setRemoteAllowed(!remoteAllowed)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 outline-hidden ${
                    remoteAllowed ? "bg-primary-blue" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${
                      remoteAllowed ? "translate-x-4.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Hybrid Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-border-custom/40">
                <div>
                  <span className="text-xs font-bold text-text-main">Hybrid Jobs</span>
                  <p className="text-[10px] text-text-sec mt-0.5">Split office / home</p>
                </div>
                <button
                  type="button"
                  onClick={() => setHybridAllowed(!hybridAllowed)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 outline-hidden ${
                    hybridAllowed ? "bg-primary-blue" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${
                      hybridAllowed ? "translate-x-4.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Onsite Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950 border border-border-custom/40">
                <div>
                  <span className="text-xs font-bold text-text-main">Onsite Jobs</span>
                  <p className="text-[10px] text-text-sec mt-0.5">Full-time at location</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOnsiteAllowed(!onsiteAllowed)}
                  className={`w-10 h-5.5 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 outline-hidden ${
                    onsiteAllowed ? "bg-primary-blue" : "bg-slate-800"
                  }`}
                >
                  <div
                    className={`bg-white w-3.5 h-3.5 rounded-full shadow-md transform transition-transform duration-300 ${
                      onsiteAllowed ? "translate-x-4.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </Card>

          {/* Section: Country Preference */}
          <Card className="bg-[#111827] border border-border-custom/60 p-6 space-y-4 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-bold text-[#F9FAFB] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-orange-400" />
                  Preferred Country
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">JobScout AI will only show jobs available in your selected country.</p>
              </div>
              {/* Active country badge */}
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400 shrink-0">
                🇮🇳 {preferredCountry}
              </span>
            </div>

            {/* Quick select buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: "🇮🇳 India", value: "India" },
                { label: "🌍 Global / Remote", value: "Global" },
                { label: "🇺🇸 USA", value: "USA" },
                { label: "🇬🇧 UK", value: "UK" },
                { label: "🇦🇺 Australia", value: "Australia" },
              ].map(({ label, value }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPreferredCountry(value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    preferredCountry === value
                      ? "bg-orange-500/15 border-orange-500/40 text-orange-400 shadow-sm shadow-orange-500/10"
                      : "bg-slate-950 border-border-custom/50 text-text-sec hover:border-slate-700 hover:text-text-main"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* India-specific info */}
            {preferredCountry === "India" && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-orange-500/5 border border-orange-500/15">
                <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="text-[11px] text-text-sec leading-relaxed">
                  <p className="font-semibold text-orange-300 mb-1">India Filter Active</p>
                  <p>Scout will search: <span className="text-text-main font-medium">Bangalore · Hyderabad · Pune · Mumbai · Delhi · Noida · Remote India</span></p>
                  <p className="mt-1">Remote jobs available worldwide are also included.</p>
                </div>
              </div>
            )}
          </Card>

          {/* Section 4: Search Settings */}
          <Card className="bg-[#111827] border border-border-custom/60 p-6 space-y-5 shadow-xl">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F9FAFB]">Search Settings</h3>
              <p className="text-xs text-[#9CA3AF] mt-0.5">Set quality bounds for how JobScout AI selects and surfaces opportunities.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              {/* Minimum Match Score Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-text-sec">Minimum Match Score</span>
                  <span className="px-2 py-0.5 rounded bg-blue-950 text-[11px] text-primary-blue border border-blue-500/25 font-bold">
                    {minimumMatchScore}%
                  </span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="95"
                  step="5"
                  value={minimumMatchScore}
                  onChange={(e) => setMinimumMatchScore(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-primary-blue"
                />
                <div className="flex justify-between text-[9px] text-text-sec pt-0.5">
                  <span>50% (Broad)</span>
                  <span>95% (Highly Strict)</span>
                </div>
              </div>

              {/* Jobs Posted Within Dropdown */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-text-sec">Jobs Posted Within</span>
                <select
                  value={jobsAgeDays}
                  onChange={(e) => setJobsAgeDays(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-border-custom rounded-xl text-xs sm:text-sm text-text-main outline-hidden cursor-pointer hover:border-slate-800 transition-colors"
                >
                  <option value="1">Last 24 Hours (Fresh)</option>
                  <option value="3">Last 3 Days</option>
                  <option value="7">Last 7 Days (Standard)</option>
                  <option value="14">Last 14 Days</option>
                  <option value="30">Last 30 Days (Broad)</option>
                </select>
              </div>

              {/* Maximum Jobs Per Day */}
              <div className="space-y-2">
                <span className="block text-xs font-semibold text-text-sec">Maximum Jobs Per Day</span>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={maxDailyJobs}
                  onChange={(e) => setMaxDailyJobs(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-border-custom rounded-xl text-xs sm:text-sm text-text-main placeholder-text-sec outline-hidden focus:border-blue-500/50 transition-colors"
                />
                <span className="block text-[9px] text-text-sec pt-0.5">Limits results to this number per scout run.</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Side: Agent summary & Coming soon */}
        <div className="space-y-6">
          
          {/* Section 5: Automation Summary */}
          <Card className="bg-[#111827] border border-border-custom/60 p-5 shadow-xl relative overflow-hidden group">
            {/* Soft background glows */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-violet-500/5 blur-xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-blue-500/5 blur-xl -z-10"></div>
            
            <div className="flex items-center justify-between border-b border-border-custom/40 pb-3.5">
              <h3 className="text-xs sm:text-sm font-bold text-text-main flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400 animate-pulse" />
                Daily Scout Plan
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-success-green/10 border border-success-green/30 text-[9px] text-success-green font-bold uppercase tracking-wider">
                {roles.length === 0 ? "AI Ready" : `${roles.length} ${roles.length === 1 ? "Role" : "Roles"} Active`}
              </span>
            </div>

            <div className="pt-4 space-y-4.5 text-xs text-text-sec">
              {/* Target Roles summary */}
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-semibold text-text-main block">Target Roles</span>
                  <span className="text-[10px] text-text-sec truncate max-w-[150px] block mt-0.5">
                    {roles.length > 0 ? roles.slice(0, 3).join(", ") : "No target roles configured"}
                  </span>
                </div>
                <Badge score={roles.length} className="scale-85" />
              </div>

              {/* Locations summary */}
              <div className="flex justify-between items-start pt-3 border-t border-border-custom/30">
                <div>
                  <span className="font-semibold text-text-main block">Preferred Locations</span>
                  <span className="text-[10px] text-text-sec truncate max-w-[150px] block mt-0.5">
                    {locations.length > 0 ? locations.slice(0, 3).join(", ") : "No locations configured"}
                  </span>
                </div>
                <Badge variant="blue" className="scale-85">{locations.length}</Badge>
              </div>

              {/* Work Modes */}
              <div className="flex justify-between items-center pt-3 border-t border-border-custom/30">
                <div>
                  <span className="font-semibold text-text-main block">Work Modes Enabled</span>
                  <div className="flex gap-1 mt-1 text-[9px] text-text-sec">
                    {remoteAllowed && <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-border-custom/50">Remote</span>}
                    {hybridAllowed && <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-border-custom/50">Hybrid</span>}
                    {onsiteAllowed && <span className="bg-slate-950 px-1.5 py-0.5 rounded border border-border-custom/50">Onsite</span>}
                  </div>
                </div>
                <Badge variant="green" className="scale-85">{getActiveWorkModesCount()}</Badge>
              </div>

              {/* Country Filter (Phase 5.6) */}
              <div className="flex justify-between items-center pt-3 border-t border-border-custom/30">
                <div>
                  <span className="font-semibold text-text-main block">Country Filter</span>
                  <span className="text-[10px] text-orange-400 flex items-center gap-1 mt-1 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"></span>
                    {preferredCountry === "India" ? "🇮🇳" : preferredCountry === "USA" ? "🇺🇸" : preferredCountry === "UK" ? "🇬🇧" : preferredCountry === "Australia" ? "🇦🇺" : "🌍"} {preferredCountry}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-[9px] text-orange-400 font-bold uppercase tracking-wider">Active</span>
              </div>

              {/* Resume Status */}
              <div className="flex justify-between items-center pt-3 border-t border-border-custom/30">
                <div>
                  <span className="font-semibold text-text-main block">Resume File</span>
                  {uploadingResume ? (
                    <span className="text-[10px] text-primary-blue flex items-center gap-1.5 mt-1 font-semibold animate-pulse">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-blue"></span>
                      Parsing resume...
                    </span>
                  ) : uploadSuccess ? (
                    <span className="text-[10px] text-success-green flex items-center gap-1.5 mt-1 font-semibold animate-bounce">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-green"></span>
                      ✓ Uploaded & Synced!
                    </span>
                  ) : uploadError ? (
                    <span className="text-[10px] text-error-red flex items-center gap-1.5 mt-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-error-red animate-pulse"></span>
                      {uploadError}
                    </span>
                  ) : (
                    <span className="text-[10px] text-success-green flex items-center gap-1.5 mt-1 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-success-green animate-pulse"></span>
                      ✓ Connected & Active
                    </span>
                  )}
                </div>
                <div>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleResumeUpload}
                    accept=".pdf"
                    className="hidden"
                    disabled={uploadingResume}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingResume}
                    className="px-3 py-1.5 bg-slate-900 border border-border-custom hover:border-primary-blue/30 text-[10px] font-bold text-text-sec hover:text-text-main rounded-lg flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Upload PDF
                  </button>
                </div>
              </div>

              {/* Skills & Projects Count */}
              <div className="flex justify-between items-center pt-3 border-t border-border-custom/30">
                <div>
                  <span className="font-semibold text-text-main block">Extracted Profile</span>
                  <div className="flex items-center gap-2.5 mt-1 text-[10px] text-text-sec">
                    <span>Skills: <strong className="text-text-main font-semibold">{profile?.skills?.length || 0}</strong></span>
                    <span className="w-1 h-1 rounded-full bg-border-custom/60"></span>
                    <span>Projects: <strong className="text-text-main font-semibold">{profile?.projects?.length || 0}</strong></span>
                  </div>
                </div>
                <Badge variant="blue" className="scale-85">Active</Badge>
              </div>

              {/* Expected Discovery & Next Scan details */}
              <div className="bg-slate-950/60 p-3.5 rounded-xl border border-border-custom/40 space-y-2.5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="font-medium flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    Expected Discovery:
                  </span>
                  <span className="font-bold text-text-main">
                    {roles.length > 0 ? `${roles.length * 10}–${roles.length * 20} jobs/day` : "0 jobs/day"}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[11px] pt-1.5 border-t border-border-custom/20">
                  <span className="font-medium">High Match Opportunities:</span>
                  <span className="font-bold text-success-green">
                    {roles.length > 0 ? `${Math.ceil(roles.length * 1.5)}–${Math.ceil(roles.length * 3.5)} jobs/day` : "0 jobs/day"}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[10px] text-text-sec pt-1.5 border-t border-border-custom/20">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-text-sec" />
                    Next Scan:
                  </span>
                  <span className="font-semibold text-text-main">Tomorrow 08:00 AM</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Section 5.5: Today's Search Plan */}
          <Card className="bg-[#111827] border border-border-custom/60 p-5 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-blue-500/5 blur-xl -z-10"></div>
            
            <div className="flex items-center justify-between border-b border-border-custom/40 pb-3.5">
              <h3 className="text-xs sm:text-sm font-bold text-text-main flex items-center gap-2">
                <Sliders className="w-4 h-4 text-primary-blue" />
                Today's Search Plan
              </h3>
              <Badge variant="blue" className="scale-90 font-medium">
                {searchPlan.length} Queries
              </Badge>
            </div>

            <p className="text-[10px] text-text-sec mt-3 leading-relaxed">
              JobScout AI will search the web using these generated query combinations:
            </p>

            <div className="space-y-2 mt-3.5 max-h-64 overflow-y-auto pr-1">
              {searchPlan.length > 0 ? (
                searchPlan.map((query, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center gap-2.5 text-xs text-text-sec bg-slate-950/40 border border-border-custom/30 rounded-xl py-2 px-3 hover:border-slate-800 transition-colors animate-scale-in"
                  >
                    <Check className="w-3.5 h-3.5 text-success-green shrink-0" />
                    <span className="font-semibold text-text-main truncate" title={query}>
                      {query}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-4 text-center text-[10px] text-text-sec flex flex-col items-center justify-center gap-1">
                  <span>No search queries planned.</span>
                  <span>Add target roles or locations to generate queries.</span>
                </div>
              )}
            </div>
          </Card>

          {/* Section 6: Future-Proof Section (Coming Soon) */}
          <Card className="bg-[#111827] border border-border-custom/60 p-5 shadow-xl opacity-60 relative overflow-hidden group">
            {/* Absolute lock layout */}
            <div className="absolute inset-0 bg-slate-950/10 backdrop-blur-3xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
              <div className="bg-slate-900 border border-border-custom px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-xs text-text-main shadow-2xl">
                <Lock className="w-3.5 h-3.5 text-violet-400" />
                <span>Premium Features</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-b border-border-custom/40 pb-3">
              <h3 className="text-xs sm:text-sm font-bold text-text-sec flex items-center gap-2">
                <Lock className="w-4 h-4 text-text-sec/60" />
                Coming Soon
              </h3>
              <span className="text-[9px] text-text-sec bg-slate-950 px-2 py-0.5 rounded border border-border-custom/50 uppercase font-bold tracking-wider">
                Roadmap
              </span>
            </div>

            <div className="pt-3.5 space-y-3 text-xs text-text-sec">
              <div className="flex items-center gap-2.5">
                <input type="checkbox" disabled className="rounded border-border-custom bg-slate-950 accent-violet-500 cursor-not-allowed" />
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 opacity-60" />
                  Email Alerts
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <input type="checkbox" disabled className="rounded border-border-custom bg-slate-950 accent-violet-500 cursor-not-allowed" />
                <span className="flex items-center gap-1.5">
                  <MessageSquareCode className="w-3.5 h-3.5 opacity-60" />
                  WhatsApp Alerts
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <input type="checkbox" disabled className="rounded border-border-custom bg-slate-950 accent-violet-500 cursor-not-allowed" />
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 opacity-60" />
                  Auto Apply
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <input type="checkbox" disabled className="rounded border-border-custom bg-slate-950 accent-violet-500 cursor-not-allowed" />
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 opacity-60" />
                  Interview Tracking
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile Save Action (Sticky Bottom Bar) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 p-4 bg-slate-950/80 backdrop-blur-md border-t border-border-custom z-40">
        <Button 
          variant="primary"
          onClick={handleSavePreferences}
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 text-xs font-bold cursor-pointer py-3.5"
        >
          {saving ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
              Saving...
            </>
          ) : saveStatus === "success" ? (
            <>
              <Check className="w-4 h-4" />
              Preferences Updated
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Preferences
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
