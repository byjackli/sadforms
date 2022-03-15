<script lang="ts">
	import { beforeUpdate, onDestroy, onMount } from "svelte";
	import { belongs, uuidV4 } from "../tools/kit";
	import DropdownStore, {
		updateCallback,
		updateDropdown,
	} from "../store/DropdownStore";
	import CustomStore from "../store/CustomStore";
	import type { Options, Edit } from "../types/Form";

	export let id: string,
		name: string,
		placeholder: string = undefined,
		disabled: boolean = false,
		multiple: boolean = false,
		compact: boolean = true,
		value: string | string[] = "",
		data: Record<string, string> = {},
		options: Options,
		edit: Edit = undefined,
		focus: Function,
		blur: Function,
		input: Function;

	let fullId: string = `${$CustomStore.names.inputHeader}${id}`,
		label: HTMLElement = undefined,
		dropdown: HTMLElement = undefined,
		prevId: string = undefined,
		cur: number = 0,
		curMax: number = 0,
		size: number,
		removedList: Record<string, string> = {};

	$: expanded = $DropdownStore.id === fullId && $DropdownStore.expanded;
	$: add = {
		added: 0,
		removed: 0,
		field: undefined,
		value: "",
	};
	$: localData = $$props && data;

	function localBelongs(object: object, key: string): boolean {
		return multiple ? belongs(object, key) : options[cur].uid === key;
	}
	function makeToData(options: Options): Record<string, string> {
		const data = {};
		for (const option of options) data[option.uid] = option.name;
		return data;
	}

	function updateCursor(uid: string): string {
		for (const [i, option] of options.entries())
			if (uid === option.uid) {
				if (edit?.add && i === curMax) {
					add.field.focus();
				}
				cur = i;
				return option.uid;
			}

		cur = 0;
		return options[0].uid;
	}
	function updateFocus(uid: string): void {
		const current = document.getElementById(
				`${$CustomStore.names.optionHeader}${id}${uid}`
			),
			previous = document.getElementById(
				`${$CustomStore.names.optionHeader}${id}${prevId}`
			);

		current?.classList.toggle("active");
		previous?.classList.toggle("active");
		prevId = uid;
		updateCursor(uid);
	}
	function updateChecked(uid: string, submit = true): void {
		if (uid === "add") return;
		if (!multiple) data = {};
		if (belongs(data, uid)) delete data[uid];
		else data[uid] = options[cur].name;

		const persist = edit?.persist ? options : null;
		input({ target: { value: data, submit, options: persist } });
	}
	function renderChecked(boolean: boolean): string {
		if (multiple) return boolean ? `check_box` : `check_box_outline_blank`;
		return boolean ? `radio_button_checked` : `radio_button_unchecked`;
	}
	function onInput(event: KeyboardEvent): void {
		if (disabled || !(!event.altKey && !event.ctrlKey)) return;
		if (!expanded) {
			if (
				[
					"ArrowUp",
					"ArrowDown",
					"Home",
					"End",
					"Enter",
					"NumpadEnter",
					"Space",
				].includes(event.code) ||
				event.key.length === 1
			) {
				event.preventDefault();
				updateDropdown(true, fullId);
			} else return;
		} else if (expanded) {
			if (event.code !== "Tab") event.preventDefault();

			if (event.code === "Escape") updateDropdown(false, undefined);
			else if (["Enter", "NumpadEnter", "Space"].includes(event.code)) {
				if (!multiple && options[cur].uid !== "add")
					updateDropdown(false, undefined);
				updateChecked(options[cur].uid);
			} else if (event.code === "ArrowUp" && 0 <= cur - 1) cur -= 1;
			else if (event.code === "ArrowDown" && cur + 1 <= curMax) cur += 1;
			else if (event.code === "PageUp") cur = 0 < cur - 10 ? cur - 10 : 0;
			else if (event.code === "PageDown")
				cur = cur + 10 < curMax ? cur + 10 : curMax;
			else if (event.code === "Home") cur = 0;
			else if (event.code === "End") cur = curMax;
			else if (
				edit?.remove &&
				(event.code === "Delete" ||
					(event.key === "D" && event.shiftKey && event.altKey))
			) {
				removeItem(
					(event.target as HTMLElement)
						.getAttribute("aria-activedescendant")
						?.split(`${$CustomStore.names.optionHeader}${id}`)[1]
				);
				updateFocus(options[cur].uid);
				return;
			}

			if (!multiple) updateChecked(options[cur].uid, false);
			updateFocus(options[cur].uid);
		}
	}

	function onClick(event: MouseEvent): void {
		if (disabled) return;
		const target = event.target as HTMLElement;
		let uid = target
				.closest(".option")
				?.getAttribute("id")
				?.split(`${$CustomStore.names.optionHeader}${id}`)[1],
			del = edit?.remove && target.closest(".option-del");

		if (del) removeItem(uid);

		if (uid === undefined || del) return;
		if (!multiple && uid !== "add") updateDropdown(false, undefined);

		updateFocus(uid);

		if (uid === "add") return;
		updateChecked(uid);
		// dropdown.focus();
	}

	function addItem(): void {
		if (typeof edit.add === "number" && !(edit.add - add.added)) return;
		const uid = uuidV4(),
			addOption = options.pop();

		options.push({ uid, name: add.value });
		options.push(addOption);
		curMax++;
		size++;

		updateFocus(uid);
		updateChecked(uid);
		add.value = "";
		add.added++;
	}
	function removeItem(uid: string): void {
		let localCur = 0;
		const curId =
			uid && !belongs(removedList, uid) ? uid : options[cur].uid;
		if (
			curId === " add" ||
			(typeof edit.remove === "number" && !(edit.remove - add.removed)) ||
			!curMax
		)
			return;

		if (multiple && belongs(data, curId)) updateChecked(curId);

		let i = 0;
		for (i = 0; i < options.length; i++)
			if (options[i].uid === curId) {
				options.splice(i, 1);
				localCur = i;
			}

		removedList[curId] = curId;
		add.removed++;
		curMax--;
		size--;

		if (prevId === curId) {
			const newId =
				localCur < curMax
					? options[localCur].uid
					: options[localCur - 1].uid;

			if (!multiple && belongs(data, curId)) {
				updateFocus(newId);
				updateChecked(newId);
			} else updateCursor(newId);
		} else updateFocus(prevId);

		dropdown.focus();
	}
	function addKeydown(event: KeyboardEvent): void {
		if (["ArrowUp", "Escape", "Enter"].includes(event.code)) {
			event.preventDefault();
			if (event.code === "ArrowUp") updateFocus(options[curMax - 1].uid);
			else if (event.code === "Enter") addItem();
			else updateDropdown(false, undefined);
			dropdown.focus();
		}
	}
	function addAriaLabel(): string {
		let help = "Add an option.";

		help +=
			typeof edit.add === "number"
				? ` ${edit.add - add.added} remaining Add's.`
				: "";
		help +=
			typeof edit.remove === "number"
				? ` ${edit.remove - add.removed} remaining Delete's.`
				: "";
		help +=
			typeof edit.limit === "number"
				? ` This field is limited to a max of 
				${edit.limit - curMax}.`
				: "";

		return (help += " Press Enter to add your option to the dropdown.");
	}

	function labelLink() {
		dropdown.focus();
		updateDropdown(true, fullId);
	}
	function handleClose(status: boolean): void {
		if (!status) {
			if (!multiple && edit?.add && cur === curMax)
				updateFocus(Object.keys(data)[0]);
			blur();
		}
	}

	beforeUpdate(() => {
		if (Array.isArray(data)) data = makeToData(data);
	});
	onMount(() => {
		label = document.getElementById(`${$CustomStore.names.label}${id}`);
		label?.addEventListener("click", labelLink);
		size = options.length;

		if (edit?.add) {
			options.push({ uid: "add", name: "Add an option" });
			curMax++;
		}

		updateCallback(handleClose);
		if (!size) return;

		const unpacked = Object.keys(data),
			last = unpacked.length ? unpacked[unpacked.length - 1] : undefined;

		curMax = options.length - 1;
		prevId = updateCursor(last);
	});
	onDestroy(() => label?.removeEventListener("click", labelLink));
