import { redirect } from "next/navigation";
import { NextRequest } from "next/server";
import { verifyPaddlePayment } from "@/utils/actions/paddle/actions";
import { SubscriptionPlanType } from "@/lib/types";

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Paddle transaction ID passed as _ptxn or transaction_id or tx_ref
  const ptxn = searchParams.get("_ptxn") || searchParams.get("transaction_id") || searchParams.get("tx_ref");
  const plan = searchParams.get("plan") as SubscriptionPlanType | null;
  const status = searchParams.get("status");

  if (status === "cancelled" || status === "failed") {
    return redirect("/subscription?status=cancelled");
  }

  if (ptxn) {
    try {
      await verifyPaddlePayment(ptxn, plan || undefined);
      return redirect(`/subscription/checkout/success?tx_ref=${ptxn}`);
    } catch (error) {
      console.error("Erreur lors de la vérification du paiement Paddle:", error);
      return redirect("/subscription?status=verification_failed");
    }
  }

  return redirect("/subscription");
};

