/**
 * Design catalogue + prompt engine.
 *
 * The quality of the generated image is dominated by how precisely the
 * user's selections (theme / style / budget / room type / lighting) are
 * translated into concrete visual language. Every selection is mapped to
 * concrete descriptors: palettes, materials, furniture density, lighting
 * and camera language.
 */

export const THEMES: Record<string, string[]> = {
  Celebration: [
    "Birthday Party",
    "Anniversary",
    "Holiday Party",
    "New Year's Eve",
    "Wedding Reception",
  ],
  Lifestyle: [
    "Minimalist",
    "Bohemian",
    "Modern",
    "Industrial",
    "Coastal",
    "Scandinavian",
    "Mid-Century Modern",
    "Japandi",
  ],
  Fantasy: ["Sci-Fi", "Fairy Tale", "Steampunk", "Cyberpunk", "Art Deco", "Medieval"],
  Seasonal: [
    "Spring Bloom",
    "Summer Beach",
    "Autumn Harvest",
    "Winter Wonderland",
  ],
  Workspace: ["Home Office", "Creative Studio", "Co-Working Lounge", "Library"],
  Wellness: ["Spa Bathroom", "Yoga & Meditation", "Greenhouse Nook"],
  Kids: ["Playful Nursery", "Creative Playroom", "Cozy Kids Bedroom"],
  Rustic: ["Farmhouse", "Cottagecore", "Cabin", "Mediterranean"],
};

/** Theme level art direction (palette / mood / signature elements). */
export const THEME_PROFILES: Record<
  string,
  { mood: string; palette: string[]; accents: string; elements: string; texture: string }
> = {
  Celebration: {
    mood: "joyful, festive, inviting, celebratory",
    palette: ["warm gold", "champagne", "rich berry", "ivory", "deep plum"],
    accents: "gold leaf accents, metallic balloons, confetti garlands, candles, bunting",
    elements:
      "a styled dessert table, string lights, festive table settings, cake display, celebratory floral arrangements",
    texture: "velvet, satin, glitter, metallic foil",
  },
  Lifestyle: {
    mood: "curated, calm, intentional, lived-in",
    palette: ["warm white", "oat", "sand", "charcoal", "sage", "terracotta"],
    accents: "linen textiles, ceramic vessels, greenery, framed art, textured throw pillows",
    elements:
      "a considered seating arrangement, coffee table styling, layered rug, houseplants, art gallery wall",
    texture: "linen, oak, ceramic, wool, rattan",
  },
  Fantasy: {
    mood: "otherworldly, immersive, dramatic",
    palette: ["midnight blue", "violet", "cyan glow", "antique gold", "obsidian"],
    accents: "emissive neon accents, holographic panels, floating light orbs, rune etchings",
    elements:
      "futuristic furniture, ambient glow lighting, portal-like architectural details, sculptural forms",
    texture: "brushed metal, iridescent glass, carbon fibre, velvet",
  },
  Seasonal: {
    mood: "fresh, atmospheric, evocative of the season",
    palette: ["seasonal pastels", "earth tones", "evergreen", "snow white", "autumn amber"],
    accents: "seasonal florals, foliage, natural textures, warm or cool seasonal light",
    elements: "season-appropriate styling, natural materials, window light matching the season",
    texture: "wool, linen, pine, stone, dried botanicals",
  },
  Workspace: {
    mood: "focused, productive, refined",
    palette: ["charcoal", "walnut", "ivory", "forest green", "brass"],
    accents: "brushed brass fittings, matte black hardware, leather, organised storage",
    elements:
      "a large desk, ergonomic seating, bookshelves, task lighting, cable management, pinboard",
    texture: "walnut veneer, leather, brass, linen",
  },
  Wellness: {
    mood: "restorative, serene, spa-like",
    palette: ["soft sage", "sand", "foggy white", "clay", "warm stone"],
    accents: "bamboo, stone, water elements, towel rolls, essential oil diffusers",
    elements: "a low bench, candles, plants, natural stone surfaces, soft layered lighting",
    texture: "travertine, bamboo, linen, wicker, water",
  },
  Kids: {
    mood: "playful, bright, imaginative",
    palette: ["sky blue", "sunshine yellow", "mint", "coral", "cream"],
    accents: "colourful cushions, soft foam, wooden toys, playful wall art",
    elements: "a toy display, low shelving, a reading nook, bright rug, playful lighting",
    texture: "felt, cotton, soft wood, foam",
  },
  Rustic: {
    mood: "warm, handcrafted, timeless",
    palette: ["weathered wood", "terracotta", "cream", "olive", "stone"],
    accents: "reclaimed timber, hand-thrown pottery, woven baskets, linen curtains",
    elements: "a farmhouse table, open shelving with ceramics, stone walls, dried flowers",
    texture: "rough wood, lime plaster, linen, stoneware",
  },
};

