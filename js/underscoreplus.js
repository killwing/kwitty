// underscoreplus.js v0.1.2

(function() {

'use strict';

var usp = {};

// duplicate strings
usp.dup = function(s, n) {
    var a = [];
    while (n--) {
        a.push(s);
    }
    return a.join('');
};

// paramilized string using {num}, start from index 0
usp.format = function(s) {
    var args = arguments;
    return s.replace(/\{(\d+)\}/g, function(m, i) {
        return args[parseInt(i, 10)+1];
    });
};

// paramilized string using {word}
usp.template = function(s, t) {
    return s.replace(/{(\w+)}/g, function(s, w) {
        return t[w];
    });
}

// multi-line string using function definition + comment
usp.mlstr = function(f) {
    var lines = f.toString();
    return lines.substring(lines.indexOf("/*") + 2, lines.lastIndexOf("*/"));
};

// delete specific values in a Array inplace
usp.erase = function(a, deleteValue) {
    for (var i = 0; i < a.length; i++) {
        if (a[i] === deleteValue) {
            a.splice(i, 1);
            i--;
        }
    }
    return a;
};

// class inherit
usp.inherits = function(ctor, superCtor) {
    ctor.super_ = superCtor;
    ctor.prototype = Object.create(superCtor.prototype, {
        constructor: {
            value: ctor,
            enumerable: false,
            writable: true,
            configurable: true
        }
    });
};

// decode a URL-encoded string into key/value pairs
usp.formDecode = function(encoded) {
    var params = encoded.split('&');
    var decoded = {};
    for (var i = 0; i !== params.length; i++) {
        var keyval = params[i].split('=');
        if (keyval.length === 2) {
            var key = usp.fromRfc3986(keyval[0]);
            var val = usp.fromRfc3986(keyval[1]);
            decoded[key] = val;
        }
    }
    return decoded;
};

// return the querystring decoded into key/value pairs
usp.getQueryStringParams = function(s) {
    var urlparts = s.split('?');
    if (urlparts.length === 2) {
        return usp.formDecode(urlparts[1]);
    } else {
        return usp.formDecode(s);
    }
};

// encode a value according to the RFC3986 specification
usp.toRfc3986 = function(val) {
    return encodeURIComponent(val).replace(/\!/g, '%21')
                                  .replace(/\*/g, '%2A')
                                  .replace(/'/g, '%27')
                                  .replace(/\(/g, '%28')
                                  .replace(/\)/g, '%29');
};

// decode a string that has been encoded according to RFC3986
usp.fromRfc3986 = function(val) {
    var tmp = val.replace(/%21/g, '!')
                 .replace(/%2A/g, '*')
                 .replace(/%27/g, "'")
                 .replace(/%28/g, '(')
                 .replace(/%29/g, ')');
    return decodeURIComponent(tmp);
};

// add a key/value parameter to the supplied URL
usp.addURLParam = function(url, key, value) {
    var sep = (url.indexOf('?') >= 0) ? '&' : '?';
    return url + sep + usp.toRfc3986(key) + '=' + usp.toRfc3986(value);
};

var HTML_ENTITIES = {
    '>': '&gt;',
    '<': '&lt;',
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;'
};

// HTML escaping
usp.escapeHtml = function(text) {
    return text && text.replace(/[&"'><]/g, function(character) {
        return HTML_ENTITIES[character];
    });
};

usp.unescapeHtml = function(text) {
    return text.replace(/&gt;/g, '>')
               .replace(/&lt;/g, '<')
               .replace(/&quot;/g, '"')
               .replace(/&#39;/g, "'")
               .replace(/&amp;/g, '&');
};

// regex escaping
usp.escapeRegex = function(re) {
    return re.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
};

// add blank target to URL
usp.addBlankTarget = function(a) {
    return a.replace(/^<a /, '<a target="_blank" ');
};


// exports
var root = this;
if (typeof module !== 'undefined' && module.exports) {
    try {
        var _ = require('underscore');
        _.mixin(usp);
        module.exports = _;
    } catch (e) {
        module.exports = usp;
    }
} else if (root._) {
    root._.mixin(usp);
} else {
    root._ = usp;
}


}).call(this);

