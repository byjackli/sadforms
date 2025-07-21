<script lang="ts">
	import { onMount } from "svelte";
	import CustomStore from "../store/CustomStore";

	interface Props {
		id: string;
		name: string;
		type: string;
		icon?: { on: string; off: string };
		placeholder?: string;
		disabled?: boolean;
		redact?: boolean;
		data?: boolean;
		focus?: Function;
		blur?: Function;
		input?: Function;
	}
	
	const {
		id,
		name,
		type,
		icon = undefined,
		placeholder = "",
		disabled = false,
		redact = false,
		data = false,
		focus = undefined,
		blur = undefined,
		input = undefined
	}: Props = $props();
	
	let fullId = $state(`${$CustomStore.names.inputHeader}${id}`);
	let label = $state<HTMLElement>(undefined);
	let container = $state(undefined);

	function renderChecked(boolean: boolean): string {
		return boolean ? `check_box` : `check_box_outline_blank`;
	}
	function onInput(event): void {
		if (disabled) return;
		if (
			event.type === "click" ||
			["Enter", "NumpadEnter", "Space"].includes(event.code)
		) {
			event.preventDefault();
			input({ target: { value: !Boolean(data) } });
		}
	}
	function labelLink() {
		container.focus();
	}

	onMount(() => {
		label = document.getElementById(`${$CustomStore.names.label}${id}`);
		label?.addEventListener("click", labelLink);
	});

	$effect(() => {
		return () => label?.removeEventListener("click", labelLink);
	});
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
	bind:this={container}
	class={`field ${type} noselect ${redact ? $CustomStore.names.redact : ""}`}
	id={fullId}
	data-name={name}
	data-disabled={disabled}
	aria-disabled={disabled}
	aria-labelledby={`${$CustomStore.names.label}${id}`}
	aria-checked={`${!!data}`}
	role={type}
	onfocus={() => focus()}
	onblur={() => blur()}
	onclick={onInput}
	onkeydown={(event) => onInput(event)}
	tabindex="0"
>
	{#if type === "checkbox"}
		<span>{placeholder ? placeholder : name}</span>
		<span aria-hidden="true" class="material-icons"
			>{renderChecked(data)}</span
		>
	{:else}
		{#if placeholder}<span aria-hidden="true">{placeholder}</span>{/if}
		<div aria-hidden="true" class="switch-container">
			{#if icon && typeof icon === "object"}
				<span aria-hidden="true" class="material-icons">{icon.off}</span
				>
				<span aria-hidden="true" class="material-icons">{icon.on}</span>
			{/if}
			<div aria-hidden="true" class="switch-state">&nbsp;</div>
		</div>
	{/if}
</div>
