/// <reference path='../../generic_ui/polymer/context.d.ts' />

import * as background_ui from '../../generic_ui/scripts/background_ui';
import * as ui_model from '../../generic_ui/scripts/model';
import * as user_interface from '../../generic_ui/scripts/ui';
import CoreConnector from '../../generic_ui/scripts/core_connector';
import * as same_context_panel_connector from '../../generic_ui/scripts/same_context_panel_connector';
import { SameContextPanelConnector } from '../../generic_ui/scripts/same_context_panel_connector';
// TODO desktop core connector

export var ui : user_interface.UserInterface;
export var model : ui_model.Model;
var background_context : any = (<any>chrome.extension.getBackgroundPage()).ui_context;

export var PanelConnector : SameContextPanelConnector = new same_context_panel_connector.SameContextPanelConnector();