"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

import {
  Bell,
  ChevronsUpDown,
  LogOut,
  User,
  CheckCircle2,
  AlertCircle,
  Clock, // Tambahan icon Clock untuk status pending
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";

// IMPORT SHEET UNTUK PANEL NOTIFIKASI
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";

// IMPORT DATA DARI INVOICES.TS
import {
  dataAwal,
  dataAwalExpense,
  type Invoice,
  type Expense,
} from "~/data/invoices";

// Tipe Notifikasi Dinamis
type NotificationItem = {
  id: string;
  title: string;
  desc: string;
  time: string;
  icon: any;
  color: string;
  bg: string;
  unread: boolean;
};

export function NavUser({
  user,
}: {
  user: {
    name: string;
    email: string;
    avatar: string;
    onLogout: () => void;
  };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifs, setNotifs] = useState<NotificationItem[]>([]);

  // ==========================================
  // LOGIKA NOTIFIKASI DINAMIS BERDASARKAN DATA
  // ==========================================
  useEffect(() => {
    const generateNotifications = () => {
      // Ambil data dari local storage (jika pengguna sudah melakukan CRUD),
      // jika belum, gunakan fallback dari data awal (invoices.ts)
      const storedInvoices: Invoice[] = JSON.parse(
        localStorage.getItem("invoices_db") || JSON.stringify(dataAwal),
      );
      const storedExpenses: Expense[] = JSON.parse(
        localStorage.getItem("expenses_db") || JSON.stringify(dataAwalExpense),
      );

      const generatedNotifs: NotificationItem[] = [];
      const today = new Date();

      // 1. Evaluasi Invoice Jatuh Tempo
      const overdueInvoices = storedInvoices.filter((inv) => {
        if (inv.paymentStatus === "Lunas" || inv.paymentStatus === "Gagal")
          return false;
        const dueDate = new Date(inv.dueDate);
        return dueDate < today;
      });

      if (overdueInvoices.length > 0) {
        generatedNotifs.push({
          id: "notif-overdue",
          title: "Invoice Jatuh Tempo",
          desc: `Terdapat ${overdueInvoices.length} invoice yang telah melewati batas waktu pembayaran.`,
          time: "Perlu Tindakan",
          icon: AlertCircle,
          color: "text-rose-500",
          bg: "bg-rose-500/10",
          unread: true,
        });
      }

      // 2. Evaluasi Pengeluaran (Expense) Pending
      const pendingExpenses = storedExpenses.filter(
        (exp) => exp.status === "Pending",
      );

      if (pendingExpenses.length > 0) {
        generatedNotifs.push({
          id: "notif-expense",
          title: "Pengeluaran Tertunda",
          desc: `Ada ${pendingExpenses.length} catatan biaya operasional yang masih berstatus Pending.`,
          time: "Menunggu Pelunasan",
          icon: Clock,
          color: "text-amber-500",
          bg: "bg-amber-500/10",
          unread: true,
        });
      }

      // 3. Evaluasi Pembayaran Lunas (Ambil data lunas yang teratas/terbaru dari array)
      const paidInvoices = storedInvoices.filter(
        (inv) => inv.paymentStatus === "Lunas",
      );

      if (paidInvoices.length > 0) {
        const latestPaid = paidInvoices[0]; // Asumsi indeks awal adalah yang terbaru
        generatedNotifs.push({
          id: "notif-paid",
          title: "Pembayaran Diterima",
          desc: `Invoice ${latestPaid.invoice} dari ${latestPaid.clientName} berstatus Lunas.`,
          time: "Info Sistem",
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
          unread: false,
        });
      }

      setNotifs(generatedNotifs);
    };

    // Jalankan saat komponen dimuat
    generateNotifications();

    // Listener (Opsional): Update otomatis jika halaman Transaksi/Expense men-trigger event
    window.addEventListener("data-updated", generateNotifications);
    return () =>
      window.removeEventListener("data-updated", generateNotifications);
  }, []);

  const unreadCount = notifs.filter((n) => n.unread).length;

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-full">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-full font-bold">
                    {user.name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user.email}
                  </span>
                </div>

                <ChevronsUpDown className="ml-auto size-4 group-data-[collapsible=icon]:hidden" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-xl shadow-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
                  <Avatar className="h-9 w-9 rounded-full">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="rounded-full font-bold">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                {/* Navigasi ke Halaman Settings (Profil) */}
                <DropdownMenuItem
                  onClick={() => navigate("/setting")}
                  className="cursor-pointer rounded-lg mx-1"
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Profil Saya
                </DropdownMenuItem>

                {/* Trigger untuk membuka Sheet Notifikasi */}
                <DropdownMenuItem
                  onSelect={() => setIsNotifOpen(true)}
                  className="cursor-pointer rounded-lg mx-1 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                    Notifikasi
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full bg-rose-500 px-1 text-[10px]">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  user.onLogout();
                }}
                className="cursor-pointer text-rose-500 focus:text-rose-600 focus:bg-rose-500/10 rounded-lg mx-1 font-medium"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* ==========================================
          SHEET (OFFCANVAS) UNTUK NOTIFIKASI
      ========================================== */}
      <Sheet open={isNotifOpen} onOpenChange={setIsNotifOpen}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 border-b border-border/50 bg-muted/10">
            <SheetTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" /> Notifikasi Sistem
            </SheetTitle>
            <SheetDescription>
              Pemberitahuan terkait aktivitas dan status transaksi terbaru.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {notifs.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <Bell className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold">Belum Ada Notifikasi</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Sistem akan menampilkan pembaruan di sini.
                </p>
              </div>
            ) : (
              notifs.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-xl border transition-colors flex gap-4 ${
                    notif.unread
                      ? "bg-card border-border/60 shadow-sm"
                      : "bg-muted/30 border-transparent opacity-75"
                  }`}
                >
                  <div
                    className={`mt-0.5 p-2 rounded-full h-fit shrink-0 ${notif.bg} ${notif.color}`}
                  >
                    <notif.icon className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4 className="font-semibold text-sm leading-none flex items-center gap-2">
                      {notif.title}
                      {notif.unread && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 block"></span>
                      )}
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                      {notif.desc}
                    </p>
                    <span className="text-[10px] text-muted-foreground/80 mt-1.5 font-medium uppercase tracking-wider">
                      {notif.time}
                    </span>
                  </div>
                </div>
              ))
            )}

            {notifs.length > 0 && (
              <div className="text-center py-6">
                <p className="text-xs text-muted-foreground">
                  Tidak ada notifikasi lainnya.
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
