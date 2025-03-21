import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { Submission, SubmissionFilter } from '../models/submission.model';

@Injectable({
  providedIn: 'root'
})
export class SubmissionService {
  private mockSubmissions: Submission[] = this.generateMockData(100);
  private submissionsSubject = new BehaviorSubject<Submission[]>(this.mockSubmissions);

  constructor() {}

  /**
   * Generates mock submission data
   * @param count Number of mock entries to generate
   * @returns Array of mock submissions
   */
  private generateMockData(count: number): Submission[] {
    const submissions: Submission[] = [];
    const statuses: ('Incomplete' | 'Low Risk' | 'Needs Review' | 'Complete' | 'Unassigned')[] = [
      'Incomplete', 'Low Risk', 'Needs Review', 'Complete', 'Unassigned'
    ];
    
    const workFlowTypes = [
      'Requires Location', 
      'Customer Survey', 
      'Site Inspection', 
      'Delivery Confirmation', 
      'Maintenance Request'
    ];
    
    const emails = [
      'denisgordiyenya@gmail.com',
      'john.smith@example.com',
      'sarah.parker@example.com',
      'michael.wong@example.com',
      'emily.johnson@example.com'
    ];
    
    const addresses = [
      '123 Main St, London, UK',
      '456 Oxford Street, London, UK',
      '789 Baker Street, London, UK',
      '321 Park Avenue, London, UK',
      '654 Bond Street, London, UK'
    ];
    
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Base coordinates for London
    const baseLat = 51.5;
    const baseLng = -0.1;
    
    for (let i = 1; i <= count; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomWorkFlow = 'Work Flow:'+workFlowTypes[Math.floor(Math.random() * workFlowTypes.length)];
      const randomFromEmail = emails[Math.floor(Math.random() * emails.length)];
      const randomToEmail = emails[Math.floor(Math.random() * emails.length)];
      const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
      const randomDay = Math.floor(Math.random() * 28) + 1;
      const randomMonth = months[Math.floor(Math.random() * months.length)];
      
      // Generate coordinates with small random offsets for visual distribution on map
      const latOffset = (Math.random() - 0.5) * 0.1;
      const lngOffset = (Math.random() - 0.5) * 0.1;
      
      submissions.push({
        id: i.toString(),
        task: randomWorkFlow,
        status: randomStatus,
        from: randomFromEmail,
        to: randomToEmail,
        customerAddress: randomAddress,
        dueDate: `${randomDay < 10 ? '0' + randomDay : randomDay} ${randomMonth}`,
        location: {
          lat: baseLat + latOffset,
          lng: baseLng + lngOffset
        }
      });
    }
    
    return submissions;
  }

  getSubmissions(filters?: SubmissionFilter): Observable<Submission[]> {
    // Apply filters if provided
    if (filters) {
      const filteredSubmissions = this.mockSubmissions.filter(submission => {
        let match = true;
        
        if (filters.form && submission.task !== filters.form) {
          match = false;
        }
        
        if (filters.status && submission.status !== filters.status) {
          match = false;
        }
        
        if (filters.date && submission.dueDate !== filters.date) {
          match = false;
        }
        
        if (filters.search) {
          const searchText = filters.search.toLowerCase();
          const searchMatch = 
            submission.task.toLowerCase().includes(searchText) ||
            submission.status.toLowerCase().includes(searchText) ||
            submission.from.toLowerCase().includes(searchText) ||
            submission.to.toLowerCase().includes(searchText) ||
            submission.customerAddress.toLowerCase().includes(searchText) ||
            submission.dueDate.toLowerCase().includes(searchText);
          
          if (!searchMatch) {
            match = false;
          }
        }
        
        return match;
      });
      
      return of(filteredSubmissions);
    }
    
    return this.submissionsSubject.asObservable();
  }

  exportSubmissions(): void {
    console.log('Exporting submissions:', this.mockSubmissions);
    alert('Submissions exported successfully');
  }

  getFormOptions(): string[] {
    return ['All Forms', 'Requires Location', 'Customer Survey', 'Site Inspection', 'Delivery Confirmation', 'Maintenance Request'];
  }

  getStatusOptions(): string[] {
    return ['All Status', 'Incomplete', 'Low Risk', 'Needs Review', 'Complete', 'Unassigned'];
  }
}
