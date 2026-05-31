import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
  useNavigate,
} from "react-router";

import { useEffect, useState } from "react";

import type { Route } from "./+types/root";
import "./app.css";
import { Button } from "~/components/ui/button";
import { ThemeProvider, useTheme } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";

// Import Komponen Sidebar Primitives dari Shadcn UI
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar";
import { AppSidebar } from "~/components/app-sidebar";

// Import Ikon dari Lucide Icons
import { Moon, Sun, User } from "lucide-react";

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

// 1. KOMPONEN UTAMA LAYOUT (Membungkus Provider)
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          {/* Membungkus dengan SidebarProvider agar primitives Shadcn bisa bekerja */}
          <SidebarProvider defaultOpen={false}>
            <LayoutContent>{children}</LayoutContent>
          </SidebarProvider>
          <ScrollRestoration />
          <Scripts />
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}

// 2. SUB-KOMPONEN KONTEN LAYOUT (Tempat Logika Navigasi & UI Berada)
function LayoutContent({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [headerUser, setHeaderUser] = useState({ name: "Admin" });

  // ==========================================
  // LOGIKA PENGECEKAN HALAMAN AUTHENTICATION
  // ==========================================
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // ==========================================
  // LOGIKA ROUTE PROTECTION (Mencegah Akses Tanpa Login)
  // ==========================================
  useEffect(() => {
    // Ambil status login dari local storage
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    // Jika belum login DAN bukan berada di halaman Auth, tendang ke halaman /login
    if (!isLoggedIn && !isAuthPage) {
      navigate("/login");
    }

    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      setHeaderUser(JSON.parse(storedUser));
    }
  }, [location.pathname, navigate, isAuthPage]); // akan jalan setiap kali ganti route (URL)

  if (isAuthPage) {
    return (
      <main className="flex-1 w-full min-h-screen bg-background">
        {children}
      </main>
    );
  }

  // Jika BUKAN di halaman Auth, render Layout utuh (Dashboard dkk)
  return (
    <div className="flex min-h-screen w-full">
      {/* === SIDEBAR DESKTOP (Permanen) === */}
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />

        {/* === KONTEN UTAMA === */}
        <SidebarInset>
          <div className="flex-1 flex flex-col">
            <header className="sticky z-5 top-0 h-16 border-b bg-background/95 backdrop-blur px-4 flex items-center justify-between">
              {/* Sisi Kiri: Breadcrumb / Nama Halaman Aktif */}
              <SidebarTrigger />

              {/* Sisi Kanan: Preferensi & Profil */}
              <div className="flex items-center gap-2">
                {/* Toggle Theme: Sekarang sudah fungsional */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9 cursor-pointer"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                {/* Profil User di Header root.tsx */}
                <div className="flex items-center gap-2 pl-2">
                  <div className="hidden md:flex flex-col items-end mr-1">
                    <span className="text-xs font-medium leading-none">
                      Administrator
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
                      {headerUser.name}
                    </span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN AREA */}
            <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto">
              {children}
            </main>

            <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-muted/20">
              &copy; {new Date().getFullYear()} Billify. All rights reserved.
            </footer>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}

export default function App() {
  return <Outlet />;
}

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
    <ThemeProvider>
      <div className="pt-8 container mx-auto px-4">
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
