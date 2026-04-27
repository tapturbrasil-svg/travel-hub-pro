import { createFileRoute } from "@tanstack/react-router";
import { Truck } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/translados")({
  component: () => (
    <ModulePlaceholder
      title="Translados"
      description="Gerencie pontos de embarque, vans de apoio e logística complementar."
      icon={Truck}
    />
  ),
  head: () => ({ meta: [{ title: "Translados | TapTur" }] }),
});
