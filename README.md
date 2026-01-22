# MHS Parking Portal - Student Parking Spot Selection System

A complete, client-side parking spot selection and management system for Marlboro High School rising seniors. Built with HTML5, CSS3, JavaScript (vanilla ES6+), and Bootstrap 5.

## 📋 Project Overview

This is a fully functional parking management portal that allows students to:
- View available parking spots in three lots
- Select their preferred parking spot (solo or shared)
- Register with their student information
- Receive a unique confirmation reference number
- Print their confirmation for their records

Administrators can:
- Login with a secure password
- View all student registrations
- Manage parking spot assignments
- Remove students or clear spots
- Reset data and export reports

## ✨ Features

### Student Experience
- **Interactive Parking Lot Selection**
  - Three parking lots (A, B, C) with 10 spots each (30 total)
  - Color-coded spot status: Green (available), Red (taken), Gold (selected)
  - Support for solo and shared parking spots
  - Responsive grid layout (auto-adjusts for mobile/tablet/desktop)

- **Student Registration Form**
  - Full Name, Student ID (6-8 digits), Email, Phone
  - Grade Level selection (9-12)
  - Conditional fields for shared spot partnerships
  - Real-time field validation with error messages
  - Auto-populated parking spot information

- **Confirmation Page**
  - Displays parking assignment summary
  - Shows student information
  - Shared spot details (partner name, schedule)
  - Unique reference number (REF-TIMESTAMP-RANDOM)
  - Print-friendly layout with hidden navbar/footer
  - Reference number copy-to-clipboard functionality

- **Light/Dark Mode**
  - System preference detection
  - Smooth transitions between themes
  - Persistent preference storage
  - Theme toggle on all pages

### Administrator Features
- **Secure Login**
  - Password-protected access
  - Session management with localStorage
  - Automatic session validation

- **Dashboard Statistics**
  - Total parking spots count
  - Available/taken spot breakdown
  - Total registrations
  - Real-time updates

- **Student Management**
  - View all registrations in table format
  - Copy student information to clipboard
  - Remove individual student records
  - Auto-remove associated spot assignments

- **Parking Spot Management**
  - View all spots with status and assignments
  - Filter spots by lot (A, B, C)
  - Clear individual spot assignments
  - Clear associated student record

- **Data Operations**
  - Refresh dashboard data
  - Reset all data (dual confirmation required)
  - Export all data as timestamped JSON file

## 🏗️ Project Structure

```
Parking Spot Website/
├── index.html                    # Homepage with hero, process, FAQ
├── parking.html                  # Parking lot selection
├── form.html                     # Student registration form
├── confirmation.html             # Confirmation and summary
├── admin.html                    # Admin dashboard
│
├── public/
│   ├── css/
│   │   ├── styles.css           # Global styles & theme variables
│   │   ├── home.css             # Homepage specific styles
│   │   ├── parking.css          # Parking lot grid styles
│   │   ├── form.css             # Form validation styles
│   │   ├── confirmation.css     # Confirmation page styles
│   │   └── admin.css            # Admin dashboard styles
│   │
│   ├── js/
│   │   ├── theme.js             # Light/dark mode ThemeManager class
│   │   ├── parking.js           # Lot loading & spot selection
│   │   ├── form.js              # Form validation & submission
│   │   ├── confirmation.js      # Confirmation display logic
│   │   └── admin.js             # Admin auth & dashboard
│   │
│   └── data/
│       ├── parkingData.json     # Parking lot structure (30 spots)
│       └── config.json          # Admin password & school metadata
│
└── README.md                     # This file
```

## 🚀 Getting Started

### No Installation Required!
This is a **100% client-side application**. Simply open `index.html` in a web browser.

```bash
# Option 1: Direct file open
Open: index.html

# Option 2: Use a local server (recommended for development)
python -m http.server 8000
# Then visit: http://localhost:8000
```

### First Time Setup
1. Admin password is pre-configured in `public/data/config.json`
2. Default password: `MHS2026Parking`
3. All data is stored in browser's localStorage (no database needed)

## 📖 User Flows

### Student Journey
1. **Home Page** - Reads about the parking system and process
2. **Select Parking Spot** - Views lots and chooses available spot
3. **Registration Form** - Enters student info and confirms spot selection
4. **Confirmation Page** - Views assignment, prints confirmation, saves reference number

### Administrator Journey
1. **Admin Page** - Navigates to admin.html
2. **Login** - Enters admin password
3. **Dashboard** - Views statistics, student registrations, parking spots
4. **Management** - Removes students, clears spots, exports data

## 🎨 Technology Stack

- **HTML5** - Semantic markup, responsive meta tags
- **CSS3** - Custom properties, animations, flexbox, grid, responsive design
- **JavaScript (ES6+)** - Vanilla JS, no frameworks
- **Bootstrap 5.3.0** - CDN, responsive components, utilities
- **Vue 3** - CDN (included but not required; vanilla JS used for most features)
- **LocalStorage API** - Client-side data persistence
- **Fetch API** - Load JSON data files

## 🎯 Key Implementation Details