/** Style (sub-theme) level art direction. */
export const SUBTHEME_PROFILES: Record<
  string,
  { descriptors: string; materials: string; furniture: string; lighting: string; vibe: string }
> = {
  "Birthday Party": {
    descriptors: "cheerful pastel bunting, balloon arch, candy-coloured tableware, confetti",
    materials: "paper decorations, felt banners, glossy balloons, bright cotton linens",
    furniture: "a party table, a dessert display, lightweight folding chairs with cushions",
    lighting: "warm festive string lights with a soft key light",
    vibe: "playful and celebratory",
  },
  Anniversary: {
    descriptors: "romantic florals, candlelight, elegant table setting, subtle rose petals",
    materials: "silk ribbons, brass candlesticks, fine china, velvet",
    furniture: "a bistro set for two, a tufted bench, a slim console table",
    lighting: "candlelit with warm dimmed ambient glow",
    vibe: "romantic and intimate",
  },
  "Holiday Party": {
    descriptors: "evergreen garlands, warm fairy lights, red and gold accents, festive table",
    materials: "pine, wool throws, metallic baubles, glass ornaments",
    furniture: "a long dining table, a sideboard with drinks, a lounge corner",
    lighting: "warm layered lighting, candle glow, fairy-light ambience",
    vibe: "festive and heartwarming",
  },
  "New Year's Eve": {
    descriptors: "champagne, midnight blue, gold glitter, confetti and clock motifs",
    materials: "mirrored surfaces, metallic confetti, glassware, sequins",
    furniture: "a cocktail table, a bar cart, velvet lounge seating",
    lighting: "dramatic moody lighting with golden highlights",
    vibe: "glamorous and electric",
  },
  "Wedding Reception": {
    descriptors: "floral arches, draped fabric, candle hurricanes, elegant place settings",
    materials: "silk draping, ivory linen, fresh blooms, crystal glassware",
    furniture: "banquet tables, chiavari chairs, a sweetheart table",
    lighting: "soft warm candlelight, fairy-light canopy",
    vibe: "romantic and refined",
  },
  Minimalist: {
    descriptors: "clean lines, uncluttered surfaces, monochrome neutrals, negative space",
    materials: "matte white plaster, pale oak, matte black steel, linen",
    furniture: "one low modular sofa, a slim side table, concealed storage",
    lighting: "soft diffused daylight and discreet recessed lighting",
    vibe: "calm and minimal",
  },
  Bohemian: {
    descriptors: "layered textiles, rattan, macramé, plants, eclectic global accents",
    materials: "jute, rattan, cane, kilim wool, terracotta",
    furniture: "floor cushions, a low rattan chair, a rattan pendant, layered rugs",
    lighting: "warm lantern light and plants casting soft shadows",
    vibe: "free-spirited and warm",
  },
  Modern: {
    descriptors: "sleek geometry, sculptural forms, statement lighting, concrete and glass",
    materials: "polished concrete, smoked glass, matte lacquer, walnut veneer",
    furniture: "a sculptural sofa, a monolithic coffee table, a linear kitchen island",
    lighting: "recessed strips, a linear pendant, architectural spotlights",
    vibe: "sleek and architectural",
  },
  Industrial: {
    descriptors: "exposed brick, steel beams, factory pendants, visible ducting",
    materials: "raw brick, blackened steel, reclaimed timber, leather",
    furniture: "a leather Chesterfield sofa, pipe shelving, a steel-frame table",
    lighting: "Edison filament bulbs, cage pendants, high-bay fixtures",
    vibe: "raw and utilitarian",
  },
  Coastal: {
    descriptors: "nautical stripes, driftwood, rope, seagrass, airy blue and sand tones",
    materials: "whitewashed wood, woven jute, linen, rope, glass",
    furniture: "a slipcovered sofa, a driftwood console, wicker baskets",
    lighting: "bright airy daylight, sheer linen curtains",
    vibe: "relaxed and breezy",
  },
  Scandinavian: {
    descriptors: "light oak, soft textiles, simple forms, warm neutral palette",
    materials: "pale oak, wool, ceramic, sheepskin, white-painted wood",
    furniture: "a tapered-leg sofa, a light wood coffee table, simple shelving",
    lighting: "bright, soft, diffused natural light with warm lamps",
    vibe: "bright, cosy and functional",
  },
  "Mid-Century Modern": {
    descriptors: "tapered legs, organic curves, teak, mustard and olive accents",
    materials: "walnut and teak veneer, wool, leather, brass",
    furniture: "a sculpted armchair, a tapered-leg sideboard, a star-base lounge chair",
    lighting: "a globe floor lamp, a sculptural pendant",
    vibe: "retro and characterful",
  },
  Japandi: {
    descriptors: "zen simplicity, natural asymmetry, wabi-sabi, muted earth tones",
    materials: "paper, raw oak, linen, clay, stone, bamboo",
    furniture: "low tatami-level seating, a paper pendant lamp, a minimal low table",
    lighting: "soft diffused paper lanterns, gentle daylight",
    vibe: "serene and restrained",
  },
  "Sci-Fi": {
    descriptors: "curved white surfaces, LED strips, holographic screens, starfield windows",
    materials: "white composite panels, chrome, blue-tinted glass, carbon fibre",
    furniture: "a cantilevered chair, a floating console, a sculptural sofa",
    lighting: "cyan and violet LED accents, soft ambient glow",
    vibe: "futuristic and clean",
  },
  "Fairy Tale": {
    descriptors: "soft pastels, ornate gold, drapery, enchanted garden light",
    materials: "silk, gilded wood, crystal, embroidered velvet",
    furniture: "a carved canopy bed, an ornate vanity, curved gilded chairs",
    lighting: "warm diffused glow, firelight, floating sparkles",
    vibe: "dreamlike and enchanting",
  },
  Steampunk: {
    descriptors: "brass pipework, riveted panels, oiled leather, Victorian patterns",
    materials: "aged brass, copper, riveted iron, dark wood, leather",
    furniture: "a tufted leather armchair, brass pipe shelving, a mechanical desk",
    lighting: "warm gaslight and filament bulbs",
    vibe: "brass, machinery and Victorian romance",
  },
  Cyberpunk: {
    descriptors: "neon signage, wet reflective floors, dense tech, magenta and cyan",
    materials: "wet asphalt, chrome, holographic film, carbon composite",
    furniture: "a modular cyber seating pod, a data wall, a vending unit",
    lighting: "magenta and cyan neon, volumetric haze",
    vibe: "neon-drenched and futuristic",
  },
  "Art Deco": {
    descriptors: "geometric symmetry, gold leaf, chevrons, lacquer, opulent glamour",
    materials: "lacquered wood, brass, marble, velvet, mirrored glass",
    furniture: "a curved velvet sofa, a sunburst console, a marble dining table",
    lighting: "sconces and a gold chandelier, warm glow",
    vibe: "glamorous and symmetrical",
  },
  Medieval: {
    descriptors: "stone arches, heavy timber, wrought iron, tapestries, candlelight",
    materials: "rough stone, oak, wrought iron, wool tapestry, leather",
    furniture: "a trestle table, a high-backed bench, iron candle stands",
    lighting: "candles and hearth firelight",
    vibe: "historic and grounded",
  },
  "Spring Bloom": {
    descriptors: "blossom branches, pastel florals, fresh green, light airy fabrics",
    materials: "light linen, wicker, glazed ceramic, fresh greenery",
    furniture: "a light bistro set, a floral bench, an open window seat",
    lighting: "fresh bright daylight, soft pastel bounce",
    vibe: "fresh and optimistic",
  },
  "Summer Beach": {
    descriptors: "sun-bleached tones, rattan, blue and white stripes, ocean light",
    materials: "rattan, canvas, rope, teak, seagrass",
    furniture: "a low rattan lounge, a teak deck bench, a canvas hammock chair",
    lighting: "bright golden-hour sunlight",
    vibe: "sunny and relaxed",
  },
  "Autumn Harvest": {
    descriptors: "warm amber, pumpkins, dried foliage, layered textiles, copper",
    materials: "wool, leather, wood, dried botanicals, brass",
    furniture: "a tufted leather chair, a heavy oak table, woven baskets",
    lighting: "warm low golden light",
    vibe: "warm and cosy",
  },
  "Winter Wonderland": {
    descriptors: "frosted glass, snow whites, evergreens, icy blues, warm fireplace",
    materials: "wool, frosted glass, pine, velvet, brushed steel",
    furniture: "a deep armchair by a fireplace, a heavy oak dresser, plush throws",
    lighting: "cool daylight with warm firelight contrast",
    vibe: "cosy and crisp",
  },
  "Home Office": {
    descriptors: "focused desk setup, organised shelving, task lighting, cable-free",
    materials: "walnut, matte black steel, leather, brass, linen",
    furniture: "a sit-stand desk, an ergonomic chair, a pegboard, a filing cabinet",
    lighting: "adjustable task lamp plus soft ambient fill",
    vibe: "focused and professional",
  },
  "Creative Studio": {
    descriptors: "moodboard wall, easel, material samples, colour swatches, creative clutter",
    materials: "plywood, steel, paper, canvas, concrete",
    furniture: "a large work table, an easel, a plan chest, a rolling cart",
    lighting: "north-facing window light plus studio lamps",
    vibe: "energetic and tactile",
  },
  "Co-Working Lounge": {
    materials: "concrete, timber, felt panels, greenery, glass",
    descriptors: "booth pods, long shared tables, acoustic felt, communal plants",
    furniture: "clustered desks, lounge poufs, acoustic booths",
    lighting: "linear pendants, daylight, task lighting",
    vibe: "social and productive",
  },
  Library: {
    descriptors: "floor-to-ceiling bookshelves, reading lamps, ladder, leather armchairs",
    materials: "dark oak, brass, leather, marble, wool",
    furniture: "a leather wingback chair, a reading table, a rolling ladder",
    lighting: "warm green-shaded library lamps",
    vibe: "quiet and scholarly",
  },
  "Spa Bathroom": {
    descriptors: "stone soaking tub, floating vanity, folded towels, candles",
    materials: "travertine, teak, matte black tapware, linen, bamboo",
    furniture: "a freestanding tub, a floating oak vanity, a slatted bench",
    lighting: "soft indirect warm lighting, candles",
    vibe: "serene and spa-like",
  },
  "Yoga & Meditation": {
    descriptors: "sunken platform, floor cushions, low table, sheer curtains, plants",
    materials: "whitewashed wood, linen, clay, rattan, stone",
    furniture: "a low platform, floor cushions, a small tea table",
    lighting: "diffused morning light, low warm lamps",
    vibe: "calm and grounding",
  },
  "Greenhouse Nook": {
    descriptors: "glasshouse plants, hanging ferns, terracotta, filtered light",
    materials: "terracotta, glass, wrought iron, reclaimed brick, wicker",
    furniture: "a wicker chair, plant stands, a potting bench",
    lighting: "bright filtered daylight through glass",
    vibe: "lush and restorative",
  },
  "Playful Nursery": {
    descriptors: "pastel murals, soft play mat, mobiles, friendly animal motifs",
    materials: "cotton, felt, foam, light wood, wicker",
    furniture: "a low cot, a plush rocker, soft toy baskets, a changing unit",
    lighting: "soft warm dimmable light",
    vibe: "soft and playful",
  },
  "Creative Playroom": {
    descriptors: "colourful storage, craft station, chalkboard wall, toy zones",
    materials: "plywood, rubber flooring, felt, corrugated card",
    furniture: "low open shelving, a craft table, a bean bag pit",
    lighting: "bright even daylight with fun accent lights",
    vibe: "colourful and energetic",
  },
  "Cozy Kids Bedroom": {
    descriptors: "soft pastels, cloud bunting, plush toys, book nook",
    materials: "cotton, felt, wool, light wood, canvas",
    furniture: "a kid-sized bed, a reading bean bag, a toy chest",
    lighting: "soft warm lamp light and gentle daylight",
    vibe: "soft and snug",
  },
  Farmhouse: {
    descriptors: "shaker cabinets, shiplap, galvanized metal, buffalo plaid, mason jars",
    materials: "painted wood, galvanised steel, butcher block, linen gingham",
    furniture: "a farmhouse table, an apothecary cabinet, a ladder rack",
    lighting: "warm pendant lights, natural window light",
    vibe: "warm and practical",
  },
  Cottagecore: {
    descriptors: "floral wallpaper, vintage china, pressed flowers, gingham, lace",
    materials: "cotton, lace, glazed ceramic, wicker, aged wood",
    furniture: "a vintage writing desk, a wingback chair, a ceramic display shelf",
    lighting: "soft warm lamps, dappled garden light",
    vibe: "romantic and nostalgic",
  },
  Cabin: {
    descriptors: "log walls, leather, wool, antlers, stone fireplace, warm timber",
    materials: "rough timber, stone, leather, wool, iron",
    furniture: "a leather sofa, a thick oak table, a stone fireplace",
    lighting: "warm firelight and lantern light",
    vibe: "rugged and cosy",
  },
  Mediterranean: {
    descriptors: "whitewashed walls, terracotta, blue accents, olive branches, arches",
    materials: "lime plaster, terracotta, wrought iron, terracotta tile, linen",
    furniture: "a wrought-iron bistro set, a low bench, terracotta planters",
    lighting: "bright warm sunlight through arches",
    vibe: "sun-drenched and relaxed",
  },
};

