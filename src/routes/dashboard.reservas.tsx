import { createFileRoute } from "@tanstack/react-router";
import { Ticket } from "lucide-react";
import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";

export const Route = createFileRoute("/dashboard/reservas")({
  component: () => (
    <ModulePlaceholder
      title="Reservas"
      description="Acompanhe todas as reservas em tempo real, status de pagamento e check-in."
      icon={Ticket}
    />
  ),
  head: () => ({ meta: [{ title: "Reservas | TapTur" }] }),
});
