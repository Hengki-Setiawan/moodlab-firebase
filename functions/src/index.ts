import * as functions from "firebase-functions";
import * as midtransClient from "midtrans-client";

// This is the correct signature for firebase-functions v5 onCall handlers
export const createMidtransTransaction = functions.https.onCall(
  async (request) => {
    // The user's auth information is on request.auth
    if (!request.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Anda harus login untuk melakukan transaksi.",
      );
    }

    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

    // The data sent from the client is on request.data
    const data = request.data;

    const parameter = {
      transaction_details: {
        order_id: data.orderId,
        gross_amount: data.amount,
      },
      item_details: [
        {
          id: data.productId,
          price: data.amount,
          quantity: 1,
          name: data.productName,
        },
      ],
      customer_details: {
        // The user's email is on request.auth.token
        email: request.auth.token.email,
      },
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      return { token: transaction.token };
    } catch (e: any) {
      functions.logger.error("Error creating Midtrans transaction:", e);
      throw new functions.https.HttpsError("internal", e.message);
    }
  },
);
