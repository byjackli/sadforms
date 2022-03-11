<script lang="ts">
    export let id: string = undefined,
        title: string;
</script>

<main {id} class="fwfh docs">
    <h1>{title}</h1>
    <div class="scrolltainer">
        <slot />
    </div>
</main>
