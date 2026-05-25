import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import HeaderNav from "./components/HeaderNav";
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
  description: "ERP front-end para operações essenciais de vendas, clientes e produtos.",
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
      <body className="min-h-full overflow-x-hidden bg-gradient-to-br from-amber-50 via-white to-teal-50 text-zinc-900">
        <div className="min-h-full flex flex-col">
          <header className="sticky top-0 z-10 border-b border-zinc-200/70 bg-white/70 backdrop-blur">
            <HeaderNav isAuthenticated={isAuthenticated} />
          </header>
          <main className="flex-1">
            <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
