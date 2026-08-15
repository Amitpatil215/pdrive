export type MediaKind = "image" | "video";

export type UserRow = {
  id: string;
  email: string;
  password: string;
};

export type SessionRow = {
  id: string;
  user_id: string;
  expires_at: string;
};

export type MediaRow = {
  id: string;
  user_id: string;
  r2_key: string;
  filename: string;
  content_type: string;
  kind: MediaKind;
  size_bytes: number;
  created_at: string;
};

export type MediaItem = {
  id: string;
  filename: string;
  contentType: string;
  kind: MediaKind;
  sizeBytes: number;
  createdAt: string;
  url: string;
};
