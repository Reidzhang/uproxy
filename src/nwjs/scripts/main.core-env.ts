/**
 * background.ts
 * 
 * this is the script will be loaded in bg-script.
 * In chrome, the background script is able to load multiple scripts.
 * However, that is not the case of nwjs. Freedom script is modified so
 * it can be directly imported in script.
 */

// TODO: import freedom
import 'freedom-for-chrome/freedom-for-chrome';
import DesktopBrowserApi from './desktop_browser_api';

import * as uproxy_core_api from '../../interfaces/uproxy_core_api';

declare const freedom: freedom.FreedomInCoreEnv;

export interface OnEmitModule extends freedom.OnAndEmit<any,any> {};
export interface OnEmitModuleFactory extends
  freedom.FreedomModuleFactoryManager<OnEmitModule> {};
 
// Remember which handlers freedom has installed.
var haveAppChannel :Function;
export var uProxyAppChannel :Promise<freedom.OnAndEmit<any,any>> =
    new Promise((F, R) => {
  haveAppChannel = F;
});

export var moduleName = 'uProxy App Top Level';
export var browserApi :DesktopBrowserApi = new DesktopBrowserApi();

console.log('Instantiating UI');
// This instantiation, before the core has even started, should reduce the
// apparent startup time, but runs the risk of leaving the UI non-responsive
// until the core catches up.
browserApi.bringUproxyToFront().then(() => {
  console.log('UI instantiation complete');
});

console.log('Loading core');
freedom('generic_core/freedom-module.json', <freedom.FreedomInCoreEnvOptions>{
  'logger': 'lib/loggingprovider/freedom-module.json',
  'debug': 'debug',
  'portType': 'worker'
}).then((uProxyModuleFactory:OnEmitModuleFactory) => {
  console.log('Core loading complete');
  haveAppChannel(uProxyModuleFactory());
});
