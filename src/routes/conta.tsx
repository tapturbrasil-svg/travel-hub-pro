import { createFileRoute, Outlet } from "@tanstack/react-router";
import { TravelerShell } from "@/components/traveler/TravelerShell";

export const Route = createFileRoute("/conta")({
  component: ContaLayout,
  head: () => ({
    meta: [{ title: "Minha conta | TapTur" }],
  }),
});

function ContaLayout() {
  return (
    <TravelerShell>
      <Outlet />
    </TravelerShell>
  );
}
