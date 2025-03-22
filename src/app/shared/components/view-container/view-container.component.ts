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
  @Input() viewHeight = '';
  @Input() customClass = '';
  
  @ContentChild('mapViewTemplate') mapViewTemplate?: TemplateRef<unknown>;
  @ContentChild('listViewTemplate') listViewTemplate?: TemplateRef<unknown>;

  get isMapView(): boolean {
    return this.currentView === 'map';
  }

  get isListView(): boolean {
    return this.currentView === 'list';
  }
}
