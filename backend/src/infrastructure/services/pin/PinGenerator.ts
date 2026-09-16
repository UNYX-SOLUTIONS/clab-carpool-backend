import { IPinGenerator } from '../../../application/interfaces/IPinGenerator';
import { generateRandomDigits } from '../../../shared/utils/stringUtils';

export class PinGenerator implements IPinGenerator {
  private readonly length: number;

  constructor(length: number = 6) {
    this.length = length;
  }

  generate(): string {
    return generateRandomDigits(this.length);
  }
}
