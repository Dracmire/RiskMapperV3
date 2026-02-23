export type TabKey = "risk" | "portal" | "dashboard";

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
        <div className="brandSubtitle">Consentimientos</div>
      </div>
      <div className="tabs">
        <Tab k="risk" label="Risk Map" />
        <Tab k="portal" label="Portal de Autorización" />
        <Tab k="dashboard" label="Dashboard" />
      </div>
    </div>
  );
}