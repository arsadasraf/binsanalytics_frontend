import type { ReactNode } from "react";
import ResponsiveDashboardLayout from "@/src/components/layouts/ResponsiveDashboardLayout";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <ResponsiveDashboardLayout>{children}</ResponsiveDashboardLayout>;
}
