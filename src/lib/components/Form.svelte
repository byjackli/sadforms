<script>
	import { afterUpdate, onDestroy, onMount } from "svelte";
	import Field from "./Field.svelte";
	import { belongs } from "../tools/kit";
	import CustomStore from "../store/CustomStore";
	import FormStore, {
		setFieldProp,
		getFieldProp,
		updateSave,
		clearSave,
		loadSave,
		manageFieldStorage,
	} from "../store/FormStore";
	import { FIELD_TYPES, BRANDING } from "../constants";
	import { loadBlank } from "../utils/formHelpers";
	import {
		checkValidity,
		updateFeedback,
		updateWarn,
		updatePreview,
	} from "../services/validationService";
	// NOTES: implement saveToCloud at critical points
	//  ie setInterval, onVisibilityChange, onbeforeunload, changePage, manual saves

	export let uid,
		title,
		caption = undefined,
		autocomplete = true,
		fullscreen = false,
		saveToLocal = true, // managed by Form (automatic) - offline mode enabled by default
		saveToCloud = false, // managed by developer (manual)
		save = undefined,
		onInput = undefined,
		fields = undefined,
		debug = false,
		debugData = null,
		onSubmit = null,
		hide = undefined,
		afterFormLoad = null;

	let loading = true,
		autoSaveInterval = undefined,
		section = null;

	$: localFields = $$props && fields;
	$: fieldsArr = [];

	// NOTE ***
	// Developer is responsible for generating their own unique id per form

	//  enables reactive form
	export const details = () => $FormStore[uid];
	export const refresh = load;

	// function changePage(value) {
	//     const navShow = this.state.navShow,
	//         navHide = this.state.navHide,
	//         navAuto = this.state.navAuto,
	//         maxPage = navShow.length + navHide.length,
	//         prev = this.state.cursor - 1;

	//     if (!navAuto.includes(cursor) || auto) {
	//         if (value === `-1` && 0 < cursor) {
	//             if (navHide.includes(prev)) {
	//                 for (const [i, el] of navShow.entries()) {
	//                     if (prev < el && 0 <= i - 1) {
	//                         cursor = navShow[i - 1];
	//                         break;
	//                     }
	//                 }
	//             } else {
	//                 cursor -= 1;
	//             }
	//         } else if (
	//             value === `+1` &&
	//             cursor + 1 < maxPage &&
	//             this.checkValidity(cursor)
	//         ) {
	//             cursor += 1;
	//         } else if (value !== `+1` && value !== `-1`) {
	//             if (value < cursor) {
	//                 cursor = value;
	//             } else if (cursor < value && this.checkValidity(value - 1)) {
	//                 cursor = value;
	//             }
	//         }
	//         this.setState({ cursor });
	//     }
	// }
	// function changePageShortcut(event) {
	//     if (!fullscreen) return;
	//     if (event.key === `Enter`) {
	//         event.preventDefault();
	//         if (event.ctrlKey && event.shiftKey) changePage(`-1`);
	//         else if (event.shiftKey) changePage(`+1`);
	//     }
	// }

	async function submit() {
		const greenlight = (await checkValidity(uid, "form")).verdict;

		setFieldProp(uid, "submit", true, "submitting");
		setFieldProp(uid, "submit", true, "attempted");

		if (!greenlight) {
			//  updateFeedback
			for (const [key, value] of Object.entries($FormStore[uid].verdict))
				if (belongs(value, "group")) {
					for (const nested of Object.entries(value))
						if (!nested[1].verdict)
							updateFeedback(uid, nested[0], key, nested[1]);
				} else if (!value.verdict)
					updateFeedback(
						uid,
						key,
						undefined,
						await checkValidity(uid, "field", key, undefined),
					);

			setFieldProp(uid, "submit", false, "accepted");
		} else if (onSubmit) {
			const success = await onSubmit($FormStore[uid]);
			setFieldProp(uid, "submit", success, "accepted");
		} else setFieldProp(uid, "submit", true, "accepted");

		setFieldProp(uid, "submit", false, "submitting");
		updateDebug();
	}

	async function updateField(event, fieldid, groupid) {
		let data = event.target.value,
			localOnInput = getFieldProp(uid, "onInput", fieldid, groupid);

		let dontSave = false;
		if (groupid) {
			const group = fieldsArr.find(
				(item) => item.meta && item.meta.uid === groupid,
			);
			if (group) {
				dontSave = group[fieldid]?.dontSave;
			}
		} else {
			const field = fieldsArr.find(
				(item) => !item.meta && item.uid === fieldid,
			);
			dontSave = field?.dontSave;
		}

		if (localOnInput) localOnInput(event.target);
		if (event.type === "drop" || event?.target?.files) {
			const { getData } = await import("../utils/formHelpers");
			data =
				event.type === "drop"
					? event.dataTransfer.files[0]
					: await getData(event.target.files);
		}

		manageFieldStorage(
			uid,
			{ action: "set", data, dontSave },
			fieldid,
			groupid,
		);
		fieldValue(fieldid, groupid);

		if (getFieldProp(uid, "preview", fieldid, groupid))
			updatePreview(uid, fieldid, groupid);
		if (getFieldProp(uid, "validity", fieldid, groupid))
			updateFeedback(
				uid,
				fieldid,
				groupid,
				await checkValidity(uid, "field", fieldid, groupid),
			);
		else if (getFieldProp(uid, "required", fieldid, groupid))
			updateWarn(
				uid,
				fieldid,
				groupid,
				(await checkValidity(uid, "field", fieldid, groupid)).verdict,
			);

		if (typeof onInput === "function") onInput($FormStore[uid]);
		if (save?.saveOnInput) updateSave(uid, saveToLocal, saveToCloud);
		updateDebug();
	}
	function updateDebug() {
		if (debug) debugData = JSON.stringify({ ...$FormStore[uid] }, null, 4);
	}

	async function onFocus(fieldid, groupid) {
		setFieldProp(uid, "touched", true, fieldid, groupid);
		setFieldProp(uid, "active", true, fieldid, groupid);
		if (getFieldProp(uid, "redact", fieldid, groupid))
			fieldValue(fieldid, groupid);
		if (getFieldProp(uid, "validity", fieldid, groupid)) {
			const result = await checkValidity(uid, "field", fieldid, groupid);
			if (!result.verdict) updateFeedback(uid, fieldid, groupid, result);
		} else if (getFieldProp(uid, "required", fieldid, groupid))
			updateWarn(
				uid,
				fieldid,
				groupid,
				(await checkValidity(uid, "field", fieldid, groupid)).verdict,
			);
		updateDebug();
	}
	function onBlur(fieldid, groupid) {
		setFieldProp(uid, "active", false, fieldid, groupid);
		if (getFieldProp(uid, "redact", fieldid, groupid))
			setFieldProp(uid, "value", "[redacted]", fieldid, groupid);
		updateDebug();
	}

	function fieldValue(fieldid, groupid, dontSave) {
		const exists = manageFieldStorage(
			uid,
			{ dontSave, action: "exists" },
			fieldid,
			groupid,
		);
		let data;

		if (exists) {
			data = manageFieldStorage(
				uid,
				{ dontSave, action: "get" },
				fieldid,
				groupid,
			);

			if (typeof data === "object") {
				const array = Object.values(data);
				data = array;
			}
		} else data = "";

		setFieldProp(uid, "value", data, fieldid, groupid);
	}

	async function loadGroup(group) {
		setFieldProp(uid, "group", group.meta, group.meta.uid);
	}
	async function loadField(field, group) {
		let g = group?.meta;
		const dontSave = field.dontSave || g?.dontSave;

		if (!manageFieldStorage(uid, { action: "exists" }, field.uid, g?.uid)) {
			const data =
				field.defaultValue !== undefined && field.defaultValue !== null
					? field.defaultValue
					: loadBlank(field.type);
			manageFieldStorage(
				uid,
				{ dontSave, action: "init", data },
				field.uid,
				g?.uid,
			);
			setFieldProp(uid, "value", data, field.uid, g?.uid);
		}
		if (field.onInput)
			setFieldProp(uid, "onInput", field.onInput, field.uid, g?.uid);

		if (field.redact || (g && g.redact)) {
			setFieldProp(
				uid,
				"redact",
				(g && g.redact) || field.redact,
				field.uid,
				g?.uid,
			);
			setFieldProp(uid, "value", "[redacted]", field.uid, g?.uid);
		} else fieldValue(field.uid, g?.uid, dontSave);

		setFieldProp(uid, "active", false, field.uid, g?.uid);
		if (field.required || (g && g.required)) {
			setFieldProp(
				uid,
				"required",
				g ? (g.required ? g.required : field.required) : field.required,
				field.uid,
				g?.uid,
			);
			await checkValidity(uid, "field", field.uid, g?.uid);
		}

		if (field.validity) {
			setFieldProp(uid, "validity", field.validity, field.uid, g?.uid);
			await checkValidity(uid, "field", field.uid, g?.uid);
		}

		if (field.type === FIELD_TYPES.FILE && !field?.hide?.preview) {
			setFieldProp(uid, "preview", true, field.uid, g?.uid);
			if (manageFieldStorage(uid, { action: "get" }, field.uid, g?.uid))
				updatePreview(uid, field.uid, g?.uid);
		}
	}
	function loadAllFields() {
		fieldsArr.forEach((block) => {
			if (block.meta) {
				Object.values(block).forEach((field, i) => {
					if (i) loadField(field, block);
					else loadGroup(block);
				});
			} else loadField(block);
		});
	}

	function load(forceReset, init = false) {
		if (init) {
			console.log(BRANDING.MESSAGE);
		}

		fieldsArr = Object.values(localFields);
		loading = false;

		loadSave(uid, saveToLocal, saveToCloud, forceReset);
		loadAllFields();
		updateSave(uid, saveToLocal, saveToCloud);
		updateDebug();

		if (typeof save?.saveAuto === "number")
			autoSaveInterval = setInterval(
				updateSave,
				save.saveAuto,
				uid,
				saveToCloud,
				saveToLocal,
			);
		if (fullscreen) section = fieldsArr[0];
	}

	onMount(() => load(false, true));
	afterUpdate(() => {
		if (fieldsArr.length && typeof afterFormLoad === "function")
			afterFormLoad(refresh);
	});
	onDestroy(() => {
		clearInterval(autoSaveInterval);
	});
