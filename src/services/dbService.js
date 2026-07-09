import { collection, doc, setDoc, getDocs, deleteDoc, query, where, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const saveDocument = async (collectionName, docId, data) => {
  try {
    await setDoc(doc(db, collectionName, docId.toString()), data);
    return { success: true };
  } catch (error) {
    console.error(`Error saving document in ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, docId, data) => {
  try {
    await updateDoc(doc(db, collectionName, docId.toString()), data);
    return { success: true };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, docId) => {
  try {
    await deleteDoc(doc(db, collectionName, docId.toString()));
    return { success: true };
  } catch (error) {
    console.error(`Error deleting document in ${collectionName}:`, error);
    throw error;
  }
};

export const getCollection = async (collectionName) => {
  try {
    const snap = await getDocs(collection(db, collectionName));
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    return items;
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

export const queryCollection = async (collectionName, field, opStr, value) => {
  try {
    const q = query(collection(db, collectionName), where(field, opStr, value));
    const snap = await getDocs(q);
    const items = [];
    snap.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
    return items;
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
};
