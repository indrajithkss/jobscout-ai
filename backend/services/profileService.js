const { supabase } =
require("../config/supabase");

const saveProfile = async (
  profile,
  resumeText
) => {

  const { data, error } =
    await supabase
      .from("candidate_profiles")
      .insert([
        {
          name: profile.name,
          email: profile.email,
          phone: profile.phone,
          skills: profile.skills,
          projects: profile.projects,
          education: profile.education,
          experience: profile.experience,
          resume_text: resumeText,
        },
      ])
      .select();

  if (error) {
    throw error;
  }

  return data[0];
};
const getLatestProfile = async () => {

  const { data, error } =
    await supabase
      .from("candidate_profiles")
      .select("*")
      .order("created_at", {
        ascending: false,
      })
      .limit(1);

  if (error) {
    throw error;
  }

  return data[0];
};

module.exports = {
  saveProfile,
  getLatestProfile,
};