<script lang="ts">
    interface Props {
        side?: "a" | "b" | "A" | "B";
        sideA?: { icon: string; text: string };
        sideB?: { icon: string; text: string };
        hideButton?: boolean;
    }
    
    const {
        side = "a",
        sideA = { icon: "data_object", text: "obj type" },
        sideB = { icon: "science", text: "example" },
        hideButton = false
    }: Props = $props();

    let currentSide = $state(side);
    const swap = () => (currentSide = currentSide === "a" ? "b" : "a");
    const isitA = (char: string) => ["a", "A"].includes(char);
</script>

<div class="codeblock">
    <div class="clip-scrollbar">
        <div class="code-container">
            {#if isitA(currentSide)}
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
