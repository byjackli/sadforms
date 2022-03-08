<script>
	import { afterUpdate, onDestroy, onMount } from "svelte";
	import Extensions from "../static/extensions.json";
	import Field from "./Field.svelte";
	import { belongs } from "../tools/kit";
	import CustomStore from "../store/CustomStore";
	import FormStore, {
		setEntry,
		getEntry,
		existsEntry,
		updateSave,
		clearSave,
		loadSave,
	} from "../store/FormStore";
	// NOTES: implement saveToCloud at critical points
	//  ie setInterval, onVisibilityChange, onbeforeunload, changePage, manual saves

	export let uid,
		title,
		caption = undefined,
		autocomplete = true,
		fullscreen = false,
		saveToLocal = false, // managed by Form (automatic)
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
		submitting = false,
		section = null,
		autoNav = [];
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
		const greenlight = (await checkValidity()).verdict;

		setEntry(uid, "submit", true, "submitting");
		setEntry(uid, "submit", true, "attempted");

		if (!greenlight) {
			//  updateFeedback
			for (const [key, value] of Object.entries($FormStore[uid].verdict))
				if (belongs(value, "group")) {
					for (const nested of Object.entries(value))
						if (!nested[1].verdict)
							updateFeedback(nested[0], key, nested[1]);
				} else if (!value.verdict)
					updateFeedback(
						key,
						undefined,
						await checkValidity("field", key, undefined)
					);

			setEntry(uid, "submit", false, "accepted");
		} else if (onSubmit) {
			const success = await onSubmit($FormStore[uid]);
			setEntry(uid, "submit", success, "accepted");
		} else setEntry(uid, "submit", true, "accepted");

		setEntry(uid, "submit", false, "submitting");
		updateDebug();
	}

	function checkEmpty(fieldid, groupid) {
		const field = fieldData({ action: "get" }, fieldid, groupid);
		return (
			field === "" ||
			field === undefined ||
			field === null ||
			(typeof field === "object" && Object.entries(field).length === 0)
		);
	}

	export async function checkValidity(type, fieldid, groupid) {
		if (type === "form" || fieldid === undefined) {
			for (const block of Object.values(getEntry(uid, "verdict"))) {
				const verdict = block.group
					? block.group.verdict
					: block.verdict;
				if (!verdict) return { verdict };
			}
			return { verdict: true };
		}

		const isEmpty = checkEmpty(fieldid, groupid),
			isRequired = getEntry(uid, "required", fieldid, groupid);

		let verdict = isRequired ? !(isRequired && isEmpty) : true,
			raw = [],
			group = undefined;

		if (type === "field") {
			const func = getEntry(uid, "validity", fieldid, groupid);
			if (func) {
				const conditions = func(
					fieldData({ action: "get" }, fieldid, groupid)
				);
				for (const condition of Object.values(conditions)) {
					const expression = await condition.check,
						feedback =
							condition[expression] === undefined
								? condition.true
								: condition[expression];

					verdict = verdict && expression;
					raw.push({ verdict: expression, feedback });
				}
			}
		}
		setEntry(uid, "verdict", { verdict, raw }, fieldid, groupid);

		if (groupid || type === "group") {
			group = { verdict: true, raw: [] };

			for (const [key, value] of Object.entries(
				getEntry(uid, "verdict", groupid)
			)) {
				if (key === "group") continue;
				group.verdict = group.verdict && value.verdict;
				if (Array.isArray(value.raw)) group.raw.push(...value.raw);
			}
			setEntry(uid, "verdict", group, "group", groupid);
		}

		return { verdict, raw };
	}
	async function updateFeedback(fieldid, groupid, validation) {
		const groupOnly =
			groupid && getEntry(uid, "group", groupid)?.group?.feedback;
		let { verdict, raw } = validation,
			block = document.getElementById(
				`${$CustomStore.names.inputFeedback}${fieldid}`
			),
			count = 1;

		if (groupOnly) {
			block = document.getElementById(
				`${$CustomStore.names.groupFeedback}${groupid}`
			);
			raw = getEntry(uid, "verdict", groupid).group.raw;
		}
		if (!block) return;

		if (!block?.classList.contains("active"))
			block.classList.toggle("active");

		function build(feedback, expression) {
			const p = document.createElement("p"),
				t = document.createTextNode(feedback),
				aria = document.createElement("span"),
				ariaSays = document.createTextNode(
					`feedback ${count} ${expression ? `is` : `is NOT`} valid;`
				),
				breathe = document.createElement("span"),
				punc = document.createTextNode(".");
			count++;

			p.classList.add(`condition-${expression}`);
			p.appendChild(t);

			aria.setAttribute("class", "for-aria");
			aria.appendChild(ariaSays);

			breathe.setAttribute("class", "for-aria");
			breathe.appendChild(punc);

			p.prepend(aria);
			p.append(breathe);
			return p;
		}

		block.innerHTML = "";
		for (const { feedback, verdict } of raw)
			block.appendChild(build(feedback, verdict));
		updateWarn(fieldid, groupid, verdict);
	}
	function updateWarn(fieldid, groupid, fieldVerdict) {
		const block = document.getElementById(
				`${$CustomStore.names.blockHeader}${fieldid}`
			),
			blockWarned = block?.classList.contains($CustomStore.names.warn);

		if (fieldVerdict === blockWarned)
			block.classList.toggle($CustomStore.names.warn);
		if (groupid && getEntry(uid, "group", groupid).required) {
			const group = document.getElementById(
					`${$CustomStore.names.groupHeader}${groupid}`
				),
				groupWarned = group.classList.contains($CustomStore.names.warn),
				groupVerdict = getEntry(uid, "verdict", groupid).group.verdict;

			if (
				(!groupWarned && !groupVerdict) ||
				(groupWarned && groupVerdict)
			)
				group.classList.toggle($CustomStore.names.warn);
		}
	}
	function updatePreview(fieldid, groupid) {
		const files = fieldData({ action: "get" }, fieldid, groupid),
			block = document.getElementById(
				`${$CustomStore.names.inputPreview}${fieldid}`
			),
			active = block.classList.contains("active");

		if ((!active && files.length) || (active && !files.length))
			block.classList.toggle("active");

		let strings = ``;
		for (const { base64, meta } of files) {
			console.info(
				"%c BLOB OF FILE",
				"background-color: red; color: white;",
				getBlob(base64)
			);
			let ext = meta.name.split(".");
			ext = Extensions[ext[ext.length - 1]];

			if (ext === undefined) ext = "insert_drive_file";
			strings += `<div class="preview" title="${meta.name}"><span class="material-icons">${ext}</span><p>${meta.name}</p></div>`;
		}
		console.info(
			"%c Preview ",
			"background-color: indigo; color: skyblue; ",
			files
		);

		block.innerHTML = strings;
	}
	async function updateField(event, fieldid, groupid) {
		let data = event.target.value,
			localOnInput = getEntry(uid, "onInput", fieldid, groupid);

		if (localOnInput) localOnInput(event.target);
		if (event.type === "drop" || event?.target?.files) {
			data =
				event.type === "drop"
					? event.dataTransfer.files[0]
					: await getData(event.target.files);
		}

		fieldData({ action: "set", data }, fieldid, groupid);
		fieldValue(fieldid, groupid);

		if (getEntry(uid, "preview", fieldid, groupid))
			updatePreview(fieldid, groupid);
		if (getEntry(uid, "validity", fieldid, groupid))
			updateFeedback(
				fieldid,
				groupid,
				await checkValidity("field", fieldid, groupid)
			);
		else if (getEntry(uid, "required", fieldid, groupid))
			updateWarn(
				fieldid,
				groupid,
				(await checkValidity("field", fieldid, groupid)).verdict
			);

		if (typeof onInput === "function") onInput($FormStore[uid]);
		if (save?.saveOnInput) updateSave(uid, saveToLocal, saveToCloud);
		updateDebug();
	}
	function updateDebug() {
		if (debug) debugData = JSON.stringify({ ...$FormStore[uid] }, null, 4);
	}

	async function onFocus(fieldid, groupid) {
		setEntry(uid, "touched", true, fieldid, groupid);
		setEntry(uid, "active", true, fieldid, groupid);
		if (getEntry(uid, "redact", fieldid, groupid))
			fieldValue(fieldid, groupid);
		if (getEntry(uid, "validity", fieldid, groupid)) {
			const result = await checkValidity("field", fieldid, groupid);
			if (!result.verdict) updateFeedback(fieldid, groupid, result);
		} else if (getEntry(uid, "required", fieldid, groupid))
			updateWarn(
				fieldid,
				groupid,
				(await checkValidity("field", fieldid, groupid)).verdict
			);
		updateDebug();
	}
	function onBlur(fieldid, groupid) {
		setEntry(uid, "active", false, fieldid, groupid);
		if (getEntry(uid, "redact", fieldid, groupid))
			setEntry(uid, "value", "[redacted]", fieldid, groupid);
		updateDebug();
	}

	function fieldData(payload, fieldid, groupid) {
		const dontSave = existsEntry(uid, "dontSave", fieldid, groupid),
			verdict =
				dontSave || (payload.verdict !== undefined && payload.verdict);

		if (["set", "init"].includes(payload.action))
			return verdict
				? setEntry(
						uid,
						"dontSave",
						{ verdict, data: payload.data },
						fieldid,
						groupid
				  )
				: setEntry(uid, "data", payload.data, fieldid, groupid);
		else if (payload.action === "get")
			return verdict
				? getEntry(uid, "dontSave", fieldid, groupid).data
				: getEntry(uid, "data", fieldid, groupid);
		else if (payload.action === "exists")
			return dontSave || existsEntry(uid, "data", fieldid, groupid);
	}
	function fieldValue(fieldid, groupid, verdict) {
		const exists = fieldData(
			{ verdict, action: "exists" },
			fieldid,
			groupid
		);
		let data;

		if (exists) {
			data = fieldData({ verdict, action: "get" }, fieldid, groupid);

			if (typeof data === "object") {
				const array = Object.values(data);
				data = array;
			}
		} else data = "";

		setEntry(uid, "value", data, fieldid, groupid);
	}

	// TO DO: Turn this feature into a service worker.
	async function getData(input) {
		let arr = [];
		for (const file of Object.values(input)) {
			console.info(file);
			const meta = {
					name: file.name,
					lastModified: file.lastModified,
					lastModifiedDate: file.lastModifiedDate,
				},
				base64 = await getBase64(file);
			console.info(
				"%c file: ",
				"background-color: brown; color: orange; ",
				base64
			);
			arr.push({ base64, meta });
		}

		return arr;
	}
	async function getBase64(file) {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);

			reader.onload = () => resolve(reader.result);
			reader.onerror = (error) => reject(error);
		});
	}
	async function getBlob(base64) {
		const res = await fetch(base64),
			blob = await res.blob();
		return blob;
	}

	function loadBlank(type) {
		if (["dropdown", "radio"].includes(type)) return {};
		else if (type === "checkbox") return undefined;
		else if (type === "file") return undefined;
		else return "";
	}
	async function loadGroup(group) {
		setEntry(uid, "group", group.meta, group.meta.uid);
	}
	async function loadField(field, group) {
		let g = group?.meta;
		const verdict = field.dontSave || g?.dontSave;

		if (!fieldData({ action: "exists" }, field.uid, g?.uid)) {
			const data =
				field.defaultValue !== undefined && field.defaultValue !== null
					? field.defaultValue
					: loadBlank(field.type);
			fieldData({ verdict, action: "init", data }, field.uid, g?.uid);
			setEntry(uid, "value", data, field.uid, g?.uid);
		}
		if (field.onInput)
			setEntry(uid, "onInput", field.onInput, field.uid, g?.uid);

		if (field.redact || (g && g.redact)) {
			setEntry(
				uid,
				"redact",
				g ? g.redact : field.redact,
				field.uid,
				g?.uid
			);
			setEntry(uid, "value", "[redacted]", field.uid, g?.uid);
		} else fieldValue(field.uid, g?.uid, verdict);

		setEntry(uid, "active", false, field.uid, g?.uid);
		if (field.required || (g && g.required)) {
			setEntry(
				uid,
				"required",
				g ? (g.required ? g.required : field.required) : field.required,
				field.uid,
				g?.uid
			);
			await checkValidity("field", field.uid, g?.uid);
		}

		if (field.validity) {
			setEntry(uid, "validity", field.validity, field.uid, g?.uid);
			await checkValidity("field", field.uid, g?.uid);
		}

		if (field.type === "file" && field?.hide?.preview === undefined) {
			setEntry(uid, "preview", true, field.uid, g?.uid);
			if (fieldData({ action: "get" }, field.uid, g?.uid))
				updatePreview(field.uid);
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

	function load(type, clean) {
		if (type === "init") {
			console.log(
				"This app takes advantage of Sad Forms.\nLearn more at https://sadforms.com"
			);
		}

		fieldsArr = Object.values(fields);
		loading = false;

		loadSave(uid, saveToLocal, saveToCloud, clean);
		loadAllFields();
		updateSave(uid, saveToLocal, saveToCloud);
		updateDebug();

		if (typeof save?.saveAuto === "number")
			autoSaveInterval = setInterval(
				updateSave,
				save.saveAuto,
				uid,
				saveToCloud,
				saveToLocal
			);
		if (fullscreen) section = fieldsArr[0];
	}

	onMount(() => load("init"));
	afterUpdate(() => {
		if (fieldsArr.length && typeof afterFormLoad === "function")
			afterFormLoad(refresh);
	});
	onDestroy(() => {
		clearInterval(autoSaveInterval);
	});
</script>

<!-- <svelte:window on:keydown={changePageShortcut} /> -->

<div id={uid} class="form-container">
	{#if fieldsArr && !loading}
		{#if !fullscreen && !hide?.title}<h2>{title}</h2>{/if}
		{#if !hide?.caption && caption !== undefined}<p>{caption}</p>{/if}
		<form
			class="sadforms"
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
							{#if group.meta?.group?.label}
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
						{#if group.meta?.group?.feedback}
							<div
								class="form-group-feedback"
								id={`${$CustomStore.names.groupFeedback}${group.meta.uid}`}
							/>
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
							load(undefined, true);
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
