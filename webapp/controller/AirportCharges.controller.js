sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./LobBase.controller",
	"sap/ui/model/json/JSONModel",
	"sap/ui/model/Filter",
	"sap/ui/core/Fragment",
	"../constants/Constants",
	"com/legstate/fts/app/FlightAcceptanceCockpit/vendor/lodash.min",
	"sap/m/MessageBox"
], function (Controller, LobBase, JSONModel, Filter, Fragment, Constants, lodash, MessageBox) {
	"use strict";

	return LobBase.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.AirportCharges", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.AirportCharges
		 */
		onInit: function () {

			var oViewModel = new JSONModel({
				busy: false,
				delay: 0,
				title: ""
			});

			this.setModel(oViewModel, "airportChargesView");

			// setup			
			this.setupLobModel(
				this.getResourceBundle().getText("AC_INFO_PANEL_TITLE"),
				Constants.LobType.AIRPORT_CHARGES
			);

			this._oTabBar = this.getView().byId("TabBar");

			// handle routing 
			this.getRouter().getRoute("AirportCharges").attachPatternMatched(this.handleRouteMatched, this);
		},

		onBeforeRendering: function () {},

		bindView: function (sObjectPath) {
			this.loadServices(sObjectPath, "FlightSegmentItemSetAC,FlightSegmentHeaderInboundPax,FlightSegmentHeaderOutboundPax");
		},
		
		refreshFlightSegment: function(sObjectPath){
			this.loadServices(sObjectPath, "FlightSegmentItemSetAC,FlightSegmentHeaderInboundPax,FlightSegmentHeaderOutboundPax");
		},

		// onTabSelected: function (oEvent) {
			

		// 	var oLobModel = this.getLobModel();

		// 	// Save the tab key that the user want to see 
		// 	var sRequestedSelectedTabKey = oEvent.getParameter("selectedKey");

		// 	var self = this;

		// 	// If the user made changes to the flight 
		// 	// Present him a dialog that will ask him if he like 
		// 	// to: 1. Save the changes and continue, 2. Revert changes and continue
		// 	if (oLobModel.getData().entryHasChanged === true) {

		// 		MessageBox.alert("Do you want to save the document first?", {
		// 			title: "Leave Flight",
		// 			actions: [
		// 				MessageBox.Action.CANCEL,
		// 				MessageBox.Action.NO,
		// 				MessageBox.Action.YES
		// 			],
		// 			onClose: function (sAction) {
		// 				if (sAction === MessageBox.Action.YES) {
		// 					// TODO: Save entry and dequeue flight 
		// 				} else if (sAction === MessageBox.Action.NO) {
		// 					self.executeDequeueSegmentAction(function () {
		// 						self.getLobModel().setProperty("/entryHasChanged", false);
		// 						self._oTabBar.setSelectedKey(sRequestedSelectedTabKey);
		// 						self._handleTabSelection(sRequestedSelectedTabKey);
		// 					});
		// 				}
		// 			}
		// 		});

		// 		// cancel tab selection
		// 		this._oTabBar.setSelectedKey(this._sCurrentSelectedTabKey);

		// 	} else if (oLobModel.getData().entryIsLocked === true) {

		// 		this.executeDequeueSegmentAction(function () {
		// 			self._handleTabSelection(sRequestedSelectedTabKey);
		// 		})

		// 	} else {
		// 		this._handleTabSelection(sRequestedSelectedTabKey);
		// 	}
		// },

		// _handleTabSelection: function (sSelectedTabKey) {

		// 	var sBindingPath = "/" + this.sObjectPath;

		// 	// Disable edit model when we move to another tab
		// 	this.getLobModel().setProperty("/editMode", false);

		// 	// bind passanger details 
		// 	// this._bindPassangerDetails(sBindingPath, sSelectedTabKey);

		// 	this.renderServicesByDirection();

		// 	// Save the current selected tab
		// 	this._sCurrentSelectedTabKey = sSelectedTabKey;
		// },

		_bindPassangerDetails: function (sObjectPath, sSelectedTabKey) {

			var sPassangerDetailsFragmentId = undefined;
			var sBindingPath = "";

			// get passanger details fragement by selected tab 
			if (sSelectedTabKey === "ARR") {
				sPassangerDetailsFragmentId = this.getView().createId("arrPassangerInfoFragment");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderInboundPax";
			} else if (sSelectedTabKey === "DEP") {
				sPassangerDetailsFragmentId = this.getView().createId("depPassangerInfoFragment");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderOutboundPax";
			}

			if (sPassangerDetailsFragmentId === undefined) {
				return;
			}

			// get passanger details grid
			var oPassangerDetailsGrid = sap.ui.core.Fragment.byId(sPassangerDetailsFragmentId, "formPassDetails");

			if (!oPassangerDetailsGrid) {
				return;
			}

			// bind grid only when needed
			if (!oPassangerDetailsGrid.getBindingContext()) {

				var oViewModel = this.getModel("airportChargesView");

				// bind passanger details to odata model
				oPassangerDetailsGrid.bindElement({
					path: sBindingPath,
					events: {
						change: function (oEvent) {},
						dataRequested: function (oEvent) {
							oViewModel.setProperty("/busy", true);
						},
						dataReceived: function (oEvent) {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			}
		}
	});

});