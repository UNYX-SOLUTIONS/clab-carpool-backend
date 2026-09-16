import { Email } from '../../../src/domain/value-objects/Email';
import { PhoneNumber } from '../../../src/domain/value-objects/PhoneNumber';
import { PlateNumber } from '../../../src/domain/value-objects/PlateNumber';
import { Money } from '../../../src/domain/value-objects/Money';
import { Coordinates } from '../../../src/domain/value-objects/Coordinates';

describe('Email value object', () => {
  it('debe normalizar el correo a minúsculas', () => {
    const result = Email.create('  Estudiante@ESPOL.edu.ec  ');

    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('estudiante@espol.edu.ec');
    expect(result.value.domain).toBe('espol.edu.ec');
  });

  it('debe fallar con formato inválido', () => {
    const result = Email.create('no-es-un-correo');

    expect(result.isFailure).toBe(true);
  });
});

describe('PhoneNumber value object', () => {
  it('debe aceptar números válidos', () => {
    const result = PhoneNumber.create('+593987654321');

    expect(result.isSuccess).toBe(true);
  });

  it('debe fallar con números cortos', () => {
    const result = PhoneNumber.create('123');

    expect(result.isFailure).toBe(true);
  });
});

describe('PlateNumber value object', () => {
  it('debe normalizar la placa a mayúsculas', () => {
    const result = PlateNumber.create('gba-1234');

    expect(result.isSuccess).toBe(true);
    expect(result.value.value).toBe('GBA-1234');
  });

  it('debe fallar con formato inválido', () => {
    const result = PlateNumber.create('XYZ');

    expect(result.isFailure).toBe(true);
  });
});

describe('Money value object', () => {
  it('debe redondear a dos decimales', () => {
    const result = Money.create(1.999);

    expect(result.isSuccess).toBe(true);
    expect(result.value.amount).toBe(2);
  });

  it('debe sumar montos de la misma moneda', () => {
    const a = Money.create(1.5).value;
    const b = Money.create(2.25).value;

    const result = a.add(b);

    expect(result.isSuccess).toBe(true);
    expect(result.value.amount).toBe(3.75);
  });

  it('debe fallar con montos no finitos', () => {
    const result = Money.create(Number.POSITIVE_INFINITY);

    expect(result.isFailure).toBe(true);
  });
});

describe('Coordinates value object', () => {
  it('debe aceptar coordenadas válidas', () => {
    const result = Coordinates.create(-2.1479, -79.9669);

    expect(result.isSuccess).toBe(true);
    expect(result.value.toArray()).toEqual([-2.1479, -79.9669]);
  });

  it('debe fallar con latitud fuera de rango', () => {
    const result = Coordinates.create(95, 0);

    expect(result.isFailure).toBe(true);
  });
});
