import { Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataItem, LocationData } from '../../models/data-item.model';
import * as L from 'leaflet';

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
        <h3>${item.id || 'No ID'}</h3>
        <p>${JSON.stringify(item)}</p>
      </div>`;
    }
  };
  @Input() mapOptions: L.MapOptions = {
    center: [51.505, -0.09],
    zoom: 13
  };
  @Input() tileLayerUrl: string = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  @Input() mapId: string = 'map';
  
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private markerLayerGroup?: L.LayerGroup;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['items'] && this.map) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap(): void {
    const mapElement = document.getElementById(this.mapId);
    if (!mapElement || this.map) {
      return;
    }

    this.map = L.map(this.mapId, this.mapOptions);

    L.tileLayer(this.tileLayerUrl, {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    this.markerLayerGroup = L.layerGroup().addTo(this.map);

    setTimeout(() => {
      this.updateMarkers();
    }, 100);
  }

  private updateMarkers(): void {
    if (!this.map || !this.markerLayerGroup) return;

    this.clearMarkers();

    if (this.items && this.items.length) {
      this.items.forEach(item => {
        const latLng = this.config.latLngGetter(item);
        
        // Create icon if iconGetter is provided, otherwise use default
        let icon: L.DivIcon;
        if (this.config.iconGetter) {
          icon = this.config.iconGetter(item);
        } else {
          const statusClass = this.config.statusClassGetter ? this.config.statusClassGetter(item) : 'default';
          icon = this.createDefaultIcon(statusClass);
        }
        
        const marker = L.marker(latLng, { icon });
        marker.addTo(this.markerLayerGroup!);
        marker.bindPopup(this.config.popupContentGetter(item));
        this.markers.push(marker);
      });

      if (this.items.length > 0) {
        const latLngs = this.items.map(item => this.config.latLngGetter(item));
        this.map.fitBounds(L.latLngBounds(latLngs));
      }
    }
  }

  private createDefaultIcon(statusClass: string): L.DivIcon {
    return L.divIcon({
      className: `marker-icon status-${statusClass}`,
      html: `<div class="marker-content"><i class="material-icons">location_on</i></div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
  }

  private clearMarkers(): void {
    if (this.markerLayerGroup) {
      this.markerLayerGroup.clearLayers();
      this.markers = [];
    }
  }
}
