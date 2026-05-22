"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

const sessaoOptions = [
  "Manha (08:00 - 12:00)",
  "Tarde (13:00 - 18:00)",
  "Noite (19:00 - 23:00)",
];

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    senha: "",
    sessao: sessaoOptions[0],
    lembrar: false,
  });

  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          senha: form.senha,
          sessao: form.sessao,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao entrar");
      }

      setStatus("Login realizado com sucesso.");

      setTimeout(() => {
        router.push("/");
        router.refresh();
      }, 500);

    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-10 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">
          Acesso
        </p>
        <h1 className="mt-4 text-3xl font-semibold text-zinc-900">Login</h1>
        <p className="mt-3 text-sm text-zinc-600">
          Entre com suas credenciais e escolha a sessao ativa.
        </p>

        <form className="mt-8 grid gap-6" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              value={form.email}
              onChange={(e) =>
                setForm((p) => ({ ...p, email: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="senha">
              Senha
            </label>
            <input
              id="senha"
              type="password"
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              value={form.senha}
              onChange={(e) =>
                setForm((p) => ({ ...p, senha: e.target.value }))
              }
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-zinc-700" htmlFor="sessao">
              Sessao
            </label>
            <select
              id="sessao"
              className="h-12 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
              value={form.sessao}
              onChange={(e) =>
                setForm((p) => ({ ...p, sessao: e.target.value }))
              }
            >
              {sessaoOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 text-sm text-zinc-600">
            <input
              type="checkbox"
              checked={form.lembrar}
              onChange={(e) =>
                setForm((p) => ({ ...p, lembrar: e.target.checked }))
              }
            />
            <label>Manter sessao ativa</label>
          </div>

          {status && <p className="text-sm text-zinc-600">{status}</p>}

          <button
            type="submit"
            className="h-12 rounded-xl bg-zinc-900 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </div>

      <aside className="rounded-3xl border border-zinc-200/70 bg-zinc-900 p-10 text-white shadow-sm">
        <h2 className="text-2xl font-semibold">Dica rapida</h2>
        <p className="mt-4 text-sm text-zinc-200">
          Não compartilhe suas credenciais com outras pessoas.
        </p>
      </aside>
    </section>
  );
}
