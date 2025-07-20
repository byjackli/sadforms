<script lang="ts">
    interface Props {
        id?: string;
        title: string;
    }
    
    const { id = undefined, title }: Props = $props();
</script>

<main {id} class="fwfh docs">
    <h1>{title}</h1>
    <div class="scrolltainer">
        <slot />
    </div>
</main>
