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
  where,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
import type { Project, CreateProjectPayload, UpdateProjectPayload } from '../types';

const PROJECTS_COLLECTION = 'projects';

/** Get the current user's UID or throw */
function getUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('User not authenticated');
  return uid;
}

/** Convert Firestore doc to Project */
function docToProject(docSnap: { id: string; data: () => Record<string, unknown> }): Project {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    title: (d.title as string) ?? '',
    description: (d.description as string) ?? '',
    status: (d.status as Project['status']) ?? 'draft',
    thumbnail_url: (d.thumbnail_url as string | null) ?? null,
    owner_id: (d.owner_id as string) ?? '',
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

export async function getProjects(): Promise<{ data: Project[] }> {
  const uid = getUid();
  const q = query(
    collection(db, PROJECTS_COLLECTION),
    where('owner_id', '==', uid),
    orderBy('created_at', 'desc'),
  );
  const snapshot = await getDocs(q);
  return { data: snapshot.docs.map((d) => docToProject(d)) };
}

export async function createProject(payload: CreateProjectPayload): Promise<{ data: Project }> {
  const uid = getUid();
  const docRef = await addDoc(collection(db, PROJECTS_COLLECTION), {
    title: payload.title,
    description: payload.description,
    status: 'draft',
    thumbnail_url: null,
    owner_id: uid,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const now = new Date().toISOString();
  return {
    data: {
      id: docRef.id,
      title: payload.title,
      description: payload.description,
      status: 'draft' as const,
      thumbnail_url: null,
      owner_id: uid,
      created_at: now,
      updated_at: now,
    },
  };
}

export async function updateProject(payload: UpdateProjectPayload): Promise<{ data: Project }> {
  const uid = getUid();
  const ref = doc(db, PROJECTS_COLLECTION, payload.id);
  await updateDoc(ref, {
    title: payload.title,
    description: payload.description,
    status: payload.status,
    updated_at: serverTimestamp(),
  });
  return {
    data: {
      id: payload.id,
      title: payload.title,
      description: payload.description,
      status: payload.status,
      thumbnail_url: null,
      owner_id: uid,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  };
}

export async function deleteProject(id: string): Promise<void> {
  const ref = doc(db, PROJECTS_COLLECTION, id);
  await deleteDoc(ref);
}

export async function getProject(id: string): Promise<{ data: Project }> {
  const ref = doc(db, PROJECTS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error('Project not found');
  return { data: docToProject(snap) };
}
