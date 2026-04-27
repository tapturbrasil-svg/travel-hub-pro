import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/configuracoes")({
  component: () => (
    <ModulePlaceholder
      title="Configurações"
      description="Dados da empresa, integrações de pagamento, e-mail e preferências gerais."
      icon={Settings}
    />
  ),
  head: () => ({ meta: [{ title: "Configurações | TapTur" }] }),
});
