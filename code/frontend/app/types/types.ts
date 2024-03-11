export interface Location {
    longitude: number;
    latitude: number;
}
export interface Factory {
    factoryId?: string;
    name: string;
    location: Location;
    description: string;
}
export interface ApiResponse {
    statusCode: number;
    headers: Record<string, string> | null;
    multiValueHeaders: Record<string, string[]> | null;
    body: string;
}