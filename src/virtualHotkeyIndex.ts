import {
    App,
    Events,
    ExtraButtonComponent,
    ItemView,
    Modal,
    Platform,
    Plugin,
    setIcon,
    Setting,
    SettingTab,
    WorkspaceLeaf
} from 'obsidian';
import "./virtualHotkeyApp.css";

import { around } from "monkey-around";

import VirtualHotkeyBoard from "./component/VirtualHotkeyBoard.svelte";

declare module "obsidian" {
    interface App {
        internalPlugins: {
            plugins: Record<string,
                { _loaded: boolean; instance: { name: string; id: string } }>;
        };
        plugins: {
            manifests: Record<string, PluginManifest>;
            plugins: Record<string, Plugin>;
        };
        setting: {
            activeTab: SettingTab;
            lastTabId: string;

            pluginTabs: PluginSettingTab[];
            settingTabs: SettingTab[];

            tabContentContainer: HTMLDivElement;
            tabHeadersEl: HTMLDivElement;
        };
    }

    interface Plugin {
        _loaded: boolean;
    }

    interface PluginSettingTab {
        name: string;
    }

    interface SettingTab {
        id: string;
        name: string;
        navEl: HTMLElement;
    }
}

const VIEW_TYPE = "virtual-hotkey-view";

class VirtualHotkeyBoardView extends ItemView {
    view: VirtualHotkeyBoard;

    getViewType(): string {
        return VIEW_TYPE;
    }

    getDisplayText(): string {
        return "Virtual Hotkey Board";
    }

    getIcon(): string {
        return "keyboard";
    }

    async onOpen(): Promise<void> {
        new VirtualHotkeyBoard({ target: (this as any).contentEl, props: {} });
    }
}

export default class VirtualHotkeyBoardPlugin extends Plugin {
    private view: VirtualHotkeyBoardView;
    globalsAdded = false;

    async onload() {
        const workspace = this.app.workspace, events = workspace as Events;
        this.registerView(
            VIEW_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new VirtualHotkeyBoardView(leaf))
        );

        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-virtual-hotkey-modal',
            name: 'Open Virtual Hotkey Board Model',
            callback: () => {
                new VirtualHotkeyBoardModal(this.app).open();
            }
        });

        this.addCommand({
            id: "open-virtual-hotkey-view",
            name: "Open Virtual Hotkey Board",
            callback: () => {
                this.openVirtualHotkeyBoardView.bind(this)
            }
        });
        // This creates an icon in the left ribbon.
        this.addRibbonIcon('keyboard', 'Virtual Hotkey Board', (evt: MouseEvent) => this.openVirtualHotkeyBoardView());
        this.addRibbonIcon('keyboard', 'Virtual Hotkey Board Model', (evt: MouseEvent) => new VirtualHotkeyBoardModal(this.app).open());

        this.registerEvent(events.on("plugin-settings:plugin-control", (setting, manifest, enabled, tabId) => {
            this.globalsAdded;
        }));
    }

    onLayoutReady(): void {
        const hotkeys = this.getSettingsTab("hotkeys");
        if (hotkeys) this.register(around(hotkeys, { display: this.addPluginSettingEvents.bind(this, hotkeys.id) }));
        const hotkeysTab = this.getSettingsTab("hotkeys") as SettingTab;
        if (hotkeysTab) {
            this.register(around(hotkeysTab, {
                display(old) {
                    return function () {
                        old.call(this);
                        const btn = this.searchInputEl.parentElement.createEl("button");
                        btn.className = "hotkey-button vhk-ml-2 vhk-w-12";
                        setIcon(btn, "keyboard");
                        btn.onclick = () => {
                            new VirtualHotkeyBoardModal(this.app).open();
                        }
                        this.searchInputEl.focus();
                    };
                },
            }));
        }
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
            return;
        }
        this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE,
        });
    }

    onunload() {

    }

    async openVirtualHotkeyBoardView() {
        const workspace = this.app.workspace;
        workspace.detachLeavesOfType(VIEW_TYPE);
        const leaf = workspace.getLeaf(
            // @ts-ignore
            !Platform.isMobile
        );
        await leaf.setViewState({ type: VIEW_TYPE });
        workspace.revealLeaf(leaf);
    }

    getSettingsTab(id: string) {
        return app.setting.settingTabs.filter(t => t.id === id).shift() as SettingTab & { name: string };
    }

    addPluginSettingEvents(tabId: string, old: SettingTab["display"]) {
        const app = this.app;
        let in_event = false;

        function trigger(name: string, ...args: any[]) {
            in_event = true;
            try {
                app.workspace.trigger(name, ...args);
            } catch (e) {
                console.error(e);
            }
            in_event = false;
        }

        // Wrapper to add plugin-settings events
        return function display(...args: any[]) {
            if (in_event) return;
            trigger("plugin-settings:before-display", this, tabId);

            // Track which plugin each setting is for
            const remove = around(Setting.prototype, {
                addExtraButton(old) {
                    return function (cb) {
                        return old.call(this, function (b: ExtraButtonComponent) {
                            cb(b);
                        });
                    }
                }
            });

            try {
                return old.apply(this, args);
            } finally {
                remove();
                trigger("plugin-settings:after-display", this);
            }
        }
    }
}

class VirtualHotkeyBoardModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.parentElement?.addClasses(["virtual-hotkey-modal"]);
        new VirtualHotkeyBoard({ target: (this as any).contentEl, props: {} });
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


