import { createFileRoute } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/admin/test")({
  component: TestDbPage,
});

function TestDbPage() {
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testConnection() {
      try {
        // Simple test query
        const { data, error } = await supabase
          .from('agencies')
          .select('count')
          .single();
          
        if (error) {
          if (error.message.includes('does not exist')) {
            setError('Tabela agencies não existe. Execute o SQL no Supabase.');
          } else {
            setError(error.message);
          }
          setStatus('error');
        } else {
          setStatus('success');
        }
      } catch (err: any) {
        setError(err.message);
        setStatus('error');
      }
    }
    
    testConnection();
  }, []);

  return (
    <div className="p-6">
      <h1 className="mb-6 font-display text-3xl font-semibold">Teste de Conexão</h1>
      
      {status === "loading" && (
        <div className="flex h-32 items-center justify-center rounded-lg bg-surface">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <span className="ml-3">Testando conexão...</span>
        </div>
      )}
      
      {status === "error" && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h2 className="font-semibold text-red-700">Erro de conexão</h2>
          <p className="mt-2 text-red-600">{error}</p>
          <div className="mt-4 rounded-lg bg-white p-4">
            <h3 className="font-medium">Solução:</h3>
            <ol className="mt-2 list-inside list-decimal text-sm text-gray-600">
              <li>Acesse o painel do Supabase</li>
              <li>Va em SQL Editor</li>
              <li>Copie o conteúdo do arquivo <code>supabase-schema.sql</code></li>
              <li>Execute o código</li>
              <li>Tente novamente</li>
            </ol>
          </div>
        </div>
      )}
      
      {status === "success" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h2 className="font-semibold text-green-700">✅ Conectado com sucesso!</h2>
          <p className="mt-2 text-green-600">O banco de dados está funcionando.</p>
        </div>
      )}
    </div>
  );
}

import { useState } from "react";