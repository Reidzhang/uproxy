import * as browser_api from "../../interfaces/browser_api";
import BrowserAPI = browser_api.BrowserAPI;
import * as net from '../../lib/net/net.types';
import * as Constants from '../../generic_ui/scripts/constants';
import ProxyAccessMode = browser_api.ProxyAccessMode;
import ProxyDisconnectInfo = browser_api.ProxyDisconnectInfo;

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

export default class DesktopBrowserApi implements BrowserAPI {
    public browserSpecificElement = '';
    public canProxy = true;

    public hasInstalledThenLoggedIn = true;
    //  
    public supportsVpn = false;

    // TODO: set the system VPN using the script generated before.
    private proxyAccessMode_ = ProxyAccessMode.NONE;
    // When we tried to create UI.
    private popupCreationStartTime_ = Date.now();
    // TODO: Maybe I should check on the the window
    private popupState_ = PopupState.NOT_LAUNCHED;

    private popup_url = "../../generic_ui/index.html";
    
    // storing a reference to the main window
    private browser_ : Window = null;
    private onceLaunched_ :Promise<void>;
    public handlePopupLaunch :() => void; 

    constructor() {
        // TODO: add Notification
    }
    
    public setIcon = (iconFile :string) : void => {
    }

    public launchTabIfNotOpen = (relativeUrl :string) => {
    }

    public startUsingProxy = (endpoint: net.Endpoint, bypass: string[],
        opts: browser_api.ProxyConnectOptions) => {

    }

    public openTab = (url :string) => {
    }

    public bringUproxyToFront = () : Promise<void> => {
        return this.onceLaunched_;
    }

    public stopUsingProxy = () => {};

    public isConnectedToCellular = (): Promise<boolean> => {
        return Promise.resolve(false);
    }

    public showNotification = (text :string, tag :string) => {

    }

    public setBadgeNotification = (notification :string) => {
        chrome.browserAction.setBadgeText({text: notification});
    }
    
    private events_ :{[name :string] :Function} = {};
    
    public exit = () => {
        // Not necessary for in-browser versions
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