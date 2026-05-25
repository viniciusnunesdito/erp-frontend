"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { use, useEffect, useState, type FormEvent } from "react";

type Cliente = {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  status: "Ativo" | "Inativo";
};

type ClienteForm = {
  nome: string;
  email: string;
  telefone: string;
  status: Cliente["status"];
};

const emptyForm: ClienteForm = {
  nome: "",
  email: "",
  telefone: "",
  status: "Ativo",
};

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  if (numbers.length <= 10) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

export default function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [form, setForm] = useState<ClienteForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const { id } = use(params);

  useEffect(() => {
    const loadCliente = async () => {
      try {
        const response = await fetch(`/api/clientes/${id}`);

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error || "Falha ao carregar cliente");
        }

        const cliente = (await response.json()) as Cliente;

        setForm({
          nome: cliente.nome,
          email: cliente.email,
          telefone: cliente.telefone || "",
          status: cliente.status,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Erro inesperado";

        setStatus(message);
      } finally {
        setLoading(false);
      }
    };

    void loadCliente();
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setSaving(true);
    setStatus("");

    try {
      const response = await fetch(`/api/clientes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(data?.error || "Falha ao atualizar cliente");
      }

      router.push("/clientes");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";

      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="flex justify-center px-4">
      <div className="w-full max-w-2xl rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Clientes
        </p>

        <h1 className="mt-4 text-3xl font-semibold text-zinc-900">
          Editar cliente
        </h1>

        <p className="mt-3 text-sm text-zinc-600">
          Ajuste os dados e volte para a listagem ao salvar.
        </p>

        {loading ? (
          <p className="mt-8 text-sm text-zinc-500">
            Carregando cliente...
          </p>
        ) : (
          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-700"
                htmlFor="nome"
              >
                Nome
              </label>

              <input
                id="nome"
                required
                className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                value={form.nome}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    nome: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-700"
                htmlFor="email"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                value={form.email}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
              />
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-700"
                htmlFor="telefone"
              >
                Telefone / Celular
              </label>

              <input
                id="telefone"
                type="tel"
                inputMode="numeric"
                placeholder="(16) 99999-9999"
                maxLength={15}
                className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                value={form.telefone}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    telefone: formatPhone(event.target.value),
                  }))
                }
              />

              <p className="text-xs text-zinc-500">
                Digite apenas números que a formatação será aplicada automaticamente.
              </p>
            </div>

            <div className="grid gap-2">
              <label
                className="text-sm font-medium text-zinc-700"
                htmlFor="status"
              >
                Status
              </label>

              <select
                id="status"
                className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm outline-none transition focus:border-zinc-900"
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({
                    ...prev,
                    status: event.target.value as "Ativo" | "Inativo",
                  }))
                }
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>

            {status ? (
              <p className="text-sm text-zinc-600">{status}</p>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="h-11 flex-1 rounded-xl bg-zinc-900 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar alterações"}
              </button>

              <Link
                className="h-11 flex-1 rounded-xl border border-zinc-300 pt-2.5 text-center text-sm font-semibold transition hover:bg-zinc-100"
                href="/clientes"
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