</script>

<div
	class={`dropdown-container noselect ${
		value === "[redacted]" ? $CustomStore.names.redact : ""
	} ${expanded ? "active" : ""}`}
	id={`${$CustomStore.names.inputHeader}${id}`}
	{name}
	{disabled}
	aria-haspopup="listbox"
>
	<div
		bind:this={dropdown}
		class="field dropdown"
		id={`${$CustomStore.names.inputHeader}${id}cb`}
		aria-haspopup="listbox"
		aria-disabled={disabled}
		aria-controls={`${$CustomStore.names.inputHeader}${id}lb`}
		aria-expanded={expanded}
		aria-labelledby={`${$CustomStore.names.label}${id}`}
		aria-activedescendant={expanded && size
			? `${$CustomStore.names.optionHeader}${id}${options[cur].uid}`
			: "false"}
		tabindex="0"
		role="combobox"
		on:focus={focus()}
		on:click={() => {
			if (disabled) return;
			if (!expanded) updateDropdown(true, fullId);
			else updateDropdown(false, undefined);

			dropdown.focus();
		}}
		on:keydown={(event) => onInput(event)}
	>
		<span class={value && value.length ? "" : "option-size"}>
			{compact && value && typeof value !== "string" && 1 < value.length
				? `Multiple Selections (${value.length})`
				: value && value.length
				? value
				: placeholder
				? placeholder
				: "Select an option"}
		</span>
		<span aria-hidden="true" class="material-icons"
			>{expanded ? "expand_less" : "expand_more"}</span
		>
	</div>
	{#if expanded}
		<div
			class="option-container"
			id={`${$CustomStore.names.inputHeader}${id}lb`}
			role="listbox"
			on:click={(event) => onClick(event)}
		>
			{#if !size}<div>no options available</div>{/if}
			{#each options as option (option.uid)}
				{#if option.uid !== "add"}
					<div
						class={`option ${
							prevId === option.uid ? "active" : ""
						}`}
						id={`${$CustomStore.names.optionHeader}${id}${option.uid}`}
						role="option"
						aria-selected={`${localBelongs(localData, option.uid)}`}
					>
						<span>{option.name}</span>
						<div class="option-actions">
							{#if edit?.remove}
								<span
									aria-hidden="true"
									class="material-icons option-del"
									>highlight_off</span
								>
							{/if}
							<span aria-hidden="true" class="material-icons"
								>{renderChecked(
									localBelongs(localData, option.uid)
								)}</span
							>
						</div>
					</div>
				{:else if edit?.add}
					<div
						class="option adding-container"
						aria-label={add && addAriaLabel()}
						role="option"
						on:click={() => {
							updateCursor("add");
							add.field.focus();
						}}
					>
						<input
							id={`${$CustomStore.names.optionHeader}${id}add`}
							bind:this={add.field}
							bind:value={add.value}
							class={`option ${
								prevId === option.uid ? "active" : ""
							}`}
							aria-hidden={"true"}
							type="text"
							placeholder="Add an option. (add / remove / limit)"
							on:keydown={(event) => addKeydown(event)}
						/>
						<div aria-hidden="true" />
						<div aria-hidden="true" class="edit-details">
							<div>
								{typeof edit.add === "number"
									? edit.add - add.added
									: typeof edit.add === "boolean" && edit.add
									? "∞"
									: "-"}
								/
								{typeof edit.remove === "number"
									? edit.remove - add.removed
									: typeof edit.remove === "boolean" &&
									  edit.remove
									? "∞"
									: "-"}
								/
								{typeof edit.limit === "number"
									? edit.limit - curMax
									: typeof edit.limit === "undefined"
									? "∞"
									: "-"}
							</div>

							<div
								class="option-actions"
								on:click={() => addItem()}
							>
								<span class="material-icons"
									>add_circle_outline</span
								>
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</div>
