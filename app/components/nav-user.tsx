"use client";

import { useState } from "react";
import { useNavigate } from "react-router";

import {
  Bell,
  ChevronsUpDown,
  LogOut,
  User,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  CheckCheck,
  Trash2,
} from "lucide-react";

import { Avatar, AvatarFallback } from "~/components/ui/avatar";
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

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";

// HOOKS GLOBAL ZUSTAND
import { useAppStore } from "~/store/useAppStore";

export function NavUser({
  user,
}: {
  user: { name: string; email: string; avatar: string; onLogout: () => void };
}) {
  const { isMobile } = useSidebar();
  const navigate = useNavigate();
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // ==========================================
  // AMBIL DATA & ACTION DARI ZUSTAND STORE
  // ==========================================
  const { profil, notifications, markAllAsRead, clearNotifications } =
    useAppStore();

  const displayName = profil?.nama || user?.name || "Pengguna";
  const displayEmail = profil?.email || user?.email || "user@example.com";
  const displayAvatar = profil?.avatar || user?.avatar || "";

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Handler saat panel notifikasi dibuka
  const handleOpenNotif = (open: boolean) => {
    setIsNotifOpen(open);
    if (open && unreadCount > 0) {
      // Tandai semua dibaca saat panel dibuka (opsional, bisa juga dipisah ke tombol khusus)
      markAllAsRead();
    }
  };

  // Utility untuk format waktu
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Utility untuk mapping style berdasarkan tipe
  const getNotifStyle = (type: string) => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle2,
          color: "text-emerald-500",
          bg: "bg-emerald-500/10",
        };
      case "error":
        return {
          icon: AlertCircle,
          color: "text-rose-500",
          bg: "bg-rose-500/10",
        };
      case "warning":
        return { icon: Clock, color: "text-amber-500", bg: "bg-amber-500/10" };
      case "info":
      default:
        return { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10" };
    }
  };

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
                <Avatar className="h-8 w-8 rounded-full border border-primary/10 overflow-hidden">
                  {displayAvatar ? (
                    <img
                      src={displayAvatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <AvatarFallback className="font-bold bg-primary/10 text-primary">
                      {displayName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="grid flex-1 text-left text-sm leading-tight group-data-[collapsible=icon]:hidden">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {displayEmail}
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
                  <Avatar className="h-9 w-9 rounded-full border border-primary/10 overflow-hidden">
                    {displayAvatar ? (
                      <img
                        src={displayAvatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <AvatarFallback className="rounded-full font-bold bg-primary/10 text-primary">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-bold">{displayName}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {displayEmail}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => navigate("/setting")}
                  className="cursor-pointer rounded-lg mx-1"
                >
                  <User className="mr-2 h-4 w-4 text-muted-foreground" />
                  Profil Saya
                </DropdownMenuItem>

                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault();
                    handleOpenNotif(true);
                  }}
                  className="cursor-pointer rounded-lg mx-1 flex items-center justify-between"
                >
                  <div className="flex items-center">
                    <Bell className="mr-2 h-4 w-4 text-muted-foreground" />
                    Notifikasi
                  </div>
                  {unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] text-white">
                      {unreadCount}
                    </Badge>
                  )}
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  user?.onLogout();
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

      <Sheet open={isNotifOpen} onOpenChange={handleOpenNotif}>
        <SheetContent className="w-full sm:max-w-md flex flex-col p-0">
          <SheetHeader className="p-6 border-b border-border/50 bg-muted/10">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-primary" /> Notifikasi Sistem
              </SheetTitle>
              {notifications.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearNotifications}
                  className="h-8 text-xs text-muted-foreground hover:text-rose-500"
                >
                  <Trash2 className="w-3 h-3 mr-1" /> Bersihkan
                </Button>
              )}
            </div>
            <SheetDescription>
              Pemberitahuan aktivitas dan riwayat transaksi terbaru Anda.
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 custom-scrollbar">
            {notifications.length === 0 ? (
              <div className="text-center py-10 flex flex-col items-center">
                <CheckCheck className="w-10 h-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold">Semua Selesai!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Belum ada aktivitas atau notifikasi baru.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const style = getNotifStyle(notif.type);
                const IconComponent = style.icon;

                return (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-xl border transition-colors flex gap-4 ${
                      notif.unread
                        ? "bg-card border-border/60 shadow-sm"
                        : "bg-muted/30 border-transparent opacity-75"
                    }`}
                  >
                    <div
                      className={`mt-0.5 p-2 rounded-full h-fit shrink-0 ${style.bg} ${style.color}`}
                    >
                      <IconComponent className="w-4 h-4" />
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
                        {formatTime(notif.time)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
