/*
*   newt_twitter.js
*       
*   depndencies:
*       jQuery-1.5+
*       newT 1.0+
* */

(function(window, undefined) {
    
    var nT = function() {
        this.init(); // fire this automatically
        return this;
    }
    nT.prototype = {
        // display newt_twitter widget username stream
        show : function( el, username, count ) {
            var self=this, 
                promise=self.remote( username, count );

            promise.done(function(data){
                newT.render(self.templates.box, data, {
                    "el" : el
                });
            });
            return self; // you can chain
        },
        // the names of the templates newt_twitter uses
        templates : {
            box : "tweet_box",
            tweet : "single_tweet"
        },
        // setup the newT templates
        init : function() {
            this.dom_box();
            this.dom_tweet();
        },
        dom_box : function() {
            var self=this;
            newT.save(self.templates.box, function(data){
                return (
                    newT.div({clss : "tweet_box_shell"},
                        newT.div( 
                            newT.eachRender( data, self.templates.tweet )
                        )
                    )
                )
            });
        },
        dom_tweet : function() {
            
            newT.save(this.templates.tweet, function(tweet) {
                var profile_url =  "http://twitter.com/" + tweet.user.screen_name,
                    permalink="http://twitter.com/" + tweet.user.screen_name + "/status/" + tweet.id_str; 
                return (
                  newT.div({clss : "single_tweet_box"},
                    // photo
                    newT.div({ clss : "user_profile" },
                        newT.a({href : profile_url},
                            newT.img({src : tweet.user.profile_image_url})
                        )
                    ),
                    // screen name, tweet text, time
                    newT.div({ clss : "user_meta" },
                        newT.h4({}, 
                            newT.a({href : profile_url}, tweet.user.screen_name )
                        ),
                        newT.h3({}, tweet.text),
                        newT.div({ clss : "tweet_time" },
                            newT.a({ href : permalink },
                                newT.div(tweet.created_at)
                            )
                        )
                    ),
                    // just a  little clear for this box
                    newT.div({clss : "hr"}, newT.hr())
                  )
                )
            });

        },
        // Make a remote call to Twitter status for username
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
