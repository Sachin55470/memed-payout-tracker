import type { Metadata } from "next";
import { BrandDashboard } from "@/components/BrandDashboard";
import { DashboardLayout } from "@/components/DashboardLayout";

export const metadata: Metadata = {
  title: "Brand dashboard | Meme'd Payouts",
};

export default function BrandPage() {
  return (
    <DashboardLayout>
      <BrandDashboard />
    </DashboardLayout>
  );
}
