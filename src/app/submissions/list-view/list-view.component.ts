import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Submission } from '../models/submission.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-list-view',
  templateUrl: './list-view.component.html',
  styleUrls: ['./list-view.component.scss'],
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatCardModule, MatSortModule]
})
export class ListViewComponent implements OnChanges, AfterViewInit {
  @Input() submissions: Submission[] = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  displayedColumns: string[] = ['workflow', 'status', 'from', 'to', 'location', 'dueDate'];
  dataSource = new MatTableDataSource<Submission>([]);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['submissions']) {
      this.dataSource.data = this.submissions;
      // Set paginator after data is set
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
    }
  }

  ngAfterViewInit() {
    // Set paginator after view is initialized
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Incomplete':
        return 'status-incomplete';
      case 'Low Risk':
        return 'status-low-risk';
      case 'Needs Review':
        return 'status-needs-review';
      default:
        return '';
    }
  }
}
