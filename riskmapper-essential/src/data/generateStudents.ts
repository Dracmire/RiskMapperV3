import type { Student, ConsentState } from "../state/types";

// Generador determinista para que el demo sea estable
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rng: () => number, arr: T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isoAddDays(from: Date, days: number) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

function isoAddMonths(from: Date, months: number) {
  const d = new Date(from);
  d.setMonth(d.getMonth() + months);
  return d.toISOString();
}

const FIRST = [
  "Fernanda",
  "Cristóbal",
  "Agatha",
  "Bruno",
];

const LAST = [
  "González",
  "Muñoz",
  "Rojas",
  "Díaz",
  "Pérez",
  "Soto",
  "Contreras",
  "Silva",
  "Martínez",
  "Sepúlveda",
  "Morales",
  "Rodríguez",
  "López",
  "Fuentes",
  "Hernández",
  "Torres",
  "Araya",
  "Flores",
  "Espinoza",
  "Castillo",
  "Reyes",
  "Gutiérrez",
  "Navarro",
  "Vargas",
  "Molina",
  "Campos",
  "Carrasco",
  "Herrera",
  "Núñez",
  "Vergara",
  "Figueroa",
  "Valdés",
  "Peña",
  "Pizarro",
  "Cortés",
];

const COURSES = [
  "1°A",
  "1°B",
  "2°A",
  "2°B",
  "3°A",
  "3°B",
  "4°A",
  "4°B",
  "5°A",
  "5°B",
  "6°A",
  "6°B",
  "7°A",
  "7°B",
  "8°A",
  "8°B",
];

const EXPIRY_BUCKETS_DAYS = [7, 15, 30, 60, 180];

function makeId(i: number) {
  // RM-0001...
  return `RM-${pad2(Math.floor(i / 100))}${pad2(i % 100)}`.replace("RM-00", "RM-");
}

function consentByRoll(rng: () => number): ConsentState {
  // Distribución: 65% autorizados, 20% pendientes, 15% no autorizados
  const r = rng();
  if (r < 0.65) return "autorizado";
  if (r < 0.85) return "pendiente";
  return "no_autorizado";
}

export function generateStudents(count = 300, seed = 1337): Student[] {
  const rng = mulberry32(seed);
  const base = new Date();

  const students: Student[] = [];

  for (let i = 1; i <= count; i++) {
    const nombre = `${pick(rng, FIRST)} ${pick(rng, LAST)} ${pick(rng, LAST)}`;
    const curso = pick(rng, COURSES);
    const estado = consentByRoll(rng);

    const expBucket = pick(rng, EXPIRY_BUCKETS_DAYS);

    // Última actualización entre hoy y hace 45 días (mezcla)
    const lastDaysAgo = Math.floor(rng() * 46);
    const ultima = isoAddDays(base, -lastDaysAgo);

    // Expira en: si está autorizado o pendiente, usa buckets; si no autorizado, también lo dejamos para demo.
    const expiraEn = isoAddDays(base, expBucket);

    let canales = { web: false, rrss: false };

    if (estado === "autorizado") {
      // al menos un canal true
      const mode = rng();
      if (mode < 0.55) canales = { web: true, rrss: true };
      else if (mode < 0.8) canales = { web: true, rrss: false };
      else canales = { web: false, rrss: true };
    }

    if (estado === "no_autorizado") {
      canales = { web: false, rrss: false };
    }

    students.push({
      id: makeId(i),
      nombre,
      curso,
      estadoConsentimiento: estado,
      canales,
      expiraEn,
      ultimaActualizacion: ultima,
    });
  }

  return students;
}

export function computeExpiryISO(preset: "6m" | "12m" | "custom", customISO?: string) {
  const now = new Date();
  if (preset === "6m") return isoAddMonths(now, 6);
  if (preset === "12m") return isoAddMonths(now, 12);
  if (customISO) {
    const d = new Date(customISO);
    if (!isNaN(d.getTime())) return d.toISOString();
  }
  return isoAddMonths(now, 6);
}