/**
 * Super Senior Utility Helpers
 */

export const getAvatarUrl = (avatar?: string, firstName?: string) => {
  if (avatar && avatar.startsWith("http")) return avatar;
  if (avatar) {
    const cleanPath = avatar.startsWith("/") ? avatar.slice(1) : avatar;
    return `http://localhost:5000/${cleanPath}`;
  }
  
  // Fallback to high-quality cartoon avatar from DiceBear
  const seed = firstName || "fallback";
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
};

export const getPostImageUrl = (path?: string) => {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `http://localhost:5000/${cleanPath}`;
};
