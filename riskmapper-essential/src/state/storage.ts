import type { Student } from "./types";

const KEY = "riskmapper_essential_students_v1";

export function loadStudents(): Student[] | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    return parsed as Student[];
  } catch {
    return null;
  }
}

export function saveStudents(students: Student[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(students));
  } catch {
    // ignore
  }
}

export function resetStudents() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}