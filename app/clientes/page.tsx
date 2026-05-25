"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  status: "Ativo" | "Inativo";
  telefone?: string;
};

const emptyForm = {
  nome: "",
  email: "",
  telefone: "",
  status: "Ativo" as const,
};

const statusClasses = (status: Cliente["status"]) => {
  return status === "Ativo"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-rose-100 text-rose-600";
};

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");

  const loadClientes = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/clientes");

      if (!response.ok) {
        throw new Error("Falha ao carregar clientes");
      }

      const data = (await response.json()) as Cliente[];

      setClientes(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";

      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadClientes();
  }, []);

  const filteredClientes = useMemo(() => {
    if (!query.trim()) {
      return clientes;
    }

    const lower = query.toLowerCase();

    return clientes.filter((cliente) => {
      return (
        cliente.nome.toLowerCase().includes(lower) ||
        cliente.id.toLowerCase().includes(lower) ||
        (cliente.telefone || "").toLowerCase().includes(lower)
      );
    });
  }, [clientes, query]);

  const handleDelete = async (id: string) => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || "Falha ao excluir cliente");
      }

      await loadClientes();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";

      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const ativos = clientes.filter(
    (cliente) => cliente.status === "Ativo"
  ).length;

  const inativos = clientes.length - ativos;

  return (
    <section className="grid gap-8">
      <header className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Clientes
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Lista de clientes
            </h1>

            <p className="mt-3 text-sm text-zinc-600">
              Veja os cadastros disponíveis e acesse as ações rapidamente.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="h-11 rounded-full bg-zinc-900 px-5 pt-3 text-sm font-semibold text-white"
              href="/clientes/novo"
            >
              Novo cliente
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Total", value: clientes.length },
            { label: "Ativos", value: ativos },
            { label: "Inativos", value: inativos },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-zinc-200 bg-white p-4"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                {item.label}
              </p>

              <p className="mt-2 text-2xl font-semibold text-zinc-900">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </header>

      <div className="min-w-0 rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-semibold">Base de clientes</h2>

          <input
            type="search"
            placeholder="Buscar cliente"
            className="h-11 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm md:w-72"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        <div className="mt-6 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-zinc-200 pb-2">
          <table className="min-w-[720px] w-full text-left text-sm">
            <thead className="bg-zinc-100/70 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Telefone</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>

            <tbody>
              {filteredClientes.map((cliente) => (
                <tr key={cliente.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {cliente.id}
                  </td>

                  <td className="px-4 py-3">{cliente.nome}</td>

                  <td className="px-4 py-3 text-zinc-600">
                    {cliente.telefone || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses(
                        cliente.status,
                      )}`}
                    >
                      {cliente.status}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold"
                      href={`/clientes/${cliente.id}/editar`}
                    >
                      Editar
                    </Link>

                    <button
                      className="ml-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                      type="button"
                      onClick={() => handleDelete(cliente.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loading ? (
          <p className="mt-4 text-sm text-zinc-500">Atualizando...</p>
        ) : null}

        {status ? (
          <p className="mt-4 text-sm text-zinc-600">{status}</p>
        ) : null}
      </div>
    </section>
  );
}
