
import * as functions from "firebase-functions";
import * as midtransClient from "midtrans-client";

export const createMidtransTransaction = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Anda harus login untuk melakukan transaksi.",
      );
    }

    // Menggunakan cara baru: membaca dari environment variables
    const snap = new midtransClient.Snap({
      isProduction: false,
      serverKey: process.env.MIDTRANS_SERVER_KEY,
      clientKey: process.env.MIDTRANS_CLIENT_KEY,
    });

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
        email: context.auth.token.email,
      },
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      return {token: transaction.token};
    } catch (e: any) {
      functions.logger.error("Error creating Midtrans transaction:", e);
      throw new functions.https.HttpsError("internal", e.message);
    }
  },
);
