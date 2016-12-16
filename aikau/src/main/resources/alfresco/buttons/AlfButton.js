/**
 * Copyright (C) 2005-2016 Alfresco Software Limited.
 *
 * This file is part of Alfresco
 *
 * Alfresco is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Alfresco is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

/**
 * <p>This extends the default Dojo button to provide Alfresco specific styling. It also overrides
 * the [onClick]{@link module:alfresco/buttons/AlfButton#onClick} function to publish the
 * [publishPayload]{@link module:alfresco/buttons/AlfButton#publishPayload} on the
 * [publishTopic]{@link module:alfresco/buttons/AlfButton#publishTopic}</p>
 * <p>The following additionalCssClasses are built in and can be included if required:</p>
 * <ul>
 * <li><strong>call-to-action</strong>: The AlfButton is rendered in call-to-action colours</li>
 * <li><strong>primary-call-to-action</strong>: The AlfButton is rendered in primary-call-to-action colours</li>
 * <li><strong>biggerBolder</strong>: The AlfButton is rendered with a bigger, bold font</li>
 * </ul>
 *
 * @module alfresco/buttons/AlfButton
 * @extends module:dijit/form/Button
 * @mixes module:alfresco/core/Core
 * @mixes module:alfresco/renderers/_PublishPayloadMixin
 * @author Dave Draper
 */