### Data Persistence
- **Parking Data**: Loaded from `public/data/parkingData.json`
- **Selected Spot**: Stored in localStorage key `selectedParkingSpot`
- **Student Registration**: Stored in localStorage key `currentRegistration`
- **All Registrations**: Array stored in localStorage key `parkingSubmissions`
- **Admin Session**: Stored in localStorage key `adminSession`
- **Theme Preference**: Stored in localStorage key `mhs_theme_mode`

### Color Scheme
- **Primary**: `#003d7a` (Dark Blue)
- **Secondary**: `#f39200` (Orange)
- **Accent**: `#28a745` (Green)
- **Danger**: `#dc3545` (Red)
- **Light BG**: `#f8f9fa`
- **Dark BG**: `#1a1a1a`

### Responsive Breakpoints
- **Mobile**: < 768px (single column, reduced font sizes)
- **Tablet**: 768px - 1024px (two columns)
- **Desktop**: > 1024px (full multi-column layout)

## 🔐 Security Notes

### Admin Authentication
- Password stored in `public/data/config.json` (client-side only)
- Session stored in localStorage with validation
- No backend server (client-side only)
- Dual confirmation for destructive operations

### Important Limitations
⚠️ **This is a client-side only application**:
- No backend server
- No database
- All data stored in browser localStorage (lost if cache cleared)
- Password visible in config.json (for demo purposes only)
- Single-browser sessions (not shared across devices)

For production use, you should:
- Implement a backend server
- Use a real database
- Hash passwords securely
- Add server-side validation

## 📱 Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Android Chrome)

## 🧪 Testing Checklist

- [x] Homepage displays correctly (light & dark mode)
- [x] Parking lot loads with all 30 spots
- [x] Spot selection works (solo and shared)
- [x] Registration form validates all fields
- [x] Shared spot fields show/hide conditionally
- [x] Confirmation page displays data correctly
- [x] Reference number copies to clipboard
- [x] Print confirmation works
- [x] Admin login requires correct password
- [x] Dashboard loads student data
- [x] Student removal works with spot clearing
- [x] Spot clearing works with student removal
- [x] Data export generates JSON file
- [x] Light/dark mode works on all pages
- [x] Responsive design works on mobile/tablet
- [x] LocalStorage persistence works across page reloads

## 📊 Sample Data

### Parking Data Structure
```json
{
  "lotA": {
    "name": "Lot A",
    "spots": [
      {
        "id": "A-1",
        "status": "available",
        "type": "solo",
        "assignedTo": null
      }
    ]
  }
}
```

### Student Registration Structure
```javascript
{
  "fullName": "Jane Smith",
  "studentId": "654321",
  "email": "jane.smith@marlboro.edu",
  "phone": "(555) 234-5678",
  "spotType": "Solo",
  "gradeLevel": "12",
  "parkingLot": "Lot A",
  "parkingSpot": "A-5",
  "submittedAt": "2026-01-22T10:30:00.000Z",
  "referenceId": "REF-1705848600000-abc123"
}
```

## 🔄 Complete User Flow Example

1. **Home Page** → Student reads about the parking system
2. **Select Parking** → Student chooses Lot B, Spot B-7 (available)
3. **Registration** → Student enters:
   - Name: "Alex Johnson"
   - Student ID: "789456"
   - Email: "alex.j@marlboro.edu"
   - Phone: "(555) 789-4567"
   - Grade: "Senior"
   - Accepts terms
4. **Confirmation** → System displays:
   - ✓ Success checkmark
   - Parking Assignment: Lot B, Spot #B-7
   - Student Info: Alex Johnson, 789456, alex.j@marlboro.edu
   - Reference: REF-1705848600000-xyz789
5. **Print** → Student prints or takes screenshot
6. **Admin Dashboard** → Admin sees new registration and can manage it

## 📝 Development Notes

### Adding New Features
- Keep all data structures in JSON files
- Add validation in form.js before submission
- Update admin.js for new data fields
- Test theme switching (light/dark mode)
- Ensure responsive design with CSS media queries

### Modifying Admin Password
Edit `public/data/config.json`:
```json
{
  "adminPassword": "YOUR_NEW_PASSWORD",
  ...
}
```

### Customizing School Name/Contact Info
Edit `public/data/config.json`:
```json
{
  "schoolName": "Your School Name",
  "contactEmail": "your-email@school.edu",
  "contactPhone": "(555) 000-0000",
  ...
}
```

## 🐛 Troubleshooting

### LocalStorage Full?
If you see "LocalStorage full" errors:
1. Admin → Reset All Data (clears all registrations)
2. Or manually clear browser cache/localStorage
3. Or open in private/incognito mode

### Data Not Persisting?
1. Check browser localStorage is enabled
2. Ensure you're not in private/incognito mode
3. Try a different browser
4. Clear browser cache and restart

### Admin Password Not Working?
1. Check `public/data/config.json` for correct password
2. Ensure there are no extra spaces in the password
3. Check browser console for error messages

## 📄 License

Created for Marlboro High School 2026 Academic Year

## 👥 Support

For issues or questions:
- Email: parking@marlboro.edu
- Contact: Administration Office

---

**Version 1.0** | Created January 2026 | Last Updated January 22, 2026
