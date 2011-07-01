newT.save("simple", function(data){
    return newT.div({}, data.name);
});

newT.render("simple", { name : "start" }, {
    pre : function(data) {
        data.name+="pre"
        return data
    },
    preData : function(data) {
        data.name+=" preData "
        return data
    },
    el : document.body
});

// appends <div>start preData pre</div
