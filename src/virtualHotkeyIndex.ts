import {
    App,
    Events,
    ExtraButtonComponent,
    ItemView,
    Modal,
    Platform,
    Plugin,
    PluginSettingTab,
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

interface VirtualHotkeyBoardSettings {
    addSidebarRibbon: string;
}

const DEFAULT_SETTINGS: VirtualHotkeyBoardSettings = {
    addSidebarRibbon: 'openModal'
}

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
        new VirtualHotkeyBoard({ target: this.contentEl, props: {} });
    }
}

export default class VirtualHotkeyBoardPlugin extends Plugin {
    private view: VirtualHotkeyBoardView;
    settings: VirtualHotkeyBoardSettings;
    globalsAdded = false;

    async onload() {
        await this.loadSettings();
        this.addSettingTab(new VirtualHotkeyBoardSettingTab(this.app, this));

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-virtual-hotkey-modal',
            name: 'Open Virtual Hotkey Board Modal',
            callback: () => {
                new VirtualHotkeyBoardModal(this.app).open();
            }
        });
        this.addCommand({
            id: "open-virtual-hotkey-view",
            name: "Open Virtual Hotkey Board",
            callback: () => {
                this.openVirtualHotkeyBoardView();
            }
        });

        // This creates an icon in the left ribbon.
        switch (this.settings.addSidebarRibbon) {
            case 'openView':
                this.addRibbonIcon('keyboard', 'Virtual Hotkey Board', (evt: MouseEvent) => this.openVirtualHotkeyBoardView());
                break;
            case 'openModal':
                this.addRibbonIcon('keyboard', 'Virtual Hotkey Board Modal', (evt: MouseEvent) => new VirtualHotkeyBoardModal(this.app).open());
                break;
            case 'both':
                this.addRibbonIcon('keyboard', 'Virtual Hotkey Board', (evt: MouseEvent) => this.openVirtualHotkeyBoardView());
                this.addRibbonIcon('keyboard', 'Virtual Hotkey Board Modal', (evt: MouseEvent) => new VirtualHotkeyBoardModal(this.app).open());
                break;
        }

        this.registerView(
            VIEW_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new VirtualHotkeyBoardView(leaf))
        );
        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

        this.registerEvent((this.app.workspace as Events).on("plugin-settings:plugin-control", (setting, manifest, enabled, tabId) => {
            this.globalsAdded;
        }));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {

    }

    onLayoutReady(): void {
        // Capture Hotkey events
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

class VirtualHotkeyBoardSettingTab extends PluginSettingTab {
    plugin: VirtualHotkeyBoardPlugin;

    constructor(app: App, plugin: VirtualHotkeyBoardPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display(): void {
        const { containerEl } = this;

        containerEl.empty();

        this.containerEl.createEl('h2', { text: 'Regular Options' });

        new Setting(containerEl)
            .setName('Add Icon to Ribbon')
            .setDesc('Only add modal open icon to ribbon by default.')
            .addDropdown((dropdown) =>
                dropdown
                    .addOption('openModal', 'Modal')
                    .addOption('openView', 'View')
                    .addOption('both', 'Both')
                    .setValue(this.plugin.settings.addSidebarRibbon)
                    .onChange(async (value) => {
                        this.plugin.settings.addSidebarRibbon = value;
                        await this.plugin.saveSettings();
                    }),
            );

        this.containerEl.createEl('h2', { text: 'Say Thank You' });

        new Setting(containerEl)
            .setName('Donate')
            .setDesc('If you like this plugin, consider donating to support continued development:')
            // .setClass("AT-extra")
            .addButton((bt) => {
                bt.buttonEl.outerHTML = `<a href="https://www.buymeacoffee.com/boninall"><img src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=&slug=boninall&button_colour=6495ED&font_colour=ffffff&font_family=Inter&outline_colour=000000&coffee_colour=FFDD00"></a>`;
            });
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


