<script lang="ts">
	import { beforeUpdate, onDestroy, onMount } from "svelte";
	import CustomStore from "../store/CustomStore";

	export let id: string,
		name: string,
		type: string,
		icon: { on: string; off: string } = undefined,
		placeholder: string = "",
		disabled: boolean = false,
		redact: boolean = false,
		data: boolean = undefined,
		focus: Function = undefined,
		blur: Function = undefined,
		input: Function = undefined;

	let fullId: string = `${$CustomStore.names.inputHeader}${id}`,
		label: HTMLElement = undefined,
		container = undefined;

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

	beforeUpdate(() => {
		if (!data) data = undefined;
	});
	onMount(() => {
		label = document.getElementById(`${$CustomStore.names.label}${id}`);
		label?.addEventListener("click", labelLink);
	});

	onDestroy(() => label?.removeEventListener("click", labelLink));
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
	on:focus={focus && focus()}
	on:blur={focus && blur()}
	on:click={onInput}
	on:keydown={(event) => onInput(event)}
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
