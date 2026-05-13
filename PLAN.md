# MediCore HMS — Rebuild Plan

TypeScript MERN Stack rebuild of the Hospital Management System.

**Stack:** Node.js + Express + TypeScript + MongoDB (Mongoose) + React 18 + Redux Toolkit + TailwindCSS + shadcn/ui + Socket.io + Zod

**Architecture:** Module-based backend (`schema → service → controller → router`), shared RBAC via `authorize.ts` permission matrix, MongoMemoryServer integration tests with supertest, React Query v5 frontend.

---

## Progress Overview

| Phase | Module | Backend | Frontend | Tests | Status |
|-------|--------|---------|----------|-------|--------|
| 0 | Pre-Migration & Foundation | ✅ | — | ✅ | Done |
| 1 | Auth & JWT | ✅ | ✅ | ✅ | Done |
| 2 | Core Models & Staff | ✅ | ✅ | ✅ | Done |
| 3 | Appointments | ✅ | ✅ | ✅ | Done |
| 4 | Billing | ✅ | ✅ | ✅ | Done |
| 5 | Lab & Diagnostics | ✅ | ✅ | ✅ | Done |
| 6 | Pharmacy | ✅ | ✅ | ✅ | Done |
| 7 | Inventory | ✅ | ✅ | ✅ | Done |
| 8 | Documents | ✅ | ✅ | ✅ | Done |
| 9 | Analytics & Settings | ✅ | ✅ | ✅ | Done |

**Tests:** 198 passing across 13 suites (as of Phase 9)

---

## Phase 0 — Pre-Migration & Foundation ✅

- [x] Consolidate auth — merge `doctors`, `nurses`, `users` collections into single `users` collection with `role` field
- [x] Delete legacy always-true auth middleware (`checkAccess.js`, `checkAdmin.js`)
- [x] Delete legacy `communication.js` (superseded by Notification model)
- [x] TypeScript backend scaffold (`tsconfig.json`, strict mode, path aliases)
- [x] Frontend TypeScript + Vite config
- [x] Docker multi-stage builds (backend + frontend)
- [x] Express app bootstrap: Helmet CSP, CORS from env, Redis rate limiter
- [x] Socket.io with JWT handshake, Redis adapter, `user:{id}` rooms, role rooms
- [x] AuditLog model (append-only, actorId, resourceType, before/after diffs)
- [x] Migration script `001-consolidate-auth.ts`
- [x] `.gitignore` with `.worktrees/` and `.superpowers/` exclusions

---

## Phase 1 — Auth & JWT ✅

- [x] `User` model — single collection, roles: `admin | doctor | nurse | receptionist | patient`
- [x] `RefreshToken` model — family invalidation (rotate on use, invalidate family on reuse)
- [x] Auth routes: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- [x] `authenticate` middleware — JWT Bearer token validation, attaches `req.user`
- [x] `authorize` middleware — RBAC permission matrix (`resource × role → Permission`)
- [x] Auth integration tests (register, login, refresh, logout, token reuse attack)
- [x] Frontend: login/register pages, Redux auth slice, `ProtectedRoute` component
- [x] Frontend: JWT refresh interceptor, persistent auth via `localStorage`

---

## Phase 2 — Core Models & Staff ✅

- [x] `Patient` model — refs `User`, medical history, blood type, allergies
- [x] `Doctor` model — refs `User`, specialization, license number, department
- [x] `Nurse` model — refs `User`, ward, shift
- [x] `Receptionist` model — refs `User`
- [x] `Department` model
- [x] Staff CRUD routes (`/staff/doctors`, `/staff/nurses`, `/staff/receptionists`)
- [x] Patient routes (`/patients`)
- [x] Staff & patient integration tests
- [x] Frontend: admin staff management pages (list, create, edit)
- [x] Frontend: patient profile page
- [x] Sidebar navigation with role-based visibility

---

## Phase 3 — Appointments ✅

- [x] `Appointment` model — patient/doctor refs, datetime, status lifecycle (`pending → confirmed → completed | cancelled | no_show`)
- [x] Conflict prevention — no double-booking same doctor same slot
- [x] Appointment routes: create, list (with filters), get by id, update status, cancel
- [x] RBAC: patient `own-rw`, doctor `own-rw`, receptionist `read+write`, admin `all`
- [x] Scheduled job — auto-promote past confirmed appointments to `no_show`
- [x] Socket.io notification on appointment status change
- [x] Appointment integration tests (13 tests)
- [x] Frontend: patient appointment booking & list page
- [x] Frontend: doctor appointment management page
- [x] Frontend: admin/receptionist appointment management page

---

## Phase 4 — Billing ✅

- [x] `Invoice` model — `INV-XXXX` auto-ID, line items, tax/discount/total computed pre-save, payments array, status lifecycle (`draft → issued → partial | paid | overdue | void`)
- [x] Pre-save hook: computes subtotal, tax, total, amountPaid, balance; auto-updates status
- [x] Billing routes: create draft, list, get, issue, record payment, void
- [x] RBAC: receptionist `read+write`, admin `all` (issue/void admin-only), patient `own-read`
- [x] Billing integration tests (13 tests)
- [x] Frontend types (`frontend/src/types/billing.ts`)
- [x] Frontend: patient billing list + invoice detail pages
- [x] Frontend: admin/receptionist billing management page (create, issue, pay, void dialogs)
- [x] `StatusBadge` component extended with billing statuses
- [x] Sidebar: split billing nav by role

---

## Phase 5 — Lab & Diagnostics ✅

