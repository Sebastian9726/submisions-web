import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '../services/submission.service';
import { Submission, SubmissionFilter } from '../models/submission.model';

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
import * as L from 'leaflet';

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
    MapViewComponent
  ]
})
export class SubmissionsComponent implements OnInit {
  // Data
  submissions: Submission[] = [];
  formOptions: string[] = [];
  statusOptions: string[] = [];

  // Filters
  selectedForm = '';
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
      cell: (item: Submission) => item.task
    },
    {
      name: 'status',
      header: 'Status',
      cell: (item: Submission) => this.getStatusBadge(item.status),
      isHtml: true,
      width: '170px'
    },
    {
      name: 'from',
      header: 'From',
      cell: (item: Submission) => item.from
    },
    {
      name: 'to',
      header: 'To',
      cell: (item: Submission) => item.to
    },
    {
      name: 'location',
      header: 'Customer Address',
      cell: (item: Submission) => item.customerAddress
    },
    {
      name: 'dueDate',
      header: 'Due Date',
      cell: (item: Submission) => item.dueDate
    }
  ];
  
  // Map view configuration
  mapConfig: MapMarkerConfig = {
    latLngGetter: (item: Submission) => [item.location.lat, item.location.lng],
    popupContentGetter: (item: Submission) => `
      <div class="popup-content">
        <h3>${item.task}</h3>
        <p><strong>Status:</strong> ${item.status}</p>
        <p><strong>From:</strong> ${item.from}</p>
        <p><strong>To:</strong> ${item.to}</p>
        <p><strong>Address:</strong> ${item.customerAddress}</p>
        <p><strong>Due Date:</strong> ${item.dueDate}</p>
      </div>
    `,
    statusClassGetter: (item: Submission) => {
      switch (item.status) {
        case 'Incomplete': return 'incomplete';
        case 'Low Risk': return 'low-risk';
        case 'Needs Review': return 'needs-review';
        default: return 'default';
      }
    }
  };

  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.loadData();
    this.formOptions = this.submissionService.getFormOptions();
    this.statusOptions = this.submissionService.getStatusOptions();
  }

  onFilterChange(event: FilterEvent): void {
    if (event.formValue !== undefined) {
      this.selectedForm = event.formValue;
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
    
    if (this.selectedForm && this.selectedForm !== 'All Forms') {
      filters.form = this.selectedForm;
    }
    
    if (this.selectedStatus && this.selectedStatus !== 'All Status') {
      filters.status = this.selectedStatus;
    }
    
    if (this.selectedDate) {
      const date = new Date(this.selectedDate);
      filters.date = date.toLocaleDateString();
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
  
  onSelectionChanged(selectedItems: any[]): void {
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
