"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, type FormEvent } from "react";

type Produto = {
  sku: string;
  nome: string;
  preco: number;
  estoque: number;
  fotoBase64?: string | null;
};

const emptyForm = {
  nome: "",
  preco: "",
  estoque: "",
  fotoBase64: null as string | null,
};

export default function EditarProdutoPage({
  params,
}: {
  params: Promise<{ sku: string }>;
}) {
  const { sku } = use(params);
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    const loadProduto = async () => {
      try {
        const response = await fetch(`/api/produtos/${sku}`);
        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Falha ao carregar produto");
        }
        const produto = (await response.json()) as Produto;
        setForm({
          nome: produto.nome,
          preco: produto.preco.toString(),
          estoque: produto.estoque.toString(),
          fotoBase64: produto.fotoBase64 ?? null,
        });
        setPreview(produto.fotoBase64 ?? null);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro inesperado";
        setStatus(message);
      } finally {
        setLoading(false);
      }
    };

    void loadProduto();
  }, [sku]);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(form.fotoBase64 || null);
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`/api/produtos/${sku}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao atualizar produto");
      }

      router.push("/produtos");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex justify-center px-4">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Produtos</p>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Editar produto</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Ajuste o catálogo em uma tela dedicada e volte ao salvar.
        </p>
        {loading ? (
          <p className="mt-8 text-sm text-zinc-500">Carregando produto...</p>
        ) : (
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
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
                  {preview ? (
                    <img
                      alt={`Foto de ${form.nome || "produto"}`}
                      className="h-full w-full object-cover"
                      src={preview}
                    />
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
            <div className="flex gap-3">
              <button
                type="submit"
                className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-semibold text-white"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>
              <Link
                className="h-11 flex-1 rounded-xl border border-zinc-300 pt-2.5 text-center text-sm font-semibold"
                href="/produtos"
              >
                Cancelar
              </Link>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}