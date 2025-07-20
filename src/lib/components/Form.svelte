<script lang="ts">
	import { onMount } from "svelte";
	import { get } from "svelte/store";
	import FormRenderer from "./FormRenderer.svelte";
	import FormFieldStore from "../store/FormFieldStore";
	import { submitForm } from "../services/formSubmission";
	import {
		handleFieldUpdate,
		handleFieldFocus,
		handleFieldBlur,
	} from "../services/formEventHandler";
	import {
		initializeForm,
		cleanupForm,
		resetForm as hardResetForm,
		type FormLifecycleState,
	} from "../services/formLifecycle";
	import type { FormLifecycleConfig } from "../services/formLifecycle";
	import { updateSave } from "../store/FormFieldStore";
	import type { Field, Group, FormData } from "../types/Form";

	// Form configuration props
	interface Props {
		uid: string;
		title: string;
		caption?: string;
		autocomplete?: boolean;
		fullscreen?: boolean;
		saveToLocal?: boolean;
		saveToCloud?: boolean;
		save?: {
			saveAuto: number | false;
			saveOnInput: boolean;
		};
		onInput?: (formData: FormData) => void;
		fields?: Record<string, Field | Group>;
		debug?: boolean;
		debugData?: string | null;
		onSubmit?: (formData: FormData, formId: string) => void | Promise<void> | null;
		hide?: {
			title?: boolean;
			caption?: boolean;
			submit?: boolean;
			reset?: boolean;
		};
		afterFormLoad?: ((refresh: (bool?: boolean) => void) => void) | null;
	}
	
	const {
		uid,
		title,
		caption = undefined,
		autocomplete = true,
		fullscreen = false,
		saveToLocal = true,
		saveToCloud = false,
		save = undefined,
		onInput = undefined,
		fields = {},
		debug = false,
		onSubmit = null,
		hide = undefined,
		afterFormLoad = null
	}: Props = $props();
	
	let debugData = $state<string | null>(null);

	// Internal state
	let loading = $state(true);
	let formFields = $state<(Field | Group)[]>([]);
	let autoSaveInterval = $state<NodeJS.Timeout | undefined>(undefined);
	let section = $state<Field | Group | null>(null);

	// Create lifecycle configuration object
	function getLifecycleConfig(): FormLifecycleConfig {
		return {
			uid,
			fields,
			saveToLocal,
			saveToCloud,
			save,
			debug,
			fullscreen,
			afterFormLoad,
		};
	}

	// Event handler configuration
	const eventConfig = $derived({
		formId: uid,
		formFields,
		onInput,
		save,
		saveToLocal,
		saveToCloud,
		debug,
		updateSave,
		updateDebug,
	});

	// Public API methods
	export const getFormState = () => get(FormFieldStore)[uid];
	export const reload = () => initialize(false);

	// Debug functionality
	function updateDebug(): void {
		if (debug) {
			debugData = JSON.stringify(
				{ ...get(FormFieldStore)[uid] },
				null,
				4,
			);
		} else {
			debugData = null;
		}
	}

	// Reactive statement to update debug data when debug prop changes
	$effect(() => {
		if (uid && debug !== undefined) updateDebug();
	});

	// Form submission handler
	async function submit(): Promise<void> {
		await submitForm({
			formId: uid,
			onSubmit,
		});
		updateDebug();
	}

	// Field event handlers
	async function updateField(
		event: Event,
		fieldId: string,
		groupId?: string,
	): Promise<void> {
		await handleFieldUpdate(event, fieldId, groupId, eventConfig);
	}

	async function onFocus(fieldId: string, groupId?: string): Promise<void> {
		await handleFieldFocus(fieldId, groupId, eventConfig);
	}

	function onBlur(fieldId: string, groupId?: string): void {
		handleFieldBlur(fieldId, groupId, eventConfig);
	}

	// Create lifecycle state object
	const lifecycleState = $derived({
		loading,
		formFields,
		autoSaveInterval,
		section,
	});

	// Form reset handler
	async function reset(): Promise<void> {
		const newState = await hardResetForm(
			getLifecycleConfig(),
			lifecycleState,
			updateDebug,
		);
		updateStateFromLifecycle(newState);
	}

	// Form initialization
	async function initialize(
		forceReset = false,
		isInitialLoad = false,
	): Promise<void> {
		const newState = await initializeForm(
			getLifecycleConfig(),
			lifecycleState,
			updateDebug,
			forceReset,
			isInitialLoad,
		);
		updateStateFromLifecycle(newState);
	}

	// Update local state from lifecycle state
	function updateStateFromLifecycle(newState: FormLifecycleState): void {
		loading = newState.loading;
		formFields = newState.formFields;
		autoSaveInterval = newState.autoSaveInterval;
		section = newState.section;
	}

	// Lifecycle hooks
	onMount(() => initialize(false, true));

	// Convert afterUpdate to effect
	$effect(() => {
		if (formFields.length && typeof afterFormLoad === "function") {
			afterFormLoad(reload);
		}
	});

	// Convert onDestroy to effect cleanup
	$effect(() => {
		return () => {
			cleanupForm(lifecycleState);
		};
	});

	// Functions object for FormRenderer
	const formFunctions = $derived({
		onFocus,
		onBlur,
		updateField,
		submit,
		reset,
	});
</script>

<FormRenderer
	{uid}
	{title}
	{caption}
	{hide}
	{autocomplete}
	{fullscreen}
	{formFields}
	{loading}
	functions={formFunctions}
/>
