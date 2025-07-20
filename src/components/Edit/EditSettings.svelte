<script lang="ts">
    import Form from "$lib/components/Form.svelte";
    import { clearSave, loadSave } from "$lib/store/FormFieldStore";
    import { settingsConfigService } from "./services/settingsConfigService";

    import SadForms, {
        reviver,
        updateForm,
        updateSave,
    } from "../../store/SadForms";

    let data = $state($SadForms.data);
    const fields = $derived($SadForms && generateSettingsConfig());

    function flash(formid: string, saveToLocal: boolean): void {
        if (!saveToLocal) clearSave(formid);
        else loadSave(formid);
    }

    /**
     * Generates settings configuration using the new service
     */
    function generateSettingsConfig(): Record<string, any> {
        flash(data.uid, data.saveToLocal);
        return settingsConfigService.generateSettingsConfig(data);
    }

    function onInput(details: any): void {
        const localData = details.data;
        localData.autocomplete = !!localData.autocomplete;
        localData.fullscreen = !!localData.fullscreen;
        localData.saveToLocal = !!localData.saveToLocal;
        localData.saveToCloud = !!localData.saveToCloud;

        if (localData.afterFormLoad)
            localData.afterFormLoad = reviver(
                "afterFormLoad",
                localData.afterFormLoad
            );
        if (localData.onInput)
            localData.onInput = reviver("onInput", localData.onInput);

        data = { ...data, ...localData };
        data.hide = settingsConfigService.parseHide(data.hide, true);
        
        updateForm(data);
        updateSave(data);
    }
</script>

<Form
    uid="settings"
    title="settings"
    caption="Some fields are temporarily disabled."
    hide={{ title: true, caption: true, submit: true, reset: true }}
    autocomplete={false}
    {onInput}
    {fields}
/>
