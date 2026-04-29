const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const ALLOWED_UPLOAD_BUCKETS = new Set([
  "public-site",
  "solution-media",
  "raw-uploads",
  "research-private",
]);
const PUBLIC_BUCKETS = new Set([
  "public-site",
  "solution-media",
  "derived-media",
]);
const VALID_VISIBILITIES = new Set([
  "private",
  "internal",
  "public",
]);
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}
export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim());
}
export function sanitizeFileName(fileName: string): string {
  const cleaned = fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return cleaned || `upload-${crypto.randomUUID()}`;
}
export function sanitizePathSegment(value: string): string {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9/_-]+/g, "-")
    .replace(/\/+/g, "/")
    .replace(/^\/+|\/+$/g, "");
}
export function buildUploadPath(
  userId: string,
  fileName: string,
  folder?: string,
): string {
  const dateFolder = new Date().toISOString().slice(0, 10);
  const safeFolder = sanitizePathSegment(folder || `${userId}/${dateFolder}`);
  const safeName = sanitizeFileName(fileName);
  return `${safeFolder}/${crypto.randomUUID()}-${safeName}`;
}
export function isAllowedUploadBucket(bucketName: string): boolean {
  return ALLOWED_UPLOAD_BUCKETS.has(bucketName);
}
export function isPublicBucket(bucketName: string): boolean {
  return PUBLIC_BUCKETS.has(bucketName);
}
export function isValidVisibility(value: string): boolean {
  return VALID_VISIBILITIES.has(value);
}
export function parseBoolean(value: unknown, fallback = false): boolean {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "off", ""].includes(normalized)) return false;
  }
  if (typeof value === "number") return value === 1;
  return fallback;
}
