<script lang="ts">
    export let title: string;
</script>

<main id="docs" class="fwfh docs">
    <h1>{title}</h1>
    <div class="scrolltainer">
        <slot />
    </div>
</main>
