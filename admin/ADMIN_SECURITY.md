# Admin Panel Security Checklist

## 1. Authentication & RBAC
- [ ] **Auth Enforcement**: All admin routes are protected by Middleware and `requireAdminRole` checks.
- [ ] **Service Role Safety**: The `SUPABASE_SERVICE_ROLE_KEY` is **only** used in server-side code (`utils/supabase/admin.ts`).
- [ ] **Role Hierarchy**: Verified that lower-tier roles (Support/Analyst) cannot access higher-tier functions (Delete/Ban).
- [ ] **Identity Verification**: Admin actions verify the user identity against `admin_users` table before execution.

## 2. Data Access (RLS)
- [ ] **Admin Tables**: `admin_users` and `admin_audit_logs` have strict RLS policies.
- [ ] **Public Tables**: `profiles` and `recipes` are protected; Admins bypass via Service Role only for specific, audited actions.
- [ ] **Leak Prevention**: Admin emails/roles are not exposed to public users.

## 3. Audit Logging
- [ ] **Completeness**: All mutations (Create/Update/Delete) generate an audit log entry.
- [ ] **Traceability**: Logs include `admin_id`, `action`, `entity_id`, and snapshot of `role`.
- [ ] **Immutability**: RLS prevents modification/deletion of audit logs (except maybe by Owner directly in SQL).

## 4. Frontend Security
- [ ] **No Secrets**: Verified `NEXT_PUBLIC_` env vars do not contain service keys.
- [ ] **Input Validation**: All Server Actions validate input types (e.g., using Zod) before processing.
- [ ] **Rate Limiting**: (Recommended) Implement rate limiting on sensitive actions like `bulkDelete`.

## 5. Deployment
- [ ] **Environment Variables**: Ensure `SUPABASE_SERVICE_ROLE_KEY` is set in Vercel/Production environment.
- [ ] **Database Migrations**: Run `supabase_admin_rbac.sql` before deploying the updated Admin App.
