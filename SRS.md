# Software Requirements Specification (SRS)
## HomeCare - Healthcare Management System

---

## 1. Introduction

### 1.1 Purpose
The purpose of this document is to provide a comprehensive description of the requirements for the HomeCare Healthcare Management System. This SRS outlines the functional and non-functional requirements, user characteristics, and system constraints for the web-based healthcare platform.

### 1.2 Scope
HomeCare is a multi-role healthcare management web application that facilitates the interaction between patients and healthcare providers (doctors and nurses). The system enables appointment scheduling, medical record management, prescription handling, secure messaging, and administrative oversight.

### 1.3 Definitions, Acronyms, and Abbreviations
| Term | Definition |
|------|------------|
| SRS | Software Requirements Specification |
| User | Any individual interacting with the system |
| Patient | A user seeking healthcare services |
| Provider | Doctor or Nurse providing healthcare services |
| Admin | Administrator managing the system |
| Dashboard | Role-specific interface for system operations |
| Appointment | Scheduled healthcare service booking |
| Medical Record | Document containing patient health information |
| Prescription | Doctor's order for medication |

### 1.4 References
- React.js Documentation
- React Router Documentation
- Context API for State Management
- LocalStorage for Data Persistence

---

## 2. Overall Description

### 2.1 Product Perspective
HomeCare is a single-page web application built with React.js that provides a centralized platform for healthcare management. The system uses client-side state management with React Context API and persists data to LocalStorage.

### 2.2 Product Features

#### 2.2.1 Authentication System
- User registration with role selection (Patient, Doctor, Nurse)
- Email/password-based login
- Role-based access control
- Session persistence via localStorage
- Demo quick-login functionality for testing

#### 2.2.2 Patient Features
- View and manage personal appointments
- Book new appointments with doctors/nurses
- View medical records and prescriptions
- Search and filter healthcare providers
- Send messages to providers
- Write reviews and ratings for providers
- Update personal profile information
- Emergency contact management

#### 2.2.3 Doctor Features
- View and manage appointment schedule
- Accept/decline appointment requests
- Start and complete consultations
- Create prescriptions for patients
- Add medical records for patients
- View patient history
- Send messages to patients
- Manage professional profile

#### 2.2.4 Nurse Features
- View and manage nursing appointments
- Accept/decline appointment requests
- Start and complete patient visits
- View patient information
- Send messages to patients
- Manage professional profile
- Weekly schedule management

#### 2.2.5 Administrator Features
- User management (view, edit, delete)
- View all appointments
- Service management (add, edit, delete)
- Generate and view reports
- License verification for providers
- System settings configuration
- View pending provider registrations
- System notifications management

### 2.3 User Characteristics

#### 2.3.1 Patients
- May have varying technical expertise
- Primary goal: easy appointment booking and health record access
- Need clear, intuitive interface

#### 2.3.2 Healthcare Providers (Doctors/Nurses)
- Medical professionals with specific workflow needs
- Require efficient patient management tools
- Need quick access to patient history

#### 2.3.3 Administrators
- System oversight responsibilities
- Need comprehensive analytics and reporting
- Require user management capabilities

### 2.4 Constraints

#### 2.4.1 Technical Constraints
- Single-page application architecture
- Client-side data persistence (LocalStorage)
- No backend server (demo/prototype nature)
- Browser-based operation

#### 2.4.2 Operational Constraints
- Data persists only in browser localStorage
- No real-time notifications (simulated)
- No email/SMS notifications (simulated in-app)
- No actual payment processing

---

## 3. Functional Requirements

### 3.1 Authentication Module

#### 3.1.1 User Registration
| Requirement ID | Description |
|----------------|-------------|
| AUTH-001 | Users shall be able to register with email and password |
| AUTH-002 | Users shall select a role during registration (Patient, Doctor, Nurse) |
| AUTH-003 | The system shall validate email uniqueness |
| AUTH-004 | Patients shall provide additional details: name, phone, date of birth, address |
| AUTH-005 | Doctors/Nurses shall provide: specialty, license number, experience, hospital |

#### 3.1.2 User Login
| Requirement ID | Description |
|----------------|-------------|
| AUTH-006 | Users shall log in with email and password |
| AUTH-007 | The system shall validate credentials against stored users |
| AUTH-008 | Successful login shall redirect to role-specific dashboard |
| AUTH-009 | Failed login shall display appropriate error message |
| AUTH-010 | Quick login buttons shall be available for demo purposes |

#### 3.1.3 Session Management
| Requirement ID | Description |
|----------------|-------------|
| AUTH-011 | User session shall persist across browser refreshes |
| AUTH-012 | Users shall be able to log out |
| AUTH-013 | Unauthorized access to dashboards shall redirect to login |

