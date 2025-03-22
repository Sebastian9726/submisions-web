import { DataItem, LocationData } from '../../shared/models/data-item.model';

export interface Submission extends DataItem {
  id: string;
  task: string;
  status: 'Incomplete' | 'Low Risk' | 'Needs Review' | 'Complete' | 'Unassigned';
  from: string;
  to: string;
  customerAddress: string;
  dueDate: string;
  location: LocationData;
}

export interface SubmissionFilter {
  from?: string;
  status?: string;
  date?: string | Date;
  search?: string;
} 