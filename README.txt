SAN DIEGO ELEMENTARY SCHOOL CAMPUS MAP — MOBILE TREBEDIT + HOSTED DATABASE

THIS VERSION IS DESIGNED FOR A PHONE
- The front end remains index.html + style.css + script.js.
- config.js holds the Supabase project URL and publishable/anon key.
- No Node.js server, npm, terminal, or local database is needed on your phone.
- Supabase hosts the database and login service online. Multiple devices can see the same records.
- The phone must have an internet connection.

FILES
- index.html: all HTML markup, login, map, building screens, flowchart, classroom popup.
- style.css: layout, school identity, responsive design, and animations.
- script.js: campus interactions and Supabase API adapter.
- config.js: REQUIRED connection values for your own Supabase project.
- supabase-setup.sql: database tables and Row Level Security rules.
- create-user-profiles-template.sql: assigns Admin and Viewer roles to accounts created in Supabase Auth.
- assets/: school logo and eight floor-plan images.

PART A — CREATE THE ONLINE DATABASE (one time)
1. On your phone, open https://supabase.com in a browser and create/sign into an account.
2. Create a new Supabase project. Save the database password somewhere private; you do not need to put it in this app.
3. In your project, open SQL Editor > New query.
4. Open the supplied supabase-setup.sql in TrebEdit, copy all of it, paste into Supabase SQL Editor, then press Run.
5. Confirm the query completed successfully and created public.profiles and public.classroom_records.

PART B — CREATE THE ADMIN AND VIEWER ACCOUNTS
1. In the Supabase Dashboard open Authentication > Users > Add user / Create user.
2. Create the Admin account using an email address and password you control. Ensure the user is confirmed/active according to the options in the dashboard.
3. Create a separate Viewer account with its own email and password.
4. Open create-user-profiles-template.sql in TrebEdit. Replace admin@example.com and viewer@example.com with the exact email addresses above. Keep the role labels as shown: Admin gets 'admin'; Viewer gets 'user'.
5. Run the edited SQL in Supabase SQL Editor.
6. Check the last SELECT output. It must show one intended Admin row and one Viewer row. Do not share passwords in chat or place passwords in SQL files.

PART C — CONNECT TREBEDIT
1. In Supabase Dashboard, open Project Settings / API (the precise menu label may change).
2. Copy the Project URL and the publishable key (preferred) or legacy anon key.
   IMPORTANT: Never use a service_role key, secret key, database password, or Postgres connection string in this front-end.
3. In TrebEdit open config.js.
4. Change url to your project URL, for example https://abcdefghijk.supabase.co
5. Change publishableKey to the publishable/anon key from your own project.
6. Save all files and keep the assets folder beside index.html.
7. Open index.html using TrebEdit Preview. Sign in with the exact email/password of your created account.

IF TREBEDIT PREVIEW CANNOT CONNECT
Some Android WebView/file previews restrict network access from a local file URL. First confirm the URL/key are correct and mobile data/Wi-Fi is working. If the error specifically mentions CORS, an opaque/null origin, or failed fetch, the app's code cannot remove that browser restriction. You will need to serve the same static files from a normal HTTPS web address (for example, a static host) while continuing to edit them in TrebEdit. Supabase itself is hosted; you do NOT need to run Node.js on your phone.

HOW THE ROLES WORK
- Supabase Auth checks the email/password.
- The public.profiles table assigns each authenticated account its role.
- User/Viewer can read classroom records but has no database insert/update rights.
- Admin can insert/update records via Row Level Security policies.
- Role enforcement is in PostgreSQL RLS, not only hidden buttons.
- Account roles must be managed from the Supabase dashboard/SQL Editor; the public app does not let users promote themselves.

DATA
- Teacher profiles: separate morning and afternoon schedules.
- Inventory: supplied 14 classroom item types, School Provided, Personal, Classroom Project, Remarks.
- Books: per-classroom Title, Author/Subject, Quantity.
- Each room's data is stored as a JSON record in public.classroom_records and shared to authenticated users.
- No real teacher/book/inventory data is seeded. Records are empty until Admin saves them.
- The local/SQLite version's data is not automatically copied to Supabase. Export/enter any records you need before changing over.

TEST CHECKLIST
1. Enter the real project URL and publishable/anon key in config.js.
2. Sign in as Admin; select a numbered room; save teacher fields, inventory values, and a book.
3. Reload the app and confirm saved values remain.
4. Sign out and sign in as Viewer; confirm values can be read but edit controls are unavailable.
5. Verify database enforcement by signing in as Viewer and attempt an UPDATE/INSERT in the Supabase API or SQL test client with that user's token; it must be denied by RLS. A hidden button alone is not a security test.
6. Sign in from a second device with the same online project and confirm the record is visible.

SECURITY NOTES
- config.js contains only the Supabase publishable/anon key. This key is intended for the front end, but is safe only because RLS is enabled and the policies are configured correctly.
- Never expose a Supabase service_role/secret key in config.js or any client-side file; it bypasses RLS.
- Use unique, strong passwords. Sign out on shared phones.
- This package is a static client with database rules, not a formal security audit. Before entering real student/teacher-sensitive data, get school approval and confirm privacy, retention, backups, and account recovery arrangements.
- All signed-in accounts can view all saved classroom records by design; the Viewer restriction is read-only, not classroom-by-classroom data isolation.

TROUBLESHOOTING
- "Database setup needed": config.js still has placeholders or the URL/key were copied incorrectly.
- "Account has no school role assigned": create the user's matching row in public.profiles using the provided SQL template.
- Invalid login: check that email/password and account confirmation are correct in Supabase Auth.
- Viewer cannot save: expected; RLS intentionally denies writes.
- Failed fetch/CORS: check TrebEdit Preview origin restrictions; serve the static files from HTTPS if the WebView blocks file-origin requests.
