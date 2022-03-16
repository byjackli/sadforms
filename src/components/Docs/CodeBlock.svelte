<script lang="ts">
    export let side: "a" | "b" | "A" | "B" = "a",
        sideA = { icon: "data_object", text: "obj type" },
        sideB = { icon: "science", text: "example" },
        hideButton: boolean = false;

    let swap = () => (side = side === "a" ? "b" : "a"),
        isitA = (char: string) => ["a", "A"].includes(char);
</script>

<div class="codeblock">
    <div class="clip-scrollbar">
        <div class="code-container">
            {#if isitA(side)}
                <slot name="a" />
            {:else}
                <slot name="b" />
            {/if}
        </div>
    </div>
    {#if !hideButton}
        <button class="pill" on:click={swap}>
            <span class="material-icons"
                >{isitA(side) ? sideB.icon : sideA.icon}</span
            >
            <span>{isitA(side) ? sideB.text : sideA.text}</span>
        </button>
    {/if}
</div>
