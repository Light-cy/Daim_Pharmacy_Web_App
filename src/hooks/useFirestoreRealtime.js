import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';

export const useFirestoreRealtime = (collectionName) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    const unsub = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const items = [];
        snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data(), _docId: doc.id }));
        setData(items);
        setLoading(false);
      },
      (err) => {
        console.error(`Error in realtime listener for ${collectionName}:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [collectionName]);

  return { data, loading, error };
};
