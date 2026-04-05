/**
 * Super Senior Utility Helpers
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || "https://appifyproject.onrender.com";

export const getAvatarUrl = (avatar?: string, firstName?: string) => {
  if (avatar && avatar.startsWith("http")) return avatar;
  if (avatar) {
    const cleanPath = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    return `${API_BASE_URL}/${cleanPath}`;
  }
  
  // Fallback to high-quality cartoon avatar from DiceBear
  const seed = firstName || "fallback";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

export const getPostImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${API_BASE_URL}/${cleanPath}`;
};
