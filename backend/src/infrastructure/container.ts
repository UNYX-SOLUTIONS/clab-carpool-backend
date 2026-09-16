import { prisma } from './database/prisma/client';
import { BcryptService } from './services/encryption/BcryptService';
import { JwtService } from './services/jwt/JwtService';
import { AuthService } from './services/auth/AuthService';
import { NodemailerService } from './services/email/NodemailerService';
import { PinGenerator } from './services/pin/PinGenerator';

import { PrismaUserRepository } from './repositories/PrismaUserRepository';
import { PrismaInstitutionRepository } from './repositories/PrismaInstitutionRepository';
import { PrismaVehicleRepository } from './repositories/PrismaVehicleRepository';
import { PrismaTravelRepository } from './repositories/PrismaTravelRepository';
import { PrismaTravelRequestRepository } from './repositories/PrismaTravelRequestRepository';
import { PrismaChatRepository } from './repositories/PrismaChatRepository';
import { PrismaMessageRepository } from './repositories/PrismaMessageRepository';
import { PrismaRatingRepository } from './repositories/PrismaRatingRepository';
import { PrismaWalletRepository } from './repositories/PrismaWalletRepository';
import { PrismaTransactionRepository } from './repositories/PrismaTransactionRepository';
import { PrismaPinValidationRepository } from './repositories/PrismaPinValidationRepository';

import { LoginUseCase } from '../application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '../application/use-cases/auth/RegisterUseCase';
import { VerifyEmailUseCase } from '../application/use-cases/auth/VerifyEmailUseCase';
import { LogoutUseCase } from '../application/use-cases/auth/LogoutUseCase';
import { RefreshTokenUseCase } from '../application/use-cases/auth/RefreshTokenUseCase';
import { GetProfileUseCase } from '../application/use-cases/user/GetProfileUseCase';
import { UpdateProfileUseCase } from '../application/use-cases/user/UpdateProfileUseCase';
import { GetUserByIdUseCase } from '../application/use-cases/user/GetUserByIdUseCase';
import { VerifyInstitutionUseCase } from '../application/use-cases/user/VerifyInstitutionUseCase';
import { CreateTravelUseCase } from '../application/use-cases/travel/CreateTravelUseCase';
import { GetAvailableTravelsUseCase } from '../application/use-cases/travel/GetAvailableTravelsUseCase';
import { GetTravelByIdUseCase } from '../application/use-cases/travel/GetTravelByIdUseCase';
import { RequestTravelUseCase } from '../application/use-cases/travel/RequestTravelUseCase';
import { UpdateTravelStatusUseCase } from '../application/use-cases/travel/UpdateTravelStatusUseCase';
import { GetMyTravelsUseCase } from '../application/use-cases/travel/GetMyTravelsUseCase';
import { CancelTravelUseCase } from '../application/use-cases/travel/CancelTravelUseCase';
import { GetChatsUseCase } from '../application/use-cases/chat/GetChatsUseCase';
import { GetChatMessagesUseCase } from '../application/use-cases/chat/GetChatMessagesUseCase';
import { SendMessageUseCase } from '../application/use-cases/chat/SendMessageUseCase';
import { GetActiveChatUseCase } from '../application/use-cases/chat/GetActiveChatUseCase';
import { RequestPinUseCase } from '../application/use-cases/chat/RequestPinUseCase';
import { RateTripUseCase } from '../application/use-cases/rating/RateTripUseCase';
import { GetRatingsUseCase } from '../application/use-cases/rating/GetRatingsUseCase';
import { GetWalletUseCase } from '../application/use-cases/wallet/GetWalletUseCase';
import { RechargeWalletUseCase } from '../application/use-cases/wallet/RechargeWalletUseCase';
import { GetTransactionsUseCase } from '../application/use-cases/wallet/GetTransactionsUseCase';
import { RegisterVehicleUseCase } from '../application/use-cases/vehicle/RegisterVehicleUseCase';
import { GetMyVehicleUseCase } from '../application/use-cases/vehicle/GetMyVehicleUseCase';
import { UpdateVehicleUseCase } from '../application/use-cases/vehicle/UpdateVehicleUseCase';

import { AuthController } from '../presentation/controllers/auth/AuthController';
import { UserController } from '../presentation/controllers/user/UserController';
import { TravelController } from '../presentation/controllers/travel/TravelController';
import { ChatController } from '../presentation/controllers/chat/ChatController';
import { RatingController } from '../presentation/controllers/rating/RatingController';
import { WalletController } from '../presentation/controllers/wallet/WalletController';
import { VehicleController } from '../presentation/controllers/vehicle/VehicleController';

