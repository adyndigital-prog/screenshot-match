<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Pricing math lives as pure functions in src/lib/pricing/ with Vitest tests; UI never computes prices inline — keeps formulas auditable.
- App areas live under /app (src/routes/app.*); unbuilt areas render via app.$area.tsx from src/lib/nav.ts — one place to add sections.
