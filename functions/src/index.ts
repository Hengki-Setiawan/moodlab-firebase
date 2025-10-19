
import * as functions from "firebase-functions";
import * as midtransClient from "midtrans-client";

// Anda perlu men-deploy fungsi ini dengan nama 'createMidtransTransaction'
export const createMidtransTransaction = functions.https.onCall(
  async (data, context) => {
    // data: {
    //   orderId: string,
    //   amount: number,
    //   productName: string,
    //   productId: string
    // }
    // context: berisi info user jika sudah login

    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Anda harus login untuk melakukan transaksi.",
      );
    }

    // Inisialisasi snap API
    // Pastikan Anda sudah mengatur environment variables di Firebase
    const snap = new midtransClient.Snap({
      isProduction: false, // Ganti ke true saat mode produksi
      serverKey: functions.config().midtrans.server_key,
      clientKey: functions.config().midtrans.client_key,
    });

    const parameter = {
      transaction_details: {
        order_id: data.orderId,
        gross_amount: data.amount,
      },
      item_details: [{
        id: data.productId,
        price: data.amount,
        quantity: 1,
        name: data.productName,
      }],
      customer_details: {
        email: context.auth.token.email,
        // Anda bisa menambahkan nama atau nomor telepon jika ada
      },
    };

    try {
      const transaction = await snap.createTransaction(parameter);
      const transactionToken = transaction.token;
      console.log("transactionToken:", transactionToken);
      return {token: transactionToken};
    } catch (e) {
      const error = e as Error;
      console.error("Error membuat transaksi Midtrans:", error);
      throw new functions.https.HttpsError("internal", error.message);
    }
  });
