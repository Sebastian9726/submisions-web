import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material Components
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

export interface FilterConfig {
  showFormSelect?: boolean;
  showStatusSelect?: boolean;
  showDatePicker?: boolean;
  showSearch?: boolean;
  showViewToggle?: boolean;
  showExport?: boolean;
}

export interface FilterEvent {
  formValue?: string;
  statusValue?: string;
  dateValue?: Date | null;
  searchValue?: string;
  currentView?: 'map' | 'list';
}

@Component({
  selector: 'app-filter-container',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule
  ],
  templateUrl: './filter-container.component.html',
  styleUrl: './filter-container.component.scss'
})
export class FilterContainerComponent {
  @Input() title: string = '';
  @Input() config: FilterConfig = {
    showFormSelect: true,
    showStatusSelect: true,
    showDatePicker: true,
    showSearch: true,
    showViewToggle: true,
    showExport: true
  };
  
  @Input() formOptions: string[] = [];
  @Input() statusOptions: string[] = [];
  
  @Input() selectedForm: string = '';
  @Input() selectedStatus: string = '';
  @Input() selectedDate: Date | null = null;
  @Input() searchText: string = '';
  @Input() currentView: 'map' | 'list' = 'map';
  
  @Output() filterChange = new EventEmitter<FilterEvent>();
  @Output() viewChange = new EventEmitter<'map' | 'list'>();
  @Output() exportClick = new EventEmitter<void>();
  
  onFilterChange(): void {
    this.filterChange.emit({
      formValue: this.selectedForm,
      statusValue: this.selectedStatus,
      dateValue: this.selectedDate,
      searchValue: this.searchText
    });
  }
  
  onViewChange(view: 'map' | 'list'): void {
    this.currentView = view;
    this.viewChange.emit(view);
  }
  
  onExportClick(): void {
    this.exportClick.emit();
  }
}
