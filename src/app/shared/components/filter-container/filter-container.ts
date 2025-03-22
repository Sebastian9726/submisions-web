onViewChange(view: 'map' | 'list'): void {
  this.currentView = view;
  this.viewChange.emit(view);
}

onExportClick(): void {
  this.exportClick.emit();
}

clearDateFilter(): void {
  this.selectedDate = null;
  this.onFilterChange();
} 