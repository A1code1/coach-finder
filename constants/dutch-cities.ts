export interface City {
  name: string;
  lat: number;
  lng: number;
}

export const DUTCH_CITIES: City[] = [
  { name: "Amsterdam", lat: 52.3676, lng: 4.9041 },
  { name: "Rotterdam", lat: 51.9225, lng: 4.4792 },
  { name: "The Hague", lat: 52.0705, lng: 4.2566 },
  { name: "Utrecht", lat: 52.0894, lng: 5.1104 },
  { name: "Eindhoven", lat: 51.4416, lng: 5.4697 },
  { name: "Groningen", lat: 53.2193, lng: 6.5665 },
  { name: "Tilburg", lat: 51.5534, lng: 5.0823 },
  { name: "Almere", lat: 52.3676, lng: 5.2246 },
  { name: "Breda", lat: 51.5882, lng: 4.7789 },
  { name: "Nijmegen", lat: 51.8425, lng: 5.8520 },
  { name: "Apeldoorn", lat: 52.2127, lng: 5.9705 },
  { name: "Haarlem", lat: 52.3874, lng: 4.6370 },
  { name: "Arnhem", lat: 51.9851, lng: 5.8987 },
  { name: "Enschede", lat: 52.2215, lng: 6.8936 },
  { name: "Amersfoort", lat: 52.1601, lng: 5.3878 },
  { name: "Maastricht", lat: 50.8503, lng: 5.6903 },
  { name: "Dordrecht", lat: 51.8133, lng: 4.6700 },
  { name: "Leiden", lat: 52.1601, lng: 4.4852 },
  { name: "Haarlemmermeer", lat: 52.3030, lng: 4.6890 },
  { name: "Zaanstad", lat: 52.4400, lng: 4.8200 },
  { name: "Delft", lat: 52.0092, lng: 4.3595 },
  { name: "Zoetermeer", lat: 52.0540, lng: 4.4964 },
  { name: "Zwolle", lat: 52.5053, lng: 6.0925 },
  { name: "Den Bosch", lat: 51.6921, lng: 5.3040 },
  { name: "Spijkenisse", lat: 51.8449, lng: 4.3297 },
  { name: "Capelle aan den IJssel", lat: 51.8876, lng: 4.6425 },
  { name: "Schiedam", lat: 51.9264, lng: 4.3875 },
  { name: "Vlaardingen", lat: 51.8922, lng: 4.3403 },
  { name: "Leeuwarden", lat: 53.2011, lng: 5.7896 },
  { name: "Alkmaar", lat: 52.6330, lng: 4.7400 },
  { name: "Haarlem", lat: 52.3874, lng: 4.6370 },
  { name: "Gouda", lat: 52.0144, lng: 4.7078 },
  { name: "Hilversum", lat: 52.2229, lng: 5.1744 },
  { name: "Purmerend", lat: 52.4986, lng: 4.9603 },
  { name: "Lelystad", lat: 52.5083, lng: 5.4767 },
  { name: "Harderwijk", lat: 52.3407, lng: 5.6247 },
  { name: "Kampen", lat: 52.5555, lng: 5.8944 },
  { name: "Huizen", lat: 52.2806, lng: 5.2856 },
  { name: "Hoorn", lat: 52.6428, lng: 5.0588 },
  { name: "Edam", lat: 52.5278, lng: 5.0500 },
  { name: "Middelburg", lat: 51.4988, lng: 3.6109 },
  { name: "Vlissingen", lat: 51.4426, lng: 3.5751 },
  { name: "Tiel", lat: 51.8817, lng: 5.4231 },
  { name: "Venlo", lat: 51.3657, lng: 6.1729 },
  { name: "Roermond", lat: 51.1919, lng: 5.9878 },
  { name: "Hengelo", lat: 52.2722, lng: 6.7969 },
  { name: "Winterswijk", lat: 52.1333, lng: 6.7500 },
  { name: "Delfzijl", lat: 53.3281, lng: 6.9267 },
  { name: "Winschoten", lat: 53.1667, lng: 7.0167 },
  { name: "Deventer", lat: 52.2553, lng: 6.1613 },
  { name: "Ede", lat: 52.0402, lng: 5.6649 },
  { name: "Westland", lat: 51.9936, lng: 4.2094 },
  { name: "Alphen aan den Rijn", lat: 52.1291, lng: 4.6550 },
  { name: "Emmen", lat: 52.7792, lng: 6.9069 },
  { name: "Sittard-Geleen", lat: 50.9900, lng: 5.8400 },
  { name: "Helmond", lat: 51.4793, lng: 5.6570 },
  { name: "Oss", lat: 51.7650, lng: 5.5180 },
  { name: "Amstelveen", lat: 52.3008, lng: 4.8625 },
  { name: "Súdwest-Fryslân", lat: 53.0326, lng: 5.6589 },
  { name: "Heerlen", lat: 50.8882, lng: 5.9795 },
  { name: "Nissewaard", lat: 51.8449, lng: 4.3297 },
  { name: "Meierijstad", lat: 51.6167, lng: 5.5486 },
  { name: "Leidschendam-Voorburg", lat: 52.0800, lng: 4.3800 },
  { name: "Almelo", lat: 52.3567, lng: 6.6625 },
  { name: "Velsen", lat: 52.4580, lng: 4.6190 },
  { name: "Bergen op Zoom", lat: 51.4946, lng: 4.2871 },
  { name: "Aalsmeer", lat: 52.2640, lng: 4.7620 },
];

export function getCityByName(name: string): City | undefined {
  return DUTCH_CITIES.find((city) => city.name.toLowerCase() === name.toLowerCase());
}

export function searchCities(query: string): City[] {
  const lowerQuery = query.toLowerCase();
  return DUTCH_CITIES.filter((city) =>
    city.name.toLowerCase().includes(lowerQuery)
  ).slice(0, 10);
}
