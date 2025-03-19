import { Component, Input, AfterViewInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Submission } from '../models/submission.model';
import * as L from 'leaflet';

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class MapViewComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() submissions: Submission[] = [];
  private map?: L.Map;
  private markers: L.Marker[] = [];
  private markerClusterGroup?: L.LayerGroup;

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // If submissions change and map is initialized, update markers
    if (changes['submissions'] && this.map) {
      this.updateMarkers();
    }
  }

  ngOnDestroy(): void {
    // Clean up the map instance when component is destroyed
    if (this.map) {
      this.map.remove();
      this.map = undefined;
    }
  }

  private initMap(): void {
    // Check if map container exists and map is not already initialized
    const mapElement = document.getElementById('map');
    if (!mapElement || this.map) {
      return;
    }

    // Initialize the map
    this.map = L.map('map', {
      center: [51.505, -0.09],
      zoom: 13
    });

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Create a layer group for markers
    this.markerClusterGroup = L.layerGroup().addTo(this.map);

    // Add markers after a slight delay to ensure the map is fully loaded
    setTimeout(() => {
      this.updateMarkers();
    }, 100);
  }

  private updateMarkers(): void {
    if (!this.map || !this.markerClusterGroup) return;

    // Clear existing markers
    this.clearMarkers();

    // Create marker icon
    const statusIcon = (status: string) => {
      let className = 'marker-icon ';
      switch (status) {
        case 'Incomplete':
          className += 'status-incomplete';
          break;
        case 'Low Risk':
          className += 'status-low-risk';
          break;
        case 'Needs Review':
          className += 'status-needs-review';
          break;
        default:
          className += 'status-default';
      }

      return L.divIcon({
        className: className,
        html: `<div class="marker-content"><i class="material-icons">location_on</i></div>`,
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      });
    };

    // Add markers
    if (this.submissions && this.submissions.length) {
      this.submissions.forEach(submission => {
        const marker = L.marker([submission.location.lat, submission.location.lng], {
          icon: statusIcon(submission.status)
        });
        
        // Add to layer group
        marker.addTo(this.markerClusterGroup!);

        // Add popup with info
        marker.bindPopup(`
          <div class="popup-content">
            <h3>${submission.task}</h3>
            <p><strong>Status:</strong> ${submission.status}</p>
            <p><strong>From:</strong> ${submission.from}</p>
            <p><strong>To:</strong> ${submission.to}</p>
            <p><strong>Address:</strong> ${submission.customerAddress}</p>
            <p><strong>Due Date:</strong> ${submission.dueDate}</p>
          </div>
        `);

        // Store marker for later removal
        this.markers.push(marker);
      });

      // Adjust the map view to fit all markers
      if (this.submissions.length > 0) {
        const latLngs = this.submissions.map(s => [s.location.lat, s.location.lng]);
        this.map.fitBounds(L.latLngBounds(latLngs as [number, number][]));
      }
    }
  }

  private clearMarkers(): void {
    // Remove all existing markers
    if (this.markerClusterGroup) {
      this.markerClusterGroup.clearLayers();
      this.markers = [];
    }
  }
}
