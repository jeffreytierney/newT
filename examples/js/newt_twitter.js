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
                var profile_url =  "http://twitter.com/" + tweet.user.screen_name;
                return (
                  newT.div({clss : "single_tweet_box"},
                    newT.div({ clss : "user_profile" },
                        newT.a({href : profile_url},
                            newT.img({src : tweet.user.profile_image_url})

                        )
                    ),
                    newT.div({ clss : "user_meta" },
                        newT.h4({}, 
                            newT.a({href : profile_url}, tweet.user.screen_name )
                        ),
                        newT.h3({}, tweet.text),
                        newT.div({ clss : "tweet_time" },
                            newT.div(tweet.created_at)
                        )

                    ),
                    newT.div({clss : "hr"}, newT.hr())

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
