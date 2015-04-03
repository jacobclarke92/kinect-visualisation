Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

String.prototype.capitalize = function() {
	return this.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

String.prototype.readable = function() {
	return this.replace(/[_-]+(.)?/g,function(str) { return str.charAt(1).toUpperCase() }).replace(/([A-Z])/g, ' $1').replace(/^./, function(str){ return str.toUpperCase() })
};

function map_range(value, start1, stop1, start2, stop2) {
	return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}
function isset(variable) {
	return (typeof variable != 'undefined');
}
function reduceToOne(num) {
    return (num/-1 < 0) ? 1 : -1;
}
function isObjectEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop)) return false;
    }
    return true;
}
function isObjectPathSet(baseObj, pathArr) {
    var oldObj = baseObj;
    if(typeof baseObj == 'object' && typeof pathArr == 'object') {
        for(var i=0; i<pathArr.length; i ++) {
            if(isset(oldObj[pathArr[i]])) {
                oldObj = oldObj[pathArr[i]];
            }else{
                return false;
            }
        }
        return true;
    }else{
        console.warn('isObjectPathSet -- bad typecast');
        return false;
    }
}

String.prototype.destring = function() {
    var num = parseFloat(this);
    if(!isNaN(num)) return num;
    console.log('BAD STRING! can\'t parse ',this,' into a number');
    return false;
}