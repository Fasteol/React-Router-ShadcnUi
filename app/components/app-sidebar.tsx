"use client";

import * as React from "react";
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
  Command,
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

// Data Kustom untuk Billify
const data = {
  user: {
    name: "Razan Sya'bani",
    email: "razan@fauzansyabani.dev",
    avatar: "/avatars/razan.jpg",
  },
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
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        {/* NavMain di sini akan merender daftar menu utama */}
        <NavMain items={data.navMain} />

        {/* NavProjects bisa kita gunakan untuk menu Sistem/Tambahan */}
        <NavProjects projects={data.projects} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
