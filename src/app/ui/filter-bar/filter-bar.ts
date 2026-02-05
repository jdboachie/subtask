import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

@Component({
  selector: 'app-filter-bar',
  templateUrl: './filter-bar.html',
  styleUrl: './filter-bar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FilterBar {
  readonly columns = input<readonly string[]>([]);
  readonly currentFilter = input<string | null>(null);

  readonly filterChange = output<string | null>();

  protected readonly displayValue = computed(() => {
    const filter = this.currentFilter();
    return filter ?? 'All columns';
  });

  protected onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.filterChange.emit(value || null);
  }
}
