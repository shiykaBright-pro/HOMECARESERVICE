# Admin Dashboard Enhancement TODO

## Plan Breakdown (Approved ✅)
**Approved adjustments:** CSV downloads, simple forms, local state, lightweight toasts, no new deps, responsive focus.

**Status: 1/12 steps complete** ✅

**Completed:** Created TODO-ADMIN-DASHBOARD.md

## Steps:

### Phase 1: State & Reusable Components ✓ COMPLETE

1. [x] Add new states: `editingItem`, `settings`, `toast` ✅  
2. [x] Create reusable `FormModal` component ✅  
3. [x] Create `Toast` component ✅  
12. [x] Update Dashboard.css: Toast styles, responsive forms/modals/tables ✅  

**Status: 5/12 steps complete**

### Phase 2: Reports Functionality ✓ COMPLETE

4. [x] Implement `handleGenerateReport`: FormModal with title/type/date inputs, validation, add to reports[], toast success. ✅  
5. [x] Implement `handleDownloadReport`: Generate CSV Blob (mock data per type), createObjectURL + download link. ✅  
6. [x] Enhance `handleViewReport` modal with mock detailed table/content. ✅  

**Status: 8/12 steps complete**

### Phase 3: Settings (Steps 7-8)
7. [ ] Implement `handleConfigureSettings(type)`: FormModal per category, save to settings{}, reflect in UI (sidebar title).  
8. [ ] Add dynamic UI updates using settings state (e.g. appName).

### Phase 4: Edit Forms (Steps 9-11)
9. [ ] Implement `handleEditAppointment`: Set editingItem, FormModal with fields, update appointments[].  
10. [ ] Implement `handleEditUser`: Similar for users[], conditional fields for providers.  
11. [ ] Add validation (required fields, email/phone patterns), error toasts.

### Phase 5: Polish & CSS (Step 12)
12. [ ] Update Dashboard.css: Toast styles, responsive forms/modals/tables. Test mobile.

## Testing Commands:
```bash
cd HOMECARESERVICE && npm run dev
```
- Navigate to AdminDashboard → Test all buttons, forms, downloads, responsiveness (devtools mobile).

## Completion Criteria:
- All buttons functional (no alerts).
- Modals/forms responsive.
- Downloads work.
- Toasts show/hide properly.
- Existing features untouched.

**Next: Update this file after each phase/step completion.**

