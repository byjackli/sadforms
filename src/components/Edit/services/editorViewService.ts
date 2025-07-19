/**
 * Editor View Service
 * 
 * Manages view state and transitions for the form editor.
 * This service extracts view management logic from Editor.svelte to maintain
 * separation of concerns and improve testability.
 */

export type EditorView = "code" | "settings" | "edit" | "debug";

export interface ViewState {
    currentView: EditorView;
    editing: boolean;
    open: boolean;
    aria: string;
    icon: string;
}

export class EditorViewService {
    /**
     * Initializes the default view state
     */
    static getInitialState(): ViewState {
        return {
            currentView: "code",
            editing: false,
            open: true,
            aria: "close",
            icon: "chevron_right"
        };
    }

    /**
     * Updates view state when switching views
     */
    static updateViewState(
        currentState: ViewState, 
        newView: EditorView, 
        togglePanelFn: () => void
    ): ViewState {
        const newState = { ...currentState };
        
        newState.currentView = newView;
        
        if (newView === "edit") {
            newState.editing = true;
        }
        
        if (!newState.open) {
            togglePanelFn();
        }
        
        return newState;
    }

    /**
     * Toggles panel state and updates corresponding UI properties
     */
    static togglePanelState(currentState: ViewState): ViewState {
        const newState = { ...currentState };
        
        if (newState.open) {
            newState.open = false;
            newState.aria = "open";
            newState.icon = "chevron_left";
        } else {
            newState.open = true;
            newState.aria = "close";
            newState.icon = "chevron_right";
        }
        
        return newState;
    }

    /**
     * Updates CSS custom properties for panel positioning
     */
    static updatePanelPosition(open: boolean): void {
        const ss = document.documentElement.style;
        const vw = window
            .getComputedStyle(document.documentElement)
            .getPropertyValue(`--w-editor`);

        if (open) {
            ss.setProperty("--p-editor", "0vw");
        } else {
            ss.setProperty("--p-editor", vw);
        }
    }

    /**
     * Gets the appropriate copy button configuration based on current view
     */
    static getCopyButtonConfig(currentView: EditorView): { icon: string; text: string; label: string } {
        if (currentView === "edit") {
            return {
                icon: "code",
                text: "copy code",
                label: "Copy Code for This Particular Field"
            };
        } else {
            return {
                icon: "copy_all",
                text: "copy all",
                label: "Copy Code for Entire Form"
            };
        }
    }
}

export const editorViewService = EditorViewService;