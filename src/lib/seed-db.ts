'use server';

import { initializeFirebase } from '@/firebase';
import { getFirestore, collection, writeBatch } from 'firebase/firestore';
import { dummyProducts } from './data';

export async function seedProducts() {
  const { firestore } = initializeFirebase();
  const db = getFirestore(firestore.app);
  const productsCollection = collection(db, 'products');

  // Don't re-seed if products already exist
  // Note: In a real app, you might want a more robust check.
  // For this starter, we are not implementing one.
  // const snapshot = await getDocs(productsCollection);
  // if (!snapshot.empty) {
  //   console.log('Products collection already has documents. Seeding skipped.');
  //   return {
  //     success: false,
  //     message: 'Database already seeded.',
  //   };
  // }
  
  const batch = writeBatch(db);

  dummyProducts.forEach((product) => {
    // Firestore will auto-generate an ID if you use .add() via a batch
    const docRef = collection(db, 'products');
    // We create a new doc ref for each product to get a unique ID
    batch.set(docRef.doc(), product);
  });

  try {
    await batch.commit();
    console.log('Successfully seeded database with products.');
    return {
      success: true,
      message: `${dummyProducts.length} products have been added to Firestore.`,
    };
  } catch (error) {
    console.error('Error seeding database:', error);
    if (error instanceof Error) {
        return { success: false, message: `Error: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
