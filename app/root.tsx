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

// IMPORT DATA DUMMY TIM SEBAGAI FALLBACK ROLE
import { dataAwalTim } from "~/data/invoices";

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

// ==========================================
// UTILITY: MENDAPATKAN NAMA HALAMAN DARI URL
// ==========================================
const getPageTitle = (pathname: string) => {
  if (pathname === "/") return "Ringkasan Dashboard";
  if (pathname === "/transaction") return "Kelola Transaksi";
  if (pathname === "/expense") return "Catatan Pengeluaran";
  if (pathname === "/client") return "Database Klien";
  if (pathname === "/service") return "Katalog Layanan";
  if (pathname === "/report") return "Laporan & Ekspor";
  if (pathname === "/team") return "Manajemen Tim";
  if (pathname === "/setting") return "Pengaturan Sistem";
  if (pathname === "/about") return "Tentang Sistem";
  return "Ruang Kerja Utama";
};

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

  // State user kini menampung property 'role'
  const [headerUser, setHeaderUser] = useState({
    name: "Administrator",
    role: "Admin",
  });

  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  // ==========================================
  // LOGIKA ROUTE PROTECTION & SINKRONISASI USER
  // ==========================================
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");

    if (!isLoggedIn && !isAuthPage) {
      navigate("/login");
    }

    // Fungsi untuk menarik data user & role
    const loadUserData = () => {
      const storedUserStr = localStorage.getItem("currentUser");

      if (storedUserStr) {
        const parsedUser = JSON.parse(storedUserStr);

        // Tarik data tim dari localStorage atau gunakan fallback data awal
        const teamDB = JSON.parse(
          localStorage.getItem("team_db") || JSON.stringify(dataAwalTim),
        );

        // Cari anggota tim yang emailnya cocok dengan email user yang login
        const matchedMember = teamDB.find(
          (member: any) => member.email === parsedUser.email,
        );

        setHeaderUser({
          name: parsedUser.name,
          // Gunakan role dari database tim, jika tidak ditemukan default ke 'Admin'
          role: matchedMember?.role || "Admin",
        });
      }
    };

    loadUserData(); // Muat data saat halaman pertama kali dirender

    // MENDENGARKAN EVENT DARI SETTINGS.TSX (Update Real-time)
    window.addEventListener("user-updated", loadUserData);

    // Cleanup event listener
    return () => window.removeEventListener("user-updated", loadUserData);
  }, [location.pathname, navigate, isAuthPage]);

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
      <SidebarProvider defaultOpen={true}>
        <AppSidebar />

        <SidebarInset>
          <div className="flex-1 flex flex-col">
            <header className="sticky z-40 top-0 h-16 border-b bg-background/95 backdrop-blur px-4 flex items-center justify-between shadow-sm">
              {/* Sisi Kiri: Breadcrumb / Nama Halaman Aktif */}
              <div className="flex items-center gap-3">
                <SidebarTrigger className="text-muted-foreground hover:text-foreground" />

                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-[1px] bg-border mx-1"></div>
                  <span className="font-medium tracking-tight truncate max-w-[200px]">
                    {getPageTitle(location.pathname)}
                  </span>
                </div>
              </div>

              {/* Sisi Kanan: Preferensi & Profil */}
              <div className="flex items-center gap-2 sm:gap-4">
                {/* Toggle Theme */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full w-9 h-9 cursor-pointer text-muted-foreground hover:text-foreground"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>

                <div className="h-6 w-[1px] bg-border hidden sm:block mx-1"></div>

                {/* Profil User (Interaktif) */}
                <div
                  className="flex items-center gap-3 cursor-pointer group p-1.5 rounded-full hover:bg-muted/50 transition-colors"
                  onClick={() => navigate("/setting")}
                  title="Ke Pengaturan Profil"
                >
                  <div className="hidden md:flex flex-col items-end">
                    {/* ROLE MENJADI DINAMIS */}
                    <span className="text-xs font-bold leading-none text-foreground group-hover:text-primary transition-colors uppercase tracking-wider">
                      {headerUser.role}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate max-w-[120px] mt-1 font-medium">
                      {headerUser.name}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </header>

            {/* MAIN AREA */}
            <main className="flex-1 p-6 md:p-10 max-w-5xl w-full mx-auto">
              {children}
            </main>

            <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-muted/10 font-medium">
              &copy; {new Date().getFullYear()} Billify Platform. Hak cipta
              dilindungi.
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
        ? "Halaman yang Anda minta tidak dapat ditemukan."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
        <h1 className="text-5xl font-extrabold mb-4 text-foreground tracking-tight">
          {message}
        </h1>
        <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
          {details}
        </p>

        <Button
          onClick={() => window.history.back()}
          className="rounded-xl shadow-md font-bold mb-8"
        >
          Kembali ke Halaman Sebelumnya
        </Button>

        {stack && (
          <pre className="w-full max-w-4xl p-6 overflow-x-auto rounded-xl text-xs bg-muted border text-left shadow-inner custom-scrollbar">
            <code>{stack}</code>
          </pre>
        )}
      </div>
    </ThemeProvider>
  );
}
