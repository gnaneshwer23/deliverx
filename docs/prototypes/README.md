# DeliverX HTML Prototypes

Static, self-contained HTML mockups used as UX reference for the live Next.js app.

## Complete workflow prototype

**File:** [`deliverx-complete-workflow.html`](./deliverx-complete-workflow.html)

Nine connected screens covering the full DeliverX delivery loop:

| Screen | Flow |
|--------|------|
| S1 | PM uploads business case |
| S2 | BA onboarding |
| S3 | BA workspace |
| S4 | PM dashboard + role invites |
| S5 | All 7 workspaces + signal feed |
| S6 | Meeting upload |
| S7 | PM meeting review |
| S8 | Team tasks |
| S9 | Sponsor read-only + Copilot |

### Open locally

No build step required. Open the file directly in a browser:

```bash
open docs/prototypes/deliverx-complete-workflow.html
```

Or drag the file into Chrome, Safari, or Firefox. All styles and scripts are inline; fonts load from Google Fonts when online.

### Console navigation

The prototype exposes a `show()` helper for jumping between screens. Open DevTools and try:

```js
show("s-land")   // landing
show("s-auth")   // auth
show("s-ob")     // onboarding
goApp("dash")    // PM dashboard
goApp("ws")      // workspace grid
```
