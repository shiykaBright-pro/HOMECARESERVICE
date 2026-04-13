# Prescription Feature Implementation TODO

## Completed: [ ]
## In Progress: [ ]
## Pending:

1. ✅ [DONE] Create TODO.md with plan steps
2. ✅ [DONE] Update AppContext.jsx: Align initialPrescriptions & addPrescription() to exact fields (provider_id, patient_id, medication, dosage, instructions, created_at auto)
3. ✅ [DONE] Update DoctorDashboard.jsx: Simplify form to single med row, add full validation, map to new model
4. ✅ Add to NurseDashboard.jsx: Copy prescription form from Doctor, add buttons/modals 
5. ✅ Update PatientDashboard.jsx: Enhance prescription list/view modal for new fields
6. ✅ Add role guards: Explicit checks before forms (doctor/nurse only)
7. ✅ Test: Doctor/Nurse create → Patient views
8. [ ] Complete
import AuthRoute from "./components/AuthRoute";
