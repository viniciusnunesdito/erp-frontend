import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import UserMenu from "./components/UserMenu";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ERP Frontend",
  description: "ERP front-end pages for login, sales, and inventory",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("erp_token")?.value);

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-gradient-to-br from-amber-50 via-white to-teal-50 text-zinc-900">
        <div className="min-h-full flex flex-col">
          <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
            <div className="mx-auto flex w-full max-w-6xl items-center gap-6 px-6 py-4">
              <a href="/"><div className="flex items-center gap-3">
                
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
              <nav className="flex flex-1 items-center justify-center gap-2 text-sm font-medium">
                {isAuthenticated ? (
                  <>
                    <a
                      className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
                      href="/"
                    >
                      Início
                    </a>
                    <a
                      className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
                      href="/dashboard"
                    >
                      Dashboard
                    </a>
                    <a
                      className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
                      href="/clientes"
                    >
                      Clientes
                    </a>
                    <a
                      className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
                      href="/produtos"
                    >
                      Produtos
                    </a>
                    <a
                      className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
                      href="/vendas"
                    >
                      Vendas
                    </a>
                  </>
                ) : (
                  <a
                    className="rounded-full px-3 py-2 hover:bg-zinc-900 hover:text-white"
                    href="/login"
                  >
                    Login
                  </a>
                )}
              </nav>
              <div className="flex min-w-[3rem] items-center justify-end">
                {isAuthenticated ? <UserMenu /> : null}
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-6 py-10">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
