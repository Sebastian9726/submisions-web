import { Directive, ElementRef, EventEmitter, HostListener, Input, Output, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appRowHover]',
  standalone: true
})
export class RowHoverDirective {
  @Input() hoverClass: string = 'row-hovered';
  @Output() rowHoverStart = new EventEmitter<void>();
  @Output() rowHoverEnd = new EventEmitter<void>();

  constructor(
    private el: ElementRef,
    private renderer: Renderer2
  ) {}

  @HostListener('mouseenter')
  onMouseEnter() {
    this.renderer.addClass(this.el.nativeElement, this.hoverClass);
    this.rowHoverStart.emit();
  }

  @HostListener('mouseleave')
  onMouseLeave() {
    this.renderer.removeClass(this.el.nativeElement, this.hoverClass);
    this.rowHoverEnd.emit();
  }
} 