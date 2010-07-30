(function (temp) {
  // Default global var name will be newT
  // can be overridden by passing something different
  // into the self executing wrapper function
  temp = temp || "newT";

  // internally refer to it as T for brevity sake
  var T = function() {
    this.init();
  }

  T.prototype = {
    constructor: T.prototype.constructor,
    init: function(data) {
      this.templates = {};
      this.__createMethods();
      return this;
    },
    // simple function to save the passed in template
    save: function(name, template) {
      this.templates[name] = template;
      return this;
    },
    // create the elements for the template
    // and if an exisiting root el was passed in, append it to that root
    // either way, return the newly created element(s)
    render: function(name, data, opts) {
      opts = opts || {};
      opts.scope = opts.scope || null;
      opts.data = data;

      // if a preprocessing function is specified in the options, call it
      // use either the specified scope, or the default of null (set earlier)
      // params
      if (opts.preData) { opts.data = opts.preData.call(opts.scope, opts.data); }
      if (opts.pre) { var ret = opts.pre.call(opts.scope, opts.data); }

      var new_el = this.templates[name](opts.data);

      if(opts.el) {
        opts.el.appendChild(new_el);
      }

      // if a posprocessing function is specified in the options, call it
      // use either the specified scope, or the default of null (set earlier)
      if (opts.post) { opts.post.call(opts.scope, new_el, opts.data); }
      return new_el;
    },
    // function to iterate over a collection and render a template
    // for each item in the collection
    // uses a document fragment to collect each element and pass it back
    each_render: function(data, template, opts) {
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
      var frag = document.createDocumentFragment();
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          frag.appendChild(func(data[i]));
        }
      }
      return frag;
    },
    // function that gets called in initializing the class... loops through
    // list of allowed html elements, and creates a helper function on the prototype
    // to allow easy creation of that element simply by calling its name as a function
    __createMethods: function() {
      var el_list = "a abbr acronym address applet area b base basefont bdo bgsound big blockquote body br button caption center cite code col colgroup comment custom dd del dfn dir div dl dt em embed fieldset font form frame frameset head h1 h2 h3 h4 h5 h6 hn hr html i iframe img input input ins isindex kbd label legend li link listing map marquee menu meta nobr noframes noscript object ol optgroup option p param plaintext pre q rt ruby s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var wbr xml xmp";
      var els = el_list.split(" ");

      // extra helper for just grouping a bunch together without a specific parent
      els.push("frag");

      var _this = this;
      for(var i=0, len=els.length; i<len; i++) (function(el) {
        T.prototype[el] = function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(el);
          return T.prototype.__createElGeneric.apply(_this, args);
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
    __createElGeneric: function(type, attributes, content) {
      var args = Array.prototype.slice.call(arguments).slice(1);

      var el = (type==="frag" ? document.createDocumentFragment() : document.createElement(type));
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
        for(attr in attributes) {
          switch(attr) {
            case "clss":
              el.className = attributes[attr];
              break;
            case "style":
              el.cssText = el.style.cssText = attributes[attr];
              break;
            default:
              el.setAttribute(attr, attributes[attr]);
          }
        }
      }

      for(var i=0, len=content.length; i<len; i++) {
        // if the content is a string, create a Text Node to hold it and append
        // unless (for now) there are html tags or entities in it... then just innerHTML it
        if(typeof content[i] === "string") {
          var re = /\<[^\>]+\>|\&[^ ]+;/;
          if(content[i].match(re)) {
            el.innerHTML += content[i];
          }
          else {
            el.appendChild(document.createTextNode(content[i]));
          }

        }
        else if (typeof content[i] === "number") {
          el.appendChild(document.createTextNode(content[i]));
        }
        else if(typeof content[i] === "function") {
          el.appendChild(content[i]());
        }
        else {
          el.appendChild(content[i]);
        }
      }
      return el;
    }
  }
  window[temp] = new T();
})();
