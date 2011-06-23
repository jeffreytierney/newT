newT
====

Simple JavaScript templating.


Using newT is simple, just include newT.js, and start managing the DOM in a convenient and reusuable way.


Usage
====
Using newT is quick and easy, it's similar to HTML nesting, but allows for easier injection of 
dynamic data such as AJAX responses, or responding to user interaction.


Hello World, a nested node
=======

See this snippet:  examples/helloworld.html

    var my_data={ foo : "hello world" }
    newT.save("my_template", function(t_data){
        return (
            newT.div("My first newT, simple JS template",
                newT.div(t_data.foo)
            )
        )
    });

    // later in your code
    var dom_node = newT.render("my_template", my_data );
    document.body.appendChild(dom_node);


Rendering Templates
======

In order to properly render a template, the saved value must return a
single root node. Such as the above hello world, this will not work,
however

    newT.save("wont_work", function() {
        return (
            newT.div("one"),
            newT.div("two")
        )
    });

Instead, we need to wrap the return response in an array, which will
wrap the elements in a Docuemnt Fragment

    newT.save("top_level", function(d) {
        return ([
            newT.div("one"),
            newT.div("two")
        ])
    });

