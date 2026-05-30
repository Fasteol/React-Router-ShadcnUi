import {
  isRouteErrorResponse,
  Link, // 1. Tambahan: Import Link untuk menu navigasi
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { Button } from "~/components/ui/button"; // 2. Tambahan: Import Button Shadcn
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

// Komponen Layout: Membungkus seluruh aplikasi, termasuk saat terjadi error
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      {/* 3. Tambahan: Class Tailwind untuk membuat layout full-height (min-h-screen) */}
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased">
        <ThemeProvider>
          {/* === HEADER / NAVBAR GLOBAL === */}
          <header className="border-b sticky top-0 bg-background/90 backdrop-blur z-50">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
              <div className="font-bold text-xl tracking-tight">LearnReact</div>
              <nav className="flex items-center gap-4">
                <Button asChild variant="ghost">
                  <Link to="/">Dashboard</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/transaction">Transaction</Link>
                </Button>
                <Button asChild variant="ghost">
                  <Link to="/about">About</Link>
                </Button>
              </nav>
            </div>
          </header>

          {/* === KONTEN UTAMA (Tempat halaman atau error dirender) === */}
          <main className="flex-1 container mx-auto p-4 flex flex-col">
            {children}
          </main>

          {/* === FOOTER GLOBAL === */}
          <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-muted/50">
            &copy; {new Date().getFullYear()} LearnReact. All rights reserved.
          </footer>

          <ScrollRestoration />
          <Scripts />
        </ThemeProvider>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}

// Komponen App: Merender halaman berdasarkan URL (masuk ke dalam {children} di atas)
export default function App() {
  return <Outlet />;
}

// Komponen ErrorBoundary: Merender pesan error (masuk ke dalam {children} di atas)
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    // 4. Perubahan kecil: Mengganti <main> menjadi <div> agar tidak ada tag <main> ganda di HTML
    <ThemeProvider>
      <div className="pt-8">
        <h1 className="text-3xl font-bold mb-2">{message}</h1>
        <p className="text-muted-foreground mb-4">{details}</p>
        {stack && (
          <pre className="w-full p-4 overflow-x-auto rounded-md text-sm border">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </ThemeProvider>
  );
}
