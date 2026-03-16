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
    gender: (d.gender as Character['gender']) ?? 'male',
    age: (d.age as number) ?? 25,
    species: (d.species as Character['species']) ?? 'human',
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
    reference_images: (d.reference_images as string[]) ?? [],
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
    gender: payload.gender ?? 'male',
    age: payload.age ?? 25,
    species: payload.species ?? 'human',
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
    reference_images: payload.reference_images ?? [],
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
      gender: payload.gender ?? 'male',
      age: payload.age ?? 25,
      species: payload.species ?? 'human',
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
      reference_images: payload.reference_images ?? [],
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
  gender?: string;
  age?: number;
  species?: string;
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
      gender: ch.gender || 'male',
      age: ch.age || 25,
      species: ch.species || 'human',
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
      reference_images: [],
      order: idx,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  });
  await batch.commit();
}

/* ── Character Visuals Storage ── */

import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { arrayUnion, arrayRemove } from 'firebase/firestore';

/**
 * Upload generated character visuals (base64) to Firebase Storage
 * and add download URLs to the character's reference_images array.
 */
export async function uploadGeneratedVisuals(
  projectId: string,
  characterId: string,
  images: { image_bytes: string; mime_type: string; expression: string }[]
): Promise<{ data: string[] }> {
  const uploadedUrls: string[] = [];

  for (const img of images) {
    const byteString = atob(img.image_bytes);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: img.mime_type });

    const ext = img.mime_type === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${img.expression}_${Date.now()}.${ext}`;
    const path = `projects/${projectId}/characters/${characterId}/visuals/${filename}`;
    const fileRef = storageRef(storage, path);

    await uploadBytes(fileRef, blob);
    const url = await getDownloadURL(fileRef);
    uploadedUrls.push(url);
  }

  // Update Firestore with new URLs
  if (uploadedUrls.length > 0) {
    const charRef = doc(db, 'projects', projectId, 'characters', characterId);
    await updateDoc(charRef, {
      reference_images: arrayUnion(...uploadedUrls),
      updated_at: serverTimestamp(),
    });
  }

  return { data: uploadedUrls };
}

/**
 * Upload a user-provided file to Firebase Storage as a character visual.
 */
export async function uploadCharacterVisualFile(
  projectId: string,
  characterId: string,
  file: File
): Promise<{ data: string }> {
  const ext = file.name.split('.').pop() || 'png';
  const filename = `upload_${Date.now()}.${ext}`;
  const path = `projects/${projectId}/characters/${characterId}/visuals/${filename}`;
  const fileRef = storageRef(storage, path);

  await uploadBytes(fileRef, file);
  const url = await getDownloadURL(fileRef);

  // Update Firestore
  const charRef = doc(db, 'projects', projectId, 'characters', characterId);
  await updateDoc(charRef, {
    reference_images: arrayUnion(url),
    updated_at: serverTimestamp(),
  });

  return { data: url };
}

/**
 * Delete a character visual from Firebase Storage and remove from Firestore array.
 */
export async function deleteCharacterVisual(
  projectId: string,
  characterId: string,
  imageUrl: string
): Promise<void> {
  // Try to delete from Storage — URL contains the path after /o/
  try {
    const urlObj = new URL(imageUrl);
    const encodedPath = urlObj.pathname.split('/o/')[1]?.split('?')[0];
    if (encodedPath) {
      const decodedPath = decodeURIComponent(encodedPath);
      const fileRef = storageRef(storage, decodedPath);
      await deleteObject(fileRef);
    }
  } catch {
    // File may already be deleted from Storage — continue with Firestore cleanup
    console.warn('[deleteCharacterVisual] Could not delete from Storage, cleaning Firestore only.');
  }

  // Remove URL from Firestore array
  const charRef = doc(db, 'projects', projectId, 'characters', characterId);
  await updateDoc(charRef, {
    reference_images: arrayRemove(imageUrl),
    updated_at: serverTimestamp(),
  });
}