export const BUDGETS: string[] = [
  "Under $500",
  "$500 - $2,000",
  "$2,000 - $10,000",
  "$10,000+",
  "Unlimited",
];

/** Budget -> spend level, used to tune materials, quantity and finishes. */
export const BUDGET_PROFILES: Record<
  string,
  { level: string; detail: string; materials: string; density: string }
> = {
  "Under $500": {
    level: "budget-friendly",
    detail: "smart, space-saving and mass-market",
    materials: "flat-pack furniture, laminate and painted surfaces, cotton and polyester textiles, affordable lighting",
    density: "a few well-chosen key pieces with plenty of breathing room",
  },
  "$500 - $2,000": {
    level: "mid-range",
    detail: "curated and value-conscious",
    materials: "flat-pack and ready-made furniture, oak-effect veneer, cotton and linen textiles, brass-look accents",
    density: "a complete, comfortable layout with a few statement accessories",
  },
  "$2,000 - $10,000": {
    level: "premium",
    detail: "high quality, designer-led",
    materials: "solid wood, bouclé and wool upholstery, natural stone, brushed brass and blackened steel, designer lighting",
    density: "a fully styled room with layered textiles and multiple lighting layers",
  },
  "$10,000+": {
    level: "luxury",
    detail: "bespoke and couture",
    materials: "hand-crafted solid timber, full-grain leather, book-matched marble, hand-blown glass, bespoke joinery and custom lighting",
    density: "a complete couture interior with tailored millwork and collectible pieces",
  },
  Unlimited: {
    level: "unlimited dream-home",
    detail: "lavish, maximalist and fully bespoke",
    materials: "rare marbles, hand-knotted rugs, silk velvet, artisan glass, gold leaf, bespoke sculptural lighting",
    density: "a fully realised showpiece interior with every surface considered",
  },
};

