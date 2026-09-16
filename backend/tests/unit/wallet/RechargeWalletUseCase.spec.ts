import { RechargeWalletUseCase } from '../../../src/application/use-cases/wallet/RechargeWalletUseCase';
import { IWalletRepository } from '../../../src/domain/repositories/IWalletRepository';
import { Wallet } from '../../../src/domain/entities/Wallet';
import { Transaction } from '../../../src/domain/entities/Transaction';

describe('RechargeWalletUseCase', () => {
  const walletRepository: jest.Mocked<IWalletRepository> = {
    create: jest.fn(),
    findByUserId: jest.fn(),
    getOrCreate: jest.fn(),
    updateBalance: jest.fn(),
    recharge: jest.fn(),
  };

  const useCase = new RechargeWalletUseCase(walletRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('debe fallar con monto cero o negativo', async () => {
    const result = await useCase.execute('user_1', {
      amount: 0,
      paymentMethod: 'tarjeta',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('INVALID_AMOUNT');
  });

  it('debe fallar con monto no numérico', async () => {
    const result = await useCase.execute('user_1', {
      amount: Number.NaN,
      paymentMethod: 'tarjeta',
    });

    expect(result.isFailure).toBe(true);
    expect(result.error.code).toBe('DOMAIN_ERROR');
  });

  it('debe recargar el monedero y registrar la transacción', async () => {
    walletRepository.recharge.mockResolvedValue({
      wallet: Wallet.create({
        id: 'wallet_1',
        userId: 'user_1',
        balance: 30,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      transaction: Transaction.create({
        id: 'tx_1',
        walletId: 'wallet_1',
        userId: 'user_1',
        amount: 10,
        type: 'recharge',
        status: 'completed',
        description: 'Recarga de saldo vía tarjeta',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });

    const result = await useCase.execute('user_1', {
      amount: 10,
      paymentMethod: 'tarjeta',
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.balance).toBe(30);
    expect(result.value.transactionId).toBe('tx_1');
    expect(walletRepository.recharge).toHaveBeenCalledWith(
      'user_1',
      10,
      'Recarga de saldo vía tarjeta',
    );
  });

  it('debe redondear montos a dos decimales', async () => {
    walletRepository.recharge.mockResolvedValue({
      wallet: Wallet.create({
        id: 'wallet_1',
        userId: 'user_1',
        balance: 10.99,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      transaction: Transaction.create({
        id: 'tx_2',
        walletId: 'wallet_1',
        userId: 'user_1',
        amount: 10.99,
        type: 'recharge',
        status: 'completed',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });

    await useCase.execute('user_1', {
      amount: 10.999,
      paymentMethod: 'tarjeta',
    });

    expect(walletRepository.recharge).toHaveBeenCalledWith(
      'user_1',
      11,
      'Recarga de saldo vía tarjeta',
    );
  });
});
