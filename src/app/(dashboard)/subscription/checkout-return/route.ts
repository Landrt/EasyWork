import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { verifyFlutterwavePayment } from "@/utils/actions/flutterwave/actions";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const status = searchParams.get("status");
  const txRef = searchParams.get("tx_ref");
  const transactionId = searchParams.get("transaction_id");

  if (status === "cancelled") {
    return redirect("/subscription?status=cancelled");
  }

  if (status === "successful" && transactionId) {
    try {
      await verifyFlutterwavePayment(transactionId, txRef || undefined);
      return redirect(`/subscription/checkout/success?tx_ref=${txRef || transactionId}`);
    } catch (error) {
      console.error("Error processing Flutterwave return:", error);
      return redirect("/subscription?status=verification_failed");
    }
  }

  return redirect("/subscription");
};
