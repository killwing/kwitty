// enhancement

// paramilized string using {num}
String.prototype.format = function() {
    var args = arguments;
    return this.replace(/\{(\d+)\}/g, function(m, i) {
        return args[i];
    });
};

// escape special chars
String.prototype.escapeRe = function() {
    return this.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// multi-line string using function definition + comment
Function.prototype.mlstr = function() {  
    var lines = new String(this);
    return lines.substring(lines.indexOf("/*") + 2, lines.lastIndexOf("*/"));
};


// module of Util
var requireUtil = function() {

    // Decodes a URL-encoded string into key/value pairs.
    var formDecode = function(encoded) {
        var params = encoded.split('&');
        var decoded = {};
        for (var i = 0, param; param = params[i]; i++) {
            var keyval = param.split('=');
            if (keyval.length == 2) {
                var key = fromRfc3986(keyval[0]);
                var val = fromRfc3986(keyval[1]);
                decoded[key] = val;
            }
        }
        return decoded;
    };

    // Returns the querystring decoded into key/value pairs.
    var getQueryStringParams = function(s) {
        var urlparts = s.split('?');
        if (urlparts.length == 2) {
            return formDecode(urlparts[1]);
        } else {
            return formDecode(s);
        }
    };


    // Encodes a value according to the RFC3986 specification.
    var toRfc3986 = function(val) {
        return encodeURIComponent(val).replace(/\!/g, '%21')
                                      .replace(/\*/g, '%2A')
                                      .replace(/'/g, '%27')
                                      .replace(/\(/g, '%28')
                                      .replace(/\)/g, '%29');
    };

    // Decodes a string that has been encoded according to RFC3986.
    var fromRfc3986 = function(val) {
        var tmp = val.replace(/%21/g, '!')
                     .replace(/%2A/g, '*')
                     .replace(/%27/g, "'")
                     .replace(/%28/g, '(')
                     .replace(/%29/g, ')');
        return decodeURIComponent(tmp);
    };

    // Adds a key/value parameter to the supplied URL.
    var addURLParam = function(url, key, value) {
        var sep = (url.indexOf('?') >= 0) ? '&' : '?';
        return url + sep + toRfc3986(key) + '=' + toRfc3986(value);
    };

    var HTML_ENTITIES = {
        '&': '&amp;',
        '>': '&gt;',
        '<': '&lt;',
        '"': '&quot;',
        "'": '&#39;',
        ' ': '&nbsp;'
    };

    // HTML escaping
    var escapeHtml = function(text) {
        return text && text.replace(/[&"'><]/g, function(character) {
            return HTML_ENTITIES[character];
        });
    };

    var addBlankTarget = function(a) {
        return a.replace(/^<a /, '<a target="_blank" ');
    };

    // exports
    return {
        getQueryStringParams: getQueryStringParams,
        addURLParam: addURLParam,
        escapeHtml: escapeHtml,
        addBlankTarget: addBlankTarget,
    };
}
