<script lang="ts">

    import Select from 'svelte-select';
    import { vhkParseHotkeyList } from "../utils/vhkParse";
    import { mainKeyListData, funcKeyListData } from "../constant/keyListData";
    import VirtualKey from "./VirtualKey.svelte";
    import { onMount } from "svelte";

    let keyDescList: any[] = [];
    let filteredKeyDescList: any[] = [];
    let keyListData = mainKeyListData;
    let modList: string[] = [];

    const complexItems = [
        { value: 'Mod', label: 'Ctrl' },
        { value: 'Alt', label: 'Alt' },
        { value: 'Shift', label: 'Shift' },
    ];

    onMount(() => {
        keyDescList = vhkParseHotkeyList();
        filteredKeyDescList = keyDescList.filter(item => item.modifiers === "");
        updateKeyDescription();
    })

    function handleSelect(event?: any) {
        modList = [];
        keyDescList = vhkParseHotkeyList();
        if (event.detail) {
            for (let i = 0; i < event.detail.length; i++) {
                modList.push(event.detail[i].label);
            }
        }
        filteredKeyDescList = keyDescList.filter(item => item.modifiers === modList.sort().toString());
        updateKeyDescription();
    }

    function updateKeyDescription() {
        let newKeyListData: any[] = [];
        for (let i = 0; i < mainKeyListData.length; i++) {
            let tempKeyList = mainKeyListData[i].keyList;
            filteredKeyDescList.forEach(item => {
                tempKeyList = tempKeyList.map(hotkey => (hotkey.basicKey === item.key || modList.includes(hotkey.basicKey)) ? {
                    basicKeyCode: hotkey.basicKeyCode,
                    basicKey: hotkey.basicKey,
                    secondKey: hotkey.secondKey,
                    description: modList.includes(hotkey.basicKey) ? hotkey.description : item.id,
                    highlight: true,
                } : {
                    basicKeyCode: hotkey.basicKeyCode,
                    basicKey: hotkey.basicKey,
                    secondKey: hotkey.secondKey,
                    description: hotkey.description,
                    highlight: hotkey.highlight,
                });
            });
            newKeyListData.push({
                list: i,
                keyList: tempKeyList
            });
        }
        keyListData = newKeyListData;
    }
</script>

<div class="virtual-keyboard-hotkey-selector vhk-w-2/5 vhk-ml-2 vhk-mt-2">
    <Select items={complexItems} isMulti={true} on:change={handleSelect}
            placeholder="Select Modifier Key[s] Here"></Select>
</div>
<div class="virtual-keyboard-container vhk-w-full vhk-flex" on:keydown|preventDefault={()=>{console.log("hello")}}>
    <div class="virtual-keyboard-layout-main vhk-grid vhk-grid-rows-6 vhk-gap-2 vhk-w-4/5 vhk-mb-auto vhk-p-2 ">
        {#each keyListData as keyPair, index}
            <div
                class="keyboard-list-{index + 1} vhk-grid {index === 5 ? 'vhk-grid-cols-36': 'vhk-grid-cols-30'} vhk-gap-2">
                {#each keyPair.keyList as key}
                    <VirtualKey basicKey={key.basicKey}
                                keyDesc={key.description}
                                secondKey={key.secondKey}
                                highlight={key.highlight}/>
                {/each}
            </div>
        {/each}
    </div>
    <div class="virtual-keyboard-layout-func vhk-grid vhk-grid-rows-6 vhk-w-1/6 vhk-gap-2 vhk-p-2">
        {#each funcKeyListData as keyPair, index}
            <div class="keyboard-list-{index + 1} vhk-grid vhk-grid-cols-6 vhk-gap-2">
                {#each keyPair.keyList as key}
                    <VirtualKey basicKey={key.basicKey}
                                keyDesc={key.description}
                                secondKey={key.secondKey}
                                highlight={false}/>
                {/each}
            </div>
        {/each}
    </div>
</div>


<style>
    .keyboard-list-1 {
        margin-bottom: 6px;
    }
</style>
