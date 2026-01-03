export type GeocodeResult = {
  lat: number;
  lng: number;
  displayName?: string;
};

export class GeocodingError extends Error {
  constructor(
    message: string,
    public readonly code: "UPSTREAM_ERROR" | "NO_RESULTS" | "INVALID_RESPONSE",
  ) {
    super(message);
    this.name = "GeocodingError";
  }
}
