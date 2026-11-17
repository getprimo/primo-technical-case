// npm run submit — packs your work into one archive to send us.
// It contains the whole folder, .git included (we read your commits), without node_modules.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const warnings = [];

const status = spawnSync("git", ["status", "--porcelain"], {
  cwd: root,
  encoding: "utf8",
});
if (status.status !== 0)
  warnings.push(
    "this folder is not a git repository: we will not see your commits.",
  );
else if (status.stdout.trim())
  warnings.push(
    "you have uncommitted changes. They are included, but commit them if you can.",
  );

if (!existsSync(join(root, "NOTES.md")))
  warnings.push('NOTES.md is missing (see README, "What to send").');
const transcripts = join(root, "transcripts");
if (
  !existsSync(transcripts) ||
  readdirSync(transcripts).filter((f) => !f.startsWith(".")).length === 0
) {
  warnings.push(
    "transcripts/ is empty: export your AI sessions there (see README).",
  );
}

const stamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
const out = join(dirname(root), `primo-case-submission-${stamp}.tar.gz`);
const tar = spawnSync(
  "tar",
  [
    "-czf",
    out,
    "--exclude=node_modules",
    "--exclude=.data",
    "--exclude=dist",
    "-C",
    dirname(root),
    basename(root),
  ],
  { stdio: "inherit" },
);
if (tar.status !== 0) {
  console.error(
    "\nCould not create the archive. Zip the folder by hand (without node_modules) and send it.",
  );
  process.exit(1);
}

for (const w of warnings) console.warn(`warning: ${w}`);
console.log(
  `\nArchive ready: ${out}\nReply to the case email with this file attached.`,
);
