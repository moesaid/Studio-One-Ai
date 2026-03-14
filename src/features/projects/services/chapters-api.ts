import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  where,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { ScriptChapter, CreateChapterPayload, UpdateChapterPayload } from '../types';

function chaptersRef(projectId: string) {
  return collection(db, 'projects', projectId, 'chapters');
}

function docToChapter(
  projectId: string,
  docSnap: { id: string; data: () => Record<string, unknown> }
): ScriptChapter {
  const d = docSnap.data();
  return {
    id: docSnap.id,
    project_id: projectId,
    parent_id: (d.parent_id as string | null) ?? null,
    title: (d.title as string) ?? '',
    content: (d.content as string) ?? '',
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

export async function getChapters(projectId: string): Promise<{ data: ScriptChapter[] }> {
  const q = query(chaptersRef(projectId), orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  return { data: snapshot.docs.map((d) => docToChapter(projectId, d)) };
}

export async function createChapter(
  projectId: string,
  payload: CreateChapterPayload
): Promise<{ data: ScriptChapter }> {
  const docRef = await addDoc(chaptersRef(projectId), {
    parent_id: payload.parent_id ?? null,
    title: payload.title,
    content: payload.content ?? '',
    order: payload.order ?? 0,
    created_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
  const now = new Date().toISOString();
  return {
    data: {
      id: docRef.id,
      project_id: projectId,
      parent_id: payload.parent_id ?? null,
      title: payload.title,
      content: payload.content ?? '',
      order: payload.order ?? 0,
      created_at: now,
      updated_at: now,
    },
  };
}

export async function updateChapter(
  projectId: string,
  chapterId: string,
  data: Partial<Pick<ScriptChapter, 'title' | 'content' | 'order'>>
): Promise<void> {
  const ref = doc(db, 'projects', projectId, 'chapters', chapterId);
  await updateDoc(ref, {
    ...data,
    updated_at: serverTimestamp(),
  });
}

export async function deleteChapter(projectId: string, chapterId: string): Promise<void> {
  // Delete the chapter itself
  const ref = doc(db, 'projects', projectId, 'chapters', chapterId);
  await deleteDoc(ref);

  // Delete all sub-chapters (one level)
  const subQ = query(chaptersRef(projectId), where('parent_id', '==', chapterId));
  const subSnap = await getDocs(subQ);
  const batch = writeBatch(db);
  subSnap.docs.forEach((d) => batch.delete(d.ref));
  if (!subSnap.empty) await batch.commit();
}

export async function reorderChapters(
  projectId: string,
  items: { id: string; order: number }[]
): Promise<void> {
  const batch = writeBatch(db);
  items.forEach(({ id, order }) => {
    const ref = doc(db, 'projects', projectId, 'chapters', id);
    batch.update(ref, { order, updated_at: serverTimestamp() });
  });
  await batch.commit();
}

export interface GeneratedChapter {
  title: string;
  content: string;
  sub_chapters?: { title: string; content: string }[];
}

export async function batchCreateChapters(
  projectId: string,
  chapters: GeneratedChapter[]
): Promise<void> {
  // Firestore batches support max 500 ops — should be fine for scripts
  for (let i = 0; i < chapters.length; i++) {
    const ch = chapters[i];
    // Create parent chapter
    const parentRef = await addDoc(chaptersRef(projectId), {
      parent_id: null,
      title: ch.title,
      content: ch.content,
      order: i,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });

    // Create sub-chapters if any
    if (ch.sub_chapters?.length) {
      for (let j = 0; j < ch.sub_chapters.length; j++) {
        const sub = ch.sub_chapters[j];
        await addDoc(chaptersRef(projectId), {
          parent_id: parentRef.id,
          title: sub.title,
          content: sub.content,
          order: j,
          created_at: serverTimestamp(),
          updated_at: serverTimestamp(),
        });
      }
    }
  }
}