export const ROOM_TYPES: string[] = [
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Dining Room",
  "Home Office",
  "Bathroom",
  "Kids Room",
  "Entryway / Hallway",
  "Balcony / Terrace",
  "Reading Nook",
];

export const LIGHTING_MOODS: string[] = [
  "Natural daylight",
  "Warm & cozy",
  "Bright & airy",
  "Moody & dramatic",
  "Golden hour",
  "Evening lamp light",
];

export const ASPECT_RATIOS: Record<string, { width: number; height: number; label: string }> = {
  "16:9": { width: 1024, height: 576, label: "Widescreen" },
  "4:3": { width: 1024, height: 768, label: "Classic" },
  "1:1": { width: 1024, height: 1024, label: "Square" },
  "3:4": { width: 768, height: 1024, label: "Portrait" },
  "9:16": { width: 576, height: 1024, label: "Story / Reel" },
};

export const CAMERA_LANGUAGE =
  "professional real-estate interior photograph, 24mm wide-angle lens, eye-level tripod view, one-point perspective, HDR, natural depth of field, ultra-detailed, 8k, photorealistic, physically accurate materials and reflections";

export const NEGATIVE_CONSTRAINTS =
  "no text, no captions, no watermark, no logo, no people, no distorted or duplicated furniture, no warped architecture, no low resolution, no cartoon rendering, no oversaturated colours";

