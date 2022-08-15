import { App, ItemView, Modal, Platform, Plugin, WorkspaceLeaf } from 'obsidian';
import "./virtualHotkeyApp.css";

import VirtualHotkeyBoard from "./component/VirtualHotkeyBoard.svelte";

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

    async onload() {
        this.registerView(
            VIEW_TYPE,
            (leaf: WorkspaceLeaf) => (this.view = new VirtualHotkeyBoardView(leaf))
        );

        this.app.workspace.onLayoutReady(this.onLayoutReady.bind(this));

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-virtual-hotkey-modal-simple',
            name: 'Open Virtual Hotkey Board Model',
            callback: () => {
                new VirtualHotkeyBoardModal(this.app).open();
            }
        });

        this.addCommand({
            id: "open-virtual-hotkey-view",
            name: "Open Virtual Hotkey Board",
            callback: () => {
                this.openMapView.bind(this)
            }
        });
        // This creates an icon in the left ribbon.
        this.addRibbonIcon('keyboard', 'Virtual Hotkey Board', (evt: MouseEvent) => this.openMapView());
    }

    onLayoutReady(): void {
        if (this.app.workspace.getLeavesOfType(VIEW_TYPE).length) {
            return;
        }
        this.app.workspace.getRightLeaf(false).setViewState({
            type: VIEW_TYPE,
        });
    }

    onunload() {

    }

    async openMapView() {
        const workspace = this.app.workspace;
        workspace.detachLeavesOfType(VIEW_TYPE);
        const leaf = workspace.getLeaf(
            // @ts-ignore
            !Platform.isMobile
        );
        await leaf.setViewState({ type: VIEW_TYPE });
        workspace.revealLeaf(leaf);
    }
}

class VirtualHotkeyBoardModal extends Modal {
    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;
        contentEl.addClasses(["sample-modal"]);
        contentEl.setText('Woah!');
    }

    onClose() {
        const { contentEl } = this;
        contentEl.empty();
    }
}


