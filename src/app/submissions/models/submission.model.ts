export interface Submission {
  id: string;
  task: string;
  status: 'Incomplete' | 'Low Risk' | 'Needs Review' | 'Complete' | 'Unassigned';
  from: string;
  to: string;
  customerAddress: string;
  dueDate: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface SubmissionFilter {
  form?: string;
  status?: string;
  date?: string;
  search?: string;
} 