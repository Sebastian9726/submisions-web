import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '../services/submission.service';
import { Submission, SubmissionFilter } from '../models/submission.model';
import { DataItem } from '../../shared/models/data-item.model';

// Angular Material Components
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Shared Components
import { FilterContainerComponent, FilterEvent } from '../../shared/components/filter-container/filter-container.component';
import { ViewContainerComponent } from '../../shared/components/view-container/view-container.component';
import { ListViewComponent, ColumnConfig } from '../../shared/components/list-view/list-view.component';
import { MapViewComponent, MapMarkerConfig } from '../../shared/components/map-view/map-view.component';
import { CustomDatePipe } from '../../shared/pipes/custom-date.pipe';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule,
    FilterContainerComponent,
    ViewContainerComponent,
    ListViewComponent,
    MapViewComponent,
    CustomDatePipe
  ]
})
export class SubmissionsComponent implements OnInit {
  // Data
  submissions: Submission[] = [];
  fromOptions: string[] = [];
  statusOptions: string[] = [];
  customDatePipe = new CustomDatePipe();

  // Filters
  selectedFrom = '';
  selectedStatus = '';
  selectedDate: Date | null = null;
  searchText = '';

  // View state
  currentView: 'map' | 'list' = 'map';
  
  // List view configuration
  listColumns: ColumnConfig[] = [
    {
      name: 'workflow',
      header: 'Task',
      cell: (item: DataItem) => (item as Submission).task
    },
    {
      name: 'status',
      header: 'Status',
      cell: (item: DataItem) => this.getStatusBadge((item as Submission).status),
      isHtml: true,
      width: '170px'
    },
    {
      name: 'from',
      header: 'From',
      cell: (item: DataItem) => (item as Submission).from
    },
    {
      name: 'to',
      header: 'To',
      cell: (item: DataItem) => (item as Submission).to
    },
    {
      name: 'location',
      header: 'Customer Address',
      cell: (item: DataItem) => (item as Submission).customerAddress
    },
    {
      name: 'dueDate',
      header: 'Due Date',
      cell: (item: DataItem) => {
        // Convertimos la fecha de string a objeto Date para aplicar el pipe
        console.log('Fecha original en dueDate:', (item as Submission).dueDate);
        // Usar directamente el string ISO para evitar problemas de zona horaria
        return this.customDatePipe.transform((item as Submission).dueDate);
      }
    }
  ];
  
  // Map view configuration
  mapConfig: MapMarkerConfig = {
    latLngGetter: (item: DataItem) => [(item as Submission).location.lat, (item as Submission).location.lng],
    popupContentGetter: (item: DataItem) => {
      const submission = item as Submission;
      // Pasar directamente el string ISO
      const formattedDate = this.customDatePipe.transform(submission.dueDate);
      return `
        <div class="popup-content">
          <h3>${submission.task}</h3>
          <p><strong>Status:</strong> ${submission.status}</p>
          <p><strong>From:</strong> ${submission.from}</p>
          <p><strong>To:</strong> ${submission.to}</p>
          <p><strong>Address:</strong> ${submission.customerAddress}</p>
          <p><strong>Due Date:</strong> ${formattedDate}</p>
        </div>
      `;
    },
    statusClassGetter: (item: DataItem) => {
      const submission = item as Submission;
      const status = submission.status.toLowerCase();
      if (status.includes('incomplete')) return 'status-incomplete';
      if (status.includes('low')) return 'status-low-risk';
      if (status.includes('needs') || status.includes('review')) return 'status-needs-review';
      if (status.includes('complete')) return 'status-complete';
      if (status.includes('unassigned')) return 'status-unassigned';
      return 'status-default';
    }
  };

  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.loadData();
    this.fromOptions = this.submissionService.getFromOptions();
    this.statusOptions = this.submissionService.getStatusOptions();
  }

  onFilterChange(event: FilterEvent): void {
    if (event.formValue !== undefined) {
      this.selectedFrom = event.formValue;
    }
    
    if (event.statusValue !== undefined) {
      this.selectedStatus = event.statusValue;
    }
    
    if (event.dateValue !== undefined) {
      this.selectedDate = event.dateValue;
    }
    
    if (event.searchValue !== undefined) {
      this.searchText = event.searchValue;
    }
    
    this.loadData();
  }
  
  onViewChange(view: 'map' | 'list'): void {
    this.currentView = view;
    this.loadData();
  }

  loadData(): void {
    const filters: SubmissionFilter = {};
    
    if (this.selectedFrom && this.selectedFrom !== 'All Emails') {
      filters.from = this.selectedFrom;
    }
    
    if (this.selectedStatus && this.selectedStatus !== 'All Status') {
      filters.status = this.selectedStatus;
    }
    
    if (this.selectedDate) {
      filters.date = this.selectedDate;
    }
    
    if (this.searchText) {
      filters.search = this.searchText;
    }
    
    this.submissionService.getSubmissions(filters).subscribe(data => {
      this.submissions = data;
    });
  }

  exportSubmissions(): void {
    this.submissionService.exportSubmissions();
  }
  
  onSelectionChanged(selectedItems: DataItem[]): void {
    console.log('Selected items:', selectedItems);
    // Here you can handle the selected items, for example:
    // - Enable bulk actions
    // - Update a status bar
    // - Store the selection for further processing
  }
  
  private getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'incomplete':
        return 'status-incomplete';
      case 'low risk':
        return 'status-low-risk';
      case 'needs review':
        return 'status-needs-review';
      case 'complete':
        return 'status-complete';
      case 'unassigned':
        return 'status-unassigned';
      default:
        return 'status-default';
    }
  }
  
  private getStatusBadge(status: string): string {
    const statusClass = this.getStatusClass(status);
    // Keep the original status format instead of converting to PascalCase
    return `<div class="status-badge ${statusClass}">
              <span class="status-icon"></span>
              ${status}
            </div>`;
  }
}
