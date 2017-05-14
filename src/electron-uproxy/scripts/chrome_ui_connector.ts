import * as browser_connector from '../../interfaces/browser_connector';
import * as uproxy_core_api from '../../interfaces/uproxy_core_api';
import * as uproxy_chrome from '../../interfaces/chrome';

// TODO: remove anything that is related to extension

// See the ChromeCoreConnector, which communicates to this class.
var installedFreedomHooks :number[] = [];

export default class ChromeUIConnector {

  // private extPort_:chrome.runtime.Port;    // The port that the extension connects to.
  private onCredentials_ :(credentials?:Object, error?:Object) => void;

  constructor(private uProxyAppChannel_ :freedom.OnAndEmit<any,any>) {
    chrome.runtime.onUpdateAvailable.addListener((details) => {
      this.sendToCore(uproxy_core_api.Command.HANDLE_CORE_UPDATE,
                      {version: details.version});
    });
  }


  // Receive a message from the extension.
  // This usually installs freedom handlers.
  // private onExtMsg_ = (msg :browser_connector.Payload) => {
  //   console.log('[chrome ui connector] Extension message: ', uproxy_core_api.Command[msg.type]);
  //   // Pass 'emit's from the UI to Core.
  //   if ('emit' == msg.cmd) {
  //     if (msg.type == uproxy_core_api.Command.SEND_CREDENTIALS) {
  //       this.onCredentials_(msg.data);
  //     } else if (msg.type == uproxy_core_api.Command.CREDENTIALS_ERROR) {
  //       this.onCredentials_(undefined, msg.data);
  //     } else if (msg.type == uproxy_core_api.Command.RESTART) {
  //       chrome.runtime.reload();
  //     }
  //     this.sendToCore(msg.type, msg.data, msg.promiseId);

  //   // Install onUpdate handlers by request from the UI.
  //   } else if ('on' == msg.cmd) {
  //     if (installedFreedomHooks.indexOf(msg.type) >= 0) {
  //       console.warn('[chrome ui connector] Freedom already has a hook for ' +
  //           uproxy_core_api.Command[msg.type]);
  //       return;
  //     }
  //     installedFreedomHooks.push(msg.type);
  //     // When it fires, send data back over Chrome App -> Extension port. Passing message directly
  //     // this.uProxyAppChannel_.on(msg.type.toString(), (ret :string) => {
  //     //   this.sendToUI(msg.type, ret);
  //     // });
  //   }
  // }

  public sendToCore = (msgType :uproxy_core_api.Command, data :Object,
                       promiseId :Number = 0) => {
    this.uProxyAppChannel_.emit(msgType.toString(),
                                {data: data, promiseId: promiseId});
  }

  // public sendToUI = (type :uproxy_core_api.Update, data?:Object) => {
  //   if (!this.extPort_) {
  //     console.error('Trying to send a message without the UI being connected');
  //     return;
  //   }

    // this.extPort_.postMessage({
    //     cmd: 'fired',
    //     type: type,
    //     data: data
    // });

  public setOnCredentials = (onCredentials:(credentials:Object) => void) => {
    this.onCredentials_ = onCredentials;
  }
}