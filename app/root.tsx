import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLocation,
} from "react-router";
import { cn } from "~/lib/utils";

import type { Route } from "./+types/root";
import "./app.css";
import { Button } from "~/components/ui/button";
import { ThemeProvider } from "~/components/theme-provider";
import { Toaster } from "~/components/ui/sonner";

// Import Komponen Sidebar Primitives dari Shadcn UI
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "~/components/ui/sidebar";

// Import Ikon dari Lucide Icons
import { Menu, LayoutDashboard, ReceiptText, Info } from "lucide-react";

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
  const { toggleSidebar } = useSidebar();

  // Helper untuk mendeteksi halaman aktif
  const isActive = (path: string) => location.pathname === path;

  // Struktur data navigasi agar terpusat dan rapi
  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Transaksi", path: "/transaction", icon: ReceiptText },
    { name: "About", path: "/about", icon: Info },
  ];

  return (
    <div className="flex flex-col min-h-screen w-full">
      {/* === HEADER / NAVBAR GLOBAL (DESKTOP & MOBILE) === */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 items-center px-4 justify-between">
          {/* Sisi Kiri: Hanya Logo */}
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1 rounded-sm">
              <span className="font-bold text-xs">LR</span>
            </div>
            <span className="font-bold inline-block">LearnReact</span>
          </div>

          {/* Sisi Kanan: Navigasi Desktop & Tombol Hamburger Menu */}
          <div className="flex items-center gap-4">
            {/* Navigasi Desktop (Dipindah ke sini) */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "transition-colors hover:text-foreground/80 px-4 py-2 rounded-md flex items-center gap-2 text-sm font-medium",
                    isActive(item.path)
                      ? "text-foreground bg-secondary font-semibold"
                      : "text-foreground/60",
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Tombol Hamburger Menu */}
            <div className="md:hidden">
              <Button variant="ghost" size="icon" onClick={toggleSidebar}>
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* === SIDEBAR RESMI SHADCN UI (HANYA AKTIF DI MOBILE) === */}
      {/* Mengubah side="left" menjadi side="right" agar serasi dengan posisi tombol */}
      <Sidebar side="right" className="md:hidden">
        <SidebarContent className="p-4 pt-6">
          {/* Header Internal Sidebar */}
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-bold text-xs">
              LR
            </div>
            <span className="font-bold text-lg">LearnReact</span>
          </div>

          {/* Menu Navigasi dengan Highlight bawaan Shadcn */}
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.path}>
                <SidebarMenuButton asChild isActive={isActive(item.path)}>
                  <Link to={item.path} onClick={() => toggleSidebar()}>
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>

      {/* === MAIN CONTENT AREA === */}
      <main className="flex-1 container mx-auto p-4 flex flex-col">
        {children}
      </main>

      {/* === FOOTER GLOBAL === */}
      <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-muted/50">
        &copy; {new Date().getFullYear()} LearnReact. All rights reserved.
      </footer>
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