define(["dojo/_base/declare",
        "dijit/form/Button",
        "alfresco/core/Core",
        "alfresco/renderers/_PublishPayloadMixin",
        "dojo/dom-class",
        "dojo/_base/array",
        "dojo/_base/lang",
        "dojo/_base/event"],
        function(declare, Button, AlfCore, _PublishPayloadMixin, domClass, array, lang, event) {

   return declare([Button, AlfCore, _PublishPayloadMixin], {

      /**
       * An array of the CSS files to use with this widget.
       *
       * @instance
       * @type {object[]}
       * @default [{cssFile:"./css/AlfButton.css"}]
       */
      cssRequirements: [{cssFile:"./css/AlfButton.css"}],

      /**
       * An array of the i18n files to use with this widget.
       *
       * @instance
       * @type {object[]}
       * @default [{i18nFile: "./i18n/AlfButton.properties"}]
       */
      i18nRequirements: [{i18nFile: "./i18n/AlfButton.properties"}],

      /**
       * Additional classes to be applied to the root DOM element.
       *
       * @instance
       * @type {string}
       * @default
       */
      additionalCssClasses: "",

      /**
       * Indicates whether or not the button should disable itself if any controls publish information indicating that
       * they are in an invalid state.
       *
       * @instance
       * @type {boolean}
       * @default
       */
      disableOnInvalidControls: false,

      /**
       * This will be updated on each button click with a new value if
       * [generateIdOnClick]{@link module:alfresco/buttons/AlfButton#generateIdOnClick} is configured
       * to be true.
       * 
       * @instance
       * @type {string}
       * @default
       * @since 1.0.102
       */
      generatedId: null,

      /**
       * Indicates whether a unique ID should be generated on each click. This ID will be assigned
       * to the [generatedId]{@link module:alfresco/buttons/AlfButton#generatedId} attribute. The purpose
       * of this capability is to allow an ID to be generated to be processed into the 
       * [publishPayload]{@link module:alfresco/buttons/AlfButton#publishPayload} when using the
       * [publishPayloadType]{@link module:alfresco/renderers/_PublishPayloadMixin#publishPayloadType} 
       * is configured to be "PROCESS" with the
       * [publishPayloadModifiers]{@link module:alfresco/renderers/_PublishPayloadMixin#publishPayloadModifiers}
       * containing the "processInstanceTokens" modifier.
       * 
       * @instance
       * @type {boolean}
       * @default
       * @since 1.0.102
       */
      generateIdOnClick: false,

      /**
       * This will be instantiated as an array and used to keep track of any controls that report themselves as being
       * in an invalid state. The button should only be enabled when this list is empty.
       *
       * @instance
       * @type {object[]}
       * @default
       */
      invalidControls: null,

      /**
       * The topic to listen to to determine when the button should be disabled
       *
       * @instance
       * @type {string}
       * @default
       */
      invalidTopic: "ALF_INVALID_CONTROL",

      /**
       * The topic to publish when the button is clicked
       *
       * @instance
       * @type {string}
       * @default
       */
      publishTopic: "",

      /**
       * The payload to publish when the button is clicked
       *
       * @instance
       * @type {object}
       * @default
       */
      publishPayload: null,

      /**
       * An optional title attribute to be added to the button.
       *
       * @instance
       * @type {string}
       * @default
       * @since 1.0.49
       */
      title: null,

      /**
       * An optional topic that can be provided that when published will call 
       * [onClick]{@link module:alfresco/buttons/AlfButton#onClick}.
       * 
       * @instance
       * @type {string}
       * @default
       * @since 1.0.86
       */
      triggerTopic: null,

      /**
       * This attribute has been provided primarily for use when configuring 
       * [widgetsAdditionalButtons]{@link module:alfresco/forms/Form#widgetsAdditionalButtons} in
       * a [form]{@link module:alfresco/forms/Form}. It is a simple marker indicating whether
       * or not the configured payload should be updated with additional data (such as the
       * form value) or if it should be left with the original data.
       * 
       * @instance
       * @type {boolean}
       * @default
       * @since 1.0.81
       */
      updatePayload: true,

      /**
       * The topic to listen to to determine when the button should be enabled
       *
       * @instance
       * @type {string}
       * @default
       */
      validTopic: "ALF_VALID_CONTROL",

      /**
       * Extends the default implementation to check that the [publishPayload]{@link module:alfresco/buttons/AlfButton#publishPayload} attribute has been set
       * to something other null and if it hasn't initialises it to a new (empty) object.
       *
       * @instance
       */
      postMixInProperties: function alfresco_buttons_AlfButton__postMixInProperties() {
         this.label = this.message(this.label);
         this.inherited(arguments);
         if (!this.publishPayload)
         {
            this.publishPayload = {};
         }
      },

      /**
       * Extends the default Dojo button implementation to add a widget DOM node CSS class to ensure that the
       * CSS selectors are matched.
       *
       * @instance
       */
      postCreate: function alfresco_buttons_AlfButton__postCreate() {
         this.inherited(arguments);
         domClass.add(this.domNode, "alfresco-buttons-AlfButton " + (this.additionalCssClasses || ""));

         if (this.disableOnInvalidControls === true)
         {
            this.invalidControls = [];
            this.alfSubscribe(this.invalidTopic, lang.hitch(this, "onInvalidControl"));
            this.alfSubscribe(this.validTopic, lang.hitch(this, "onValidControl"));
         }

         if (!this.value && this.publishTopic) {
            this.valueNode.setAttribute("value", this.publishTopic);
         }

         if (this.title) {
            this.focusNode.setAttribute("title", this.message(this.title));
         }

         if (this.triggerTopic)
         {
            this.alfSubscribe(this.triggerTopic, lang.hitch(this, this.onClick));
         }
      },

      /**
       * Cause this button to respond as if it had been clicked. The button will only 
       * act as though it has been clicked if it is not disabled when the function is called.
       *
       * @instance
       * @since 1.0.49
       */
      activate: function alfresco_buttons_AlfButton__activate() {
         if (this.get("disabled"))
         {
            this.alfLog("log", "Button not activated when disabled", this);
         }
         else
         {
            this.onClick();
         }
      },

      /**
       * Handles the reporting of an invalid field. This will disable the button to prevent users from clicking it.
       *
       * @instance
       * @param {object} payload The published details of the invalid field.
       */
      onInvalidControl: function alfresco_buttons_AlfButton__onInvalidControl(payload) {
         var alreadyCaptured = array.some(this.invalidControls, function(item) {
            return item === payload.name;
         });
         if (!alreadyCaptured)
         {
            this.invalidControls.push(payload.name);
         }
         this.set("disabled", "true");
      },

      /**
       * Handles the reporting of a valid field. If the field was previously recorded as being
       * invalid then it is removed from the [invalidControls]{@link module:alfresco/forms/Form#invalidControls}
       * attribute and it was the field was the only field in error then the "OK" button is
       * enabled.
       *
       * @instance
       * @param {object} payload The published details of the field that has become valid
       */
      onValidControl: function alfresco_buttons_AlfButton__onValidControl(payload) {
         this.invalidControls = array.filter(this.invalidControls, function(item) {
            return item !== payload.name;
         });
         this.set("disabled", this.invalidControls.length > 0);
      },

      /**
       * Handles click events to publish the [publishPayload]{@link module:alfresco/buttons/AlfButton#publishPayload}
       * on the [publishTopic]{@link module:alfresco/buttons/AlfButton#publishTopic}
       *
       * @instance
       * @param {object} evt The click event
       */
      onClick: function alfresco_buttons_AlfButton__onClick(evt) {
         var payload;
         if (this.publishTopic)
         {
            if (this.generateIdOnClick)
            {
               this.generatedId = this.generateUuid();
            }

            payload = this.generatePayload(this.publishPayload || {}, this.currentItem, null, this.publishPayloadType,
                    this.publishPayloadItemMixin, this.publishPayloadModifiers);
            this.alfPublish(this.publishTopic, 
                            payload, 
                            (this.publishGlobal !== undefined && this.publishGlobal === true), 
                            (this.publishToParent !== undefined && this.publishToParent === true));
         }
         else
         {
            this.alfLog("warn", "A widget was clicked but did not provide any information on how to handle the event", this);
         }
         if (evt && typeof evt.preventDefault === "function")
         {
            event.stop(evt);
         }
      }
   });
});