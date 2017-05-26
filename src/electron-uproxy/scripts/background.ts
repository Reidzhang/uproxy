import * as user_interface from '../../generic_ui/scripts/ui';
import CoreConnector from '../../generic_ui/scripts/core_connector';
import * as Constants from '../../generic_ui/scripts/constants';
import ChromeBrowserApi from '../lib/chrome_browser_api';
import * as background_ui from '../../generic_ui/scripts/background_ui';
import ChromeConnector from './chrome_ui_connector'

export const browserApi = new ChromeBrowserApi();
export const browserConnector = new ChromeConnector();

// export const core = new CoreConnector(uProxyAppChannel);

