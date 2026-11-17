# Primo technical case

Thanks for taking the time to do this case with us.

At [Primo](https://www.getprimo.com) most code is now written by AI agents, driven by engineers.
So this case is **not** a test of how fast you type code. We expect you to use AI tools
(Claude Code, Cursor, Codex, Copilot, whatever you like) as much as you want. What we look at is
how you work with them: how you understand the problem, how you steer the agent, how you check
what it produced, and what you decide to ship.

This repository is **mini-Primo**: a very small version of our product. Companies (our customers)
have employees, employees have laptops, and an MDM reports on those laptops every day.

## How it works

1. **Before your slot (not timed).** Set up this repository and check it runs (below). If anything
   fails, tell us: we fix setup problems, they never count against you.
2. **You pick a 3-hour slot.** At the start of your slot we email you the brief: a feature to build
   in this codebase.
3. **3 hours later** you send us your work (see [What to send](#what-to-send)). A few minutes late
   is fine. Stop at 3 hours even if you are not done: an unfinished feature with clear notes
   beats a finished one nobody can trust.
4. **A 1-hour call a few days later.** You walk us through what you did. We also do a short
   exercise together, live, with your usual AI tools. Bring your laptop with this repository set up.

## Setup

You need Node.js 22 or later and git.

```bash
git clone <this repository> primo-technical-case
cd primo-technical-case
npm install
npm run check   # typecheck + tests, should be green
npm run dev     # API on http://localhost:4000, web app on http://localhost:5173
```

Open http://localhost:5173: you should see the Devices page of Acme Robotics. The selector in the
header lets you act as any user. `npm run reset` wipes the local data, which is seeded again on
the next start.

Read [AGENTS.md](AGENTS.md): it is the guide your AI agent should read too.

## What to send

Run `npm run submit` and reply to the brief's email with the archive it creates. It contains:

- **Your code**, with its git history. Commit as you go: we read the commits.
- **`NOTES.md`** at the root, written by you, not by the agent. A page is enough:
  - the questions you would have asked us, and the assumptions you made instead;
  - what you built, and what you decided not to build;
  - how you checked that it works, and what you have **not** checked;
  - what you would do next with another day.
- **`transcripts/`**: the export of your AI sessions (Claude Code: `/export`; Cursor or others:
  copy or export the chat). We read them to understand how you work, not to judge your prompts'
  style. If your tool cannot export, a few screenshots are fine.

## Rules

- Any tool, any AI, any documentation. No help from another person.
- Do not publish your solution (no public fork, no public pull request).
- If something in the brief is unclear, decide, write your assumption in `NOTES.md`, and go on.
  We will not answer questions during the 3 hours: that is part of the exercise.
