import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import AICopilot from "./pages/AICopilot";
import Jobs from "./pages/Jobs";
import SavedJobs from "./pages/SavedJobs";
import AppliedJobs from "./pages/AppliedJobs";
import Analytics from "./pages/Analytics";
import JobPreferences from "./pages/JobPreferences";
import CareerHub from "./pages/CareerHub";
import { ROUTES } from "./constants/routes";
 
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Reusable Layout wrapper for nested routing */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          {/* Use route constants directly to avoid hardcoded values */}
          <Route path={ROUTES.CAREER_HUB.replace("/", "")} element={<CareerHub />} />
          <Route path={ROUTES.COPILOT.replace("/", "")} element={<AICopilot />} />
          <Route path={ROUTES.PREFERENCES.replace("/", "")} element={<JobPreferences />} />
          <Route path={ROUTES.JOBS.replace("/", "")} element={<Jobs />} />
          <Route path={ROUTES.SAVED.replace("/", "")} element={<SavedJobs />} />
          <Route path={ROUTES.APPLIED.replace("/", "")} element={<AppliedJobs />} />
          <Route path={ROUTES.ANALYTICS.replace("/", "")} element={<Analytics />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;