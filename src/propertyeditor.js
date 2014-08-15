var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var PropertyPanel;
(function (PropertyPanel) {
    var Binding = (function () {
        function Binding(editor, objects, definition) {
            this.editor = editor;
            this.objects = objects;
            this.definition = definition;
            this.container = null;
        }
        /*
        * @return {any} the value of the first *object* of this binding
        */
        Binding.prototype.getValue = function () {
            if (this.objects.length > 0)
                return this.objects[0][this.definition.prop];
            else
                return null;
        };

        Binding.prototype.setValue = function (value) {
            for (var i = 0; i < this.objects.length; ++i) {
                this.objects[i][this.definition.prop] = value;
            }
        };

        /*
        * @return {boolean} true, if all *prop* attribute of all *objects* is the same
        */
        Binding.prototype.isSameValue = function () {
            var value = this.getValue();
            var prop = this.definition.prop;
            for (var i = 1; i < this.objects.length; ++i) {
                if (this.objects[i][prop] !== value)
                    return false;
            }
            return true;
        };
        return Binding;
    })();
    PropertyPanel.Binding = Binding;

    // export enum Reason {
    //     Commit, Cancel
    // };
    /*
    * @class Editor
    * @description provides a base class for describing an editor.
    *
    */
    var Editor = (function () {
        function Editor() {
        }
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
        Editor.prototype.canHandle = function (value) {
            return false;
        };

        /*
        *
        */
        Editor.prototype.hasSubObjects = function (binding) {
            return false;
        };

        /*
        * The editor should append any relevant HTML to the parent element according to the
        * property values found in the binding.  Derived classes *must* set the *container*
        * attribute to the HTML container that is created for this editor.
        */
        Editor.prototype.createElement = function (binding) {
            return null;
        };

        /*
        * Called before removal of the editor from the panel. If editor is current editing
        * (e.g. startEdit() had been called), then stopEdit() will be called before shutdown()
        */
        //shutdown(binding: Binding) {}
        /*
        */
        Editor.prototype.refresh = function (binding) {
        };

        /*
        * Called before removal of the editor from the panel
        */
        Editor.prototype.startEdit = function (binding, onChange, onInput) {
        };

        /*
        * Called after startEdit() to indicate the edit mode has finished.
        * stopEdit() can be called from within the editor code to indicate that editing is complete.
        */
        Editor.prototype.stopEdit = function (binding) {
        };
        return Editor;
    })();
    PropertyPanel.Editor = Editor;

    // export interface Editor {
    //     bindProperty()
    //     canHandleProperty(editorType: string): boolean;
    //     startEditProperty(binding: Binding,
    //         onChange: (binding: Binding, value: any) => void,
    //         onInput: (binding: Binding, value: any) => void);
    //     stopEditProperty(binding: Binding);
    // }
    var DefaultEditor = (function (_super) {
        __extends(DefaultEditor, _super);
        function DefaultEditor() {
            _super.apply(this, arguments);
        }
        DefaultEditor.prototype.createElement = function (binding) {
            var textElem = document.createElement('text');
            var htmlString = (binding.isSameValue() ? binding.getValue() : '----');

            textElem.innerHTML = '<style>' + '  .inputElem {position: fixed}' + '</style>' + '<span class="PropertyEditorName">' + binding.definition.prop + ': </span>' + '<span class="PropertyEditorValue">' + htmlString + '</span>';

            return textElem;
        };

        DefaultEditor.prototype.canHandle = function (value) {
            return true;
        };

        DefaultEditor.prototype.refresh = function (binding) {
            var valueElem = binding.container.querySelector('.PropertyEditorValue');
            if (valueElem === null)
                return;

            valueElem.innerHTML = (binding.isSameValue() ? binding.getValue() : '----');
        };

        DefaultEditor.prototype.startEdit = function (binding, onChange, onInput) {
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

            inputElem.addEventListener('input', function (e) {
                if (typeof onInput === 'function')
                    onInput(binding, e.target.value);
            });

            var self = this;
            inputElem.addEventListener('keypress', function (e) {
                if (e.keyCode === 13) {
                    if (typeof onChange === 'function')
                        onChange(binding, inputElem.value);

                    self.stopEdit(binding);
                }
            });

            binding.container.appendChild(inputElem);

            inputElem.setSelectionRange(0, inputElem.value.length);
            inputElem.focus();
        };

        DefaultEditor.prototype.stopEdit = function (binding) {
            var inputElem = binding.container.querySelector('.PropertyEditorEdit');
            if (inputElem === null)
                return;

            // if (reason === Reason.Commit) {
            //     this.onChange(binding, inputElem.value);
            // }
            binding.container.removeChild(inputElem);
        };
        return DefaultEditor;
    })(Editor);
    PropertyPanel.DefaultEditor = DefaultEditor;

    var ObjectEditor = (function (_super) {
        __extends(ObjectEditor, _super);
        function ObjectEditor() {
            _super.apply(this, arguments);
        }
        ObjectEditor.prototype.createElement = function (binding) {
            var container = document.createElement('div');
            container.innerHTML = '<style>' + '    [data-state="closed"]:before { content: "+" }' + '    [data-state="open"]:before { content: "-" }' + '    [data-state="closed"] ~ * { display: none !important }' + '    [data-state="open"] ~ * { padding: 2px 5px !important }' + '</style>' + '<div class="ObjectEditor PropertyEditorName" data-state="closed">' + binding.definition.prop + '</div>';

            container.querySelector('.ObjectEditor').addEventListener('click', this.toggleState);

            return container;
        };

        ObjectEditor.prototype.toggleState = function (e) {
            e.preventDefault();
            var elem = e.target;
            var isClosed = elem.getAttribute('data-state') === 'closed';
            elem.setAttribute('data-state', (isClosed ? 'open' : 'closed'));
        };

        ObjectEditor.prototype.canHandle = function (value) {
            return value instanceof Object;
        };

        ObjectEditor.prototype.hasSubObjects = function (binding) {
            return true;
        };
        return ObjectEditor;
    })(Editor);
    PropertyPanel.ObjectEditor = ObjectEditor;
})(PropertyPanel || (PropertyPanel = {}));
