///<reference path='../src/propertypanel.ts'/>
var TestTypeScript;
(function (TestTypeScript) {
    var cssGroup = {
        canUse: function (object) {
            return object instanceof CSSStyleDeclaration;
        },
        definitions: [
            {
                prop: 'fill'
            }, {
                prop: 'stroke'
            }, {
                prop: 'strokeWidth'
            }]
    };

    var rectGroup = {
        canUse: function (object) {
            return object instanceof SVGRectElement;
        },
        definitions: [{
                prop: 'style'
            }]
    };

    window.onload = function () {
        var panel = new PropertyPanel.Panel(document.getElementById('TypeScriptPanel'));

        panel.addDefinitionGroup(rectGroup).addDefinitionGroup(cssGroup);

        panel.addEditor(new PropertyPanel.DefaultEditor()).addEditor(new PropertyPanel.ObjectEditor());

        var typeScriptExample = document.getElementById('TypeScriptExample');
        var objectList = [].map.call(typeScriptExample.querySelectorAll('rect'), function (e) {
            return e;
        });
        panel.setObjects(objectList);
    };
})(TestTypeScript || (TestTypeScript = {}));