/** Build a rich, deterministic text-to-image prompt from the user's selections. */
export function buildDesignPrompt(controls: {
  theme: string;
  subTheme: string;
  budget: string;
  prompt?: string;
  roomType?: string;
  lighting?: string;
}): string {
  const themeProfile = THEME_PROFILES[controls.theme];
  const styleProfile = SUBTHEME_PROFILES[controls.subTheme];
  const budgetProfile = BUDGET_PROFILES[controls.budget];

  const themeMood = themeProfile?.mood ?? "inviting and beautifully styled";
  const themePalette = (themeProfile?.palette ?? ["warm white", "sand", "charcoal"]).join(", ");
  const themeAccents = themeProfile?.accents ?? "coordinated accessories";
  const themeElements = themeProfile?.elements ?? "coordinated styling";
  const themeTexture = themeProfile?.texture ?? "natural textures";

  const styleDescriptors = styleProfile?.descriptors ?? controls.subTheme.toLowerCase();
  const styleMaterials = styleProfile?.materials ?? "coordinated materials";
  const styleFurniture = styleProfile?.furniture ?? "a well composed furniture layout";
  const styleLighting = styleProfile?.lighting ?? "layered ambient lighting";
  const styleVibe = styleProfile?.vibe ?? "polished";

  const room = controls.roomType || "living room";
  const lighting = controls.lighting || "Natural daylight";
  const extra = (controls.prompt || "").trim();

  const palette = themeProfile
    ? `Colour palette: ${themePalette}.`
    : `Colour palette: ${themePalette}.`;

  return [
    `Photorealistic interior design photograph of a ${room} decorated in a ${controls.subTheme} style with a ${controls.theme} theme.`,
    `Art direction: ${styleDescriptors}. Overall mood: ${themeMood}.`,
    `Signature elements: ${themeElements}. Accents: ${themeAccents}.`,
    `Furniture and layout: ${styleFurniture}.`,
    `Materials and textures: ${styleMaterials}, ${themeTexture}, and ${budgetProfile.materials}.`,
    `Budget realism: ${budgetProfile.level} (${budgetProfile.detail}) — ${budgetProfile.density}.`,
    palette,
    `Lighting: ${lighting}, ${styleLighting}.`,
    extra ? `Additional client requests: ${extra}.` : "",
    `Style and vibe: ${styleVibe}.`,
    `Capture: ${CAMERA_LANGUAGE}.`,
    `Constraints: ${NEGATIVE_CONSTRAINTS}.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Prompt used when we can actually edit the uploaded room photo (accurate mode). */
export function buildEditPrompt(controls: {
  theme: string;
  subTheme: string;
  budget: string;
  prompt?: string;
  roomType?: string;
  lighting?: string;
}): string {
  const styleProfile = SUBTHEME_PROFILES[controls.subTheme];
  const themeProfile = THEME_PROFILES[controls.theme];
  const budgetProfile = BUDGET_PROFILES[controls.budget];
  const room = controls.roomType || "room";
  const extra = (controls.prompt || "").trim();

  return [
    `Edit the provided photo of an empty ${room} and furnish + decorate it in a ${controls.subTheme} style (${controls.theme} theme).`,
    `Keep the existing architecture, wall and floor surfaces, windows, camera angle, perspective and the natural light direction exactly as they are. Only add the styling.`,
    `Add: ${styleProfile?.furniture ?? "a coordinated furniture layout"}, ${styleProfile?.descriptors ?? controls.subTheme}, ${themeProfile?.elements ?? "coordinated accessories"}, ${themeProfile?.accents ?? "matching accents"}.`,
    `Materials: ${styleProfile?.materials ?? "coordinated materials"}, ${budgetProfile?.materials ?? "quality materials"} (${budgetProfile?.level} finish).`,
    `Colour palette: ${(themeProfile?.palette ?? []).join(", ") || "warm neutral tones"}.`,
    `Lighting mood: ${controls.lighting || "natural daylight"} with ${styleProfile?.lighting ?? "layered ambient lighting"}.`,
    extra ? `Client specific requests: ${extra}.` : "",
    `Result must look like a real professional interior photograph taken in the same room, with physically correct shadows, reflections and proportions.`,
    `No text, no watermark, no people.`,
  ]
    .filter(Boolean)
    .join(" ");
}

/** Fallback description used when no LLM provider is reachable. */
export function buildFallbackDescription(controls: {
  theme: string;
  subTheme: string;
  budget: string;
  roomType?: string;
}): string {
  const style = SUBTHEME_PROFILES[controls.subTheme];
  const theme = THEME_PROFILES[controls.theme];
  const budget = BUDGET_PROFILES[controls.budget];
  return `A ${controls.roomType || "living room"} styled in a ${controls.subTheme} ${controls.theme.toLowerCase()} look. ${
    style?.descriptors ?? "A coordinated, curated arrangement."
  } The palette is built around ${(theme?.palette ?? []).slice(0, 3).join(", ") || "warm neutrals"}, with ${
    style?.materials ?? "coordinated materials"
  }. The overall spend level is ${budget?.level ?? "mid-range"}, so the room feels ${
    budget?.detail ?? "comfortable and well considered"
  } with ${style?.lighting ?? "layered ambient lighting"}.`;
}
