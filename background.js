(function () {
        chrome.tabs && chrome.tabs.onCreated.addListener(function (tab) {
            injectJs(tab);
        });

    function injectJs(tab) {
        tab[0] && tab[0].id && chrome.tabs.executeScript(tab[0].id, {
            file: 'content.js'
        });
    };
})();
