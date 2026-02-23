import React from "react";
import type { Student, Channels } from "./types";
import { loadStudents, saveStudents, resetStudents } from "./storage";
import { generateStudents } from "../data/generateStudents";

type StudentsContextValue = {
  students: Student[];
  updateConsent: (id: string, next: { canales: Channels; expiraEn: string }) => void;
  revokeConsent: (id: string) => void;
  resetDemo: () => void;
};

const StudentsContext = React.createContext<StudentsContextValue | null>(null);

export function StudentsProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = React.useState<Student[]>(() => {
    const saved = loadStudents();
    return saved ?? generateStudents(300);
  });

  React.useEffect(() => {
    saveStudents(students);
  }, [students]);

  const updateConsent: StudentsContextValue["updateConsent"] = (id, next) => {
    const nowISO = new Date().toISOString();
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;

        // Regla: si marca canales y confirma => autorizado; si no marca nada => pendiente
        const anyChannel = Boolean(next.canales.web || next.canales.rrss);
        const estadoConsentimiento = anyChannel ? "autorizado" : "pendiente";

        return {
          ...s,
          canales: {
            web: Boolean(next.canales.web),
            rrss: Boolean(next.canales.rrss),
          },
          estadoConsentimiento,
          expiraEn: next.expiraEn,
          ultimaActualizacion: nowISO,
        };
      })
    );
  };

  const revokeConsent: StudentsContextValue["revokeConsent"] = (id) => {
    const nowISO = new Date().toISOString();
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        return {
          ...s,
          estadoConsentimiento: "no_autorizado",
          canales: { web: false, rrss: false }, // regla
          ultimaActualizacion: nowISO,
        };
      })
    );
  };

  const resetDemo = () => {
    resetStudents();
    setStudents(generateStudents(300));
  };

  return (
    <StudentsContext.Provider value={{ students, updateConsent, revokeConsent, resetDemo }}>
      {children}
    </StudentsContext.Provider>
  );
}

export function useStudents() {
  const ctx = React.useContext(StudentsContext);
  if (!ctx) throw new Error("useStudents must be used within StudentsProvider");
  return ctx;
}

export function isExpiringSoon(expiraISO: string, days = 30) {
  const exp = new Date(expiraISO).getTime();
  const now = Date.now();
  const diffDays = (exp - now) / (1000 * 60 * 60 * 24);
  return diffDays <= days;
}