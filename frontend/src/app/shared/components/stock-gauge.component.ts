import { Component, Input, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-stock-gauge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="as-stock-gauge">
      <span class="as-stock-gauge__track">
        <span
          class="as-stock-gauge__fill"
          [class.as-stock-gauge__fill--healthy]="status() === 'healthy'"
          [class.as-stock-gauge__fill--warn]="status() === 'warn'"
          [class.as-stock-gauge__fill--critical]="status() === 'critical'"
          [style.width.%]="fillPercent()"
        ></span>
      </span>
      <span class="as-mono">{{ currentStock }}</span>
    </span>
  `
})
export class StockGaugeComponent {
  @Input({ required: true }) currentStock = 0;
  @Input({ required: true }) reorderLevel = 0;

  private readonly currentSignal = signal(0);

  status = computed((): 'healthy' | 'warn' | 'critical' => {
    if (this.currentStock <= this.reorderLevel) return 'critical';
    if (this.currentStock <= this.reorderLevel * 1.5) return 'warn';
    return 'healthy';
  });

  fillPercent = computed((): number => {
    const ceiling = Math.max(this.reorderLevel * 3, this.currentStock, 1);
    return Math.min(100, (this.currentStock / ceiling) * 100);
  });
}
