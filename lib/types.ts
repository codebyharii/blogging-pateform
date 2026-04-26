export type UserRole = "viewer" | "author" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}

export interface PostRecord {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  author_id: string;
  summary: string;
  created_at: string;
  updated_at?: string;
}

export interface CommentRecord {
  id: string;
  post_id: string;
  user_id: string;
  comment_text: string;
  created_at: string;
}

export interface ApiErrorShape {
  success: false;
  message: string;
  code: string;
}

export const ALLOWED_ROLES: UserRole[] = ["viewer", "author", "admin"];
