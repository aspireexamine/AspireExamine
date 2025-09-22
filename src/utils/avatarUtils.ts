// Cartoon avatar URLs - using only cartoon face styles from DiceBear API
const CARTOON_AVATARS = [
  // Using DiceBear API with cartoon face styles only
  'https://api.dicebear.com/7.x/avataaars/svg?seed=',
  'https://api.dicebear.com/7.x/personas/svg?seed=',
  'https://api.dicebear.com/7.x/notionists/svg?seed=',
  'https://api.dicebear.com/7.x/micah/svg?seed=',
  'https://api.dicebear.com/7.x/bottts/svg?seed=',
  'https://api.dicebear.com/7.x/croodles/svg?seed=',
  'https://api.dicebear.com/7.x/lorelei/svg?seed=',
  'https://api.dicebear.com/7.x/pixel-art/svg?seed=',
  'https://api.dicebear.com/7.x/adventurer/svg?seed=',
  'https://api.dicebear.com/7.x/big-smile/svg?seed=',
  'https://api.dicebear.com/7.x/fun-emoji/svg?seed=',
  'https://api.dicebear.com/7.x/lorelei-neutral/svg?seed=',
];

/**
 * Generates a cartoon avatar URL for a user based on their ID
 * @param userId - The user's unique ID
 * @returns A cartoon avatar URL
 */
export function getCartoonAvatar(userId: string): string {
  // Use the user ID to consistently select the same avatar style
  const avatarIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % CARTOON_AVATARS.length;
  const baseUrl = CARTOON_AVATARS[avatarIndex];
  
  // Use the user ID as the seed to ensure consistency
  return `${baseUrl}${encodeURIComponent(userId)}`;
}

/**
 * Gets a random cartoon avatar (for cases where you want true randomness)
 * @param userId - The user's unique ID (used as seed)
 * @returns A random cartoon avatar URL
 */
export function getRandomCartoonAvatar(userId: string): string {
  const randomIndex = Math.floor(Math.random() * CARTOON_AVATARS.length);
  const baseUrl = CARTOON_AVATARS[randomIndex];
  
  return `${baseUrl}${encodeURIComponent(userId)}`;
}
