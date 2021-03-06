import * as browser_api from "../../interfaces/browser_api";
import BrowserAPI = browser_api.BrowserAPI;
import * as net from '../../lib/net/net.types';
import * as Constants from '../../generic_ui/scripts/constants';
// import * as MacProxy from './mac_set_proxy';
import ProxyAccessMode = browser_api.ProxyAccessMode;
import ProxyDisconnectInfo = browser_api.ProxyDisconnectInfo;
import * as nw from 'nw.gui';

/**
 * desktop_browser_api.ts
 *
 * Implementation of the Browser API.
 * Derived from chrome_browser_api.ts
 * How to get teh main window in nwjs.
 * global.__nw_windows[Object.keys(global.__nw_windows)][0].window
 * tested in background page devtool.
 * Please work in node context ...
 */

enum PopupState {
    NOT_LAUNCHED,
    LAUNCHING,
    LAUNCHED
}

declare var Notification : any; //TODO remove this
declare var window : any;

export default class DesktopBrowserApi implements BrowserAPI {
    public browserSpecificElement = '';
    public canProxy = true;

    public hasInstalledThenLoggedIn = true;
    //  
    public supportsVpn = false;
    private proxyAccessMode_ = ProxyAccessMode.NONE;
    
    // When we tried to create UI.
    private popupCreationStartTime_ = Date.now();
    
    // TODO: Maybe I should check on the the window
    // popup is the main window
    private popupState_ = PopupState.NOT_LAUNCHED;

    private popup_url = "../../generic_ui/index.html";
    
    // storing a reference to the main window
    private browser_ : Window = null;

    private onceLaunched_ :Promise<void>;
    public handlePopupLaunch :() => void; 

    constructor() {
        // add Notification
        chrome.notifications.onClicked.addListener((tag) => {
            this.emit_('notificationclicked', tag);
        });
        
        // clear the system proxy setting if there is any
        // MacProxy.stopProxy();
        this.checkVpnSupport_();
    }
    
    public setIcon = (iconFile :string) : void => {
        // Void
    }

    public launchTabIfNotOpen = (relativeUrl :string) => {
        // not sure what to handle for Nwjs, log the relativeurl so we know the input first
        console.log('LaunchTabIfNotOpen called :' + relativeUrl);
    }

    public startUsingProxy = (endpoint: net.Endpoint, bypass: string[],
        opts: browser_api.ProxyConnectOptions) => {
        // opts can be inapp or vpn, for nwjs, the inital design of desktop app is
        // vpn
        // MacProxy.startSettingProcess(endpoint.port, []);
        console.log('Successfully set proxy');
        if (!chrome.proxy) {
            console.log('No proxy setting support; ignoring start command');
            return;
        }
    
        if (!opts.accessMode || opts.accessMode === ProxyAccessMode.NONE) {
            console.log('Cannot start proxying with unknown access mode.');
            return;
        }
        this.proxyAccessMode_ = opts.accessMode;
        console.log("Starting Proxy Server");
        console.log(this.proxyAccessMode_);
        if (this.proxyAccessMode_ === ProxyAccessMode.IN_APP) {
            this.startInAppProxy_(endpoint);
        } else if (this.proxyAccessMode_ === ProxyAccessMode.VPN) {
            // TODO: start vpn proxy. need to implement tun2socks
            this.startVpnProxy_(endpoint);
        }
    }

    private startInAppProxy_ = (endpoint: net.Endpoint) => {
        chrome.proxy.settings.set({
            scope: 'regular',
            value: {
                mode: 'fixed_servers',
                rules: {
                    singleProxy: {
                    scheme: 'socks5',
                    host: endpoint.address,
                    port: endpoint.port
                    }
                }
            }
        }, (response:Object) => {
            console.log('Set proxy response:', response);
            // Open the in-app browser through the proxy.
            this.openTab('https://news.google.com/');
        });
    }

    private startVpnProxy_ = (endpoint: net.Endpoint) => {
        // Todo, start vpn
    }

