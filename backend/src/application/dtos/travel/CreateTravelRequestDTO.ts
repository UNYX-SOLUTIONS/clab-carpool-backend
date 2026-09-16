export interface CreateTravelRequestDTO {
  origin: string;
  destination: string;
  departureTime: string;
  availableSeats: number;
  pricePerSeat: number;
  vehicleId: string;
}
