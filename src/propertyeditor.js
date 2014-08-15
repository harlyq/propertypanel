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

    (function (Reason) {
        Reason[Reason["Commit"] = 0] = "Commit";
        Reason[Reason["Cancel"] = 1] = "Cancel";
    })(PropertyPanel.Reason || (PropertyPanel.Reason = {}));
    var Reason = PropertyPanel.Reason;
    ;

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
        * Called before removal of the editor from the panel
        */
        Editor.prototype.startEdit = function (binding, onChange, onInput) {
        };

        /*
        * Called after startEdit() to indicate the edit mode has finished.
        * stopEdit() can be called from within the editor code to indicate that editing is complete.
        */
        Editor.prototype.stopEdit = function (binding, reason) {
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
            var textElem = document.createElement("text");
            textElem.innerHTML = '<span class="PropertyEditorName">' + binding.definition.prop + ': </span>' + '<span class="PropertyEditorValue">' + binding.getValue() + '</span>';

            return textElem;
        };

        DefaultEditor.prototype.canHandle = function (value) {
            return true;
        };

        DefaultEditor.prototype.startEdit = function (binding, onChange, onInput) {
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
            var container = document.createElement("div");
            container.innerHTML = '<style>' + '    [data-state="closed"]:before { content: "+" }' + '    [data-state="open"]:before { content: "-" }' + '    [data-state="closed"] ~ * { display: none !important }' + '    [data-state="open"] ~ * { padding: 2px 5px !important }' + '</style>' + '<div class="ObjectEditor PropertyEditorName" data-state="closed">' + binding.definition.prop + '</div>';

            container.querySelector(".ObjectEditor").addEventListener("click", this.toggleState);

            return container;
        };

        ObjectEditor.prototype.toggleState = function (e) {
            e.preventDefault();
            var elem = e.target;
            var isClosed = elem.getAttribute("data-state") === "closed";
            elem.setAttribute("data-state", (isClosed ? "open" : "closed"));
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
