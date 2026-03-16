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
import type { Scene, CreateScenePayload, TimeOfDay, SceneMood } from '../types';

function scenesRef(projectId: string) {
  return collection(db, 'projects', projectId, 'scenes');
}

function docToScene(
  projectId: string,
  docSnap: { id: string; data: () => Record<string, unknown> }
): Scene {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    project_id: projectId,
    chapter_id: (d.chapter_id as string | null) ?? null,
    title: (d.title as string) ?? '',
    description: (d.description as string) ?? '',
    action: (d.action as string) ?? '',
    dialogue: (d.dialogue as string) ?? '',
    location: (d.location as string) ?? '',
    time_of_day: (d.time_of_day as TimeOfDay) ?? 'day',
    mood: (d.mood as SceneMood) ?? 'dramatic',
    characters: (d.characters as string[]) ?? [],
    camera_notes: (d.camera_notes as string) ?? '',
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

export async function getScenes(projectId: string): Promise<{ data: Scene[] }> {
  const q = query(scenesRef(projectId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return { data: snapshot.docs.map((d) => docToScene(projectId, d)) };
}

export async function createScene(
  projectId: string,
  payload: CreateScenePayload
): Promise<{ data: Scene }> {
  const docRef = await addDoc(scenesRef(projectId), {
    chapter_id: payload.chapter_id ?? null,
    title: payload.title,
    description: payload.description ?? '',
    action: payload.action ?? '',
    dialogue: payload.dialogue ?? '',
    location: payload.location ?? '',
    time_of_day: payload.time_of_day ?? 'day',
    mood: payload.mood ?? 'dramatic',
    characters: payload.characters ?? [],
    camera_notes: payload.camera_notes ?? '',
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
      chapter_id: payload.chapter_id ?? null,
      title: payload.title,
      description: payload.description ?? '',
      action: payload.action ?? '',
      dialogue: payload.dialogue ?? '',
      location: payload.location ?? '',
      time_of_day: payload.time_of_day ?? 'day',
      mood: payload.mood ?? 'dramatic',
      characters: payload.characters ?? [],
      camera_notes: payload.camera_notes ?? '',
      reference_images: payload.reference_images ?? [],
      order: payload.order ?? 0,
      created_at: now,
      updated_at: now,
    },
  };
}

export async function updateScene(
  projectId: string,
  sceneId: string,
  data: Partial<Pick<Scene, 'title' | 'description' | 'action' | 'dialogue' | 'location' | 'time_of_day' | 'mood' | 'characters' | 'camera_notes' | 'reference_images' | 'order'>>
): Promise<void> {
  const ref = doc(db, 'projects', projectId, 'scenes', sceneId);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteScene(projectId: string, sceneId: string): Promise<void> {
  const ref = doc(db, 'projects', projectId, 'scenes', sceneId);
  await deleteDoc(ref);
}

export async function reorderScenes(
  projectId: string,
  items: { id: string; order: number }[]
): Promise<void> {
  const batch = writeBatch(db);
  items.forEach(({ id, order }) => {
    const ref = doc(db, 'projects', projectId, 'scenes', id);
    batch.update(ref, { order, updated_at: serverTimestamp() });
  });
  await batch.commit();
}

export interface GeneratedScene {
  title: string;
  description: string;
  action: string;
  dialogue: string;
  location: string;
  time_of_day: string;
  mood: string;
  characters: string[];
  camera_notes: string;
}

export async function batchCreateScenes(
  projectId: string,
  scenes: GeneratedScene[]
): Promise<void> {
  const batch = writeBatch(db);
  scenes.forEach((sc, idx) => {
    const ref = doc(scenesRef(projectId));
    batch.set(ref, {
      chapter_id: null,
      title: sc.title || `Scene ${idx + 1}`,
      description: sc.description || '',
      action: sc.action || '',
      dialogue: sc.dialogue || '',
      location: sc.location || '',
      time_of_day: sc.time_of_day || 'day',
      mood: sc.mood || 'dramatic',
      characters: sc.characters || [],
      camera_notes: sc.camera_notes || '',
      reference_images: [],
      order: idx,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  });
  await batch.commit();
}
