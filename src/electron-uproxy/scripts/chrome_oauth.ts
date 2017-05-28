/**
 * Chrome oauth provider
 **/

import * as uproxy_core_api from '../../interfaces/uproxy_core_api';
import ChromeConnector from './chrome_core_connector';
// TODO: change it to electron specifc and applying freedom-node module
export default class Chrome_oauth {
  // I don't think I still need this ChromeUIConnector
  constructor(private options_:{connector:ChromeConnector;}) {}

  public initiateOAuth(
      redirectURIs:{[urls:string]:string},
      continuation:(result:{redirect:string;state:string;}) => void) {
    // If we have uproxy.org pick that one,
    // otherwise pick the first http from the list.
    var redirect :string;
    for (var i in redirectURIs) {
      if (redirectURIs[i] === 'https://www.uproxy.org/oauth-redirect-uri') {
        redirect = redirectURIs[i];
        break;
      }

      if (redirect !== '' && (redirectURIs[i].indexOf('https://') === 0 ||
          redirectURIs[i].indexOf('http://') === 0)) {
        redirect = redirectURIs[i];
      }
    }

    if (redirect) {
      continuation({
        redirect: redirect,
        state: ''
      });
      return true
    }
    return false;
  }

  public launchAuthFlow(
      authUrl:string,
      stateObj:{redirect:string},
      interactive:boolean,
      continuation:(credentials:Object)=> void) {
    this.options_.connector.setOnCredentials(continuation);
  }

}  // class Chrome_oauth
