chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.msg == 'export') {
        document.getElementById("tweets").innerHTML = request.html;
        sendResponse({});
    }
});

