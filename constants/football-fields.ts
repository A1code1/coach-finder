// Real football sports parks per city, from OpenStreetMap (© OpenStreetMap contributors, ODbL).
// Sports centres named "Sportpark …" / "Sportcomplex …" within 5 km of the city centre,
// nearest first, up to 12 per city. Generated once; coaches are pinned at one of these.
export interface FootballField {
  name: string;
  lat: number;
  lng: number;
}

export const FOOTBALL_FIELDS: Record<string, FootballField[]> = {
  "Amsterdam": [
    { name: "Sportpark Drieburg", lat: 52.34074, lng: 4.93251 },
    { name: "Sportpark Middenmeer", lat: 52.34972, lng: 4.94958 },
    { name: "Sportpark Goed Genoeg", lat: 52.33755, lng: 4.88117 },
    { name: "Sportpark Buiksloterbanne", lat: 52.40197, lng: 4.9209 },
    { name: "Sportpark Voorland", lat: 52.34687, lng: 4.95392 },
    { name: "Sportpark Transformatorweg", lat: 52.39371, lng: 4.85911 },
    { name: "Sportpark Buitenveldert", lat: 52.33596, lng: 4.8659 },
    { name: "Sportpark Overamstel", lat: 52.32719, lng: 4.90462 },
    { name: "Sportpark de Schinkel", lat: 52.34181, lng: 4.85081 },
    { name: "Sportpark Tuindorp Oostzaan", lat: 52.41332, lng: 4.8965 },
    { name: "Sportpark Kadoelen", lat: 52.41408, lng: 4.91255 },
  ],
  "Rotterdam": [
    { name: "Sportcomplex Nenijto", lat: 51.9255, lng: 4.45742 },
    { name: "Sportpark Woudestein", lat: 51.9182, lng: 4.52081 },
    { name: "Sportpark Nieuw Terbregge", lat: 51.94841, lng: 4.50536 },
    { name: "Sportpark Toepad", lat: 51.91136, lng: 4.52916 },
    { name: "Sportpark 16 Hoven", lat: 51.94697, lng: 4.44058 },
  ],
  "The Hague": [
    { name: "Sportpark Laan van Poot", lat: 52.07752, lng: 4.24338 },
    { name: "Sportcomplex Erasmusweg", lat: 52.03445, lng: 4.27185 },
    { name: "Sportpark Prinses Irene", lat: 52.03954, lng: 4.29757 },
    { name: "Sportpark Vredenburch", lat: 52.0504, lng: 4.32105 },
  ],
  "Utrecht": [
    { name: "Sportpark Loevenhoutsedijk", lat: 52.10781, lng: 5.11237 },
    { name: "Sportpark Marco van Basten", lat: 52.09302, lng: 5.0804 },
    { name: "Sportpark De Berekuil", lat: 52.10002, lng: 5.1448 },
    { name: "Sportpark Vechtzoom", lat: 52.11372, lng: 5.10046 },
    { name: "Sportpark Papendorp", lat: 52.0691, lng: 5.08558 },
    { name: "Sportpark Rijnvliet", lat: 52.07481, lng: 5.06439 },
    { name: "Sportpark Overvecht-Noord", lat: 52.13249, lng: 5.08563 },
  ],
  "Eindhoven": [
    { name: "Sportpark De Hondsheuvels", lat: 51.4549, lng: 5.49263 },
    { name: "Sportpark Dommeldal Zuid", lat: 51.41517, lng: 5.45223 },
    { name: "Sportpark Aalsterweg", lat: 51.41163, lng: 5.47643 },
    { name: "Sportpark De Aalstervelden", lat: 51.39863, lng: 5.48209 },
  ],
  "Groningen": [
    { name: "Sportpark De Wijert", lat: 53.20197, lng: 6.57087 },
    { name: "Sportpark het Noorden", lat: 53.24009, lng: 6.55651 },
    { name: "Sportpark Corpus den Hoorn", lat: 53.19492, lng: 6.5447 },
    { name: "Sportpark Lewenborg", lat: 53.23238, lng: 6.60902 },
    { name: "Sportpark Coendersborg", lat: 53.19684, lng: 6.59981 },
    { name: "Sportpark Kardinge", lat: 53.24255, lng: 6.60429 },
    { name: "Sportpark Esserberg", lat: 53.18712, lng: 6.59092 },
    { name: "Sportpark Hoogkerk", lat: 53.20916, lng: 6.50882 },
    { name: "Sportcomplex Bea", lat: 53.18255, lng: 6.60058 },
  ],
  "Tilburg": [
    { name: "Sportcomplex T-Kwadraat", lat: 51.54001, lng: 5.0746 },
    { name: "Sportpark Van den Wildenberg", lat: 51.51689, lng: 5.04884 },
    { name: "Sportpark De Rauwbraken", lat: 51.58305, lng: 5.13036 },
  ],
  "Almere": [
    { name: "Sportpark Klein-Brandt", lat: 52.37262, lng: 5.19632 },
    { name: "Sportcomplex Annapark", lat: 52.35731, lng: 5.19612 },
    { name: "Sportpark Rie Mastenbroek", lat: 52.38683, lng: 5.21036 },
    { name: "Sportpark Fanny Blankers-Koen", lat: 52.39133, lng: 5.24269 },
    { name: "Sportpark De Marken", lat: 52.34073, lng: 5.23132 },
    { name: "Sportpark De Laren", lat: 52.3424, lng: 5.20052 },
    { name: "Sportpark Polderkwartier", lat: 52.39129, lng: 5.2581 },
    { name: "Sportpark Buitenhout", lat: 52.37995, lng: 5.28439 },
  ],
  "Breda": [
    { name: "Sportpark Het Kadijkje", lat: 51.6023, lng: 4.78167 },
  ],
  "Nijmegen": [
    { name: "Sportpark Fagelstraat", lat: 51.83786, lng: 5.86801 },
    { name: "Sportpark De Kwakkenberg", lat: 51.82894, lng: 5.88777 },
    { name: "Sportpark Vossenpels", lat: 51.87077, lng: 5.87486 },
    { name: "Sportpark Nieuw Balveren", lat: 51.88379, lng: 5.84146 },
  ],
  "Apeldoorn": [
    { name: "Sportpark Marialust", lat: 52.22559, lng: 5.96901 },
    { name: "Sportcomplex de Voorwaarts", lat: 52.20986, lng: 5.99186 },
    { name: "Sportpark de Winkeweijert", lat: 52.18835, lng: 5.95289 },
    { name: "Sportpark Nagelpoel", lat: 52.1844, lng: 5.97652 },
    { name: "Sportpark Orderbos", lat: 52.20226, lng: 5.9197 },
  ],
  "Haarlem": [
    { name: "Sportcomplex Tetterode", lat: 52.39198, lng: 4.60078 },
    { name: "Sportcomplex De Elta", lat: 52.41809, lng: 4.63579 },
    { name: "Sportpark Van der Aart", lat: 52.42483, lng: 4.65079 },
    { name: "Sportpark H.B.C.", lat: 52.34401, lng: 4.63309 },
    { name: "Sportpark Spaarndam", lat: 52.41664, lng: 4.69483 },
  ],
  "Arnhem": [
    { name: "Sportpark 't Cranevelt", lat: 52.00008, lng: 5.90386 },
    { name: "Sportpark Bakenberg", lat: 52.00281, lng: 5.88196 },
    { name: "Sportpark Hartenstein", lat: 51.98572, lng: 5.83427 },
    { name: "Sportpark Rijkerswoerd", lat: 51.94425, lng: 5.88185 },
  ],
};
