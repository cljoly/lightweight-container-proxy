browser.webRequest.onBeforeRequest.addListener(async function (details) {
  const url = new URL(details.url);
  if (url.protocol === "http:") {
    if (details.tabId !== browser.tabs.TAB_ID_NONE) {
      const tab = await browser.tabs.get(details.tabId);
      const stateKey = `state-${tab.cookieStoreId}`;
      const setting = await browser.storage.local.get([stateKey]);
      if (setting[stateKey]) {
        const redirectUrl = details.url.replace(/^http:/, "https:");
        return {
          redirectUrl
        };
      }
    }
  }
  return {};
}, {urls: ["<all_urls>"]}, ["blocking"]);
