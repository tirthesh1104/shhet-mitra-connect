import { createFileRoute } from "@tanstack/react-router";
import { PlaceholderPage } from "@/components/placeholder-page";

export const Route = createFileRoute("/_authenticated/beej")({
  component: () => <PlaceholderPage titleKey="modBeej" />,
});
