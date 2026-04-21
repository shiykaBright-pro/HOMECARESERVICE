# User Profile System Setup

## Overview
The Profile system allows users to view and update their personal and professional information, integrated with Supabase for data persistence.

## Features
- View and edit user profile information
- Role-based fields (license/specialty for doctors/nurses)
- Supabase integration for data storage
- Real-time updates to user context
- Form validation and error handling

## Setup Instructions

### 1. Create Supabase Table
Run the SQL script `supabase-profile-setup.sql` in your Supabase SQL Editor to create the profiles table with proper RLS policies.

### 2. Files Created/Modified
- `src/pages/Profile.jsx` - Main profile page component
- `src/App.jsx` - Added Profile route
- `src/components/Navbar.jsx` - Added Profile link to user dropdown
- `src/pages/PatientDashboard.jsx` - Updated sidebar link
- `src/pages/Dashboard.css` - Added profile-specific styles
- `supabase-profile-setup.sql` - SQL setup script

### 3. Supabase Configuration
The profile system uses the existing Supabase client configuration. Make sure your environment variables are set:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 4. Navigation
Users can access their profile via:
- Navbar user dropdown → "Profile"
- Dashboard sidebar → "My Profile" (redirects to dedicated page)

## Usage
1. Users log in and navigate to their profile
2. Profile data loads from Supabase (falls back to currentUser if not found)
3. Users can edit their information and save changes
4. Data is stored in Supabase and synced with the app context

## Security
- Row Level Security (RLS) ensures users can only access their own profiles
- Authentication required to access profile page
- Form validation prevents invalid data submission