</script>

<!-- <svelte:window on:keydown={changePageShortcut} /> -->

<div id={uid} class="sf sf-container">
	{#if fieldsArr && !loading}
		{#if !fullscreen && !hide?.title}<h2>{title}</h2>{/if}
		{#if !hide?.caption && caption !== undefined}<p>{caption}</p>{/if}
		<form
			autocomplete={autocomplete ? "on" : "off"}
			tabindex="-1"
			on:submit|preventDefault={submit}
		>
			{#each fieldsArr as group (group)}
				{#if group.meta}
					<div
						class="form-group"
						role="group"
						id={`${$CustomStore.names.groupHeader}${group.meta.uid}`}
					>
						<div class="items">
							{#if group.meta?.override?.label}
								<legend>
									{group.meta.name}
									{#if group.meta.required}<em>*required</em
										>{/if}
								</legend>
							{/if}
							{#each Object.values(group) as field, i}
								{#if i}
									<Field
										formid={uid}
										{field}
										{group}
										functions={{
											onFocus,
											onBlur,
											updateField,
										}}
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
										>{$CustomStore.icons.tooltip}</span
									>
								{/if}
								<p>
									{group.meta?.tooltip}
								</p>
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
					<Field
						formid={uid}
						field={group}
						functions={{ onFocus, onBlur, updateField }}
					/>
				{/if}
			{/each}
			<div class="trailingButtons">
				{#if !hide?.reset}
					<input
						class="field"
						type="button"
						value="reset"
						on:click|preventDefault={() => {
							load(true);
						}}
					/>
				{/if}
				{#if !hide?.submit}
					<input
						class="field"
						type="submit"
						value="submit"
						on:click|preventDefault={submit}
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
