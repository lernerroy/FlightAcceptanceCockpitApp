sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./LobBase.controller",
	"sap/ui/model/json/JSONModel",
	"../constants/Constants"
], function (Controller,LobBase, JSONModel, Constants) {
	"use strict";

	return LobBase.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.EngServices", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.EngServices
		 */
		onInit: function () {
			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				title: ""
			});

			this.setModel(oViewModel, "engServicesView");
			
					// setup			
			this.setupLobModel(
				this.getResourceBundle().getText("AC_INFO_PANEL_TITLE"),
				Constants.LobType.AIRPORT_CHARGES
			);


			this.getRouter().getRoute("EngServices").attachPatternMatched(this.handleRouteMatched, this);
			
			this._oTabBar = this.getView().byId("TabBar");

			// // store tab bar in object 
			// this._oTabBar = this.getView().byId("TabBar");
			
			// var oLobView = new JSONModel({
			// 	infoPanelTitle: this.getResourceBundle().getText("CD_INFO_PANEL_TITLE"),
			// 	editMode: false
			// });

			// this.setModel(oLobView, "lobView");			
		},
		
		_onRouteMatched: function (oEvent) {

			// make sure we unbind data in order to make sure
			// we always get the latest data 
			this.unbindData();

			var args = oEvent.getParameter("arguments");

			this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");

			this.getModel().metadataLoaded().then(function () {
				var sObjectPath = this.getModel().createKey("FlightSegmentHeaderSet", {
					Preaufnr: args.objectId,
					Aufnr: args.flightNo
				});

				this._bindView("/" + sObjectPath);

				this.sObjectPath = sObjectPath;

				this.getOwnerComponent().oListSelector.selectAListItem("/" + sObjectPath);
			}.bind(this));
		},	
		
		_bindView: function (sObjectPath) {

			this.loadServices(sObjectPath + "/FlightSegmentItemSetCG");

		},	
		
		toggleEditMode: function (oEvent) {
			// toggle edit mode
			var oLobModel = this.getModel("lobView");
			
			var isInEditMode = oLobModel.getProperty("/editMode");
			
			oLobModel.setProperty("/editMode", !isInEditMode);
		},	
		
		bindView: function (sObjectPath) {
			
			this.loadServices(
				sObjectPath,
				"FlightSegmentItemSetEG"
			);
		}

	});

});