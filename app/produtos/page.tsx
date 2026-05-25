"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Produto = {
  sku: string;
  nome: string;
  preco: number;
  estoque: number;
  fotoBase64?: string | null;
  createdAt?: string;
};

type SortOption =
  | "nome"
  | "preco-asc"
  | "preco-desc"
  | "estoque"
  | "estoque-menor"
  | "recentes"
  | "antigos";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("nome");

  const loadProdutos = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/produtos");

      if (!response.ok) {
        throw new Error("Falha ao carregar produtos");
      }

      const data = (await response.json()) as Produto[];

      setProdutos(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";

      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProdutos();
  }, []);

  const filteredProdutos = useMemo(() => {
    let resultado = [...produtos];

    if (query.trim()) {
      const lower = query.toLowerCase();

      resultado = resultado.filter((produto) => {
        return (
          produto.nome.toLowerCase().includes(lower) ||
          produto.sku.toLowerCase().includes(lower)
        );
      });
    }

    switch (sortBy) {
      case "nome":
        resultado.sort((a, b) => a.nome.localeCompare(b.nome));
        break;

      case "preco-asc":
        resultado.sort((a, b) => a.preco - b.preco);
        break;

      case "preco-desc":
        resultado.sort((a, b) => b.preco - a.preco);
        break;

      case "estoque":
        resultado.sort((a, b) => b.estoque - a.estoque);
        break;

      case "estoque-menor":
        resultado.sort((a, b) => a.estoque - b.estoque);
        break;

      case "recentes":
        resultado.sort(
          (a, b) =>
            new Date(b.createdAt || "").getTime() -
            new Date(a.createdAt || "").getTime()
        );
        break;

      case "antigos":
        resultado.sort(
          (a, b) =>
            new Date(a.createdAt || "").getTime() -
            new Date(b.createdAt || "").getTime()
        );
        break;
    }

    return resultado;
  }, [produtos, query, sortBy]);

  const handleDelete = async (sku: string) => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch(`/api/produtos/${sku}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || "Falha ao excluir produto");
      }

      await loadProdutos();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";

      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const estoqueBaixo = produtos.filter(
    (produto) => produto.estoque <= 10
  ).length;

  return (
    <section className="grid gap-8">
      <header className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
              Produtos
            </p>

            <h1 className="mt-2 text-3xl font-semibold">
              Lista de produtos
            </h1>

            <p className="mt-3 text-sm text-zinc-600">
              Confira o estoque disponível e abra as ações de edição e remoção.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              className="h-11 rounded-full bg-zinc-900 px-5 pt-3 text-sm font-semibold text-white"
              href="/produtos/novo"
            >
              Novo produto
            </Link>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { label: "Total", value: produtos.length },
            { label: "Estoque baixo", value: estoqueBaixo },
            { label: "Em destaque", value: filteredProdutos.length },
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
          <h2 className="text-lg font-semibold">Catálogo</h2>

          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <select
              className="h-11 rounded-full border border-zinc-300 bg-white px-4 text-sm"
              value={sortBy}
              onChange={(event) =>
                setSortBy(event.target.value as SortOption)
              }
            >
              <option value="nome">Ordenar por nome</option>
              <option value="recentes">Mais recentes</option>
              <option value="antigos">Mais antigos</option>
              <option value="estoque">Maior estoque</option>
              <option value="estoque-menor">Menor estoque</option>
              <option value="preco-asc">Menor preço</option>
              <option value="preco-desc">Maior preço</option>
            </select>

            <input
              type="search"
              placeholder="Buscar produto"
              className="h-11 w-full rounded-full border border-zinc-300 bg-white px-4 text-sm md:w-72"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="mt-6 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain rounded-2xl border border-zinc-200 pb-2">
          <table className="min-w-[840px] w-full text-left text-sm">
            <thead className="bg-zinc-100/70 text-xs uppercase tracking-[0.2em] text-zinc-500">
              <tr>
                <th className="px-4 py-3">Foto</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Preço</th>
                <th className="px-4 py-3">Estoque</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>

            <tbody>
              {filteredProdutos.map((produto) => (
                <tr key={produto.sku} className="border-t border-zinc-200">
                  <td className="px-4 py-3">
                    <div className="h-10 w-10 overflow-hidden rounded-xl border border-zinc-200 bg-zinc-100">
                      {produto.fotoBase64 ? (
                        <img
                          alt={`Foto de ${produto.nome}`}
                          className="h-full w-full object-cover"
                          src={produto.fotoBase64}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                          Sem foto
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-4 py-3 font-medium text-zinc-900">
                    {produto.sku}
                  </td>

                  <td className="px-4 py-3">{produto.nome}</td>

                  <td className="px-4 py-3 text-zinc-600">
                    {formatCurrency(produto.preco)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                      {produto.estoque} un
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Link
                      className="rounded-full border border-zinc-300 px-3 py-1 text-xs font-semibold"
                      href={`/produtos/${produto.sku}/editar`}
                    >
                      Editar
                    </Link>

                    <button
                      className="ml-2 rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600"
                      type="button"
                      onClick={() => handleDelete(produto.sku)}
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
