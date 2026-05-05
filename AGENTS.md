# LS Stringsmith Agent Notes

## Branch Discipline

- `main` is frozen as the public alpha snapshot at commit `5770167`.
- Do not commit directly to `main`.
- Do not push `main` from this workspace unless explicitly asked to publish a
  merge/release.
- Continue product, docs, and implementation work on `codex/post-alpha-work` or
  short-lived branches created from it.
- Merge back to `main` only deliberately, after review and a green verification
  run.

## Commit Identity

- Use the repository-local GitHub noreply address for future commits:
  `117814630+igotsoul@users.noreply.github.com`.
- Check with `git config user.email` before committing if anything looks off.
