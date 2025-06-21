<script lang="ts">
    import { page } from "$app/stores";
    import { onMount, createEventDispatcher } from "svelte";
    import { currentGroup } from "../store";

    export let mounted : any;
    let groupsMounted = false;
    onMount(async () => {
		loadGroups();
	});

    let dropdownActive = false;
    let email : any = $page.data.session?.user?.email
    let groups : string[] = []
    let selectedGroup : any;

    async function loadGroups() {
        try {
			const res = await fetch(`/api/getGroupsByUser?email=${encodeURIComponent(email)}`);
			if (!res.ok) throw new Error('Failed to fetch groups');
			const data = await res.json();
			if (data.error) throw new Error(data.error);
            data["groups"].forEach((groupData : any) => {
                groups.push(groupData["groups"]["name"])
            });
            updateGroupName(groups[0])
            mounted?.();
            groupsMounted = true;
			
		} catch (err:any) { console.log(err.message || 'Unknown error'); }
    }

    function updateGroupName(group: any) {
        currentGroup.set(group);
        selectedGroup = group
        dropdownActive = false;
    }

</script>

<main>
    {#if groupsMounted}
        <div class="card has-background-black-ter mb-4" style="width: 350px;">
            <div class="card-content is-flex is-justify-content-center is-align-items-center">
                <div class="dropdown {dropdownActive ? 'is-active' : ''}">
                    <div class="dropdown-trigger">
                        <button class="button"  aria-haspopup="true" aria-controls="dropdown-menu" onclick={() => dropdownActive = !dropdownActive}>
                            <span>{selectedGroup}</span>
                            <span class="icon is-small">
                                <i class="fas fa-angle-down" aria-hidden="true"></i>
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            {#each groups as group}
                                <!-- svelte-ignore a11y_missing_attribute -->
                                <!-- svelte-ignore a11y_click_events_have_key_events -->
                                <!-- svelte-ignore a11y_no_static_element_interactions -->
                                <a class="dropdown-item {group == selectedGroup ? 'is-active' : ''}" onclick={() => updateGroupName(group)}>{group}</a>
                            {/each}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    {/if}
</main>