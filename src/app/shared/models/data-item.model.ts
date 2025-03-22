export interface LocationData {
  lat: number;
  lng: number;
}

export interface DataItem {
  id: string;
  task?: string;
  status?: string;
  from?: string;
  to?: string;
  customerAddress?: string;
  dueDate?: string;
  location?: LocationData;
  [key: string]: string | number | boolean | Date | LocationData | null | undefined;
}

export interface DataFilter {
  [key: string]: string | number | boolean | Date | null | undefined;
  search?: string;
} 