### 3.2 Patient Dashboard Module

#### 3.2.1 Overview
| Requirement ID | Description |
|----------------|-------------|
| PAT-001 | Dashboard shall display appointment statistics |
| PAT-002 | Dashboard shall show upcoming appointments |
| PAT-003 | Dashboard shall display recent notifications |
| PAT-004 | Quick booking functionality shall be available |

#### 3.2.2 Appointment Management
| Requirement ID | Description |
|----------------|-------------|
| PAT-005 | Patients shall view all their appointments |
| PAT-006 | Patients shall book new appointments |
| PAT-007 | Patients shall select service type from predefined list |
| PAT-008 | Patients shall select healthcare provider |
| PAT-009 | Patients shall specify preferred date and time |
| PAT-010 | Patients shall add notes for the appointment |
| PAT-011 | Patients shall view appointment details |
| PAT-012 | Patients shall cancel pending/confirmed appointments |
| PAT-013 | Appointment status shall be visible (Pending, Confirmed, Completed, Cancelled) |
| PAT-014 | Patients shall filter appointments by status |
| PAT-015 | Patients shall search appointments by service |

#### 3.2.3 Medical Records
| Requirement ID | Description |
|----------------|-------------|
| PAT-016 | Patients shall view their medical records |
| PAT-017 | Patients shall filter records by type (Checkup, Lab Report, Prescription) |
| PAT-018 | Patients shall search records by title |
| PAT-019 | Patients shall view detailed record information |
| PAT-020 | Patients shall view their prescriptions |
| PAT-021 | Patients shall view prescription medication details |

#### 3.2.4 Provider Search
| Requirement ID | Description |
|----------------|-------------|
| PAT-022 | Patients shall browse available doctors and nurses |
| PAT-023 | Patients shall search providers by name |
| PAT-024 | Patients shall filter providers by specialty |
| PAT-025 | Patients shall view provider ratings and reviews |
| PAT-026 | Patients shall be able to book appointments from provider profile |

#### 3.2.5 Messaging
| Requirement ID | Description |
|----------------|-------------|
| PAT-027 | Patients shall send messages to healthcare providers |
| PAT-028 | Patients shall view conversation history |
| PAT-029 | Patients shall receive notifications for new messages |

#### 3.2.6 Reviews
| Requirement ID | Description |
|----------------|-------------|
| PAT-030 | Patients shall write reviews for providers |
| PAT-031 | Patients shall rate providers (1-5 stars) |
| PAT-032 | Patients shall add comments to reviews |
| PAT-033 | Patients shall view their submitted reviews |
| PAT-034 | Patients shall view provider average ratings |

#### 3.2.7 Profile Management
| Requirement ID | Description |
|----------------|-------------|
| PAT-035 | Patients shall view their profile information |
| PAT-036 | Patients shall edit personal information |
| PAT-037 | Patients shall update blood type and allergies |
| PAT-038 | Patients shall manage emergency contact information |

### 3.3 Doctor Dashboard Module

#### 3.3.1 Overview
| Requirement ID | Description |
|----------------|-------------|
| DOC-001 | Dashboard shall display today's appointments |
| DOC-002 | Dashboard shall show total patient count |
| DOC-003 | Dashboard shall display pending appointment requests |
| DOC-004 | Dashboard shall show recent messages |
| DOC-005 | Dashboard shall display notifications |

#### 3.3.2 Appointment Management
| Requirement ID | Description |
|----------------|-------------|
| DOC-006 | Doctors shall view all their appointments |
| DOC-007 | Doctors shall accept pending appointments |
| DOC-008 | Doctors shall decline pending appointments |
| DOC-009 | Doctors shall mark appointments as completed |
| DOC-010 | Doctors shall view patient details for appointments |
| DOC-011 | Doctors shall start consultation sessions |

#### 3.3.3 Patient Management
| Requirement ID | Description |
|----------------|-------------|
| DOC-012 | Doctors shall view their patient list |
| DOC-013 | Doctors shall view patient personal information |
| DOC-014 | Doctors shall view patient medical history |
| DOC-015 | Doctors shall view patient prescriptions |
| DOC-016 | Doctors shall search patients by name |

#### 3.3.4 Medical Records & Prescriptions
| Requirement ID | Description |
|----------------|-------------|
| DOC-017 | Doctors shall create medical records for patients |
| DOC-018 | Doctors shall specify record type and details |
| DOC-019 | Doctors shall create prescriptions for patients |
| DOC-020 | Doctors shall add multiple medications to prescriptions |
| DOC-021 | Doctors shall specify dosage, frequency, and duration for medications |
| DOC-022 | Doctors shall add notes to prescriptions |

