var value = 1;
exports.value = function(){
    console.log(fn)
    return value;
};
exports.change = function(val){
    value = val;
}