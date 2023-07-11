'use strict';

const obsidian = require('obsidian');
const electron = require('electron');

class SettingTab extends obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  async saveData(config) {
    config = config || await this.plugin.loadData();
    this.plugin.saveData(config);
  }
  async display() {
    const { containerEl: cont } = this;
    cont.empty();
    cont.createEl("h2", { text: "Plugin Proxy Setting" });
    cont.createEl("br");
    new obsidian.Setting(cont).setName("\u4EE3\u7406\u670D\u52A1\u5668").setDesc("\u901A\u8FC7\u9009\u62E9\u4E0D\u540C\u7684\u670D\u52A1\u5668\u6765\u5207\u6362\u4EE3\u7406\uFF0C\u53EF\u4EE5\u89E3\u51B3\u67D0\u4E9B\u60C5\u51B5\u4E0B\uFF0C\u67D0\u4E2A\u670D\u52A1\u5668\u65E0\u6CD5\u8BBF\u95EE\u7684\u60C5\u51B5\u3002").addDropdown(async (dropDown) => {
      const config = await this.plugin.loadData();
      config.proxyList.forEach((item) => {
        dropDown.addOption(item.id, item.id);
      });
      dropDown.setValue(config.currentProxy);
      dropDown.onChange(async (value) => {
        config.currentProxy = value;
        this.saveData(config);
      });
    });
    new obsidian.Setting(cont).setName("\u81EA\u5B9A\u4E49\u4EE3\u7406\u670D\u52A1\u5668").setDesc("\u53EF\u4EE5\u5728\u63D2\u4EF6\u76EE\u5F55\u4E0B\u7684 data.json \u4E2D\u81EA\u5B9A\u4E49\u4EE3\u7406\u3002e.g. <project>/.obsidian/plugins/obsidian-plugin-proxy/data.json");
  }
}

var ProxyRequestType = /* @__PURE__ */ ((ProxyRequestType2) => {
  ProxyRequestType2[ProxyRequestType2["Unknown"] = 0] = "Unknown";
  ProxyRequestType2["Download"] = "download";
  ProxyRequestType2["Raw"] = "raw";
  ProxyRequestType2["Page"] = "page";
  return ProxyRequestType2;
})(ProxyRequestType || {});
const proxyRequestMatchRegex = [
  ["download" /* Download */, /\release\/download\//g],
  ["raw" /* Raw */, /^https?:\/\/raw.githubusercontent.com\//],
  ["page" /* Page */, /^https?:\/\/github.com\//]
];
const proxyRequestReplaceHostMap = /* @__PURE__ */ new Map([
  ["download" /* Download */, "https://github.com/"],
  ["raw" /* Raw */, "https://raw.githubusercontent.com/"],
  ["page" /* Page */, "https://github.com/"]
]);
var IpcRendererSendType = /* @__PURE__ */ ((IpcRendererSendType2) => {
  IpcRendererSendType2["requestUrl"] = "request-url";
  IpcRendererSendType2["remoteBrowserDereference"] = "REMOTE_BROWSER_DEREFERENCE";
  return IpcRendererSendType2;
})(IpcRendererSendType || {});

function matchUrl(e) {
  let type = ProxyRequestType.Unknown;
  if (!e || typeof e.url !== "string")
    return type;
  proxyRequestMatchRegex.some(([tp, regExp]) => {
    const matched = regExp.test(e.url);
    if (matched)
      type = tp;
    return matched;
  });
  return type;
}
function delegateIpcRendererSend(config) {
  const ipcRendererSend = electron.ipcRenderer.send;
  electron.ipcRenderer.send = function(...args) {
    const [type, , e] = args;
    if (type === IpcRendererSendType.requestUrl) {
      const requestType = matchUrl(e);
      if (requestType !== ProxyRequestType.Unknown) {
        e.url = e.url.replace(proxyRequestReplaceHostMap.get(requestType), config[requestType]);
        if (!e.headers)
          e.headers = {};
        e.headers["content-type"] = "application/x-www-form-urlencoded";
        e.headers["Access-Control-Allow-Origin"] = "*";
      }
    }
    ipcRendererSend.bind(electron.ipcRenderer)(...args);
  };
}

class PluginProxy extends obsidian.Plugin {
  async onload() {
    this.addSettingTab(new SettingTab(this.app, this));
    const config = await this.loadData();
    this.syncConfig(config);
  }
  syncConfig(config) {
    const proxyItem = config.proxyList.find((p) => p.id === config.currentProxy);
    delegateIpcRendererSend(proxyItem);
  }
  async saveData(config) {
    super.saveData(config);
    this.syncConfig(config);
  }
}

module.exports = PluginProxy;
