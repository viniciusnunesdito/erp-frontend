"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Venda = {
  id: string;
  cliente: string | null;
  data: string;
  total: number;
  itens: Array<{
    id: string;
    produto: string;
    quantidade: number;
    preco: number;
  }>;
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function VendasPage() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const loadVendas = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/vendas");
      if (!response.ok) {
        throw new Error("Falha ao carregar vendas");
      }
      const data = (await response.json()) as Venda[];
      setVendas(data);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadVendas();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Deseja excluir esta venda? O estoque sera devolvido para os produtos existentes.");
    if (!confirmed) {
      return;
    }

    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(`/api/vendas/${id}`, {
        method: "DELETE",
      });

      if (!response.ok && response.status !== 204) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao excluir venda");
      }

      setVendas((prev) => prev.filter((venda) => venda.id !== id));
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const totalVendas = vendas.length;
  const valorTotal = vendas.reduce((acc, venda) => acc + venda.total, 0);

  return (
    <section className="grid gap-8">
      <header className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Vendas
            </p>
            <h1 className="mt-2 text-3xl font-semibold">Lista de vendas</h1>
            <p className="mt-3 text-sm text-zinc-600">
              Consulte os pedidos já registrados e abra a tela separada para criar uma nova.
            </p>
          </div>
          <Link
            className="h-11 rounded-full bg-zinc-900 px-5 pt-3 text-sm font-semibold text-white"
            href="/vendas/nova"
          >
            Nova venda
          </Link>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-2">
          {[
            { label: "Total de vendas", value: totalVendas },
            { label: "Valor movimentado", value: formatCurrency(valorTotal) },
          ].map((item) => (
            <div key={item.label} className="rounded-2xl border border-zinc-200 bg-white p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{item.label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-900">{item.value}</p>
            </div>
          ))}
        </div>
      </header>

      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-8 shadow-sm">
        <h2 className="text-lg font-semibold">Vendas registradas</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-zinc-200">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100/70 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Itens</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3 text-right">Acoes</th>
              </tr>
            </thead>
            <tbody>
              {vendas.map((venda) => (
                <tr key={venda.id} className="border-t border-zinc-200">
                  <td className="px-4 py-3 font-medium text-zinc-900">{venda.id}</td>
                  <td className="px-4 py-3">{venda.cliente || "Sem cliente informado"}</td>
                  <td className="px-4 py-3 text-zinc-600">{formatDate(venda.data)}</td>
                  <td className="px-4 py-3">{venda.itens.length}</td>
                  <td className="px-4 py-3 font-semibold">{formatCurrency(venda.total)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold"
                      href={`/vendas/${venda.id}`}
                    >
                      Ver
                    </Link>
                    <button
                      className="ml-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                      type="button"
                      onClick={() => void handleDelete(venda.id)}
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {loading ? <p className="mt-4 text-sm text-zinc-500">Atualizando...</p> : null}
        {status ? <p className="mt-4 text-sm text-zinc-600">{status}</p> : null}
      </div>
    </section>
  );
}
