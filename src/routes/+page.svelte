<script lang="ts">
    import { browser } from '$app/environment';
    import Piece, { piece } from '$lib/Piece/Piece.svelte';
    import { buildTestPiece } from '$lib/testing/piece-building.js';

    const pieceProps = $state({
        foo: 'bar',
        count: 42,
    });
    let bgColor = $state('#ffffff');
    const containerStyle = $derived(`background-color: ${bgColor};`);
    let mountPiece = $state(true);
</script>

<main class="content">
    <h1>Welcome to CollageJS!</h1>
    <p>
        What you see below inside the dashed box is a "piece" rendered using CollageJS. The piece itself is <strong
            >not</strong
        > a Svelte component. This piece is built using plain JavaScript and DOM operations. It supports property updating.
    </p>
    <p>
        In short: You're looking at a Svelte project that has successfully rendered a non-Svelte micro-frontend. Yes,
        the code itself is not coming from from a separate HTTP server, but the piece is still a fully isolated
        micro-frontend that could be loaded from anywhere.
    </p>
    <p>
        To learn more, read the <a href="https://collagejs.dev" target="_blank" rel="noopener noreferrer">
            CollageJS documentation
        </a>.
    </p>
    <button type="button" class="button is-primary" onclick={() => mountPiece = !mountPiece}>
        Toggle Piece
    </button>
    {#if browser && mountPiece}
        <Piece {...piece(buildTestPiece(), { class: 'code', style: containerStyle })} {...pieceProps} />
    {/if}
    <h2>Change Piece Properties</h2>
    <label>
        foo:
        <input type="text" bind:value={pieceProps.foo} />
    </label>
    <label>
        count:
        <input type="number" bind:value={pieceProps.count} />
    </label>
    <h2>Change Container Style</h2>
    <label>
        Background color:
        <input type="color" bind:value={bgColor} />
    </label>
</main>

<style>
    :global .code {
        display: block !important;
        font-family: monospace;
        font-size: x-large;
        border: 0.3em dashed black;
        margin: 1rem;
        padding: 1rem;
        & > pre {
            margin: 0;
        }
    }
</style>
