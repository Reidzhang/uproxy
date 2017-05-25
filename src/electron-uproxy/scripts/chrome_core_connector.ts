/**
 * chrome_core_connector.ts
 *
 * Handles all connection and communication with the uProxy Chrome App.
 */
import * as browser_connector from '../../interfaces/browser_connector';
import * as uproxy_core_api from '../../interfaces/uproxy_core_api';
import * as uproxy_chrome from '../../interfaces/chrome';

var SYNC_TIMEOUT         :number = 1000;  // milliseconds.

import * as user_interface from '../../generic_ui/scripts/ui';

// See the ChromeCoreConnector, which communicates to this class.
var installedFreedomHooks :number[] = [];
/**
 * Chrome-Extension-specific uProxy Core API implementation.
 *
 * This class hides all cross App-Extension communication wiring so that the
 * uProxy UI may speak through this connector as if talking directly to Core.
 *
 * Propagates these messages:
 *    Core --[ UPDATES  ]--> UI
 *    UI   --[ COMMANDS ]--> Core
 *
 * Whilst disconnected, this continuously polls Chrome for the existence of the
 * uProxy App, and automatically reconnects if possible. This is designed such
 * that the user (which is the Extension / UI) won't have to deal with
 * connectivity explicitly, but has the option to chain promises if desired.
 */
export default class ChromeCoreConnector implements browser_connector.CoreBrowserConnector {
  
  private onCredentials_ :(credentials?:Object, error?:Object) => void;
  private queue_   :browser_connector.Payload[];  // Queue for outgoing appPort_ msgs.

  // Status object indicating whether we're connected to the app.
  // TODO: Since this is equivalent to whether or not appPort_ is null, we
  // should probably consider turning it into a function, while at the same time
  // preserving potential data bindings.
  public status :browser_connector.StatusObject;

  // A freedom-type indexed object where each key provides a list of listener
  // callbacks: e.g. { type1 :[listener1_for_type1, ...], ... }
  // TODO: Replace with Core -> UI specified update API.
  private listeners_ :{[type :string] : Function};

  private fulfillConnect_ :Function;
  public onceConnected :Promise<void> = new Promise<void>((F, R) => {
    this.fulfillConnect_ = F;
  });

  /**
   * As soon as one constructs the CoreBrowserConnector, it will attempt to connect.
   */
  constructor(private uProxyAppChannel_: freedom.OnAndEmit<any, any>) {
    this.status = { connected: true };
  }


  // --- Connectivity methods ---

  /**
   * Connect the Chrome Extension to the Chrome App, and continues polling if
   * unsuccessful.
   *
   * Returns a promise fulfilled with the Chrome port upon connection.
   */
  /** 
  public connect = () : Promise<void> => {
    console.log('trying to connect to app');
    if (this.status.connected) {
      console.warn('Already connected.');
      return Promise.resolve();
    }

    return this.connect_().then(this.flushQueue).then(() => {
      // Connect/reconnect listeners to app.  These will not have been queued,
      // in order to prevent duplicate requests, and will need to be re-sent
      // after each successful reconnection to the app.
      for (var type in this.listeners_) {
        // Convert type from string back to number (uproxy_core_api.Update enum) for
        // payload to app.
        var payload = {
          cmd: 'on',
          type: parseInt(type, 10)
        };
        console.log('Connecting listener for', JSON.stringify(payload));
        this.send(payload);
      }

      this.emit('core_connect');
    });
  }*/

  public connect = () :Promise<void> => {
    this.emit('core_connect');
    this.onceConnected = Promise.resolve();
    return Promise.resolve();
  }


  // --- Communication ---
  /**
   * Attach handlers for updates emitted from the uProxy Core.
   */
  public onUpdate = (update :uproxy_core_api.Update, handler :Function) => {
    var type = '' + update;
    var alreadyHooked = typeof this.listeners_[type] !== 'undefined';
    // This is called every time we open a popup in chrome.
    // New handlers need to replace old handlers.
    this.listeners_[type] = handler;
    if (!alreadyHooked) {
      var payload = {
        cmd: 'on',
        type: update
      };
      // This log floods the console during testing. Uncomment for debugging.
      // console.log('UI onUpdate for', JSON.stringify(payload));
      this.send(payload);
    }
  }

  /**
   * Send a payload to uProxyApp through uProxyAppChannel, which is exported on mian.core-env.ts
   */
  public send = (payload :browser_connector.Payload) => {
    if (payload.type == uproxy_core_api.Command.SEND_CREDENTIALS) {
      this.onCredentials_(payload.data);
    } else if (payload.type == uproxy_core_api.Command.CREDENTIALS_ERROR) {
      this.onCredentials_(undefined, payload.data);
    }
    this.sendToCore_(payload.type, payload.data, payload.promiseId);
  }

  private sendToCore_ = (msgType :uproxy_core_api.Command, data :Object,
                       promiseId :Number = 0) => {
    this.uProxyAppChannel_.emit(msgType.toString(),
                                {data: data, promiseId: promiseId});
  }

  /**
   * Receive messages from the chrome.runtime.Port.
   * These *must* some form of uproxy_core_api.Update.
   */
  private receive_ = (msg :{type :string; data :any}) => {
    if (msg.type in this.listeners_) {
      this.listeners_[msg.type](msg.data);
      // TODO: Fire a DOM update? Decide if this should happen here or during a
      // ui.sync call.
    }
  }

  public restart() {
    var restart :browser_connector.Payload = {
      cmd: 'emit',
      type: uproxy_core_api.Command.RESTART,
      promiseId: 0
    }
    this.send(restart);
    chrome.runtime.reload();
  }

  private events_ :{[name :string] :Function} = {};

  public on = (name :string, callback :Function) => {
    this.events_[name] = callback;
  }

  private emit = (name :string, ...args :Object[]) => {
    if (name in this.events_) {
      this.events_[name].apply(null, args);
    }
  }

  public setOnCredentials = (onCredentials:(credentials:Object) => void) => {
    this.onCredentials_ = onCredentials;
  }
}  // class ChromeConnector
