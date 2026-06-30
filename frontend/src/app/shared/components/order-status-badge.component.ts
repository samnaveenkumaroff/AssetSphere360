import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-status-badge',
  standalone: true,
  imports: [CommonModule],
  template: `<span class="as-status-badge" [class]="'as-status-badge--' + status.toLowerCase()">{{ status }}</span>`,
  styles: [`
    .as-status-badge {
      font-size: 11px; font-weight: 600; padding: 4px 10px; border-radius: 100px;
      text-transform: uppercase; letter-spacing: 0.04em; white-space: nowrap;
    }
    .as-status-badge--draft { background: var(--as-paper-dim); color: var(--as-ink-muted); }
    .as-status-badge--submitted { background: var(--as-adjustment-bg); color: var(--as-adjustment); }
    .as-status-badge--approved { background: var(--as-transfer-bg); color: var(--as-transfer); }
    .as-status-badge--shipped { background: var(--as-transfer-bg); color: var(--as-transfer); }
    .as-status-badge--delivered { background: var(--as-stock-in-bg); color: var(--as-stock-in); }
    .as-status-badge--cancelled { background: var(--as-critical-bg); color: var(--as-critical); }
    .as-status-badge--returned { background: var(--as-return-bg); color: var(--as-return); }
  `]
})
export class OrderStatusBadgeComponent {
  @Input({ required: true }) status: string = 'Draft';
}
