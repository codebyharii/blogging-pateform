import { createClient as createServerClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { UserProfile, UserRole } from "@/lib/types";

export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data.user) {
    return null;
  }

  return data.user;
}

export async function getCurrentProfile(): Promise<UserProfile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const { data, error } = await getSupabaseAdmin()
    .from("users")
    .select("id,name,email,role,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return data as UserProfile;
}

export async function hasRole(allowedRoles: UserRole[]): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (!profile) {
    return false;
  }
  return allowedRoles.includes(profile.role);
}

