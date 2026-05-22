export default function Home() {
  return (
    <section className="flex flex-col gap-10">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-10 shadow-sm">
        <div className="flex flex-col gap-6">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-teal-700">
            ERP - Administrativo
          </p>
          <h1 className="text-4xl font-semibold leading-tight text-zinc-900">
            Use os atalhos abaixo para navegar entre as telas principais e
            acompanhar indicadores do negócio.
          </h1>
          <div className="flex flex-wrap gap-3 text-sm font-semibold">
            <a className="rounded-full bg-zinc-900 px-4 py-2 text-white" href="/dashboard">
              Abrir dashboard
            </a>
            <a className="rounded-full border border-zinc-300 px-4 py-2" href="/vendas">
              Gerenciar vendas
            </a>
            <a className="rounded-full border border-zinc-300 px-4 py-2" href="/produtos">
              Gerenciar produtos
            </a>
            <a className="rounded-full border border-zinc-300 px-4 py-2" href="/clientes">
              Gerenciar clientes
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
