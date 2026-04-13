# Role-Based Redirect Plan

**Tables**: `users` table with `role` column

**Flow**:
1. Login (Supabase auth)
2. Get user ID
3. Fetch `users` row WHERE supabase_user_id = auth.uid()
4. Read `role` 
5. Redirect `/dashboard/${role}`

**Current Routes** (App.jsx):
- /dashboard/patient
- /dashboard/doctor
- /dashboard/nurse
- /dashboard/admin

**Files to update**:
1. Login.jsx - handleSupabaseLogin()
2. ProtectedRoute.jsx - use Supabase role
3. AppContext.jsx - sync role

## 1. UPDATE Login.jsx

Replace local login with:

```js
const handleSubmit = async (e) => {
  e.preventDefault();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) {
    setError(error.message);
  } else {
    // Fetch role from users table
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_user_id', data.user.id)
      .single();
      
    const rolePath = profile?.role ? `/dashboard/${profile.role}` : '/dashboard/patient';
    navigate(rolePath);
  }
};
```

**Google login**:
```js
// After successful Google login, use session from redirect
supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('supabase_user_id', data.session.user.id)
      .single();
    navigate(`/dashboard/${profile.role}` || '/dashboard/patient');
  }
});
```

## 2. ProtectedRoute.jsx Update

```js
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser } = useApp();
  
  // Fetch fresh role if needed
  useEffect(() => {
    // Sync role from Supabase
  }, []);

  // Rest stays same
};
```

## 3. Route Guards in App.jsx

Wrap dashboards:
```jsx
<Route path="/dashboard/doctor" element={
  <ProtectedRoute allowedRoles={['doctor']}>
    <DoctorDashboard />
  </ProtectedRoute>
} />
```

**Ready to implement!**
