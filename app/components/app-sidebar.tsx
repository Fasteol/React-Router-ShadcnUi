import {
  LayoutDashboard,
  ReceiptText,
  User,
  BarChart3,
  Info,
  Settings,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "~/components/ui/sidebar";
import { Link, useLocation } from "react-router";
import { useEffect } from "react";

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Transaction", path: "/transaction", icon: ReceiptText },
    { name: "Client", path: "/client", icon: User },
    { name: "Reports", path: "/report", icon: BarChart3 },
    { name: "About", path: "/about", icon: Info },
    { name: "Settings", path: "/setting", icon: Settings },
  ];

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarContent>
        <div className="p-6 flex items-center gap-2 border-b">
          <div className="bg-primary text-primary-foreground p-1.5 rounded-md font-bold text-xs">
            BLY
          </div>
          <span className="font-bold text-lg">Billify</span>
        </div>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                    onClick={() => isMobile && setOpenMobile(false)}
                  >
                    <Link to={item.path}>
                      <item.icon />
                      <span>{item.name}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
