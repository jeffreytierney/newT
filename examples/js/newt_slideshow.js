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
            
            promise = self.remote( self.meta.url, self.remote_setup );
            promise.done( dfr.resolve );
            self.remote_setup.text=txt;
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
                dfr.resolve();
            });
            return dfr.promise();
        },
        dom_add_photos : function( elem, data ) {
            var self=this,
                photos=self.parse_photos( data );

            newT.render("slideshow_box", photos, {
                el : elem 
            });
/*            for(var i=0; i<photos.length; i++){*/
                //self.loading+=1;
                //newT.render(self.templates.photo, photos[i], {
                    //el : elem
                //});
            /*}*/
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
                p_params=$.extend({}, true, self.photo_setup, lst[i]);
                var p_url = self.photo_url( p_params );
                photos.push({
                    photo : p_url,
                    text : lst[i].title
                });
            }
            return photos;
            
        },

        photo_loaded : function(e, photo_info) {
            var self=this;
            self.loading-=1;
            if(self.loading===0){
                self.photo_load_complete();
            }
            console.log(this, e, photo_info);
        },

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
                    scope.photo_loaded.call(scope, e, meta );
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
 *
* */
(function(window, undefined){
    
    var sC = function() {
        this.init();
    }
    sC.prototype = {
        init : function() {
        },

        loader : function( bool ) {
            // see if loader exists
            // show/hide it
        },

        listen: function() {
            // add the  DOM events to listen for photos, plus more
            this.listen_photo();
        },

        forward : function() {
            // external control to move forward
            //
            console.log("play me", arguments);
        },
        back : function() {
            
        },
        listen_photo : function() {
            // listen for clicks events on the photo
            //
            var self=this;
            $(".sng_photo_box").bind("click", function(e){
                self.forward();
            })
        },

        listen_keyboard : function() {
            // listen for the arrow keys plus VIM key bindings
        }

    }
    window.showControls = new sC();
})(window);
