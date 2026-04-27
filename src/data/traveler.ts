import { TRIPS, type Trip } from "./trips";

export type TravelerProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf: string;
  birthDate: string;
  city: string;
  state: string;
  avatarInitials: string;
  loyaltyPoints: number;
  memberSince: string;
};

export type TravelerBooking = {
  id: string;
  code: string; // voucher code
  trip: Trip;
  status: "confirmed" | "pending" | "completed" | "canceled";
  passengers: number;
  seats: number[];
  room?: string;
  totalPaid: number;
  paymentMethod: "credit" | "pix" | "boleto";
  purchasedAt: string;
};

export type TravelerCoupon = {
  id: string;
  code: string;
  description: string;
  discount: string;
  expiresAt: string;
  used: boolean;
};

export type TravelerRaffle = {
  id: string;
  title: string;
  prize: string;
  drawDate: string;
  numbers: string[];
  status: "open" | "drawn";
  winningNumber?: string;
};

export const TRAVELER: TravelerProfile = {
  id: "u_001",
  name: "Mariana Silva",
  email: "mariana.silva@email.com",
  phone: "(11) 98765-4321",
  cpf: "123.456.789-00",
  birthDate: "1992-04-18",
  city: "São Paulo",
  state: "SP",
  avatarInitials: "MS",
  loyaltyPoints: 2840,
  memberSince: "2023-08-12",
};

export const TRAVELER_BOOKINGS: TravelerBooking[] = [
  {
    id: "b_001",
    code: "TPT-RIO-7821",
    trip: TRIPS[0],
    status: "confirmed",
    passengers: 2,
    seats: [12, 13],
    room: "Quarto Duplo",
    totalPaid: 2580,
    paymentMethod: "credit",
    purchasedAt: "2026-04-10",
  },
  {
    id: "b_002",
    code: "TPT-GRA-5512",
    trip: TRIPS[3],
    status: "pending",
    passengers: 1,
    seats: [8],
    totalPaid: 1390,
    paymentMethod: "pix",
    purchasedAt: "2026-04-22",
  },
  {
    id: "b_003",
    code: "TPT-FLO-3340",
    trip: TRIPS[1],
    status: "completed",
    passengers: 4,
    seats: [21, 22, 23, 24],
    room: "Quarto Família",
    totalPaid: 5210,
    paymentMethod: "credit",
    purchasedAt: "2025-11-30",
  },
];

export const TRAVELER_COUPONS: TravelerCoupon[] = [
  {
    id: "c_001",
    code: "FIDELIDADE10",
    description: "10% off na próxima viagem nacional",
    discount: "-10%",
    expiresAt: "2026-12-31",
    used: false,
  },
  {
    id: "c_002",
    code: "TRAGAMIGO",
    description: "R$ 200 off ao indicar um amigo",
    discount: "-R$ 200",
    expiresAt: "2026-09-30",
    used: false,
  },
  {
    id: "c_003",
    code: "PIX5",
    description: "5% extra ao pagar com PIX",
    discount: "-5%",
    expiresAt: "2026-06-30",
    used: true,
  },
];

export const TRAVELER_RAFFLES: TravelerRaffle[] = [
  {
    id: "r_001",
    title: "Rifa Verão 2026",
    prize: "Pacote para Jericoacoara para 2 pessoas",
    drawDate: "2026-12-15",
    numbers: ["0123", "0124", "0125"],
    status: "open",
  },
  {
    id: "r_002",
    title: "Rifa de Aniversário TapTur",
    prize: "Voucher de R$ 1.500",
    drawDate: "2026-08-30",
    numbers: ["0488"],
    status: "open",
  },
  {
    id: "r_003",
    title: "Rifa Black Friday 2025",
    prize: "Viagem para Gramado",
    drawDate: "2025-11-29",
    numbers: ["0712", "0713"],
    status: "drawn",
    winningNumber: "1042",
  },
];

export function formatBookingDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}
