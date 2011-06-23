/*
    newT
        a JavaScript template library

    author: jeffrey tierney | https://twitter.com/jeffreytierney
    project home: https://github.com/jeffreytierney/newT
    liscense: (see author)
    
    Usage:
    
        Create a new 'newT' -- a JS represention of DOM Template w/ event capabilities
        
            newT.save("id_name", function( data ) {
                // use the () for multiline return of DOM elements via newT.  
                // the second param is the 'contents' of the element
                // this sample is a simple string derived from data when newT.render() is called          
                return ( 
                    newT.div({clss : "my_css_class"}, data.foo)
                )
            });
            
        Converter syntax for Element CSS Class Attribute: "clss"
        
        Render DOM Elements
            @param string "id_name" template name
            @param (any) the data to pass to the method used in the second parameter of newT.save("name", func);
            newT.render("id_name", { foo : "hello world bars" } );
            
            
        Render DOM with options and scope
        
            newT.render("id_name", {}, {
                scope : obj_scope || this
                data : { } // will be overriden completely - not extended
                preData : func // execute w/ scope passed in
                pre : func // excuted w/ scope passed in
            })
            
            
        On Script Load
            On script load, the newT (or temp name is assigned) is initialized.
                This single instance allows convience referrals to complex structures through the 
                newT iterface
                
        Use with innerHTML
            newT.renderToString("id_name", {
                foo : "I come back as a string, no a DOM node"
            });
            

        Iteration
            newT.each(["one", "two"], function( data, idx ) {
                console.log("data", data);
                console.log("index position", idx);
            })
        
        Innerards:
            newT.templates.global will provide current "templates"

*/

