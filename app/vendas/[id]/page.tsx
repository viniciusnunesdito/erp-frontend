"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";

type VendaItem = {
  id: string;
  produto: string;
  quantidade: number;
  precoOriginal?: number;
  desconto?: number;
  preco: number;
};

type Venda = {
  id: string;
  cliente: string | null;
  data: string;
  total: number;
  createdAt?: string;
  itens: VendaItem[];
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

const formatDateTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
};

export default function VendaDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const loadVenda = async () => {
      try {
        const response = await fetch(`/api/vendas/${id}`);
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Falha ao carregar venda");
        }
        const data = (await response.json()) as Venda;
        setVenda(data);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro inesperado";
        setStatus(message);
      } finally {
        setLoading(false);
      }
    };

    void loadVenda();
  }, [id]);

  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-4xl rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Vendas
            </p>
            <h1 className="mt-4 text-3xl font-semibold text-zinc-900">
              Detalhes da venda
            </h1>
          </div>

          <Link
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm font-semibold"
            href="/vendas"
          >
            Voltar
          </Link>
        </div>

        {loading ? (
          <p className="mt-8 text-sm text-zinc-500">Carregando venda...</p>
        ) : venda ? (
          <div className="mt-8 grid gap-6">
            <div className="grid gap-3 rounded-2xl border border-zinc-200 bg-white p-4 text-sm sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Venda</span>
                <span className="font-semibold text-zinc-900">
                  {venda.id}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Cliente</span>
                <span className="font-semibold text-zinc-900">
                  {venda.cliente || "Sem cliente informado"}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Data</span>
                <span className="font-semibold text-zinc-900">
                  {formatDateTime(venda.data || venda.createdAt || "")}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-500">Total</span>
                <span className="font-semibold text-zinc-900">
                  {formatCurrency(venda.total)}
                </span>
              </div>
            </div>

            <div className="min-w-0 rounded-2xl border border-zinc-200 bg-white p-4 sm:p-6">
              <h2 className="text-lg font-semibold">Itens</h2>

              <div className="mt-4 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-zinc-200 pb-2">
                <table className="min-w-[840px] w-full text-left text-sm">
                  <thead className="bg-zinc-100/70 text-xs uppercase tracking-[0.2em] text-zinc-500">
                    <tr>
                      <th className="px-4 py-3">Produto</th>
                      <th className="px-4 py-3">Qtd</th>
                      <th className="px-4 py-3">Preco original</th>
                      <th className="px-4 py-3">Desconto</th>
                      <th className="px-4 py-3">Preco final</th>
                      <th className="px-4 py-3">Subtotal</th>
                    </tr>
                  </thead>

                  <tbody>
                    {venda.itens.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-zinc-200"
                      >
                        <td className="px-4 py-3">{item.produto}</td>
                        <td className="px-4 py-3">{item.quantidade}</td>
                        <td className="px-4 py-3">
                          {formatCurrency(
                            item.precoOriginal ?? item.preco
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(item.desconto ?? 0)}
                        </td>
                        <td className="px-4 py-3">
                          {formatCurrency(item.preco)}
                        </td>
                        <td className="px-4 py-3 font-medium">
                          {formatCurrency(
                            item.quantidade * item.preco
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-8 text-sm text-rose-600">
            {status || "Venda não encontrada."}
          </p>
        )}
      </div>
    </section>
  );
}
