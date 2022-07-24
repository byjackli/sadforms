<script lang="ts">
	import CustomStore from "../store/CustomStore";
	import FormStore, { fieldData } from "../store/FormStore";
	import Checkbox from "./Checkbox.svelte";
	import Dropdown from "./Dropdown.svelte";
	import Divider from "./Divider.svelte";
	import type { Field, Group } from "../types/Form";

	export let formid: string,
		field: Field,
		group: Group = undefined,
		functions: Record<string, Function>;
	$: value =
		group === undefined
			? $FormStore[formid].value[field.uid]
			: $FormStore[formid].value[group?.meta.uid][field.uid];

	$: notEmpty =
		typeof value === "string" && value.length
			? $CustomStore.names.notEmpty_safe
			: "";
</script>

<div
	class={`form-block type:${field.type}${
		field.disabled ? " disabled" : ""
	}${field.class ? ` ${field.class}` : ""} ${notEmpty}`}
	id={`${$CustomStore.names.blockHeader}${field.uid}`}
>
	{#if !field.hidden}
		{#if field.type && field.type === "custom"}
			<div>{field.body}</div>
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
							group?.meta.uid
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
								`${$CustomStore.names.inputHeader}${field.uid}`
							)
							.click();
					}}
					on:drop={null}
					on:dragenter={null}
					on:dragover={null}
					on:dragleave={null}
				>
					{fieldData(
						formid,
						{ action: "get" },
						field.uid,
						group?.meta.uid
					)
						? fieldData(
								formid,
								{ action: "get" },
								field.uid,
								group?.meta.uid
						  ).name
						: `click to choose ${
								field.multiple ? `files` : `a file`
						  }`}
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
							group?.meta.uid
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
					data={fieldData(
						formid,
						{ action: "get" },
						field.uid,
						group?.meta.uid
					)}
					focus={() => functions.onFocus(field.uid, group?.meta.uid)}
					blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid
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
					data={fieldData(
						formid,
						{ action: "get" },
						field.uid,
						group?.meta.uid
					)}
					focus={() => functions.onFocus(field.uid, group?.meta.uid)}
					blur={() => functions.onBlur(field.uid, group?.meta.uid)}
					input={async (event) =>
						await functions.updateField(
							event,
							field.uid,
							group?.meta.uid
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
							group?.meta.uid
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
			class="container-validity"
			id={`${$CustomStore.names.inputFeedback}${field.uid}`}
			aria-live="polite"
		/>
	{/if}
	{#if field.type === "file" && !field?.hide?.preview}
		<div
			class={`container-preview ${
				field.redact ? $CustomStore.names.redact : ""
			}`}
			id={`${$CustomStore.names.inputPreview}${field.uid}`}
			aria-live="polite"
		/>
	{/if}
</div>
