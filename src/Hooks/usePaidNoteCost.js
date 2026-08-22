import { useSelector } from "react-redux";

const PAID_NOTE_AMOUNT = process.env.NEXT_PUBLIC_PAID_NOTE_AMOUNT;
const PAID_NOTE_AMOUNT_BASIC_PLAN = process.env.NEXT_PUBLIC_PAID_NOTE_AMOUNT_BASIC_PLAN;

export default function usePaidNoteCost() {
  const subscription = useSelector((state) => state.subscription);
  const isPremiumPlan = subscription?.status?.plan === "premium" && subscription?.status?.active;
  const isBasicPlan = subscription?.status?.plan === "basic" && subscription?.status?.active;
  const paidNoteAmount = isPremiumPlan ? 0 : isBasicPlan ? PAID_NOTE_AMOUNT_BASIC_PLAN : PAID_NOTE_AMOUNT;

  return { paidNoteAmount, isPremiumPlan, isBasicPlan };
}
