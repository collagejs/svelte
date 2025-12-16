<script lang="ts">
    import type { LayoutProps } from './$types.js';

    let { data, children }: LayoutProps = $props();
</script>

<div class="container">
   {@render children()}
</div>