<script lang="ts">
	import CustomStore from "../store/CustomStore";
	import FormFieldStore, { getField } from "../store/FormFieldStore";
	import FormValidationStore from "../store/FormValidationStore";
	import FormMetaStore from "../store/FormMetaStore";
	import Checkbox from "./Checkbox.svelte";
	import Dropdown from "./Dropdown.svelte";
	import Divider from "./Divider.svelte";
	import Extensions from "../static/extensions.json";
	import type { Field, Group, ValidationResult } from "../types/Form";

	export let formid: string,
		field: Field,
		group: Group = undefined,
		functions: Record<string, Function>;
	
	// Existing reactive statements - now using FormFieldStore
	// Existing reactive statements - now using FormFieldStore
	$: value =
		group === undefined
			? $FormFieldStore[formid]?.displayValues?.[field.uid]
			: $FormFieldStore[formid]?.displayValues?.[group?.meta.uid]?.[field.uid];

	$: notEmpty =
		typeof value === "string" && value.length
			? $CustomStore.names.notEmpty_safe
			: "";

	// NEW: Reactive validation feedback handling - now using FormValidationStore
	// NEW: Reactive validation feedback handling - now using FormValidationStore
	$: validationResult = group === undefined
		? $FormValidationStore[formid]?.validationResult?.[field.uid] as ValidationResult
		: $FormValidationStore[formid]?.validationResult?.[group?.meta.uid]?.[field.uid] as ValidationResult;
	
	// Check if field has been touched - now using FormMetaStore
	// Check if field has been touched - now using FormMetaStore
	$: isTouched = group === undefined
		? $FormMetaStore[formid]?.touched?.[field.uid] || false
		: $FormMetaStore[formid]?.touched?.[group?.meta.uid]?.[field.uid] || false;
	
	// Only show validation feedback if field has been touched
	$: feedbackItems = (isTouched && validationResult?.raw) ? validationResult.raw : [];
	$: hasValidationErrors = isTouched && validationResult && !validationResult.verdict;
	$: feedbackActive = feedbackItems.length > 0;

	// NEW: Reactive warning class handling (only when touched)
	$: warningClass = hasValidationErrors ? $CustomStore.names.warn : "";

	// NEW: Reactive file preview handling - now using FormFieldStore
	// NEW: Reactive file preview handling - now using FormFieldStore
	$: fieldFiles = group === undefined
		? $FormFieldStore[formid]?.fieldValues?.[field.uid]
		: $FormFieldStore[formid]?.fieldValues?.[group?.meta.uid]?.[field.uid];
	
	$: files = Array.isArray(fieldFiles) ? fieldFiles : [];
	$: hasFiles = files.length > 0;
	$: previewActive = hasFiles && field.type === "file" && !field?.hide?.preview;

	// Helper function for file icon mapping
	function getFileIcon(filename: string): string {
		const ext = filename.split(".").pop();
		return (Extensions as any)[ext || ""] || "insert_drive_file";
	}
</script>

<div
	class={`form-block type:${field.type}${
		field.disabled ? " disabled" : ""
	} ${notEmpty} ${warningClass}`}
	id={`${$CustomStore.names.blockHeader}${field.uid}`}
