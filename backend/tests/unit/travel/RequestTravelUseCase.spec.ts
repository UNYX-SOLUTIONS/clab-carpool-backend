import { RequestTravelUseCase } from '../../../src/application/use-cases/travel/RequestTravelUseCase';
import { ITravelRepository } from '../../../src/domain/repositories/ITravelRepository';
import { ITravelRequestRepository } from '../../../src/domain/repositories/ITravelRequestRepository';
import { IChatRepository } from '../../../src/domain/repositories/IChatRepository';
import { Travel } from '../../../src/domain/entities/Travel';
import { TravelRequest } from '../../../src/domain/entities/TravelRequest';
import { Chat } from '../../../src/domain/entities/Chat';

const makeTravel = (overrides: Partial<{ availableSeats: number; status: string; isActive: boolean; driverId: string }> = {}) =>
  Travel.create({
    id: 'travel_1',
    driverId: overrides.driverId ?? 'driver_1',
    vehicleId: 'vehicle_1',
    origin: 'ESPOL',
    destination: 'Centro',
    departureTime: new Date(Date.now() + 3600 * 1000),
    availableSeats: overrides.availableSeats ?? 2,
    pricePerSeat: 1.5,
    status: overrides.status ?? 'active',
    isActive: overrides.isActive ?? true,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).value;

describe('RequestTravelUseCase', () => {
  const travelRepository: jest.Mocked<ITravelRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findAvailable: jest.fn(),
    updateStatus: jest.fn(),
    updateSeats: jest.fn(),
    softDelete: jest.fn(),
    findByUserId: jest.fn(),
  };

  const travelRequestRepository: jest.Mocked<ITravelRequestRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByTravelId: jest.fn(),
    findPendingByTravelAndPassenger: jest.fn(),
    updateStatus: jest.fn(),
    findByPassengerId: jest.fn(),
  };

  const chatRepository: jest.Mocked<IChatRepository> = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findActiveByTravelAndUsers: jest.fn(),
    findActiveByTravelId: jest.fn(),
    updateLastMessage: jest.fn(),
  };

  const useCase = new RequestTravelUseCase(
    travelRepository,
    travelRequestRepository,
    chatRepository,
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar cuando el viaje no existe', async () => {
    travelRepository.findById.mockResolvedValue(null);

    const result = await useCase.execute('passenger_1', { travelId: 'travel_1' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('DOMAIN_ERROR');
  });

  it('debe fallar cuando el viaje no está activo', async () => {
    travelRepository.findById.mockResolvedValue(
      makeTravel({ status: 'completed' }),
    );

    const result = await useCase.execute('passenger_1', { travelId: 'travel_1' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('TRAVEL_NOT_ACTIVE');
  });

  it('debe fallar cuando el conductor intenta solicitar su propio viaje', async () => {
    travelRepository.findById.mockResolvedValue(makeTravel({ driverId: 'driver_1' }));

    const result = await useCase.execute('driver_1', { travelId: 'travel_1' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('TRAVEL_OWN_REQUEST');
  });

  it('debe fallar cuando el viaje está lleno', async () => {
    travelRepository.findById.mockResolvedValue(makeTravel({ availableSeats: 0 }));

    const result = await useCase.execute('passenger_1', { travelId: 'travel_1' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('DOMAIN_ERROR');
  });

  it('debe fallar cuando el pasajero ya solicitó el viaje', async () => {
    travelRepository.findById.mockResolvedValue(makeTravel());
    travelRequestRepository.findPendingByTravelAndPassenger.mockResolvedValue(
      TravelRequest.create({
        id: 'request_1',
        travelId: 'travel_1',
        passengerId: 'passenger_1',
        status: 'pending',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute('passenger_1', { travelId: 'travel_1' });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('TRAVEL_ALREADY_REQUESTED');
  });

  it('debe crear la solicitud, reservar asiento y crear chat', async () => {
    travelRepository.findById.mockResolvedValue(makeTravel());
    travelRequestRepository.findPendingByTravelAndPassenger.mockResolvedValue(null);
    travelRequestRepository.create.mockResolvedValue(
      TravelRequest.create({
        id: 'request_new',
        travelId: 'travel_1',
        passengerId: 'passenger_1',
        status: 'pending',
        requestedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );
    travelRepository.updateSeats.mockResolvedValue(makeTravel({ availableSeats: 1 }));
    chatRepository.findActiveByTravelAndUsers.mockResolvedValue(null);
    chatRepository.create.mockResolvedValue(
      Chat.create({
        id: 'chat_new',
        travelId: 'travel_1',
        user1Id: 'driver_1',
        user2Id: 'passenger_1',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    );

    const result = await useCase.execute('passenger_1', { travelId: 'travel_1' });

    expect(result.isSuccess).toBe(true);
    expect(result.value.chatId).toBe('chat_new');
    expect(travelRepository.updateSeats).toHaveBeenCalledWith('travel_1', 1);
    expect(travelRequestRepository.create).toHaveBeenCalledWith({
      travelId: 'travel_1',
      passengerId: 'passenger_1',
    });
    expect(chatRepository.create).toHaveBeenCalledWith({
      travelId: 'travel_1',
      user1Id: 'driver_1',
      user2Id: 'passenger_1',
    });
  });
});
