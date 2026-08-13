# Rohtak Public School — Student Management System (Demo)

A simple, no-build student management system: plain HTML/CSS/JS on the frontend,
[Supabase](https://supabase.com) for auth + database. Deploy the static files
on Cloudflare Pages.

## What's included

- **Login** (`index.html`) — staff sign-in via Supabase Auth
- **Dashboard** (`dashboard.html`) — quick stats (students, classes, today's attendance)
- **Students** (`students.html`) — add / edit / delete / search / filter by class
- **Attendance** (`attendance.html`) — mark present/absent per class, per date
- **Marks & Results** (`marks.html`) — record exam marks per student/subject

No frameworks, no build step — every page is plain HTML with a `<script>` tag,
so it can be uploaded to GitHub and deployed as-is.

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → paste the contents of `supabase-schema.sql` → **Run**.
   This creates the `classes`, `students`, `attendance`, and `marks` tables,
   turns on Row Level Security, and seeds a few demo classes.
3. Go to **Authentication → Users → Add user** and create a staff login
   (email + password). This is what you'll use to sign in to the site —
   there's no public sign-up form, staff accounts are created by hand.
4. Go to **Settings → API** and copy your **Project URL** and **anon public** key.

## 2. Connect the frontend

Open `js/supabase-config.js` and replace the two placeholders:

```js
const SUPABASE_URL = "https://YOUR-PROJECT-REF.supabase.co";
const SUPABASE_ANON_KEY = "YOUR-ANON-PUBLIC-KEY";
```

The anon key is safe to expose in frontend code — it only works within the
Row Level Security rules set up by the SQL script (signed-in users only).

## 3. Push to GitHub

```bash
cd school-sms
git init
git add .
git commit -m "Initial commit — student management system"
git branch -M main
git remote add origin https://github.com/deepakbhandari135/YOUR-REPO-NAME.git
git push -u origin main
```

## 4. Deploy on Cloudflare Pages

1. Cloudflare dashboard → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick your GitHub repo.
3. Build settings: **Framework preset: None**, **Build command: (leave empty)**,
   **Build output directory: /** (project root).
4. Deploy. Cloudflare gives you a `*.pages.dev` URL immediately; add a custom
   domain later from the same project's **Custom domains** tab.

No environment variables are needed on Cloudflare — the Supabase URL/key live
directly in `js/supabase-config.js`.

## Folder structure

```
school-sms/
├── index.html          # login
├── dashboard.html
├── students.html
├── attendance.html
├── marks.html
├── css/style.css
├── js/
│   ├── supabase-config.js   # ← add your project URL + anon key here
│   ├── auth.js
│   ├── dashboard.js
│   ├── students.js
│   ├── attendance.js
│   └── marks.js
├── supabase-schema.sql      # run once in Supabase SQL editor
└── README.md
```

## Extending it later

- Add a `role` column and separate teacher/student/parent logins
- Add fee tracking, timetable, or ID-card generation
- Add file uploads (student photos) via Supabase Storage
- Add row-level policies scoped to a teacher's own class instead of
  "any authenticated user can edit everything" (fine for a single-admin demo)
