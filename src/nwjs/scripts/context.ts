/// <reference path='../../generic_ui/polymer/context.d.ts' />

import * as background_ui from '../../generic_ui/scripts/background_ui';
import * as ui_model from '../../generic_ui/scripts/model';
import * as user_interface from '../../generic_ui/scripts/ui';
import CoreConnector from '../../generic_ui/scripts/core_connector';
import * as same_context_panel_connector from '../../generic_ui/scripts/same_context_panel_connector';
import { SameContextPanelConnector } from '../../generic_ui/scripts/same_context_panel_connector';
import { DesktopCoreConnector} from './desktop_core_connector';

export var browserConnector : DesktopCoreConnector = new DesktopCoreConnector({
    name: 'uproxy-ui-to-core-connector'
})
export var core = new CoreConnector(browserConnector);
export var ui : user_interface.UserInterface;
export var model : ui_model.Model;

export var panelConnector : SameContextPanelConnector = new same_context_panel_connector.SameContextPanelConnector();
var backgroundUi = new background_ui.BackgroundUi(panelConnector, core);

chrome.runtime.getBackgroundPage((bgPage) =>{
    var ui_context = (<any>bgPage).ui_context;
    ui = new user_interface.UserInterface(core, ui_context.browserApi, backgroundUi);
    model = ui.model;
});
