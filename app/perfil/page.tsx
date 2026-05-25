"use client";

import { useEffect, useState } from "react";

type Profile = {
  id: string;
  email: string;
  avatarBase64?: string | null;
};

export default function PerfilPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const loadProfile = async () => {
    setLoading(true);
    setStatus("");

    try {
      const response = await fetch("/api/perfil");
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao carregar perfil");
      }
      const data = (await response.json()) as Profile;
      setProfile(data);
      setPreview(data.avatarBase64 || null);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadProfile();
  }, []);

  const handleFile = (file: File | null) => {
    if (!file) {
      setPreview(profile?.avatarBase64 || null);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setPreview(typeof reader.result === "string" ? reader.result : null);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    setStatus("");

    try {
      const response = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarBase64: preview || null }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao salvar perfil");
      }

      const data = (await response.json()) as Profile;
      setProfile(data);
      setPreview(data.avatarBase64 || null);
      setStatus("Perfil atualizado.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setStatus(message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSave = async () => {
    setPasswordStatus("");

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordStatus("Informe a senha atual e a nova senha.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordStatus("A confirmacao nao corresponde a nova senha.");
      return;
    }

    setSavingPassword(true);

    try {
      const response = await fetch("/api/perfil", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Falha ao atualizar senha");
      }

      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordStatus("Senha atualizada.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado";
      setPasswordStatus(message);
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <section className="grid gap-6">
      <header className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500">Conta</p>
        <h1 className="mt-3 text-3xl font-semibold text-zinc-900">Perfil</h1>
        <p className="mt-2 text-sm text-zinc-600">Confira os dados da conta conectada.</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold text-zinc-700">Foto de perfil</p>
          <div className="mt-6 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
            <div className="h-20 w-20 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-100">
              {preview ? (
                <img alt="Foto de perfil" className="h-full w-full object-cover" src={preview} />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-zinc-400">
                  Sem foto
                </div>
              )}
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500" htmlFor="foto">
                Adicionar foto
              </label>
              <input
                id="foto"
                type="file"
                accept="image/*"
                className="text-sm text-zinc-600"
                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
              />
              <p className="text-xs text-zinc-400">PNG ou JPG ate 1-2 MB.</p>
            </div>
          </div>
          <button
            type="button"
            className="mt-6 h-11 w-full rounded-xl bg-zinc-900 text-sm font-semibold text-white"
            onClick={handleSave}
            disabled={saving || loading}
          >
            {saving ? "Salvando..." : "Salvar foto"}
          </button>
        </div>

        <div className="grid gap-6">
          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-zinc-700">Informacoes</h2>
            {loading ? (
              <p className="mt-6 text-sm text-zinc-500">Carregando perfil...</p>
            ) : (
              <div className="mt-6 grid gap-4 text-sm">
                <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-zinc-500">Email</span>
                  <span className="break-all font-semibold text-zinc-900 sm:text-right">
                    {profile?.email || "Nao informado"}
                  </span>
                </div>
                <div className="flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-zinc-500">ID</span>
                  <span className="break-all font-semibold text-zinc-900 sm:text-right">
                    {profile?.id || "Nao informado"}
                  </span>
                </div>
              </div>
            )}
            {status ? <p className="mt-4 text-sm text-zinc-600">{status}</p> : null}
          </div>

          <div className="rounded-3xl border border-zinc-200/70 bg-white/80 p-6 shadow-sm sm:p-8">
            <h2 className="text-sm font-semibold text-zinc-700">Seguranca</h2>
            <div className="mt-6 grid gap-4 text-sm">
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500" htmlFor="senhaAtual">
                  Senha atual
                </label>
                <input
                  id="senhaAtual"
                  type="password"
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
                  value={passwordForm.currentPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500" htmlFor="novaSenha">
                  Nova senha
                </label>
                <input
                  id="novaSenha"
                  type="password"
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
                  value={passwordForm.newPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))
                  }
                />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500" htmlFor="confirmarSenha">
                  Confirmar nova senha
                </label>
                <input
                  id="confirmarSenha"
                  type="password"
                  className="h-11 rounded-xl border border-zinc-300 bg-white px-4 text-sm"
                  value={passwordForm.confirmPassword}
                  onChange={(event) =>
                    setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))
                  }
                />
              </div>
            </div>
            <button
              type="button"
              className="mt-5 h-11 w-full rounded-xl border border-zinc-900 text-sm font-semibold text-zinc-900"
              onClick={handlePasswordSave}
              disabled={savingPassword}
            >
              {savingPassword ? "Atualizando..." : "Atualizar senha"}
            </button>
            {passwordStatus ? (
              <p className="mt-4 text-sm text-zinc-600">{passwordStatus}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
