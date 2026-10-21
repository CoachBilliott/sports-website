# Hosted preview diagnosis

## Failed hosted evidence

- Preview: https://vercel.com/coach-billiott/sports-website/FhybaMcyt1AAg6FLBqwuvzBdpDRx
- Source commit: `10d7bcee463024f737656fa5a54127cdd5b5eb82` (first offense workflow commit).
- Vercel/GitHub deployment status: failure, October 21, 2026 at 15:14:37 UTC.
- GitHub deployment record: `7229646388`.
- Failure occurs in the nested district build before the root football build.

The actual build log shows Next.js 16.2.10 (Turbopack), Vercel `modifyConfig`, a
conflict between `outputFileTracingRoot` and `turbopack.root`, and use of
`/vercel/path0` as the tracing root. The compile then fails with 21 font errors,
including:

```text
Module not found: Can't resolve '@vercel/turbopack-next/internal/font/google/font'
next/font/google queries have exactly one entry
```

This is a hosted compiler/font-resolution failure; it is not a failing offense
workflow test. The precise underlying Vercel/Turbopack defect has not been proven
in a local reproduction of Vercel's injected build configuration.

## Repository workaround

Use the installed Next.js CLI's supported `next build --webpack` option for both
production apps. This avoids the failing Turbopack font pipeline and also keeps
the subsequent football build on the same production compiler. It does not change
font families, dependencies/lockfiles, app routes, district export/copy order,
account/environment settings, credentials, or infrastructure.

Validate the full root `npm run build` pipeline, not only individual app commands.
For Windows local validation, npm's existing POSIX script commands can run with
Git Bash as `npm_config_script_shell`. Exclude `NEXT_PUBLIC_BASE_PATH` from Git
Bash's MSYS environment conversion so `/district` is not rewritten to a Windows
filesystem path. These are command-local test settings, not hosting settings.
Package installation scripts were disabled during local validation; no new
dependencies were introduced.

Local validation passed the complete root `npm run build` command: district
Webpack compile/types/static export, copy into `public/district`, then football
Webpack compile/types/static generation. All 16 tests passed against the resulting
local production server. Chrome also verified the district notice, its Football
link, and the retained saved offense install under the Webpack output.

## Local evidence versus hosted outcome

The successful local tests and production builds do not establish a successful
Vercel preview. At inspection, prior head `e809831e93f2fd3800b72df88906602ff950eda7`
had no commit-status entries, check runs, Actions runs, or GitHub deployment record.
Vercel's branch-filtered history showed only the failed `10d7bce` preview and a
banner saying automatic deployments from GitHub may be delayed by an outage.
That banner does not prove the cause of every missing preview.

After the workaround is reviewed, require an actual successful hosted build of
the exact approved commit before treating the preview as healthy. Do not infer
success from an empty GitHub check list, and do not promote or merge based only on
local evidence. No manual deployment/redeployment or promotion was performed as
part of this diagnosis. A normal feature-branch push may be picked up by the
existing Vercel Git integration; inspect its exact commit and logs separately.
