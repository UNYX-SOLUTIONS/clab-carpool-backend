import { Request, Response } from 'express';

import { GetChatsUseCase } from '../../../application/use-cases/chat/GetChatsUseCase';
import { GetChatMessagesUseCase } from '../../../application/use-cases/chat/GetChatMessagesUseCase';
import { SendMessageUseCase } from '../../../application/use-cases/chat/SendMessageUseCase';
import { GetActiveChatUseCase } from '../../../application/use-cases/chat/GetActiveChatUseCase';
import { RequestPinUseCase } from '../../../application/use-cases/chat/RequestPinUseCase';
import { SendMessageDTO } from '../../../application/dtos/chat/SendMessageDTO';
import { successResponse, errorResponse } from '../../../shared/utils/responseHandler';
import { HttpStatus } from '../../../shared/constants/statusCodes';

export class ChatController {
  constructor(
    private readonly getChatsUseCase: GetChatsUseCase,
    private readonly getChatMessagesUseCase: GetChatMessagesUseCase,
    private readonly sendMessageUseCase: SendMessageUseCase,
    private readonly getActiveChatUseCase: GetActiveChatUseCase,
    private readonly requestPinUseCase: RequestPinUseCase,
  ) {}

  async list(req: Request, res: Response): Promise<void> {
    const result = await this.getChatsUseCase.execute(req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Chats obtenidos correctamente', result.value);
  }

  async messages(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.getChatMessagesUseCase.execute(id, req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Mensajes obtenidos correctamente', result.value);
  }

  async sendMessage(req: Request, res: Response): Promise<void> {
    const result = await this.sendMessageUseCase.execute(
      req.user!.id,
      req.body as SendMessageDTO,
    );

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(
      res,
      HttpStatus.CREATED,
      'Mensaje enviado correctamente',
      result.value,
    );
  }

  async activeChat(req: Request, res: Response): Promise<void> {
    const { travelId } = req.query as { travelId: string };

    if (!travelId) {
      errorResponse(
        res,
        HttpStatus.BAD_REQUEST,
        'El parámetro travelId es requerido',
        'VALIDATION_ERROR',
      );
      return;
    }

    const result = await this.getActiveChatUseCase.execute(travelId, req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(res, HttpStatus.OK, 'Chat activo obtenido correctamente', result.value);
  }

  async requestPin(req: Request, res: Response): Promise<void> {
    const { id } = req.params as { id: string };

    const result = await this.requestPinUseCase.execute(id, req.user!.id);

    if (result.isFailure) {
      errorResponse(res, result.error.statusCode, result.error.message, result.error.code);
      return;
    }

    successResponse(
      res,
      HttpStatus.CREATED,
      'PIN de validación generado correctamente',
      {
        pinId: result.value.id,
        pin: result.value.pin,
        expiresAt: result.value.expiresAt,
      },
    );
  }
}
