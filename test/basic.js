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

test("createElementWithAttributes", function() {
  expect(8);
  var str = "This is a paragraph element",
      attr = {
        clss:"my_class_name",
        id: "my_id",
        "style": "position: absolute; top: 0px; left: 0px;",
        "data-field": "my_data_field",
        "foo": "bar"
      },
      p = newT.p(attr, str);
  ok(p.innerHTML == str, "innerHTML match");
  equals(attr["id"], p.id, "make sure id is set properly");
  equals(attr["clss"], p.className, "make sure css ClassName is set properly (using clss)");
  equals(attr["style"], (p.cssText || p.style.cssText), "make sure inline style attribute is set properly");
  equals(attr["data-field"], p.getAttribute("data-field"), "make sure html5 data attribute is set properly");
  equals(attr["foo"], p.getAttribute("foo"), "make sure random attribute is set properly");
  
  attr = {classname:"another_class_name"};
  p = newT.p(attr, str);
  equals(attr["classname"], p.className, "make sure css ClassName is set properly (using classname)");
  
  attr = {classname:["class1", "class2", "class3"]};
  p = newT.p(attr, str);
  equals("class1 class2 class3", p.className, "make sure css ClassName is set properly (using an array)");
  
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


test("newT.render()", function() {
  var template = function(data) { return (
    newT.ul(
      newT.li(newT.a({clss:"class1", href:"#1"},"one")), 
      newT.li(newT.a({classname:"class2", href:"#2"},"two")), 
      newT.li(newT.a({clss: ["class3"], href:"#3"},"three"))
    )
  )};

  
  newT.save("ul_test", template);
  var ul = newT.render("ul_test");
  expect(17);
  
  ok(ul.constructor == document.createElement("ul").constructor, "ul constructor");
  ok(ul.childNodes.length == 3, "ul has 3 child nodes");
  for(var i=0, len=ul.childNodes.length; i<len; i++) {
    var li = ul.childNodes[i];
    ok(li.constructor == document.createElement("li").constructor, "li constructor " + i);
    ok(li.childNodes.length == 1, "each li has 1 child nodes");

    var a = li.childNodes[0];
    
    equals(a.constructor, document.createElement("a").constructor, "a constructor");
    equals(a.getAttribute("href"), "#"+(i+1), "check that href attribute is set properly on a");
    equals(a.className, "class"+(i+1), "check that class attribute is set properly on a");
    
  }

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

  newT = newT.clone();
});

test("setOption", function() {
  expect(3)

  deepEqual(newT.options, {if_attr: "when",local_safe: "_safe",safe_mode: false}, "options should start out equal to defaults");
  
  newT.setOption({if_attr: "iff",local_safe: "_is_safe"});

  deepEqual(newT.options, {if_attr: "iff",local_safe: "_is_safe",safe_mode: false}, "options should be updateable by passing an object as a param");

  newT.setOption("safe_mode", true);

  deepEqual(newT.options, {if_attr: "iff",local_safe: "_is_safe",safe_mode: true}, "options should be updateable by passing an key as the first param and a vlue as the second");

  
  newT = newT.clone();
});


test("when", function() {
  expect(7)

  var p = newT.p({when:1<2}, "I should exist");
  var p2 = newT.p({when:1>2}, "I should not exist");
  
  
  equals(p.constructor, document.createElement("p").constructor, "p is created as a paragraph element because the test passes");
  equals(p2, "", "p2 is just an empty string because the test fails");
  
  newT.setOption("if_attr", "iff");
  
  equals(newT.options["if_attr"], "iff", "the attribute option for conditionally displaying nodes is changed to iff");

  var p = newT.p({when:1<2}, "I should exist");
  var p2 = newT.p({when:1>2}, "I should exist");
  var p3 = newT.p({iff:1<2}, "I should exist");
  var p4 = newT.p({iff:1>2}, "I should not exist");
  
  equals(p.constructor, document.createElement("p").constructor, "p is created as a paragraph element because when is no longer the test attribute");
  equals(p2.constructor, document.createElement("p").constructor, "p2 is created as a paragraph element because when is no longer the test attribute");
  equals(p3.constructor, document.createElement("p").constructor, "p3 is created as a paragraph element because the test passes");
  equals(p4, "", "p4 is just an empty string because the test fails");

  
  newT = newT.clone();
});

test("each", function() {
  
  expect(20)
  
  var arr = ["one", "two", "three", "four", "five"];
  
  newT.save("each_example_array", function(data) {
    return (
      newT.ul(
        newT.each(data, function(count, idx) { return newT.li(idx,". ", count); })
      )
    )
  });
  
  var ul = newT.render("each_example_array", arr);
  
  equals(ul.constructor, document.createElement("ul").constructor, "ul is created as a unordered list element");
  equals(ul.childNodes.length, arr.length, "ul should have one child element for each element of the array");
  
  for (var i=0, len=arr.length; i<len; i++) {
    var li = ul.childNodes[i];
    equals(li.constructor, document.createElement("li").constructor, "each list item is created as a list item");
    equals(li.innerHTML, i+". "+arr[i], "each list item should have the text from one of the spots of the array in it");
  }

  var obj = {one: "first", two: "second", three: "third"};
  
  newT.save("each_example_object", function(data) {
    return (
      newT.ul(
        newT.each(data, function(count, key) { return newT.li(key, ". ", count); })
      )
    )
  });
  
  ul = newT.render("each_example_object", obj);
  
  equals(ul.constructor, document.createElement("ul").constructor, "ul is created as a unordered list element");
  equals(ul.childNodes.length, 3, "ul should have one child element for each element of the object");
  
  i = 0;
  for (var key in obj) {
    var li = ul.childNodes[i];
    equals(li.constructor, document.createElement("li").constructor, "each list item is created as a list item");
    equals(li.innerHTML, key+". "+obj[key], "each list item should have the text from one of the spots of the object in it");
    i++;
  }

    newT = newT.clone();
  
});

test("eachRender", function() {
  
  expect(20)
  
  var arr = ["one", "two", "three", "four", "five"];
  
  newT.save("each_render_example_array", function(data) {
    return (
      newT.ul(
        newT.eachRender(data, "each_render_example_array_li")
      )
    )
  });
  
  newT.save("each_render_example_array_li", function(count, idx) {
    return (
      newT.li(idx,". ", count)
    )
  });
  
  var ul = newT.render("each_render_example_array", arr);
  
  equals(ul.constructor, document.createElement("ul").constructor, "ul is created as a unordered list element");
  equals(ul.childNodes.length, arr.length, "ul should have one child element for each element of the array");
  
  for (var i=0, len=arr.length; i<len; i++) {
    var li = ul.childNodes[i];
    equals(li.constructor, document.createElement("li").constructor, "each list item is created as a list item");
    equals(li.innerHTML, i+". "+arr[i], "each list item should have the text from one of the spots of the array in it");
  }

  var obj = {one: "first", two: "second", three: "third"};
  
  newT.save("each_render_example_object", function(data) {
    return (
      newT.ul(
        newT.eachRender(data, "each_render_example_object_li")
      )
    )
  });

  newT.save("each_render_example_object_li", function(count, key) {
    return (
      newT.li(key, ". ", count)
    )
  });
  
  
  ul = newT.render("each_render_example_object", obj);
  
  equals(ul.constructor, document.createElement("ul").constructor, "ul is created as a unordered list element");
  equals(ul.childNodes.length, 3, "ul should have one child element for each element of the object");
  
  i = 0;
  for (var key in obj) {
    var li = ul.childNodes[i];
    equals(li.constructor, document.createElement("li").constructor, "each list item is created as a list item");
    equals(li.innerHTML, key+". "+obj[key], "each list item should have the text from one of the spots of the object in it");
    i++;
  }

  newT = newT.clone();
  
});

test("extend", function() {
  expect(8);
  
  ok(!("extension" in newT), "Make sure that the extension we are trying to add is not there to begin with");
  
  var extended = newT.extend("extension", function(attributes, content) {
    var args = Array.prototype.slice.call(arguments);
    var attributes = {};
    if (args[0].toString() === "[object Object]") { // if the first arg is an object, its attributes
      attributes = args.shift();
    }
  
    var content = "I am the content: ";
    args.unshift(content);
  
    attributes.href = "#somelink";
    args.unshift(attributes);
  
    var a = this.a.apply(this, args);
    
    return a;
  });
  
  ok(extended, "extend should return true when successfully extending");
  
  ok(("extension" in newT), "Make sure that the extension is now there in the prototype");
  
  var ext = newT.extension({href:"#someotherlink"},"more content");
  
  equals(ext.constructor, document.createElement("a").constructor, "the extension is returning a link, so check the constructor on the returned object");
  equals(ext.innerHTML, "I am the content: more content", "the extension should have default content, plus the content added in at call time");
  equals(ext.getAttribute("href"), "#somelink", "Make sure that the href is set to the default specified in the extension");
  
  extended = newT.extend("extension", function(attributes, content) {});
  ok(!extended, "extend should return false when unsuccessfully extending (in this case, method name exists and force not specified)");

  extended = newT.extend("extension", function(attributes, content) {}, true);
  ok(extended, "extend should return true when successfully extending (in this case, method name exists and force IS specified)");
  
  newT = newT.clone();
});

test("multiple pieces of content being passed to elements", function() {
  expect(7);
  var obj = {
    name: "newT",
    occupation: "templater",
    title: "My Templates... let me show you them",
    strength: 9001
  };
  
  newT.save("multiple_content", function(data) {
    return (
      newT.div({id:"my_div"},
        newT.h1(data.title),
        newT.p("I am a paragraph about: ",
          data.name,
          newT.a({href:"#"}, "I am a link to some information about",
            " being a ",
            newT.span(data.occupation)
          )
        ),
        newT.strong({"data-strength":data.strength},
          "My strength is over 9000. In fact, its ",
          data.strength
        )
      )
    )
  });
  
  var multi = newT.render("multiple_content", obj);
  
  equals(multi.constructor, document.createElement("div").constructor, "multi should return a div");
  equals(multi.childNodes.length, 3, "There should be 3 top level child nodes to multi");
  equals(multi.childNodes[0].innerHTML, obj["title"], "The content of the h1 element should be the value of the title property on the object passed in");
  equals(multi.childNodes[1].childNodes.length, 3, "There should be 3 top level child node to the p (2 text nodes and one a)");
  equals(multi.childNodes[1].childNodes[2].childNodes.length, 3, "There should be 3 top level child nodes to the a (2 text nodes and one span)");
  equals(multi.childNodes[1].childNodes[2].childNodes[2].innerHTML, "templater", "Innerhtml of the span should properly incorporate the occupation value passed in from the object");
  equals(multi.childNodes[2].getAttribute("data-strength"), obj["strength"], "The attribute data-strength should have the value of the strength attribute of the object passed in");
  
  newT = newT.clone();
});

test("frag", function() {
  expect(3);
  var frag = newT.frag();
  
  equals(frag.constructor, document.createDocumentFragment().constructor, "frag should return a frag");
  
  frag = newT.frag(
    newT.div("hi"),
    newT.p("hi"),
    newT.a("hi")
  );
  
  equals(frag.constructor, document.createDocumentFragment().constructor, "frag should still return a frag");
  equals(frag.childNodes.length, 3, "frag should have 3 child nodes");
  
})

test("templates returning an array should return a frag", function() {
  expect(2);

  newT.save("frag_array", function() {
    return ([
      newT.p("first"),
      newT.p("second"),
      newT.p("third")
    ]);
  });
  
  var frag = newT.render("frag_array");
  
  equals(frag.constructor, document.createDocumentFragment().constructor, "returning an array should implictly create and return a frag");
  equals(frag.childNodes.length, 3, "frag should have 3 child nodes");
  
})