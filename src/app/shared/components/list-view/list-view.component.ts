import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataItem } from '../../models/data-item.model';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { SelectionModel } from '@angular/cdk/collections';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { FormsModule } from '@angular/forms';

export interface ColumnConfig {
  name: string;
  header: string;
  cell: (item: any) => string;
  cellClass?: (value: any) => string;
  width?: string;
  isHtml?: boolean;
}

@Component({
  selector: 'app-list-view',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatSortModule, MatCheckboxModule, FormsModule],
  templateUrl: './list-view.component.html',
  styleUrl: './list-view.component.scss'
})
export class ListViewComponent implements OnChanges, AfterViewInit {
  @Input() items: DataItem[] = [];
  @Input() columns: ColumnConfig[] = [];
  @Input() pageSize: number = 10;
  @Input() pageSizeOptions: number[] = [5, 10, 20, 50];
  @Input() showPaginator: boolean = true;
  @Input() enableSorting: boolean = false;
  @Input() showCheckboxes: boolean = true;
  
  @Output() selectionChanged = new EventEmitter<DataItem[]>();
  @Output() pageChanged = new EventEmitter<number>();
  
  @ViewChild(MatSort) sort!: MatSort;
  
  // Custom paginator properties
  pageIndex: number = 0;
  totalItems: number = 0;
  totalPages: number = 0;
  
  // Expose Math to the template
  Math = Math;
  
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<DataItem>([]);
  selection = new SelectionModel<DataItem>(true, []);
  
  // Store the original complete dataset
  private _originalData: DataItem[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['showCheckboxes']) {
      this.updateDisplayedColumns();
    }
    
    if (changes['items']) {
      // Store the full dataset in a private property
      this._originalData = [...this.items];
      
      // Reset selection
      this.selection.clear();
      
      // Reset pagination state
      this.pageIndex = 0;
      this.totalItems = this._originalData.length;
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      
      // Update page display
      this.updatePage();
    }
    
    if (changes['pageSize']) {
      this.totalPages = Math.ceil(this.totalItems / this.pageSize);
      this.updatePage();
    }
  }

  ngAfterViewInit() {
    if (this.enableSorting && this.sort) {
      this.dataSource.sort = this.sort;
      
      // Connect sort to update pagination
      this.sort.sortChange.subscribe(() => {
        this.pageIndex = 0;
        this.updatePage();
      });
    }
    
    this.updatePage();
  }

  updateDisplayedColumns(): void {
    this.displayedColumns = this.showCheckboxes ? ['select', ...this.columns.map(col => col.name)] : this.columns.map(col => col.name);
  }

  getCellValue(item: any, column: ColumnConfig): string {
    return column.cell(item);
  }

  getCellClass(item: any, column: ColumnConfig): string {
    return column.cellClass ? column.cellClass(item) : '';
  }
  
  // Custom paginator methods
  getStartIndex(): number {
    return this.totalItems === 0 ? 0 : (this.pageIndex * this.pageSize) + 1;
  }
  
  getEndIndex(): number {
    return Math.min((this.pageIndex + 1) * this.pageSize, this.totalItems);
  }
  
  getPageNumbers(): (number | string)[] {
    const pages: (number | string)[] = [];
    const totalPages = this.totalPages;
    
    if (totalPages <= 7) {
      // Show all pages if there are 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Current page is near the start
      if (this.pageIndex < 3) {
        pages.push(2, 3, 4, 5, '...', totalPages);
      } 
      // Current page is near the end
      else if (this.pageIndex > totalPages - 5) {
        pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } 
      // Current page is in the middle
      else {
        const current = this.pageIndex + 1;
        pages.push(
          '...', 
          current - 1, 
          current, 
          current + 1, 
          '...', 
          totalPages
        );
      }
    }
    
    return pages;
  }
  
  goToPage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.pageIndex = page;
      this.updatePage();
      this.pageChanged.emit(this.pageIndex);
    }
  }
  
  nextPage(): void {
    if (this.pageIndex < this.totalPages - 1) {
      this.pageIndex++;
      this.updatePage();
      this.pageChanged.emit(this.pageIndex);
    }
  }
  
  previousPage(): void {
    if (this.pageIndex > 0) {
      this.pageIndex--;
      this.updatePage();
      this.pageChanged.emit(this.pageIndex);
    }
  }
  
  updatePage(): void {
    // Calculate pagination info
    this.totalItems = this._originalData.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    
    // Ensure we don't go beyond available pages
    if (this.pageIndex >= this.totalPages && this.totalPages > 0) {
      this.pageIndex = this.totalPages - 1;
    }
    
    // Determine start and end indices for current page
    const startIndex = this.pageIndex * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, this.totalItems);
    
    // Get the current page data and set it to the data source
    if (this.totalItems > 0) {
      // Create a slice of the data for the current page
      const pageData = this._originalData.slice(startIndex, endIndex);
      this.dataSource.data = pageData;
      
      console.log(`Showing page ${this.pageIndex + 1} of ${this.totalPages}, items ${startIndex + 1}-${endIndex} of ${this.totalItems}`);
    } else {
      this.dataSource.data = [];
    }
  }
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows && numRows > 0;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
    }
    
    this.selectionChanged.emit(this.selection.selected);
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: DataItem): string {
    if (!row) {
      return `${this.isAllSelected() ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.id}`;
  }
  
  /** Handle row selection change */
  onSelectionChange() {
    this.selectionChanged.emit(this.selection.selected);
  }
}
