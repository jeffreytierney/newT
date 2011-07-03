newT.js
====
Tasty JavaScript Templating.


Learn it over lunch, release a production quality site by dinner. Nom
Nom n0m. [Read more on newtjs.org](http://newtjs.org)


Usage
====
Using newT is quick and easy, it's similar to HTML nesting, but allows for easier injection of 
dynamic data such as AJAX responses, or responding to user interaction.

Find many more examples on using newT.js [here](http://newtjs.org)



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


Find even more [examples on using newT.js](http://newtjs.org) or check out the [examples
folder](https://github.com/jeffreytierney/newT/tree/master/examples)


License
====

Copyright 2010, 2011 Jeff Tierney. 
Lovingly crafted in the Greater New York Area.

Licensed under MIT. See full license [MIT-LICENSE](https://github.com/jeffreytierney/newT/blob/master/MIT-LICENSE)


Authors
===

[jeffrey tierney](https://twitter.com/jeffreytierney) and  
[gregory tomlinson](https://twitter.com/gregory80) 


Minification
====

newT.js is compressed with Google Closure Compiler. Visit the Closure Compiler web app <http://closure-compiler.appspot.com/home>

A handy one liner, assuming you have the closure jar file in your bin directory and the CWD is this
directory

    java -jar ~/bin/closure_compiler.jar --js newT.js  --js_output_file newT.min.js


