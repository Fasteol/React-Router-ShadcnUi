import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/Dashboard.tsx"),
  route("transaction", "pages/Transaction.tsx"),
  route("client", "pages/Client.tsx"),
  route("service", "pages/Service.tsx"),
  route("about", "pages/About.tsx"),
  route("report", "pages/Report.tsx"),
  route("setting", "pages/Setting.tsx"),
  route("login", "pages/Login.tsx"),
  route("register", "pages/Register.tsx"),
] satisfies RouteConfig;
