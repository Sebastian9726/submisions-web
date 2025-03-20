export interface DataItem {
  id: string;
  [key: string]: any;
}

export interface LocationData {
  lat: number;
  lng: number;
}

export interface DataFilter {
  [key: string]: any;
  search?: string;
} 