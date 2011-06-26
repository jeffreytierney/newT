module("basic");

test("createEmptyElement", function() {
  expect(4);
  var div = newT.div();
  ok(typeof div == "object", "divelement type");
  ok(div.innerHTML == "", "no innerHTML");
  ok(!div.childNodes.length, "no child nodes");
  ok(div.constructor == document.createElement("div").constructor, "div constructor");
});

test("createElementWithText", function() {
  expect(4);
  var str = "This is a paragraph element",
      p = newT.p(str);
  ok(typeof p == "object", "p element type");
  ok(p.innerHTML == str, "innerHTML match");
  ok(p.childNodes.length == 1, "1 child node");
  ok(p.constructor == document.createElement("p").constructor, "p constructor");
});


test("clone", function() {
  expect(6);
  newT.save("test_template", function() { return (newT.div("test")); });
  var local_newt = newT.clone();
  ok(local_newt != newT, "not the same object");
  ok(local_newt.constructor == newT.constructor, "matching constructors");
  ok("global" in newT.templates, "global namespace created on newT with global template creation");
  ok("test_template" in newT.templates["global"], "test template saved in global namespace on newT");
  ok(!("global" in local_newt), "newly cloned copy of newt has its own template space that didnt copy over");
  
  // restore newt to empty version of newT
  newT = newT.clone();
  ok(!("global" in newT), "saving a cloned version of newT back to the global newT should empty templates");

});


test("newT.save()", function() {
  var template = function(data) { return (
    newT.ul(
      newT.li("one"), 
      newT.li("two"), 
      newT.li("three")
    )
  )};

  var template2 = function(data) { return (
    newT.ul(
      newT.li("one - 2"), 
      newT.li("two - 2"), 
      newT.li("three - 2")
    )
  )};

  
  newT.save("ul_test", template);
  newT.save("ul_test.test_local", template2);
  
  expect(7);
  ok("global" in newT.templates, "global namespace created on newT with global template creation");
  ok("ul_test" in newT.templates["global"], "ul_test template saved in global namespace on newT");
  equals(newT.templates["global"]["ul_test"], template, "passed template should equal saved template")


  ok("test_local" in newT.templates, "local namespace created on newT with namespaced template creation");
  ok("ul_test" in newT.templates["test_local"], "ul_test template saved in test_local namespace on newT");
  equals(newT.templates["test_local"]["ul_test"], template2, "passed template2 should equal saved namespaced template");
  
  notEqual(newT.templates["global"]["ul_test"], newT.templates["test_local"]["ul_test"], "passed templates were different, so saved templates should be different")
  
  newT = newT.clone();
});

test("safeMode", function() {
  var str = '<a href="#" onmouseover="alert(document.cookie)">hi</a>';

  expect(3)

  var p_unsafe = newT.p(str);
  newT.safeMode();
  var p_safe = newT.p(str);
  newT.safeMode(false);
  var p_unsafe_2 = newT.p(str);

  equal(p_unsafe.firstChild.nodeType, 1, "BEFORE safe mode is triggered innerHTML should be used on html string and first child is nodeType == 1");
  equal(p_safe.firstChild.nodeType, 3, "AFTER safe mode is triggered textNode should be used on html string and first child is nodeType == 3");
  equal(p_unsafe_2.firstChild.nodeType, 1, "AFTER safe mode is turned off innerHTML should be used on html string and first child is nodeType == 1");
  
});


test("isSafeMode", function() {

  expect(3)
  ok(!newT.isSafeMode(), "safe mode defaults to false");
  newT.safeMode();
  ok(newT.isSafeMode(), "safe mode should be on after calling newT.safeMode() (even with no params)");
  newT.safeMode(0);
  ok(!newT.isSafeMode(), "safe mode should be false after calling newT.safeMode(falsy value) with anything that is falsy (except undefined)");
  
});

test("safeModeTemplateOverride", function() {
  var str = '<a href="#" onmouseover="alert(document.cookie)">hi</a>';
  
  newT.save("test_template", function(s) {
    return (
      newT.p(s)
    )
  });
  
  expect(4)

  ok(!newT.isSafeMode(), "make sure we are not in global safe mode");

  var p_safe = newT.render("test_template", str, {safe_mode:true});
  newT.safeMode();
  var p_unsafe = newT.render("test_template", str, {safe_mode:false});;

  equal(p_safe.firstChild.nodeType, 3, "local safe mode designation (on) should override global (off) and string should be added using createTextNode, making firstChild nodeType 3");
  ok(newT.isSafeMode(), "make sure we are in global safe mode");
  equal(p_unsafe.firstChild.nodeType, 1, "local safe mode designation (off) should override global (on) and string should be added using innerHTML, making firstChild nodeType 1");

  newT = newT.clone();
});

test("safeModeAttributeOverride", function() {
  var str = '<a href="#" onmouseover="alert(document.cookie)">hi</a>';

  expect(4)

  ok(!newT.isSafeMode(), "make sure we are not in global safe mode");
  var p_safe = newT.p({"_safe":true}, str);
  equal(p_safe.firstChild.nodeType, 3, "attribute safe mode (on) method is triggered  which should override global (off), and textNode should be used on html string and first child is nodeType == 3");

  newT.safeMode();
  ok(newT.isSafeMode(), "make sure we are in global safe mode");
  var p_unsafe = newT.p({"_safe":false}, str);
  equal(p_unsafe.firstChild.nodeType, 1, "attribute safe mode (off) method is triggered  which should override global (on),  innerHTML should be used on html string and first child is nodeType == 1");


});
