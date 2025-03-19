import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SubmissionService } from '../services/submission.service';
import { Submission, SubmissionFilter } from '../models/submission.model';
import { MapViewComponent } from '../map-view/map-view.component';
import { ListViewComponent } from '../list-view/list-view.component';

// Angular Material Components
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-submissions',
  templateUrl: './submissions.component.html',
  styleUrls: ['./submissions.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MapViewComponent,
    ListViewComponent,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonToggleModule,
    MatButtonModule,
    MatIconModule
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

  // View state
  currentView: 'map' | 'list' = 'map';

  constructor(private submissionService: SubmissionService) {}

  ngOnInit(): void {
    this.loadData();
    this.formOptions = this.submissionService.getFormOptions();
    this.statusOptions = this.submissionService.getStatusOptions();
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
    
    this.submissionService.getSubmissions(filters).subscribe(data => {
      this.submissions = data;
    });
  }

  exportSubmissions(): void {
    this.submissionService.exportSubmissions();
  }
}
