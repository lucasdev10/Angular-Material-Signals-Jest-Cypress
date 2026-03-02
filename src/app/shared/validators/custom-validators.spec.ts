import { FormControl, FormGroup } from '@angular/forms';
import { CustomValidators } from './custom-validators';

describe('CustomValidators', () => {
  describe('email', () => {
    it('should validate correct email', () => {
      const control = new FormControl('test@example.com');
      const result = CustomValidators.email()(control);

      expect(result).toBeNull();
    });

    it('should invalidate incorrect email', () => {
      const control = new FormControl('invalid-email');
      const result = CustomValidators.email()(control);

      expect(result).toEqual({ email: { value: 'invalid-email' } });
    });

    it('should allow empty value', () => {
      const control = new FormControl('');
      const result = CustomValidators.email()(control);

      expect(result).toBeNull();
    });

    it('should invalidate email without domain', () => {
      const control = new FormControl('test@');
      const result = CustomValidators.email()(control);

      expect(result).toEqual({ email: { value: 'test@' } });
    });
  });

  describe('strongPassword', () => {
    it('should validate strong password', () => {
      const control = new FormControl('Test@123');
      const result = CustomValidators.strongPassword()(control);

      expect(result).toBeNull();
    });

    it('should invalidate password without uppercase', () => {
      const control = new FormControl('test@123');
      const result = CustomValidators.strongPassword()(control);

      expect(result).toHaveProperty('strongPassword');
      expect(result?.['strongPassword'].hasUpperCase).toBe(false);
    });

    it('should invalidate password without lowercase', () => {
      const control = new FormControl('TEST@123');
      const result = CustomValidators.strongPassword()(control);

      expect(result?.['strongPassword'].hasLowerCase).toBe(false);
    });

    it('should invalidate password without number', () => {
      const control = new FormControl('Test@abc');
      const result = CustomValidators.strongPassword()(control);

      expect(result?.['strongPassword'].hasNumeric).toBe(false);
    });

    it('should invalidate password without special character', () => {
      const control = new FormControl('Test1234');
      const result = CustomValidators.strongPassword()(control);

      expect(result?.['strongPassword'].hasSpecialChar).toBe(false);
    });

    it('should invalidate short password', () => {
      const control = new FormControl('Te@1');
      const result = CustomValidators.strongPassword()(control);

      expect(result?.['strongPassword'].isLengthValid).toBe(false);
    });
  });

  describe('matchFields', () => {
    it('should validate matching fields', () => {
      const form = new FormGroup({
        password: new FormControl('Test@123'),
        confirmPassword: new FormControl('Test@123'),
      });

      const result = CustomValidators.matchFields('password', 'confirmPassword')(form);

      expect(result).toBeNull();
    });

    it('should invalidate non-matching fields', () => {
      const form = new FormGroup({
        password: new FormControl('Test@123'),
        confirmPassword: new FormControl('Different@123'),
      });

      const result = CustomValidators.matchFields('password', 'confirmPassword')(form);

      expect(result).toEqual({
        matchFields: { field1: 'password', field2: 'confirmPassword' },
      });
    });

    it('should allow empty fields', () => {
      const form = new FormGroup({
        password: new FormControl(''),
        confirmPassword: new FormControl(''),
      });

      const result = CustomValidators.matchFields('password', 'confirmPassword')(form);

      expect(result).toBeNull();
    });
  });

  describe('url', () => {
    it('should validate correct URL', () => {
      const control = new FormControl('https://example.com');
      const result = CustomValidators.url()(control);

      expect(result).toBeNull();
    });

    it('should validate URL with path', () => {
      const control = new FormControl('https://example.com/path/to/page');
      const result = CustomValidators.url()(control);

      expect(result).toBeNull();
    });

    it('should invalidate incorrect URL', () => {
      const control = new FormControl('not-a-url');
      const result = CustomValidators.url()(control);

      expect(result).toEqual({ url: { value: 'not-a-url' } });
    });
  });

  describe('phone', () => {
    it('should validate Brazilian phone format', () => {
      const validPhones = ['(11) 98765-4321', '11987654321', '11 98765-4321'];

      validPhones.forEach((phone) => {
        const control = new FormControl(phone);
        const result = CustomValidators.phone()(control);
        expect(result).toBeNull();
      });
    });

    it('should invalidate incorrect phone format', () => {
      const control = new FormControl('123');
      const result = CustomValidators.phone()(control);

      expect(result).toEqual({ phone: { value: '123' } });
    });
  });

  describe('cpf', () => {
    it('should validate correct CPF', () => {
      const control = new FormControl('123.456.789-09');
      const result = CustomValidators.cpf()(control);

      expect(result).toBeNull();
    });

    it('should invalidate CPF with all same digits', () => {
      const control = new FormControl('111.111.111-11');
      const result = CustomValidators.cpf()(control);

      expect(result).toEqual({ cpf: { value: '111.111.111-11' } });
    });

    it('should invalidate incorrect CPF', () => {
      const control = new FormControl('123.456.789-00');
      const result = CustomValidators.cpf()(control);

      expect(result).toEqual({ cpf: { value: '123.456.789-00' } });
    });
  });

  describe('minValue', () => {
    it('should validate value above minimum', () => {
      const control = new FormControl(10);
      const result = CustomValidators.minValue(5)(control);

      expect(result).toBeNull();
    });

    it('should invalidate value below minimum', () => {
      const control = new FormControl(3);
      const result = CustomValidators.minValue(5)(control);

      expect(result).toEqual({ minValue: { min: 5, actual: 3 } });
    });

    it('should allow empty value', () => {
      const control = new FormControl('');
      const result = CustomValidators.minValue(5)(control);

      expect(result).toBeNull();
    });
  });

  describe('maxValue', () => {
    it('should validate value below maximum', () => {
      const control = new FormControl(5);
      const result = CustomValidators.maxValue(10)(control);

      expect(result).toBeNull();
    });

    it('should invalidate value above maximum', () => {
      const control = new FormControl(15);
      const result = CustomValidators.maxValue(10)(control);

      expect(result).toEqual({ maxValue: { max: 10, actual: 15 } });
    });
  });
});
