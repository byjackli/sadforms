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
		focus = undefined,
		blur = undefined,
		input = undefined
	}: Props = $props();
	
	let data = $state<boolean>(undefined);

	let fullId = $state(`${$CustomStore.names.inputHeader}${id}`);
	let label = $state<HTMLElement>(undefined);
	let container = $state(undefined);

	function updateChecked() {
		if (data) data = false;
		else data = true;
	}
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
			updateChecked();
			input({ target: { value: data } });
		}
	}
	function labelLink() {
		container.focus();
	}

	$effect(() => {
		if (!data) data = undefined;
	});
	onMount(() => {
		label = document.getElementById(`${$CustomStore.names.label}${id}`);
		label?.addEventListener("click", labelLink);
	});

	$effect(() => {
		return () => label?.removeEventListener("click", labelLink);
	});
</script>

<div
	bind:this={container}
	class={`field ${type} noselect ${redact ? $CustomStore.names.redact : ""}`}
	id={fullId}
	{name}
	{disabled}
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
