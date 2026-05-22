import { createFileRoute } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import React from "react";
import { LayoutBoard } from "@/components/LayoutBoard";
import "@/styles/mobile-header.css";

export const Route = createFileRoute("/dashboard/rifas/viewer")({
  component: RifasViewerPage,
  head: () => ({ meta: [{ title: "Gestão Rifas" }] }),
});

export function RifasViewerPage() {
  const params = useParams({ from: "/dashboard/rifas/viewer/{rifaId}" });
  const rifaId = params.rifaId;
  const [menuOpen, setMenuOpen] = React.useState(false);

  // grid placeholder
  const rows = 4; const cols = 5;
  const cells = Array.from({ length: rows * cols }).map((_, i) => {
    return { id: `cell-${i}`, label: '' , filled: i % 3 === 0 };
  });

  return (
    <div className="viewer-app" style={{ height: '100vh' }}>
      <header className="mobile-header">
        <button aria-label="menu" className="burger" onClick={() => setMenuOpen((v)=>!v)}>☰</button>
        <div className="logo" aria-label="logo" style={{ margin: '0 auto' }}>TapTur Rifas</div>
        <div style={{ width: 40 }} />
      </header>
      <aside className={"mobile-drawer" + (menuOpen ? ' open' : '')} aria-label="drawer">
        <div style={{ padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 8 }}>Ferramentas</div>
          {['Ver','Copiar link','Exportar'].map((t, idx)=> (
            <div key={idx} style={{ padding:12, borderBottom:'1px solid #eee' }}>{t}</div>
          ))}
        </div>
      </aside>
      <main className="viewer-content" style={{ display:'flex', alignItems:'center', justifyContent:'center', paddingTop: 74 }}>
        <LayoutBoard rows={rows} cols={cols} cells={cells.map((c)=>({ id: c.id, label: c.label, filled: c.filled }))} />
      </main>
    </div>
  );
}
