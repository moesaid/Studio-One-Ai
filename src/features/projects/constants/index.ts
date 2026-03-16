import type { ProjectStatus, CreateProjectPayload, DirectorPersona, FilmStyle } from '../types';

export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { label: string; color: string; bg: string }
> = {
  draft: {
    label: 'Draft',
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
  },
  in_production: {
    label: 'In Production',
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-400/20',
  },
  completed: {
    label: 'Completed',
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
  },
};

export const EMPTY_PROJECT: CreateProjectPayload = {
  title: '',
  description: '',
};

/*
 * Preset Director Personas
 * Each has a unique filmmaking style and a system_instruction that will be
 * prepended to all AI prompts for this project.
 */
export const PRESET_PERSONAS: DirectorPersona[] = [
  {
    id: 'auteur-noir',
    name: 'The Noir Auteur',
    style: 'Dark & Atmospheric',
    description:
      'Masters shadows and moral ambiguity. Think Fincher meets classic film noir — high contrast, cynical narration, and tension that never lets go.',
    system_instruction:
      'You are directing a film in the style of dark, atmospheric neo-noir. Favour high-contrast lighting, morally grey characters, sharp cynical dialogue, and a pervasive sense of tension. Narration should be introspective and hard-boiled. Every scene must serve the mystery or the character\'s descent.',
    is_custom: false,
  },
  {
    id: 'visual-poet',
    name: 'The Visual Poet',
    style: 'Cinematic & Lyrical',
    description:
      'Prioritizes beauty and emotion over plot. Think Terrence Malick — whispered voiceovers, magic-hour light, and nature as a character.',
    system_instruction:
      'You are directing a film with a lyrical, poetic visual style. Prioritize stunning natural imagery, magic-hour lighting, contemplative pacing, and whispered inner monologues. Plot is secondary to mood and emotion. Scenes flow like visual poetry with minimal dialogue and maximum sensory immersion.',
    is_custom: false,
  },
  {
    id: 'action-maestro',
    name: 'The Action Maestro',
    style: 'High-energy & Kinetic',
    description:
      'Lives for adrenaline and spectacle. Think George Miller — relentless pacing, practical stunts, visceral sound design, and every frame in motion.',
    system_instruction:
      'You are directing a high-octane action film. Every scene must pulse with energy — rapid cuts, dynamic camera movement, visceral sound design, and practical effects over CGI where possible. Dialogue is punchy and economical. Pacing never slows. Stunts and set pieces drive the narrative forward.',
    is_custom: false,
  },
  {
    id: 'indie-realist',
    name: 'The Indie Realist',
    style: 'Raw & Authentic',
    description:
      'Captures life as it is. Think Greta Gerwig or the Dardenne brothers — handheld cameras, natural performances, and stories about real people.',
    system_instruction:
      'You are directing a grounded indie drama. Use handheld camera work, natural lighting, and improvisation-friendly dialogue. Characters must feel like real people with mundane flaws. Avoid melodrama — let silence and subtle gestures carry the emotion. Locations should feel lived-in and authentic.',
    is_custom: false,
  },
  {
    id: 'sci-fi-visionary',
    name: 'The Sci-Fi Visionary',
    style: 'Futuristic & Conceptual',
    description:
      'Builds entire worlds from ideas. Think Villeneuve or Kubrick — vast scale, philosophical undertones, and technology as both wonder and threat.',
    system_instruction:
      'You are directing a science fiction film that explores big ideas. World-building is paramount — every detail of the environment, technology, and society must feel considered. Pacing is deliberate. Dialogue explores philosophical themes. Visuals are grand in scale with stark, clean compositions. Sound design creates otherworldly atmospheres.',
    is_custom: false,
  },
  {
    id: 'horror-architect',
    name: 'The Horror Architect',
    style: 'Suspenseful & Unsettling',
    description:
      'Builds dread from the ground up. Think Ari Aster or Robert Eggers — slow-burn tension, disturbing imagery, and horror rooted in human psychology.',
    system_instruction:
      'You are directing a psychological horror film. Build dread through slow-burn pacing, unsettling compositions, and restrained use of jump scares. Horror should emerge from atmosphere, sound design, and human behavior rather than monsters. Dialogue is sparse and loaded. Every frame should feel slightly wrong.',
    is_custom: false,
  },
  {
    id: 'comedy-conductor',
    name: 'The Comedy Conductor',
    style: 'Witty & Rhythmic',
    description:
      'Timing is everything. Think Edgar Wright or Wes Anderson — snappy editing, visual gags, deadpan delivery, and comedic precision.',
    system_instruction:
      'You are directing a comedy with impeccable timing. Dialogue must be snappy, quotable, and layered with subtext. Use visual comedy — framing, editing rhythm, and recurring motifs — as much as verbal wit. Characters should be eccentric but grounded. Every scene needs a comedic engine driving it forward.',
    is_custom: false,
  },
  {
    id: 'documentary-eye',
    name: 'The Documentary Eye',
    style: 'Observational & Truth-seeking',
    description:
      'Finds stories in reality. Think Werner Herzog — unflinching observation, compelling narration, and the extraordinary in the ordinary.',
    system_instruction:
      'You are directing a documentary-style film. Use observational techniques — long takes, available light, real locations, and interview-style dialogue. Narration should be compelling and occasionally philosophical. Find dramatic structure in reality. Let subjects reveal themselves through behaviour rather than exposition.',
    is_custom: false,
  },
];

