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

test("escapeHtml", function() {
  var str = '<script type="text/javascript">alert("hi");</script>',
      escaped = newT.escapeHTML(str),
      should_equal = "&lt;script type=&quot;text/javascript&quot;&gt;alert(&quot;hi&quot;);&lt;/script&gt;";
  
  expect(5)
  ok(escaped.indexOf("<") < 0, "there should be no less than characters left");
  ok(escaped.indexOf(">") < 0, "there should be no greater than characters left");
  ok(escaped.indexOf('"') < 0, "there should be no double quote characters left");
  ok(escaped.indexOf("'") < 0, "there should be no single quote characters left");
  equal(escaped, should_equal, "Match actual escaped output with expected escaped output");
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

