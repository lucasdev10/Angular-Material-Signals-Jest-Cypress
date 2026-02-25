import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';

/**
 * Diretiva para detectar cliques fora do elemento
 * Uso: <div (clickOutside)="onClickOutside()">...</div>
 */
@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {
  @Output() clickOutside = new EventEmitter<void>();
  elementRef = inject(ElementRef);

  @HostListener('document:click', ['$event.target'])
  onClick(target: EventTarget | null): void {
    if (!target) return;

    const clickedInside = this.elementRef.nativeElement.contains(target as Node);
    if (!clickedInside) {
      this.clickOutside.emit();
    }
  }
}
