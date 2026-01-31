import { Directive, EventEmitter, Output, HostListener } from '@angular/core';

export type SwipeDirection = 'left' | 'right';

@Directive({
  selector: '[appTabSwipe]',
})
export class TabSwipeDirective {
  @Output() swipe = new EventEmitter<SwipeDirection>();

  private touchStartX = 0;
  private readonly SWIPE_THRESHOLD = 50;
  private isTouchActive = false;

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    // Проверяем, что касается только один палец
    if (event.touches.length !== 1) {
      this.resetTouchState();
      return;
    }

    this.touchStartX = event.touches[0].clientX;
    this.isTouchActive = true;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (!this.isTouchActive) {
      return;
    }

    // Проверяем, что событие содержит данные о касаниях
    if (!event.changedTouches || event.changedTouches.length === 0) {
      this.resetTouchState();
      return;
    }

    // Используем первый завершенный touch
    const touchEndX = event.changedTouches[0].clientX;
    this.detectSwipe(touchEndX);
    this.resetTouchState();
  }

  @HostListener('touchcancel')
  onTouchCancel(): void {
    // Сбрасываем состояние при отмене жеста (например, системное прерывание)
    this.resetTouchState();
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (!this.isTouchActive) {
      return;
    }

    // Разрешаем только горизонтальный свайп
    event.preventDefault();
  }

  private detectSwipe(touchEndX: number): void {
    const diff = this.touchStartX - touchEndX;
    const absDiff = Math.abs(diff);

    if (absDiff > this.SWIPE_THRESHOLD) {
      this.swipe.emit(diff > 0 ? 'left' : 'right');
    }
  }

  private resetTouchState(): void {
    this.isTouchActive = false;
    this.touchStartX = 0;
  }
}
