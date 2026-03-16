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
  where,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import type { VideoClip, CreateVideoClipPayload } from '../types';

const COLLECTION = 'video_clips';

function clipsRef(projectId: string) {
  return collection(db, 'projects', projectId, COLLECTION);
}

/**
 * Get all video clips for a project.
 */
export async function getVideoClips(
  projectId: string
): Promise<{ data: VideoClip[] }> {
  const q = query(clipsRef(projectId), orderBy('created_at', 'desc'));
  const snapshot = await getDocs(q);
  return {
    data: snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as VideoClip)
    ),
  };
}

/**
 * Get video clips for a specific scene.
 */
export async function getVideoClipsByScene(
  projectId: string,
  sceneId: string
): Promise<{ data: VideoClip[] }> {
  const q = query(
    clipsRef(projectId),
    where('scene_id', '==', sceneId),
    orderBy('keyframe_index', 'asc')
  );
  const snapshot = await getDocs(q);
  return {
    data: snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() } as VideoClip)
    ),
  };
}

/**
 * Create a new video clip record (pending status).
 */
export async function createVideoClip(
  projectId: string,
  payload: CreateVideoClipPayload
): Promise<{ data: VideoClip }> {
  const docRef = await addDoc(clipsRef(projectId), {
    ...payload,
    project_id: projectId,
    video_url: null,
    audio_url: null,
    status: 'generating',
    error_message: null,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  return {
    data: {
      id: docRef.id,
      ...payload,
      project_id: projectId,
      video_url: null,
      audio_url: null,
      status: 'generating',
      error_message: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as VideoClip,
  };
}

/**
 * Update a video clip record.
 */
export async function updateVideoClip(
  projectId: string,
  clipId: string,
  payload: Partial<VideoClip>
): Promise<void> {
  const docRef = doc(db, 'projects', projectId, COLLECTION, clipId);
  await updateDoc(docRef, {
    ...payload,
    updated_at: serverTimestamp(),
  });
}

/**
 * Delete a video clip record.
 */
export async function deleteVideoClip(
  projectId: string,
  clipId: string
): Promise<void> {
  const docRef = doc(db, 'projects', projectId, COLLECTION, clipId);
  await deleteDoc(docRef);
}

/**
 * Upload video file to Firebase Storage and return its download URL.
 */
export async function uploadVideoFile(
  projectId: string,
  clipId: string,
  videoBytes: Uint8Array,
  mimeType: string = 'video/mp4'
): Promise<string> {
  const ext = mimeType === 'video/mp4' ? 'mp4' : 'webm';
  const storageRef = ref(
    storage,
    `projects/${projectId}/video_clips/${clipId}/video.${ext}`
  );
  await uploadBytes(storageRef, videoBytes, { contentType: mimeType });
  return getDownloadURL(storageRef);
}

/**
 * Upload audio file to Firebase Storage and return its download URL.
 */
export async function uploadAudioFile(
  projectId: string,
  clipId: string,
  audioBytes: Uint8Array,
  mimeType: string = 'audio/wav'
): Promise<string> {
  const ext = mimeType === 'audio/wav' ? 'wav' : 'mp3';
  const storageRef = ref(
    storage,
    `projects/${projectId}/video_clips/${clipId}/audio.${ext}`
  );
  await uploadBytes(storageRef, audioBytes, { contentType: mimeType });
  return getDownloadURL(storageRef);
}
