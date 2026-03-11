/* ============================================================
   GOLD SHOP — config.js
   Environment-specific configuration.
   Must be loaded BEFORE api.js and app.js.

   To add a new environment, add an entry to ENVIRONMENTS below.
   The active environment is selected by matching window.location.hostname.
   ============================================================ */

'use strict';

(function () {
  const ENVIRONMENTS = {
    local: {
      hostnames: ['localhost', '127.0.0.1'],
      API_BASE:      'http://localhost:8000',
      WHATSAPP_NUMBER: '',   // leave empty to open WhatsApp without pre-selecting a number
    },

    production: {
      hostnames: [],         // catch-all — used when no other env matches
      API_BASE:      'https://your-app.onrender.com',   // ← update before deploying
      WHATSAPP_NUMBER: '',   // e.g. '15551234567' (digits only, no + or spaces)
    },
  };

  /* ── Resolve active environment ──────────────────────────── */

  const hostname = window.location.hostname;
  let active = ENVIRONMENTS.production; // default

  for (const env of Object.values(ENVIRONMENTS)) {
    if (env.hostnames.includes(hostname)) {
      active = env;
      break;
    }
  }

  /* ── Expose as a global so api.js and app.js can read it ─── */

  window.APP_CONFIG = {
    API_BASE:        active.API_BASE,
    WHATSAPP_NUMBER: active.WHATSAPP_NUMBER,
  };

  // Uncomment to debug which environment was selected:
  // console.info('[config] Environment:', active.API_BASE);
})();
