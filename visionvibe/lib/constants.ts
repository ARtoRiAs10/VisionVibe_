export const THEMES: { [key: string]: string[] } = {
  "Celebration": ["Birthday Party", "Anniversary", "Holiday Party", "New Year's Eve"],
  "Lifestyle": ["Minimalist", "Bohemian", "Modern", "Industrial", "Coastal"],
  "Fantasy": ["Sci-Fi", "Fairy Tale", "Steampunk", "Cyberpunk"],
  "Seasonal": ["Spring Bloom", "Summer Beach", "Autumn Harvest", "Winter Wonderland"],
};

export const BUDGETS: string[] = [
  "Under $500",
  "$500 - $2,000",
  "$2,000 - $10,000",
  "$10,000+",
  "Unlimited"
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
