<script lang="ts">
    export let title: string;
</script>

<section id={title.toLowerCase().replace(/\s+/g, "_")}>
    <h2 class="h3">{title}</h2>
    <div class="scrolltainer">
        <slot />
    </div>
</section>
