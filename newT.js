(function (temp) {
  temp = temp || "newT";
  var $ = function() {
    this.init();
  }

  $.prototype = {
    constructor: $.prototype.constructor,
    init: function(data) {
      this.templates = {};
      this.__createMethods();
      return this;
    },
    save: function(name, template) {
      this.templates[name] = template;
    },
    render: function(name, data, el) {
      var new_el = this.templates[name](data);

      if(el) {
        el.appendChild(new_el);
      }
      return new_el;
    },
    each_render: function(data, template) {
      var frag = document.createDocumentFragment();
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          this.render(template, data[i], frag);
        }
      }
      return frag;
    },
    each: function(data, func) {
      var frag = document.createDocumentFragment();
      for(var i in data) {
        if(data.hasOwnProperty(i)) {
          frag.appendChild(func(data[i]));
        }
      }
      return frag;
    },
    __createMethods: function() {
      var el_list = "a abbr acronym address applet area b base basefont bdo bgsound big blockquote body br button caption center cite code col colgroup comment custom dd del dfn dir div dl dt em embed fieldset font form frame frameset head hn hr html i iframe img input input type=button input type=checkbox input type=file input type=hidden input type=image input type=password input type=radio input type=reset input type=submit input type=text ins isindex kbd label legend li link listing map marquee menu meta nobr noframes noscript object ol optgroup option p param plaintext pre q rt ruby s samp script select small span strike strong style sub sup table tbody td textarea tfoot th thead title tr tt u ul var wbr xml xmp";
      var els = el_list.split(" ");

      var _this = this;
      for(var i=0, len=els.length; i<len; i++) (function(el) {
        $.prototype[el] = function() {
          var args = Array.prototype.slice.call(arguments);
          args.unshift(el);
          return $.prototype.__createElGeneric.apply(_this, args);
        }
      })(els[i]);
      return this;
    },
    __createElGeneric: function(type, attributes, content) {
      var args = Array.prototype.slice.call(arguments).slice(1);
      var el = document.createElement(type);
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
          if(attr === "clss") {
            el.className = attributes[attr];
          }
          else {
            el.setAttribute(attr, attributes[attr]);
          }
        }
      }


      for(var i=0, len=content.length; i<len; i++) {
        if(typeof content[i] === "string") {
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
  window[temp] = new $();
})();
