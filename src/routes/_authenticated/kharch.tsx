import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_authenticated/kharch")({
  component: () => <PlaceholderPage titleKey="modKharch" />,
});
