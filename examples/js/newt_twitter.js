/*
*   newt_twitter
*
* */

(function(window, undefined) {
    
    var nT = function() {
        this.init();
        return this;
    }
    nT.prototype = {
        templates : {
            box : "tweet_box",
            tweet : null
        },
        init : function() {
            this.dom_box();
            this.dom_tweet();
        },
        
        show : function( el, username, count ) {
            var self=this, 
                promise=self.remote( username, count );

            promise.done(function(data){
                console.log("argrs", arguments);
                newT.render(self.templates.box, data, {
                    "el" : el
                });
            });
        },
        dom_box : function() {
            newT.save("tweet_box", function(data){
                return (
                    newT.div({clss : "tweet_box_shell"},
                        newT.div( 
                            newT.eachRender( data, "single_tweet" )
                        )
                    )
                )
            });
        },
        dom_tweet : function() {
            
            newT.save("single_tweet", function(tweet) {
                return (
                  newT.div(
                    newT.div({},
                        newT.img({src : tweet.user.profile_image_url})
                    ),
                    newT.div({},
                        newT.h4(tweet.screen_name),
                        newT.h3(tweet.text)
                    )
                ))
            });

        },

        remote : function( username, count ) {
            var url="https://twitter.com/status/user_timeline/%s.json?count=%d".replace(/%s/, username).replace(/%d/, count),
                dfr=$.Deferred();
            $.ajax({
                "url" : url,
                dataType : "jsonp",
                success :  dfr.resolve
            });
            return dfr.promise();
        }
    }
    window.newt_twitter=new nT();
})(window);
