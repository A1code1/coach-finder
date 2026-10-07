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
  "Utrecht": [
    { name: "Sportpark Loevenhoutsedijk", lat: 52.10781, lng: 5.11237 },
    { name: "Sportpark Marco van Basten", lat: 52.09302, lng: 5.0804 },
    { name: "Sportpark De Berekuil", lat: 52.10002, lng: 5.1448 },
    { name: "Sportpark Vechtzoom", lat: 52.11372, lng: 5.10046 },
    { name: "Sportpark Papendorp", lat: 52.0691, lng: 5.08558 },
  ],
};
