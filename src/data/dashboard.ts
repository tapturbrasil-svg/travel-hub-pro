import { TRIPS } from "./trips";

/**
 * Mock current logged-in agency for the dashboard demo.
 * Later this will come from auth/Lovable Cloud.
 */
export const CURRENT_AGENCY_SLUG = "caminhos-do-sol";

export type Booking = {
  id: string;
  code: string;
  tripId: string;
  passengerName: string;
  passengerDoc: string;
  seat: number;
  status: "confirmada" | "pendente" | "cancelada";
  paymentMethod: "Cartão" | "PIX" | "Boleto";
  total: number;
  createdAt: string;
};

const NAMES = [
  "Maria Silva",
  "João Pereira",
  "Ana Costa",
  "Carlos Souza",
  "Juliana Lima",
  "Pedro Oliveira",
  "Fernanda Alves",
  "Rafael Santos",
  "Beatriz Rocha",
  "Lucas Martins",
  "Camila Ribeiro",
  "Bruno Carvalho",
  "Larissa Mendes",
  "Diego Ferreira",
  "Patrícia Gomes",
  "Thiago Barbosa",
  "Renata Cardoso",
  "Felipe Araújo",
  "Marina Castro",
  "Gustavo Pinto",
];

function seedRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function genBookingsForTrip(tripId: string, count: number): Booking[] {
  const rnd = seedRandom(tripId.charCodeAt(1) * 1000);
  const bookings: Booking[] = [];
  const seatsTaken = new Set<number>();

  for (let i = 0; i < count; i++) {
    let seat = Math.floor(rnd() * 46) + 1;
    while (seatsTaken.has(seat)) seat = Math.floor(rnd() * 46) + 1;
    seatsTaken.add(seat);

    const statusRoll = rnd();
    const status: Booking["status"] =
      statusRoll < 0.75 ? "confirmada" : statusRoll < 0.92 ? "pendente" : "cancelada";

    const methodRoll = rnd();
    const paymentMethod: Booking["paymentMethod"] =
      methodRoll < 0.55 ? "Cartão" : methodRoll < 0.85 ? "PIX" : "Boleto";

    bookings.push({
      id: `b-${tripId}-${i}`,
      code: "TT" + Math.floor(rnd() * 900000 + 100000),
      tripId,
      passengerName: NAMES[Math.floor(rnd() * NAMES.length)],
      passengerDoc: `${Math.floor(rnd() * 900 + 100)}.${Math.floor(rnd() * 900 + 100)}.${Math.floor(rnd() * 900 + 100)}-${Math.floor(rnd() * 90 + 10)}`,
      seat,
      status,
      paymentMethod,
      total: 1290 + Math.floor(rnd() * 800),
      createdAt: new Date(2026, 3, Math.floor(rnd() * 28 + 1)).toISOString(),
    });
  }

  return bookings;
}

const BOOKING_COUNTS: Record<string, number> = {
  t1: 32,
  t2: 18,
  t4: 24,
};

export const BOOKINGS: Booking[] = TRIPS.filter(
  (t) => t.agencySlug === CURRENT_AGENCY_SLUG,
).flatMap((t) => genBookingsForTrip(t.id, BOOKING_COUNTS[t.id] ?? 12));

export function getBookingsByTrip(tripId: string) {
  return BOOKINGS.filter((b) => b.tripId === tripId);
}

export function getOccupancy(tripId: string, capacity: number) {
  const sold = BOOKINGS.filter(
    (b) => b.tripId === tripId && b.status !== "cancelada",
  ).length;
  return { sold, capacity, percent: Math.round((sold / capacity) * 100) };
}

export function getDashboardMetrics() {
  const myTrips = TRIPS.filter((t) => t.agencySlug === CURRENT_AGENCY_SLUG);
  const myBookings = BOOKINGS;
  const confirmed = myBookings.filter((b) => b.status === "confirmada");
  const revenue = confirmed.reduce((acc, b) => acc + b.total, 0);
  const upcoming = myTrips.filter(
    (t) => new Date(t.departureDate) > new Date(),
  ).length;

  return {
    revenue,
    bookingsCount: confirmed.length,
    tripsCount: myTrips.length,
    upcoming,
  };
}
