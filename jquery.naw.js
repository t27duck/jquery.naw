// NaW (Not a WYSIWYG) v1.0.3 - creates a customizable toolbar over a textarea for easy HTML Tag, BBCode, etc. editing.
// (c) 2011 Tony Drake - www.t27duck.com - t27duck@gmail.com
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
(function($){
 $.fn.naw = function(options) {
  var defaults = {
    toolbar: {
      "buttons" : []
    }
  };
  var options = $.extend(defaults, options);

  // Public functions
  this.appendText = function(jelm, startTag, endTag) { 
    // Convert the jQuery elm to the equivilent of getElementById
    elm = $(jelm).get(0);
    if (endTag === undefined) {
      var endTag = '';
    }
    if (document.selection) { // code for IE
      elm.focus();
      var sel = document.selection.createRange();
      sel.text = startTag + sel.text + endTag;
    } else { // code for everyone else
      var len = elm.value.length;
      var start = elm.selectionStart;
      var end = elm.selectionEnd;
      var sel = elm.value.substring(start, end);
      var replace = startTag + sel + endTag;
      elm.value =  elm.value.substring(0,start) + replace + elm.value.substring(end,len);
    }
  };
  
  // Main return function
  return this.each(function() {
    obj = $(this);
    objDom = this;
    // Wrap the textarea in a div, select it for use later...
    obj.wrap('<div class="naw-wrapper" />');
    var wrapper = obj.parent();
    
    // Create a div to hold the toolbar buttons
    var toolbardiv = document.createElement("div");
    $(toolbardiv).attr("class", "naw-toolbar");
    wrapper.prepend(toolbardiv);
    toolbardiv = $(toolbardiv);
    
    // Load up the toolbar buttons
    for(x = 0; x < options.toolbar.buttons.length; x++) {
      if (options.toolbar.buttons[x] !== undefined) {
        var buttonjson = options.toolbar.buttons[x];
        switch (buttonjson.type) {
        case "break": // New line of toolbar buttons
          toolbardiv.append("<br />");
          break;
        case "select": // Select drop down
          var select = document.createElement("select");
          $(select).attr("class", "naw-toolbar-select");
          var option = document.createElement("option");
          $(option).attr("value", '');
          $(option).html(buttonjson.label);
          $(select).append(option);
          for(y = 0; y < buttonjson.options.length; y++) {
            if (buttonjson.options[y] !== undefined) {
              var option = document.createElement("option");
              $(option).attr("value", buttonjson.options[y].value);
              $(option).html(buttonjson.options[y].display);
              $(select).append(option);
            }
          }
          toolbardiv.append(select);
          var button = document.createElement("a");
          $(button).attr("href", "#");
          $(button).attr("class", "naw-toolbar-button");
          $(button).html('Select');
          $(button).attr("data-button-id", x);
          toolbardiv.append(button);
          break;
        default: // Everything else
          var button = document.createElement("a");
          $(button).attr("href", "#");
          $(button).attr("class", "naw-toolbar-button");
          $(button).html(buttonjson.label);
          $(button).attr("data-button-id", x);
          toolbardiv.append(button);
        }
      }
    }

    toolbardiv.after('<div style="clear: both;"></div>');
    
    // Click event for a toolbar button
    $(".naw-toolbar-button", toolbardiv).click(function(event) { 
      var elm = $(this).parent().parent().children("textarea");
      var button = options.toolbar.buttons[$(this).attr("data-button-id")];
      switch(button.type) {
        case "tag": // Inserting text before and (optionally) after the selected text
          $.fn.naw().appendText(elm, button.opentag, button.closetag);
          break;
        case "function": // Call a function, pass the textarea, and put the returned text or array of text into the editor
          returnvalue = window[button.func](elm);
          if (typeof(returnvalue) == "object" && returnvalue.length) { // Array
            $.fn.naw().appendText(elm, returnvalue[0], returnvalue[1]);
          } else {
            $.fn.naw().appendText(elm, returnvalue);
          }
          break;
        case "function_noreturn": // Call a function, pass the textarea, and don't do anything
          window[button.func](elm);
          break;
        case "select": // Call a function. Pass the textarea and the selected value from the near-by select box
          window[button.func](elm, $(this).prev().val());
          break;
      }
      event.preventDefault();
    });
  });
 };
})(jQuery);
