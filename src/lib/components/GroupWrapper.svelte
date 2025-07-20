<script lang="ts">
	import CustomStore from "../store/CustomStore";
	import Field from "./Field.svelte";
	import type { Group } from "../types/Form";

	// Props for the group wrapper
	interface Props {
		group: Group;
		formId: string;
		functions: {
			onFocus: (fieldId: string, groupId?: string) => void;
			onBlur: (fieldId: string, groupId?: string) => void;
			updateField: (event: Event, fieldId: string, groupId?: string) => void;
			submit: () => void;
			reset: () => void;
		};
		children?: any[];
	}
	
	const { group, formId, functions, children = [] }: Props = $props();

	// Group metadata
	const meta = $derived(group.meta);
	const showLabel = $derived(meta?.override?.label);
	const showFeedback = $derived(meta?.override?.feedback);
</script>

<div
	class="form-group"
	role="group"
	id={`${$CustomStore.names.groupHeader}${meta.uid}`}
>
	<div class="items">
		{#if showLabel}
			<legend>
				{meta.name}
				{#if meta.required}<em>*required</em>{/if}
			</legend>
		{/if}
		
		{#each children || [] as childItem}
			<Field
				formid={formId}
				field={childItem.data}
				group={group}
				{functions}
			/>
		{/each}
	</div>
	
	{#if meta?.tooltip}
		<div class="container-tooltip" aria-hidden="true">
			{#if $CustomStore.icons.tooltip}
				<span
					aria-hidden="true"
					class="material-icons"
				>
					{$CustomStore.icons.tooltip}
				</span>
			{/if}
			<p>{meta.tooltip}</p>
		</div>
	{/if}
	
	{#if showFeedback}
		<div
			class="form-group-feedback"
			id={`${$CustomStore.names.groupFeedback}${meta.uid}`}
		></div>
	{/if}
</div>