import * as browser_api from "../../interfaces/browser_api";
import BrowserAPI = browser_api.BrowserAPI;
import * as net from '../../lib/net/net.types';
import * as Constants from '../../generic_ui/scripts/constants';

/**
 * desktop_browser_api.ts
 *
 * Implementation of the Browser API.
 * Derived from chrome_browser_api.ts
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
}