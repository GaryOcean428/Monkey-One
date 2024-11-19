import { collections } from './firebase';
import type { FirebaseCollections } from './schema';
import { addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';

export async function createUser(data: Omit<FirebaseCollections['users'], 'id'>) {
  return await addDoc(collections.users, {
    ...data,
    createdAt: Date.now()
  });
}

export async function createAgent(data: Omit<FirebaseCollections['agents'], 'id'>) {
  return await addDoc(collections.agents, {
    ...data,
    createdAt: Date.now(),
    lastActive: Date.now()
  });
}

export async function createWorkflow(data: Omit<FirebaseCollections['workflows'], 'id'>) {
  return await addDoc(collections.workflows, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

export async function createMemory(data: Omit<FirebaseCollections['memories'], 'id'>) {
  return await addDoc(collections.memories, {
    ...data,
    timestamp: Date.now()
  });
}

export async function createTool(data: Omit<FirebaseCollections['tools'], 'id'>) {
  return await addDoc(collections.tools, {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

export async function createVectorEntry(data: Omit<FirebaseCollections['vectorStore'], 'id'>) {
  return await addDoc(collections.vectorStore, {
    ...data,
    timestamp: Date.now()
  });
}

export async function updateBrainState(data: FirebaseCollections['brainState']) {
  const brainStateRef = doc(collections.brainState, data.id);
  return await updateDoc(brainStateRef, {
    ...data,
    timestamp: Date.now()
  });
}

export async function recordMetric(data: Omit<FirebaseCollections['metrics'], 'id'>) {
  return await addDoc(collections.metrics, {
    ...data,
    timestamp: Date.now()
  });
}