export { ROLE_CONFIG, ROLES, CHARACTER_JSON_SCHEMA, EXTRACT_STEPS, KEYBOARD_SHORTCUTS } from './characters';

/*
 * Preset Film Styles
 * Each style has image_prompt and video_prompt strings that are prepended
 * to all image/video generation prompts to enforce a consistent visual look.
 */
export const PRESET_FILM_STYLES: FilmStyle[] = [
  // ── Cinematic ──
  {
    id: 'film-noir',
    name: 'Film Noir',
    category: 'Cinematic',
    description:
      'Classic black-and-white with high contrast, dramatic shadows, and moody venetian-blind lighting.',
    image_prompt:
      'Film noir style, high contrast black and white photography, dramatic chiaroscuro lighting, deep shadows, venetian blind light patterns, 1940s cinematic aesthetic, grainy film texture.',
    video_prompt:
      'Film noir cinematic style, black and white, high contrast, dramatic shadows, slow dolly shots, moody atmospheric lighting, classic 1940s cinema look.',
    preview_keywords: 'noir,shadows,bw',
    preview_image: '/images/styles/film-noir.png',
    is_custom: false,
  },
  {
    id: 'golden-hour',
    name: 'Golden Hour',
    category: 'Cinematic',
    description:
      'Warm, sun-drenched visuals with amber tones, soft lens flares, and dreamy backlit compositions.',
    image_prompt:
      'Golden hour photography, warm amber and honey tones, soft natural sunlight, lens flare, dreamy backlit composition, sun-kissed skin tones, shallow depth of field, cinematic warmth.',
    video_prompt:
      'Golden hour cinematic, warm amber color grading, soft natural backlight, sun flares, shallow depth of field, dreamy warm atmosphere, anamorphic bokeh.',
    preview_keywords: 'warm,golden,sunset',
    preview_image: '/images/styles/golden-hour.png',
    is_custom: false,
  },
  {
    id: 'wes-anderson',
    name: 'Wes Anderson Symmetry',
    category: 'Cinematic',
    description:
      'Perfectly centered compositions, pastel color palettes, and whimsical set design with deadpan framing.',
    image_prompt:
      'Wes Anderson visual style, perfectly symmetrical composition, pastel color palette with dusty pinks and muted yellows, flat frontal framing, whimsical set design, vintage textures, centered subjects.',
    video_prompt:
      'Wes Anderson cinematic style, symmetrical framing, pastel color grading, flat frontal camera angles, smooth lateral dolly movements, whimsical production design, vintage aesthetic.',
    preview_keywords: 'symmetry,pastel,whimsical',
    preview_image: '/images/styles/wes-anderson.png',
    is_custom: false,
  },
  {
    id: 'anamorphic-scifi',
    name: 'Anamorphic Sci-Fi',
    category: 'Cinematic',
    description:
      'Wide anamorphic framing with blue-teal tones, horizontal lens flares, and futuristic cold lighting.',
    image_prompt:
      'Anamorphic sci-fi cinematic style, widescreen 2.39:1 framing, cool blue and teal color palette, horizontal lens flares, futuristic cold lighting, sleek metallic surfaces, volumetric fog, Blade Runner aesthetic.',
    video_prompt:
      'Anamorphic sci-fi cinema, widescreen framing, blue-teal color grading, horizontal lens flares, slow atmospheric camera movements, volumetric lighting, futuristic neon accents.',
    preview_keywords: 'scifi,blue,anamorphic',
    preview_image: '/images/styles/anamorphic-scifi.png',
    is_custom: false,
  },
  // ── Animated ──
  {
    id: 'ghibli-watercolor',
    name: 'Studio Ghibli Watercolor',
    category: 'Animated',
    description:
      'Hand-painted watercolor backgrounds, soft pastel skies, lush green landscapes, and gentle Studio Ghibli charm.',
    image_prompt:
      'Studio Ghibli anime art style, hand-painted watercolor backgrounds, soft pastel sky with fluffy clouds, lush green landscapes, warm gentle lighting, detailed natural environments, cel-shaded characters, whimsical and serene mood.',
    video_prompt:
      'Studio Ghibli animation style, hand-painted watercolor aesthetic, gentle camera pans, soft pastel color palette, lush detailed backgrounds, serene and whimsical atmosphere, smooth fluid animation.',
    preview_keywords: 'ghibli,watercolor,green',
    preview_image: '/images/styles/ghibli-watercolor.png',
    is_custom: false,
  },
  {
    id: 'pixar-3d',
    name: 'Pixar 3D',
    category: 'Animated',
    description:
      'Polished 3D rendering with expressive characters, vibrant saturated colors, and cinematic lighting.',
    image_prompt:
      'Pixar-style 3D animated rendering, high-quality CGI, expressive character design with large eyes, vibrant saturated colors, cinematic rim lighting, smooth subsurface scattering on skin, detailed textured environments.',
    video_prompt:
      'Pixar-style 3D animated cinema, high-quality CGI rendering, vibrant saturated colors, cinematic camera movements, expressive character animation, detailed environments, cinematic lighting with depth.',
    preview_keywords: 'pixar,3d,vibrant',
    preview_image: '/images/styles/pixar-3d.png',
    is_custom: false,
  },
  {
    id: 'anime-cel',
    name: 'Anime Cel-Shaded',
    category: 'Animated',
    description:
      'Bold outlines, flat color fills, dynamic action poses, and manga-inspired dramatic lighting effects.',
    image_prompt:
      'Anime cel-shaded art style, bold black outlines, flat color fills with crisp shadows, dynamic dramatic poses, manga-inspired speed lines, vivid saturated colors, dramatic rim lighting, detailed hair and eye rendering.',
    video_prompt:
      'Anime cel-shaded animation style, bold outlines, flat color shading, dynamic camera angles, dramatic action sequences, speed lines, vivid colors, manga-inspired cinematography.',
    preview_keywords: 'anime,cel,bold',
    preview_image: '/images/styles/anime-cel.png',
    is_custom: false,
  },
  {
    id: 'chibi-3d',
    name: 'Chibi 3D',
    category: 'Animated',
    description:
      'Adorable oversized heads, tiny bodies, and glossy 3D rendering with big expressive eyes.',
    image_prompt:
      'Chibi 3D character style, oversized head with tiny body proportions, big glossy expressive eyes, smooth 3D rendering, cute adorable aesthetic, soft studio lighting, rounded features, kawaii design.',
    video_prompt:
      'Chibi 3D animation style, oversized head tiny body, cute expressive movements, smooth 3D rendering, bright cheerful lighting, kawaii aesthetic, bouncy animations.',
    preview_keywords: 'chibi,3d,cute',
    preview_image: '/images/styles/chibi-3d.png',
    is_custom: false,
  },
  {
    id: '2d-chibi',
    name: '2D Chibi',
    category: 'Animated',
    description:
      'Flat 2D chibi proportions with simplified features, pastel tones, and hand-drawn linework.',
    image_prompt:
      '2D chibi art style, flat illustration, oversized head with tiny body, simplified cute features, soft pastel colors, clean hand-drawn linework, big round eyes, kawaii aesthetic, sticker-like quality.',
    video_prompt:
      '2D chibi animation style, flat illustrated characters, oversized heads, simple cute movements, pastel color palette, hand-drawn aesthetic, bouncy keyframe animation.',
    preview_keywords: 'chibi,2d,flat',
    preview_image: '/images/styles/2d-chibi.png',
    is_custom: false,
  },
  {
    id: 'wholesome-anime',
    name: 'Wholesome / Healing Anime',
    category: 'Animated',
    description:
      'Soft warm tones, gentle expressions, cozy atmosphere, and a calming slice-of-life anime vibe.',
    image_prompt:
      'Wholesome healing anime style, soft warm color palette, gentle facial expressions, cozy atmosphere, warm golden lighting, delicate linework, pastel backgrounds, iyashikei aesthetic, comforting serene mood.',
    video_prompt:
      'Wholesome healing anime animation, soft warm tones, gentle character movements, cozy slice-of-life feel, warm ambient lighting, pastel colors, slow peaceful pacing, comforting atmosphere.',
    preview_keywords: 'wholesome,healing,warm',
    preview_image: '/images/styles/wholesome-anime.png',
    is_custom: false,
  },
  {
    id: 'childrens-illustration',
    name: "Children's Illustration",
    category: 'Animated',
    description:
      'Soft rounded characters, warm muted pastels, and a gentle storybook quality for young audiences.',
    image_prompt:
      "Children's book illustration style, soft rounded character design, warm muted pastel colors, gentle watercolor-like textures, simple clean backgrounds, friendly expressive faces, storybook quality, warm cozy lighting.",
    video_prompt:
      "Children's illustration animation, soft rounded characters, warm pastel palette, gentle movements, storybook aesthetic, friendly expressive style, warm ambient glow.",
    preview_keywords: 'children,book,soft',
    preview_image: '/images/styles/childrens-illustration.png',
    is_custom: false,
  },
  {
    id: 'powerpuff-girls',
    name: 'Powerpuff',
    category: 'Animated',
    description:
      'Bold flat colors, huge round eyes, no fingers, and the iconic chunky Cartoon Network aesthetic.',
    image_prompt:
      'Powerpuff Girls cartoon style, bold flat solid colors, huge circular eyes with no irises, no fingers on hands, thick black outlines, simplified geometric character design, bright saturated palette, Cartoon Network aesthetic.',
    video_prompt:
      'Powerpuff Girls animation style, bold flat colors, huge round eyes, simplified character designs, dynamic action poses, thick outlines, Cartoon Network aesthetic, punchy fast animation.',
    preview_keywords: 'powerpuff,bold,round',
    preview_image: '/images/styles/powerpuff-girls.png',
    is_custom: false,
  },
  {
    id: 'detective-anime',
    name: 'Detective Anime',
    category: 'Animated',
    description:
      'Classic 90s anime style with sharp features, dramatic shading, and a mystery noir atmosphere.',
    image_prompt:
      'Detective anime style, 1990s Japanese animation aesthetic, sharp angular character features, dramatic cel shading, dark moody backgrounds, mystery noir atmosphere, detailed hair rendering, serious expression, muted color palette with dramatic highlights.',
    video_prompt:
      'Detective anime animation style, 90s anime aesthetic, dramatic cel shading, sharp character designs, noir atmosphere, suspenseful pacing, moody dark lighting, classic animation quality.',
    preview_keywords: 'detective,90s,anime',
    preview_image: '/images/styles/detective-anime.png',
    is_custom: false,
  },
  {
    id: 'vintage-manga',
    name: 'Vintage Manga',
    category: 'Animated',
    description:
      'Classic shoujo manga linework with screen tones, delicate features, and a nostalgic retro feel.',
    image_prompt:
      'Vintage manga illustration style, classic shoujo manga aesthetic, delicate detailed linework, screen tone shading, soft warm muted colors, elegant character features, flowing hair details, nostalgic retro Japanese comic feel.',
    video_prompt:
      'Vintage manga animation style, classic shoujo aesthetic, delicate linework, screen tone textures, soft muted color palette, elegant character movements, nostalgic retro feel.',
    preview_keywords: 'manga,vintage,retro',
    preview_image: '/images/styles/vintage-manga.png',
    is_custom: false,
  },
  // ── Stylized ──
  {
    id: 'oil-painting',
    name: 'Oil Painting',
    category: 'Stylized',
    description:
      'Rich textured brushstrokes, deep saturated colors, and a classical fine-art quality reminiscent of the Old Masters.',
    image_prompt:
      'Classical oil painting style, rich textured visible brushstrokes, deep saturated colors, dramatic chiaroscuro lighting, canvas texture, Renaissance-inspired composition, warm earth tones with luminous highlights.',
    video_prompt:
      'Oil painting animation style, visible brushstroke textures, rich saturated colors, dramatic chiaroscuro, slow painterly camera movements, classical fine art aesthetic, warm tones.',
    preview_keywords: 'oil,painting,classic',
    preview_image: '/images/styles/oil-painting.png',
    is_custom: false,
  },
  {
    id: 'comic-pop-art',
    name: 'Comic Book Pop Art',
    category: 'Stylized',
    description:
      'Bold primary colors, thick ink outlines, halftone dot patterns, and retro comic book paneling.',
    image_prompt:
      'Comic book pop art style, bold primary colors red yellow blue, thick black ink outlines, Ben-Day halftone dot patterns, dynamic action compositions, retro 1960s aesthetic, dramatic speech bubble framing, high contrast.',
    video_prompt:
      'Comic book pop art animation, bold primary colors, thick outlines, halftone dot textures, dynamic panel transitions, retro comic aesthetic, punchy dramatic camera angles.',
    preview_keywords: 'comic,pop,primary',
    preview_image: '/images/styles/comic-pop-art.png',
    is_custom: false,
  },
  {
    id: 'neon-cyberpunk',
    name: 'Neon Cyberpunk',
    category: 'Stylized',
    description:
      'Glowing neon pinks and teals against dark urban backdrops, rain-slicked streets, and holographic accents.',
    image_prompt:
      'Cyberpunk neon aesthetic, glowing neon pink and teal lights, dark urban environment, rain-slicked reflective streets, holographic signage, volumetric fog with colored light, futuristic noir, high contrast with deep blacks.',
    video_prompt:
      'Cyberpunk neon cinematic style, glowing neon lights, dark rain-soaked streets, reflective surfaces, slow atmospheric camera, volumetric colored fog, futuristic urban noir, moody bass-heavy atmosphere.',
    preview_keywords: 'neon,cyberpunk,glow',
    preview_image: '/images/styles/neon-cyberpunk.png',
    is_custom: false,
  },
  {
    id: 'ultra-flat',
    name: 'Ultra Flat',
    category: 'Stylized',
    description:
      'Vivid flat colors, sharp clean outlines, zero gradients, and a bold graphic-design poster feel.',
    image_prompt:
      'Ultra flat illustration style, vivid solid flat colors, sharp clean black outlines, zero gradients or shading, bold graphic design aesthetic, hot pink and vibrant backgrounds, poster-like composition, clean vector look.',
    video_prompt:
      'Ultra flat animation style, vivid solid colors, sharp outlines, no gradients, bold graphic movements, clean vector aesthetic, punchy transitions.',
    preview_keywords: 'flat,bold,vivid',
    preview_image: '/images/styles/ultra-flat.png',
    is_custom: false,
  },
  {
    id: 'retro-comic',
    name: 'Retro Comic',
    category: 'Stylized',
    description:
      'Warm vintage ink lines, classic retro cartoon proportions, and a nostalgic golden-age comic strip look.',
    image_prompt:
      'Retro comic illustration style, warm vintage ink linework, classic 1950s cartoon proportions, muted warm color palette, crosshatch shading, nostalgic golden age comic strip aesthetic, rounded character faces, slightly aged paper texture.',
    video_prompt:
      'Retro comic animation style, vintage ink linework, classic cartoon proportions, warm muted tones, nostalgic golden age feel, hand-drawn movement quality.',
    preview_keywords: 'retro,comic,vintage',
    preview_image: '/images/styles/retro-comic.png',
    is_custom: false,
  },
  {
    id: 'watercolor-illustration',
    name: 'Watercolor Illustration',
    category: 'Stylized',
    description:
      'Soft transparent washes, delicate blending, visible paper texture, and a dreamy ethereal quality.',
    image_prompt:
      'Watercolor illustration style, soft transparent color washes, delicate blending, visible watercolor paper texture, light pencil underdrawing, dreamy ethereal quality, muted soft palette, gentle lighting, artistic imperfections.',
    video_prompt:
      'Watercolor illustration animation, soft transparent washes, delicate color blending, paper texture, dreamy ethereal movements, gentle pastel palette, artistic painted feel.',
    preview_keywords: 'watercolor,soft,ethereal',
    preview_image: '/images/styles/watercolor-illustration.png',
    is_custom: false,
  },
  {
    id: 'marvel-comic',
    name: 'Marvel Comic',
    category: 'Stylized',
    description:
      'Bold heroic linework, rich saturated colors, dramatic shading, and a classic Marvel superhero aesthetic.',
    image_prompt:
      'Marvel comic book art style, bold heroic ink linework, rich saturated colors, dramatic cel shading, dynamic compositions, strong character proportions, classic American superhero comic aesthetic, detailed crosshatch shadows.',
    video_prompt:
      'Marvel comic animation style, bold ink outlines, rich saturated colors, dramatic shading, dynamic heroic poses, cinematic comic book framing, action-packed aesthetic.',
    preview_keywords: 'marvel,heroic,bold',
    preview_image: '/images/styles/marvel-comic.png',
    is_custom: false,
  },
  {
    id: 'american-comic',
    name: 'American Comic',
    category: 'Stylized',
    description:
      'Adult animated show style with exaggerated features, flat colors, and a quirky irreverent tone.',
    image_prompt:
      'American adult comic cartoon style, exaggerated facial features, flat muted colors, thick dark outlines, simplified character design, slightly grotesque proportions, Rick and Morty / Bob\'s Burgers aesthetic, dull background tones.',
    video_prompt:
      'American adult comic animation, exaggerated features, flat colors, thick outlines, quirky jerky movement, simplified designs, irreverent comedic aesthetic.',
    preview_keywords: 'american,cartoon,quirky',
    preview_image: '/images/styles/american-comic.png',
    is_custom: false,
  },
  {
    id: 'sketch',
    name: 'Sketch',
    category: 'Stylized',
    description:
      'Raw pencil sketch on white paper with crosshatch shading, visible construction lines, and an unfinished feel.',
    image_prompt:
      'Pencil sketch style, raw graphite drawing on white paper, crosshatch shading, visible construction lines, unfinished artistic quality, detailed linework, monochrome black and white, hand-drawn look.',
    video_prompt:
      'Pencil sketch animation, graphite drawing aesthetic, crosshatch shading, monochrome black and white, hand-drawn movement, visible sketch lines, raw artistic quality.',
    preview_keywords: 'sketch,pencil,raw',
    preview_image: '/images/styles/sketch.png',
    is_custom: false,
  },
  {
    id: 'doodle-naive',
    name: 'Doodle / Naive Sketch',
    category: 'Stylized',
    description:
      'Playful wobbly lines, imperfect proportions, and a charming hand-drawn notebook doodle quality.',
    image_prompt:
      'Doodle naive sketch style, playful wobbly hand-drawn lines, imperfect proportions, charming childlike quality, notebook paper background, simple black ink on white, exaggerated expressions, messy fun aesthetic.',
    video_prompt:
      'Doodle naive sketch animation, playful wobbly lines, imperfect proportions, hand-drawn notebook feel, simple black and white, charming rough movement, childlike aesthetic.',
    preview_keywords: 'doodle,naive,wobbly',
    preview_image: '/images/styles/doodle-naive.png',
    is_custom: false,
  },
  {
    id: 'simpsons',
    name: 'Simpsons Style',
    category: 'Stylized',
    description:
      'Yellow skin tones, bulging eyes, overbite mouths, and the iconic Matt Groening Springfield look.',
    image_prompt:
      'Simpsons cartoon style, yellow skin tone, bulging round eyes, overbite mouth, four fingers per hand, thick black outlines, bold flat colors, Matt Groening character design, Springfield aesthetic.',
    video_prompt:
      'Simpsons cartoon animation style, yellow skin tones, bulging eyes, thick black outlines, bold flat colors, classic sitcom cartoon movement, Matt Groening aesthetic.',
    preview_keywords: 'simpsons,yellow,groening',
    preview_image: '/images/styles/simpsons.png',
    is_custom: false,
  },
  {
    id: 'star-princess',
    name: 'Star Princess',
    category: 'Stylized',
    description:
      'Sparkly magical girl aesthetic with star motifs, glowing accents, and a fairytale princess vibe.',
    image_prompt:
      'Star princess magical girl style, sparkly glowing accents, star and crown motifs, soft pink and gold palette, glittery highlights, flowing hair with magical sparkles, fairytale princess aesthetic, dreamy soft lighting.',
    video_prompt:
      'Star princess magical girl animation, sparkly glowing effects, star motifs, soft pink and gold palette, flowing magical movements, fairytale princess aesthetic, dreamy lighting.',
    preview_keywords: 'princess,sparkly,magical',
    preview_image: '/images/styles/star-princess.png',
    is_custom: false,
  },
  {
    id: 'realistic-illustration',
    name: 'Realistic Illustration',
    category: 'Stylized',
    description:
      'Semi-realistic digital painting with accurate proportions, soft rendering, and a polished editorial quality.',
    image_prompt:
      'Realistic digital illustration style, semi-realistic proportions, soft smooth rendering, accurate anatomy, polished editorial quality, subtle warm lighting, clean detailed linework, natural skin tones, professional digital painting.',
    video_prompt:
      'Realistic digital illustration animation, semi-realistic character rendering, smooth detailed movements, polished editorial quality, natural lighting, professional digital painting aesthetic.',
    preview_keywords: 'realistic,polished,editorial',
    preview_image: '/images/styles/realistic-illustration.png',
    is_custom: false,
  },
  {
    id: 'colored-pencil',
    name: 'Colored Pencil',
    category: 'Stylized',
    description:
      'Visible pencil strokes, layered waxy textures, and a warm hand-crafted colored pencil feel.',
    image_prompt:
      'Colored pencil illustration style, visible waxy pencil strokes, layered color texture, warm hand-crafted feel, slightly rough paper texture, soft blended colors, detailed hatching, traditional art medium quality.',
    video_prompt:
      'Colored pencil animation style, visible pencil strokes, waxy layered textures, warm hand-crafted feel, paper texture, soft blended movements, traditional art aesthetic.',
    preview_keywords: 'pencil,colored,handmade',
    preview_image: '/images/styles/colored-pencil.png',
    is_custom: false,
  },
  // ── Sci-Fi & Fantasy ──
  {
    id: 'steampunk',
    name: 'Steampunk',
    category: 'Sci-Fi & Fantasy',
    description:
      'Victorian-era machinery, brass gears, leather goggles, and a warm sepia-toned industrial aesthetic.',
    image_prompt:
      'Steampunk style, Victorian-era industrial aesthetic, brass gears and cogs, leather goggles, warm sepia and copper tones, steam-powered machinery, detailed mechanical accessories, aged metal textures, gaslight atmosphere.',
    video_prompt:
      'Steampunk cinematic style, Victorian industrial aesthetic, brass and copper color grading, steam effects, warm sepia tones, mechanical movements, gaslight atmosphere, detailed gear mechanisms.',
    preview_keywords: 'steampunk,brass,victorian',
    preview_image: '/images/styles/steampunk.png',
    is_custom: false,
  },
  {
    id: 'post-apocalyptic',
    name: 'Post-Apocalyptic Sci-Fi',
    category: 'Sci-Fi & Fantasy',
    description:
      'Ruined landscapes, dusty muted tones, tattered clothing, and a gritty survival atmosphere.',
    image_prompt:
      'Post-apocalyptic sci-fi style, ruined desolate landscape, dusty muted desaturated tones, tattered weathered clothing, gritty survival aesthetic, dramatic overcast sky, debris and rust textures, harsh directional lighting.',
    video_prompt:
      'Post-apocalyptic sci-fi cinema, ruined landscapes, dusty muted color grading, gritty survival atmosphere, harsh lighting, desolate windy environments, tense dramatic pacing.',
    preview_keywords: 'apocalyptic,dusty,gritty',
    preview_image: '/images/styles/post-apocalyptic.png',
    is_custom: false,
  },
  {
    id: 'hero-concept-art',
    name: 'Hero Concept Art',
    category: 'Sci-Fi & Fantasy',
    description:
      'Dramatic digital painting with heroic poses, glowing energy effects, and epic fantasy composition.',
    image_prompt:
      'Hero concept art style, dramatic digital painting, heroic powerful pose, glowing energy effects, epic fantasy composition, rich saturated colors, dramatic rim lighting, detailed armor and weapons, cinematic atmosphere.',
    video_prompt:
      'Hero concept art animation, dramatic digital painting aesthetic, heroic poses, glowing energy effects, epic cinematic movements, rich saturated colors, fantasy atmosphere.',
    preview_keywords: 'hero,concept,epic',
    preview_image: '/images/styles/hero-concept-art.png',
    is_custom: false,
  },
  {
    id: 'soulslike-game',
    name: 'Soulslike Game',
    category: 'Sci-Fi & Fantasy',
    description:
      'Dark brooding atmosphere, ornate gothic armor, eerie blue-green lighting, and a sense of foreboding grandeur.',
    image_prompt:
      'Soulslike dark fantasy game style, dark brooding atmosphere, ornate gothic armor and weapons, eerie blue-green lighting, volumetric fog, detailed dark fantasy textures, foreboding grandeur, Elden Ring / Dark Souls aesthetic.',
    video_prompt:
      'Soulslike dark fantasy game cinematic, dark brooding atmosphere, eerie blue-green lighting, slow ominous camera, volumetric fog, gothic ornate details, foreboding grand scale.',
    preview_keywords: 'soulslike,dark,gothic',
    preview_image: '/images/styles/soulslike-game.png',
    is_custom: false,
  },
  {
    id: 'futuristic-scifi',
    name: 'Futuristic Sci-Fi',
    category: 'Sci-Fi & Fantasy',
    description:
      'Sleek holographic overlays, glowing circuitry patterns, and a clean high-tech futuristic look.',
    image_prompt:
      'Futuristic sci-fi style, sleek holographic UI overlays, glowing blue circuitry patterns, clean high-tech aesthetic, smooth metallic surfaces, neon accent lighting, transparent digital displays, advanced technology look.',
    video_prompt:
      'Futuristic sci-fi cinematic, holographic UI elements, glowing circuitry, clean high-tech aesthetic, smooth camera movements, neon accent lighting, digital display effects.',
    preview_keywords: 'futuristic,hologram,tech',
    preview_image: '/images/styles/futuristic-scifi.png',
    is_custom: false,
  },
  {
    id: 'mecha',
    name: 'Mecha',
    category: 'Sci-Fi & Fantasy',
    description:
      'Mechanical armor plating, robotic joints, metallic textures, and a Japanese mecha anime aesthetic.',
    image_prompt:
      'Mecha style, mechanical armor plating, robotic articulated joints, metallic chrome and steel textures, glowing visor and energy cores, Japanese mecha anime aesthetic, detailed mechanical design, dramatic heroic framing.',
    video_prompt:
      'Mecha anime cinematic, mechanical armor transformations, robotic articulated movements, metallic textures, glowing energy effects, dramatic camera angles, Japanese mecha aesthetic.',
    preview_keywords: 'mecha,robot,armor',
    preview_image: '/images/styles/mecha.png',
    is_custom: false,
  },
  // ── Animated (cont.) — Toy styles ──
  {
    id: 'building-block-lego',
    name: 'Building Block (Lego)',
    category: 'Animated',
    description:
      'Blocky angular character made of toy bricks with visible studs, smooth plastic texture, and bright primary colors.',
    image_prompt:
      'Lego building block style, blocky angular character design made of plastic bricks, visible studs and connection points, smooth glossy plastic texture, bright primary colors, toy photography lighting, miniature scale aesthetic.',
    video_prompt:
      'Lego building block animation, blocky plastic brick characters, stop-motion-like movement, bright primary colors, glossy plastic textures, toy-scale environments, playful aesthetic.',
    preview_keywords: 'lego,block,plastic',
    preview_image: '/images/styles/building-block-lego.png',
    is_custom: false,
  },
  {
    id: 'plush-toy',
    name: 'Plush Toy',
    category: 'Animated',
    description:
      'Soft fluffy plush material, rounded proportions, stitched seams, and an adorable stuffed animal feel.',
    image_prompt:
      'Plush toy style, soft fluffy plush material texture, rounded proportions, visible stitched seams, adorable stuffed animal aesthetic, button eyes, warm studio lighting, velvet-like fabric, huggable design.',
    video_prompt:
      'Plush toy stop-motion animation, soft fluffy texture, rounded bouncy movements, stitched seam details, warm studio lighting, adorable stuffed animal feel.',
    preview_keywords: 'plush,fluffy,stuffed',
    preview_image: '/images/styles/plush-toy.png',
    is_custom: false,
  },
  // ── Cinematic (cont.) ──
  {
    id: 'documentary-realism',
    name: 'Documentary Realism',
    category: 'Cinematic',
    description:
      'Raw, unpolished look with natural lighting, handheld framing, and a focus on authentic human moments.',
    image_prompt:
      'Documentary photography style, raw authentic look, natural available lighting, slight grain, candid compositions, handheld camera feel, shallow depth of field, muted desaturated color palette, photojournalistic aesthetic.',
    video_prompt:
      'Documentary realism cinema style, handheld camera, natural available light, slight film grain, muted desaturated colors, intimate close-ups, raw unpolished authentic aesthetic.',
    preview_keywords: 'documentary,raw,natural',
    preview_image: '/images/styles/documentary-realism.png',
    is_custom: false,
  },
];
