const { supabase } = require("../config/supabase");
const fs = require("fs");
const path = require("path");
const { getLatestProfile } = require("../services/profileService");
const { generateQueries } = require("../services/queryGenerator");

const PREF_FILE = path.join(__dirname, "../utils/preferences.json");

const savePreferences = async (req, res) => {
  try {
    const {
      target_roles,
      preferred_locations,
      remote_allowed,
      preferred_country,
      minimum_match_score,
      jobs_age_days,
      max_daily_jobs,
    } = req.body;

    // 1. Fetch latest preferences record to implement UPSERT
    const { data: existingData, error: fetchError } = await supabase
      .from("job_preferences")
      .select("id")
      .order("created_at", { ascending: false })
      .limit(1);

    if (fetchError) {
      throw fetchError;
    }

    let supabaseRecord;

    if (existingData && existingData.length > 0) {
      // Update existing record
      const { data, error } = await supabase
        .from("job_preferences")
        .update({
          target_roles,
          preferred_locations,
          remote_allowed,
        })
        .eq("id", existingData[0].id)
        .select();

      if (error) {
        throw error;
      }
      supabaseRecord = data[0];
    } else {
      // Insert new record
      const { data, error } = await supabase
        .from("job_preferences")
        .insert([
          {
            target_roles,
            preferred_locations,
            remote_allowed,
          },
        ])
        .select();

      if (error) {
        throw error;
      }
      supabaseRecord = data[0];
    }

    // Merge and save all preferences (including search settings) locally
    const mergedPreferences = {
      id: supabaseRecord.id,
      target_roles: target_roles || [],
      preferred_locations: preferred_locations || [],
      remote_allowed: remote_allowed !== undefined ? remote_allowed : true,
      preferred_country: preferred_country || "India",
      minimum_match_score: minimum_match_score !== undefined ? Number(minimum_match_score) : 70,
      jobs_age_days: jobs_age_days !== undefined ? Number(jobs_age_days) : 7,
      max_daily_jobs: max_daily_jobs !== undefined ? Number(max_daily_jobs) : 50,
      created_at: supabaseRecord.created_at,
    };

    // Save to local file for future n8n automation accessibility
    fs.mkdirSync(path.dirname(PREF_FILE), { recursive: true });
    fs.writeFileSync(PREF_FILE, JSON.stringify(mergedPreferences, null, 2));

    const profile = await getLatestProfile().catch(() => null);
    const searchPlan = generateQueries(profile, mergedPreferences);

    res.json({
      success: true,
      preferences: mergedPreferences,
      searchPlan,
    });

  } catch (error) {
    console.error("Save Preferences Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const getPreferences = async (req, res) => {
  try {
    const profile = await getLatestProfile().catch(() => null);

    // Attempt to load from local file first (contains all parameters)
    if (fs.existsSync(PREF_FILE)) {
      const fileData = fs.readFileSync(PREF_FILE, "utf-8");
      const preferences = JSON.parse(fileData);
      const searchPlan = generateQueries(profile, preferences);
      return res.json({
        success: true,
        preferences,
        searchPlan,
      });
    }

    // Fallback to Supabase if file does not exist
    const { data, error } = await supabase
      .from("job_preferences")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      throw error;
    }

    if (data && data.length > 0) {
      const dbPrefs = data[0];
      const preferences = {
        id: dbPrefs.id,
        target_roles: dbPrefs.target_roles || [],
        preferred_locations: dbPrefs.preferred_locations || [],
        remote_allowed: dbPrefs.remote_allowed !== undefined ? dbPrefs.remote_allowed : true,
        preferred_country: dbPrefs.preferred_country || "India",
        minimum_match_score: 70,
        jobs_age_days: 7,
        max_daily_jobs: 50,
        created_at: dbPrefs.created_at,
      };
      const searchPlan = generateQueries(profile, preferences);
      return res.json({
        success: true,
        preferences,
        searchPlan,
      });
    }

    res.json({
      success: true,
      preferences: null,
      searchPlan: [],
    });

  } catch (error) {
    console.error("Get Preferences Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

const previewSearchPlan = async (req, res) => {
  try {
    const { target_roles, preferred_locations, remote_allowed, preferred_country } = req.body;
    const profile = await getLatestProfile().catch(() => null);
    const searchPlan = generateQueries(profile, {
      target_roles: target_roles || [],
      preferred_locations: preferred_locations || [],
      remote_allowed: remote_allowed !== undefined ? remote_allowed : true,
      preferred_country: preferred_country || "India",
    });

    res.json({
      success: true,
      searchPlan,
    });
  } catch (error) {
    console.error("Preview Search Plan Error:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

module.exports = {
  savePreferences,
  getPreferences,
  previewSearchPlan,
};