"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

import {
  LayoutDashboard,
  ReceiptText,
  User as UserIcon,
  Package,
  BarChart3,
  Wallet, // <--- Tambah ini untuk Expense
  Users,
  Info,
  Settings,
  AudioWaveform,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team.switcher";
import { defaultUsers } from "~/data/invoices";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

// =========================================================================
// LOGO KUSTOM: BILLIFY (SISTEM INVOICE & MANAJEMEN)
// =========================================================================
// Desain menggabungkan kertas invoice, garis transaksi, dan aksen lingkaran
// sukses finansial yang modern dan minimalis.
const BillifyLogo = ({ className, ...props }: React.ComponentProps<"svg">) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    {/* Efek layer dokumen di belakang (menandakan pengarsipan/manajemen) */}
    <path d="M5 9V4a2 2 0 0 1 2-2h9l4 4v4" className="opacity-30" />
    {/* Dokumen Utama (Invoice) */}
    <path d="M7 6h9l4 4v10a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6z" />
    {/* Lipatan kertas invoice */}
    <path d="M16 6v4h4" />
    {/* Garis rincian tagihan */}
    <path d="M9 12h6" />
    <path d="M9 16h4" />
    {/* Dot indikator status/sukses finansial */}
    <circle
      cx="16"
      cy="16"
      r="1.5"
      fill="currentColor"
      className="text-primary"
    />
  </svg>
);

// =========================================================================
// DATA NAVIGASI
// =========================================================================
const navData = {
  teams: [
    { name: "Billify", logo: BillifyLogo, plan: "" },
    { name: "Personal Proj", logo: AudioWaveform, plan: "Free" },
  ],
  navMain: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Transaction", url: "/transaction", icon: ReceiptText },
    { title: "Expense", url: "/expense", icon: Wallet }, // <--- Halaman Baru Expense
    { title: "Client", url: "/client", icon: UserIcon },
    { title: "Services", url: "/service", icon: Package },
    { title: "Reports", url: "/report", icon: BarChart3 },
    { title: "User Management", url: "/user-management", icon: Users }, // <--- Halaman Baru User Management
  ],
  projects: [
    { name: "About", url: "/about", icon: Info },
    { name: "Settings", url: "/setting", icon: Settings },
  ],
};

// =========================================================================
// KOMPONEN UTAMA SIDEBAR
// =========================================================================
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState({
    name: "Memuat...",
    email: "memuat@sistem...",
    avatar: "",
  });

  const loadUser = () => {
    const storedUser = localStorage.getItem("currentUser");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser({
        name: parsedUser.name,
        email: parsedUser.email,
        avatar: "",
      });
    } else {
      setCurrentUser({
        name: defaultUsers[0].name,
        email: defaultUsers[0].email,
        avatar: "",
      });
    }
  };

  useEffect(() => {
    loadUser();
    window.addEventListener("user-updated", loadUser);
    return () => window.removeEventListener("user-updated", loadUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navData.navMain} />
        <NavProjects projects={navData.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser
          user={{
            name: currentUser.name,
            email: currentUser.email,
            avatar: currentUser.avatar,
            onLogout: handleLogout,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
