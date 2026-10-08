import { FOOTBALL_FIELDS, type FootballField } from "@/constants/football-fields";
import { getCityByName } from "@/constants/dutch-cities";

export type CoachField = FootballField & { city: string; matched: boolean };

function hash(text: string): number {
  let h = 0;
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const normalize = (text: string) =>
  text
    .toLowerCase()
    .replace(/^(sportpark|sportcomplex)\s+/, "")
    .trim();

// The football field a coach is shown at on the map. Coaches only give a city
// and free-text training locations, so: use a real field in their city whose
// name matches one of their training locations, otherwise pick one of the
// city's fields, stable per coach. Falls back to the city centre.
export function getCoachField(coach: {
  id: string;
  city: string;
  training_locations?: string[] | null;
}): CoachField | null {
  const city = getCityByName(coach.city);
  const fields = city ? FOOTBALL_FIELDS[city.name] || [] : [];

  if (fields.length > 0) {
    for (const location of coach.training_locations || []) {
      const wanted = normalize(location);
      if (wanted.length < 3) continue;
      const match = fields.find((f) => {
        const name = normalize(f.name);
        return name === wanted || name.includes(wanted) || wanted.includes(name);
      });
      if (match) return { ...match, city: city!.name, matched: true };
    }
    return { ...fields[hash(coach.id) % fields.length], city: city!.name, matched: false };
  }

  if (city) return { name: city.name, lat: city.lat, lng: city.lng, city: city.name, matched: false };
  return null;
}