    private checkVpnSupport_ = () : void => {
        if (window.tun2socks === undefined) {
          // We only add the tun2socks plugins to Android.
          // Other platforms should fail here.
          this.supportsVpn = false;
          return;
        }
        // tun2socks calls bindProcessToNetwork so that the application traffic
        // bypasses the VPN in order to avoid a loop-back.
        // This API requires Android version >= Marshmallow (6.0, API 23).
        window.tun2socks.deviceSupportsPlugin().then((supportsVpn: boolean) => {
          this.supportsVpn = supportsVpn;
        });
    }

    public openTab = (url :string) => {
        // this is experimental, not sure it will work
        // for the moment, I will try to use window.location.href to set the content.
        // but on the thread listed below is using webview.
        // https://github.com/nwjs/nw.js/issues/5205
        if (url.indexOf(':') < 0) {
            url = chrome.extension.getURL(url);
        }
        chrome.tabs.create({url: url}, (tab) => {
            chrome.windows.update(tab.windowId, {focused: true});
        });
    }

    public bringUproxyToFront = () : Promise<void> => {
        if (this.popupState_ === PopupState.NOT_LAUNCHED) {
            this.popupState_ = PopupState.LAUNCHED;
            // Is this Fullfill and Reject ?
            this.onceLaunched_ = new Promise<void>((F, R) => {
                this.handlePopupLaunch = F;
            });
            return this.onceLaunched_;
        } else {
            console.log('Waiting for mainwindow to launch...');
            return this.onceLaunched_;   
        }
    }

    public stopUsingProxy = () => {
        // MacProxy.stopProxy();
        if (this.proxyAccessMode_ === ProxyAccessMode.IN_APP) {
            chrome.proxy.settings.clear({scope: 'regular'}, () => {
                console.log('Cleared proxy settings IN_APP mode');
            });
        } else if (this.proxyAccessMode_ === ProxyAccessMode.VPN) {
            // MacProxy.stopProxy();
            console.log('Cleared proxy settings VPN mode');
        } else {
            console.error('Unexpected proxy access mode ', this.proxyAccessMode_);
        }
    };

    public isConnectedToCellular = (): Promise<boolean> => {
        return Promise.resolve(false);
    }

    public showNotification = (text :string, tag :string) => {
        var notification = new Notification('uProxy', {
            body: text,
            icon: 'icons/38_' + Constants.DEFAULT_ICON,
            tag: tag
        });

        notification.onclick = () => {
            this.emit_('notificationClicked', tag);
            };
            setTimeout(function() {
            notification.close();
        }, 5000);
    }
    
    public setBadgeNotification = (notification :string) => {
        // chrome.browserAction.setBadgeText({text: notification});
        // TODO : not sure how to handle this for the moment
        this.showNotification(notification, 'badge');
    }
    
    private events_ :{[name :string] :Function} = {};
    
    public exit = () => {
        nw.App.quit();
    }
    // Queue of any events emitted that don't have listeners yet.  This is needed
    // for the 'inviteUrlData' event, if the invite URL caused uProxy to open,
    // because otherwise the event would be emitted before UserInterface has a
    // chance to set a listener on it.
    private pendingEvents_ :{[name :string] :Object[][]} = {};
    
    public on = (name :string, callback :Function) => {
        if (name in this.events_) {
            console.warn('Overwriting Cordova Browser API event listener: ' + name);
        }
        this.events_[name] = callback;
        if (name in this.pendingEvents_) {
            this.pendingEvents_[name].forEach((args:Object[]) => {
            callback.apply(null, args);
            });
            delete this.pendingEvents_[name];
        }
    };

    private emit_ = (name :string, ...args :Object[]) => {
        if (name in this.events_) {
            this.events_[name].apply(null, args);
        } else {
            if (!(name in this.pendingEvents_)) {
            this.pendingEvents_[name] = [];
            }
            this.pendingEvents_[name].push(args);
        }
    };

    public respond = (data :any, callback ?:Function, msg ?:string) : void => {
        callback && this.respond_(data, callback);
    }
    
    private respond_ = (data :any, callback :Function) : void => {
        callback(data);
    }
}