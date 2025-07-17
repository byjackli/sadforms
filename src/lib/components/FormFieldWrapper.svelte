<script lang="ts">
	import Field from "./Field.svelte";
	import type { Field as FieldType, Group } from "../types/Form";

	// Props for the field wrapper
	export let field: FieldType;
	export let formId: string;
	export let functions: {
		onFocus: (fieldId: string, groupId?: string) => void;
		onBlur: (fieldId: string, groupId?: string) => void;
		updateField: (event: Event, fieldId: string, groupId?: string) => void;
		submit: () => void;
		reset: () => void;
	};
	export let group: Group | undefined = undefined;
</script>

<!-- Delegate to existing Field component -->
<Field
	formid={formId}
	{field}
	{group}
	{functions}
/>