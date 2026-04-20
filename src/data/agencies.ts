import { TRIPS } from "./trips";

export type Agency = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  city: string;
  state: string;
  rating: number;
  reviews: number;
  yearsActive: number;
  brandColor: string; // oklch
  initials: string;
};

export const AGENCIES: Agency[] = [
  {
    id: "a1",
    slug: "caminhos-do-sol",
    name: "Caminhos do Sol",
    tagline: "Viagens que aquecem a alma",
    description:
      "Há mais de 15 anos criando experiências únicas pelo Brasil. Especialistas em excursões em grupo com conforto, segurança e atendimento personalizado.",
    city: "São Paulo",
    state: "SP",
    rating: 4.9,
    reviews: 1284,
    yearsActive: 15,
    brandColor: "oklch(0.55 0.18 35)",
    initials: "CS",
  },
  {
    id: "a2",
    slug: "bahia-tour",
    name: "Bahia Tour",
    tagline: "O nordeste do jeito que você merece",
    description:
      "Operadora especializada em destinos do nordeste brasileiro. Pacotes all inclusive, transporte premium e os melhores hotéis da costa.",
    city: "Salvador",
    state: "BA",
    rating: 4.7,
    reviews: 892,
    yearsActive: 12,
    brandColor: "oklch(0.65 0.16 65)",
    initials: "BT",
  },
  {
    id: "a3",
    slug: "nordeste-vivo",
    name: "Nordeste Vivo",
    tagline: "Experiências boutique para poucos",
    description:
      "Roteiros exclusivos em pequenos grupos. Atendimento personalizado, hospedagens charmosas e os destinos mais autênticos do nordeste.",
    city: "Fortaleza",
    state: "CE",
    rating: 5.0,
    reviews: 312,
    yearsActive: 8,
    brandColor: "oklch(0.6 0.18 200)",
    initials: "NV",
  },
];

export function getAgencyBySlug(slug: string): Agency | undefined {
  return AGENCIES.find((a) => a.slug === slug);
}

export function getTripsByAgency(slug: string) {
  return TRIPS.filter((t) => t.agencySlug === slug);
}
