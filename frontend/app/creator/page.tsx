import type { Metadata } from "next";
import { CreatorDashboard } from "@/components/CreatorDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Creator dashboard | Meme'd Payouts",
};

export default function CreatorPage() {
  return (
    <DashboardLayout>
      <CreatorDashboard />
    </DashboardLayout>
  );
}
