<script lang="ts">
	import Field from "./Field.svelte";
	import CustomStore from "../store/CustomStore";
	import type { Field as FieldType, Group } from "../types/Form";

	export let uid: string;
	export let title: string;
	export let caption: string | undefined = undefined;
	export let hide: {
		title?: boolean;
		caption?: boolean;
		submit?: boolean;
		reset?: boolean;
	} | undefined = undefined;
	export let autocomplete = true;
	export let fullscreen = false;
	export let formFields: (FieldType | Group)[] = [];
	export let loading = false;
	export let functions: {
		onFocus: (fieldId: string, groupId?: string) => void;
		onBlur: (fieldId: string, groupId?: string) => void;
		updateField: (event: Event, fieldId: string, groupId?: string) => void;
		submit: () => void;
		reset: () => void;
	};
</script>

<div id={uid} class="sf sf-container">
	{#if formFields && formFields.length > 0 && !loading}
		{#if !fullscreen && !hide?.title}<h2>{title}</h2>{/if}
		{#if !hide?.caption && caption !== undefined}<p>{caption}</p>{/if}
		<form
			autocomplete={autocomplete ? "on" : "off"}
			tabindex="-1"
			on:submit|preventDefault={functions.submit}
		>
			{#each formFields as group (group)}
				{#if 'meta' in group}
					<!-- Group rendering -->
					<div
						class="form-group"
						role="group"
						id={`${$CustomStore.names.groupHeader}${group.meta.uid}`}
					>
						<div class="items">
							{#if group.meta?.override?.label}
								<legend>
									{group.meta.name}
									{#if group.meta.required}<em>*required</em>{/if}
								</legend>
							{/if}
							{#each Object.entries(group) as [key, field]}
								{#if key !== 'meta' && typeof field === 'object' && field !== null && 'uid' in field}
									<Field
										formid={uid}
										field={field}
										group={group}
										{functions}
									/>
								{/if}
							{/each}
						</div>
						{#if group.meta?.tooltip}
							<div class="container-tooltip" aria-hidden="true">
								{#if $CustomStore.icons.tooltip}
									<span
										aria-hidden="true"
										class="material-icons"
									>
										{$CustomStore.icons.tooltip}
									</span>
								{/if}
								<p>{group.meta?.tooltip}</p>
							</div>
						{/if}
						{#if group.meta?.override?.feedback}
							<div
								class="form-group-feedback"
								id={`${$CustomStore.names.groupFeedback}${group.meta.uid}`}
							></div>
						{/if}
					</div>
				{:else}
					<!-- Individual field rendering -->
					<Field
						formid={uid}
						field={group}
						{functions}
					/>
				{/if}
			{/each}
			<div class="trailingButtons">
				{#if !hide?.reset}
					<input
						class="field"
						type="button"
						value="reset"
						on:click|preventDefault={functions.reset}
					/>
				{/if}
				{#if !hide?.submit}
					<input
						class="field"
						type="submit"
						value="submit"
						on:click|preventDefault={functions.submit}
					/>
				{/if}
			</div>
		</form>
	{:else if loading}
		<div>loading forms!</div>
	{:else}
		<div>
			<p>The form you are looking for is currently unavailable.</p>
			<p>
				If you believe it should be, please contact the developer and
				the person that sent you this link.
			</p>
		</div>
	{/if}
</div>