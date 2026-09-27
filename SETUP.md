# Smart Task Scheduling & Alert System

React + Vite front end (`src/`) and a self-hosted Node API with SQLite (`server/`).
The design prototype stays in `project/` for reference.

## Run

    npm install
    npm run dev        # API on :3001 + web on http://localhost:5173

Production (one process serves the built site and the API):

    npm start          # http://127.0.0.1:3001   (HOST=0.0.0.0 to serve the LAN — put HTTPS in front)

Requires Node 22.13+ (uses the built-in `node:sqlite`). The API does not hot-reload: restart `npm run dev` after editing `server/`.

## First login

`admin` / `1234` — the system forces a new password immediately. Set `ADMIN_PASSWORD` before the very
first start to choose a different initial password. The admin creates every other account under
"จัดการผู้ใช้"; new and reset accounts must set their own password on first sign-in.

## Data

Everything lives in `server/data/` (override with `DATA_DIR`): `smart-schedule.db` and `files/` (attachments).
**Back this folder up.** Other env vars: `PORT`, `HOST`, `SESSION_IDLE_MIN` (server idle timeout, default 30).

## Security model

- Passwords hashed with scrypt; min 8 chars with letters + digits; 5 failed sign-ins lock that user/IP for 10 min
- Sessions expire after 30 min idle on the server; the browser also signs out after 15 min without activity
- Permissions are enforced on the server (assignee / secretary of a director / director sees team / admin has no schedule)
- Audit log (admin → "ประวัติการใช้งาน"): sign-ins, failures, task create/edit/cancel/delete (old → new values), RSVP answers, attachments, exports, account changes
- Cancelling a task requires a reason; the reason, who and when are kept on the task (`cancelLog`) and in the audit log, even if the task is reopened later
- Attachments: up to 15 MB and 10 files per task; executable types blocked; downloads require sign-in and access to the task

## Features added in round 2

| Feature | How it works |
| --- | --- |
| Overlap check | The create/edit form warns live when the slot overlaps the assignee's (and invited attendees') other tasks, including recurring ones. Attendees' tasks you cannot see show only "ไม่ว่าง". Saving or rescheduling asks for confirmation; it never blocks. |
| Meeting RSVP | Invited attendees see ตอบรับ / ปฏิเสธ (+ optional reason) in the task dialog; the organizer sees every answer. Moving the meeting time clears the answers. Lists show a "รอตอบรับ" flag. |
| External calendar | Settings → ปฏิทินภายนอก gives a private `.ics` subscription URL (Google Calendar: *Other calendars → From URL*; Outlook: *Subscribe from web*) plus a one-off `.ics` download. **One-way** (this system → calendar). Regenerating the link revokes the old one. Google can only reach it if the server is reachable from the internet. |
| Daily digest | Settings → สรุปงานประจำวัน: each user picks a time (default 07:30) and email and/or LINE. The server sends once per day (up to 2 h late if it was down). "บันทึกและส่งทดสอบตอนนี้" sends immediately. |
| Excel export | Reports → Export Excel (`.xlsx`: summary sheet + task list), scoped like the report and the same permissions. |

### Digest delivery needs credentials (set as environment variables before `npm start`)

Email (SMTP): `SMTP_HOST`, `SMTP_PORT` (587), `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
LINE: `LINE_CHANNEL_TOKEN` (Messaging API channel access token of the hospital's LINE Official Account). Each user needs the OA added as a friend and their **LINE User ID** (`U` + 32 hex chars) entered in settings. *LINE Notify was discontinued by LINE in March 2025, so the Messaging API is used instead.*
Until these are set, the settings page shows "เซิร์ฟเวอร์ยังไม่ได้ตั้งค่า…". For testing without real accounts set `MAIL_MODE=log` / `LINE_MODE=log` (messages are recorded instead of sent). `DISABLE_DIGEST_TIMER=1` turns the scheduler off.

## Status colours

Yellow = pending (ยังไม่ทำ), orange = in progress (กำลังทำ), green = completed (เสร็จแล้ว), grey = cancelled (ยกเลิก).

## Checks

    node server/smoke-test.mjs    # 100 API checks against a throwaway database

Layout: `src/App.jsx` state + logic, `src/api.js` HTTP client, `src/View.jsx` shell, `src/pages.jsx` screens,
`src/overlays.jsx` modals, `src/Login.jsx`, `src/ui.jsx` shared components, `server/index.js` core API,
`server/extras.js` conflicts / RSVP / calendar feed / digest / export.
