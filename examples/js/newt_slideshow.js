/*
*   newt_slideshow.js
*
*
* */

(function(window, undefined) {
    
    var nS = function() {
        this.init();
        return this;
    }
    nS.prototype = {
        loading : 0,
        meta : {
            url : "http://api.flickr.com/services/rest/"
            //http://api.flickr.com/services/rest/?method=flickr.photos.search&text=kitten&format=json&api_key=c8a8e577657c47d24c7835a563a05a00&media=photos&per_page=10&jsoncallback=foo
            //http://www.flickr.com/services/api/misc.urls.html
            //http://farm{farm-id}.static.flickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
            
        },
        photo_url : function( options ) {
            var url="http://farm%{farm}.static.flickr.com/%{server}/%{id}_%{secret}_%{size}.jpg";
            return out( url, options );
        },

        photo_setup : {
            size : "z",
            farm : 1,
            secret : null,
            server : null,
            id : null
        },
        // returns deferred promise (aka a callback);
        search : function( txt ) {
            var self=this, dfr=$.Deferred(), promise;
            var params=$.extend(true, {}, self.remote_setup, { text : txt } );
            
            promise = self.remote( self.meta.url, params );
            promise.done( dfr.resolve );
            
            return dfr.promise();

        },

        remote_setup : {
            method : "flickr.photos.search",
            format : "json",
            per_page : 10,
            license : "",
            text : "cute kitten",
            api_key : "c8a8e577657c47d24c7835a563a05a00",
            media : "photos"
        },
        init : function() {
            // setup newT templates to use rendering
            this.dom_photo_template();
            this.dom_outer_box(); 
        },
        templates : {
            photo : "sng_photo_box"
        },
        start : function( elem, term ) {
            var self=this, dfr=$.Deferred();
            var promise = self.search( term || "cute kitten" );
            promise.done( function(data) {
                self.dom_add_photos(elem, data);
                dfr.resolve(data);
            });
            return dfr.promise();
        },
        dom_add_photos : function( elem, data ) {
            var self=this,
                photos=self.parse_photos( data );

            self.loading=photos.length;
            newT.render("slideshow_box", photos, {
                el : elem 
            });
        },

        dom_outer_box : function() {
            var self=this;
            newT.save("slideshow_box", function(data){
                return (newT.div({clss : "outer_slideshow"},
                            newT.eachRender( data, self.templates.photo )
                       ))
            });
        },
        parse_photos : function( data ) {
            var self=this,
                p=data.photos || {},
                lst=p.photo || [],
                p_params={},
                photos=[];
            for(var i=0; i<lst.length; i++) {
                p_params=$.extend(true, {}, self.photo_setup, lst[i]);
                var p_url = self.photo_url( p_params );
                photos.push({
                    photo : p_url,
                    text : lst[i].title
                });
            }
            return photos;
            
        },

        photo_loaded : function(e, elem, photo_info) {
            var self=this;
            self.loading-=1;
            elem.setAttribute("width", elem.naturalWidth || elem.width );
            elem.setAttribute("height", elem.naturalHeight || elem.height );
            elem.className=elem.className + " loaded_complete";
            if(self.loading===0){
                self.photo_load_complete();
            }
            delete self;
        },
        // EVENT, override
        photo_load_complete : function() {
            console.log("photos done");
        },

        // newT can work easily with JS Img Objects
        dom_photo_template : function() {
            var self=this;
            newT.save(self.templates.photo, function(data){
                return (
                    newT.div({ clss : "sng_photo_box" },
                        self.dom_photo(data)
                    )
                )
            });
        },
        dom_photo : function(data) {
            var self=this;
            var img=new Image();
            img.className="unloaded_img";
            img.onload=(function(scope, meta){
                return function(e){
                    scope.photo_loaded.call(scope, e, this, meta);
                }
            })(self, data);
            img.src=data.photo;
            return img;
        },

        remote : function( url, r_data ) {
            var dfr=$.Deferred();
            $.ajax({
                "url" : url,
                jsonp : "jsoncallback",
                data : r_data,
                dataType : "jsonp",
                success :  dfr.resolve
            });
            return dfr.promise();
        },

        extend : function( name, cmnd ) {
            nS.prototype[name]=cmnd;
            return this;
        }
    }
// utility string parse function
function out( str, options ) {
    for(k in options) {
        str=str.replace(/%\{([a-zA-Z0-9-]{1,}?)\}/mi, function(m, key ){
            return options[key];
        });
    }
    return str;
}

    window.newt_slideshow=new nS();
})(window);

/*
*  showControls.js
*
* */
(function(window, undefined){
    
    var sC = function() {
        this.init();
    }, active_transition=false;
    sC.prototype = {
        key : {
            LEFT : 37,
            UP : 38,
            RIGHT : 39,
            DOWN : 40
        },
        init : function() {
            this.listen_keyboard();
        },

        loader : function( bool ) {
            // see if loader exists
            // show/hide it
        },

        listen: function() {
            // add the  DOM events to listen for photos, plus more
            this.listen_photo();
            
        },
        
        start : function() {
            this.current().fadeIn('normal');
        },
        transition_complete : function( pos ) {
            console.log("finished")
        },
        change_photo : function( incr ) {
            if(active_transition) { return; }
            var self=this,
                $curr=this.current(),
                $imgs = this.all(),
                pos = $.inArray($curr.get(0), $imgs),
                num=0;

            active_transition=true;
            $curr.fadeOut();

            if(Math.abs(incr) === incr) {
                num = ($imgs.length > pos+incr ) ? pos+incr : 0
            } else {
                num=(pos+incr >= 0 ) ? pos+incr : $imgs.length-1;
            }

            $imgs.eq( num ).fadeIn('slow', function(){
                active_transition=false;
                self.transition_complete( pos+incr );
            });
        
        },
        all : function() {
            return $(".sng_photo_box img");
        },
        current : function() {
            var $curr = $(".sng_photo_box img:visible"); 
            if(!$curr || $curr.length <= 0) {
                $curr=$(".sng_photo_box img:first");
            }
            return $curr;
        },
        listen_photo : function() {
            // listen for clicks events on the photo
            //
            var self=this;
            $(".sng_photo_box").bind("click", function(e){
                // find where this element is in list,
                // show "next" photo
                self.change_photo(1);
            })
        },

        listen_keyboard : function() {
            // listen for the arrow keys plus VIM key bindings
            var self=this;
            $(document.body).bind("keydown", function(e){
                switch(e.keyCode) {
                    case self.key.LEFT:
                        e.preventDefault();
                        console.log("left arrow");
                        self.change_photo(-1);
                    break;

                    case self.key.RIGHT:
                        e.preventDefault();
                        console.log("right arrow");
                        self.change_photo(1);
                    break;
                }
            })
        }

    }
    window.showControls = new sC();
})(window);
