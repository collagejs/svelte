<script module lang="ts">
    const piecePropsSymbol = Symbol();

    /**
     * Defines the special properties accepted by the `Piece` component.  This type is to be used in conjunction with 
     * the `piece()` helper function to create the special property required by the `Piece` component.
     */
    export type PieceProps<
        TProps extends Record<string, any> = Record<string, any>,
    > = {
        /**
         * The special property that contains the `CorePiece` instance to render, along with optional container 
         * properties.
         */
        [piecePropsSymbol]: {
            /**
             * The `CorePiece` instance to render.
             */
            piece: CorePiece<TProps>;
            /**
             * Optional HTML attributes to set on the container element that wraps the piece.
             */
            containerProps?: HTMLAttributes<HTMLDivElement>;
        };
    };

    /**
     * Helper function to create the special property required by the `Piece` component.  The result of this function 
     * is to be spread into the props of the `Piece` component.
     * 
     * @example
     * ```svelte
     * <Piece {...piece(myPiece, { onfocusin: focusInHandler })} foo="bar" count={42} />
     * ```
     * 
     * @param piece The `CorePiece` instance to render.
     * @param containerProps Optional HTML attributes to set on the container element that wraps the piece.
     * @returns An object containing the special property to pass to the `Piece` component.
     */
    export function piece<
        TProps extends Record<string, any> = Record<string, any>,
    >(
        piece: CorePiece<TProps>,
        containerProps?: HTMLAttributes<HTMLDivElement>,
    ) {
        return {
            [piecePropsSymbol]: {
                piece,
                containerProps,
            },
        };
    }
</script>

<script
    lang="ts"
    generics="TProps extends Record<string, any> = Record<string, any>"
>
    import { getCollageContext } from "$lib/collageContext.js";
    import {
        mountPiece,
        type CorePiece,
        type MountedPiece,
        type MountPiece,
    } from "@collagejs/core";
    import { onMount } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";

    type Props = TProps & PieceProps<TProps>;

    let { ...restProps }: Props = $props();

    const { piece: corePiece, containerProps } = $derived(restProps[piecePropsSymbol]);
    let containerEl: HTMLDivElement;
    let firstRun = true;
    const ctx = getCollageContext();
    let mountedPiece: MountedPiece<TProps> | undefined;

    onMount(() => {
        const mountPieceFn =
            (ctx?.mountPiece as MountPiece<TProps>) ?? mountPiece<TProps>;
        const mountPromise = mountPieceFn(corePiece, containerEl, restProps).then((mp) => {
            mountedPiece = mp;
        });
        return async () => {
            await mountPromise;
            await mountedPiece?.unmount();
            mountedPiece = undefined;
        };
    });

    $effect(() => {
        // Must be the first line so the dependency on restProps is tracked.
        const newProps = { ...restProps };
        delete (newProps as any)[piecePropsSymbol];
        if (firstRun) {
            firstRun = false;
            return;
        }
        mountedPiece?.update(newProps);
    });
</script>

<div bind:this={containerEl} {...containerProps}></div>

<style>
    div {
        display: contents;
    }
</style>
<!--
@component

### Piece Component

Renders a CollageJS "piece" (micro-frontend) inside a Svelte application.  The piece itself may be built using any 
valid framework or library, as long as it adheres to the *CollageJS* `CorePiece` interface.

#### Props

Properties passed to the `Piece` component must include a special property created using the `piece()` helper
function. This property contains the `CorePiece` instance to render, along with optional container properties.  One can 
also pass additional properties that will be forwarded to the mounted piece.

If the mounted piece supports property updates, any changes to the additional properties will be propagated to the 
piece reactively as per the rules of Svelte's reactivity system.

#### Example Usage

1. Import the `Piece` component and the `piece()` helper function from the library.
2. Import whatever you need to get a hold of your `CorePiece` instance.  Normally, one imports a factory function that 
creates the piece from a *bare module specifier* (an alias defined by your application's import map):
    ```typescript
    import Piece, { piece } from '@collagejs/svelte';
    import { myPieceFactory } from '@my/bare-module-specifier';
    ```
3. Create a `CorePiece` instance using your factory function.  Pass whatever arguments the factory function requires.
4. Render the `Piece` component in your Svelte template, passing the `CorePiece` instance using the `piece()` helper 
function.  Also pass any additional properties that the piece supports:

```svelte
<Piece {...piece(myPieceFactory(), { class: 'my-piece-container' })} foo="bar" count={42} />
```

The above sets the `my-piece-container` CSS class on the container element that wraps the piece, and also passes the 
`foo` and `count` properties to the mounted piece.  This example uses constant values in the properties, but you can 
also pass stateful values that can update reactively, as if it were a regular Svelte component.

> ⚠️ **IMPORTANT**:  Once a piece has unmounted, it cannot be remounted.  You must create a new `CorePiece` instance 
> and `<Piece>` instance.  This is by design.  The easiest is to have the call to the factory function inside the 
> Svelte template, so that a new `CorePiece` instance is created each time a new `<Piece>` instance is created.

Online Documentation: Pending (https://collagejs.dev)
-->
