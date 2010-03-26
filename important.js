// $.important('css', {border:'1px solid red'});
// $.important.noConflict(); // releases overriden methods; returns methods as property of an object
// $.important(true); // toggle overriden state -> on
// $.important(false); // toggle overrident state -> off; identical to $.important.noConflict();
// $.important('animate', {padding:75}, 'slow');
// $.important({padding:'75px'}); // uses default 'css' method
// $.important(); // returns current on or off state
// $.important = override({css:function(), animate:function()});



(function($){
    // create CSS text from key + value, and optionally the existing cssText
    function cssText(key, value, css){ // if value === null, then remove from style; if style then merge with that
        var rule = (value !== null) ?
            key + ':' + value + ' !important;' :
            '';
            
        css = css || '';
        
        if (css.toLowerCase().indexOf(key.toLowerCase()) !== -1){
            css = css.replace(new RegExp(key + '\\s*:\\s*[^;]*(;|$)', 'i'), rule);
        }
        else {
            css = $.trim(css); // TODO: replace with native JS trim
            if (css !== ''){
	            if (css.slice(-1) !== ';'){
		            css += ';';
	            }
	            css += ' ';
            }
            css += rule;
        }
        return css;
    }
    
    // **
    
    var
        original = {},
        wrapper = {},
        replacement = $.each(
	        {
	            css:
                    function(key, value){
	                    var
	                        rules = {},
	                        elem = $(this),
	                        style = elem.attr('style');
	
	                    // Create object, if arg is a string
	                    if (typeof key === 'string'){
		                    rules[key] = value;
	                    }
	                    else if (typeof key === 'object'){
	                        rules = key;
	                    }
	                    else {
	                        return elem;
	                    }
	                    $.each(rules, function(key, value){
	                        style = cssText(key, value, style);
	                    });
	                    return elem.attr('style', style);
                    },
	            
	                width: function(){},
	                height: function(){},
	                show: function(){},
	                hide: function(){},
	                animate: function(){}
	        },
	        
	        function(method, fn){
	            original[method] = $.fn[method];
	            fn.overridden = true; // for detecting replacementn state
	        
	            wrapper[method] = function(){
	                var
	                    args = $.makeArray(arguments),
	                    elem = $(this);
	                    
	                return (args[args.length-1] === true) ?
                        fn.apply(elem, args.slice(0,-1)) :
                        original[method].apply(elem, args); 
	            };
	        }
	    );
	
	// Override the native jQuery methods with new methods
	$.extend($.fn, wrapper);
	    
	
	// jQuery(elem).important()
	$.fn.important = function(method){
        var
            elem = $(this),
            args = $.makeArray(arguments).concat(true);
        
        // .css() is the default method, e.g. $(elem).important({border:'1px solid red'});
        if (typeof method === 'object'){
            method = 'css';
        }
        else {
            args = args.slice(1);
        }
        
        if (wrapper[method]){
            wrapper[method].apply(elem, args);
        }        
        return elem;
    };
    
    // jQuery.important
    $.important = {
        // release native jQuery methods back to their original versions and return overriding methods
        noConflict: function(){
            $.each(original, function(method, fn){
                $.fn[method] = fn;
            });
            return replacement;
        }
    };
        
        // e.g. jQuery(elem).cleanslate('css', {border:'red'}) === jQuery(elem).css({border:'red'}, true) === jQuery(elem).attr({style:'border:red!important;'});
}(jQuery));

// **

// TESTS
var elem = $('<div style="padding:1em"></div>').appendTo('body');
elem.important('css', {border:'1px solid red', padding:'10px'});
console.log(jQuery.important, elem, elem.important, elem.attr('style'));
