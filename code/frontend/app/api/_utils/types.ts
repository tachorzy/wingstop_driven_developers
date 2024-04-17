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

export interface Floorplan {
    floorplanId: string;
    dateCreated: string;
    imageData: string;
    factoryId: string;
}

export interface Asset {
    assetId: string;
    name: string;
    description: string;
    imageData?: string;
    factoryId: string;
    modelId:string;
    modelUrl:string;
    
}

export interface Attribute {
    attributeId?: string;
    factoryId: string;
    assetId: string;
    modelId: string;
    name: string;
    value: string;
}

export interface Property {
    propertyId: string;
    factoryId: string;
    modelId: string;
    assetId: string;
    measurementId: string;
    name: string;
    unit: string;
    generatorType: string;
}

export interface Measurement {
    measurementId: string;
    propertyId: string;
    modelId: string;
    factoryId: string;
    lowerBound: number;
    upperBound: number;
    generatorFunction: string;
    frequency: number;
    precision: number;
    angularFrequency?: number;
    amplitude?: number;
    phase?: number;
}

export interface Model {
    modelId: string;
    factoryId: string;
    attributes: Attribute[];
    properties: Property[];
}
