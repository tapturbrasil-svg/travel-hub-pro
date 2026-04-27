import { createFileRoute } from "@tanstack/react-router";
import { BarChart3 } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/relatorios")({
  component: () => (
    <ModulePlaceholder
      title="Relatórios"
      description="DRE, ocupação por viagem, top destinos e exportações em CSV."
      icon={BarChart3}
    />
  ),
  head: () => ({ meta: [{ title: "Relatórios | TapTur" }] }),
});
