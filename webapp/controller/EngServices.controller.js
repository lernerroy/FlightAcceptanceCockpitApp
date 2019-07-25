sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./LobBase.controller",
	"sap/ui/model/json/JSONModel"
], function (Controller,LobBase, JSONModel) {
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

			this.getRouter().getRoute("EngServices").attachPatternMatched(this._onRouteMatched, this);

			// store tab bar in object 
			this._oTabBar = this.getView().byId("TabBar");
			
			var oLobView = new JSONModel({
				infoPanelTitle: this.getResourceBundle().getText("CD_INFO_PANEL_TITLE"),
				editMode: false
			});

			this.setModel(oLobView, "lobView");			
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

			// bind engineering services fragment 
			// TODO: use engineering services path here
			this.loadServices(sObjectPath + "/FlightSegmentItemSetCG");

		},	
		
		toggleEditMode: function (oEvent) {
			// toggle edit mode
			var oLobModel = this.getModel("lobView");
			
			var isInEditMode = oLobModel.getProperty("/editMode");
			
			oLobModel.setProperty("/editMode", !isInEditMode);
		},			

		/**
		 * Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
		 * (NOT before the first rendering! onInit() is used for that one!).
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.EngServices
		 */
		//	onBeforeRendering: function() {
		//
		//	},

		/**
		 * Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
		 * This hook is the same one that SAPUI5 controls get after being rendered.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.EngServices
		 */
		//	onAfterRendering: function() {
		//
		//	},

		/**
		 * Called when the Controller is destroyed. Use this one to free resources and finalize activities.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.EngServices
		 */
		//	onExit: function() {
		//
		//	}

	});

});