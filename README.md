# <img src="https://raw.githubusercontent.com/collagejs/core/HEAD/src/logos/collagejs-48.svg" alt="CollageJS Logo" width="48" height="48" align="left">&nbsp;@collagejs/svelte

> Svelte v5 integration for the CollageJS micro-frontend library

[Online Documentation](https://collagejs.dev)

This is the official Svelte component library for *CollageJS* used to:

1. Create *CollageJS* `CorePiece` objects out of Svelte components
2. Consume `CorePiece` objects (made with any framework or library) in Svelte v5 projects

## Creating Svelte-Based `CorePiece` Objects

Whenever we are creating a micro-frontend in Svelte v5 and wish for it to be used with *CollageJS*, we must create a `CorePiece` wrapper object for the Svelte component that is the root of our micro-frontend.  Unless we wanted to take on this task ourselves, we use this package's `buildPiece()` function:

```typescript
// mfe.ts (or whatever name you wish for the file)
import { buildPiece } from "@collagejs/svelte";
// The component to wrap.  It usually is App.svelte.
import App from "./App.svelte";

export function myMfeFactory() {
    return buildPiece(App /*, { options } */);
}
```

> ✨ **Tip**:  Repeat this process in the same or different file for any number of Svelte components that you wish to make available as independent micro-frontends.  The sky is the limit.

## Consuming `CorePiece` Objects

We can mount *CollageJS* pieces created in any technology in Svelte projects by using the `<Piece>` component.  This component requires that we pass the `CorePiece` object that we wish to mount.  Any other properties given to `<Piece>` are forwarded to the mounted `CorePiece` object:

```svelte
<script lang="ts">
    import { Piece, piece } from "@collagejs/svelte";
    import { myMfeFactory } from "@my/bare-module-specifier";
</script>

<Piece {...piece(myMfeFactory())} extra="yes" data={true} />
```

1. We must use the `piece()` function to pass the `CorePiece` object.
2. The example uses the name of the factory function in the previous example, so we're mounting a Svelte MFE inside a Svelte project.
3. The `"@my/bare-module-specifier"` module name is the bare module specifier we assign to the micro-frontend in our root project's import map.
