export type TabKey = "risk" | "portal" | "dashboard";
const sha = import.meta.env.VITE_BUILD_SHA ?? "dev";
export function TopTabs({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (t: TabKey) => void;
}) {
  const Tab = ({ k, label }: { k: TabKey; label: string }) => (
    <button
      className={"tab" + (active === k ? " tabActive" : "")}
      onClick={() => onChange(k)}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brandTitle">RiskMapper Essential</div>
        <div className="brandSubtitle">Build: {sha.slice(0,7)}</div>
        
      </div>
      <div className="tabs">
        <Tab k="risk" label="Risk Map" />
        <Tab k="portal" label="Portal de Autorización" />
        <Tab k="dashboard" label="Dashboard" />
      </div>
    </div>
  );
}