(function() {

    // default config
    var defConfig = function() {
        return {
            basics: {
                refresh: {
                    home: '1',
                    mentions: '3',
                    retweets: '3',
                    messages: '5',
                    search: '3',
                    others: '5',
                    autoload: true,
                    disreadingload: true,
                },
                api: {
                    address: 'http://kwittyapp.appspot.com/',
                },
                trends: {
                    country: '1',
                    town: '0',
                }
            },
            gui: {
                background: {
                    imageFileName: '',
                    //imageData: '', imageData will stored independently
                },
                theme: {
                    tltheme: 'Flick',
                },
                display: {
                    compact: true,
                    expandurl: false,
                    rich: false,
                    tabwidth: 'Normal',
                }
            },
        };
    };

    var config = defConfig();
    

    var set = function(cfg) {
        config = cfg;
        localStorage.config = JSON.stringify(config);
    };

    var saveValue = function(item, val) {
        var path = item.split('.');
        var target = config;
        for (var i = 0; i != path.length; ++i) {
            if (i < path.length-1) {
                target = target[path[i]];
            } else {
                target[path[i]] = val;
            }
        }
        localStorage.config = JSON.stringify(config);
    };

    var get = function() {
        return config;
    };

    var saveToLS = function(key, value) {
        localStorage[key] = value;
    };

    var loadFromLS = function(key) {
        return localStorage[key];
    };

    var reset = function() {
        config = defConfig();
        localStorage.config = JSON.stringify(config);
    };

    var clear = function() {
        config = {};
        delete localStorage.config;
    };

    var check = function() {
        // new in v1.1
        if (!config.gui.display) {
            config.gui.display = defConfig().gui.display;
        }
        // new in v1.2
        if (!config.gui.theme) {
            config.gui.theme = defConfig().gui.theme;
        }
        // new in v1.4
        if (!config.basics.refresh.retweets) {
            config.basics.refresh.retweets = defConfig().basics.refresh.retweets;
        }
        if (!config.gui.display.tabwidth) {
            config.gui.display.tabwidth = defConfig().gui.display.tabwidth;
        }
        if (!config.basics.refresh.disreadingload) {
            config.basics.refresh.disreadingload = defConfig().basics.refresh.disreadingload;
        }
        // new in v1.4.4
        if (!config.basics.refresh.search) {
            config.basics.refresh.search = defConfig().basics.refresh.search;
        }
        // new in v1.5.0
        if (!config.basics.trends) {
            config.basics.trends = defConfig().basics.trends;
        }
        if (!config.basics.refresh.others) {
            config.basics.others = defConfig().basics.refresh.others;
        }
    };

    var init = function() {
        if (localStorage.config) {
            config = JSON.parse(localStorage.config);
            check() // check missing values when upgrading
        } else {
            // set default to LS
            localStorage.config = JSON.stringify(config);
        }   
    };

    // exports
    var root = this;
    if (!root.config) {
        root.config = {
            set: set,
            saveValue: saveValue,
            get: get,
            saveToLS: saveToLS,
            loadFromLS: loadFromLS,
            reset: reset,
            clear: clear,
            init: init,
        };
    }

})();