#### 3.3.5 Messaging
| Requirement ID | Description |
|----------------|-------------|
| DOC-023 | Doctors shall send messages to patients |
| DOC-024 | Doctors shall view conversation history |
| DOC-025 | Doctors shall see unread message count |

#### 3.3.6 Schedule Management
| Requirement ID | Description |
|----------------|-------------|
| DOC-026 | Doctors shall view weekly schedule |
| DOC-027 | Schedule shall show available time slots |

#### 3.3.7 Profile Management
| Requirement ID | Description |
|----------------|-------------|
| DOC-028 | Doctors shall view professional profile |
| DOC-029 | Doctors shall edit profile information |
| DOC-030 | Doctors shall update specialty and credentials |

### 3.4 Nurse Dashboard Module

#### 3.4.1 Overview
| Requirement ID | Description |
|----------------|-------------|
| NUR-001 | Dashboard shall display today's visits |
| NUR-002 | Dashboard shall show total patient count |
| NUR-003 | Dashboard shall display pending visit requests |
| NUR-004 | Dashboard shall show recent messages |
| NUR-005 | Dashboard shall display notifications |

#### 3.4.2 Appointment Management
| Requirement ID | Description |
|----------------|-------------|
| NUR-006 | Nurses shall view all their appointments |
| NUR-007 | Nurses shall accept pending appointments |
| NUR-008 | Nurses shall decline pending appointments |
| NUR-009 | Nurses shall mark appointments as completed |
| NUR-010 | Nurses shall start patient visits |
| NUR-011 | Nurses shall view patient details |

#### 3.4.3 Patient Management
| Requirement ID | Description |
|----------------|-------------|
| NUR-012 | Nurses shall view their patient list |
| NUR-013 | Nurses shall view patient information |
| NUR-014 | Nurses shall view patient visit history |

#### 3.4.4 Messaging
| Requirement ID | Description |
|----------------|-------------|
| NUR-015 | Nurses shall send messages to patients |
| NUR-016 | Nurses shall view conversation history |

#### 3.4.5 Schedule Management
| Requirement ID | Description |
|----------------|-------------|
| NUR-017 | Nurses shall view weekly schedule |
| NUR-018 | Schedule shall show working hours per day |

#### 3.4.6 Profile Management
| Requirement ID | Description |
|----------------|-------------|
| NUR-019 | Nurses shall view professional profile |
| NUR-020 | Nurses shall edit profile information |
| NUR-021 | Nurses shall update specialization and credentials |

### 3.5 Administrator Dashboard Module

#### 3.5.1 Overview
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-001 | Dashboard shall display system statistics |
| ADMIN-002 | Dashboard shall show total patients, doctors, nurses |
| ADMIN-003 | Dashboard shall display today's appointments |
| ADMIN-004 | Dashboard shall show recent appointments |
| ADMIN-005 | Dashboard shall show recent user registrations |

#### 3.5.2 User Management
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-006 | Admins shall view all users |
| ADMIN-007 | Admins shall filter users by role (Patient, Doctor, Nurse) |
| ADMIN-008 | Admins shall filter users by status |
| ADMIN-009 | Admins shall search users by name |
| ADMIN-010 | Admins shall view user details |
| ADMIN-011 | Admins shall edit user information |
| ADMIN-012 | Admins shall delete users |
| ADMIN-013 | Admins shall add new users manually |

#### 3.5.3 Appointment Management
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-014 | Admins shall view all appointments |
| ADMIN-015 | Admins shall filter appointments by status |
| ADMIN-016 | Admins shall filter appointments by service |
| ADMIN-017 | Admins shall search appointments |
| ADMIN-018 | Admins shall view appointment details |
| ADMIN-019 | Admins shall edit appointments |

#### 3.5.4 Service Management
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-020 | Admins shall view all services |
| ADMIN-021 | Admins shall add new services |
| ADMIN-022 | Admins shall edit service information |
| ADMIN-023 | Admins shall delete services |
| ADMIN-024 | Services shall include name, description, price, duration, category |

#### 3.5.5 License Verification
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-025 | Admins shall view pending license verifications |
| ADMIN-026 | Admins shall verify provider licenses |
| ADMIN-027 | Admins shall reject provider licenses |
| ADMIN-028 | System shall simulate external license verification |
| ADMIN-029 | Verified licenses shall show expiry date and issuing authority |