export function buildContainer() {
  const jwtService = new JwtService();
  const authService = new AuthService(jwtService);
  const encryptionService = new BcryptService();
  const emailService = new NodemailerService();
  const pinGenerator = new PinGenerator(6);

  const userRepository = new PrismaUserRepository(prisma);
  const institutionRepository = new PrismaInstitutionRepository(prisma);
  const vehicleRepository = new PrismaVehicleRepository(prisma);
  const travelRepository = new PrismaTravelRepository(prisma);
  const travelRequestRepository = new PrismaTravelRequestRepository(prisma);
  const chatRepository = new PrismaChatRepository(prisma);
  const messageRepository = new PrismaMessageRepository(prisma);
  const ratingRepository = new PrismaRatingRepository(prisma);
  const walletRepository = new PrismaWalletRepository(prisma);
  const transactionRepository = new PrismaTransactionRepository(prisma);
  const pinValidationRepository = new PrismaPinValidationRepository(prisma);

  const loginUseCase = new LoginUseCase(userRepository, encryptionService, authService);
  const registerUseCase = new RegisterUseCase(
    userRepository,
    institutionRepository,
    walletRepository,
    encryptionService,
    emailService,
    authService,
  );
  const verifyEmailUseCase = new VerifyEmailUseCase(userRepository, authService);
  const logoutUseCase = new LogoutUseCase();
  const refreshTokenUseCase = new RefreshTokenUseCase(userRepository, authService);

  const getProfileUseCase = new GetProfileUseCase(userRepository);
  const updateProfileUseCase = new UpdateProfileUseCase(userRepository);
  const getUserByIdUseCase = new GetUserByIdUseCase(userRepository);
  const verifyInstitutionUseCase = new VerifyInstitutionUseCase(institutionRepository);

  const createTravelUseCase = new CreateTravelUseCase(travelRepository, vehicleRepository);
  const getAvailableTravelsUseCase = new GetAvailableTravelsUseCase(travelRepository);
  const getTravelByIdUseCase = new GetTravelByIdUseCase(travelRepository);
  const requestTravelUseCase = new RequestTravelUseCase(
    travelRepository,
    travelRequestRepository,
    chatRepository,
  );
  const updateTravelStatusUseCase = new UpdateTravelStatusUseCase(travelRepository);
  const getMyTravelsUseCase = new GetMyTravelsUseCase(
    travelRepository,
    travelRequestRepository,
  );
  const cancelTravelUseCase = new CancelTravelUseCase(travelRepository);

  const getChatsUseCase = new GetChatsUseCase(chatRepository);
  const getChatMessagesUseCase = new GetChatMessagesUseCase(
    chatRepository,
    messageRepository,
  );
  const sendMessageUseCase = new SendMessageUseCase(chatRepository, messageRepository);
  const getActiveChatUseCase = new GetActiveChatUseCase(chatRepository);
  const requestPinUseCase = new RequestPinUseCase(
    travelRepository,
    pinValidationRepository,
    userRepository,
    pinGenerator,
    emailService,
  );

  const rateTripUseCase = new RateTripUseCase(
    travelRepository,
    travelRequestRepository,
    ratingRepository,
  );
  const getRatingsUseCase = new GetRatingsUseCase(ratingRepository);

  const getWalletUseCase = new GetWalletUseCase(walletRepository);
  const rechargeWalletUseCase = new RechargeWalletUseCase(walletRepository);
  const getTransactionsUseCase = new GetTransactionsUseCase(transactionRepository);

  const registerVehicleUseCase = new RegisterVehicleUseCase(vehicleRepository);
  const getMyVehicleUseCase = new GetMyVehicleUseCase(vehicleRepository);
  const updateVehicleUseCase = new UpdateVehicleUseCase(vehicleRepository);

  const controllers = {
    auth: new AuthController(
      loginUseCase,
      registerUseCase,
      verifyEmailUseCase,
      logoutUseCase,
      refreshTokenUseCase,
      userRepository,
      authService,
      emailService,
    ),
    user: new UserController(
      getProfileUseCase,
      updateProfileUseCase,
      getUserByIdUseCase,
      verifyInstitutionUseCase,
    ),
    travel: new TravelController(
      createTravelUseCase,
      getAvailableTravelsUseCase,
      getTravelByIdUseCase,
      requestTravelUseCase,
      updateTravelStatusUseCase,
      getMyTravelsUseCase,
      cancelTravelUseCase,
    ),
    chat: new ChatController(
      getChatsUseCase,
      getChatMessagesUseCase,
      sendMessageUseCase,
      getActiveChatUseCase,
      requestPinUseCase,
    ),
    rating: new RatingController(rateTripUseCase, getRatingsUseCase),
    wallet: new WalletController(
      getWalletUseCase,
      rechargeWalletUseCase,
      getTransactionsUseCase,
    ),
    vehicle: new VehicleController(
      registerVehicleUseCase,
      getMyVehicleUseCase,
      updateVehicleUseCase,
    ),
  };

  return {
    prisma,
    services: {
      jwtService,
      authService,
      encryptionService,
      emailService,
      pinGenerator,
    },
    repositories: {
      userRepository,
      institutionRepository,
      vehicleRepository,
      travelRepository,
      travelRequestRepository,
      chatRepository,
      messageRepository,
      ratingRepository,
      walletRepository,
      transactionRepository,
      pinValidationRepository,
    },
    useCases: {
      loginUseCase,
      registerUseCase,
      verifyEmailUseCase,
      logoutUseCase,
      refreshTokenUseCase,
      getProfileUseCase,
      updateProfileUseCase,
      getUserByIdUseCase,
      verifyInstitutionUseCase,
      createTravelUseCase,
      getAvailableTravelsUseCase,
      getTravelByIdUseCase,
      requestTravelUseCase,
      updateTravelStatusUseCase,
      getMyTravelsUseCase,
      cancelTravelUseCase,
      getChatsUseCase,
      getChatMessagesUseCase,
      sendMessageUseCase,
      getActiveChatUseCase,
      requestPinUseCase,
      rateTripUseCase,
      getRatingsUseCase,
      getWalletUseCase,
      rechargeWalletUseCase,
      getTransactionsUseCase,
      registerVehicleUseCase,
      getMyVehicleUseCase,
      updateVehicleUseCase,
    },
    controllers,
  };
}

export type Container = ReturnType<typeof buildContainer>;
