(function() {

    var oauth = null;
    var bauth = null;
    var authMode = null;

    // REST API Resources: https://dev.twitter.com/docs/api/1.1
    var api = {
        bauthBase: '',
        oauthBase: 'https://api.twitter.com',

        buildUrl: function(rest) {
            var base = '';
            if (authMode == 'Basic' && bauth) {
                base = api.bauthBase.replace(/(https?:\/\/[\w\.\_\-]+)\/?.*/, '$1');
                base += '/api/1.1';
            } else if (authMode == 'OAuth' && oauth) {
                if (/^\/oauth\//i.test(rest.url)) {
                    base = api.oauthBase;
                } else {
                    base = api.oauthBase + '/1.1';
                }
            }

            var url = rest.url;
            if (rest.id) {
                url = _.format(rest.url, rest.id);
            }
            return base + url;
        },

        statuses: {
            home_timeline: {method: 'GET', url: '/statuses/home_timeline.json'},
            mentions_timeline: {method: 'GET', url: '/statuses/mentions_timeline.json'},
            retweets_of_me: {method: 'GET', url: '/statuses/retweets_of_me.json'},
            user_timeline: {method: 'GET', url: '/statuses/user_timeline.json'},
            retweets: {method: 'GET', url: '/statuses/retweets/{0}.json'},
            show: {method: 'GET', url: '/statuses/show.json'},
            destroy: {method: 'POST', url: '/statuses/destroy/{0}.json', id: 0},
            retweet: {method: 'POST', url: '/statuses/retweet/{0}.json', id: 0},
            update: {method: 'POST', url: '/statuses/update.json'},
            update_with_media: {method: 'POST', url: '/statuses/update_with_media.json'},
        },

        search: {
            tweets: {method: 'GET', url: '/search/tweets.json'},
        },

        direct_messages: {
            direct_messages: {method: 'GET', url: '/direct_messages.json'},
            sent: {method: 'GET', url: '/direct_messages/sent.json'},
            destroy: {method: 'POST', url: '/direct_messages/destroy.json'},
            'new': {method: 'POST', url: '/direct_messages/new.json'},
        },

        friendships: {
            followers: {method: 'GET', url: '/followers/list.json'},
            friends: {method: 'GET', url: '/friends/list.json'},
            show: {method: 'GET', url: '/friendships/show.json'},
            create: {method: 'POST', url: '/friendships/create.json'},
            destroy: {method: 'POST', url: '/friendships/destroy.json'},
        },

        users: {
            show: {method: 'GET', url: '/users/show.json'},
        },

        favorites: {
            list: {method: 'GET', url: '/favorites/list.json'},
            create: {method: 'POST', url: '/favorites/create.json'},
            destroy: {method: 'POST', url: '/favorites/destroy.json'},
        },

        lists: {
            list: {method: 'GET', url: '/lists/list.json'},
            statuses: {method: 'GET', url: '/lists/statuses.json'},
        },

        account: {
            rate_limit_status: {method: 'GET', url: '/application/rate_limit_status.json'},
            verify_credentials: {method: 'GET', url: '/account/verify_credentials.json'},
        },

        trends: {
            place: {method: 'GET', url: '/trends/place.json'},
        },

        oauth: {
            authenticate: {method: 'GET', url: '/oauth/authenticate'},
            authorize: {method: 'GET', url: '/oauth/authorize'},
            access_token: {method: 'POST', url: '/oauth/access_token', format: 'text'},
            request_token: {method: 'POST', url: '/oauth/request_token', format: 'text'},
        },

        // ex
        urls: {
            resolve: {method: 'GET', url: '/urls/resolve.json'},
        },
    };

    var createRequest = function(rest, data, success, error) {
        var url = api.buildUrl(rest);

        var isUpdateWithMedia = function() {
            return api.statuses.update_with_media == rest;
        }

        var request = {};
        request.sign = function() {
            // sign the request
            if (authMode == 'OAuth') {
                console.log('OAuth Signed Request');

                // compute hash of all base string
                var hash = null;
                if (isUpdateWithMedia()) { // not sign params
                    hash = oauth.sign(rest.method, url);
                } else {
                    hash = oauth.sign(rest.method, url, data);
                }

                // filter non-oauth data out
                var nonOAuthData = {}
                $.each(data, function(k, v) {
                    if (k.indexOf('oauth_') == -1) {
                        nonOAuthData[k] = v;
                    }
                });
                data = nonOAuthData;

                setAuthorizationHeader(hash.header);

            } else if (authMode == 'Basic') {
                setAuthorizationHeader('Basic ' + bauth.getConfd().x);
            }
        };

        request.send = function() {
            console.log('Request.send():', url, data);
            this.sign();

            var options = {
                type: rest.method || 'GET',
                url: url,
                data: data,
                success: success,
                error: error,
                dataType: rest.format || 'json',
                timeout: 10*1000,
            };

            if (isUpdateWithMedia()) { // media upload
                options.contentType = false; // should set false while not 'multipart/form-data' (missing boundary)
                options.processData = false;
                options.data = data.formData; // only include form data
            }

            $.ajax(options);
        }
        return request;
    };

    var createAPI = function(rest) {
        var defaultParam = {};
        var retryInterval = 30*1000;

        var api = {};
        api.addDefaultParam = function(p) {
            $.each(p, function(k, v) {
                defaultParam[k] = v;
            });
        };

        api.sendRequest = function(param, success, error) {
            param = param || {};
            $.each(defaultParam, function(k, v) {
                param[k] = v;
            });

            var req = createRequest(rest, param, function(data) {
                // some API proxy (gtap) may treat http error as success
                if (data.error) {
                    error({textStatus: data.error});
                    return;
                } else if (data.errors) {
                    error({textStatus: data.errors[0].message});
                    return;
                } else {
                    success(data);
                }
            }, function(xmlHttpRequest, textStatus, errorThrown) {
                console.log('API.sendRequest() - error'/*, xmlHttpRequest, textStatus, errorThrown*/);

                var errorStatus = {
                    xmlHttpRequest: xmlHttpRequest,
                    textStatus: textStatus,
                    errorThrown: errorThrown,
                    retry: function() {
                        setTimeout(function() {
                            console.warn('API.sendRequest(): retry for ', xmlHttpRequest, textStatus)
                            req.send();
                        }, retryInterval);
                    }
                };

                // https://dev.twitter.com/docs/error-codes-responses
                if (textStatus != 'timeout' && (      // should retry for timeout, but do not retry for these errors
                    xmlHttpRequest.status == 400 ||   // Bad Request
                    xmlHttpRequest.status == 401 ||   // Unauthorized
                    xmlHttpRequest.status == 403 ||   // Forbidden
                    xmlHttpRequest.status == 404 ||   // Not Found
                    xmlHttpRequest.status == 406 ||   // Not Acceptable
                    xmlHttpRequest.status == 410 ||   // Gone
                    xmlHttpRequest.status == 422 )) { // Unprocessable Entity
                    //xmlHttpRequest.status == 420 ||  // Enhance Your Calm
                    //xmlHttpRequest.status == 429 ||  // Too Many Requests
                    delete errorStatus.retry
                }
                error(errorStatus);
            });
            req.send();
        };

        return api;
    };

    var setAuthorizationHeader = function(header) {
        $.ajaxSetup({
            beforeSend: function(xhr) {
                xhr.setRequestHeader('Authorization', header);
            }
        });
    };

    var kt = {};
    kt.getAuthMode = function() {
        return authMode;
    };

    kt.getCurrentUserName = function() {
        if (authMode == 'Basic' && bauth) {
            return bauth.getScreenName();
        } else if (authMode == 'OAuth' && oauth) {
            return oauth.getScreenName();
        } else {
            console.error('getCurrentUserName(): Not login.');
        }
    };

    kt.getBAuth = function() {
        if (bauth) {
            return bauth;
        }

        var confd = {};

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
            api.bauthBase = url;
        };

        ba.getScreenName = function() {
            return confd.screen_name;
        };

        ba.login = function(user, pass, success, error) {
            console.log('BAuth.login()');

            authMode = 'Basic';

            if (user && pass) {
                confd.screen_name = user;
                confd.x = btoa(user + ':' + pass);

                setAuthorizationHeader('Basic ' + confd.x);

                var vc = createAPI(api.account.verify_credentials);
                vc.sendRequest({}, function(ret) {
                    console.log('BAuth.login() - result:', ret);
                    ba.saveConfd();
                    success(user);
                }, error);

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

    kt.getOAuth = function() {
        if (oauth) {
            return oauth;
        }

        var consumerKey = null;
        var consumerSec = null;

        var token = {};

        var oa = {};

        oa.getScreenName = function() {
            return token.screen_name;
        };

        oa.setConsumerToken = function(key, secret) {
            consumerKey = key;
            consumerSec = secret;
        };

        oa.requestToken = function(callbackURL, success, error) {
            console.log('OAuth.requestToken()');

            var rt = createAPI(api.oauth.request_token);
            rt.sendRequest({oauth_callback: callbackURL}, success, error);
        };

        oa.authorize = function() {
            console.log('OAuth.authorize()', token);
            window.location = _.addURLParam(api.oauthBase+api.oauth.authorize.url, 'oauth_token', token.oauth_token);
        };

        oa.authenticate = function() {
            console.log('OAuth.authenticate()', token);
            window.location = _.addURLParam(api.oauthBase+api.oauth.authenticate.url, 'oauth_token', token.oauth_token);
        };

        oa.access = function(verifier, success, error) {
            console.log('OAuth.access()', token);

            var at = createAPI(api.oauth.access_token);
            at.sendRequest({oauth_verifier: verifier}, success, error);
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
                    token = _.getQueryStringParams(ret);
                    oa.saveToken();

                    success(token.screen_name);

                }, error);
            } else {
                console.log('OAuth.login(): init oauth process');

                // reset token first
                token = {}
                this.requestToken(callbackURL, function(ret) {
                    console.log('requestToken() - result:', ret);

                    token = _.getQueryStringParams(ret);
                    oa.saveToken();

                    // redirect
                    oa.authorize(); // use the original(previous) URL for the callbackURL
                    //oa.authenticate()  // there's a bug of API that it can not redirect to 'chrome-extension://*' when it is set to the twitter app's callbackURL

                }, error);
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


    kt.user = {
        show: function(screenName, success, error) {
            console.log('User.show()');
            var s = createAPI(api.users.show);
            s.sendRequest({screen_name: screenName,
                             include_entities: true}, success, error);
        },

        rateLimit: function(success, error) {
            console.log('User.rateLimit()');
            var rls = createAPI(api.account.rate_limit_status);
            rls.sendRequest({resources: 'statuses'}, success, error);
        }
    };

    kt.tweet = {
        show: function(id, success, error) {
            console.log('Tweet.show()');
            var s = createAPI(api.statuses.show);
            s.sendRequest({include_entities: true, id: id}, success, error);
        },

        update: function(msg, to, success, error) {
            console.log('Tweet.update()');
            var u = createAPI(api.statuses.update);
            var params = {status: msg, include_entities: true};
            if (to) {
                params.in_reply_to_status_id = to;
            }
            u.sendRequest(params, success, error);
        },

        updateMedia: function(msg, to, file, success, error) {
            console.log('Tweet.updateMedia()');
            var u = createAPI(api.statuses.update_with_media);

            // build form data
            var formData = new FormData();
            if (msg) { // msg could be null
                formData.append('status', msg);
            }
            //formData.append('include_entities', true);
            if (to) {
                formData.append('in_reply_to_status_id', to);
            }
            formData.append('media[]', file);

            u.sendRequest({formData: formData}, success, error);
        },

        retweet: function(id, success, error) {
            console.log('Tweet.retweet()');
            var rest = api.statuses.retweet;
            rest.id = id;
            var r = createAPI(rest);
            r.sendRequest({include_entities: true}, success, error);
        },

        destroy: function(id, success, error) {
            console.log('Tweet.destroy()');
            var rest = api.statuses.destroy;
            rest.id = id;
            var d = createAPI(rest);
            d.sendRequest(null, success, error);
        },

        directMsg: function(screenName, msg, success, error) {
            console.log('Tweet.directMsg()');
            var n = createAPI(api.direct_messages.new);
            n.sendRequest({screen_name: screenName, text: msg, include_entities: true}, success, error);
        },

        destroyMsg: function(id, success, error) {
            console.log('Tweet.destroyMsg()');
            var d = createAPI(api.direct_messages.destroy);
            d.sendRequest({id: id}, success, error);
        },

        retweetedBy: function(id, success, error) {
            console.log('Tweet.retweetedBy()');
            var rest = api.statuses.retweets;
            rest.id = id;
            var rb = createAPI(rest);
            rb.sendRequest({count: 100}, function(data) {
                var rtCnt = 0;
                var favCnt = 0;
                if (data.length) {
                    // latest one
                    rtCnt = data[0].retweeted_status.retweet_count;
                    favCnt = data[0].retweeted_status.favorite_count;
                }
                var users = [];
                $.each(data, function(i, t) {
                    users.push(t.user);
                });
                success(users, rtCnt, favCnt);
            }, error);
        },
    };

    kt.fav = {
        create: function(id, success, error) {
            console.log('Fav.create()');
            var c = createAPI(api.favorites.create);
            c.sendRequest({id: id}, success, error);
        },

        destroy: function(id, success, error) {
            console.log('Fav.destroy()');
            var d = createAPI(api.favorites.destroy);
            d.sendRequest({id: id}, success, error);
        },

    };

    kt.urls = {
        resolve: function(urls, success, error) {
            console.log('Url.resolve()');
            var rest = api.urls.resolve;
            var r = createAPI(rest);
            r.sendRequest(urls, success, error);
        }
    };


    kt.friendship = {
        show: function(target, success, error) {
            console.log('Friendship.show()');
            var s = createAPI(api.friendships.show);
            s.sendRequest({target_screen_name: target}, success, error);
        },

        create: function(target, success, error) {
            console.log('Friendship.create()');
            var c = createAPI(api.friendships.create);
            c.sendRequest({screen_name: target}, success, error);
        },

        destroy: function(target, success, error) {
            console.log('Friendship.destroy()');
            var d = createAPI(api.friendships.destroy);
            d.sendRequest({screen_name: target}, success, error);
        }
    };

    var createStatuses = function(rest) {
        var sinceID = null;
        var maxID = null;
        var maxIDForAll = null;
        var newTweets = [];
        var allTweets = [];
        var refreshData = {};
        var exportTimer = null;

        var isSearch = function() {
            return api.search.tweets == rest;
        }

        var statuses = createAPI(rest);
        statuses.addDefaultParam({
            include_entities: true,
        });

        statuses.setRefreshTime = function(s) { // in min, set 0 to stop
            var interval = s*60*1000;
            if (refreshData.interval == interval) {
                console.warn('Statuses.setRefreshTime(): ignore time interval');
                return;
            }
            console.log('Statuses.setRefreshTime(): ', s);
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

                if (isSearch()) {
                    data = data.statuses;
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

                if (isSearch()) {
                    data = data.statuses;
                }

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

            if (isSearch()) {
                console.warn('Statuses.getAll(): not support search');
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

                    exportTimer = setTimeout(function() {
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
            var param = {since_id: sinceID, count: 200};
            this.sendRequest(param, function(data) {
                console.log('Statuses.getNew.sendRequest() - success');

                if (isSearch()) {
                    data = data.statuses;
                }

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
                    // retry() will be called, overwrite and do nothing,
                    // getNew() do not need to retry for any errors, since the refresh will do for this.
                    errorStatus.retry = function() {}
                }
                error(errorStatus);
            });
        };

        statuses.destroy = function() {
            console.log('Statuses.destroy()');

            if (refreshData.id) {
                clearInterval(refreshData.id);
            }

            if (exportTimer) {
                clearTimeout(exportTimer);
            }
        };

        return statuses;
    }

    kt.createHomeTL = function() {
        console.log('createHomeTL()');
        var homeTL = createStatuses(api.statuses.home_timeline);
        return homeTL;
    };

    kt.createUserTL = function(screenName) {
        console.log('createUserTL()');
        var userTL = createStatuses(api.statuses.user_timeline);
        if (screenName) {
            userTL.addDefaultParam({
                screen_name: screenName,
            });
        }
        userTL.addDefaultParam({include_rts: true});

        return userTL;
    };

    kt.createMentionsTL = function() {
        console.log('createMentionsTL()');
        var mentionsTL = createStatuses(api.statuses.mentions_timeline);
        return mentionsTL;
    };

    kt.createRetweetsTL = function() {
        console.log('createRetweetsTL()');
        var retweetsTL = createStatuses(api.statuses.retweets_of_me);
        return retweetsTL;
    };

    kt.createMessagesTL = function() {
        console.log('createMessagesTL()');

        var messagesTL = {};
        var receivedTL = createStatuses(api.direct_messages.direct_messages);
        var sentTL = createStatuses(api.direct_messages.sent);
        var initalRecved = [];
        var initalSent = [];

        messagesTL.setRefreshTime = function(s) {
            receivedTL.setRefreshTime(s);
            sentTL.setRefreshTime(s);
        };

        messagesTL.sortByDate = function(data) {
            data.sort(function(a, b) {
                //return (new Date(a.created_at)) - (new Date(b.created_at));
                return a.id - b.id; // not exact id (id_str), but enough
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

    kt.createFavoritesTL = function() {
        console.log('createFavoritesTL()');
        var favoritesTL = createStatuses(api.favorites.list);
        return favoritesTL;
    };

    var createFriendship = function(rest) {
        var cursor = -1;

        var friendship = createAPI(rest);
        friendship.get = function(success, error) {
            this.sendRequest({cursor: cursor}, function(data) {
                console.log('Friendship.get.sendRequest() - success');
                // update cursor
                cursor = data.next_cursor_str;
                success(data.users);
            }, error);
        };
        return friendship;
    };

    kt.createFollowers = function(screenName) {
        console.log('createFollowers()');
        var followers = createFriendship(api.friendships.followers);
        if (screenName) {
            followers.addDefaultParam({
                screen_name: screenName,
            });
        }
        return followers;
    };

    kt.createFriends = function(screenName) {
        console.log('createFriends()');
        var friends = createFriendship(api.friendships.friends);
        if (screenName) {
            friends.addDefaultParam({
                screen_name: screenName,
            });
        }
        return friends;
    };

    kt.createSearchTL = function(q) {
        console.log('createSearchTL()');
        var searchTL = createStatuses(api.search.tweets);
        searchTL.addDefaultParam({
            q: q,
            //show_user: true,
        });
        return searchTL;
    };

    kt.createTrends = function(woeid) {
        console.log('createTrends()');
        var cache = [];
        var refreshData = {};

        var trends = createAPI(api.trends.place);

        trends.setRefreshTime = function(s) { // in min, set 0 to stop
            var interval = s*60*1000;
            if (refreshData.interval == interval) {
                console.warn('Trends.setRefreshTime(): ignore time interval');
                return;
            }
            console.log('Trends.setRefreshTime(): ', s);
            refreshData.interval = interval;

            if (refreshData.id) {
                clearInterval(refreshData.id);
            }

            if (refreshData.interval && refreshData.success && refreshData.error) {
                refreshData.id = setInterval(function() {
                    trends.get(refreshData.success, refreshData.error);
                }, refreshData.interval);
            } else {
                console.warn('Trends.setRefreshTime(): stop or invalid handlers');
            }
        };

        trends.get = function(success, error) {
            trends.sendRequest({id: woeid}, function(data) {
                $.each(data[0].trends, function(i, t) {
                    var found =  -1;
                    for (var j = 0; j != cache.length; ++j) {
                        if (cache[j].name == t.name) {
                            found = j;
                            break;
                        }
                    }

                    if (found == -1) {
                        t.state = 'new';
                    } else {
                        if (found < i) {
                            t.state = 'down';
                        } else if (found > i) {
                            t.state = 'up';
                        } else {
                            t.state = 'level';
                        }
                        //cache.splice(found, 1); // remove in cache
                    }
                });
                // insert top of cache
                cache = data[0].trends.concat(cache);

                // start refresh interval if not started already
                if (refreshData.interval && !refreshData.id) {
                    refreshData.id = setInterval(function() {
                        trends.get(success, error);
                    }, refreshData.interval);
                }
                refreshData.success = success;
                refreshData.error = error;

                success(data[0].trends);
            }, error);
        };


        trends.destroy = function() {
            console.log('Trends.destroy()');
            if (refreshData.id) {
                clearInterval(refreshData.id);
            }
        };

        return trends;
    };

    kt.createLists = function() {
        console.log('createLists()');
        var lists = createAPI(api.lists.list);
        lists.get = function(success, error) {
            lists.sendRequest(null, function(data) {
                // sort by list full name
                data.sort(function(a, b) {
                    if (a.full_name > b.full_name) {
                        return 1;
                    } else if (a.full_name < b.full_name) {
                        return -1;
                    } else {
                        return 0;
                    }
                });
                success(data);
            }, error);
        };
        return lists;
    };

    kt.createListTL = function(screenName, slug) {
        console.log('createListTL()');
        var listTL = createStatuses(api.lists.statuses);
        listTL.addDefaultParam({include_rts: true, owner_screen_name: screenName, slug: slug});
        return listTL;
    };

    kt.util = {
        // should return a new regexp every time
        pat: {
            // except " < > space
            url: function() { return /https?:\/\/([\w\.\_\-]+)(\/?)[\w\-\_\.\~\!\*\'\(\)\;\:\@\&\=\+\$\,\/\?\#\[\]\{\}\|\\\^\`\%]*/g },
            name: function() { return /(^@| @)[\w\_]+/g },
            tag: function() { return /(^#| #)([\w\_]+)/g },
        },

        computeFreq: function(created, count) {
            return (count/((new Date() - new Date(created))/(1000*60*60*24))).toFixed(1);
        },

        buildEntities: function(text) {
            return text.replace(kt.util.pat.url(), '<a href="$&" target="_blank">$&</a>')
                       .replace(kt.util.pat.name(), '<a href="#" class="t_userlink">$&</a>')
                       .replace(kt.util.pat.tag(), '<a href="https://encrypted.google.com/search?q=%23$2&tbs=mbl:1" target="_blank">$&</a>');
        },

        makeEntities: function(text, entities, ex) {
            // NOTE: text is already HTML escaped by Twitter

            if (!entities) {
                return twttr.txt.autoLink(text, {target: '_blank', usernameClass: 't_userlink', usernameUrlBase: '#'});
            }

            var all = [];
            if (entities.urls) {
                all = all.concat(entities.urls);
            }
            if (entities.hashtags) {
                all = all.concat(entities.hashtags);
            }
            if (entities.symbols) {
                all = all.concat(entities.symbols);
            }
            if (entities.user_mentions) {
                all = all.concat(entities.user_mentions);
            }
            if (entities.media) {
                all = all.concat(entities.media);
            }
            all.sort(function(x, y) {
                return x.indices[0] - y.indices[0];
            });

            var retStr = '';
            if (all.length == 0) {
                retStr = text;
            } else {
                var last = 0;
                $.each(all, function(k, v) {
                    retStr += text.slice(last, v.indices[0]);
                    if (v.url) { // url or media
                        var realurl = v.expanded_url ? v.expanded_url : v.url;
                        if (!/^https?:\/\//.test(realurl)) {
                            realurl = 'http://' + realurl;
                        }
                        retStr += '<a href="'+realurl+'" target="_blank">'+v.url+'</a>';
                    } else if (v.text) { // hashtag or symbol
                        //var ggSearch = 'https://encrypted.google.com/search?q=' + hashtag.text + '&tbs=mbl:1';
                        var sign = text[v.indices[0]];
                        if (ex) {
                            retStr += '<a href="https://twitter.com/search/%23'+v.text+'" target="_blank">'+sign+v.text+'</a>';
                        } else {
                            retStr += '<a href="#" class="t_hashtag">'+sign+v.text+'</a>';
                        }
                    } else if (v.screen_name) { // user_mention
                        if (ex) {
                            retStr += '<a href="https://twitter.com/'+v.screen_name+'" target="_blank">@'+v.screen_name+'</a>';
                        } else {
                            retStr += '<a href="#" class="t_userlink">@'+v.screen_name+'</a>';
                        }
                    }

                    last = v.indices[1];
                });
                retStr += text.slice(last);
            }

            return retStr;
        },

        makeTime: function(time) {
            var d = new Date(time);
            return d.toLocaleTimeString() + ", " + (d.getMonth()+1) + "-" + d.getDate() + ", " + d.getFullYear();
        },
    };


    // exports
    var root = this;
    if (typeof module !== 'undefined'  && module.exports) {
        module.exports = kt;
    } else if (!root.kt) {
        root.kt = kt;
    }

})();

