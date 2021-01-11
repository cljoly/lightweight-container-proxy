async function proxyFromSettings(settingObject) {
    if (settingObject == null || settingObject['type'] == null) {
        console.warn("no settings defined");
        return defaultProxy();
    }
    switch (settingObject.type) {
        case 'socks':
            return {
                type: "socks",
                host: settingObject.host,
                port: settingObject.port,
                proxyDNS: true,
                failoverTimeout: 10,
            }
        case 'direct':
            return direct();
        default:
            console.warn("No proxy for", settingObject);
            return defaultProxy();
    }
    console.warn("shouldn’t go out of this switch");
    return defaultProxy();
}

async function proxyContainer(settingContainerObject) {
    if (settingContainerObject != null && settingContainerObject['type'] != null) {
        switch (settingContainerObject.type) {
            case 'socks':
            case 'direct':
                return proxyFromSettings(settingContainerObject);
            case 'fallback':
                return proxyFromSettings(await fallback());
            default:
                console.warn("unhandled case", settingContainerObject);
                return proxyFromSettings(await fallback());
        }
    }
    console.warn("no settings found for container");
    return proxyFromSettings(await fallback());
}

function direct() {
    return {
        type: "direct",
    }
}

function defaultProxy() {
    return direct();
}

// Use incognito settings
async function incognito() {
        const stateKey = 'state-incognito';
        const setting = await browser.storage.local.get([stateKey]);
        return setting[stateKey];
}

// Use fallback settings
async function fallback() {
        const stateKey = 'fallback';
        const setting = await browser.storage.local.get([stateKey]);
        return setting[stateKey];
}

browser.proxy.onRequest.addListener(async function (details) {
    if (details.tabId !== browser.tabs.TAB_ID_NONE) {
        const tab = await browser.tabs.get(details.tabId);
        const stateKey = `state-${tab.cookieStoreId}`;
        const setting = await browser.storage.local.get([stateKey]);
        if (setting[stateKey] != null) {
            const p = proxyContainer(setting[stateKey]);
            // console.log(setting[stateKey], " => proxy", p);
            // console.log("; details", details);
            return p;
        }
    }
    const p = proxyContainer(await fallback());
    // console.log("NO TAB => proxy", p, details.tabId);
    return p;
}, {urls: ["<all_urls>"], incognito: false}, []);

browser.proxy.onRequest.addListener(async function (details) {
    const p = proxyContainer(await incognito());
    // console.log("INCOGNITO => proxy", p, details.tabId);
    return p;
}, {urls: ["<all_urls>"], incognito: true}, []);

browser.proxy.onError.addListener(function (err) {
    console.error("proxy error", err);
})

// Handle click on the action button
browser.browserAction.onClicked.addListener(async function() { await browser.runtime.openOptionsPage() });

// Open preferences when installed
browser.runtime.onInstalled.addListener(async function(details) {
    if (details.reason === "install") {
        await browser.runtime.openOptionsPage() 
    }
});
