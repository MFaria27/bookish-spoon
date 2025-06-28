<script lang="ts">
    import { page } from "$app/stores";
    import { onMount } from "svelte";
    import { currentGroup } from "../store";
    import { addUserToGroup, createGroup, getGroupsByUser, renameGroup } from "$lib";

    const { mounted } = $props();
    let groupsMounted = $state(false);
    onMount(async () => {
		loadGroups();
	});

    let groupDropdownActive = $state(false);
    let settingsDropdownActive = $state(false);
    let email : any = $page.data.session?.user?.email
    let groups : any[] = $state([])
    let selectedGroup : any = $state();

    let isInviteModalOpen = $state(false);
    function openInviteModal() { isInviteModalOpen = true; }
    function closeInviteModal() { isInviteModalOpen = false; placeholderEmail = ''; settingsDropdownActive = false;}
    let placeholderEmail = $state('')

    let isRenameModalOpen = $state(false);
    function openRenameModal() { isRenameModalOpen = true; }
    function closeRenameModal() { isRenameModalOpen = false; placeholderRename = ''; settingsDropdownActive = false;}
    let placeholderRename = $state('')

    let isCreateModalOpen = $state(false);
    function openCreateModal() { isCreateModalOpen = true; }
    function closeCreateModal() { isCreateModalOpen = false; placeholderGroupName = ''; settingsDropdownActive = false;}
    let placeholderGroupName = $state('')

    async function loadGroups() {
        try {
            const res = await getGroupsByUser(email);
			if (!res.success || res.error) throw new Error(res.error || 'Failed to fetch groups');
            res["groups"].forEach((groupData : any) => {
                groups.push({ 
                    name : groupData["groups"]["name"],
                    id : groupData["group_id"]
                })
            });
            updateGroupName(groups[0])
            mounted?.();
            groupsMounted = true;
			
		} catch (err:any) { console.log(err.message || 'Unknown error'); }
    }

    async function inviteUser() {
        try {
            const res = await addUserToGroup(placeholderEmail, selectedGroup.id)
            if (!res.success || res.error) throw new Error(res.error || 'Failed to add user');
            console.log('User added to group successfully');
            isInviteModalOpen = false;
            settingsDropdownActive = false;
            placeholderEmail = '';
        } catch (err: any) {
            console.error(err.message || 'Unknown error');
        }
    }

    async function renameGroupById() {
        try {
            const res = await renameGroup(selectedGroup.id, placeholderRename)
            if (!res.success || res.error) throw new Error(res.error || 'Failed to rename group');
            console.log('Group renamed:', res['group']);
            selectedGroup = res['group']
            const obj = groups.find(item => item.id === res['group']['id'])
            if(obj) obj.name = res['group']['name']
            isRenameModalOpen = false;
            settingsDropdownActive = false;
            placeholderRename = ''
        } catch (err: any) {
            console.error(err.message || 'Unknown error');
        }
    }

    async function createGroupByEmail() {
        try {
            const res = await createGroup(placeholderGroupName, email)
            if (!res.success || res.error) throw new Error(res.error || 'Create group');
            isCreateModalOpen = false;
            settingsDropdownActive = false;
            placeholderGroupName = ''
            groups.push(res.group.name)
            updateGroupName(res.group)
        } catch (err: any) { console.error(err.message || 'Unknown error'); }
    }

    function updateGroupName(group: any) {
        currentGroup.set(group);
        selectedGroup = group
        groupDropdownActive = false;
    }

</script>

