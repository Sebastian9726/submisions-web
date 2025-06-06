import { Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataItem, LocationData } from '../../models/data-item.model';
import * as L from 'leaflet';
import 'leaflet.markercluster';

interface MapClusterOptions {
  maxClusterRadius?: number;
  iconCreateFunction?: (cluster: L.MarkerCluster) => L.DivIcon;
  spiderfyOnMaxZoom?: boolean;
  showCoverageOnHover?: boolean;
  zoomToBoundsOnClick?: boolean;
  disableClusteringAtZoom?: number;
}

// Helper function to create cluster or fallback to layer group
function createClusterOrLayerGroup(options?: MapClusterOptions): L.LayerGroup {
  try {
    // Try to use markerClusterGroup if it exists
    if (typeof L.markerClusterGroup === 'function') {
      return L.markerClusterGroup(options);
    }
    // Fallback to a regular layer group
    console.warn('MarkerClusterGroup not available, using LayerGroup fallback');
    return L.layerGroup();
  } catch (e) {
    console.warn('Error creating MarkerClusterGroup, using fallback:', e);
    return L.layerGroup();
  }
}

export interface MapMarkerConfig {
  latLngGetter: (item: DataItem) => [number, number];
  popupContentGetter: (item: DataItem) => string;
  iconGetter?: (item: DataItem) => L.DivIcon;
  statusClassGetter?: (item: DataItem) => string;
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
    latLngGetter: (item: DataItem) => {
      const location = item['location'] as LocationData | undefined;
      if (location && typeof location.lat === 'number' && typeof location.lng === 'number') {
        return [location.lat, location.lng];
      }
      return [0, 0];
    },
    popupContentGetter: (item: DataItem) => {
      return `<div class="popup-content">
        <h3>${item['task'] || 'Submission'}</h3>
        <p><strong>From:</strong> ${item['from'] || 'N/A'}</p>
        <p><strong>To:</strong> ${item['to'] || 'N/A'}</p>
        <p><strong>Due Date:</strong> ${item['dueDate'] || 'N/A'}</p>
      </div>`;
    }
  };
  @Input() mapOptions: L.MapOptions = {
    center: [51.5074, -0.1278], // London coordinates
    zoom: 12
  };
  @Input() tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  @Input() mapId = 'map';
  
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private markerClusterGroup?: L.LayerGroup;
  
  // Track selected item
  selectedItem: DataItem | null = null;
  private markerByItem = new Map<DataItem, L.Marker>();

  ngAfterViewInit(): void {
    try {
      setTimeout(() => {
        this.initMap();
        this.updateMarkers();
      }, 100);
    } catch (error) {
      console.error('Error initializing map view:', error);
    }
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
  selectItem(item: DataItem): void {
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

  initMap(): void {
    // Verificar si el contenedor del mapa existe
    const mapElement = document.getElementById(this.mapId);
    if (!mapElement) {
      console.error(`Map container with ID '${this.mapId}' not found`);
      return;
    }

    // Asegurar que el contenedor del mapa tenga altura
    if (mapElement.clientHeight === 0) {
      console.warn('Map container has zero height. Setting a minimum height.');
      mapElement.style.height = '500px';
    }

    // Crear el mapa
    this.map = L.map(this.mapId, this.mapOptions);
    
    // Añadir el tile layer
    L.tileLayer(this.tileLayerUrl, {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);
    
    // Crear el grupo de marcadores para clustering
    const clusterOptions = { 
      maxClusterRadius: window.innerWidth < 768 ? 40 : 60
    };
    this.markerClusterGroup = createClusterOrLayerGroup(clusterOptions);
    this.map.addLayer(this.markerClusterGroup);

    // Invalidar tamaño después de que el mapa se haya creado
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 300);
  }

  private updateMarkers(): void {
    if (!this.map || !this.items) {
      return;
    }

    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];
    this.markerByItem.clear();
    
    // Reset the marker group
    if (this.markerClusterGroup) {
      this.map.removeLayer(this.markerClusterGroup);
    }
    
    const clusterOptions = { 
      maxClusterRadius: window.innerWidth < 768 ? 40 : 60
    };
    this.markerClusterGroup = createClusterOrLayerGroup(clusterOptions);
    this.map.addLayer(this.markerClusterGroup);

    // Add markers for all items
    const validMarkers: L.Marker[] = [];
    
    // Create custom icon once to reuse
    const customIcon = L.icon({
      iconUrl: 'assets/custom-marker.png',
      iconSize: [40, 40],     // size of the icon
      iconAnchor: [20, 20],   // point of the icon which will correspond to marker's location
      popupAnchor: [0, -20]   // point from which the popup should open relative to the iconAnchor
    });
    
    this.items.forEach(item => {
      try {
        const latLng = this.config.latLngGetter(item);
        
        // Skip invalid coordinates
        if (!latLng || !latLng[0] || !latLng[1] || 
            isNaN(latLng[0]) || isNaN(latLng[1])) {
          return;
        }
        
        // Use custom icon instead of div icons with status classes
        const icon = customIcon;
        
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
        if (this.markerClusterGroup) {
          this.markerClusterGroup.addLayer(marker);
        }
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
