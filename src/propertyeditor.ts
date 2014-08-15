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

        setValue(value: any) {
            for (var i = 0; i < this.objects.length; ++i) {
                this.objects[i][this.definition.prop] = value;
            }
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

    // export enum Reason {
    //     Commit, Cancel
    // };

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
         */
        refresh(binding: Binding) {}

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
        stopEdit(binding: Binding) {}

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
            var textElem = document.createElement('text');
            var htmlString = (binding.isSameValue() ? binding.getValue() : '----');

            textElem.innerHTML =
                '<style>' +
                '  .inputElem {position: fixed}' +
                '</style>' +
                '<span class="PropertyEditorName">' + binding.definition.prop + ': </span>' +
                '<span class="PropertyEditorValue">' + htmlString + '</span>';

            return textElem;
        }

        canHandle(value: any): boolean {
            return true; // supports any type
        }

        refresh(binding: Binding) {
            var valueElem = < HTMLElement > binding.container.querySelector('.PropertyEditorValue');
            if (valueElem === null)
                return;

            valueElem.innerHTML = (binding.isSameValue() ? binding.getValue() : '----');
        }

        startEdit(binding: Binding,
            onChange: (binding: Binding, value: any) => void,
            onInput: (binding: Binding, value: any) => void) {

            var valueElem = binding.container.querySelector('.PropertyEditorValue');
            if (valueElem === null)
                return;

            var rectObject = valueElem.getBoundingClientRect();
            var value = binding.getValue();
            var inputElem = document.createElement('input');

            if (!binding.isSameValue())
                value = '----';

            // place inputElem on top of the valueElem
            inputElem.classList.add('inputElem');
            inputElem.classList.add('PropertyEditorEdit');
            inputElem.style.top = rectObject.top + 'px';
            inputElem.style.left = rectObject.left + 'px';
            inputElem.value = value.toString();
            inputElem.type = 'input';

            inputElem.addEventListener('input', function(e) {
                if (typeof onInput === 'function')
                    onInput(binding, ( < HTMLInputElement > e.target).value);
            });

            var self = this;
            inputElem.addEventListener('keypress', function(e) {
                if (e.keyCode === 13) {
                    if (typeof onChange === 'function')
                        onChange(binding, inputElem.value);

                    self.stopEdit(binding);
                }
            });


            binding.container.appendChild(inputElem);

            inputElem.setSelectionRange(0, inputElem.value.length);
            inputElem.focus();
        }

        stopEdit(binding: Binding) {
            var inputElem = binding.container.querySelector('.PropertyEditorEdit');
            if (inputElem === null)
                return;

            // if (reason === Reason.Commit) {
            //     this.onChange(binding, inputElem.value);
            // }

            binding.container.removeChild(inputElem);
        }
    }

    export class ObjectEditor extends Editor {
        createElement(binding: Binding): HTMLElement {
            var container = document.createElement('div');
            container.innerHTML =
                '<style>' +
                '    [data-state="closed"]:before { content: "+" }' +
                '    [data-state="open"]:before { content: "-" }' +
                '    [data-state="closed"] ~ * { display: none !important }' +
                '    [data-state="open"] ~ * { padding: 2px 5px !important }' +
                '</style>' +
                '<div class="ObjectEditor PropertyEditorName" data-state="closed">' + binding.definition.prop + '</div>';

            container.querySelector('.ObjectEditor').addEventListener('click', this.toggleState);

            return container;
        }

        toggleState(e) {
            e.preventDefault();
            var elem = ( < HTMLElement > e.target);
            var isClosed = elem.getAttribute('data-state') === 'closed';
            elem.setAttribute('data-state', (isClosed ? 'open' : 'closed'));
        }

        canHandle(value: any): boolean {
            return value instanceof Object;
        }

        hasSubObjects(binding: Binding): boolean {
            return true;
        }
    }
}
