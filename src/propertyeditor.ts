module PropertyPanel {

    export interface Definition {
        /*
         * name of the property to appear in the property panel
         */
        prop: string;

        /*
         * the type of editor to use.  if not set, instanceof will be used to discern the type
         * of the property.
         */
        editorType ? : string;
    }

    export class Binding {
        container: HTMLElement = null;

        constructor(public editor: Editor, public objects: any[], public definition: Definition) {}

        /*
         * @return {any} the value of the first *object* of this binding
         */
        getValue(): any {
            if (this.objects.length > 0)
                return this.objects[0][this.definition.prop];
            else
                return null;
        }

        /*
         * @return {boolean} true, if all *prop* attribute of all *objects* is the same
         */
        isSameValue(): any {
            var value = this.getValue();
            var prop = this.definition.prop;
            for (var i = 1; i < this.objects.length; ++i) {
                if (this.objects[i][prop] !== value)
                    return false;
            }
            return true;
        }
    }

    export enum Reason {
        Commit, Cancel
    };

    /*
     * @class Editor
     * @description provides a base class for describing an editor.
     *
     */
    export class Editor {
        /*
         * Called when the value of the editor changes, e.g. dragging a slider
         * onInput, is optional and is called by the editor's code.
         */
        //onInput: (binding: Binding, value: any) => void;

        /*
         * Called from stopEditing() when the editor's value has changed.
         */
        //onChange: (binding: Binding, value: any) => void;

        /*
         * Called from stopEditing() when the editor's value has not changed.
         */
        //onCancel: () => void;

        /*
         *
         */
        canHandle(value: any): boolean {
            return false;
        }

        /*
         *
         */
        hasSubObjects(binding: Binding): boolean {
            return false;
        }

        /*
         * The editor should append any relevant HTML to the parent element according to the
         * property values found in the binding.  Derived classes *must* set the *container*
         * attribute to the HTML container that is created for this editor.
         */
        createElement(binding: Binding): HTMLElement {
            return null;
        }

        /*
         * Called before removal of the editor from the panel. If editor is current editing
         * (e.g. startEdit() had been called), then stopEdit() will be called before shutdown()
         */
        //shutdown(binding: Binding) {}

        /*
         * Called before removal of the editor from the panel
         */
        startEdit(binding: Binding,
            onChange: (binding: Binding, value: any) => void,
            onInput: (binding: Binding, value: any) => void) {}

        /*
         * Called after startEdit() to indicate the edit mode has finished.
         * stopEdit() can be called from within the editor code to indicate that editing is complete.
         */
        stopEdit(binding: Binding, reason: Reason) {}
    }

    // export interface Editor {
    //     bindProperty()
    //     canHandleProperty(editorType: string): boolean;

    //     startEditProperty(binding: Binding,
    //         onChange: (binding: Binding, value: any) => void,
    //         onInput: (binding: Binding, value: any) => void);

    //     stopEditProperty(binding: Binding);
    // }

    export class DefaultEditor extends Editor {
        createElement(binding: Binding): HTMLElement {
            var textElem = document.createElement("text");
            textElem.innerHTML = '<span class="PropertyEditorName">' + binding.definition.prop + ': </span>' +
                '<span class="PropertyEditorValue">' + binding.getValue() + '</span>';

            return textElem;
        }

        canHandle(value: any): boolean {
            return true; // supports any type
        }

        startEdit(binding: Binding,
            onChange: (binding: Binding, value: any) => void,
            onInput: (binding: Binding, value: any) => void) {

        }
    }

    export class ObjectEditor extends Editor {
        createElement(binding: Binding): HTMLElement {
            var container = document.createElement("div");
            container.innerHTML =
                '<style>' +
                '    [data-state="closed"]:before { content: "+" }' +
                '    [data-state="open"]:before { content: "-" }' +
                '    [data-state="closed"] ~ * { display: none !important }' +
                '    [data-state="open"] ~ * { padding: 2px 5px !important }' +
                '</style>' +
                '<div class="ObjectEditor PropertyEditorName" data-state="closed">' + binding.definition.prop + '</div>';

            container.querySelector(".ObjectEditor").addEventListener("click", this.toggleState);

            return container;
        }

        toggleState(e) {
            e.preventDefault();
            var elem = ( < HTMLElement > e.target);
            var isClosed = elem.getAttribute("data-state") === "closed";
            elem.setAttribute("data-state", (isClosed ? "open" : "closed"));
        }

        canHandle(value: any): boolean {
            return value instanceof Object;
        }

        hasSubObjects(binding: Binding): boolean {
            return true;
        }
    }
}
