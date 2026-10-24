import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-ad-slot',
  standalone: true,
  template: `
    @if (enabled) {
      <aside class="ad-slot" aria-label="Advertisement">
        <span>Advertisement</span>
        <ng-content />
      </aside>
    }
  `,
  styles: [`
    .ad-slot {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 90px;
      margin: 24px auto;
      padding: 12px;
      border: 1px dashed #cbd5e1;
      border-radius: 8px;
      color: #94a3b8;
      font-size: 12px;
    }
  `],
})
export class AdSlotComponent {
  @Input() enabled = false;
}