<main>
    {#if groupsMounted}
        <div class="card has-background-black-ter mb-4" style="width: 350px;">
            <div class="card-content is-flex is-justify-content-space-between is-align-items-center p-2">
                <p class="has-text-weight-semibold is-size-5">Group:</p>
                <div class="dropdown {groupDropdownActive ? 'is-active' : ''}">
                    <div class="dropdown-trigger">
                        <button class="button is-flex is-justify-content-space-between is-align-items-center" style="width:200px" aria-haspopup="true" aria-controls="dropdown-menu" onclick={() => {groupDropdownActive = !groupDropdownActive; settingsDropdownActive = false;}}>
                            <span>{selectedGroup["name"]}</span>
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
                                <a class="dropdown-item {group["name"] == selectedGroup["name"] ? 'is-active' : ''}" onclick={() => updateGroupName(group)}>{group["name"]}</a>
                            {/each}
                        </div>
                    </div>
                </div>
                <div class="dropdown is-right {settingsDropdownActive ? 'is-active' : ''}">
                    <div class="dropdown-trigger">
                        <!-- svelte-ignore a11y_consider_explicit_label -->
                        <button class="button" aria-haspopup="true" aria-controls="dropdown-menu" onclick={() => {settingsDropdownActive = !settingsDropdownActive; groupDropdownActive = false}}>
                            <span class="icon">
                                <i class="fas fa-cog"></i>
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <div class="dropdown-item has-text-weight-semibold is-size-6">Group Settings</div>
                            <hr class="dropdown-divider" />
                            <!-- svelte-ignore a11y_missing_attribute -->
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-2 {selectedGroup["name"] == 'Global' ? 'disabled-link' : ''}" onclick={openInviteModal}>
                                <span class="icon pr-2">
                                    <i class="fas fa-user-plus"></i>
                                </span>
                                <span class="">Invite</span>
                            </a>
                            <!-- svelte-ignore a11y_missing_attribute -->
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-2 {selectedGroup["name"] == 'Global' ? 'disabled-link' : ''}" onclick={openRenameModal}>
                                <span class="icon pr-2">
                                    <i class="fas fa-rug"></i>
                                </span>
                                <span class="">Rename</span>
                            </a>
                            <!-- svelte-ignore a11y_missing_attribute -->
                            <!-- svelte-ignore a11y_click_events_have_key_events -->
                            <!-- svelte-ignore a11y_no_static_element_interactions -->
                            <a class="dropdown-item is-flex is-justify-content-center is-align-items-center px-0 py-2" onclick={openCreateModal}>
                                <span class="icon pr-2">
                                    <i class="fas fa-square-plus"></i>
                                </span>
                                <span class="">Create</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        {#if isInviteModalOpen}
            <div class="modal is-active">
                <button class="modal-background" aria-label="close" onclick={closeInviteModal}></button>
                <div class="modal-card" style="width: 350px;">
                    <header class="modal-card-head p-4">
                        <p class="modal-card-title">Invite to "{selectedGroup["name"]}"</p>
                        <button class="delete" aria-label="close" onclick={closeInviteModal}></button>
                    </header>
                    <section class="modal-card-body p-4">
                        <div class="field">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label class="label">Email</label>
                            <div class="control">
                                <input class="input" type="text" placeholder="AwesomePerson@gmail.com" bind:value={placeholderEmail}>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot p-4">
                        <div class="buttons">
                            <button class="button is-success" onclick={inviteUser}>Save</button>
                            <button class="button" onclick={closeInviteModal}>Cancel</button>
                        </div>
                    </footer>
                </div>
            </div>
        {/if}
        {#if isRenameModalOpen}
            <div class="modal is-active">
                <button class="modal-background" aria-label="close" onclick={closeRenameModal}></button>
                <div class="modal-card" style="width: 350px;">
                    <header class="modal-card-head p-4">
                        <p class="modal-card-title">Rename "{selectedGroup["name"]}"</p>
                        <button class="delete" aria-label="close" onclick={closeRenameModal}></button>
                    </header>
                    <section class="modal-card-body p-4">
                        <div class="field">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label class="label">Title ({placeholderRename.length}/15)</label>
                            <div class="control">
                                <input class="input" type="text" maxlength="15" placeholder="Awesome Group" bind:value={placeholderRename}>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot p-4">
                        <div class="buttons">
                            <button class="button is-success" onclick={renameGroupById}>Save</button>
                            <button class="button" onclick={closeRenameModal}>Cancel</button>
                        </div>
                    </footer>
                </div>
            </div>
        {/if}
        {#if isCreateModalOpen}
            <div class="modal is-active">
                <button class="modal-background" aria-label="close" onclick={closeCreateModal}></button>
                <div class="modal-card" style="width: 350px;">
                    <header class="modal-card-head p-4">
                        <p class="modal-card-title">Create New Group</p>
                        <button class="delete" aria-label="close" onclick={closeCreateModal}></button>
                    </header>
                    <section class="modal-card-body p-4">
                        <div class="field">
                            <!-- svelte-ignore a11y_label_has_associated_control -->
                            <label class="label">Title ({placeholderGroupName.length}/15)</label>
                            <div class="control">
                                <input class="input" type="text" maxlength="15" placeholder="Awesome Group" bind:value={placeholderGroupName}>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot p-4">
                        <div class="buttons">
                            <button class="button is-success" onclick={createGroupByEmail}>Save</button>
                            <button class="button" onclick={closeCreateModal}>Cancel</button>
                        </div>
                    </footer>
                </div>
            </div>
        {/if}
    {/if}
</main>