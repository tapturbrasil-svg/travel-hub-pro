import { createFileRoute } from "@tanstack/react-router";
import { UserCog } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/usuarios")({
  component: () => (
    <ModulePlaceholder
      title="Usuários"
      description="Convide colaboradores, defina papéis e permissões dentro da agência."
      icon={UserCog}
    />
  ),
  head: () => ({ meta: [{ title: "Usuários | TapTur" }] }),
});
