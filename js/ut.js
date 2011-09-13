(function() {

// paramilized string using {num}
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m, i) {
        return args[i];
    });
};


// multi-line string using function definition + comment
Function.prototype.mlstr = function() {  
    var lines = new String(this);
    return lines.substring(lines.indexOf("/*") + 2, lines.lastIndexOf("*/"));
};


var ut = {};

// Decodes a URL-encoded string into key/value pairs.
ut.formDecode = function(encoded) {
    var params = encoded.split('&');
    var decoded = {};
    for (var i = 0, param; param = params[i]; i++) {
        var keyval = param.split('=');
        if (keyval.length == 2) {
            var key = ut.fromRfc3986(keyval[0]);
            var val = ut.fromRfc3986(keyval[1]);
            decoded[key] = val;
        }
    }
    return decoded;
};

// Returns the querystring decoded into key/value pairs.
ut.getQueryStringParams = function(s) {
    var urlparts = s.split('?');
    if (urlparts.length == 2) {
        return ut.formDecode(urlparts[1]);
    } else {
        return ut.formDecode(s);
    }
};


// Encodes a value according to the RFC3986 specification.
ut.toRfc3986 = function(val) {
    return encodeURIComponent(val).replace(/\!/g, '%21')
                                  .replace(/\*/g, '%2A')
                                  .replace(/'/g, '%27')
                                  .replace(/\(/g, '%28')
                                  .replace(/\)/g, '%29');
};

// Decodes a string that has been encoded according to RFC3986.
ut.fromRfc3986 = function(val) {
    var tmp = val.replace(/%21/g, '!')
                 .replace(/%2A/g, '*')
                 .replace(/%27/g, "'")
                 .replace(/%28/g, '(')
                 .replace(/%29/g, ')');
    return decodeURIComponent(tmp);
};

// Adds a key/value parameter to the supplied URL.
ut.addURLParam = function(url, key, value) {
    var sep = (url.indexOf('?') >= 0) ? '&' : '?';
    return url + sep + ut.toRfc3986(key) + '=' + ut.toRfc3986(value);
};

// HTML escaping
ut.escapeHtml = function(text) {
    return text.replace(/>/g, '&gt;')
               .replace(/</g, '&lt;')
               .replace(/ /g, '&nbsp;');
};

// Regex escaping
ut.escapeRegex = function(re) {
    return re.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

ut.addBlankTarget = function(a) {
    return a.replace(/^<a /, '<a target="_blank" ');
};


// exports
var root = this;
if (typeof module !== 'undefined'  && module.exports) {
    module.exports = ut;
} else if (!root.ut) {
    root.ut = ut;
}

})();
