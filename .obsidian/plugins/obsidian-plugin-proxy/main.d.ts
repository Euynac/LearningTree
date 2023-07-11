import { Plugin } from 'obsidian';

interface DataConfigProxyItem {
    id: string;
    download: string;
    raw: string;
    page: string;
}
interface DataConfig {
    currentProxy: string;
    defaultProxy: string;
    proxyList: DataConfigProxyItem[];
    customProxyEnable: boolean;
    currentCustomProxy: string;
    customProxyList: DataConfigProxyItem[];
}

declare class PluginProxy extends Plugin {
    onload(): Promise<void>;
    syncConfig(config: DataConfig): void;
    saveData(config: DataConfig): Promise<void>;
}

export { PluginProxy as default };
