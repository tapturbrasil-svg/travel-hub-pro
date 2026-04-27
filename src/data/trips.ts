import rio from "@/assets/trip-rio.jpg";
import floripa from "@/assets/trip-floripa.jpg";
import portoSeguro from "@/assets/trip-porto-seguro.jpg";
import gramado from "@/assets/trip-gramado.jpg";
import maceio from "@/assets/trip-maceio.jpg";
import jeri from "@/assets/trip-jeri.jpg";

/**
 * packageType controls what the customer can buy:
 *  - "full"      → pacote completo, transporte + hospedagem juntos (não vendidos separados)
 *  - "transport" → só transporte (sem hospedagem)
 *  - "lodging"   → só hospedagem (sem transporte)
 *  - "flexible"  → cliente escolhe: com ou sem hospedagem
 */
export type PackageType = "full" | "transport" | "lodging" | "flexible";

export type Room = {
  id: string;
  name: string;        // ex: "Quarto Duplo Vista Mar"
  capacity: number;    // pessoas por quarto
  pricePerPerson: number;
  description: string;
};

export type Trip = {
  id: string;
  slug: string;
  destination: string;
  state: string;
  agency: string;
  agencySlug: string;
  image: string;
  gallery: string[];
  departureCity: string;
  departureDate: string; // ISO
  returnDate: string;
  nights: number;
  vehicle: "Ônibus Leito" | "Ônibus Executivo" | "Van Premium";
  capacity: number;
  priceAdult: number;
  priceChild: number; // meia (5–12 anos)
  installments: number;
  rating: number;
  reviews: number;
  highlights: string[];
  description: string;
  includes: string[];
  packageType: PackageType;
  /** desconto aplicado quando o cliente opta por NÃO levar hospedagem (somente "flexible") */
  hotelDiscount?: number;
  hotel: { name: string; stars: number; meal: string; rooms: Room[] };
};

