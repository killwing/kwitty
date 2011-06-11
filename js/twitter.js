var util = requireUtil();

// module of Twitter
var requireTwitter = function() {

    var oauth = null;
    var bauth = null;
    var authMode = null;
    
    var createRequest = function(type, url, data, success, error, dataType) {

        var request = {};
        request.sign = function() {
            // sign the request
            if (authMode == 'OAuth') {
                console.log('OAuth Signed Request');

                // compute hash of all base string
                data.oauth_version = '1.0';
                var hash = oauth.sign(type, url, data);

                // filter non-oauth data out
                var nonOAuthData = {}
                $.each(data, function(k, v) {
                    if (k.indexOf('oauth_') == -1) {
                        nonOAuthData[k] = v;
                    }
                });
                data = nonOAuthData;

                // set oauth params to auth header (',' separated);
                var oauthData = hash.header.split(' ');
                var onlyOAuthData = $.grep(oauthData, function(n ,i) {
                    return (n.indexOf('oauth_') > -1);
                });
                setAuthorizationHeader('OAuth ' + onlyOAuthData.join(','));
                //url = oauth.sign(type, url, data).signed_url
            } else if (authMode == 'Basic') {
                setAuthorizationHeader('Basic ' + bauth.getConfd().x);
            }
        };

        request.send = function() {
            console.log('Request.send():', url, data);
            this.sign();

            $.ajax({
                type: type,
                url: url,
                data: data,
                success: success,
                error: error,
                dataType: dataType || 'json',
                timeout: 10*1000,
            });
        }
        return request;
    };

    var setAuthorizationHeader = function(header) {
        $.ajaxSetup({
            beforeSend: function(xhr) { 
                xhr.setRequestHeader('Authorization', header);
            }
        });
    };

    var getAuthMode = function() {
        return authMode;
    };

    var getCurrentUserName = function() {
        if (authMode == 'Basic' && bauth) {
            return bauth.getScreenName();
        } else if (authMode == 'OAuth' && oauth) {
            return oauth.getScreenName();
        } else {
            console.error('API.getCurrentUserName(): Not login.');
        }
    };

    var getBAuth = function() {
        if (bauth) {
            return bauth;
        }

        var confd = {};
        var apiBase = 'https://api.twitter.com/1';

        var ba = {};
        ba.saveConfd = function() {
            localStorage.x_x = JSON.stringify(confd);
        };

        ba.loadConfd = function() {
            if (localStorage.x_x) {
                confd = JSON.parse(localStorage.x_x);
                return true;
            }
            return false;
        };

        ba.getConfd = function() {
            return confd;
        };

        ba.removeConfd = function() {
            confd = {};
            delete localStorage.x_x;
        };

        ba.setAPIBase = function(url) {
            apiBase = url;
        };

        ba.getAPIBase = function() {
            return apiBase;
        };

        ba.getScreenName = function() {
            return confd.screen_name;
        };

        ba.login = function(user, pass, success, error) {
            console.log('BAuth.login()');

            authMode = 'Basic';
            var loginURL = apiBase + '/account/verify_credentials.json';

            if (user && pass) {
                confd.screen_name = user;
                confd.x = btoa(user + ':' + pass);

                setAuthorizationHeader('Basic ' + confd.x);

                var req = createRequest('GET', loginURL, {}, function(ret) {
                    console.log('BAuth.login() - result:', ret);
                    if (ret.error) {
                        error({textStatus: ret.error});
                        return;
                    }

                    ba.saveConfd();

                    success(user);
                }, function(xmlHttpRequest, textStatus, errorThrown) {
                    error({
                        xmlHttpRequest: xmlHttpRequest,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });           
                });
                req.send();

            } else if (user == '' || pass == '') {
                error({textStatus: 'empty username or password'});
            } else {
                this.loadConfd();
                if (confd) {
                    console.log('BAuth.login(): already login, user: ', confd.screen_name) 

                    // just set auth header
                    //setAuthorizationHeader('Basic ' + confd.x);

                    success(confd.screen_name);
                } else {
                    error({textStatus: 'empty username or password'});
                }
            }
        };

        ba.logout = function() {
            console.log('BAuth.logout()');
            this.removeConfd();
            authMode = null;
        };

        bauth = ba;
        return ba;
    };

    var getOAuth = function() {
        if (oauth) {
            return oauth;
        }

        var apiBase = 'https://api.twitter.com/1';
        var oauthURL = 'https://api.twitter.com/oauth';
        var requestURL = oauthURL + '/request_token';
        var authorizeURL = oauthURL + '/authorize';
        var authenticateURL = oauthURL + '/authenticate';
        var accessURL = oauthURL + '/access_token';
        
        var consumerKey = null;
        var consumerSec = null;

        var token = {};

        var oa = {};
        oa.getAPIBase = function() {
            return apiBase;
        };

        oa.getScreenName = function() {
            return token.screen_name;
        };

        oa.setConsumerToken = function(key, secret) {
            consumerKey = key;
            consumerSec = secret;
        };

        oa.requestToken = function(callbackURL, success, error) {
            console.log('OAuth.requestToken()');

            var req = createRequest('POST', requestURL, { oauth_callback: callbackURL }, success, error, 'text');
            req.send();
        };

        oa.authorize = function() {
            console.log('OAuth.authorize()', token);
            window.location = util.addURLParam(authorizeURL, 'oauth_token', token.oauth_token);
        };

        oa.authenticate = function() {
            console.log('OAuth.authenticate()', token);
            window.location = util.addURLParam(authenticateURL, 'oauth_token', token.oauth_token);
        };

        oa.access = function(verifier, success, error) {
            console.log('OAuth.access()', token);
        
            var req = createRequest('POST', accessURL, { oauth_verifier: verifier }, success, error, 'text');
            req.send();
        };

        oa.saveToken = function() {
            localStorage.token = JSON.stringify(token);
        };

        oa.loadToken = function() {
            if (localStorage.token) {
                token = JSON.parse(localStorage.token);
                return true;
            }
            return false;
        };

        oa.removeToken = function() {
            token = {};
            delete localStorage.token;
        };

        oa.sign = function(type, url, data) {
            var sig = {
                consumer_key: consumerKey,
                shared_secret: consumerSec,
            }

            if (token.oauth_token && token.oauth_token_secret) {
                sig.oauth_token = token.oauth_token;
                sig.oauth_secret = token.oauth_token_secret;
            }
            
            return OAuthSimple().sign({
                path: url,
                action: type,
                parameters: data,
                signatures: sig
            });
        };

        oa.login = function(callbackURL, verifier, success, error) {
            console.log('OAuth.login()');

            authMode = 'OAuth';
            this.loadToken();

            if (token && token.screen_name) {
                console.log('OAuth.login(): already login, user: ', token.screen_name) 
                success(token.screen_name);
            } else if (verifier) {
                console.log('OAuth.login(): already verified');
                this.access(verifier, function(ret) {                    
                    console.log('access() - result:', ret);

                    // update token
                    token = util.getQueryStringParams(ret);
                    oa.saveToken();

                    success(token.screen_name);

                }, function(xmlHttpRequest, textStatus, errorThrown) {
                    error({
                        xmlHttpRequest: xmlHttpRequest,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });      
                });
            } else {
                console.log('OAuth.login(): init oauth process');

                // reset token first
                token = {}
                this.requestToken(callbackURL, function(ret) {
                    console.log('requestToken() - result:', ret);

                    token = util.getQueryStringParams(ret);
                    oa.saveToken();

                    // redirect
                    oa.authorize();
                    //oa.authenticate()  // there's a bug of API that it can not redirect to 'chrome-extension://*' when it is set to the callbackURL

                }, function(xmlHttpRequest, textStatus, errorThrown) {
                    error({
                        xmlHttpRequest: xmlHttpRequest,
                        textStatus: textStatus,
                        errorThrown: errorThrown
                    });    
                });
            }
        };

        oa.logout = function() {
            console.log('OAuth.logout()');
            this.removeToken();
            authMode = null;
        }

        oauth = oa;
        return oa;
    };

    var createAPI = function(url) {
        var defaultParam = {};
        var retryInterval = 30*1000;

        var api = {};
        api.addDefaultParam = function(p) {
            $.each(p, function(k, v) {
                defaultParam[k] = v;
            });
        };

        api.getCurrentAPIBase = function() {
            if (authMode == 'Basic' && bauth) {
                return bauth.getAPIBase();
            } else if (authMode == 'OAuth' && oauth) {
                return oauth.getAPIBase();
            } else {
                console.error('API.getCurrentAPIBase(): API base is not set.');
            }
        };

        api.send = function(type, param, success, error) {
            param = param || {};
            $.each(defaultParam, function(k, v) {
                param[k] = v;
            });

            var requestURL = this.getCurrentAPIBase() + url;
            var req = createRequest(type, requestURL, param, function(data) {
                if (data.error) { // handle non-transmission errors
                    error({textStatus: data.error});
                    return;
                }
                success(data);
            }, function(xmlHttpRequest, textStatus, errorThrown) {
                console.log('API.send() - error:', xmlHttpRequest, textStatus/*, errorThrown*/);
                /*
200 OK: Success!
304 Not Modified: There was no new data to return.
400 Bad Request: The request was invalid. An accompanying error message will explain why. This is the status code will be returned during rate limiting.
401 Unauthorized: Authentication credentials were missing or incorrect.
403 Forbidden: The request is understood, but it has been refused. An accompanying error message will explain why. This code is used when requests are being denied due to update limits.
404 Not Found: The URI requested is invalid or the resource requested, such as a user, does not exists.
406 Not Acceptable: Returned by the Search API when an invalid format is specified in the request.
420 Enhance Your Calm: Returned by the Search and Trends API when you are being rate limited.
500 Internal Server Error: Something is broken. Please post to the group so the Twitter team can investigate.
502 Bad Gateway: Twitter is down or being upgraded.
503 Service Unavailable: The Twitter servers are up, but overloaded with requests. Try again later.
                */
             
                var errorStatus = {
                    xmlHttpRequest: xmlHttpRequest,
                    textStatus: textStatus,
                    errorThrown: errorThrown,
                    retry: function() {
                        setTimeout(function() {
                            console.warn('API.send(): retry for ', xmlHttpRequest, textStatus)                
                            req.send();
                        }, retryInterval);
                    }
                };
                if (textStatus != 'timeout' && (xmlHttpRequest.status == 401 || 
                    xmlHttpRequest.status == 404 || 
                    xmlHttpRequest.status == 406)) {
                    delete errorStatus.retry // do not retry for these errors
                }
                error(errorStatus);
            });
            req.send();
        };

        // get
        api.sendRequest = function(param, success, error) {
            this.send('GET', param, success, error);
        };

        // post
        api.sendMessage = function(param, success, error) {
            this.send('POST', param, success, error);
        };

        return api;
    };

    var User = {
        show: function(screenName, success, error) {
            console.log('Twitter.User.show()');
            var api = createAPI('/users/show.json');
            api.sendRequest({screen_name: screenName,
                             include_entities: true}, success, error);
        },

        rateLimit: function(success, error) {
            console.log('Twitter.User.rateLimit()');
            var api = createAPI('/account/rate_limit_status.json');
            api.sendRequest(null, success, error);
        }
    };

    var Tweet = {
        show: function(id, success, error) {
            console.log('Twitter.Tweet.show()');
            var api = createAPI('/statuses/show/'+id+'.json');
            api.sendRequest({include_entities: true}, success, error);
        },

        update: function(msg, success, error) {
            console.log('Twitter.Tweet.update()');
            var api = createAPI('/statuses/update.json');
            api.sendMessage({status: msg, include_entities: true}, success, error);
        },

        reply: function(msg, to, success, error) {
            console.log('Twitter.Tweet.reply()');
            var api = createAPI('/statuses/update.json');
            api.sendMessage({status: msg, in_reply_to_status_id: to, include_entities: true}, success, error);
        },

        retweet: function(id, success, error) {
            console.log('Twitter.Tweet.retweet()');
            var api = createAPI('/statuses/retweet/'+id+'.json');
            api.sendMessage({include_entities: true}, success, error);
        },

        destroy: function(id, success, error) {
            console.log('Twitter.Tweet.destroy()');
            var api = createAPI('/statuses/destroy/'+id+'.json');
            api.sendMessage(null, success, error);
        },

        directMsg: function(screenName, msg, success, error) {
            console.log('Twitter.Tweet.directMsg()');
            var api = createAPI('/direct_messages/new.json');
            api.sendMessage({screen_name: screenName, text: msg, include_entities: true}, success, error);
        },

        destroyMsg: function(id, success, error) {
            console.log('Twitter.Tweet.destroyMsg()');
            var api = createAPI('/direct_messages/destroy/'+id+'.json');
            api.sendMessage(null, success, error);
        }
    };

    var Fav = {
        create: function(id, success, error) {
            console.log('Twitter.Fav.create()');
            var api = createAPI('/favorites/create/'+id+'.json');
            api.sendMessage(null, success, error);
        },

        destroy: function(id, success, error) {
            console.log('Twitter.Fav.destroy()');
            var api = createAPI('/favorites/destroy/'+id+'.json');
            api.sendMessage(null, success, error);
        },

    };

    var Friendship = {
        show: function(target, success, error) {
            console.log('Twitter.Friendship.show()');
            var api = createAPI('/friendships/show.json');
            api.sendRequest({target_screen_name: target}, success, error);
        },

        create: function(target, success, error) {
            console.log('Twitter.Friendship.create()');
            var api = createAPI('/friendships/create.json');
            api.sendMessage({screen_name: target}, success, error);
        },

        destroy: function(target, success, error) {
            console.log('Twitter.Friendship.destroy()');
            var api = createAPI('/friendships/destroy.json');
            api.sendMessage({screen_name: target}, success, error);
        }
    };

    var createStatuses = function(url) {
        var sinceID = null;
        var maxID = null;
        var maxIDForAll = null;
        var newTweets = [];
        var allTweets = [];
        var refreshData = {};
        
        var statuses = createAPI(url);
        statuses.addDefaultParam({
            include_entities: true,
        });

        statuses.setRefreshTime = function(s) { // in min
            var interval = s*60*1000;
            if (refreshData.interval == interval) {
                console.warn('Statuses.setRefreshTime(): ignore time interval');
                return;
            }
            refreshData.interval = interval;

            if (refreshData.id) {
                clearInterval(refreshData.id);
            }

            if (refreshData.interval && refreshData.success && refreshData.error) {
                refreshData.id = setInterval(function() {
                    statuses.getNew(refreshData.success, refreshData.error);
                }, refreshData.interval);
            } else {
                console.warn('Statuses.setRefreshTime(): stop or invalid handlers');
            }
        };

        statuses.getCachedTweets = function() {
            return newTweets;
        };

        statuses.clearCachedTweets = function() {
            newTweets = [];
        };

        statuses.get = function(success, error) {
            this.sendRequest(null, function(data) {
                console.log('Statuses.get.sendRequest() - success');

                if (data.error) { // return error immediately
                    error({textStatus: data.error});
                    return;
                }

                if (data.length) {
                    // update IDs
                    sinceID = data[0].id_str;
                    maxID = data[data.length-1].id_str;

                    // the latest is the last
                    data = data.reverse();
                }

                // start refresh interval if not started already
                if (refreshData.interval && !refreshData.id) {
                    refreshData.id = setInterval(function() {
                        statuses.getNew(success, error);
                    }, refreshData.interval);
                }
                refreshData.success = success;
                refreshData.error = error;
                
                success(data);

            }, error);
        };

        statuses.getMore = function(success, error) {
            if (!maxID) {
                console.warn('Statuses.getMore(): max_id is null');
                return;
            }

            this.sendRequest({max_id: maxID}, function(data) {
                console.log('Statuses.getMore.sendRequest() - success');

                if (data.length) {
                    // update maxID
                    maxID = data[data.length-1].id_str;

                    // the latest is the first (first is duplicated);
                    data = data.slice(1);
                }

                success(data);

            }, error);
        };

        statuses.getAll = function(success, error) {
            if (!maxIDForAll) {
                maxIDForAll = sinceID;
            } 

            if (!maxIDForAll) {
                console.warn('Statuses.getAll(): maxIDForAll is null');
                return;
            }

            statuses.sendRequest({max_id: maxIDForAll, count: 200}, function(data) {
                console.log('Statuses.getAll.sendRequest() - success');

                if (data.length > 1) {
                    // update maxIDForAll
                    maxIDForAll = data[data.length-1].id_str;

                    // the latest is the first (first is duplicated);
                    if (allTweets.length) {
                        data = data.slice(1);
                    }

                    allTweets = allTweets.concat(data);
                    console.debug('allTweets len:', allTweets.length);

                    success(allTweets.length); // indicate progress

                    setTimeout(function() {
                        statuses.getAll(success, error);
                    }, 5000);
                } else {
                    success(allTweets);
                }

            }, function(errorStatus) {
                if (errorStatus.retry) {
                    errorStatus.retry();
                } else {
                    error(errorStatus);
                }
            });
        };

        statuses.getNew = function(success, error) {
            if (!sinceID) {
                console.warn('Statuses.getNew(): since_id is null');
                return;
            }

            // should catch new tweets as much as possible
            this.sendRequest({since_id: sinceID, count: 200}, function(data){
                console.log('Statuses.getNew.sendRequest() - success');

                if (data.length) {
                    // update sinceID
                    sinceID = data[0].id_str;
                    // the latest is the last
                    data = data.reverse();
                    newTweets = newTweets.concat(data);
                }

                success(data);

            }, function(errorStatus) {
                if (errorStatus.retry) { 
                    // overwrite and do nothing, 
                    // getNew() do not need to retry for any errors, since the refresh will do for this.
                    errorStatus.retry = function() {}
                }
                error(errorStatus);
            });
        };

        return statuses;
    }

    var createHomeTL = function() {
        console.log('Twitter.createHomeTL()');
        var homeTL = createStatuses('/statuses/home_timeline.json');
        return homeTL;
    };

    var createUserTL = function(screenName) {
        console.log('Twitter.createUserTL()');
        var userTL = createStatuses('/statuses/user_timeline.json');
        if (screenName) {
            userTL.addDefaultParam({
                screen_name: screenName,
            });
        }
        userTL.addDefaultParam({include_rts: true});
    
        return userTL;
    };

    var createMentionsTL = function() {
        console.log('Twitter.createMentionsTL()');
        var mentionsTL = createStatuses('/statuses/mentions.json');
        return mentionsTL;
    };

    var createMessagesTL = function() {
        console.log('Twitter.createMessagesTL()');

        var messagesTL = {};
        var receivedTL = createStatuses('/direct_messages.json');
        var sentTL = createStatuses('/direct_messages/sent.json');
        var initalRecved = [];
        var initalSent = [];

        messagesTL.setRefreshTime = function(s) {
            receivedTL.setRefreshTime(s);
            sentTL.setRefreshTime(s);
        };

        messagesTL.sortByDate = function(data) {
            data.sort(function(a, b) {
                //return (new Date(a.created_at)) > (new Date(b.created_at));
                return a.id_str > b.id_str;
            });
        };

        messagesTL.getCachedTweets = function() {
            var cached = receivedTL.getCachedTweets();
            cached = cached.concat(sentTL.getCachedTweets());
            messagesTL.sortByDate(cached);
            return cached;
        };

        messagesTL.clearCachedTweets = function() {
            receivedTL.clearCachedTweets();
            sentTL.clearCachedTweets();
        };

        messagesTL.onTweetsData = function(success) {
            if (!initalSent && !initalRecved) {
                success();
            } else if (initalSent.length != 0 && initalRecved.length != 0) {
                var initialTweets = initalRecved.concat(initalSent) 

                messagesTL.sortByDate(initialTweets);
                success(initialTweets);
                initalRecved = null;
                initalSent = null;
            }
        };

        messagesTL.get = function(success, error)  {
            receivedTL.get(function(recvedData) {
                if (initalRecved) {
                    initalRecved = recvedData;
                }
                messagesTL.onTweetsData(success);
            }, error);

            sentTL.get(function(sentData) {
                if (initalSent) {
                    initalSent = sentData;
                }
                messagesTL.onTweetsData(success);
            }, error);
        };

        messagesTL.getMore = function(success, error) {
            receivedTL.getMore(function(recvedData) {
                sentTL.getMore(function(sentData) {
                    var more = recvedData.concat(sentData);
                    messagesTL.sortByDate(more);
                    more.reverse() // more is the reverse to new
                    success(more);
                }, error);
            }, error);
        };

        return messagesTL;
    };
    
    var createFavoritesTL = function() {
        console.log('Twitter.createFavoritesTL()');
        var favoritesTL = createStatuses('/favorites.json');
        return favoritesTL;
    };

    var createFriendship = function(url) {
        var cursor = -1;

        var friendship = createAPI(url);
        friendship.addDefaultParam({
            include_entities: true,
        });

        friendship.get = function(success, error) {
            if (cursor == 0) {
                success({users: []}); // pass empty users
                return;
            }

            this.sendRequest({cursor: cursor}, function(data) {
                console.log('Friendship.get.sendRequest() - success');
          
                // update cursor
                cursor = data.next_cursor_str;
                success(data);

            }, error);
        }

        return friendship;
    };

    var createFollowers = function(screenName) {
        console.log('Twitter.createFollowers()');
        var followers = createFriendship('/statuses/followers.json');
        if (screenName) {
            followers.addDefaultParam({
                screen_name: screenName,
            });
        }
        return followers;
    };

    var createFriends = function(screenName) {
        console.log('Twitter.createFriends()');
        var friends = createFriendship('/statuses/friends.json');
        if (screenName) {
            friends.addDefaultParam({
                screen_name: screenName,
            });
        }
        return friends;
    };

    var Util = {
        // should return a new regexp every time
        Pat: {
            // except " < > space
            url: function() { return /https?:\/\/([\w\.\_\-]+)(\/?)[\w\-\_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\{\}\|\\\^\`\%]*/g },
            name: function() { return /(^@| @)[\w\_]+/g },
            tag: function() { return /(^#| #)([\w\_]+)/g },
        },

        computeFreq: function(created, count) {
            return (count/((new Date() - new Date(created))/(1000*60*60*24))).toFixed(1);
        },

        buildEntities: function(text) {
            return text.replace(Util.Pat.url(), '<a href="$&" target="_blank">$&</a>')
                       .replace(Util.Pat.name(), '<a href="#" class="t_userlink">$&</a>')
                       .replace(Util.Pat.tag(), '<a href="https://encrypted.google.com/search?q=%23$2&tbs=mbl:1" target="_blank">$&</a>');
        },

        makeEntities: function(text, entities) {
            if (!entities) {
                //text = util.escapeHtml(text);
                return Util.buildEntities(text);
            }
            var replaces = {}
            $.each(entities.urls, function(i, url) {
                replaces[text.slice(url.indices[0], url.indices[1])] = '<a href="'+url.url+'" target="_blank">'+url.url+'</a>';
            });
            $.each(entities.hashtags, function(i, hashtag) {
                var twSearch = 'https://twitter.com/search?q=%23' + hashtag.text;
                var ggSearch = 'https://encrypted.google.com/search?q=%23' + hashtag.text + '&tbs=mbl:1';
                replaces[text.slice(hashtag.indices[0], hashtag.indices[1])] = '<a href="'+ggSearch+'" target="_blank">#'+hashtag.text+'</a>';
            });
            $.each(entities.user_mentions, function(i, user) {
                replaces[text.slice(user.indices[0], user.indices[1])] = '<a href="#" class="t_userlink">@'+user.screen_name+'</a>';
            });

            // escape first 
            text = util.escapeHtml(text);

            $.each(replaces, function(k, v) {
                text = text.replace(new RegExp(k.escapeRe(), 'g'), v);
            });

            return text;
        },

        makeTime: function(time) {
            var d = new Date(time);
            return d.toLocaleTimeString() + ", " + (d.getMonth()+1) + "-" + d.getDate() + ", " + d.getFullYear();
        },
    };

    // export
    return {
        // factories
        createHomeTL: createHomeTL,
        createUserTL: createUserTL,
        createMentionsTL: createMentionsTL,
        createMessagesTL: createMessagesTL,
        createFavoritesTL: createFavoritesTL,
        createFollowers: createFollowers,
        createFriends: createFriends,

        // singletons
        getOAuth: getOAuth,
        getBAuth: getBAuth,

        // globals
        getAuthMode: getAuthMode,
        getCurrentUserName: getCurrentUserName,

        // statics
        User: User,
        Tweet: Tweet,
        Fav: Fav,
        Friendship: Friendship,
        Util: Util,
    };
};
