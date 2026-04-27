import { createFileRoute } from "@tanstack/react-router";
import { Palette } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/landing-page")({
  component: () => (
    <ModulePlaceholder
      title="Landing Page"
      description="Personalize cores, logo, banners e textos da página pública da agência."
      icon={Palette}
    />
  ),
  head: () => ({ meta: [{ title: "Landing Page | TapTur" }] }),
});