export const TRIPS: Trip[] = [
  {
    id: "t1",
    slug: "rio-de-janeiro-cidade-maravilhosa",
    destination: "Rio de Janeiro",
    state: "RJ",
    agency: "Caminhos do Sol",
    agencySlug: "caminhos-do-sol",
    image: rio,
    gallery: [rio, portoSeguro, maceio],
    departureCity: "São Paulo",
    departureDate: "2026-05-15",
    returnDate: "2026-05-19",
    nights: 4,
    vehicle: "Ônibus Leito",
    capacity: 46,
    priceAdult: 1290,
    priceChild: 690,
    installments: 12,
    rating: 4.9,
    reviews: 312,
    highlights: ["Cristo Redentor", "Pão de Açúcar", "Copacabana", "City Tour"],
    description:
      "Viva a Cidade Maravilhosa em uma experiência cuidadosamente planejada. Ônibus leito confortável, hotel bem localizado em Copacabana e passeios guiados pelos cartões-postais mais icônicos do Brasil.",
    includes: [
      "Transporte ida e volta em ônibus leito",
      "4 diárias em hotel 4 estrelas",
      "Café da manhã incluso",
      "City Tour com guia local",
      "Seguro viagem completo",
    ],
    packageType: "flexible",
    hotelDiscount: 280,
    hotel: {
      name: "Hotel Atlântico Copacabana",
      stars: 4,
      meal: "Café da manhã",
      rooms: [
        { id: "single", name: "Quarto Single", capacity: 1, pricePerPerson: 0, description: "Privacidade total para você." },
        { id: "double", name: "Quarto Duplo", capacity: 2, pricePerPerson: -120, description: "Cama de casal ou duas solteiros." },
        { id: "triple", name: "Quarto Triplo", capacity: 3, pricePerPerson: -180, description: "Ideal para grupos e famílias." },
      ],
    },
  },
  {
    id: "t2",
    slug: "florianopolis-praias-paradisiacas",
    destination: "Florianópolis",
    state: "SC",
    agency: "Caminhos do Sol",
    agencySlug: "caminhos-do-sol",
    image: floripa,
    gallery: [floripa, maceio, portoSeguro],
    departureCity: "São Paulo",
    departureDate: "2026-06-10",
    returnDate: "2026-06-14",
    nights: 4,
    vehicle: "Ônibus Executivo",
    capacity: 42,
    priceAdult: 1490,
    priceChild: 790,
    installments: 12,
    rating: 4.8,
    reviews: 248,
    highlights: ["Praia dos Ingleses", "Lagoa da Conceição", "Centro Histórico"],
    description:
      "Conheça a magia da Ilha da Magia. Praias de águas cristalinas, gastronomia deliciosa e paisagens de tirar o fôlego em uma viagem confortável e bem assistida.",
    includes: [
      "Transporte em ônibus executivo",
      "4 diárias em pousada beira-mar",
      "Café da manhã",
      "Passeio de escuna",
      "Seguro viagem",
    ],
    packageType: "full",
    hotel: {
      name: "Pousada Mar Azul",
      stars: 4,
      meal: "Café da manhã",
      rooms: [
        { id: "double", name: "Quarto Duplo Vista Mar", capacity: 2, pricePerPerson: 0, description: "Sacada com vista para o mar." },
        { id: "triple", name: "Quarto Triplo Standard", capacity: 3, pricePerPerson: -90, description: "Acomoda até 3 pessoas." },
        { id: "family", name: "Quarto Família", capacity: 4, pricePerPerson: -140, description: "Para famílias com crianças." },
      ],
    },
  },
  {
    id: "t3",
    slug: "porto-seguro-bahia",
    destination: "Porto Seguro",
    state: "BA",
    agency: "Bahia Tour",
    agencySlug: "bahia-tour",
    image: portoSeguro,
    gallery: [portoSeguro, maceio, jeri],
    departureCity: "São Paulo",
    departureDate: "2026-07-08",
    returnDate: "2026-07-13",
    nights: 5,
    vehicle: "Ônibus Leito",
    capacity: 46,
    priceAdult: 1690,
    priceChild: 890,
    installments: 12,
    rating: 4.7,
    reviews: 189,
    highlights: ["Praia de Taperapuã", "Arraial d'Ajuda", "Trancoso"],
    description:
      "Descubra o lugar onde o Brasil começou. Praias de areia branca, mar quentinho e a alegria da cultura baiana em uma viagem inesquecível.",
    includes: [
      "Transporte em ônibus leito",
      "5 diárias all inclusive",
      "Café, almoço e jantar",
      "Passeio para Arraial d'Ajuda",
      "Seguro viagem",
    ],
    packageType: "full",
    hotel: {
      name: "Resort Coroa Vermelha",
      stars: 5,
      meal: "All inclusive",
      rooms: [
        { id: "double-lux", name: "Suíte Luxo Casal", capacity: 2, pricePerPerson: 0, description: "Suíte com hidromassagem." },
        { id: "triple", name: "Suíte Triplo", capacity: 3, pricePerPerson: -150, description: "Espaço amplo e varanda." },
        { id: "family", name: "Suíte Família", capacity: 4, pricePerPerson: -220, description: "Pensada para crianças e adultos." },
      ],
    },
  },
  {
    id: "t4",
    slug: "serra-gaucha-encantada",
    destination: "Gramado e Canela",
    state: "RS",
    agency: "Caminhos do Sol",
    agencySlug: "caminhos-do-sol",
    image: gramado,
    gallery: [gramado, rio, floripa],
    departureCity: "São Paulo",
    departureDate: "2026-08-20",
    returnDate: "2026-08-24",
    nights: 4,
    vehicle: "Ônibus Executivo",
    capacity: 42,
    priceAdult: 1390,
    priceChild: 720,
    installments: 12,
    rating: 4.9,
    reviews: 421,
    highlights: ["Mini Mundo", "Cascata do Caracol", "Vinícolas"],
    description:
      "Charme europeu no coração do Sul. Arquitetura única, gastronomia premiada e paisagens de montanha em uma escapada perfeita para casais e famílias.",
    includes: [
      "Transporte em ônibus executivo",
      "4 diárias em hotel boutique",
      "Café colonial",
      "Tour pelas vinícolas",
      "Seguro viagem",
    ],
    packageType: "flexible",
    hotelDiscount: 320,
    hotel: {
      name: "Hotel Bavária Boutique",
      stars: 4,
      meal: "Café colonial",
      rooms: [
        { id: "double", name: "Chalé Duplo", capacity: 2, pricePerPerson: 0, description: "Lareira e varanda privativa." },
        { id: "triple", name: "Chalé Triplo", capacity: 3, pricePerPerson: -110, description: "Para amigos ou família." },
      ],
    },
  },
  {
    id: "t5",
    slug: "maceio-aguas-cristalinas",
    destination: "Maceió",
    state: "AL",
    agency: "Bahia Tour",
    agencySlug: "bahia-tour",
    image: maceio,
    gallery: [maceio, portoSeguro, jeri],
    departureCity: "São Paulo",
    departureDate: "2026-09-05",
    returnDate: "2026-09-10",
    nights: 5,
    vehicle: "Ônibus Leito",
    capacity: 46,
    priceAdult: 1790,
    priceChild: 920,
    installments: 12,
    rating: 4.8,
    reviews: 276,
    highlights: ["Piscinas Naturais", "Praia do Francês", "São Miguel dos Milagres"],
    description:
      "Águas mais cristalinas do Brasil. Mergulhe em piscinas naturais e relaxe nas praias mais lindas do nordeste com toda comodidade.",
    includes: [
      "Transporte em ônibus leito",
      "5 diárias com pensão completa",
      "Passeio às piscinas naturais",
      "City tour por Maceió",
      "Seguro viagem",
    ],
    packageType: "full",
    hotel: {
      name: "Hotel Praia Bonita",
      stars: 4,
      meal: "Pensão completa",
      rooms: [
        { id: "double", name: "Apartamento Duplo", capacity: 2, pricePerPerson: 0, description: "Pé na areia." },
        { id: "triple", name: "Apartamento Triplo", capacity: 3, pricePerPerson: -100, description: "Boa opção para amigos." },
        { id: "family", name: "Apartamento Família", capacity: 4, pricePerPerson: -160, description: "Para famílias." },
      ],
    },
  },
  {
    id: "t6",
    slug: "jericoacoara-paraiso",
    destination: "Jericoacoara",
    state: "CE",
    agency: "Nordeste Vivo",
    agencySlug: "nordeste-vivo",
    image: jeri,
    gallery: [jeri, maceio, portoSeguro],
    departureCity: "São Paulo",
    departureDate: "2026-10-12",
    returnDate: "2026-10-18",
    nights: 6,
    vehicle: "Van Premium",
    capacity: 16,
    priceAdult: 2190,
    priceChild: 1190,
    installments: 12,
    rating: 5.0,
    reviews: 134,
    highlights: ["Duna do Pôr do Sol", "Lagoa do Paraíso", "Pedra Furada"],
    description:
      "Uma das vilas mais charmosas do Brasil. Dunas, lagoas de águas turquesas e o mais famoso pôr do sol do nordeste em uma experiência boutique para poucos.",
    includes: [
      "Transporte em van premium",
      "6 diárias em pousada boutique",
      "Café da manhã reforçado",
      "Buggy tour completo",
      "Seguro viagem",
    ],
    packageType: "full",
    hotel: {
      name: "Pousada Vila do Vento",
      stars: 5,
      meal: "Café da manhã",
      rooms: [
        { id: "double", name: "Bangalô Duplo", capacity: 2, pricePerPerson: 0, description: "Decoração rústica chic." },
        { id: "master", name: "Bangalô Master", capacity: 2, pricePerPerson: 280, description: "Vista para as dunas." },
      ],
    },
  },
];

export function getTripBySlug(slug: string): Trip | undefined {
  return TRIPS.find((t) => t.slug === slug);
}

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  });
}

export function formatDate(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso + "T12:00:00").toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  });
}
