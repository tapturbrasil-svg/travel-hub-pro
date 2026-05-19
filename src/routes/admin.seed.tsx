import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/seed")({
  component: SeedDataPage,
});

function SeedDataPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const createSampleData = async () => {
    setLoading(true);
    setResult("");
    setError("");
    
    try {
      // Verificar se já existem agências
      const { data: existingAgencies } = await supabase.from("agencies").select("id, slug");
      
      // Deletar dados relacionados primeiro
      setResult("Limpando dados...");
      await supabase.from("rifa_participants").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("rifas").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("reservations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("trips").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("subscriptions").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("support_tickets").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("users").delete().neq("id", "00000000-0000-0000-0000-000000000000");
      await supabase.from("agencies").delete().neq("id", "00000000-0000-0000-0000-000000000000");

      // 1. Criar agências
      setResult("1/8 Criando agências...");
      const { data: agencies, error: agenciesError } = await supabase
        .from("agencies")
        .upsert([
          { name: "Tap Viagens", slug: "tap-viagens", email: "contato@tapviagens.com.br", phone: "(11) 99999-0001", plan: "professional", status: "active", brand_color: "#0EA5E9" },
          { name: "GramaTur", slug: "gramatur", email: "contato@gramatur.com.br", phone: "(54) 99999-0002", plan: "starter", status: "active", brand_color: "#22C55E" },
          { name: "Praia Travel", slug: "praia-travel", email: "contato@praitravel.com.br", phone: "(82) 99999-0003", plan: "enterprise", status: "active", brand_color: "#F59E0B" },
          { name: "Nordeste Tours", slug: "nordeste-tours", email: "contato@nordestetours.com.br", phone: "(85) 99999-0004", plan: "free", status: "pending", brand_color: "#EF4444" },
          { name: "Serra Magic", slug: "serra-magic", email: "contato@serramagic.com.br", phone: "(54) 99999-0005", plan: "professional", status: "suspended", brand_color: "#8B5CF6" },
        ], { onConflict: "slug" })
        .select();

      if (agenciesError) throw new Error(`Agências: ${agenciesError.message}`);
      setResult(`✅ ${agencies?.length || 0} agências criadas!`);
      
      // 2. Criar usuários
      setResult("2/8 Criando usuários...");
      const { error: usersError } = await supabase
        .from("users")
        .insert([
          { agency_id: agencies?.[0]?.id, name: "Carlos Silva", email: "carlos@tapviagens.com.br", phone: "(11) 99999-1111", role: "agency_owner", status: "active" },
          { agency_id: agencies?.[0]?.id, name: "Ana Costa", email: "ana@tapviagens.com.br", phone: "(11) 99999-1112", role: "agency_user", status: "active" },
          { agency_id: agencies?.[1]?.id, name: "Maria Santos", email: "maria@gramatur.com.br", phone: "(54) 99999-2222", role: "agency_owner", status: "active" },
          { agency_id: agencies?.[2]?.id, name: "João Pedro", email: "joao@praiatravel.com.br", phone: "(82) 99999-3333", role: "agency_owner", status: "active" },
          { name: "Admin Sistema", email: "admin@taptur.com.br", phone: "(11) 99999-0000", role: "admin", status: "active" },
        ]);

      if (usersError) throw new Error(`Users: ${usersError.message}`);
      setResult("✅ Usuários criados!");

// 3. Criar viagens
      setResult("3/8 Criando viagens...");
      
      // Deletar viagens existentes primeiro
      await supabase.from("trips").delete().eq("agency_id", agencies?.[0]?.id);
      await supabase.from("trips").delete().eq("agency_id", agencies?.[1]?.id);
      await supabase.from("trips").delete().eq("agency_id", agencies?.[2]?.id);
      
      const { data: trips, error: tripsError } = await supabase
        .from("trips")
        .insert([
          { agency_id: agencies?.[0]?.id, title: "Viagem para João Pessoa", slug: "viagem-joao-pessoa", destination: "João Pessoa", state: "PB", departure_date: "2026-06-15", return_date: "2026-06-20", price_adult: 1200, price_child: 600, total_seats: 48, available_seats: 35, status: "active", description: "Pacote completo para João Pessoa com hospedagem e translado" },
          { agency_id: agencies?.[0]?.id, title: "Final de Semana em Gramado", slug: "gramado-inverno", destination: "Gramado", state: "RS", departure_date: "2026-07-10", return_date: "2026-07-13", price_adult: 890, price_child: 445, total_seats: 48, available_seats: 42, status: "active", description: "4 dias no clima serrano de Gramado" },
          { agency_id: agencies?.[0]?.id, title: "Carnaval na Praia", slug: "carnaval-ferradas", destination: "Praia Grande", state: "SP", departure_date: "2026-02-12", return_date: "2026-02-16", price_adult: 1500, price_child: 750, total_seats: 48, available_seats: 12, status: "active", description: "Carnaval com tudo incluído!" },
          { agency_id: agencies?.[1]?.id, title: "Serra Gaúcha", slug: "serra-gaucha", destination: "Serra Gaúcha", state: "RS", departure_date: "2026-08-01", return_date: "2026-08-05", price_adult: 1100, price_child: 550, total_seats: 44, available_seats: 38, status: "active" },
          { agency_id: agencies?.[2]?.id, title: "Litoral Nordestino", slug: "nordeste-praia", destination: "Maceió", state: "AL", departure_date: "2026-05-20", return_date: "2026-05-24", price_adult: 980, price_child: 490, total_seats: 40, available_seats: 28, status: "active" },
        ])
        .select();

      if (tripsError) throw new Error(`Trips: ${tripsError.message}`);
      setResult(`✅ ${trips?.length || 0} viagens criadas!`);

      // 4. Criar reservas
      setResult("4/8 Criando reservas...");
      const { error: reservationsError } = await supabase
        .from("reservations")
        .insert([
          { agency_id: agencies?.[0]?.id, trip_id: trips?.[0]?.id, customer_name: "Pedro Santos", customer_email: "pedro@email.com", customer_phone: "(11) 99999-4444", total_value: 2400, status: "confirmed", payment_method: "PIX", created_at: "2026-05-01" },
          { agency_id: agencies?.[0]?.id, trip_id: trips?.[0]?.id, customer_name: "Julia Lima", customer_email: "julia@email.com", customer_phone: "(11) 99999-5555", total_value: 1200, status: "confirmed", payment_method: "Cartão", created_at: "2026-05-02" },
          { agency_id: agencies?.[0]?.id, trip_id: trips?.[1]?.id, customer_name: "Mario Oliveira", customer_email: "mario@email.com", customer_phone: "(11) 99999-6666", total_value: 1780, status: "pending", payment_method: "Boleto", created_at: "2026-05-03" },
          { agency_id: agencies?.[0]?.id, trip_id: trips?.[2]?.id, customer_name: "Ana Paula", customer_email: "anapaula@email.com", customer_phone: "(21) 99999-7777", total_value: 3000, status: "confirmed", payment_method: "PIX", created_at: "2026-04-28" },
          { agency_id: agencies?.[1]?.id, trip_id: trips?.[3]?.id, customer_name: "Carlos Mendes", customer_email: "carlos@email.com", customer_phone: "(51) 99999-8888", total_value: 2200, status: "confirmed", payment_method: "Cartão", created_at: "2026-05-01" },
        ]);

      if (reservationsError) throw new Error(`Reservations: ${reservationsError.message}`);
      setResult("✅ Reservas criadas!");

      // 5. Criar rifas
      setResult("5/8 Criando rifas...");
      const { data: rifas, error: rifasError } = await supabase
        .from("rifas")
        .insert([
          { agency_id: agencies?.[0]?.id, title: "Sorteio Viagem PG", description: "Ganhe uma viagem completa!", prize: "Viagem para Gramado", prize_value: 1200, ticket_price: 25, total_tickets: 100, sold_tickets: 45, draw_date: "2026-06-01", status: "ativa", primary_color: "#0EA5E9" },
          { agency_id: agencies?.[0]?.id, title: "Sorteio Natal", description: "Sorteio de Natal", prize: "Presente R$500", prize_value: 500, ticket_price: 15, total_tickets: 200, sold_tickets: 120, draw_date: "2026-12-25", status: "ativa", primary_color: "#EF4444" },
          { agency_id: agencies?.[1]?.id, title: "Sorteio Serra", description: "Viajem para a serra", prize: "Final de semana", prize_value: 800, ticket_price: 20, total_tickets: 50, sold_tickets: 50, draw_date: "2026-05-15", status: "encerrada", primary_color: "#22C55E" },
        ])
        .select();

      if (rifasError) throw new Error(`Rifas: ${rifasError.message}`);
      setResult(`✅ ${rifas?.length || 0} rifas criadas!`);

      // 6. Criar participantes de rifa
      setResult("6/8 Criando participantes de rifa...");
      const { error: participantesError } = await supabase
        .from("rifa_participants")
        .insert([
          { rifa_id: rifas?.[0]?.id, name: "João Silva", email: "joao@teste.com", phone: "(11) 99999-0001", tickets: 1 },
          { rifa_id: rifas?.[0]?.id, name: "Maria Santos", email: "maria@teste.com", phone: "(11) 99999-0002", tickets: 5 },
          { rifa_id: rifas?.[0]?.id, name: "Pedro Costa", email: "pedro@teste.com", phone: "(11) 99999-0003", tickets: 10 },
          { rifa_id: rifas?.[0]?.id, name: "Ana Oliveira", email: "ana@teste.com", phone: "(11) 99999-0004", tickets: 15 },
          { rifa_id: rifas?.[1]?.id, name: "Carlos Lima", email: "carlos@teste.com", phone: "(11) 99999-0005", tickets: 1 },
          { rifa_id: rifas?.[1]?.id, name: "Julia Mendes", email: "julia@teste.com", phone: "(11) 99999-0006", tickets: 2 },
        ]);

      if (participantesError) throw new Error(`Participantes: ${participantesError.message}`);
      setResult("✅ Participantes de rifa criados!");

      // 7. Criar assinaturas
      setResult("7/8 Criando assinaturas...");
      const { error: subscriptionsError } = await supabase
        .from("subscriptions")
        .insert([
          { agency_id: agencies?.[0]?.id, plan: "professional", price: 299, status: "active", start_date: "2026-01-01", end_date: "2026-12-31" },
          { agency_id: agencies?.[1]?.id, plan: "starter", price: 99, status: "active", start_date: "2026-01-01", end_date: "2026-12-31" },
          { agency_id: agencies?.[2]?.id, plan: "enterprise", price: 997, status: "active", start_date: "2026-01-01", end_date: "2026-12-31" },
          { agency_id: agencies?.[3]?.id, plan: "free", price: 0, status: "active", start_date: "2026-01-01", end_date: "2026-12-31" },
        ]);

      if (subscriptionsError) throw new Error(`Subscriptions: ${subscriptionsError.message}`);
      setResult("✅ Assinaturas criadas!");

      // 8. Criar tickets de suporte
      setResult("8/8 Criando tickets de suporte...");
      const { error: ticketsError } = await supabase
        .from("support_tickets")
        .insert([
          { agency_id: agencies?.[0]?.id, subject: "Não consigo emitir bilingue", description: "Preciso emitir bilingue para a viagem", status: "open", priority: "high" },
          { agency_id: agencies?.[0]?.id, subject: "Dúvida sobre comissão", description: "Como calcular comissão?", status: "pending", priority: "medium" },
          { agency_id: agencies?.[1]?.id, subject: "Troca de plano", description: "Quero mudar para enterprise", status: "resolved", priority: "low" },
          { agency_id: agencies?.[2]?.id, subject: "Erro no checkout", description: "Clients não consegue pagar", status: "open", priority: "critical" },
        ]);

      if (ticketsError) throw new Error(`Tickets: ${ticketsError.message}`);
      setResult("✅ Tickets de suporte criados!");

      setResult("🎉 TODOS OS DADOS CRIADOS COM SUCESSO!");

      setTimeout(() => navigate({ to: "/admin" }), 2000);

    } catch (err: any) {
      setError(err.message || "Erro desconhecido");
      setResult("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md text-center">
        <h1 className="mb-6 font-display text-3xl font-semibold">Criar Dados de Exemplo</h1>
        
        {!loading && !result && !error && (
          <button
            onClick={createSampleData}
            disabled={loading}
            className="rounded-lg bg-primary px-6 py-3 text-white disabled:opacity-50"
          >
            {loading ? "Criando..." : "Criar Dados de Exemplo"}
          </button>
        )}
        
        {loading && (
          <div className="rounded-lg bg-surface p-4 text-lg">
            {result || "Carregando..."}
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-destructive/10 p-4 text-lg text-destructive">
            ❌ Erro: {error}
          </div>
        )}
        
        {result && !error && (
          <button
            onClick={() => navigate({ to: "/admin" })}
            className="mt-4 rounded-lg border px-6 py-2"
          >
            Ir para Admin
          </button>
        )}
      </div>
    </div>
  );
}