// longurl plugin for kwitty

(function($) {

$.fn.extend({

    longurl: function() {
        var urlRe = /https?:\/\/([\w\.\_\-]+)(\/?)[\w\-\_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\{\}\|\\\^\`\%]*/

        var items = [];
        this.each(function() {
            if (typeof $(this).attr('href') != "undefined") {
                if (urlRe.test($(this).attr('href'))) {
                    items.push({url: $(this).attr('href'), node: $(this)});
                }
            } else {
                $(this).find('a').each(function() {
                    if (typeof $(this).attr('href') != "undefined" && urlRe.test($(this).attr('href'))) {
                        items.push({url: $(this).attr('href'), node: $(this)});
                    }
                });
            }
        });

        $.each(items, function(k, v) {
            if (v.url.length > 30) {
                return;
            }
            $.getJSON('http://api.longurl.org/v2/expand?callback=?', {url: encodeURI(v.url), format: 'json'}, function(data) {
                var longUrl = data['long-url'];
                if (longUrl) {
                    if (longUrl == v.url) {
                        return;
                    }
                    var urlparts = urlRe.exec(longUrl);
                    var favicon = 'http://www.google.com/s2/favicons?domain=' + urlparts[1] // domain
                    var html = '<span class="t_expandedurl"><img src="'+favicon+'">&nbsp;<a href="'+longUrl+'" target="_blank">'+urlparts[1]+'/...</a></span>';
                    v.node.parent().after(html);
                }
            });
        });
    
        return this;
    }

});

})(jQuery);
