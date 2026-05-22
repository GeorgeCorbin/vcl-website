/**
 * Feature flags — flip these to enable/disable features across the app.
 *
 * When a flag is false the corresponding UI is hidden but all backend
 * code, DB models, and admin actions are preserved so the feature can
 * be re-enabled by setting the flag back to true.
 * 
 * false = off / hidden
 * true = on / visible
 */
export const FEATURES = {
  /** Media polls/rankings — public routes/nav and admin polls section */
  MEDIA_POLLS: false,

  /** Player transfer tracker — public nav/home card and admin sidebar */
  TRANSFERS: false,

  /** Ad Management section in admin sidebar (create/edit ad units in the DB) */
  ADS_ADMIN: false,

  /** Render ad slots on public-facing pages */
  ADS_PUBLIC: true,
} as const;
