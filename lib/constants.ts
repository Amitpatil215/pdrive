export const COOKIE_NAME = "drive_session";
export const SESSION_DAYS = 7;
export const PRESIGN_GET_SECONDS = 60 * 60;
export const PRESIGN_PUT_SECONDS = 60 * 60;
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024 * 1024;

export const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export type AllowedType = (typeof ALLOWED_TYPES)[number];
