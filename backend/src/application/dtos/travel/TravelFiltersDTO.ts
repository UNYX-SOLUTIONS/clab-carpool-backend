export interface TravelFiltersDTO {
  origin?: string;
  destination?: string;
  dateFrom?: string;
  dateTo?: string;
  minSeats?: number;
  maxPrice?: number;
}
