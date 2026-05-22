import { redirect } from "next/navigation";
import { FEATURES } from "@/lib/feature-flags";

export default function TransfersPage() {
  if (!FEATURES.TRANSFERS) redirect("/");
  // FEATURES.TRANSFERS is true — render transfers UI here when re-enabled
}
