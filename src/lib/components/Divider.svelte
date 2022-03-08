<script lang="ts">
    export let id: string, name: string, icon: string;
</script>

<div class="divider" {id}>
    <span aria-disabled="true" class="material-icons">{icon}</span>
    <span>{name}</span>
    <hr />
</div>
