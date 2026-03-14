import type { ProjectStatus, CreateProjectPayload, DirectorPersona } from '../types';

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
