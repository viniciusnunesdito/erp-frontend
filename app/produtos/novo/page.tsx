"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

const emptyForm = {
  nome: "",
  preco: "",
  estoque: "",
  fotoBase64: null as string | null,
};

export default function NovoProdutoPage() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao salvar produto");
      }

      router.push("/produtos");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(null);
      setForm((prev) => ({ ...prev, fotoBase64: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setPreview(result);
      setForm((prev) => ({ ...prev, fotoBase64: result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Produtos</p>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Novo produto</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Cadastre um novo item e retorne para o catálogo ao concluir.
        </p>
        <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="nome">Nome</label>
            <input
              id="nome"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              value={form.nome}
              onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="preco">Preço</label>
            <input
              id="preco"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              value={form.preco}
              onChange={(event) => setForm((prev) => ({ ...prev, preco: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="estoque">Estoque</label>
            <input
              id="estoque"
              className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              value={form.estoque}
              onChange={(event) => setForm((prev) => ({ ...prev, estoque: event.target.value }))}
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="foto">
              Foto
            </label>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-14 w-14 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                {preview ? (
                  <img alt="Foto do produto" className="h-full w-full object-cover" src={preview} />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[10px] uppercase tracking-[0.2em] text-zinc-400">
                    Sem foto
                  </div>
                )}
              </div>
              <input
                id="foto"
                type="file"
                accept="image/*"
                className="text-sm text-zinc-600"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
            </div>
            <p className="text-xs text-zinc-400">PNG ou JPG ate 1-2 MB.</p>
          </div>
          {status ? <p className="text-sm text-zinc-600">{status}</p> : null}
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-semibold text-white"
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar produto"}
            </button>
            <Link
              className="h-11 flex-1 rounded-xl border border-zinc-300 pt-2.5 text-center text-sm font-semibold"
              href="/produtos"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </section>
  );
}