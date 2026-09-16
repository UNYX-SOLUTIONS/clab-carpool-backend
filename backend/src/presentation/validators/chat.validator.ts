import { z } from 'zod';

export const sendMessageSchema = z.object({
  chatId: z.string().min(1, 'El chat es requerido'),
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(2000),
});

export const chatIdParamSchema = z.object({
  id: z.string().min(1),
});
