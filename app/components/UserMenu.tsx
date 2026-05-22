"use client";

import { useEffect, useState } from "react";

type Profile = {
  email?: string;
  avatarBase64?: string | null;
};

const getInitials = (email?: string) => {
  if (!email) {
    return "EU";
  }
  const name = email.split("@")[0] || "";
  const letters = name.replace(/[^a-zA-Z]/g, "");
  return (letters.slice(0, 2) || "EU").toUpperCase();
};

export default function UserMenu() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      try {
        const response = await fetch("/api/perfil");
        if (!response.ok) {
          return;
        }
        const data = (await response.json()) as Profile;
        if (active) {
          setProfile(data);
        }
      } catch {
        // ignore profile load errors in the menu
      }
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const initials = getInitials(profile?.email);

  return (
    <details className="relative">
      <summary
        className="flex h-10 w-10 list-none cursor-pointer items-center justify-center rounded-full border border-zinc-200 bg-white text-sm font-semibold text-zinc-700 hover:border-zinc-900"
        aria-label="Menu do usuario"
      >
        <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zinc-200 bg-zinc-100 text-xs font-semibold text-zinc-500">
          {profile?.avatarBase64 ? (
            <img
              alt="Foto do usuario"
              className="h-full w-full object-cover"
              src={profile.avatarBase64}
            />
          ) : (
            initials
          )}
        </span>
      </summary>
      <div className="absolute right-0 mt-3 w-48 rounded-2xl border border-zinc-200 bg-white p-2 text-sm shadow-lg">
        <a className="block rounded-xl px-3 py-2 text-zinc-700 hover:bg-zinc-100" href="/perfil">
          Perfil
        </a>
        <form action="/api/logout" method="post">
          <button
            className="mt-1 w-full rounded-xl px-3 py-2 text-left text-rose-600 hover:bg-rose-50"
            type="submit"
          >
            Sair
          </button>
        </form>
      </div>
    </details>
  );
}
