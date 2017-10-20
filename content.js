url = window.location.href;
let cookie =document.cookie;
let width = document.documentElement.clientWidth;
let height = document.documentElement.scrollHeight;
top = document.documentElement.top;
let left = document.documentElement.left;
// console.log(cookie);
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            // console.log(request);
            if (request.greeting === "print") {
                sendResponse({
                    url,
                    cookie,
                    width,
                    height
                });
            } else if (request.greeting === "capture") {
                sendResponse({
                    url,
                    cookie,
                    width,
                    // height,
                });
            } else if (request.greeting === "logout") {
            }
        });
// }


