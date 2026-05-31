"use client";

import * as React from "react";
import { useEffect, useState } from "react";
// GANTI import dari next/navigation menjadi react-router
import { useNavigate } from "react-router";

import {
  LayoutDashboard,
  ReceiptText,
  User as UserIcon,
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
import { defaultUsers } from "~/data/invoices";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "~/components/ui/sidebar";

const navData = {
  teams: [
    { name: "Billify", logo: GalleryVerticalEnd, plan: "" },
    { name: "Personal Proj", logo: AudioWaveform, plan: "Free" },
  ],
  navMain: [
    { title: "Dashboard", url: "/", icon: LayoutDashboard },
    { title: "Transaction", url: "/transaction", icon: ReceiptText },
    { title: "Client", url: "/client", icon: UserIcon },
    { title: "Services", url: "/service", icon: Package },
    { title: "Reports", url: "/report", icon: BarChart3 },
  ],
  projects: [
    { name: "About", url: "/about", icon: Info },
    { name: "Settings", url: "/setting", icon: Settings },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // GUNAKAN useNavigate dari React Router
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

  // ==========================================
  // FUNGSI LOGOUT UNTUK REACT ROUTER
  // ==========================================
  const handleLogout = () => {
    // 1. Hapus sesi
    localStorage.removeItem("currentUser");

    // 2. Arahkan ke rute /login menggunakan fungsi navigate React Router
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
            onLogout: handleLogout, // Fungsi ini sekarang aman dijalankan
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
