var util = requireUtil();

// module of Twitter
var requireTwitter = function() {

    var oauth = null;
    var bauth = null;
    var authMode = null;


    // REST API Resources
    var api = {
        oauthBase: 'https://api.twitter.com/1',
        bauthBase: '',

        base = function() {
            if (authMode == 'Basic' && bauth) {
                return api.bauthBase;
            } else if (authMode == 'OAuth' && oauth) {
                return api.oauthBase;
            } else {
                console.error('API base is not set.');
                return '';
            }
        },

        statuses: {
            home_timeline: {url: api.base() + '/statuses/home_timeline.json'},
            mentions:      {url: api.base() + '/statuses/mentions.json'},
            user_timeline: {url: api.base() + '/statuses/user_timeline.json'},
        },

        

// Returns the 20 most recent statuses, including retweets if they exist, posted by the authenticating user and the user's they follow. This is the same timeline seen by a user when they login to twitter.com. This method is identical to statuses/friends_timeline, except that this method always...
{method: 'GET',  url: api.base() + '/statuses/home_timeline'},
// Returns the 20 most recent mentions (status containing @username) for the authenticating user. The timeline returned is the equivalent of the one seen when you view your mentions on twitter.com. This method can only return up to 800 statuses. If include_rts is set only 800 statuses, including...
{method: 'GET',  url: api.base() + '/statuses/mentions'},
// Returns the 20 most recent statuses, including retweets if they exist, from non-protected users. The public timeline is cached for 60 seconds. Requesting more frequently than that will not return any more data, and will count against your rate limit usage. Consider using the Streaming API's...
{method: 'GET',  url: api.base() + '/statuses/public_timeline'},
// Returns the 20 most recent retweets posted by the authenticating user.
{method: 'GET',  url: api.base() + '/statuses/retweeted_by_me'},
// Returns the 20 most recent retweets posted by users the authenticating user follow.
{method: 'GET',  url: api.base() + '/statuses/retweeted_to_me'},
// Returns the 20 most recent tweets of the authenticated user that have been retweeted by others.
{method: 'GET',  url: api.base() + '/statuses/retweets_of_me'},
// Returns the 20 most recent statuses posted by the authenticating user. It is also possible to request another user's timeline by using the screen_name or user_id parameter. The other users timeline will only be visible if they are not protected, or if the authenticating user's follow request was...
{method: 'GET',  url: api.base() + '/statuses/user_timeline'},
// Returns the 20 most recent retweets posted by users the specified user follows. The user is specified using the user_id or screen_name parameters. This method is identical to statuses/retweeted_to_me except you can choose the user to view.
{method: 'GET',  url: api.base() + '/statuses/retweeted_to_user'},
// Returns the 20 most recent retweets posted by the specified user. The user is specified using the user_id or screen_name parameters. This method is identical to statuses/retweeted_by_me except you can choose the user to view. Does not require authentication, unless the user is protected.
{method: 'GET',  url: api.base() + '/statuses/retweeted_by_user'},
// Show user objects of up to 100 members who retweeted the status.
{method: 'GET',  url: api.base() + '/statuses/:id/retweeted_by'},
// Show user ids of up to 100 users who retweeted the status.
{method: 'GET',  url: api.base() + '/statuses/:id/retweeted_by/ids'},
// Returns up to 100 of the first retweets of a given tweet.
{method: 'GET',  url: api.base() + '/statuses/retweets/:id'},
// Returns a single status, specified by the id parameter below. The status's author will be returned inline.
{method: 'GET',  url: api.base() + '/statuses/show/:id'},
// Destroys the status specified by the required ID parameter. The authenticating user must be the author of the specified status. Returns the destroyed status if successful.
{method: 'POST', url: api.base() + '/statuses/destroy/:id'},
// Retweets a tweet. Returns the original tweet with retweet details embedded.
{method: 'POST', url: api.base() + '/statuses/retweet/:id'},
// Updates the authenticating user's status, also known as tweeting. To upload an image to accompany the tweet, use POST statuses/update_with_media. For each update attempt, the update text is compared with the authenticating user's recent tweets. Any attempt that would result in duplication will be...
{method: 'POST', url: api.base() + '/statuses/update'},
// Updates the authenticating user's status and attaches media for upload. Unlike POST statuses/update, this method expects raw multipart data. Your POST request's Content-Type should be set to multipart/form-data with the media[] parameter The Tweet text will be rewritten to include the media...
{method: 'POST', url: api.base() + '/statuses/update_with_media'},
// Returns tweets that match a specified query. To best learn how to use Twitter Search effectively, consult our guide to Using the Twitter Search API Notice: As of April 1st 2010, the Search API provides an option to retrieve "popular tweets" in addition to real-time search results. In an upcoming...
{method: 'GET',  url: api.base() + '/search'},
// Returns the 20 most recent direct messages sent to the authenticating user. The XML and JSON versions include detailed information about the sender and recipient user. Important: This method requires an access token with RWD (read, write...
{method: 'GET',  url: api.base() + '/direct_messages'},
// Returns the 20 most recent direct messages sent by the authenticating user. The XML and JSON versions include detailed information about the sender and recipient user. Important: This method requires an access token with RWD (read, write...
{method: 'GET',  url: api.base() + '/direct_messages/sent'},
// Important: This method requires an access token with RWD (read, write...
{method: 'POST', url: api.base() + '/direct_messages/destroy/:id'},
// Sends a new direct message to the specified user from the authenticating user. Requires both the user and text parameters and must be a POST. Returns the sent message in the requested format if successful.
{method: 'POST', url: api.base() + '/direct_messages/new'},
// Returns a single direct message, specified by an id parameter. Like the /1/direct_messages.format request, this method will include the user objects of the sender and recipient. Important: This method requires an access token with RWD (read, write...
{method: 'GET',  url: api.base() + '/direct_messages/:id'},
// Returns an array of numeric IDs for every user following the specified user. This method is powerful when used in conjunction with users/lookup.
{method: 'GET',  url: api.base() + '/followers/ids'},
// Returns an array of numeric IDs for every user the specified user is following. This method is powerful when used in conjunction with users/lookup.
{method: 'GET',  url: api.base() + '/friends/ids'},
// Test for the existence of friendship between two users. Will return true if user_a follows user_b, otherwise will return false. Authentication is required if either user A or user B are protected. Additionally the authenticating user must be a follower of the protected user. Consider using...
{method: 'GET',  url: api.base() + '/friendships/exists'},
// Returns an array of numeric IDs for every user who has a pending request to follow the authenticating user.
{method: 'GET',  url: api.base() + '/friendships/incoming'},
// Returns an array of numeric IDs for every protected user for whom the authenticating user has a pending follow request.
{method: 'GET',  url: api.base() + '/friendships/outgoing'},
// Returns detailed information about the relationship between two users.
{method: 'GET',  url: api.base() + '/friendships/show'},
// Allows the authenticating users to follow the user specified in the ID parameter. Returns the befriended user in the requested format when successful. Returns a string describing the failure condition when unsuccessful. If you are already friends with the user a HTTP 403 may be returned, though for...
{method: 'POST', url: api.base() + '/friendships/create'},
// Allows the authenticating users to unfollow the user specified in the ID parameter. Returns the unfollowed user in the requested format when successful. Returns a string describing the failure condition when unsuccessful.
{method: 'POST', url: api.base() + '/friendships/destroy'},
// Returns the relationship of the authenticating user to the comma separated list of up to 100 screen_names or user_ids provided. Values for connections can be: following, following_requested, followed_by, none.
{method: 'GET',  url: api.base() + '/friendships/lookup'},
// Allows one to enable or disable retweets and device notifications from the specified user.
{method: 'POST', url: api.base() + '/friendships/update'},
// Returns an array of user_ids that the currently authenticated user does not want to see retweets from.
{method: 'GET',  url: api.base() + '/friendships/no_retweet_ids'},
// Return up to 100 users worth of extended information, specified by either ID, screen name, or combination of the two. The author's most recent status (if the authenticating user has permission) will be returned inline. This method is crucial for consumers of the Streaming API. It's also well suited...
{method: 'GET',  url: api.base() + '/users/lookup'},
// Access the profile image in various sizes for the user with the indicated screen_name. If no size is provided the normal image is returned. This resource does not return JSON or XML, but instead returns a 302 redirect to the actual image resource. This method should only be used by application...
{method: 'GET',  url: api.base() + '/users/profile_image/:screen_name'},
// Runs a search for users similar to Find People button on Twitter.com. The results returned by people search on Twitter.com are the same as those returned by this API request. Note that unlike GET search, this method does not support any operators. Only the first 1000 matches are available.
{method: 'GET',  url: api.base() + '/users/search'},
// Returns extended information of a given user, specified by ID or screen name as per the required id parameter. The author's most recent status will be returned inline.
{method: 'GET',  url: api.base() + '/users/show'},
// Returns an array of users that the specified user can contribute to.
{method: 'GET',  url: api.base() + '/users/contributees'},
// Returns an array of users who can contribute to the specified account.
{method: 'GET',  url: api.base() + '/users/contributors'},
// Access to Twitter's suggested user list. This returns the list of suggested user categories. The category can be used in GET users/suggestions/:slug to get the users in that category.
{method: 'GET',  url: api.base() + '/users/suggestions'},
// Access the users in a given category of the Twitter suggested user list. It is recommended that end clients cache this data for no more than one hour.
{method: 'GET',  url: api.base() + '/users/suggestions/:slug'},
// Access the users in a given category of the Twitter suggested user list and return their most recent status if they are not a protected user.
{method: 'GET',  url: api.base() + '/users/suggestions/:slug/members.format'},
// Returns the 20 most recent favorite statuses for the authenticating user or user specified by the ID parameter in the requested format.
{method: 'GET',  url: api.base() + '/favorites'},
// Favorites the status specified in the ID parameter as the authenticating user. Returns the favorite status when successful.
{method: 'POST', url: api.base() + '/favorites/create/:id'},
// Un-favorites the status specified in the ID parameter as the authenticating user. Returns the un-favorited status in the requested format when successful.
{method: 'POST', url: api.base() + '/favorites/destroy/:id'},
// Returns all lists the authenticating or specified user subscribes to, including their own. The user is specified using the user_id or screen_name parameters. If no user is given, the authenticating user is used.
{method: 'GET',  url: api.base() + '/lists/all'},
// Returns tweet timeline for members of the specified list. Historically, retweets were not available in list timeline responses but you can now use the include_rts=true parameter to additionally receive retweet objects.
{method: 'GET',  url: api.base() + '/lists/statuses'},
// Removes the specified member from the list. The authenticated user must be the list's owner to remove members from the list.
{method: 'POST', url: api.base() + '/lists/members/destroy'},
// Returns the lists the specified user has been added to. If user_id or screen_name are not provided the memberships for the authenticating user are returned.
{method: 'GET',  url: api.base() + '/lists/memberships'},
// Returns the subscribers of the specified list. Private list subscribers will only be shown if the authenticated user owns the specified list.
{method: 'GET',  url: api.base() + '/lists/subscribers'},
// Subscribes the authenticated user to the specified list.
{method: 'POST', url: api.base() + '/lists/subscribers/create'},
// Check if the specified user is a subscriber of the specified list. Returns the user if they are subscriber.
{method: 'GET',  url: api.base() + '/lists/subscribers/show'},
// Unsubscribes the authenticated user from the specified list.
{method: 'POST', url: api.base() + '/lists/subscribers/destroy'},
// Adds multiple members to a list, by specifying a comma-separated list of member ids or screen names. The authenticated user must own the list to be able to add members to it. Note that lists can't have more than 500 members, and you are limited to adding up to 100 members to a list at a time with...
{method: 'POST', url: api.base() + '/lists/members/create_all'},
// Check if the specified user is a member of the specified list.
{method: 'GET',  url: api.base() + '/lists/members/show'},
// Returns the members of the specified list. Private list members will only be shown if the authenticated user owns the specified list.
{method: 'GET',  url: api.base() + '/lists/members'},
// Add a member to a list. The authenticated user must own the list to be able to add members to it. Note that lists can't have more than 500 members.
{method: 'POST', url: api.base() + '/lists/members/create'},
// Deletes the specified list. The authenticated user must own the list to be able to destroy it.
{method: 'POST', url: api.base() + '/lists/destroy'},
// Updates the specified list. The authenticated user must own the list to be able to update it.
{method: 'POST', url: api.base() + '/lists/update'},
// Creates a new list for the authenticated user. Note that you can't create more than 20 lists per account.
{method: 'POST', url: api.base() + '/lists/create'},
// Returns the lists of the specified (or authenticated) user. Private lists will be included if the authenticated user is the same as the user whose lists are being returned.
{method: 'GET',  url: api.base() + '/lists'},
// Returns the specified list. Private lists will only be shown if the authenticated user owns the specified list.
{method: 'GET',  url: api.base() + '/lists/show'},
// Returns the remaining number of API requests available to the requesting user before the API limit is reached for the current hour. Calls to rate_limit_status do not count against the rate limit. If authentication credentials are provided, the rate limit status for the authenticating user is...
{method: 'GET',  url: api.base() + '/account/rate_limit_status'},
// Returns an HTTP 200 OK response code and a representation of the requesting user if authentication was successful; returns a 401 status code and an error message if not. Use this method to test if supplied user credentials are valid.
{method: 'GET',  url: api.base() + '/account/verify_credentials'},
// Ends the session of the authenticating user, returning a null cookie. Use this method to sign users out of client-facing applications like widgets.
{method: 'POST', url: api.base() + '/account/end_session'},
// Sets which device Twitter delivers updates to for the authenticating user. Sending none as the device parameter will disable SMS updates.
{method: 'POST', url: api.base() + '/account/update_delivery_device'},
// Sets values that users are able to set under the "Account" tab of their settings page. Only the parameters specified will be updated.
{method: 'POST', url: api.base() + '/account/update_profile'},
// Updates the authenticating user's profile background image. This method can also be used to enable or disable the profile background image. Although each parameter is marked as optional, at least one of image, tile or use must be provided when making this request.
{method: 'POST', url: api.base() + '/account/update_profile_background_image'},
// Sets one or more hex values that control the color scheme of the authenticating user's profile page on twitter.com. Each parameter's value must be a valid hexidecimal value, and may be either three or six characters (ex: #fff or #ffffff).
{method: 'POST', url: api.base() + '/account/update_profile_colors'},
// Updates the authenticating user's profile image. Note that this method expects raw multipart data, not a URL to an image. This method asynchronously processes the uploaded file before updating the user's profile image URL. You can either update your local cache the next time you request the user's...
{method: 'POST', url: api.base() + '/account/update_profile_image'},
// Returns the current count of friends, followers, updates (statuses) and favorites of the authenticating user.
{method: 'GET',  url: api.base() + '/account/totals'},
// Returns settings (including current trend, geo and sleep time information) for the authenticating user.
{method: 'GET',  url: api.base() + '/account/settings'},
// Updates the authenticating user's settings.
{method: 'POST', url: api.base() + '/account/settings'},
// Enables device notifications for updates from the specified user. Returns the specified user when successful.
{method: 'POST', url: api.base() + '/notifications/follow'},
// Disables notifications for updates from the specified user to the authenticating user. Returns the specified user when successful.
{method: 'POST', url: api.base() + '/notifications/leave'},
// Returns the authenticated user's saved search queries.
{method: 'GET',  url: api.base() + '/saved_searches'},
// Retrieve the information for the saved search represented by the given id. The authenticating user must be the owner of saved search ID being requested.
{method: 'GET',  url: api.base() + '/saved_searches/show/:id'},
// Create a new saved search for the authenticated user. A user may only have 25 saved searches.
{method: 'POST', url: api.base() + '/saved_searches/create'},
// Destroys a saved search for the authenticating user. The authenticating user must be the owner of saved search id being destroyed.
{method: 'POST', url: api.base() + '/saved_searches/destroy/:id'},
// Returns the top 10 trending topics for a specific WOEID, if trending information is available for it. The response is an array of "trend" objects that encode the name of the trending topic, the query parameter that can be used to search for the topic on Twitter Search, and the Twitter Search URL....
{method: 'GET',  url: api.base() + '/trends/:woeid'},
// Returns the locations that Twitter has trending topic information for. The response is an array of "locations" that encode the location's WOEID and some other human-readable information such as a canonical name and country the location belongs in. A WOEID is a Yahoo! Where On Earth ID.
{method: 'GET',  url: api.base() + '/trends/available'},
// Returns all the information about a known place.
{method: 'GET',  url: api.base() + '/geo/id/:place_id'},
// This method is deprecated and has been replaced by geo/search. Please update your applications with the new endpoint.
{method: 'GET',  url: api.base() + '/geo/nearby_places'},
// Given a latitude and a longitude, searches for up to 20 places that can be used as a place_id when updating a status. This request is an informative call and will deliver generalized results about geography.
{method: 'GET',  url: api.base() + '/geo/reverse_geocode'},
// Search for places that can be attached to a statuses/update. Given a latitude and a longitude pair, an IP address, or a name, this request will return a list of all the valid places that can be used as the place_id when updating a status. Conceptually, a query can be made from the user's location...
{method: 'GET',  url: api.base() + '/geo/search'},
// Locates places near the given coordinates which are similar in name. Conceptually you would use this method to get a list of known places to choose from first. Then, if the desired place doesn't exist, make a request to post/geo/place to create a new one. The token contained in the response is the...
{method: 'GET',  url: api.base() + '/geo/similar_places'},
// Creates a new place object at the given latitude and longitude. Before creating a place you need to query GET geo/similar_places with the latitude, longitude and name of the place you wish to create. The query will return an array of places which are similar to the one you wish to create, and a...
{method: 'POST', url: api.base() + '/geo/place'},
// Returns the top ten topics that are currently trending on Twitter. The response includes the time of the request, the name of each trend, and the url to the Twitter Search results page for that topic.
{method: 'GET',  url: api.base() + '/trends'},
// Returns the current top 10 trending topics on Twitter. The response includes the time of the request, the name of each trending topic, and query used on Twitter Search results page for that topic. It is recommended to use authentication with this method.
{method: 'GET',  url: api.base() + '/trends/current'},
// Returns the top 20 trending topics for each hour in a given day.
{method: 'GET',  url: api.base() + '/trends/daily'},
// Returns the top 30 trending topics for each day in a given week.
{method: 'GET',  url: api.base() + '/trends/weekly'},
// Returns an array of user objects that the authenticating user is blocking. Consider using GET blocks/blocking/ids with GET users/lookup instead of this method.
{method: 'GET',  url: api.base() + '/blocks/blocking'},
// Returns an array of numeric user ids the authenticating user is blocking.
{method: 'GET',  url: api.base() + '/blocks/blocking/ids'},
// Returns if the authenticating user is blocking a target user. Will return the blocked user's object if a block exists, and error with a HTTP 404 response code otherwise.
{method: 'GET',  url: api.base() + '/blocks/exists'},
// Blocks the specified user from following the authenticating user. In addition the blocked user will not show in the authenticating users mentions or timeline (unless retweeted by another user). If a follow or friend relationship exists it is destroyed.
{method: 'POST', url: api.base() + '/blocks/create'},
// Un-blocks the user specified in the ID parameter for the authenticating user. Returns the un-blocked user in the requested format when successful. If relationships existed before the block was instated, they will not be restored.
{method: 'POST', url: api.base() + '/blocks/destroy'},
// The user specified in the id is blocked by the authenticated user and reported as a spammer.
{method: 'POST', url: api.base() + '/report_spam'},
// Allows a Consumer application to use an OAuth request_token to request user authorization. This method is a replacement of Section 6.2 of the OAuth 1.0 authentication flow for applications using the Sign in with Twitter authentication flow. The method will use the currently logged in user as the...
{method: 'GET',  url: api.base() + '/oauth/authenticate'},
// Allows a Consumer application to use an OAuth Request Token to request user authorization. This method fulfills Section 6.2 of the OAuth 1.0 authentication flow. Desktop applications must use this method (and cannot use GET oauth/authenticate). Please use HTTPS for this method, and all other OAuth...
{method: 'GET',  url: api.base() + '/oauth/authorize'},
// Allows a Consumer application to exchange the OAuth Request Token for an OAuth Access Token. This method fulfills Section 6.3 of the OAuth 1.0 authentication flow. The OAuth access token may also be used for xAuth operations. Please use HTTPS for this method, and all other OAuth token negotiation...
{method: 'POST', url: api.base() + '/oauth/access_token'},
// Allows a Consumer application to obtain an OAuth Request Token to request user authorization. This method fulfills Section 6.1 of the OAuth 1.0 authentication flow. It is strongly recommended you use HTTPS for all OAuth authorization steps. Usage Note: Only ASCII values are accepted for the...
{method: 'POST', url: api.base() + '/oauth/request_token'},
// Returns the string "ok" in the requested format with a 200 OK HTTP status code. This method is great for sending a HEAD request to determine our servers current time.
{method: 'GET',  url: api.base() + '/help/test'},
// Returns the current configuration used by Twitter including twitter.com slugs which are not usernames, maximum photo resolutions, and t.co URL lengths. It is recommended applications request this endpoint when they are loaded, but no more than once a day.
{method: 'GET',  url: api.base() + '/help/configuration'},
// Returns the list of languages supported by Twitter along with their ISO 639-1 code. The ISO 639-1 code is the two letter value to use if you include lang with any of your requests.
{method: 'GET',  url: api.base() + '/help/languages'},
// Returns Twitter's Privacy Policy in the requested format.
{method: 'GET',  url: api.base() + '/legal/privacy'},
// Returns the Twitter Terms of Service in the requested format. These are not the same as the Developer Rules of the Road.
{method: 'GET',  url: api.base() + '/legal/tos'},
    
    };
    
    var createRequest = function(rest, data, success, error) {

        var request = {};
        request.sign = function() {
            // sign the request
            if (authMode == 'OAuth') {
                console.log('OAuth Signed Request');

                // compute hash of all base string
                data.oauth_version = '1.0';
                var hash = oauth.sign(rest.method, rest.url, data);

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

            } else if (authMode == 'Basic') {
                setAuthorizationHeader('Basic ' + bauth.getConfd().x);
            }
        };

        request.send = function() {
            console.log('Request.send():', rest.url, data);
            this.sign();

            $.ajax({
                type: rest.method || 'GET',
                url: rest.url,
                data: data,
                success: success,
                error: error,
                dataType: rest.format || 'json',
                contentType: rest.contentType || '',
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
                    oa.authorize(); // use the original(previous) URL for the callbackURL
                    //oa.authenticate()  // there's a bug of API that it can not redirect to 'chrome-extension://*' when it is set to the twitter app's callbackURL

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

    var createAPI = function(rest) {
        var defaultParam = {};
        var retryInterval = 30*1000;

        var api = {};
        api.addDefaultParam = function(p) {
            $.each(p, function(k, v) {
                defaultParam[k] = v;
            });
        };

        api.send = function(type, param, success, error) {
            param = param || {};
            $.each(defaultParam, function(k, v) {
                param[k] = v;
            });

            var req = createRequest(rest, param, function(data) {
                if (data.error) { // handle non-transmission errors
                    error({textStatus: data.error});
                    return;
                } else if (data.errors) {
                    error({textStatus: data.errors[0].message});
                    return;
                } else {
                    success(data);
                }
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
        },

        retweetedBy: function(id, success, error) {
            console.log('Twitter.Tweet.retweetedBy()');
            var api = createAPI('/statuses/'+id+'/retweeted_by.json');
            api.sendRequest({include_entities: true}, success, error);
        },
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
        var homeTL = createStatuses(api.statuses.home_timeline);
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

    var createRetweetsTL = function() {
        console.log('Twitter.createRetweetsTL()');
        var retweetsTL = createStatuses('/statuses/retweets_of_me.json');
        return retweetsTL;
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
                var realurl = url.expanded_url ? url.expanded_url : url.url;
                replaces[text.slice(url.indices[0], url.indices[1])] = '<a href="'+realurl+'" target="_blank">'+url.url+'</a>';
            });
            $.each(entities.hashtags, function(i, hashtag) {
                var twSearch = 'https://twitter.com/search?q=%23' + hashtag.text;
                var ggSearch = 'https://encrypted.google.com/search?q=%23' + hashtag.text + '&tbs=mbl:1';
                replaces[text.slice(hashtag.indices[0], hashtag.indices[1])] = '<a href="'+twSearch+'" target="_blank">#'+hashtag.text+'</a>';
            });
            $.each(entities.user_mentions, function(i, user) {
                replaces[text.slice(user.indices[0], user.indices[1])] = '<a href="#" class="t_userlink">@'+user.screen_name+'</a>';
            });

            if (entities.media) {
                $.each(entities.media, function(i, md) {
                    var realurl = md.expanded_url ? md.expanded_url : md.url;
                    replaces[text.slice(md.indices[0], md.indices[1])] = '<a href="'+realurl+'" target="_blank">'+md.url+'</a>';
                });
            }

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
        createRetweetsTL: createRetweetsTL,
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


/*
* POST statuses/update_with_media

Updated on Wed, 2011-08-17 07:51
Updates the authenticating user's status and attaches media for upload.

Unlike POST statuses/update, this method expects raw multipart data. Your POST request's Content-Type should be set to multipart/form-data with the media[] parameter

The Tweet text will be rewritten to include the media URL(s), which will reduce the number of characters allowed in the Tweet text. If the URL(s) cannot be appended without text truncation, the tweet will be rejected and this method will return an HTTP 403 error.

Important: Make sure that you're using upload.twitter.com as your host while posting statuses with media. It is strongly recommended to use SSL with this method.

Resource URL
https://upload.twitter.com/1/statuses/update_with_media.format
Parameters
status
required
The text of your status update. URL encode as necessary. t.co link wrapping may affect character counts if the post contains URLs. You must additionally account for the characters_reserved_per_media per uploaded media, additionally accounting for space characters in between finalized URLs.

Note: Request the GET help/configuration endpoint to get the current characters_reserved_per_media and max_media_per_upload values.

media[]
required
Up to max_media_per_upload files may be specified in the request, each named media[]. Supported image formats are PNG, JPG and GIF. Animated GIFs are not supported.

Note: Request the GET help/configuration endpoint to get the current max_media_per_upload and photo_size_limit values.

*/


/*
* Working with statuses/update_with_media


@episod Taylor Singletary
Attaching media to Tweets with POST statuses/update_with_media is easy. A few pointers before getting started:

POST statuses/update_with_media is only available on the upload.twitter.com host. You must use upload.twitter.com for this method and this method alone. Status updates without media should still be performed on api.twitter.com.
Because the method uses multipart POST, OAuth is handled a little differently.
POST or query string parameters are not used when calculating an OAuth signature basestring or signature. Only the oauth_* parameters are used. (see examples below)
Maximum file size is available in the "photo_size_limit" field from GET help/configuration
Maximum number of media (currently 1) per status update is in the "max_media_per_upload" field from GET help/configuration
Users have a separate, published daily media upload limit that is indepedent of their unpublished daily status update limits. Details on these limits are communicated in the HTTP headers detailed on POST statuses/update_with_media.
To illustrate the upload process, I've decided to post a status update: "Don't slip up" with a picture of Dick Van Dyke having fallen over an ottoman. The following code sample, which works well with @themattharris' tmhOAuth ( http://github.com/themattharris/tmhOAuth ) demonstrates the process.
*/