>
	{#if !field.hidden}
		{#if field.type && field.type === "custom"}
			<div>{@html field.body ? decodeURIComponent(field.body) : ''}</div>
		{:else}
			{#if field.type === "textarea"}
				<textarea
					id={`${$CustomStore.names.inputHeader}${field.uid}`}
					class={`field ${field.redact ? "redact" : ""}`}
					name={field.name}
					placeholder={field.placeholder}
					disabled={field.disabled}
					aria-labelledby={`${$CustomStore.names.label}${field.uid}`}
					aria-disabled={field.disabled}
					aria-required={field.required}
					spellcheck={`${field.spellcheck}`}
					{value}
					on:focus={() =>
						functions.onFocus(field.uid, group?.meta.uid)}
					on:blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					on:input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid,
						)}
				/>
			{:else if field.type === "file" && field.custom}
				<button
					id={`${$CustomStore.names.inputHeader}${field.uid}`}
					class={`field ${field.redact ? "redact" : ""}`}
					name={field.name}
					title={`click to choose ${
						field.multiple ? `files` : `a file`
					} or drag and drop ${
						field.multiple ? `files` : `a file`
					} onto the button`}
					aria-labelledby={`${$CustomStore.names.label}${field.uid}`}
					on:click={(event) => {
						event.preventDefault();
						document
							.getElementById(
								`${$CustomStore.names.inputHeader}${field.uid}`,
							)
							.click();
					}}
					on:drop={null}
					on:dragenter={null}
					on:dragover={null}
					on:dragleave={null}
				>
					{(() => {
						const fieldData = getField(formid, field.uid, group?.meta.uid);
						if (Array.isArray(fieldData) && fieldData.length > 0) {
							const fileData = fieldData[0];
							if (typeof fileData === 'object' && fileData !== null && 'meta' in fileData && fileData.meta?.name) {
								return decodeURIComponent(fileData.meta.name);
							}
						}
						return `click to choose ${field.multiple ? 'files' : 'a file'}`;
					})()}
				</button>
				<input
					id={`${$CustomStore.names.inputHeader}${field.uid}`}
					class={`field ${field.redact ? "redact" : ""}`}
					name={field.name}
					type={field.type}
					accept={field.accept}
					placeholder={field.placeholder}
					disabled={field.disabled}
					aria-labelledby={`${$CustomStore.names.label}${field.uid}`}
					aria-required={field.required}
					aria-disabled={field.disabled}
					aria-hidden="true"
					style={`display: none`}
					on:focus={() =>
						functions.onFocus(field.uid, group?.meta.uid)}
					on:blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					on:input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid,
						)}
				/>
			{:else if ["dropdown", "radio"].includes(field.type)}
				<Dropdown
					id={`${field.uid}`}
					name={field.name}
					placeholder={field.placeholder}
					disabled={field.disabled}
					multiple={field.multiple}
					compact={field.compact}
					options={field.options}
					edit={field.edit}
					{value}
					data={getField(formid, field.uid, group?.meta.uid) || {}}
					focus={() => functions.onFocus(field.uid, group?.meta.uid)}
					blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid,
						)}
				/>
			{:else if ["checkbox", "switch"].includes(field.type)}
				<Checkbox
					type={field.type}
					id={`${field.uid}`}
					name={field.name}
					placeholder={field.placeholder}
					icon={typeof field.icon === "object"
						? field.icon
						: undefined}
					disabled={field.disabled}
					redact={field.redact}
					data={!!getField(formid, field.uid, group?.meta.uid)}
					focus={() => functions.onFocus(field.uid, group?.meta.uid)}
					blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid,
						)}
				/>
			{:else if field.type === "divider"}
				<Divider
					id={`${$CustomStore.names.visualHeader}${field.uid}`}
					name={field.name}
					icon={typeof field.icon === "string"
						? field.icon
						: undefined}
				/>
			{:else}
				<input
					id={`${$CustomStore.names.inputHeader}${field.uid}`}
					class={`field ${field.redact ? "redact" : ""}`}
					name={field.name}
					type={field.type}
					accept={field.accept}
					placeholder={field.placeholder}
					autocomplete={field.autocomplete}
					spellcheck={`${field.spellcheck}`}
					disabled={field.disabled}
					aria-labelledby={`${$CustomStore.names.label}${field.uid}`}
					aria-disabled={field.disabled}
					multiple={field.multiple ? true : null}
					value={field.type === "file" ? null : value}
					on:focus={() =>
						functions.onFocus(field.uid, group?.meta.uid)}
					on:blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					on:input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid,
						)}
				/>
			{/if}
			<label
				class={field?.hide?.label ? "for-aria" : undefined}
				id={`${$CustomStore.names.label}${field.uid}`}
				for={`${$CustomStore.names.inputHeader}${field.uid}`}
				tabindex="-1"
			>
				{field.name}
				{#if field.required}<em aria-hidden="true">*required</em><span
						class="for-aria">required</span
					>{/if}
				{#if field.tooltip}<span class="for-aria"
						>Tooltip: {field.tooltip}</span
					>{/if}
			</label>
		{/if}
	{/if}
	{#if field.tooltip}
		<div class="container-tooltip" aria-hidden="true">
			{#if $CustomStore.icons.tooltip}
				<span aria-hidden="true" class="material-icons"
					>{$CustomStore.icons.tooltip}</span
				>
			{/if}
			<p>
				{field.tooltip}
			</p>
		</div>
	{/if}
	{#if !group?.meta?.override?.feedback && field.validity}
		<div
			class={`container-validity ${feedbackActive ? "active" : ""}`}
			id={`${$CustomStore.names.inputFeedback}${field.uid}`}
			aria-live="polite"
		>
			{#each feedbackItems as item, index}
				<p class="condition-{item.verdict}">
					<span class="for-aria">feedback {index + 1} {item.verdict ? 'is' : 'is NOT'} valid;</span>
					{item.feedback}
					<span class="for-aria">.</span>
				</p>
			{/each}
		</div>
	{/if}
	{#if field.type === "file" && !field?.hide?.preview}
		<div
			class={`container-preview ${previewActive ? "active" : ""} ${
				field.redact ? $CustomStore.names.redact : ""
			}`}
			id={`${$CustomStore.names.inputPreview}${field.uid}`}
			aria-live="polite"
		>
			{#each files as file}
				<div class="preview" title={decodeURIComponent(file.meta.name)}>
					<span class="material-icons">{getFileIcon(decodeURIComponent(file.meta.name))}</span>
					<p>{decodeURIComponent(file.meta.name)}</p>
				</div>
			{/each}
		</div>
	{/if}
</div>
