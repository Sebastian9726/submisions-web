import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, NavigationEnd, RouterLink, Event } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter } from 'rxjs/operators';

interface MenuItem {
  path: string;
  icon: string;
  label: string;
  exact: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'submissions-web';
  currentPath = '';
  
  menuItems: MenuItem[] = [
    { path: '/forms', icon: 'description', label: 'Forms', exact: false },
    { path: '/customers', icon: 'people', label: 'Customers', exact: false },
    { path: '/submissions', icon: 'send', label: 'Submissions', exact: false },
    { path: '/history', icon: 'history', label: 'History', exact: false },
    { path: '/reports', icon: 'bar_chart', label: 'Reports', exact: false },
    { path: '/workflow', icon: 'assignment', label: 'Workflow', exact: false }
  ];

  constructor(private router: Router) {}

  ngOnInit() {
    // Set initial path
    this.currentPath = this.router.url;
    
    // Subscribe to router events to update active menu item
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: Event) => {
      if (event instanceof NavigationEnd) {
        this.currentPath = event.url;
      }
    });
  }

  /**
   * Checks if the menu item should be highlighted as active
   * @param path The path to check
   * @param exact Whether the path should match exactly
   * @returns True if the menu item should be highlighted
   */
  isActive(path: string, exact: boolean): boolean {
    if (exact) {
      return this.currentPath === path;
    }
    // If the path is root, only match exactly
    if (path === '/') {
      return this.currentPath === '/';
    }
    // Otherwise, check if the current path starts with the given path
    return this.currentPath.startsWith(path);
  }
}
