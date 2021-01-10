class containersHTTPS {
  createIcon(container) {
    const icon = document.createElement("div");

    icon.classList.add("icon");
    const iconUrl = container.iconUrl || "img/blank-tab.svg";
    icon.style.mask = `url(${iconUrl}) top left / contain`;
    icon.style.background = container.colorCode || "#000";
    return icon;
  }

  async createHost(container) {
    const host = document.createElement("input");
    host.type = "text";
    host.classList.add("host");
    host.setAttribute("required", "");

    await this.connectToStore(host, container.cookieStoreId, 'host');

    return host;
  }

  async connectToStore(formElement, cookieStoreId, stateField) {
    console.log("connecting to store:", formElement)
    // formElement.addEventListener("click", this);
    // formElement.addEventListener("submit", this);
    formElement.addEventListener("change", this);

    const state = await this.getState(cookieStoreId);
    const v = state[stateField];
    formElement.value = v;
    formElement.setAttribute('data-content', v);

    const actionType = stateField;
    if (cookieStoreId != null) {
      formElement.dataset.cookieStoreId = cookieStoreId;
    }
    formElement.dataset.action = actionType;
    console.log("connected to store:", formElement)
  }

  async createTypeChoser(container) {
    let select = document.createElement("select");
    select.classList.add("type")

    let fallback = document.createElement("option");
    fallback.textContent = "fallback";
    let direct = document.createElement("option");
    direct.textContent = "direct";
    let socks = document.createElement("option");
    socks.textContent = "socks";

    select.appendChild(fallback);
    select.appendChild(direct);
    select.appendChild(socks);

    await this.connectToStore(select, container.cookieStoreId, 'type');

    return select;
  }

  createName(container) {
    let label = document.createElement("label");
    label.textContent = container.name;
    label.classList.add("container-name");

    return label;
  }

  async createRow(container) {
    const fs = document.createElement("field-set");
    fs.appendChild(this.createIcon(container));
    fs.appendChild(this.createName(container));
    fs.appendChild(await this.createTypeChoser(container));
    fs.appendChild(await this.createHost(container));

    return fs;
  }

  stateKey(cookieStoreId) {
    if (cookieStoreId == null) {
        return this.stateFallbackKey;
    }
    return `state-${cookieStoreId}`;
  }

  defaultState(stateKey) {
    if (stateKey == this.stateFallbackKey) {
        return {host: "", type: "direct", port: 1080};
    }
    return {host: "", type: "fallback", port: 1080};
  }

  async getState(cookieStoreId) {
    const stateKey = this.stateKey(cookieStoreId);
    const states = await browser.storage.local.get(stateKey);
    let state = this.defaultState(stateKey);
    if (states && states[stateKey]) {
        state = states[stateKey];
    }
    console.log("got state", state);
    return state
  }

  async storeState(cookieStoreId, state) {
    console.log("storing state", cookieStoreId, state);
    const stateKey = this.stateKey(cookieStoreId);
    const res = await browser.storage.local.set({[stateKey]: state});
    console.log("stored state, result: ", res);
    return res;
  }

  async updateFallback() {
      const select = document.getElementById("fallback-type");
      await this.connectToStore(select, null, 'type');

      const host = document.getElementById("fallback-host");
      await this.connectToStore(host, null, 'host');
  }

  async handleEvent(event) {
    const button = event.target;
    const cookieStoreId = button.dataset.cookieStoreId;
    const state = await this.getState(cookieStoreId);
    switch (button.dataset.action) {
      case "type":
        const v = '' + button.value;
        state.type = v;
        button.setAttribute('data-content', v);
        break;
      case "host":
        state.host = '' + button.value;
        break;
    }
    await this.storeState(cookieStoreId, state);
  }

  /**
   * Do some house keeping to clean up storage
   */
  removeContainer(cookieStoreId) {
    browser.storage.local.remove(this.stateKey(cookieStoreId));
  }

  constructor(cookieStoreId) {
    this.stateFallbackKey = 'fallback'

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

    const fallbackPromise = await this.updateFallback();

    const rows = await Promise.all(rowPromises);
    rows.forEach((row) => {
      menu.appendChild(row);
    });
  }
};

const containerHTTPS = new containersHTTPS();

document.getElementById("export").addEventListener("click", exportPrefs);
document.getElementById("import").addEventListener("click", importPrefs);

async function importPrefs() {
    const jsonTxt = document.getElementById("json-txt");
    await browser.storage.local.set(JSON.parse(jsonTxt.value));
    containerHTTPS.rebuildMenu();
}

async function exportPrefs() {
    const jsonTxt = document.getElementById("json-txt");
    const storage = await browser.storage.local.get(null);
    jsonTxt.value = JSON.stringify(storage);
}

