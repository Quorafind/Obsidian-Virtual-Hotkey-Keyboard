interface bakedHotkey {
    key: string;
    modifiers: string;
}

export const vhkParseHotkeyList = (): any[] => {
    app.hotkeyManager.bake();
    const bakedIdList = app.hotkeyManager.bakedIds;
    const hotkeyList: bakedHotkey[] = app.hotkeyManager.bakedHotkeys;
    const result = [];

    for (let i = 0; i < bakedIdList.length; i++) {
        const id = bakedIdList[i];
        const hotkey = hotkeyList[i] || {};
        const key = hotkey.key || "";
        const modifiers = hotkey.modifiers || "";
        result.push({
            id, key, modifiers
        });
    }

    return result;
}
