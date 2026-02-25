import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FieldTree, FormField } from '@angular/forms/signals';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormError } from '@app/shared/components/form-error/form-error';

@Component({
  selector: 'app-product-form',
  imports: [MatFormFieldModule, MatInputModule, MatButtonModule, FormError, FormField],
  templateUrl: './product-form.html',
  styleUrl: './product-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ProductForm {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @Input() productForm: FieldTree<unknown, string | number> | any = null;
  @Output() save = new EventEmitter<FieldTree<unknown, string | number>>();

  submitForm() {
    if (this.productForm().valid()) {
      this.save.emit(this.productForm);
    }
  }
}
