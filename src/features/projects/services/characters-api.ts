import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Character, CreateCharacterPayload, UpdateCharacterPayload } from '../types';

function charsRef(projectId: string) {
  return collection(db, 'projects', projectId, 'characters');
}

function docToCharacter(
  projectId: string,
  docSnap: { id: string; data: () => Record<string, unknown> }
): Character {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    project_id: projectId,
    name: (d.name as string) ?? '',
    role: (d.role as Character['role']) ?? 'other',
    description: (d.description as string) ?? '',
    traits: (d.traits as string[]) ?? [],
    motivations: (d.motivations as string[]) ?? [],
    flaws: (d.flaws as string[]) ?? [],
    appearance: (d.appearance as string) ?? '',
    backstory: (d.backstory as string) ?? '',
    vibe: (d.vibe as string) ?? '',
    arc: (d.arc as string) ?? '',
    voice: (d.voice as string) ?? '',
    relationships: (d.relationships as Character['relationships']) ?? [],
    order: (d.order as number) ?? 0,
    created_at:
      d.created_at instanceof Timestamp
        ? d.created_at.toDate().toISOString()
        : (d.created_at as string) ?? new Date().toISOString(),
    updated_at:
      d.updated_at instanceof Timestamp
        ? d.updated_at.toDate().toISOString()
        : (d.updated_at as string) ?? new Date().toISOString(),
  };
}

export async function getCharacters(projectId: string): Promise<{ data: Character[] }> {
  const q = query(charsRef(projectId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return { data: snapshot.docs.map((d) => docToCharacter(projectId, d)) };
}

export async function createCharacter(
  projectId: string,
  payload: CreateCharacterPayload
): Promise<{ data: Character }> {
  const docRef = await addDoc(charsRef(projectId), {
    name: payload.name,
    role: payload.role ?? 'other',
    description: payload.description ?? '',
    traits: payload.traits ?? [],
    motivations: payload.motivations ?? [],
    flaws: payload.flaws ?? [],
    appearance: payload.appearance ?? '',
    backstory: payload.backstory ?? '',
    vibe: payload.vibe ?? '',
    arc: payload.arc ?? '',
    voice: payload.voice ?? '',
    relationships: payload.relationships ?? [],
    order: payload.order ?? 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const now = new Date().toISOString();
  return {
    data: {
      id: docRef.id,
      project_id: projectId,
      name: payload.name,
      role: payload.role ?? 'other',
      description: payload.description ?? '',
      traits: payload.traits ?? [],
      motivations: payload.motivations ?? [],
      flaws: payload.flaws ?? [],
      appearance: payload.appearance ?? '',
      backstory: payload.backstory ?? '',
      vibe: payload.vibe ?? '',
      arc: payload.arc ?? '',
      voice: payload.voice ?? '',
      relationships: payload.relationships ?? [],
      order: payload.order ?? 0,
      created_at: now,
      updated_at: now,
    },
  };
}

export async function updateCharacter(
  projectId: string,
  characterId: string,
  data: UpdateCharacterPayload
): Promise<void> {
  const ref = doc(db, 'projects', projectId, 'characters', characterId);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteCharacter(projectId: string, characterId: string): Promise<void> {
  const ref = doc(db, 'projects', projectId, 'characters', characterId);
  await deleteDoc(ref);
}

export interface GeneratedCharacter {
  name: string;
  role: string;
  description: string;
  traits: string[];
  motivations: string[];
  flaws: string[];
  appearance: string;
  backstory: string;
  vibe: string;
  arc: string;
  voice: string;
  relationships?: { target_name: string; label: string }[];
}

export async function batchCreateCharacters(
  projectId: string,
  characters: GeneratedCharacter[]
): Promise<void> {
  const batch = writeBatch(db);
  characters.forEach((ch, idx) => {
    const ref = doc(charsRef(projectId));
    batch.set(ref, {
      name: ch.name,
      role: ch.role || 'other',
      description: ch.description || '',
      traits: ch.traits || [],
      motivations: ch.motivations || [],
      flaws: ch.flaws || [],
      appearance: ch.appearance || '',
      backstory: ch.backstory || '',
      vibe: ch.vibe || '',
      arc: ch.arc || '',
      voice: ch.voice || '',
      relationships: ch.relationships || [],
      order: idx,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  });
  await batch.commit();
}
