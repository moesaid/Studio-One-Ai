export const SCENE_JSON_SCHEMA = `{
  "title": "Scene title (e.g., 'The Confrontation')",
  "description": "Visual direction and staging notes for this scene",
  "action": "What physically happens — movement, gestures, events",
  "dialogue": "Key dialogue lines in this scene (keep the most impactful lines)",
  "location": "Specific setting (e.g., 'Dimly lit throne room', 'Busy Cairo marketplace')",
  "time_of_day": "day|night|dawn|dusk|evening",
  "mood": "tense|romantic|comedic|dramatic|peaceful|mysterious|action|melancholic|triumphant|horror",
  "characters": ["Character Name 1", "Character Name 2"],
  "camera_notes": "Camera angles, movements, and framing suggestions"
}`;

export const SCENE_EXTRACT_STEPS = [
  { label: 'Reading screenplay structure...', icon: '📖' },
  { label: 'Identifying scene breaks via AI...', icon: '🤖' },
  { label: 'Mapping characters to scenes...', icon: '🔗' },
  { label: 'Saving scenes to project...', icon: '💾' },
];

export const TIME_OF_DAY_OPTIONS = [
  { value: 'day', label: '☀️ Day' },
  { value: 'night', label: '🌙 Night' },
  { value: 'dawn', label: '🌅 Dawn' },
  { value: 'dusk', label: '🌇 Dusk' },
  { value: 'evening', label: '🌆 Evening' },
] as const;

export const MOOD_OPTIONS = [
  { value: 'tense', label: '😰 Tense', color: 'text-red-400' },
  { value: 'romantic', label: '💕 Romantic', color: 'text-pink-400' },
  { value: 'comedic', label: '😄 Comedic', color: 'text-yellow-400' },
  { value: 'dramatic', label: '🎭 Dramatic', color: 'text-purple-400' },
  { value: 'peaceful', label: '🕊️ Peaceful', color: 'text-emerald-400' },
  { value: 'mysterious', label: '🔮 Mysterious', color: 'text-violet-400' },
  { value: 'action', label: '⚡ Action', color: 'text-orange-400' },
  { value: 'melancholic', label: '😢 Melancholic', color: 'text-blue-400' },
  { value: 'triumphant', label: '🏆 Triumphant', color: 'text-amber-400' },
  { value: 'horror', label: '👻 Horror', color: 'text-slate-400' },
] as const;

export const MOOD_BADGE_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  tense: { label: 'Tense', bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  romantic: { label: 'Romantic', bg: 'bg-pink-500/10', text: 'text-pink-400', border: 'border-pink-500/20' },
  comedic: { label: 'Comedic', bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/20' },
  dramatic: { label: 'Dramatic', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  peaceful: { label: 'Peaceful', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  mysterious: { label: 'Mysterious', bg: 'bg-violet-500/10', text: 'text-violet-400', border: 'border-violet-500/20' },
  action: { label: 'Action', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20' },
  melancholic: { label: 'Melancholic', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  triumphant: { label: 'Triumphant', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  horror: { label: 'Horror', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
};

export const TIME_BADGE_CONFIG: Record<string, { label: string; icon: string }> = {
  day: { label: 'Day', icon: '☀️' },
  night: { label: 'Night', icon: '🌙' },
  dawn: { label: 'Dawn', icon: '🌅' },
  dusk: { label: 'Dusk', icon: '🌇' },
  evening: { label: 'Evening', icon: '🌆' },
};
