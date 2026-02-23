import React from "react";

export function useToast() {
  const [msg, setMsg] = React.useState<string | null>(null);

  const show = (text: string) => {
    setMsg(text);
    window.setTimeout(() => setMsg(null), 2200);
  };

  const Toast = () =>
    msg ? (
      <div className="toast" role="status" aria-live="polite">
        {msg}
      </div>
    ) : null;

  return { show, Toast };
}