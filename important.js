'use strict';

/*!
* !important
*   github.com/premasagar/mishmash/tree/master/important/
*
*//*
    css !important manipulator (native JS + jQuery plugin)

    by Premasagar Rose
        dharmafly.com

    license
        opensource.org/licenses/mit-license.php
        
    v0.1

*//*
    creates methods
        jQuery(elem).important(method, [args])
        jQuery.important.noConflict
    
    overrides native jQuery methods for css(), width(), height(), animate(), show() and hide(), allowing an optional last argument of boolean true, to pass the request through the !important function
    
    use jQuery.important.noConflict() to revert back to the native jQuery methods, and returns the overriding methods

*/
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
                    }
                    
                    // TODO: other methods to be supported
                    /*,
	            
	                width: function(){},
	                height: function(){},
	                show: function(){},
	                hide: function(){},
	                animate: function(){}
	                */
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
}(jQuery));
