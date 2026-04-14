import { supabase } from "../lib/supabaseClient";

export async function updateAuthCredentials({ email, password }) {

    const updateData = {};
    if (email) updateData.email = email;
    if (password) updateData.password = password;

    const { data, error } = await supabase.auth.updateUser(updateData);
    if (error) throw error;
    return data;
};