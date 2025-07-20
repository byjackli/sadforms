<script lang="ts">
    interface Props {
        id: string;
        name: string;
        icon: string;
    }
    
    const { id, name, icon }: Props = $props();
</script>

<div class="divider" {id}>
    <span aria-disabled="true" class="material-icons">{icon}</span>
    <span>{name}</span>
    <hr />
</div>
