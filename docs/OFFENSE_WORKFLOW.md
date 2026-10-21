# Offense weekly workflow (browser-local demo)

This milestone belongs to the root Football Team OS application. The district app,
standalone Sites, and external playbook/script tools remain separate. No backend,
production authorization, athlete tracking, migration service, or infrastructure
connection is added.

## Try it

1. Open **Team → Offense → Playbook** (or **Offense · Install** on This Week).
2. In **Play assignments**, choose a saved designer play or explicitly add the sample.
3. Edit position assignments and front adjustments; save a new library revision.
4. In **Weekly install**, select the season/week and install the saved play.
5. In **Practice script**, add a period and select the installed play, reps, and scout look.
6. In **Call sheet**, add a situation and select that same installed play. Add a call note
   or wristband number, then print. Install and practice also have print layouts.
7. Reload and reopen the workflow: saved work remains in this browser and origin.

The workflow tabs keep the selected season/week while moving between steps. Returning
through the main app navigation starts from the app's selected game week. Seasons are
independent browser-local plans; the existing season archive data is not migrated.
Archive mode and existing role gates remain demo UI controls.

## Compatibility and storage

- Existing `team-os-playbook-library-offense` records retain their IDs, diagrams,
  attachment fields, and unknown extra fields. Defense/special teams libraries are unchanged.
- `assignments`, `frontAdjustments`, and `revision` are optional additions. Legacy
  plays read as revision 1; saving assignments explicitly writes revision 2.
- Weekly data uses a new `team-os-offense-workflow-v1` key with an explicit version.
  Keys are `season:week`, including preseason week 0 and weeks through 30.
- An install stores the stable source ID and a deep snapshot of the selected revision.
  Practice and call-sheet entries reference that install ID, not copied play names.
- A newer library revision does not silently update saved weeks. Remove/reinstall to
  adopt it; removal also clears its dependent practice/call-sheet slots. The UI asks
  for confirmation and offers one-step undo that restores the whole prior save.
- Repeated script/call-sheet uses are intentional; installing a source play twice in
  one week is prevented. Period duplication makes independent rows and new row IDs.
- Corrupt/unsupported saved data disables workflow editing rather than replacing it.
  Browser-storage failures show a failed-save message. Writes/undo reject detected
  changes from another tab. This is not a multi-user concurrency guarantee.
- The sample is opt-in, never auto-seeded, and never replaces an existing record.
  Print output is a coaching copy, not a restorable data backup. Browser clearing,
  another device, or another domain will not retain this data.
- Existing weekly attachment screens remain under **Existing weekly attachments**
  on the Practice/Call Sheet navigation entries. Existing designer and archive/import
  paths remain in place. No external tools are automatically synchronized.

## Validation

Run `node --test tests/offense-workflow.test.mjs` and `npx --no-install tsc --noEmit`.
The tests use the repository's locked TypeScript compiler and Node's built-in test
runner; no new testing dependency is required. Targeted lint:

```sh
npx --no-install eslint src/lib/offense-workflow.ts src/components/playbook/OffenseWorkflow.tsx
```

Production remains the repository's existing `npm run build` pipeline, including the
district static export at `/district`. Its shell copy commands use POSIX syntax. On
Windows this audit validated the equivalent steps with PowerShell without editing
the production pipeline: build `platform/` with `NEXT_PUBLIC_BASE_PATH=/district`,
copy `platform/out/` into the gitignored `public/district/`, then run root `next build`.
Both apps need network access for the pre-existing Google Fonts fetches.

Full-repository lint already fails on older root/district source and additionally
walks generated district build output. Compare targeted source diagnostics against
the base commit rather than treating generated output as new source errors.
