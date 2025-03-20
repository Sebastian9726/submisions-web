import { Component, Input, ContentChild, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-view-container',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './view-container.component.html',
  styleUrl: './view-container.component.scss'
})
export class ViewContainerComponent {
  @Input() currentView: 'map' | 'list' | string = 'list';
  @Input() viewHeight: string = 'calc(100vh - 300px)';
  @Input() customClass: string = '';
  
  @ContentChild('mapViewTemplate') mapViewTemplate?: TemplateRef<any>;
  @ContentChild('listViewTemplate') listViewTemplate?: TemplateRef<any>;

  get isMapView(): boolean {
    return this.currentView === 'map';
  }

  get isListView(): boolean {
    return this.currentView === 'list';
  }
}
