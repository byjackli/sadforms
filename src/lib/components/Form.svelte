<script lang="ts">
	import { afterUpdate, onDestroy, onMount } from "svelte";
	import { get } from "svelte/store";
	import FormRenderer from "./FormRenderer.svelte";
	import FormStore from "../store/FormStore";
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
	import { updateSave } from "../store/FormStore";
	import type { Field, Group } from "../types/Form";

	// Form configuration props
	export let uid: string;
	export let title: string;
	export let caption: string | undefined = undefined;
	export let autocomplete = true;
	export let fullscreen = false;
	export let saveToLocal = true;
	export let saveToCloud = false;
	export let save:
		| {
				saveAuto: number | false;
				saveOnInput: boolean;
		  }
		| undefined = undefined;
	export let onInput: ((formData: any) => void) | undefined = undefined;
	export let fields: Record<string, Field | Group> = {};
	export let debug = false;
	export let debugData: string | null = null;
	export let onSubmit:
		| ((formData: any, formId: string) => void | Promise<void>)
		| null = null;
	export let hide:
		| {
				title?: boolean;
				caption?: boolean;
				submit?: boolean;
				reset?: boolean;
		  }
		| undefined = undefined;
	export let afterFormLoad:
		| ((refresh: (bool?: boolean) => void) => void)
		| null = null;

	// Internal state
	let loading = true;
	let formFields: (Field | Group)[] = [];
	let autoSaveInterval: NodeJS.Timeout | undefined = undefined;
	let section: Field | Group | null = null;

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
	$: eventConfig = {
		formId: uid,
		formFields,
		onInput,
		save,
		saveToLocal,
		saveToCloud,
		debug,
		updateSave,
		updateDebug,
	};

	// Public API methods
	export const getFormState = () => get(FormStore)[uid];
	export const reload = () => initialize(false);

	// Debug functionality
	function updateDebug(): void {
		if (debug) {
			debugData = JSON.stringify({ ...get(FormStore)[uid] }, null, 4);
		} else {
			debugData = null;
		}
	}

	// Reactive statement to update debug data when debug prop changes
	$: if (uid && debug !== undefined) updateDebug();

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
	$: lifecycleState = {
		loading,
		formFields,
		autoSaveInterval,
		section,
	};

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

	afterUpdate(() => {
		if (formFields.length && typeof afterFormLoad === "function") {
			afterFormLoad(reload);
		}
	});

	onDestroy(() => {
		cleanupForm(lifecycleState);
	});

	// Functions object for FormRenderer
	$: formFunctions = {
		onFocus,
		onBlur,
		updateField,
		submit,
		reset,
	};
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
