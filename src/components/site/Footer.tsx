export function Footer() {
  return (
    <footer className="mt-32 border-t border-border bg-surface-elevated">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <span className="font-display text-lg font-bold">T</span>
              </div>
              <span className="font-display text-xl font-semibold tracking-tight">
                TapTur
              </span>
            </div>
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              A plataforma que conecta você às melhores agências de viagem do Brasil.
            </p>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Explorar</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Todas as viagens</a></li>
              <li><a href="#" className="hover:text-foreground">Pacotes nacionais</a></li>
              <li><a href="#" className="hover:text-foreground">Excursões em grupo</a></li>
              <li><a href="#" className="hover:text-foreground">Ofertas relâmpago</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Para agências</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Cadastre sua agência</a></li>
              <li><a href="#" className="hover:text-foreground">Como funciona</a></li>
              <li><a href="#" className="hover:text-foreground">Planos e preços</a></li>
              <li><a href="#" className="hover:text-foreground">Central da agência</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm font-semibold">Suporte</h4>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-foreground">Central de ajuda</a></li>
              <li><a href="#" className="hover:text-foreground">Política de privacidade</a></li>
              <li><a href="#" className="hover:text-foreground">Termos de uso</a></li>
              <li><a href="#" className="hover:text-foreground">Contato</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} TapTur. Todos os direitos reservados.</p>
          <p>Feito com cuidado para quem ama viajar.</p>
        </div>
      </div>
    </footer>
  );
}
