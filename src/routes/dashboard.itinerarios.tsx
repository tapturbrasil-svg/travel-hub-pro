import { createFileRoute } from "@tanstack/react-router";
import { MapPin } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/itinerarios")({
  component: () => (
    <ModulePlaceholder
      title="Itinerários"
      description="Monte e reaproveite roteiros completos com paradas, horários e atrativos."
      icon={MapPin}
    />
  ),
  head: () => ({ meta: [{ title: "Itinerários | TapTur" }] }),
});
