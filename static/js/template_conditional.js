function render_tmplte( data ){
    return (
        newT.div({
            when : data.shown, 
            clss : "shown"
        }, "show me", 
            newT.div({ 
                when : data.hidden, 
                clss : "hidden"
            }, "hide me")
        )
    )
}
newT.save("my_template", render_tmplte);
newT.render("my_template", {
    shown : 1==1,
    hidden : 1!=1
}, {
    el : document.body
});

