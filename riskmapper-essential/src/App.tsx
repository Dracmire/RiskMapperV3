import React from "react";
import { StudentsProvider } from "./state/useStudents";
import { TopTabs, type TabKey } from "./components/TopTabs";
import { RiskMap } from "./screens/RiskMap";
import { Portal } from "./screens/Portal";
import { Dashboard } from "./screens/Dashboard";

export default function App() {
  const [tab, setTab] = React.useState<TabKey>("risk");

  return (
    <StudentsProvider>
      <div className="appShell">
        <TopTabs active={tab} onChange={setTab} />
        <div className="content">
          {tab === "risk" && <RiskMap onGoDashboard={() => setTab("dashboard")} />}
          {tab === "portal" && <Portal />}
          {tab === "dashboard" && <Dashboard />}
        </div>
      </div>
    </StudentsProvider>
  );
}
