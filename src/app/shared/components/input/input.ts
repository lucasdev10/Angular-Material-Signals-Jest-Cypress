import { FocusMonitor } from '@angular/cdk/a11y';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  forwardRef,
  HostBinding,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

/**
 * Tipos para configuração do input
 */
export type InputType = 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
export type InputSize = 'sm' | 'md' | 'lg';
export type InputVariant = 'outlined' | 'filled' | 'standard';

/**
 * Interface para ícones do input
 */
export interface InputIcon {
  name: string;
  position: 'left' | 'right';
  clickable?: boolean;
  onClick?: () => void;
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './input.html',
  styleUrl: './input.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  host: {
    class: 'app-input',
  },
})
export class InputComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  // Dependency Injection
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly elementRef = inject(ElementRef);
  private readonly focusMonitor = inject(FocusMonitor);

  // ViewChild para acesso ao input
  @ViewChild('inputElement', { static: true }) inputElement!: ElementRef<HTMLInputElement>;

  // Destroy subject
  private readonly destroy$ = new Subject<void>();

  /**
   * Inputs - Configuração do componente
   */
  @Input() label?: string;
  @Input() placeholder?: string;
  @Input() helperText?: string;
  @Input() type: InputType = 'text';
  @Input() size: InputSize = 'md';
  @Input() variant: InputVariant = 'outlined';
  @Input() disabled = false;
  @Input() readonly = false;
  @Input() required = false;
  @Input() clearable = false;
  @Input() showCounter = false;
  @Input() leftIcon?: InputIcon;
  @Input() rightIcon?: InputIcon;
  @Input() autocomplete?: string;
  @Input() pattern?: string;
  @Input() min?: number | string;
  @Input() max?: number | string;
  @Input() minLength?: number;
  @Input() maxLength?: number;
  @Input() customValidators?: ((control: AbstractControl) => ValidationErrors | null)[];

  /**
   * Outputs - Eventos do componente
   */
  @Output() valueChange = new EventEmitter<string>();
  @Output() focusedEvent = new EventEmitter<FocusEvent>();
  @Output() blurred = new EventEmitter<FocusEvent>();
  @Output() keyDown = new EventEmitter<KeyboardEvent>();
  @Output() keyUp = new EventEmitter<KeyboardEvent>();
  @Output() iconClick = new EventEmitter<InputIcon>();

  /**
   * Estado interno
   */
  value = '';
  focused = false;
  showPassword = false;
  currentType: InputType = 'text';
  errorMessages: string[] = [];

  // IDs únicos para acessibilidade
  inputId = `input-${Math.random().toString(36).substr(2, 9)}`;
  helperId = `${this.inputId}-helper`;
  errorId = `${this.inputId}-error`;

  /**
   * ControlValueAccessor callbacks
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private onChange = (value: string) => {
    /* empty */
  };
  private onTouched = () => {
    /* empty */
  };

  /**
   * Host Bindings
   */
  @HostBinding('class') get cssClasses(): string {
    return [
      `input-${this.size}`,
      `input-${this.variant}`,
      this.disabled ? 'input-disabled' : '',
      this.hasError ? 'input-error' : '',
      this.focused ? 'input-focused' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }

  /**
   * Getters
   */
  get hasError(): boolean {
    return this.errorMessages.length > 0;
  }

  /**
   * Lifecycle Hooks
   */
  ngOnInit(): void {
    this.currentType = this.type;

    // Monitor focus para acessibilidade
    this.focusMonitor
      .monitor(this.inputElement.nativeElement)
      .pipe(takeUntil(this.destroy$))
      .subscribe((origin) => {
        this.focused = !!origin;
        this.cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.focusMonitor.stopMonitoring(this.inputElement.nativeElement);
  }

  /**
   * ControlValueAccessor Implementation
   */
  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  /**
   * Validator Implementation
   */
  validate(control: AbstractControl): ValidationErrors | null {
    const errors: ValidationErrors = {};

    // Validações built-in
    if (this.required && !control.value) {
      errors['required'] = { message: 'Este campo é obrigatório' };
    }

    if (this.minLength && control.value && control.value.length < this.minLength) {
      errors['minlength'] = {
        message: `Mínimo de ${this.minLength} caracteres`,
        actualLength: control.value.length,
        requiredLength: this.minLength,
      };
    }

    if (this.maxLength && control.value && control.value.length > this.maxLength) {
      errors['maxlength'] = {
        message: `Máximo de ${this.maxLength} caracteres`,
        actualLength: control.value.length,
        requiredLength: this.maxLength,
      };
    }

    if (this.pattern && control.value && !new RegExp(this.pattern).test(control.value)) {
      errors['pattern'] = { message: 'Formato inválido' };
    }

    // Email validation
    if (this.type === 'email' && control.value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(control.value)) {
        errors['email'] = { message: 'Email inválido' };
      }
    }

    // Custom validators
    if (this.customValidators) {
      this.customValidators.forEach((validator) => {
        const result = validator(control);
        if (result) {
          Object.assign(errors, result);
        }
      });
    }

    // Atualiza mensagens de erro
    this.updateErrorMessages(errors);

    return Object.keys(errors).length > 0 ? errors : null;
  }

  /**
   * Event Handlers
   */
  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.value = target.value;
    this.onChange(this.value);
    this.valueChange.emit(this.value);
  }

  onFocus(event: FocusEvent): void {
    this.focused = true;
    this.focusedEvent.emit(event);
  }

  onBlur(event: FocusEvent): void {
    this.focused = false;
    this.onTouched();
    this.blurred.emit(event);
  }

  onKeyDown(event: KeyboardEvent): void {
    this.keyDown.emit(event);

    // Clear com Escape
    if (event.key === 'Escape' && this.clearable) {
      this.clearValue();
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    this.keyUp.emit(event);
  }

  onIconClick(icon: InputIcon): void {
    if (icon.clickable && icon.onClick) {
      icon.onClick();
    }
    this.iconClick.emit(icon);
  }

  /**
   * Public Methods
   */
  focus(): void {
    this.inputElement.nativeElement.focus();
  }

  blur(): void {
    this.inputElement.nativeElement.blur();
  }

  select(): void {
    this.inputElement.nativeElement.select();
  }

  clearValue(): void {
    this.value = '';
    this.onChange(this.value);
    this.valueChange.emit(this.value);
    this.focus();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
    this.currentType = this.showPassword ? 'text' : 'password';
    this.cdr.markForCheck();
  }

  /**
   * Private Methods
   */
  private updateErrorMessages(errors: ValidationErrors): void {
    this.errorMessages = Object.values(errors)
      .map((error: { message: string }) => error.message)
      .filter(Boolean);
    this.cdr.markForCheck();
  }

  /**
   * Public method to get aria-describedby value
   */
  getAriaDescribedByValue(): string {
    const ids: string[] = [];

    if (this.helperText && !this.hasError) {
      ids.push(this.helperId);
    }

    if (this.hasError) {
      ids.push(this.errorId);
    }

    return ids.join(' ') || '';
  }

  private getAriaDescribedBy(): string {
    return this.getAriaDescribedByValue();
  }
}

/**
 * Validators customizados para o Input Component
 */
export class InputValidators {
  /**
   * Validator para CPF
   */
  static cpf(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.replace(/\D/g, '');

    if (!value) return null;

    if (value.length !== 11) {
      return { cpf: { message: 'CPF deve ter 11 dígitos' } };
    }

    // Validação do algoritmo do CPF
    if (!isValidCPF(value)) {
      return { cpf: { message: 'CPF inválido' } };
    }

    return null;
  }

  /**
   * Validator para CNPJ
   */
  static cnpj(control: AbstractControl): ValidationErrors | null {
    const value = control.value?.replace(/\D/g, '');

    if (!value) return null;

    if (value.length !== 14) {
      return { cnpj: { message: 'CNPJ deve ter 14 dígitos' } };
    }

    // Validação do algoritmo do CNPJ
    if (!isValidCNPJ(value)) {
      return { cnpj: { message: 'CNPJ inválido' } };
    }

    return null;
  }

  /**
   * Validator para senha forte
   */
  static strongPassword(control: AbstractControl): ValidationErrors | null {
    const value = control.value;

    if (!value) return null;

    const errors: string[] = [];

    if (value.length < 8) {
      errors.push('Mínimo 8 caracteres');
    }

    if (!/[A-Z]/.test(value)) {
      errors.push('Uma letra maiúscula');
    }

    if (!/[a-z]/.test(value)) {
      errors.push('Uma letra minúscula');
    }

    if (!/\d/.test(value)) {
      errors.push('Um número');
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
      errors.push('Um caractere especial');
    }

    if (errors.length > 0) {
      return {
        strongPassword: {
          message: `Senha deve conter: ${errors.join(', ')}`,
        },
      };
    }

    return null;
  }
}

// Utility functions
function isValidCPF(cpf: string): boolean {
  // Implementação da validação de CPF
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }

  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;

  return remainder === parseInt(cpf.charAt(10));
}

function isValidCNPJ(cnpj: string): boolean {
  // Implementação da validação de CNPJ
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }

  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }

  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  return digit2 === parseInt(cnpj.charAt(13));
}