(function (temp) {
  // Default global var name will be newT
  // can be overridden by passing something different
  // into the self executing wrapper function
  temp = temp || "newT";

  // internally refer to it as T for brevity sake
  var T = function(options) {
    this.init(options || {});
  }, regex_pattern=/\<[^\>]+\>|\&[^ ]+;/;

  T.prototype = {
    constructor: T.prototype.constructor,
    version : "1.1.1.1",
    init: function(options) {
      this.options = options;
      this.templates = {};
      this.__createMethods();
      return this;
    },
    // simple function to save the passed in template
    save: function(name, template) {
      var name_parts = name.split("."),
          ns = "global";
      name = name_parts[0];
      if(name_parts.length > 1) {
        ns = name_parts[1];
      }
      if(!this.templates.hasOwnProperty(ns)) { this.templates[ns] = {}; }
      this.templates[ns][name] = template;
      return this;
    },
    // create the elements for the template
    // and if an exisiting root el was passed in, append it to that root
    // either way, return the newly created element(s)
    render: function(name, data, opts) {
      var name_parts = name.split("."), 
          ns = "global",
          new_el;
      name = name_parts[0];
      if(name_parts.length > 1) {
        ns = name_parts[1];
      }
      
      opts = opts || {};
      opts.scope = opts.scope || null;
      opts.data = data;

      // if a preprocessing function is specified in the options, call it
      // use either the specified scope, or the default of null (set earlier)
      // params
      if (opts.preData) { opts.data = opts.preData.call(opts.scope, opts.data); }
      if (opts.pre) { var ret = opts.pre.call(opts.scope, opts.data); }
      
      new_el = this.templates[ns][name](opts.data);
      if(typeof new_el === "object" && new_el.length > 0) {
        var _new_el=new_el.slice(0);
        new_el=document.createDocumentFragment();
        for(var i in _new_el) {
            new_el.appendChild( _new_el[i] );
        }
      }

      if(opts.el) {
        opts.el.appendChild(new_el);
      }

      // if a posprocessing function is specified in the options, call it
      // use either the specified scope, or the default of null (set earlier)
      if (opts.post) { opts.post.call(opts.scope, new_el, opts.data); }
      return new_el;
    },
    renderToString: function(name, data, opts) {
      opts = opts || {};
      delete opts.el;

      var el = document.createElement("div");
      el.appendChild(this.render(name, data, opts));

      return el.innerHTML;

    },
    // function to iterate over a collection and render a template
    // for each item in the collection
    // uses a document fragment to collect each element and pass it back
    eachRender: function(data, template, opts) {
      opts = opts || {};
      var frag = document.createDocumentFragment();
      opts.el = frag;
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          this.render(template, data[i], opts);
        }
      }
      return frag;
    },
    // more free form iterator function that allows passing an ad-hoc
    // rendering function to be evaluated for each item in the collection
    // uses a document fragment to collect each element and pass it back
    each: function(data, func) {
      var frag = document.createDocumentFragment(), child, idx=0;
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          child = func(data[i], idx);
          if(child) {
            frag.appendChild(child);
          }
          idx+=1;
        }
      }
      return frag;
    },
    // function that gets called in initializing the class... loops through
    // list of allowed html elements, and creates a helper function on the prototype
    // to allow easy creation of that element simply by calling its name as a function
    __createMethods: function() {
      //var el_list = "a abbr acronym address applet area b base basefont bdo bgsound big blockquote body br button caption center cite code col colgroup comment custom dd del dfn dir div dl dt em embed fieldset font form frame frameset head h1 h2 h3 h4 h5 h6 hn hr html i iframe img input input ins isindex kbd label legend li link listing map marquee menu meta nobr noframes noscript object ol optgroup option p param plaintext pre q rt ruby s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var wbr xml xmp video audio";
      var el_list = "a abbr address area article aside audio b base bdi bdo blockquote body br button canvas caption cite code col colgroup command datalist dd del details device dfn div dl dt em embed fieldset figcaption figure footer form h1 h2 h3 h4 h5 h6 head header hgroup hr html i iframe img input ins kbd keygen label legend li link map mark menu meta meter nav noscript object ol optgroup option output p param pre progress q rp rt ruby s samp script section select small source span strong style sub summary sup table tbody td textarea tfoot th thead time title tr track ul var video wbr",
          els = el_list.split(" "),
          prefix = this.options.prefix || "", _this = this;

      // extra helper for just grouping a bunch together without a specific parent
      els.push("frag");      
      
      
      for(var i=0, len=els.length; i<len; i++) (function(el) {
        T.prototype[prefix+el] = function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(el);
          return T.prototype.element.apply(_this, args);
        }
      })(els[i]);
      return this;
    },
    // generic version of the function used to build the element specific creation functions
    // type -> name of element to create
    // attributes (optional) -> object with key/value pairs for attributes to be added to the element
    //                          to avoid silliness with using class as an object key
    //                          you must use "clss" to set class.  yuck
    // content (optional) -> arbitrarily many pieces of content to be added within the element
    //                       can be strings, domElements, or anything that evaluates to either of those
    element: function(type, attributes, content) {
      var args = Array.prototype.slice.call(arguments).slice(1),
          el = (type==="frag" ? document.createDocumentFragment() : document.createElement(type));
      if(args.length) {
        content = args;
      }
      else {
        return el;
      }

      if (args[0].toString() === "[object Object]") {
        attributes = content.shift();
      }
      else {
        attributes = null;
      }

      if(attributes) {
        if("when" in attributes && !attributes.when) { el = null; return ""; }
        
        for(attr in attributes) {
          switch(attr.toLowerCase()) {
            case "clss":
            case "classname":
              el.className = (attributes[attr].join ? attributes[attr].join(" ") : attributes[attr]);
              break;
            case "style":
              el.cssText = el.style.cssText = attributes[attr];
              break;
            default:
              if(attr.charAt(0) === "_") {
                var attr_name = attr.substring(1);
                if(attributes[attr]) {
                  el.setAttribute(attr_name, attr_name);
                }
              }
              else{
                el.setAttribute(attr, attributes[attr]);
              }
          }
        }
      }

      for(var i=0, len=content.length; i<len; i++) {
        // if the content is a string, create a Text Node to hold it and append
        // unless (for now) there are html tags or entities in it... then just innerHTML it
        switch(typeof content[i]) {
            case "string":
            if(content[i].match(regex_pattern)) {
              el.innerHTML += (this.options.safe_mode ? this.escapeHTML(content[i]) : content[i]);
            }
            else {
              el.appendChild(document.createTextNode((this.options.safe_mode ? this.escapeHTML(content[i]) : content[i])));
            }            
            break;
          
            case "number":
                el.appendChild(document.createTextNode(content[i]));                
            break;
          
            case "function":
                el.appendChild(content[i]());
            break;
            
            default:
                el.appendChild(content[i]);
            break;

        }
      }
      return el;
    },
    // method to escape potentially unsafe_html.. will convert any chars that may enable script injection to their
    // html entity equivalent
    escapeHTML: function( unsafe_html ) {
        return (unsafe_html && unsafe_html.replace(/&/mg, "&amp;").replace(/"/mg, "&quot;").replace(/'/mg, "&#39;")
                     .replace(/>/mg, "&gt;").replace(/</mg, "&lt;") ) || "";
    },
    setOption: function(key, val){
      if (typeof key === "object") {
        for (var _key in key) { this.options[_key] = key[_key]; }
      }
      else { 
        this.options[key] = val;
      }
      return this;
    },
    safeMode: function(on) {
      this.options["safe_mode"] = !!on; 
      return this;
    },
    // If you want another separate instance of newT, perhaps to keep its own template management
    // call newT.clone() and it will return another freshly initialized copy (with a clear templates object)
    clone: function() {
      return new T();
    },
    // want to write plugin elements that can do more than just render dom elements?
    // such as dom elements that have some extra processing or ajax requests related to their rendering
    // extend the core newT prototype with this method.
    extend: function(name, func, force) {
      if(!(name in T.prototype) || force) {
        T.prototype[name] = func;
        return true;
      }
      return false;
    }
  }
  window[temp] = new T();
})();
