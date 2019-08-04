sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"./LobBase.controller",
	"sap/ui/model/json/JSONModel",
	"../constants/Constants"
], function (Controller, LobBase, JSONModel ,Constants) {
	"use strict";

	return LobBase.extend("com.legstate.fts.app.FlightAcceptanceCockpit.controller.CargoCharges", {

		/**
		 * Called when a controller is instantiated and its View controls (if available) are already created.
		 * Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
		 * @memberOf com.legstate.fts.app.FlightAcceptanceCockpit.view.CargoCharges
		 */
		onInit: function () {
			var oViewModel = new JSONModel({
				busy: false,
				servicesBusy: false,
				delay: 0,
				title: ""
			});
			
			
			this.setModel(oViewModel, "cargoChargesView");

			this.getRouter().getRoute("CargoCharges").attachPatternMatched(this.handleRouteMatched, this);
			

			// store tab bar in object 
			this._oTabBar = this.getView().byId("TabBar");
			
			this.setupLobModel(
				this.getResourceBundle().getText("CD_INFO_PANEL_TITLE"),
				Constants.LobType.CARGO_DETAILS
			);			
			

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

		bindView: function (sObjectPath) {
			
			// TODO: Here we need to change FlightSegmentHeaderInboundPax and FlightSegmentHeaderOutboundPax
			// to the entities which are relatd to cargo details 
			this.loadServices(
				sObjectPath,
				"FlightSegmentItemSetCG,FlightSegmentHeaderInboundPax,FlightSegmentHeaderOutboundPax"
			);
		},
		
		toggleEditMode: function (oEvent) {
			// toggle edit mode
			var oLobModel = this.getModel("lobView");
			
			var isInEditMode = oLobModel.getProperty("/editMode");
			
			oLobModel.setProperty("/editMode", !isInEditMode);
		},		

		// onTabSelected: function (oEvent) {

		// 	var sBindingPath = "/" + this.sObjectPath;
		// 	var sSelectedKey = oEvent.getParameter("selectedKey");

		// 	// bind cargo details 
		// 	this._bindCargoDetails(sBindingPath, sSelectedKey);

		// 	// bind services 			
		// 	this._bindCargoServices(sBindingPath, sSelectedKey);

		// },

		_bindCargoDetails: function (sObjectPath, sSelectedTabKey) {

			// TODO: change the binding to point to cargo details endpoint
			// right now we show the passanger details 

			var sCargoDetailsFragmentId = undefined;
			var sBindingPath = "";

			// get passanger details fragement by selected tab 
			if (sSelectedTabKey === "ARR") {
				sCargoDetailsFragmentId = this.getView().createId("arrCargoDetails");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderInboundPax";
			} else if (sSelectedTabKey === "DEP") {
				sCargoDetailsFragmentId = this.getView().createId("depCargoDetails");
				sBindingPath = sObjectPath + "/FlightSegmentHeaderOutboundPax";
			}

			if (sCargoDetailsFragmentId === undefined) {
				return;
			}
			
			

			// get passanger details grid
			var oCargoDetailsGrid = sap.ui.core.Fragment.byId(sCargoDetailsFragmentId, "formPassDetails");

			// bind grid only when needed
			if (!oCargoDetailsGrid.getBindingContext()) {

				var oViewModel = this.getModel("cargoChargesView");

				// bind passanger details to odata model
				oCargoDetailsGrid.bindElement({
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