<script lang="ts">
	import Field from "./Field.svelte";
	import type { Field as FieldType, Group } from "../types/Form";

	// Props for the field wrapper
	interface Props {
		field: FieldType;
		formId: string;
		functions: {
			onFocus: (fieldId: string, groupId?: string) => void;
			onBlur: (fieldId: string, groupId?: string) => void;
			updateField: (event: Event, fieldId: string, groupId?: string) => void;
			submit: () => void;
			reset: () => void;
		};
		group?: Group;
	}
	
	const { field, formId, functions, group = undefined }: Props = $props();
</script>

<!-- Delegate to existing Field component -->
<Field
	formid={formId}
	{field}
	{group}
	{functions}
/>