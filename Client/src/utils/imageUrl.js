const PLACEHOLDER = 'https://placehold.co/300x400?text=No+Image'

export function optimizeImage(url, width = 400) {
  if (!url || !url.includes('cloudinary.com')) return url || PLACEHOLDER
  return url.replace('/upload/', `/upload/w_${width},q_auto,f_auto/`)
}
