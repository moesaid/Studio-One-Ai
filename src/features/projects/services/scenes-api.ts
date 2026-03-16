import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
} from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
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
    visual_description: (d.visual_description as string) ?? '',
    action: (d.action as string) ?? '',
    dialogue: (d.dialogue as string) ?? '',
    location: (d.location as string) ?? '',
    time_of_day: (d.time_of_day as TimeOfDay) ?? 'day',
    mood: (d.mood as SceneMood) ?? 'dramatic',
    characters: (d.characters as string[]) ?? [],
    camera_notes: (d.camera_notes as string) ?? '',
    image_prompts: (d.image_prompts as string[]) ?? [],
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
    visual_description: payload.visual_description ?? '',
    action: payload.action ?? '',
    dialogue: payload.dialogue ?? '',
    location: payload.location ?? '',
    time_of_day: payload.time_of_day ?? 'day',
    mood: payload.mood ?? 'dramatic',
    characters: payload.characters ?? [],
    camera_notes: payload.camera_notes ?? '',
    image_prompts: payload.image_prompts ?? [],
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
      visual_description: payload.visual_description ?? '',
      action: payload.action ?? '',
      dialogue: payload.dialogue ?? '',
      location: payload.location ?? '',
      time_of_day: payload.time_of_day ?? 'day',
      mood: payload.mood ?? 'dramatic',
      characters: payload.characters ?? [],
      camera_notes: payload.camera_notes ?? '',
      image_prompts: payload.image_prompts ?? [],
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
  data: Partial<Pick<Scene, 'title' | 'description' | 'visual_description' | 'action' | 'dialogue' | 'location' | 'time_of_day' | 'mood' | 'characters' | 'camera_notes' | 'image_prompts' | 'reference_images' | 'order'>>
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
  visual_description: string;
  action: string;
  dialogue: string;
  location: string;
  time_of_day: string;
  mood: string;
  characters: string[];
  camera_notes: string;
  image_prompts: string[];
}

export async function batchCreateScenes(
  projectId: string,
  scenes: GeneratedScene[]
): Promise<string[]> {
  const batch = writeBatch(db);
  const ids: string[] = [];
  scenes.forEach((sc, idx) => {
    const ref = doc(scenesRef(projectId));
    ids.push(ref.id);
    batch.set(ref, {
      chapter_id: null,
      title: sc.title || `Scene ${idx + 1}`,
      description: sc.description || '',
      visual_description: sc.visual_description || '',
      action: sc.action || '',
      dialogue: sc.dialogue || '',
      location: sc.location || '',
      time_of_day: sc.time_of_day || 'day',
      mood: sc.mood || 'dramatic',
      characters: sc.characters || [],
      camera_notes: sc.camera_notes || '',
      image_prompts: sc.image_prompts || [],
      reference_images: [],
      order: idx,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  });
  await batch.commit();
  return ids;
}

/* ── Scene Image Storage ── */

/**
 * Upload generated scene frame images (base64) to Firebase Storage
 * and add download URLs to the scene's reference_images array.
 */
export async function uploadSceneImages(
  projectId: string,
  sceneId: string,
  images: { image_bytes: string; mime_type: string; frame_label: string }[]
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
    const filename = `${img.frame_label}_${Date.now()}.${ext}`;
    const path = `projects/${projectId}/scenes/${sceneId}/frames/${filename}`;
    const fileRef = storageRef(storage, path);

    await uploadBytes(fileRef, blob);
    const url = await getDownloadURL(fileRef);
    uploadedUrls.push(url);
  }

  // Update Firestore with new URLs
  if (uploadedUrls.length > 0) {
    const sceneRef = doc(db, 'projects', projectId, 'scenes', sceneId);
    await updateDoc(sceneRef, {
      reference_images: arrayUnion(...uploadedUrls),
      updated_at: serverTimestamp(),
    });
  }

  return { data: uploadedUrls };
}

/**
 * Replace a single scene frame image at a given index.
 * Uploads the new image and updates the Firestore reference_images array.
 */
export async function replaceSceneImage(
  projectId: string,
  sceneId: string,
  imageIndex: number,
  imageBytes: string,
  mimeType: string
): Promise<{ data: string }> {
  // Upload new image
  const byteString = atob(imageBytes);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });

  const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
  const frameLabel = imageIndex === 0 ? 'opening' : `frame_${imageIndex + 1}`;
  const filename = `${frameLabel}_${Date.now()}.${ext}`;
  const path = `projects/${projectId}/scenes/${sceneId}/frames/${filename}`;
  const fileRef = storageRef(storage, path);

  await uploadBytes(fileRef, blob);
  const newUrl = await getDownloadURL(fileRef);

  // Read current scene reference_images, replace at index
  const sceneDocRef = doc(db, 'projects', projectId, 'scenes', sceneId);
  const sceneSnap = await getDoc(sceneDocRef);
  const currentImages = (sceneSnap.data()?.reference_images as string[]) ?? [];

  const updated = [...currentImages];
  if (imageIndex < updated.length) {
    updated[imageIndex] = newUrl;
  } else {
    updated.push(newUrl);
  }

  await updateDoc(sceneDocRef, {
    reference_images: updated,
    updated_at: serverTimestamp(),
  });

  return { data: newUrl };
}

/* ── Project Poster Storage ── */

/**
 * Upload a generated project poster to Firebase Storage
 * and set it as the project's thumbnail_url.
 */
export async function uploadProjectPoster(
  projectId: string,
  imageBytes: string,
  mimeType: string
): Promise<{ data: string }> {
  const byteString = atob(imageBytes);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  const blob = new Blob([ab], { type: mimeType });

  const ext = mimeType === 'image/jpeg' ? 'jpg' : 'png';
  const filename = `poster_${Date.now()}.${ext}`;
  const path = `projects/${projectId}/poster/${filename}`;
  const fileRef = storageRef(storage, path);

  await uploadBytes(fileRef, blob);
  const url = await getDownloadURL(fileRef);

  // Update project thumbnail
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    thumbnail_url: url,
    updated_at: serverTimestamp(),
  });

  return { data: url };
}
