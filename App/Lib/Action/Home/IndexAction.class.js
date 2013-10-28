module.exports = Action(function(){
    return {
        init: function(){
            
        },
        indexAction: function(){
            var cookie = this.cookie("name");
            //console.log(__http.req.headers);
            this.end("cookie: " +cookie);
            throw_error({
                msg: "action not exist"
            })
            //throw {name: "welefen", type: "", msg: ""};
        },
        testAction: function(test, test2){
            console.log("test value: " + test + ","+test2);
            this.end();
        }
    }
});