- [x] `LabOrder` model — `LAB-XXXX` auto-ID, patient/doctor refs, tests array (name/code/status per test), priority (`routine | urgent | stat`), order status lifecycle
- [x] `LabResult` model — 1 per order (unique), results array (value/unit/referenceRange/isNormal), technician ref, verifiedBy Doctor ref, status (`preliminary | final | amended`), reportUrl
- [x] Status transition guard — terminal states (`completed`, `cancelled`) cannot be reversed
- [x] Lab routes: create order, list orders, get order, update status, enter results, get results, verify result
- [x] RBAC: doctor `read+write`, nurse `read`, admin `all`, patient `own-read`, receptionist `false`
- [x] Lab integration tests (16 tests)
- [x] Frontend types (`frontend/src/types/lab.ts`)
- [x] Frontend: patient lab results list + detail pages
- [x] Frontend: doctor lab orders page (create, inline detail, verify result)
- [x] Frontend: admin lab management page (create order, update status, enter results)
- [x] Nurse access to lab management via dedicated route
- [x] `StatusBadge` extended with lab statuses

---

## Phase 6 — Pharmacy ⬜

- [ ] `Prescription` model — refs Patient, Doctor, Appointment; line items (drug, dosage, frequency, duration); status (`draft | active | dispensed | cancelled`)
- [ ] `Drug` model — name, code, category, unit, stock quantity, reorder level
- [ ] Prescription routes: create, list, get, activate, dispense, cancel
- [ ] RBAC: doctor `read+write` (create/activate), nurse `dispense`, admin `all`, patient `own-read`, receptionist `false`
- [ ] Dispense flow — deducts from drug stock, records dispensedBy nurse
- [ ] Low-stock Socket.io alert when stock drops below reorder level
- [ ] Prescription integration tests
- [ ] Frontend: doctor prescription writing page
- [ ] Frontend: nurse dispensing queue page
- [ ] Frontend: patient prescription history page
- [ ] Frontend: admin pharmacy management (drugs, prescriptions)

---

## Phase 7 — Inventory ⬜

- [ ] `InventoryItem` model — name, code, category, quantity, unit, reorderLevel, expiryDate, supplier
- [ ] `StockMovement` model — item ref, type (`in | out | adjustment | waste`), quantity, reason, performedBy
- [ ] Inventory routes: create item, list, get, update stock (receive/consume/adjust), list movements
- [ ] RBAC: admin `all`, nurse `read`, others `false`
- [ ] Reorder alert — Socket.io emit when quantity drops below reorderLevel
- [ ] Expiry alert — scheduled job flags items expiring within 30 days
- [ ] Inventory integration tests
- [ ] Frontend: admin inventory management page (items list, receive stock, adjustments)
- [ ] Frontend: nurse inventory view (read-only)

---

## Phase 8 — Documents & Certificates ⬜

- [ ] `Document` model — type (`medical_certificate | discharge_summary | referral | lab_report`), patient ref, issuedBy Doctor, content/templateData, pdfUrl, status (`draft | issued | void`)
- [ ] PDF generation — Puppeteer or `pdf-lib` from templates
- [ ] Email delivery — Nodemailer sends PDF to patient email on issue
- [ ] Document routes: create draft, issue (generates PDF + sends email), void, list, get
- [ ] RBAC: doctor `issue+void+read`, admin `all`, patient `own-read`
- [ ] Document integration tests
- [ ] Frontend: doctor document creation & issuance page
- [ ] Frontend: patient document download page
- [ ] Frontend: admin document management page
- [ ] Certificate template (HTML → PDF via Puppeteer)

---

## Phase 9 — Analytics & Settings ⬜

- [ ] Analytics endpoints — aggregation pipelines for:
  - [ ] Appointment volume by day/week/month, by doctor, by status
  - [ ] Revenue by month (invoices), outstanding balance, payment method breakdown
  - [ ] Lab order volume by priority and test type
  - [ ] Prescription fill rates, drug consumption trends
  - [ ] Bed/ward occupancy (if ward model added)
- [ ] Settings routes — hospital name, address, logo URL, default tax rate, working hours
- [ ] `Settings` model (singleton document)
- [ ] Analytics integration tests
- [ ] Frontend: admin analytics dashboard (charts via Recharts or Chart.js)
  - [ ] Revenue chart (line/bar)
  - [ ] Appointment heatmap/calendar view
  - [ ] Top doctors by appointments
  - [ ] Lab turnaround time metrics
- [ ] Frontend: settings page (admin only)
- [ ] Role-specific dashboard home pages (doctor, nurse, patient, receptionist)

---

## Infrastructure & Cross-Cutting (ongoing)

- [x] `authorize.ts` RBAC matrix — all current resources configured
- [x] `errorHandler.ts` — `NotFoundError`, `ValidationError`, `ForbiddenError`, `ConflictError`
- [x] `requestLogger.ts` — Winston request logging
- [x] `auditLog.ts` middleware
- [x] `rateLimiter.ts` — express-rate-limit
- [x] MongoMemoryServer test harness pattern (mocks: rateLimiter, requestLogger, socket)
- [ ] GitHub Actions CI/CD pipeline (lint → typecheck → test → docker build → Trivy scan)
- [ ] Docker Compose for local dev (MongoDB, Redis, backend, frontend)
- [ ] Environment variable documentation (`.env.example`)
- [ ] E2E tests (Playwright or Cypress) — post-Phase 9
- [ ] Production deployment (Railway / Render / AWS ECS)
