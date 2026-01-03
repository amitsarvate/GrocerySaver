export type NearbyStore = {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lng: number;
  source: "overpass";
  distanceMeters: number;
};
