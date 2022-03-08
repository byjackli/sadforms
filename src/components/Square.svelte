<script lang="ts">
    import { loadForm, deleteForm } from "../store/SadForms";

    export let custom: boolean = false,
        uid: string = undefined,
        title: string,
        icon: string = "edit",
        action: string = "edit form";

    let square;

    function toggleClick(event): void {
        if (
            event.type === "click" ||
            (event.type === "keydown" &&
                ["Enter", "Space", "NumpadEnter"].includes(event.key))
        ) {
            let tail = "new";

            if (uid !== undefined) {
                loadForm(uid);
                tail = `edit#${encodeURIComponent(`${uid}|`)}`;
            }

            window.location.assign(`${window.location.origin}/${tail}`);
        }
    }
    function toggleDelete(event): void {
        if (
            event.type === "click" ||
            (event.type === "keydown" &&
                ["Enter", "Space", "NumpadEnter"].includes(event.key))
        ) {
            deleteForm({ uid });
            square.parentNode.removeChild(square);
        }
    }
</script>

<div bind:this={square} class="square-container noselect" {title}>
    <div class="square-meat">
        <div
            class={`square ${custom ? "custom" : ""}`}
            tabindex="0"
            on:click={toggleClick}
            on:keydown={toggleClick}
            role="button"
            aria-label={`${!custom ? `edit ${title}` : action}`}
        >
            <span aria-hidden="true" class="material-icons">{icon}</span>
            <span aria-hidden="true">{action}</span>
        </div>
        {#if uid}
            <button
                class="delete"
                on:click={toggleDelete}
                on:keydown={toggleDelete}
                aria-label={`delete ${title}`}
            >
                <span aria-hidden="true" class="material-icons"
                    >delete_forever</span
                >
            </button>
        {/if}
    </div>
    {#if !custom}
        <span aria-hidden="true" class="square-package">{title}</span>
    {/if}
</div>
