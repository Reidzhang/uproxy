import * as user_interface from '../../generic_ui/scripts/ui';
import CoreConnector from '../../generic_ui/scripts/core_connector';
import * as Constants from '../../generic_ui/scripts/constants';
import ChromeBrowserApi from '../lib/chrome_browser_api';
import * as background_ui from '../../generic_ui/scripts/background_ui';
import ChromeConnector from './chrome_core_connector'
import * as uproxy_core_api from '../../interfaces/uproxy_core_api'
import * as _ from 'lodash';
import Chrome_oauth from './chrome_oauth';

export const browserApi = new ChromeBrowserApi();
// export const browserConnector = new ChromeConnector();

// export const core = new CoreConnector(uProxyAppChannel);
// In the original Chrome app implementation, there are main.core-env.ts
// and background.ts

declare const freedom: freedom.FreedomInCoreEnv;

export interface OnEmitModule extends freedom.OnAndEmit<any,any> {};
export interface OnEmitModuleFactory extends
  freedom.FreedomModuleFactoryManager<OnEmitModule> {};

let chromeConnector: ChromeConnector

function getPolicyFromManagedStorage() :Promise<Object> {
    return new Promise((fulfill, reject) => {
        chrome.storage.managed.get(null, (contents)=> {
            if (contents) {
                fulfill(contents);
            } else {
                reject(chrome.runtime.lastError);
            }
        });
    });
}

function sendPolicyToCore(contents : Object) :void {
    chromeConnector.sendToCore(uproxy_core_api.Command.UPDATE_ORG_POLICY,
    contents);
}

var oauthOptions :{connector:ChromeConnector;} = {
    connector: null
};

export var uProxyAppChannel : freedom.OnAndEmit<any,any>;
export var moduleName = 'uProxy App Top Level'

freedom('generic_core/freedom-module.json', <freedom.FreedomInCoreEnvOptions>{
  'logger': 'lib/loggingprovider/freedom-module.json',
  'debug': 'debug',
  'portType': 'worker',
  'oauth': [() => { return new Chrome_oauth(oauthOptions); }]
}).then((uProxyModuleFactory:OnEmitModuleFactory) => {
  uProxyAppChannel = uProxyModuleFactory();
  chromeUIConnector = new ChromeUIConnector(uProxyAppChannel);

  oauthOptions.connector = chromeUIConnector;

  getPolicyFromManagedStorage().then((contents) => {
    if (!_.isEmpty(contents)) {
      sendPolicyToCore(contents);
    }
  });
});

chrome.storage.onChanged.addListener((properties :Object, namespace :string) =>{
    if (namespace != 'managed') {
        return;
    }
    getPolicyFromManagedStorage().then((contents) => {
        sendPolicyToCore(contents);
    });
});