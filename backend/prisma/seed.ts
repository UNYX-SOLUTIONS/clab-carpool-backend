import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const existingUsers = await prisma.user.count();

  if (existingUsers > 0) {
    console.log('ℹ️ La base de datos ya contiene datos. Omitiendo seed (ejecuta pnpm db:seed a propósito para reiniciarlos).');
    return;
  }

  console.log('🌱 Sembrando datos de prueba...');

  const passwordHash = await bcrypt.hash('Password1!', 12);

  await prisma.pinValidation.deleteMany();
  await prisma.rating.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.travelRequest.deleteMany();
  await prisma.travel.deleteMany();
  await prisma.wallet.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.institution.deleteMany();

  const espol = await prisma.institution.create({
    data: {
      name: 'Escuela Superior Politécnica del Litoral',
      domain: 'espol.edu.ec',
      isActive: true,
    },
  });

  const ug = await prisma.institution.create({
    data: {
      name: 'Universidad de Guayaquil',
      domain: 'ug.edu.ec',
      isActive: true,
    },
  });

  const driver = await prisma.user.create({
    data: {
      email: 'carlos.perez@espol.edu.ec',
      passwordHash,
      fullName: 'Carlos Pérez',
      institutionId: espol.id,
      isVerified: true,
      isDriver: true,
      phone: '+593987654321',
    },
  });

  const passenger1 = await prisma.user.create({
    data: {
      email: 'ana.torres@espol.edu.ec',
      passwordHash,
      fullName: 'Ana María Torres',
      institutionId: espol.id,
      isVerified: true,
      phone: '+593981234567',
    },
  });

  const passenger2 = await prisma.user.create({
    data: {
      email: 'luis.gomez@ug.edu.ec',
      passwordHash,
      fullName: 'Luis Andrés Gómez',
      institutionId: ug.id,
      isVerified: true,
    },
  });

  const unverified = await prisma.user.create({
    data: {
      email: 'maria.ramirez@espol.edu.ec',
      passwordHash,
      fullName: 'María José Ramírez',
      institutionId: espol.id,
      isVerified: false,
    },
  });

  await prisma.wallet.createMany({
    data: [
      { userId: driver.id, balance: 45.5 },
      { userId: passenger1.id, balance: 20 },
      { userId: passenger2.id, balance: 0 },
      { userId: unverified.id, balance: 0 },
    ],
  });

  const vehicle = await prisma.vehicle.create({
    data: {
      userId: driver.id,
      brand: 'Toyota',
      model: 'Corolla',
      plate: 'GBA-1234',
      color: 'Blanco',
      seats: 4,
    },
  });

  const travel1 = await prisma.travel.create({
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      origin: 'Puerta principal ESPOL',
      destination: 'Campus Prosperina',
      departureTime: new Date(Date.now() + 24 * 60 * 60 * 1000),
      availableSeats: 3,
      pricePerSeat: 1.5,
      status: 'active',
    },
  });

  await prisma.travel.create({
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      origin: 'Gasolinera Primax',
      destination: 'ESPOL',
      departureTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      availableSeats: 2,
      pricePerSeat: 2.5,
      status: 'active',
    },
  });

  const travel3 = await prisma.travel.create({
    data: {
      driverId: driver.id,
      vehicleId: vehicle.id,
      origin: 'ESPOL',
      destination: 'Centro de Guayaquil',
      departureTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      availableSeats: 0,
      pricePerSeat: 2,
      status: 'completed',
    },
  });

  await prisma.travelRequest.createMany({
    data: [
      {
        travelId: travel1.id,
        passengerId: passenger1.id,
        status: 'confirmed',
        requestedAt: new Date(Date.now() - 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        travelId: travel3.id,
        passengerId: passenger2.id,
        status: 'confirmed',
        requestedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        confirmedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000 + 3600 * 1000),
      },
    ],
  });

  const chat = await prisma.chat.create({
    data: {
      travelId: travel1.id,
      user1Id: driver.id,
      user2Id: passenger1.id,
      lastMessageAt: new Date(),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        chatId: chat.id,
        senderId: driver.id,
        content: 'Hola Ana, nos vemos en la puerta principal a las 8.',
        type: 'text',
        sentAt: new Date(Date.now() - 30 * 60 * 1000),
      },
      {
        chatId: chat.id,
        senderId: passenger1.id,
        content: 'Perfecto Carlos, allí estaré.',
        type: 'text',
        sentAt: new Date(Date.now() - 20 * 60 * 1000),
        isRead: true,
        readAt: new Date(Date.now() - 19 * 60 * 1000),
      },
    ],
  });

  await prisma.rating.createMany({
    data: [
      {
        travelId: travel3.id,
        raterId: passenger2.id,
        ratedId: driver.id,
        score: 5,
        comment: 'Excelente conductor, muy puntual',
      },
      {
        travelId: travel3.id,
        raterId: driver.id,
        ratedId: passenger2.id,
        score: 5,
        comment: 'Muy buen pasajero',
      },
    ],
  });

  const driverWallet = await prisma.wallet.findUniqueOrThrow({
    where: { userId: driver.id },
  });

  await prisma.transaction.createMany({
    data: [
      {
        walletId: driverWallet.id,
        userId: driver.id,
        amount: 20,
        type: 'recharge',
        status: 'completed',
        description: 'Recarga de saldo vía tarjeta',
      },
      {
        walletId: driverWallet.id,
        userId: driver.id,
        amount: 1.5,
        type: 'payment',
        status: 'completed',
        description: 'Pago de viaje ESPOL - Centro',
        referenceId: travel3.id,
      },
    ],
  });

  console.log('✅ Datos sembrados correctamente:');
  console.log('   - Conductores: carlos.perez@espol.edu.ec (Password1!)');
  console.log('   - Pasajeros: ana.torres@espol.edu.ec, luis.gomez@ug.edu.ec');
  console.log('   - Sin verificar: maria.ramirez@espol.edu.ec');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
