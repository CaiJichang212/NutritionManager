import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { RecordPage } from "./pages/RecordPage";
import { NutritionPage } from "./pages/NutritionPage";
import { ReportsPage } from "./pages/ReportsPage";
import { AIChatPage } from "./pages/AIChatPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SocialPage } from "./pages/SocialPage";
import { NotificationsPage } from "./pages/settings/NotificationsPage";
import { PrivacyPage } from "./pages/settings/PrivacyPage";
import { HelpPage } from "./pages/settings/HelpPage";
import { SystemPage } from "./pages/settings/SystemPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: DashboardPage },
      { path: "record", Component: RecordPage },
      { path: "nutrition", Component: NutritionPage },
      { path: "reports", Component: ReportsPage },
      { path: "ai", Component: AIChatPage },
      { path: "profile", Component: ProfilePage },
      { path: "social", Component: SocialPage },
      { path: "settings/notifications", Component: NotificationsPage },
      { path: "settings/privacy", Component: PrivacyPage },
      { path: "settings/help", Component: HelpPage },
      { path: "settings/system", Component: SystemPage },
    ],
  },
]);
