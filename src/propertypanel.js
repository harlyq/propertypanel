///<reference path='propertyeditor.ts'/>
var PropertyPanel;
(function (PropertyPanel) {
    var Panel = (function () {
        function Panel(parent) {
            this.parent = parent;
            this.bindings = [];
            this.definitionGroups = [];
            this.editors = [];
            this.editing = null;
            this.objects = [];
            this.lastChild = null;
            this.commitChanges = true;
            this.lastChild = parent.lastChild;

            parent.addEventListener('click', this.onClick.bind(this));
        }
        Panel.prototype.setObjects = function (objects) {
            if (this.isArrayEqual(objects, this.objects))
                return this;

            this.destroyEditors();
            this.objects = objects;
            this.buildEditors(objects, this.parent);
            return this;
        };

        Panel.prototype.addEditor = function (editor) {
            this.editors.push(editor);
            return this;
        };

        Panel.prototype.removeEditor = function (editor) {
            var i = this.editors.indexOf(editor);
            if (i !== -1)
                this.editors.splice(i, 1);
            return this;
        };

        Panel.prototype.addDefinitionGroup = function (definitionGroup) {
            this.definitionGroups.push(definitionGroup);
            return this;
        };

        Panel.prototype.removeDefintionList = function (definitionGroup) {
            var i = this.definitionGroups.indexOf(definitionGroup);
            if (i !== -1)
                this.definitionGroups.splice(i, 1);
            return this;
        };

        Panel.prototype.onClick = function (e) {
            var elem = e.target;
            var found = false;

            while (elem && elem instanceof HTMLElement && !found) {
                found = elem.classList.contains('PropertyPanelElement');
                if (!found)
                    elem = elem.parentNode;
            }
            if (found)
                this.startEdit(this.findBinding(elem));
        };

        Panel.prototype.findBinding = function (container) {
            for (var i = 0; i < this.bindings.length; ++i) {
                var binding = this.bindings[i];
                if (binding.container === container)
                    return binding;
            }
            return null;
        };

        Panel.prototype.findDefinitionGroup = function (objects) {
            if (objects.length === 0)
                return null;

            for (var i = 0; i < this.definitionGroups.length; ++i) {
                var definitionGroup = this.definitionGroups[i];
                var supports = true;

                for (var k = 0; supports && k < objects.length; ++k)
                    supports = definitionGroup.canUse(objects[k]);

                if (supports)
                    return definitionGroup;
            }

            return null;
        };

        Panel.prototype.findEditorByType = function (editorType) {
            if (!editorType || editorType.length === 0)
                return null;

            for (var i = this.editors.length - 1; i >= 0; --i) {
                var editor = this.editors[i];
                if (typeof editor === editorType)
                    return editor;
            }

            return null;
        };

        Panel.prototype.findEditorByObjects = function (objects, prop) {
            if (objects.length === 0)
                return null;

            for (var i = this.editors.length - 1; i >= 0; --i) {
                var editor = this.editors[i];
                var supports = true;

                for (var k = 0; supports && k < objects.length; ++k)
                    supports = editor.canHandle(objects[k][prop]);

                if (supports)
                    return editor;
            }

            return null;
        };

        Panel.prototype.editorInput = function (binding, value) {
            if (binding !== this.editing)
                return;

            if (typeof this.onInput === 'function') {
                var event = {
                    objects: binding.objects.slice(),
                    prop: binding.definition.prop,
                    value: value
                };
                this.onInput(event);
            }

            if (this.commitChanges) {
                binding.setValue(value);
            }
        };

        Panel.prototype.editorChange = function (binding, value) {
            if (binding !== this.editing)
                return;

            if (typeof this.onChange === 'function') {
                var event = {
                    objects: binding.objects.slice(),
                    prop: binding.definition.prop,
                    value: value
                };
                this.onChange(event);
            }

            if (this.commitChanges) {
                binding.setValue(value);

                if (this['editing'] && this.editing['editor'] && typeof this.editing.editor.refresh === 'function')
                    this.editing.editor.refresh(this.editing);
            }

            this.editing = null;
        };

        Panel.prototype.editorCancel = function () {
            this.editing = null;
        };

        Panel.prototype.isArrayEqual = function (a, b) {
            if (a.length !== b.length)
                return false;

            var isEqual = true;
            for (var i = 0; isEqual && i < a.length; ++i) {
                isEqual = a[i] === b[i];
            }
            return isEqual;
        };

        Panel.prototype.startEdit = function (binding) {
            if (binding.editor !== null && typeof binding.editor === 'object') {
                if (binding === this.editing)
                    return;

                this.stopEdit();

                if (typeof binding.editor.startEdit === 'function') {
                    this.editing = binding;
                    binding.editor.startEdit(binding, this.editorChange.bind(this), this.editorInput.bind(this));
                }
            }
        };

        Panel.prototype.stopEdit = function () {
            if (this['editing'] && this.editing['editor']) {
                if (typeof this.editing.editor.stopEdit === 'function')
                    this.editing.editor.stopEdit(this.editing);

                if (typeof this.editing.editor.refresh === 'function')
                    this.editing.editor.refresh(this.editing);
            }
            this.editing = null;
        };

        Panel.prototype.destroyEditors = function () {
            this.stopEdit();

            // // in reverse, in case a later binding is dependent upon an earlier one
            // for (var i = this.bindings.length - 1; i >= 0; i--) {
            //     var editor = this.bindings[i].editor;
            //     if (editor !== null)
            //         editor.shutdown();
            // }
            this.bindings.length = 0;

            // clean-up any elements added by buildEditors
            if (typeof this.parent === 'object') {
                while (this.parent.lastChild != this.lastChild)
                    this.parent.removeChild(this.parent.lastChild);
            }
        };

        Panel.prototype.buildEditors = function (objects, parent) {
            var definitionGroup = this.findDefinitionGroup(objects);
            if (definitionGroup === null)
                return;

            for (var i = 0; i < definitionGroup.definitions.length; ++i) {
                var definition = definitionGroup.definitions[i];
                var editor = this.findEditorByType(definition.editorType);
                if (editor === null)
                    editor = this.findEditorByObjects(objects, definition.prop);

                if (editor === null)
                    continue;

                var binding = new PropertyPanel.Binding(editor, objects, definition);
                var container = editor.createElement(binding);
                if (container === null)
                    continue;

                binding.container = container;
                container.classList.add('PropertyPanelElement');
                parent.appendChild(container);
                this.bindings.push(binding);

                if (editor.hasSubObjects(binding)) {
                    var subObjects = [];
                    for (var k = 0; k < objects.length; ++k)
                        subObjects[k] = objects[k][definition.prop];

                    this.buildEditors(subObjects, container);
                }
            }
        };
        return Panel;
    })();
    PropertyPanel.Panel = Panel;
})(PropertyPanel || (PropertyPanel = {}));
