import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_authenticated/debt-free")({
  component: () => <PlaceholderPage titleKey="modDebtFree" />,
});
