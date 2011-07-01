// add a simple template for example
newT.save("simple", function(){
    return newT.div("simple");
});


var force=true;
var add_to_prototype=true;
newT.extend("getGlobalTemplates", function(){
    return this.templates.global || {};
}, force, add_to_prototype);

newT.showGlobalTemplates();

