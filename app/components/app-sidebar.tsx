"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  ReceiptText,
  User,
  Package,
  BarChart3,
  Info,
  Settings,
  GalleryVerticalEnd,
  AudioWaveform,
} from "lucide-react";

import { NavMain } from "~/components/nav-main";
import { NavProjects } from "~/components/nav-projects";
import { NavUser } from "~/components/nav-user";
import { TeamSwitcher } from "~/components/team.switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

// Pisahkan data navigasi statis (Menu dan Tim) dari data User
const navData = {
  teams: [
    { name: "Billify", logo: GalleryVerticalEnd, plan: "" },
    { name: "Personal Proj", logo: AudioWaveform, plan: "Free" },
  ],
  navMain: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Transaction", url: "/transaction", icon: ReceiptText },
    { title: "Client", url: "/client", icon: User },
    { title: "Services", url: "/service", icon: Package },
    { title: "Reports", url: "/report", icon: BarChart3 },
  ],
  projects: [
    { name: "About", url: "/about", icon: Info },
    { name: "Settings", url: "/setting", icon: Settings },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // 1. Buat state untuk menampung data user sementara (fallback jika gagal dimuat)
  const [currentUser, setCurrentUser] = useState({
    name: "Memuat...",
    email: "memuat@sistem...",
    avatar: "", // Akan menggunakan avatar inisial (fallback) dari komponen NavUser
  });

  // 2. Gunakan useEffect untuk mengambil data asli dari localStorage setelah komponen dirender
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setCurrentUser({
        name: parsedUser.name,
        email: parsedUser.email,
        // Karena kita tidak menyimpan foto profil di dummy data, kita biarkan kosong.
        // Shadcn UI (NavUser) biasanya otomatis membuat inisial huruf jika avatar kosong.
        avatar: "",
      });
    }
  }, []);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={navData.teams} />
      </SidebarHeader>

      <SidebarContent>
        {/* NavMain merender daftar menu utama */}
        <NavMain items={navData.navMain} />

        {/* NavProjects merender menu Sistem/Tambahan */}
        <NavProjects projects={navData.projects} />
      </SidebarContent>

      <SidebarFooter>
        {/* 3. Masukkan state currentUser ke dalam komponen NavUser */}
        <NavUser user={currentUser} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
