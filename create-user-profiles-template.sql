-- Run only AFTER creating both users in Supabase Dashboard > Authentication > Users.
-- Replace these email addresses with the exact addresses you created before running.
-- This grants Admin only to the first named account, and Viewer role to the second.

insert into public.profiles (id, email, username, role)
select id, email, 'admin', 'admin'
from auth.users
where lower(email) = lower('admin@example.com')
on conflict (id) do update
set email = excluded.email, username = excluded.username, role = excluded.role;

insert into public.profiles (id, email, username, role)
select id, email, 'viewer', 'user'
from auth.users
where lower(email) = lower('viewer@example.com')
on conflict (id) do update
set email = excluded.email, username = excluded.username, role = excluded.role;

-- Verify the two role rows were created. This query is for the SQL Editor (owner access).
select email, username, role from public.profiles order by role, username;
