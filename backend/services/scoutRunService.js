const { supabase } = require("../config/supabase");

/**
 * Inserts a new scout scan execution metric record into scout_runs table.
 * Fallback mechanism handles missing database columns gracefully.
 * 
 * @param {Object} metrics
 * @param {number} metrics.jobsFound
 * @param {number} metrics.highMatches
 * @param {number} metrics.averageScore
 * @param {number} metrics.indiaJobsFound
 * @param {string} [metrics.status] "success" or "failed"
 * @param {number} [metrics.scanDuration] duration of scan in seconds
 * @param {string|null} [metrics.errorMessage] error trace if failed
 * @param {Object} [metrics.sourceBreakdown] source platforms & API provider breakdown
 * @returns {Promise<Object|null>} The saved record or null
 */
async function insertScoutRun({ jobsFound, highMatches, averageScore, indiaJobsFound, status, scanDuration, errorMessage, sourceBreakdown }) {
  try {
    const payload = {
      jobs_found: jobsFound || 0,
      high_matches: highMatches || 0,
      average_score: averageScore || 0,
      india_jobs_found: indiaJobsFound || 0,
      status: status || "success",
      scan_duration: scanDuration || 0,
      error_message: errorMessage || null,
      source_breakdown: sourceBreakdown || {},
    };

    console.log("[ScoutRunService] Logging scout execution history with health metrics & diagnostics:", payload);

    const { data, error } = await supabase
      .from("scout_runs")
      .insert(payload)
      .select();

    if (error) {
      // Check if it's a missing columns error (PGRST204 or 42703)
      const isMissingColumns = error.message && (
        error.message.includes("status") ||
        error.message.includes("scan_duration") ||
        error.message.includes("error_message") ||
        error.message.includes("source_breakdown") ||
        error.message.includes("column") ||
        error.code === "PGRST204" ||
        error.code === "42703"
      );

      if (isMissingColumns) {
        console.warn("[ScoutRunService] Automation health or diagnostics columns missing in Supabase. Retrying legacy schema insert...");
        
        const legacyPayload = {
          jobs_found: jobsFound || 0,
          high_matches: highMatches || 0,
          average_score: averageScore || 0,
          india_jobs_found: indiaJobsFound || 0,
        };

        const { data: legacyData, error: legacyError } = await supabase
          .from("scout_runs")
          .insert(legacyPayload)
          .select();

        if (legacyError) {
          console.error("[ScoutRunService] Legacy insert fallback failed:", legacyError.message);
          return null;
        }

        console.log("[ScoutRunService] Legacy insert fallback successful.");
        return (legacyData && legacyData.length > 0) ? legacyData[0] : null;
      }

      console.error("[ScoutRunService] Gracefully handled error inserting scout run:", error.message || error);
      return null;
    }

    return (data && data.length > 0) ? data[0] : null;
  } catch (err) {
    console.error("[ScoutRunService] Gracefully handled unexpected error inserting scout run:", err.message || err);
    return null;
  }
}

/**
 * Retrieves the latest scout execution run.
 * 
 * @returns {Promise<Object|null>} The latest scout run record or null
 */
async function getLatestScoutRun() {
  try {
    const { data, error } = await supabase
      .from("scout_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[ScoutRunService] Error getting latest scout run:", error.message || error);
      return null;
    }

    return (data && data.length > 0) ? data[0] : null;
  } catch (err) {
    console.error("[ScoutRunService] Unexpected error getting latest scout run:", err.message || err);
    return null;
  }
}

/**
 * Retrieves the latest scout execution run completed today.
 * 
 * @returns {Promise<Object|null>} Today's latest scout run record or null
 */
async function getTodayScoutRun() {
  try {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data, error } = await supabase
      .from("scout_runs")
      .select("*")
      .gte("created_at", startOfToday.toISOString())
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("[ScoutRunService] Error getting today's scout run:", error.message || error);
      return null;
    }

    return (data && data.length > 0) ? data[0] : null;
  } catch (err) {
    console.error("[ScoutRunService] Unexpected error getting today's scout run:", err.message || err);
    return null;
  }
}

/**
 * Retrieves weekly history of scout runs (past 7 days).
 * 
 * @returns {Promise<Array>} List of scout run records from past 7 days
 */
async function getWeeklyScoutHistory() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data, error } = await supabase
      .from("scout_runs")
      .select("*")
      .gte("created_at", sevenDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ScoutRunService] Error getting weekly scout history:", error.message || error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[ScoutRunService] Unexpected error getting weekly scout history:", err.message || err);
    return [];
  }
}

/**
 * Retrieves monthly history of scout runs (past 30 days).
 * 
 * @returns {Promise<Array>} List of scout run records from past 30 days
 */
async function getMonthlyScoutHistory() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from("scout_runs")
      .select("*")
      .gte("created_at", thirtyDaysAgo.toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[ScoutRunService] Error getting monthly scout history:", error.message || error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[ScoutRunService] Unexpected error getting monthly scout history:", err.message || err);
    return [];
  }
}

/**
 * Retrieves a history of scout execution runs up to a limit.
 * 
 * @param {number} limit Number of historical runs to fetch
 * @returns {Promise<Array>} List of scout run records
 */
async function getScoutHistory(limit = 10) {
  try {
    const { data, error } = await supabase
      .from("scout_runs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[ScoutRunService] Error getting scout run history:", error.message || error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error("[ScoutRunService] Unexpected error getting scout run history:", err.message || err);
    return [];
  }
}

module.exports = {
  insertScoutRun,
  getLatestScoutRun,
  getTodayScoutRun,
  getWeeklyScoutHistory,
  getMonthlyScoutHistory,
  getScoutHistory,
};
