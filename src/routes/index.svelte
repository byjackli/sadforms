<script lang="ts">
    import { onMount } from "svelte";
    import { getForms } from "../store/SadForms";
    import Square from "../components/Square.svelte";

    let forms: [{ uid: string; title: string }];

    onMount(() => (forms = getForms()));
</script>

<main id="home">
    <div>
        <div class="hero">
            <h1>Sad Forms</h1>
            <p>low-level accessible forms designed for Svelte programmers.</p>
        </div>
        <ul role="navigation">
            <li>
                <a href="/donate" class="button pill">
                    <span aria-hidden="true" class="material-icons"
                        >volunteer_activism</span
                    >
                    <span aria-hidden="true">donate</span>
                </a>
            </li>
            <li>
                <a href="/docs" class="button pill nofill">
                    <span aria-hidden="true" class="material-icons"
                        >receipt_long</span
                    >
                    <span aria-hidden="true">documentation</span>
                </a>
            </li>
            <li>
                <a href="/feedback" class="button pill nofill">
                    <span aria-hidden="true" class="material-icons"
                        >feedback</span
                    >
                    <span aria-hidden="true">feedback</span>
                </a>
            </li>
        </ul>
    </div>
    <section>
        <Square custom icon="post_add" title="new form" action="new form" />
        {#if forms}
            {#each forms as form (form)}
                {@const { uid, title } = form}
                <Square {uid} {title} />
            {/each}
        {/if}
    </section>
</main>
