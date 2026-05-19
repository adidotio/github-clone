// This is the code if you are using cookie and auth from supabase so not required if we have JWT and other cookie management system
// const { createServerClient, parseCookieHeader, serializeCookieHeader } = require('@supabase/ssr')cd 

// exports.createClient = (context) => {
//   return createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
//     cookies: {
//       getAll() {
//         return parseCookieHeader(context.req.headers.cookie ?? '')
//       },
//       setAll(cookiesToSet, headers) {
//         cookiesToSet.forEach(({ name, value }) =>
//           context.res.appendHeader('Set-Cookie', serializeCookieHeader(name, value))
//         )
//         Object.entries(headers).forEach(([key, value]) => context.res.setHeader(key, value))
//       },
//     },
//   })
// }

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabaseClient = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = supabaseClient;