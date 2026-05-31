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
import { ThemeProvider, useTheme } from "~/components/theme-provider";
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
import {
  Menu,
  LayoutDashboard,
  ReceiptText,
  Info,
  Settings,
  BarChart3,
  Moon,
  Sun,
  User,
} from "lucide-react";

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
  const isActive = (path: string) => location.pathname === path;
  const { theme, setTheme } = useTheme();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Transaction", path: "/transaction", icon: ReceiptText },
    { name: "About", path: "/about", icon: Info },
    { name: "Reports", path: "/report", icon: BarChart3 },
    { name: "Settings", path: "/setting", icon: Settings },
  ];

  return (
    <div className="flex min-h-screen w-full">
      {/* === SIDEBAR DESKTOP (Permanen) === */}
      <aside className="hidden md:flex w-64 border-r bg-background flex-col fixed inset-y-0 z-50">
        <div className="p-6 h-16 flex items-center border-b">
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md font-bold text-xs">
              BLY
            </div>
            <span className="font-bold text-lg">Billify</span>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                  isActive(item.path)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* === KONTEN UTAMA === */}
      <div className="flex-1 flex flex-col md:pl-64">
        <header className="sticky top-0 z-40 h-16 border-b bg-background/95 backdrop-blur px-4 flex items-center justify-between">
          {/* Sisi Kiri: Breadcrumb / Nama Halaman Aktif */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="text-sm font-semibold text-foreground">
              {navItems.find((i) => i.path === location.pathname)?.name ||
                "Billify"}
            </span>
          </div>

          {/* Sisi Kanan: Preferensi & Profil */}
          <div className="flex items-center gap-2">
            {/* Toggle Theme: Sekarang sudah fungsional */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full w-9 h-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Profil User (Simbolis) */}
            <div className="flex items-center gap-2 pl-2">
              <div className="hidden md:flex flex-col items-end mr-1">
                <span className="text-xs font-medium leading-none">Admin</span>
                <span className="text-[10px] text-muted-foreground">
                  Razan Sya'bani
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

      {/* === SIDEBAR MOBILE (Drawer) === */}
      <Sidebar side="left" className="md:hidden">
        <SidebarContent className="p-4 pt-6">
          <div className="flex items-center gap-2 mb-6 px-2">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-lg font-bold text-xs">
              BLY
            </div>
            <span className="font-bold text-lg">Billify</span>
          </div>
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
