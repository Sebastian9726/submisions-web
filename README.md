# Submissions Web Application

A modern Angular application for managing and visualizing submissions with interactive map and list views.

## Setup Instructions

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)
- Angular CLI (v15 or later)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/submissions-web.git
   cd submissions-web
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Running the application locally:
   ```bash
   ng serve
   ```

4. Open your browser and navigate to:
   ```
   http://localhost:4200
   ```

## Main Components and Functionality

### Submissions Management System
The application provides a comprehensive interface for managing submissions, with the following key features:

#### Filter Container (`filter-container.component`)
- Allows filtering submissions by:
  - Sender email address ("From" field)
  - Status (Incomplete, Low Risk, Needs Review, Complete, Unassigned)
  - Date range (displays submissions from the selected date to the present)
- Includes a search functionality for finding specific submissions
- Toggles between map and list views
- Supports exporting submission data

#### View Modes

##### Map View (`map-view.component`)
- Interactive map visualization using Leaflet
- Displays submissions as markers with custom styling based on status
- Supports clustering for improved performance with large datasets
- Interactive popups with submission details
- Selection functionality to focus on specific submissions

##### List View (`list-view.component`)
- Tabular display of submissions with sortable columns
- Configurable columns with customizable rendering
- Pagination for handling large datasets
- Selection functionality for bulk actions
- Status indicators with color coding

### Data Management

#### Submission Service (`submission.service`)
- Manages data retrieval and filtering
- Implements mock data generation for demonstration
- Handles filtering logic for:
  - Sender emails
  - Status types
  - Date ranges
  - Text search

#### Models
- **Submission**: Core data structure for submission information
- **DataItem**: Base interface for generic data handling
- **LocationData**: Structure for geographic coordinates

## Additional Information for Reviewers

### Architecture Highlights

- **Component-Based Design**: The application follows Angular's component-based architecture, with clear separation of concerns between UI components, services, and models.

- **Type Safety**: Extensive use of TypeScript interfaces ensures type safety throughout the application. The design handles the relationship between generic `DataItem` interfaces and specific `Submission` types.

- **Responsive Design**: The application is fully responsive, adapting to different screen sizes with appropriate layouts and interaction patterns.

- **Lazy Loading**: Components are organized to support efficient loading and rendering.

### Known Limitations

- Currently uses mock data instead of connecting to a real backend service
- Map marker clustering may need performance optimizations for very large datasets

### Future Enhancements

- Integration with a real backend API
- Advanced filtering options
- Bulk operations for selected submissions
- Export functionality with various format options
- User authentication and permission-based access

### Testing

To run tests:
```bash
ng test
```

To run linting:
```bash
ng lint
```

## Project Structure

```
src/
├── app/
│   ├── shared/           # Shared components, models, and utilities
│   │   ├── components/   # Reusable UI components
│   │   ├── models/       # Data interfaces and types
│   │   ├── pipes/        # Custom Angular pipes
│   │   └── directives/   # Custom Angular directives
│   │
│   └── submissions/      # Feature module for submissions
│       ├── models/       # Submission-specific models
│       ├── services/     # Submission-related services
│       └── submissions/  # Main submission components
│
├── assets/               # Static assets like images
└── environments/         # Environment configuration files
```

## Development Guidelines

- Follow Angular style guide for consistent code structure
- Maintain type safety with proper interfaces
- Keep components small and focused on a single responsibility
- Use services for data management and business logic
- Implement responsive design for all components