#### 3.5.6 Reports
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-030 | Admins shall view available reports |
| ADMIN-031 | Admins shall generate new reports |
| ADMIN-032 | Admins shall view report details |
| ADMIN-033 | Admins shall download reports |
| ADMIN-034 | Reports shall include financial, analytics, and feedback types |

#### 3.5.7 Settings
| Requirement ID | Description |
|----------------|-------------|
| ADMIN-035 | Admins shall access general settings configuration |
| ADMIN-036 | Admins shall access notification settings configuration |
| ADMIN-037 | Admins shall access payment settings configuration |
| ADMIN-038 | Admins shall access security settings configuration |

### 3.6 Messaging System Module

#### 3.6.1 Messaging Features
| Requirement ID | Description |
|----------------|-------------|
| MSG-001 | Users shall send text messages |
| MSG-002 | Messages shall display sender and receiver information |
| MSG-003 | Messages shall show timestamp |
| MSG-004 | Conversation view shall show message history |
| MSG-005 | Users shall see unread message count |

### 3.7 Notifications Module

#### 3.7.1 Notification Features
| Requirement ID | Description |
|----------------|-------------|
| NOTIF-001 | System shall generate appointment notifications |
| NOTIF-002 | System shall generate prescription notifications |
| NOTIF-003 | System shall generate message notifications |
| NOTIF-004 | Users shall view notification list |
| NOTIF-005 | Users shall mark notifications as read |
| NOTIF-006 | Users shall mark all notifications as read |

---

## 4. Data Models

### 4.1 User Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| name | String | Full name |
| email | String | Email address (unique) |
| phone | String | Phone number |
| role | String | patient/doctor/nurse/admin |
| password | String | Encrypted password |
| status | String | active/pending/inactive |
| joinDate | Date | Registration date |
| specialty | String | Medical specialty (doctors) |
| licenseNumber | String | Professional license number |
| experience | String | Years of experience |
| hospital | String | Hospital affiliation |
| rating | Float | Average rating |
| totalRatings | Integer | Number of ratings received |
| dob | Date | Date of birth |
| address | String | Home address |
| bloodType | String | Blood type |
| allergies | String | Known allergies |
| emergencyContact | Object | Emergency contact information |
| specialization | String | Nursing specialization |

### 4.2 Appointment Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| patientId | Integer | Patient user ID |
| patientName | String | Patient full name |
| providerId | Integer | Doctor/Nurse user ID |
| providerName | String | Provider full name |
| service | String | Service type |
| date | Date | Appointment date |
| time | String | Appointment time |
| status | String | Pending/Confirmed/Cancelled/Completed |
| type | String | home/clinic |
| notes | String | Additional notes |
| price | Decimal | Appointment price |

### 4.3 Medical Record Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| patientId | Integer | Patient user ID |
| title | String | Record title |
| date | Date | Record date |
| doctor | String | Doctor name |
| type | String | Record type |
| content | String | Record details |

### 4.4 Prescription Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| patientId | Integer | Patient user ID |
| doctorId | Integer | Doctor user ID |
| doctorName | String | Doctor full name |
| date | Date | Prescription date |
| medications | Array | List of medications |
| notes | String | Additional instructions |
| status | String | Active/Completed |

### 4.5 Message Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| fromId | Integer | Sender user ID |
| fromName | String | Sender full name |
| toId | Integer | Receiver user ID |
| message | String | Message content |
| timestamp | DateTime | Message timestamp |
| read | Boolean | Read status |

### 4.6 Review Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| patientId | Integer | Patient user ID |
| patientName | String | Patient full name |
| providerId | Integer | Provider user ID |
| providerName | String | Provider full name |
| rating | Integer | Star rating (1-5) |
| comment | String | Review comment |
| date | Date | Review date |

### 4.7 Notification Entity
| Field | Type | Description |
|-------|------|-------------|
| id | Integer | Unique identifier |
| userId | Integer | Target user ID |
| title | String | Notification title |
| message | String | Notification message |
| time | String | Time ago string |
| read | Boolean | Read status |
| type | String | appointment/prescription/message |

---

## 5. Non-Functional Requirements

### 5.1 Performance
| Requirement ID | Description |
|----------------|-------------|
| PERF-001 | Application shall load within 3 seconds |
| PERF-002 | User interactions shall respond within 1 second |
| PERF-003 | Application shall handle 100+ concurrent users |

### 5.2 Usability
| Requirement ID | Description |
|----------------|-------------|
| USE-001 | Interface shall be intuitive and easy to navigate |
| USE-002 | All buttons and links shall have clear labels |
| USE-003 | Error messages shall be descriptive and helpful |
| USE-004 | Application shall work on mobile devices (responsive) |

