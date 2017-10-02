class containersHTTPS {
  createIcon(container) {
    const icon = document.createElement("div");

    icon.classList.add("icon");
    const iconUrl = container.iconUrl || "img/blank-tab.svg";
    icon.style.mask = `url(${iconUrl}) top left / contain`;
    icon.style.background = container.colorCode || "#000";
    return icon;
  }

  async createToggle(container) {
    const toggle = document.createElement("input");
    toggle.type = "checkbox";
    toggle.classList.add("toggle");

    toggle.addEventListener("click", this);
    toggle.addEventListener("submit", this);
    toggle.addEventListener("change", this);

    const state = await this.getState(container.cookieStoreId);
    toggle.checked = state;

    toggle.dataset.cookieStoreId = container.cookieStoreId;
    toggle.dataset.action = "toggle";

    return toggle;
  }

  createNewTab(container) {
    const newTabButton = document.createElement("button");
    newTabButton.classList.add("new-tab");

    newTabButton.addEventListener("click", this);
    newTabButton.addEventListener("submit", this);
    newTabButton.dataset.cookieStoreId = container.cookieStoreId;
    newTabButton.dataset.action = "new-tab";

    return newTabButton;
  }

  async createRow(container) {
    const li = document.createElement("li");
    li.appendChild(this.createIcon(container));
    li.appendChild(document.createTextNode(container.name));
    li.appendChild(await this.createToggle(container));
    li.appendChild(this.createNewTab(container));

    return li;
  }

  stateKey(cookieStoreId) {
    return `state-${cookieStoreId}`;
  }

  async getState(cookieStoreId) {
    const stateKey = this.stateKey(cookieStoreId);
    const states = await browser.storage.local.get(stateKey);
    return states[stateKey];
  }

  async storeState(cookieStoreId, checked) {
    console.log("storing state", cookieStoreId, checked);
    const stateKey = this.stateKey(cookieStoreId);
    return browser.storage.local.set({
      [stateKey]: checked
    });
  }

  handleEvent(event) {
    const button = event.target;
    const cookieStoreId = button.dataset.cookieStoreId;
    switch (button.dataset.action) {
      case "new-tab":
        browser.tabs.create({
          cookieStoreId
        });
        break;
      case "toggle":
        this.storeState(cookieStoreId, button.checked);
        break;
    }
  }

  /**
   * Do some house keeping to clean up storage
   */
  removeContainer(cookieStoreId) {
    browser.storage.local.remove(this.stateKey(cookieStoreId));
  }

  constructor(cookieStoreId) {
    this.urlElement = document.getElementById("search-field");
    const rebuildEvent = () => {
      this.rebuildMenu();
    };
    browser.contextualIdentities.onRemoved.addListener((container) => {
      this.removeContainer(container.cookieStoreId);
      rebuildEvent();
    });
    browser.contextualIdentities.onUpdated.addListener(rebuildEvent);
    browser.contextualIdentities.onCreated.addListener(rebuildEvent);
    this.rebuildMenu();
  }

  async rebuildMenu() {
    const containers = await browser.contextualIdentities.query({});
    const menu = document.getElementById("containers-menu");
    while (menu.firstChild) {
      menu.removeChild(menu.firstChild);
    }
    containers.unshift({
      cookieStoreId: "firefox-default",
      name: "Default"
    });
    const rowPromises = [];
    containers.forEach((container) => {
      rowPromises.push(this.createRow(container));
    });
    const rows = await Promise.all(rowPromises);
    rows.forEach((row) => {
      menu.appendChild(row);
    });
  }
};

new containersHTTPS();
