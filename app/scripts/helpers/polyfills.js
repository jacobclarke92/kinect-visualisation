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

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}