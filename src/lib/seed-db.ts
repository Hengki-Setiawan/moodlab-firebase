'use server';

import { initializeServerSideFirebase } from '@/firebase/server-init';
import { ref, set } from 'firebase/database';
import { dummyProducts } from './data';

export async function seedProducts() {
  const { db } = initializeServerSideFirebase();
  
  // In RTDB, we write to a path. We'll store products under the 'products' node.
  const productsRef = ref(db, 'products');

  // We'll convert the array of products into an object,
  // where keys are auto-generated IDs. This is a common RTDB pattern.
  const productsObject = dummyProducts.reduce((acc, product, index) => {
    // We can create a simple key or a more complex one
    const key = `prod_${Date.now()}_${index}`;
    acc[key] = product;
    return acc;
  }, {} as { [key: string]: any });

  try {
    // set() overwrites all data at the specified path.
    await set(productsRef, productsObject);
    console.log('Successfully seeded Realtime Database with products.');
    return {
      success: true,
      message: `${dummyProducts.length} products have been added to the Realtime Database.`,
    };
  } catch (error) {
    console.error('Error seeding Realtime Database:', error);
    if (error instanceof Error) {
        return { success: false, message: `Error: ${error.message}` };
    }
    return { success: false, message: 'An unknown error occurred.' };
  }
}
