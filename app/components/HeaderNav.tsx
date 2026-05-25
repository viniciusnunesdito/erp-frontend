"use client";

import { useState } from "react";
import UserMenu from "./UserMenu";

type HeaderNavProps = {
  isAuthenticated: boolean;
};

type NavLink = {
  href: string;
  label: string;
};

const authLinks: NavLink[] = [
  { href: "/", label: "Início" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/clientes", label: "Clientes" },
  { href: "/produtos", label: "Produtos" },
  { href: "/vendas", label: "Vendas" },
];

const guestLinks: NavLink[] = [{ href: "/login", label: "Login" }];

export default function HeaderNav({ isAuthenticated }: HeaderNavProps) {
  const [open, setOpen] = useState(false);
  const links = isAuthenticated ? authLinks : guestLinks;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col items-start gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center">
      <div className="flex w-full items-center justify-between lg:w-auto">
        <a className="w-full lg:w-auto" href="/">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-900 text-white">
              ERP
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Painel Administrativo
              </p>
              <p className="text-lg font-semibold">Operações essenciais</p>
            </div>
          </div>
        </a>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-zinc-200 text-zinc-700 transition hover:border-zinc-400 lg:hidden"
          aria-label="Abrir menu"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {open ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M3 6h18" />
                <path d="M3 12h18" />
                <path d="M3 18h18" />
              </>
            )}
          </svg>
        </button>
      </div>

      <nav className="hidden w-full flex-1 flex-wrap items-center justify-start gap-2 text-sm font-medium lg:flex lg:justify-center">
        {links.map((link) => (
          <a
            key={link.href}
            className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
            href={link.href}
          >
            {link.label}
          </a>
        ))}
      </nav>

      <div className="hidden w-full min-w-[3rem] items-center justify-end lg:flex lg:w-auto">
        {isAuthenticated ? <UserMenu /> : null}
      </div>

      {open ? (
        <div className="grid w-full gap-2 rounded-2xl border border-zinc-200 bg-white/90 p-4 shadow-sm lg:hidden">
          {links.map((link) => (
            <a
              key={link.href}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
          {isAuthenticated ? (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
                Conta
              </span>
              <UserMenu />
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
