<script lang="ts">
    export let basicKey: string = "";
    export let secondKey: string = "";
    export let spanLength: number = 0;
    export let keyDesc: string = "";
    export let highlight: boolean;
    let colStart: number = 0;
    let modKey: boolean = false;
    let arrowKey: number = 0;

    if (basicKey === "Space") {
        spanLength = 4;
    } else if (basicKey === "Shift") {
        spanLength = 3;
    } else if (basicKey === "CapsLock" || basicKey === "Enter" || basicKey === "Backspace") {
        spanLength = 2;
    } else if (basicKey === "Ctrl" || basicKey === "Alt" || basicKey === "Win" || basicKey === "Fn" || basicKey === "\\" || basicKey === "Tab") {
        spanLength = 1;
    }

    // Judge if the key is a modifier key
    if (basicKey === "Ctrl" || basicKey === "Alt" || basicKey === "Shift") {
        modKey = true;
    }

    // Switch colstart based on key
    switch (basicKey) {
        case "F1":
            colStart = 1;
            break;
        case "F5":
            colStart = 2;
            break;
        case "F9":
            colStart = 3;
            break;
        case "ArrowUp":
            colStart = 4;
            break;
            colStart = 0;
            break;
    }

    // Switch arrowkey based on key
    switch (basicKey) {
        case "ArrowUp":
            arrowKey = 1;
            break;
        case "ArrowDown":
            arrowKey = 2;
            break;
        case "ArrowLeft":
            arrowKey = 3;
            break;
        case "ArrowRight":
            arrowKey = 4;
            break;
    }

    let arrowKeyList: string[] = ["", "↑", "↓", "←", "→"];

    // Class based on spanLength
    let spanClass: string[] = ["vhk-col-span-2", "vhk-col-span-3", "vhk-col-span-4", "vhk-col-span-5", "vhk-col-span-15"];
    let colStartClass: string[] = ["", "vhk-col-start-5", "vhk-col-start-14", "vhk-col-start-23", "vhk-col-start-3"];
</script>

<div
    class="{spanClass[spanLength]} {colStartClass[colStart]} vhk-h-16 {highlight ? 'vhk-bg-neutral-300 vhk-shadow-neutral-600 vhk-drop-shadow-lg' : 'vhk-bg-neutral-100 vhk-shadow-neutral-300 vhk-drop-shadow-lg'} {(highlight && modKey) ? 'vhk-bg-stone-300 vhk-shadow-stone-600 vhk-border-2 vhk-border-dashed vhk-border-indigo-300 vhk-drop-shadow-sm' : ''} vhk-rounded-md">
    <div class="key-code">
        <div class="vhk-content-center vhk-text-center vhk-text-slate-400">
            {arrowKey > 0 ? arrowKeyList[arrowKey] : basicKey}
        </div>
        {#if (secondKey.length > 0)}
            <div class="vhk-content-center vhk-text-center">
                {secondKey}
            </div>
        {/if}
    </div>
    <div class="key-desc">
        <div class="vhk-content-center vhk-text-center vhk-text-xs">
            {keyDesc.length > 0 ? keyDesc?.split(':')[1]?.trim() : ""}
        </div>
    </div>
</div>

<style></style>
