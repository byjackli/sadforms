<script lang="ts">
	import GroupWrapper from "./GroupWrapper.svelte";
	import FormFieldWrapper from "./FormFieldWrapper.svelte";
	import CustomStore from "../store/CustomStore";
	import type { Field as FieldType, Group } from "../types/Form";

	interface Props {
		uid: string;
		title: string;
		caption?: string;
		hide?: {
			title?: boolean;
			caption?: boolean;
			submit?: boolean;
			reset?: boolean;
		};
		autocomplete?: boolean;
		fullscreen?: boolean;
		formFields?: (FieldType | Group)[];
		loading?: boolean;
		functions: {
			onFocus: (fieldId: string, groupId?: string) => void;
			onBlur: (fieldId: string, groupId?: string) => void;
			updateField: (event: Event, fieldId: string, groupId?: string) => void;
			submit: () => void;
			reset: () => void;
		};
	}
	
	const {
		uid,
		title,
		caption = undefined,
		hide = undefined,
		autocomplete = true,
		fullscreen = false,
		formFields = [],
		loading = false,
		functions
	}: Props = $props();

	// Type checking utility
	function isField(field: unknown): field is FieldType {
		return (
			typeof field === 'object' &&
			field !== null &&
			'uid' in field &&
			'name' in field &&
			'type' in field &&
			typeof (field as any).uid === 'string' &&
			typeof (field as any).name === 'string' &&
			typeof (field as any).type === 'string'
		);
	}

	// Data preprocessing interfaces
	interface ProcessedFormItem {
		isGroup: boolean;
		uid: string;
		data: FieldType | Group;
		children?: ProcessedFormItem[];
	}

	// Preprocess form fields to move logic out of template
	function preprocessFormFields(fields: (FieldType | Group)[]): ProcessedFormItem[] {
		return fields.filter(item => item != null).map(item => {
			if ('meta' in item) {
				// Process group - add null check for item
				const children = item ? Object.entries(item)
					.filter(([key, field]) => key !== 'meta' && isField(field))
					.map(([_, field]) => ({
						isGroup: false,
						uid: field.uid,
						data: field as FieldType,
						children: undefined
					})) : [];

				return {
					isGroup: true,
					uid: item.meta.uid,
					data: item,
					children
				};
			} else {
				// Process individual field
				return {
					isGroup: false,
					uid: item.uid,
					data: item,
					children: undefined
				};
			}
		});
	}

	// Reactive preprocessing of form fields
	const processedFields = $derived(preprocessFormFields(formFields));
</script>

<div id={uid} class="sf sf-container">
	{#if formFields && formFields.length > 0 && !loading}
		{#if !fullscreen && !hide?.title}<h2>{title}</h2>{/if}
		{#if !hide?.caption && caption !== undefined}<p>{caption}</p>{/if}
		<form
			autocomplete={autocomplete ? "on" : "off"}
			tabindex="-1"
			onsubmit={(event) => { event.preventDefault(); functions.submit(); }}
		>
			{#each processedFields as item (item.uid)}
				{#if item.isGroup}
					<GroupWrapper
						group={item.data}
						formId={uid}
						children={item.children}
						{functions}
					/>
				{:else}
					<FormFieldWrapper
						field={item.data}
						formId={uid}
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
						onclick={(event) => { event.preventDefault(); functions.reset(); }}
					/>
				{/if}
				{#if !hide?.submit}
					<input
						class="field"
						type="submit"
						value="submit"
						onclick={(event) => { event.preventDefault(); functions.submit(); }}
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