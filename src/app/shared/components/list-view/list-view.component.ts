import { Component, Input, OnChanges, SimpleChanges, ViewChild, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataItem } from '../../models/data-item.model';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
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
  imports: [CommonModule, MatTableModule, MatPaginatorModule, MatSortModule, MatCheckboxModule, FormsModule],
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
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  
  displayedColumns: string[] = [];
  dataSource = new MatTableDataSource<DataItem>([]);
  selection = new SelectionModel<DataItem>(true, []);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['columns'] || changes['showCheckboxes']) {
      this.updateDisplayedColumns();
    }
    
    if (changes['items']) {
      this.dataSource.data = this.items;
      // Reset selection
      this.selection.clear();
      
      // Set paginator after data is set
      if (this.paginator) {
        this.dataSource.paginator = this.paginator;
      }
      
      if (this.enableSorting && this.sort) {
        this.dataSource.sort = this.sort;
      }
    }
  }

  ngAfterViewInit() {
    // Set paginator after view is initialized
    if (this.paginator) {
      this.dataSource.paginator = this.paginator;
    }
    
    if (this.enableSorting && this.sort) {
      this.dataSource.sort = this.sort;
    }
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
  
  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
        this.selection.clear() :
        this.dataSource.data.forEach(row => this.selection.select(row));
        
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