### 5.3 Reliability
| Requirement ID | Description |
|----------------|-------------|
| REL-001 | Data shall persist in localStorage |
| REL-002 | Application shall handle missing/null data gracefully |
| REL-003 | Session timeout shall be handled appropriately |

### 5.4 Security
| Requirement ID | Description |
|----------------|-------------|
| SEC-001 | Passwords shall not be stored in plain text (simulated) |
| SEC-002 | Role-based access shall prevent unauthorized dashboard access |
| SEC-003 | User data shall be validated before storage |

### 5.5 Maintainability
| Requirement ID | Description |
|----------------|-------------|
| MAIN-001 | Code shall follow React.js best practices |
| MAIN-002 | Components shall be modular and reusable |
| MAIN-003 | Context API shall be used for global state management |

---

## 6. System Interfaces

### 6.1 User Interfaces
- Login Page
- Registration Page
- Patient Dashboard
- Doctor Dashboard
- Nurse Dashboard
- Admin Dashboard
- Messages Page
- Reviews Page

### 6.2 Component Interfaces
- Navigation Bar
- Sidebar Menu
- Dashboard Cards
- Appointment Tables
- Medical Record Cards
- Prescription Forms
- Message Chat Interface
- Review Forms
- Modal Dialogs

---

## 7. Acceptance Criteria

### 7.1 Authentication
- [ ] User can register with email and password
- [ ] User can select role during registration
- [ ] User can login with valid credentials
- [ ] Invalid login shows error message
- [ ] User is redirected to role-specific dashboard after login
- [ ] User can logout successfully

### 7.2 Patient Features
- [ ] Patient can view dashboard with statistics
- [ ] Patient can book appointments with providers
- [ ] Patient can view and cancel appointments
- [ ] Patient can view medical records
- [ ] Patient can view prescriptions
- [ ] Patient can search and filter doctors
- [ ] Patient can send messages to providers
- [ ] Patient can write reviews for providers
- [ ] Patient can edit profile information

### 7.3 Doctor Features
- [ ] Doctor can view dashboard with today's schedule
- [ ] Doctor can accept/decline appointment requests
- [ ] Doctor can create medical records
- [ ] Doctor can create prescriptions with medications
- [ ] Doctor can view patient information
- [ ] Doctor can message patients

### 7.4 Nurse Features
- [ ] Nurse can view dashboard with today's visits
- [ ] Nurse can accept/decline visit requests
- [ ] Nurse can start and complete visits
- [ ] Nurse can view patient information
- [ ] Nurse can message patients

### 7.5 Admin Features
- [ ] Admin can view system statistics
- [ ] Admin can view and manage all users
- [ ] Admin can view all appointments
- [ ] Admin can manage services (CRUD)
- [ ] Admin can verify provider licenses
- [ ] Admin can view and generate reports
- [ ] Admin can access system settings

### 7.6 Common Features
- [ ] Messages can be sent between users
- [ ] Notifications are generated for key actions
- [ ] Users can mark notifications as read
- [ ] Data persists across browser sessions

---

## 8. Appendix

### 8.1 Technology Stack
- **Frontend Framework**: React.js 18+
- **Routing**: React Router DOM v6
- **State Management**: React Context API
- **Styling**: CSS3 (custom stylesheets)
- **Data Persistence**: LocalStorage
- **Build Tool**: Vite
- **Language**: JavaScript (ES6+)

### 8.2 Project Structure
```
src/
├── App.jsx                 # Main application component
├── main.jsx                # Entry point
├── context/
│   └── AppContext.jsx      # Global state management
├── components/
│   └── Navbar.jsx          # Navigation component
├── pages/
│   ├── Home.jsx            # Landing page
│   ├── About.jsx           # About page
│   ├── Services.jsx        # Services page
│   ├── Contact.jsx         # Contact page
│   ├── Login.jsx           # Login page
│   ├── Register.jsx        # Registration page
│   ├── PatientDashboard.jsx
│   ├── DoctorDashboard.jsx
│   ├── NurseDashboard.jsx
│   ├── AdminDashboard.jsx
│   ├── Messages.jsx
│   └── Reviews.jsx
└── assets/
```

### 8.3 Service Types
| Service | Category | Price | Duration |
|---------|----------|-------|----------|
| General Consultation | Doctor | $50 | 30 min |
| Nursing Care | Nurse | $40 | 45 min |
| Physical Therapy | Therapist | $60 | 60 min |
| Medical Tests | Lab | $30 | 15 min |
| Elderly Care | Nurse | $80 | 60 min |
| Post-Surgery Care | Nurse | $70 | 60 min |

---

**Document Version**: 1.0  
**Date**: 2026  
**Author**: HomeCare Development Team
