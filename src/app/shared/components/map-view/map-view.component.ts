import { Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataItem, LocationData } from '../../models/data-item.model';
import * as L from 'leaflet';
import 'leaflet.markercluster';

export interface MapMarkerConfig {
  latLngGetter: (item: any) => [number, number];
  popupContentGetter: (item: any) => string;
  iconGetter?: (item: any) => L.DivIcon;
  statusClassGetter?: (item: any) => string;
}

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.component.html',
  styleUrl: './map-view.component.scss'
})
export class MapViewComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() items: DataItem[] = [];
  @Input() config: MapMarkerConfig = {
    latLngGetter: (item: any) => {
      if (item.location && typeof item.location.lat === 'number' && typeof item.location.lng === 'number') {
        return [item.location.lat, item.location.lng];
      }
      return [0, 0];
    },
    popupContentGetter: (item: any) => {
      return `<div class="popup-content">
        <h3>${item['task'] || 'Submission'}</h3>
        <p><strong>From:</strong> ${item['from'] || 'N/A'}</p>
        <p><strong>To:</strong> ${item['to'] || 'N/A'}</p>
        <p><strong>Due Date:</strong> ${item['dueDate'] || 'N/A'}</p>
        <p><strong>Status:</strong> ${item['status'] || 'N/A'}</p>
        ${item['customerAddress'] ? `<p><strong>Address:</strong> ${item['customerAddress']}</p>` : ''}
      </div>`;
    }
  };
  @Input() mapOptions: L.MapOptions = {
    center: [43.65, -79.38], // Toronto coordinates
    zoom: 12
  };
  @Input() tileLayerUrl: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  @Input() mapId: string = 'map';
  
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private markerClusterGroup?: any; // Use 'any' to avoid type issues
  
  // Track selected item
  selectedItem: any = null;
  private markerByItem = new Map<any, L.Marker>();

  ngAfterViewInit(): void {
    this.initMap();
    this.updateMarkers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && !changes['items'].firstChange) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }
  
  /**
   * Selects an item and centers the map on it
   */
  selectItem(item: any): void {
    this.selectedItem = item;
    if (this.map && item) {
      const marker = this.markerByItem.get(item);
      if (marker) {
        const latLng = marker.getLatLng();
        this.map.setView(latLng, 14);
        marker.openPopup();
      }
    }
  }
  
  /**
   * Returns the CSS class based on status
   */
  getStatusClass(status: string): string {
    status = (status || '').toLowerCase();
    if (status.includes('low')) return 'status-low-risk';
    if (status.includes('complete')) return 'status-complete';
    if (status.includes('needs') || status.includes('review')) return 'status-needs-review';
    if (status.includes('unassigned')) return 'status-unassigned';
    return 'status-incomplete';
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map(this.mapId, this.mapOptions);
    
    // Add tile layer
    L.tileLayer(this.tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Create marker cluster group
    this.markerClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 19,
      maxClusterRadius: 40,
      iconCreateFunction: (cluster) => {
        const count = cluster.getChildCount();
        return L.divIcon({
          html: `<div class="cluster-marker">${count}</div>`,
          className: 'custom-cluster-marker',
          iconSize: L.point(40, 40)
        });
      }
    });
    
    this.map.addLayer(this.markerClusterGroup);
  }

  private updateMarkers(): void {
    if (!this.map || !this.items || !this.markerClusterGroup) {
      return;
    }

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.markerByItem.clear();
    this.markerClusterGroup.clearLayers();

    // Add markers for all items
    const validMarkers: L.Marker[] = [];
    
    this.items.forEach(item => {
      try {
        const latLng = this.config.latLngGetter(item);
        
        // Skip invalid coordinates
        if (!latLng || !latLng[0] || !latLng[1] || 
            isNaN(latLng[0]) || isNaN(latLng[1])) {
          return;
        }
        
        // Create a custom icon if a getter is provided
        let icon: L.DivIcon | undefined;
        if (this.config.iconGetter) {
          icon = this.config.iconGetter(item);
        } else {
          // Default icon with status class
          const statusClass = this.config.statusClassGetter ? 
            this.config.statusClassGetter(item) : 
            this.getStatusClass(item['status']);
            
          icon = L.divIcon({
            html: `<div class="marker-pin ${statusClass}"><span class="material-icons">place</span></div>`,
            className: 'custom-div-icon',
            iconSize: [30, 42],
            iconAnchor: [15, 42],
            popupAnchor: [0, -35]
          });
        }
        
        // Create marker with popup
        const marker = L.marker(latLng, { icon });
        const popupContent = this.config.popupContentGetter(item);
        marker.bindPopup(popupContent, {
          maxWidth: 300,
          className: 'custom-popup'
        });
        
        // Store the marker
        this.markers.push(marker);
        this.markerByItem.set(item, marker);
        validMarkers.push(marker);
        
        // Add to cluster group
        this.markerClusterGroup.addLayer(marker);
      } catch (error) {
        console.error('Error creating marker for item', item, error);
      }
    });
    
    // Set map bounds if we have valid markers
    if (validMarkers.length > 0) {
      const bounds = L.latLngBounds(validMarkers.map(m => m.getLatLng()));
      this.map.fitBounds(bounds.pad(0.2));
      
      // Limit max zoom level when fitting bounds
      if (this.map.getZoom() > 15) {
        this.map.setZoom(15);
      }
    }
    
    // Select the previously selected item if it still exists
    if (this.selectedItem) {
      const stillExists = this.items.includes(this.selectedItem);
      if (stillExists) {
        this.selectItem(this.selectedItem);
      } else {
        this.selectedItem = null;
      }
    }
  }
}
