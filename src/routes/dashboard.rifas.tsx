import { createFileRoute } from "@tanstack/react-router";
import { Gift } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/rifas")({
  component: () => (
    <ModulePlaceholder
      title="Rifas"
      description="Crie rifas para captar leads, aumentar a base e divulgar viagens."
      icon={Gift}
    />
  ),
  head: () => ({ meta: [{ title: "Rifas | TapTur" }] }),
});
