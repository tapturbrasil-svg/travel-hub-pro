import { createFileRoute } from "@tanstack/react-router";
import { UserPlus } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/leads")({
  component: () => (
    <ModulePlaceholder
      title="Leads"
      description="Captação, qualificação e conversão de potenciais viajantes."
      icon={UserPlus}
    />
  ),
  head: () => ({ meta: [{ title: "Leads | TapTur" }] }),
});
