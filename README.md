# ZenduForms Submissions Web

This project implements a "Submissions" page based on a Figma design, featuring a Map/List view toggle, filtering options, and an export functionality. The project is built with Angular 19 and includes features like:

- Toggle between Map and List views
- Interactive map with markers
- Filterable submissions list
- Export functionality
- Responsive design

## Prerequisites

- Node.js (v18+)
- npm (v9+)
- Angular CLI (v19+)

## Getting Started

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd submisions-web
```

2. Install dependencies:
```bash
npm install
```

### Running the Application

Run the development server:
```bash
ng serve
```

Navigate to `http://localhost:4200/` in your browser to see the application.

### Building for Production

To build the application for production:
```bash
ng build --configuration production
```

The build artifacts will be stored in the `dist/` directory.

## Project Structure

The application has the following structure:

- `src/app/submissions/` - Main module for the submissions feature
  - `models/` - Data models and interfaces
  - `services/` - Services for data handling
  - `submissions/` - Main submissions component
  - `map-view/` - Map view component
  - `list-view/` - List view component

## Features

### Map View
The map view displays submission locations as markers on a map. The markers are color-coded based on the submission status. Clicking on a marker displays details about the submission.

### List View
The list view displays submissions in a card format with details like workflow, status, sender/receiver information, and due dates.

### Filters
The application includes filters for:
- Form type
- Status
- Date

### Export Functionality
An export button allows exporting the submissions data.

## Technology Stack

- Angular 19
- Angular Material
- Leaflet for map functionality
- RxJS for reactive programming

## License
This project is licensed under the MIT License - see the LICENSE file for details.
