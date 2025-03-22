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
    
    // Definir el rango de fechas desde el 1 de enero de 2022 hasta hoy
    const startDate = new Date(2022, 0, 1);  // 1 de enero de 2022
    const endDate = new Date();  // Fecha actual
    
    // Base coordinates for London
    const baseLat = 51.5;
    const baseLng = -0.1;
    
    for (let i = 1; i <= count; i++) {
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const randomWorkFlow = 'Work Flow:'+workFlowTypes[Math.floor(Math.random() * workFlowTypes.length)];
      const randomFromEmail = emails[Math.floor(Math.random() * emails.length)];
      const randomToEmail = emails[Math.floor(Math.random() * emails.length)];
      const randomAddress = addresses[Math.floor(Math.random() * addresses.length)];
      
      // Generar una fecha aleatoria entre startDate y endDate
      const randomTimestamp = startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime());
      const randomDate = new Date(randomTimestamp);
      
      // Añadir hora aleatoria (para que tenga sentido con el formato "Oct 6, 02:38 AM")
      randomDate.setHours(Math.floor(Math.random() * 24));
      randomDate.setMinutes(Math.floor(Math.random() * 60));
      
      // Imprimir la fecha para depuración
      console.log('Generando fecha con hora:', 
        randomDate.getFullYear(), 
        randomDate.getMonth() + 1, 
        randomDate.getDate(), 
        randomDate.getHours(), 
        randomDate.getMinutes()
      );
      
      // Formatear fecha como valor ISO para una fácil conversión posterior
      const formattedDate = randomDate.toISOString();
      console.log('Fecha ISO generada:', formattedDate);
      
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
        dueDate: formattedDate,
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
        
        if (filters.from && submission.from !== filters.from) {
          match = false;
        }
        
        if (filters.status && submission.status !== filters.status) {
          match = false;
        }
        
        if (filters.date) {
          // Convertir la fecha del filtro a formato de fecha sin hora
          let filterDate: Date;
          if (typeof filters.date === 'string') {
            filterDate = new Date(filters.date);
          } else {
            filterDate = new Date(filters.date);
          }
          
          // Establecer la hora a 00:00:00 para comparar solo fechas
          filterDate.setHours(0, 0, 0, 0);
          
          // Convertir la fecha del submission a Date
          const submissionDate = new Date(submission.dueDate);
          
          // Comparar si la fecha del submission es ANTERIOR a la fecha del filtro
          // (queremos mostrar desde la fecha del filtro en adelante)
          if (submissionDate < filterDate) {
            match = false;
          }
          
          // Nota: No necesitamos comprobar si es posterior a hoy,
          // ya que todos los registros son de fechas pasadas o presentes
        }
        
        if (filters.search) {
          const searchText = filters.search.toLowerCase();
          const searchMatch = 
            submission.task.toLowerCase().includes(searchText) ||
            submission.status.toLowerCase().includes(searchText) ||
            submission.from.toLowerCase().includes(searchText) ||
            submission.to.toLowerCase().includes(searchText) ||
            submission.customerAddress.toLowerCase().includes(searchText) ||
            new Date(submission.dueDate).toLocaleString().toLowerCase().includes(searchText);
          
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

  getFromOptions(): string[] {
    // Obtener emails únicos de los datos para el filtro
    const uniqueEmails = Array.from(new Set(this.mockSubmissions.map(sub => sub.from)));
    return ['All Emails', ...uniqueEmails];
  }

  getStatusOptions(): string[] {
    return ['All Status', 'Incomplete', 'Low Risk', 'Needs Review', 'Complete', 'Unassigned'];
  }
}
