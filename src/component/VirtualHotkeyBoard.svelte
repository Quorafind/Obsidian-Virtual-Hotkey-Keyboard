<script lang="ts">

    import Select from 'svelte-select';
    import { vhkParseHotkeyList } from "../utils/vhkParse";
    import { mainKeyListData, funcKeyListData } from "../constant/keyListData";
    import VirtualKey from "./VirtualKey.svelte";
    import { onMount } from "svelte";

    let keyDescList: any[] = [];
    let filteredKeyDescList: any[] = [];
    let mainKeyList = mainKeyListData;
    let funcKeyList = funcKeyListData;
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
        let tempMainKeyListData: any[] = [];
        let tempFuncKeyListData: any[] = [];
        for (let i = 0; i < mainKeyListData.length; i++) {
            let tempMainKeyList = mainKeyListData[i].keyList;
            let tempFuncKeyList = funcKeyListData[i].keyList;
            filteredKeyDescList.forEach(item => {
                tempMainKeyList = tempMainKeyList.map(hotkey => (hotkey.basicKey === item.key || modList.includes(hotkey.basicKey)) ? {
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
                tempFuncKeyList = tempFuncKeyList?.map(hotkey => (hotkey.basicKey === item.key || modList.includes(hotkey.basicKey)) ? {
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
            tempMainKeyListData.push({
                list: i,
                keyList: tempMainKeyList
            });
            tempFuncKeyListData.push({
                list: i,
                keyList: tempFuncKeyList
            });
        }
        mainKeyList = tempMainKeyListData;
        funcKeyList = tempFuncKeyListData;
    }
</script>

<div class="virtual-keyboard-hotkey-selector vhk-w-2/5 vhk-ml-2 vhk-mt-2">
    <Select items={complexItems} isMulti={true} on:change={handleSelect}
            placeholder="Select Modifier Key[s] Here"
    ></Select>
</div>
<div class="virtual-keyboard-container vhk-w-full vhk-flex">
    <div class="virtual-keyboard-layout-main vhk-grid vhk-grid-rows-6 vhk-gap-2 vhk-w-4/5 vhk-mb-auto vhk-p-2 ">
        {#each mainKeyList as keyPair, index}
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
        {#each funcKeyList as keyPair, index}
            <div class="keyboard-list-{index + 1} vhk-grid vhk-grid-cols-6 vhk-gap-2">
                {#each keyPair.keyList as key}
                    <VirtualKey basicKey={key.basicKey}
                                keyDesc={key.description}
                                secondKey={key.secondKey}
                                highlight={key.highlight}/>
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
