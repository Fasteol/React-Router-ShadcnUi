import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("pages/Dashboard.tsx"),
  route("transaction", "pages/Transaction.tsx"),
  route("about", "pages/About.tsx"),
] satisfies RouteConfig;
