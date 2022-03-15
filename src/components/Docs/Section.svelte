<script lang="ts">
    import view, { updateView } from "../../static/intersection";
    export let title: string;
</script>

<section
    use:view
    on:enterView={(event) => updateView(event)}
    id={title?.toLowerCase().replace(/\s+/g, "_")}
>
    <h2 class="h3">{title}</h2>
    <div class="scrolltainer">
        <slot />
    </div>
</section>
