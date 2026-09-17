// src/auth/presentation/validators/is-registerable-role.validator.ts
import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { RegisterableRole } from 'src/auth/domain/enums/registerable-role.enum';

@ValidatorConstraint({ name: 'IsRegisterableRole', async: false })
class IsRegisterableRoleConstraint implements ValidatorConstraintInterface {
  validate(role: unknown): boolean {
    return Object.values(RegisterableRole).includes(role as RegisterableRole);
  }
  defaultMessage(): string {
    return 'Role tidak boleh ADMIN dan harus salah satu dari PATIENT, DOCTOR, APOTHECARY.';
  }
}

export function IsRegisterableRole(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsRegisterableRoleConstraint,
    });
  };
}