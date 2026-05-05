import { supabase } from "../lib/supabaseClient";

export async function updateAuthCredentials({ email, password, fullName, gender }) {
  const updateData = {};
  if (email) updateData.email = email;
  if (password) updateData.password = password;

  const metadata = {};
  if (fullName !== undefined) metadata.full_name = fullName;
  if (gender !== undefined) metadata.gender = gender;

  if (Object.keys(metadata).length > 0) {
    updateData.data = metadata;
  }

  const { data, error } = await supabase.auth.updateUser(updateData);
  if (error) throw error;
  return data;
}
