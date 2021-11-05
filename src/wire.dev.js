
if (!window.jQuery) 
    throw 'JQuery required for WireBootstrap library';


var wire = {

    // PrimitiveReference: function (obj) {
    //     // new PrimitiveReference(options.schema.name);
    //     this.set = function (val) {
    //         obj.valueOf = obj.toSource = obj.toString = function () { return val };
    //     }
    // },

    post: function (url, data, options) {

        if (options && options.__wire_RequestId)
            $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
                jqXHR.__wire_RequestId = options.__wire_RequestId;
            })

        var o = $.extend({
            url: url,
            type: 'POST',
            processData: false, 
            //contentType: false,
            contentType: 'application/json; charset=utf-8',
            data: data == null ? null : JSON.stringify(data)
        }, options);
        return $.ajax(o);
    },

    postWait: function (url, data, options) {
        var _d;
        var _e;
        var o = $.extend({
            url: url,
            type: 'POST',
            async: false,
            contentType: 'application/json; charset=utf-8',
            dataType: 'json',
            data: data == null ? null : JSON.stringify(data),
            success: function (d) {
                _d = d;
            },
            error: function (r, s, e) {
                if (typeof r.responseJSON == "object")
                    _e = r.responseJSON;
                else if (typeof r.responseJSON == "string")
                    _e = $.parseJSON(r.responseJSON);
                else if (r.responseText)
                    _e = $.parseJSON(r.responseText);
                else
                    _e = "";
            }
        }, options);
        $.ajax(o);
        if (_e)
            throw _e;
        else
            return _d;
    },

    get: function (url, options) {
        var o = $.extend({
            url: url,
            type: 'GET',
            dataType: 'json'
        }, options);
        return $.ajax(o);
    },

    getWait: function (url, options) {
        var _d;
        var _e;
        var o = $.extend({
            url: url,
            type: 'GET',
            async: false,
            dataType: 'json',
            success: function (d) {
                _d = d;
            },
            error: function (r, s, e) {
                if (typeof r.responseJSON == "object")
                    _e = r.responseJSON;
                else if (typeof r.responseJSON == "string")
                    _e = $.parseJSON(r.responseJSON);
                else if (r.responseText)
                    _e = $.parseJSON(r.responseText);
                else
                    _e = "";
            }
        }, options);
        $.ajax(o);
        if (_e)
            throw _e;
        else
            return _d;
    },

    expression: new function () {
        var self = this;
        this.eval = function (t, r, i, d) { // row, index, data
            var s = null;
            if (t) {
                if (typeof t == 'function') { s = t(r, i, d); }
                else {
                    s = t;
                    if (s.substring(0, 2) == "({") {
                        s = t.substring(1).substring(1, t.length - 3);
                        //({r.x})
                        var fn = "function f($row,$index,$data){return " + s + "}";
                        eval(fn);
                        s = f(r, i, d);
                    }
                    else
                        if (t.indexOf("{") > -1)
                            for (var prop in r) {
                                s = s.replace("{" + prop + "}", r[prop]);
                            }
                }
            }
            return typeof s == 'undefined' ? t : s;
        }
    },

    Collection: function (key, collection) {
        var self = this;
        var col = collection || [];
        this.sort = function (prop) {
            col.sort((a, b) => (a[prop] > b[prop]) ? 1 : -1);
        }        
        this.length = function () {
            return col.length;
        }
        this.array = function () {
            return col;
        }
        this.set = function (v) {
            this.add(v);
        }
        this.add = function (v) {

            var vs = [];
            
            if(Array.isArray(v))
                vs = v;
            else 
                vs = [v];

            vs.forEach(function(_v){

                var i = self.index(_v[key]);

                if (i > -1)
                    col[i] = _v;
                else
                    col.push(_v);
                    
            });

            return v;
            
        }

        this.clear = function () {
            col = [];
        }
                
        this.move = function(fromIndex, toIndex){
            col.splice(toIndex, 0, col.splice(fromIndex, 1)[0]);                
        }
        
        this.remove = function (v) {
            var i = self.index(typeof v == 'string' ? v : v[key]);
            if (i > -1) col.splice(i, 1);
        }
        this.get = function (k) {
            var i = self.index(k);
            return (i > -1) ? col[i] : null;
        }
        this.index = function (k) {
            var _i = -1;
            $.each(col, function (i, c) {
                if (c[key]+"".toLowerCase() == k+"".toLowerCase()) {
                    _i = i;
                    return false;
                }
            });
            return _i;
        }
    },

    merge: function (target, source, onlyFunctions) {
        for (var prop in source)
            if (prop in target && typeof target[prop] == 'object' && !Array.isArray(target[prop]) && target[prop] != null){
                wire.merge(target[prop], source[prop], onlyFunctions);
            }
            else
                if(wire.toBoolean(onlyFunctions, false)) {
                    if(typeof source[prop] == "function")
                        target[prop] = source[prop];
                }
                else
                    target[prop] = source[prop];
        return target;
    },  

    deepClone: function (target, source) {
       return wire.merge(target, source);
    },

    copyJSON: function(source){
        return JSON.parse(JSON.stringify(source));
    },
    
    // deepCopy: function (source) {
    //     return JSON.parse(JSON.stringify(source));
    // },

    // deepClone: function (target, source) {
    //     for (var prop in source)
    //         if (prop in target && typeof target[prop] == 'object') //typeof target[prop] != 'undefined'
    //             wire.deepClone(target[prop], source[prop]);
    //         else
    //             target[prop] = source[prop];
    //     return target;
    // },

    isNumeric: function (n) {
        if (n)
            return !isNaN(parseFloat(n)) && isFinite(n);
        else
            return false;
    },

    toBoolean: function (value, defaultValue) {
        if (typeof value == 'boolean') return value;
        if (value == null | typeof value == 'undefined') return defaultValue;
        if (typeof value == 'object') return true;
        if(value == 1) return true;
        switch ((value + "").toLowerCase()) {
            case "true": case "yes": case "1": return true;
            case "false": case "no": case "0": case null: return false;
            default: return defaultValue || Boolean(value);
        }
    },

    isBoolean: function (value) {
        if (typeof value == 'boolean') return true;
        if (value == null | typeof value == 'undefined') return false;
        if (typeof value == 'object') return false;
        if(value == 1) return true;
        switch (value+"".toLowerCase()) {
            case "true": case "yes": case "false": case "no": return true;
            default: false
        }
    },

    // backwards compatable
    Format: function (value, template, data) {
        return wire.format(value, template, data);
    },
    
    format: function (value, template, data) {

        /*
            template: {}
            template: "#,0.00"           
        */

        if (!template || typeof value == "undefined") return value;        

        var v = value;

        switch (typeof template) {

            case "string":

                /*
        
                    100,000
                    "#,##0.00";
                    "#,0.00
                    $#,##0;($#,##0)
        
                    Format="S"
                    N2
        
                */

                var t = template;
                var p = t.substring(1, 3);

                switch (t.substring(0, 1) + "".toUpperCase()) {

                    case "U":
                        v = v.toUpperCase();
                        break;

                    case "N":
                        if (wire.isNumeric(v))
                            v = toNumber(v, p);
                        break;

                    case "C":
                        if (wire.isNumeric(v)) {
                            v = toNumber(v, p);
                            v = "$" + v;
                        }                        
                        break;
                    case "P":
                        if (wire.isNumeric(v)) {
                            v = (v * 100);
                            v = toNumber(v, p);
                            v = v + "%";
                        }
                        break;
                    case "D":

                        var date = new Date(v);
                        v = new Intl.DateTimeFormat().format(date);

                }

            break;

            case "object":

                var options = wire.merge({ locale: "en-US", style: "decimal" }, template);
                v = new Intl.NumberFormat(options.locale, options).format(v);

            break;

            case "function":
                v = template(value, data);

            break;

        }

        return v;

        function toNumber(num, p) {
//            return new Number(num).toFixed(p).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
            return new Number(num).toFixed(p).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ","); 
        }

        //function currencyFormat(num) {
        //    return "$" + num.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
        //}


        //function toCurrency(amount) {
        //    return amount.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
        //}


    },

    guid: function () {
        function S4() {
            return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        }
        return (S4() + S4() + "-" + S4() + "-4" + S4().substr(0, 3) + "-" + S4() + "-" + S4() + S4() + S4()).toLowerCase();
    },

    guidDom: function () {
        var g = wire.guid();
        return g.replaceAll("-", "_");
    },

    download: function (config) {


        // config = {fileName, responseType, contentType, data, url }

        xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function () {
            var a;
            if (xhttp.readyState === 4) {
                if (xhttp.status === 200) {
                    a = document.createElement('a');
                    a.href = window.URL.createObjectURL(xhttp.response);
                    a.download = config.fileName || "file.txt";
                    a.style.display = 'none';
                    document.body.appendChild(a);
                    a.click();
                    if (config.done)
                        config.done(xhttp);
                }
                else {
                    if (config.fail)
                        config.fail({ status: xhttp.status, statusText: xhttp.statusText, message: "Error {0} - {1}. See network call to {2} for details.".format(xhttp.status, xhttp.statusText, xhttp.responseURL) }, xhttp);
                }
                if (config.finally)
                    config.finally(xhttp);
            }
        };

        xhttp.responseType = config.responseType || "blob";
        let body = null;

        if (config.data) {
            xhttp.open("POST", config.url);
            // sensitive: true;
            xhttp.setRequestHeader("Content-Type", config.contentType || "application/json; charset=utf-8");
            body = JSON.stringify(config.data);
        }
        else {
            xhttp.open("GET", config.url);
        }

        xhttp.send(body);

    },    

    location: new function () {

        var self = this;
        var query = null; 

        this.pageName = function () {

            var path = window.location.pathname;
            var page = path.split("/").pop();
            return page;
    
        }

        this.scriptPath = function(name){
            
            var script = $("script[name='{0}'".format(name));
            var path = "";

            if(script.length){
                var p = script.get(0);
                p = p.src;
                p = p.split("/");
                p.pop();
                path = p.join("/");
            }

            return path;
        }

        this.currentScript = function(){
            var p = "";
            if(document.currentScript) {
                p = document.currentScript.src;
                p = p.split("/");
                p.pop();
                p = p.join("/");
            }
            return p;
        }

        this.path = function(path){
            //  /path?param1=1
            query = path.split("?")[1];
            return self;
        }

        this.removeParam = function (param) {

            let url = new URL(window.location.href);
    
            url.searchParams.delete(param);
    
            return url.href;
        }

        this.param = function (param) {

            // window.location.search.slice = ?user=72450
            // window.location.search.slice(1) = user=72450
            // window.location.hash = #/compliance-active-deals?user=54583
            /// window.location.hash.slice(1) = compliance-active-deals?user=54583

            if(!query) {
                if (window.location.hash && window.location.hash.indexOf("?") > -1)                    
                    query = window.location.hash.substring(window.location.hash.indexOf("?"));                
                else
                    query = window.location.search;

                query = query.slice(1);
            }

            var s1 = query.split("&");
            var v = null;
            s1.some(function (p) {
            var s2 = p.split("=");
            if (s2[0].trim().toLowerCase() == param.toLowerCase()) { v = s2[1]; }
            return v != null;
            });
            return (v && v != "undefined") ? v : null;
        }

        this.baseUrl = function () {
            // //server/path/file.html => //server/path
            var re = new RegExp(/^.*\//);
            return re.exec(window.location.href)[0];
        }

    },
    
    //QueryString
    // location: new function () {
        
    //     var self = this;
    //     var script = document.currentScript;
    //     var qs = window.location.search.slice(1);

    //     this.currentScript = function(){
    //         return self.path(script.src);
    //     }
        
    //     this.path = function(path){
    //         //  /path?param1=1
    //         qs = path.split("?")[1];
    //         return self;
    //     }

    //     this.param = function (param) {
    //         var s1 = qs.split("&");
    //         var v = null;
    //         s1.some(function (p) {
    //             var s2 = p.split("=");
    //             if (s2[0].trim().toLowerCase() == param.toLowerCase()) { v = s2[1]; }
    //             return v != null;
    //         });
    //         return (v && v != "undefined") ? v : null;
    //     }
    // },

    when: function (count, callback){

        // var done = wire.when(2, cb); 
        // someprogram(done)
        // otherpgoram(done)
    
        var i = 0
    
        return function(d){
    
            i += 1
    
            // callback immediatly if sending failed response
            if (typeof d === "boolean" && !d)
                i = count;
    
            if(i==count && callback)
                callback(d);
        }
    
    },

    loadCss: function (style, cb) {

        var css;

        if (typeof style == 'string') css = style;
        else {
            css = style.css;
            // if hidden, stylesheet is already loaded
            if (hidden(style.hidden)) {
                if (cb) cb();
                return;
            }
        }

        if (css.indexOf(".css") == -1) return;

        var head;
        // in iframe?
        if(( window.self !== window.top ))                
            head = window.frameElement.contentDocument;
         else   
            head = document;

        head = head.getElementsByTagName('head')[0];        

        var s = document.createElement('link');
        s.setAttribute('rel', 'stylesheet');
        s.setAttribute('href', css);
        if (cb) {
            var r = false;
            s.onload = s.onreadystatechange = function () {
                if (!r && (!this.readyState || this.readyState == 'complete' || this.readyState == 'loaded')) {
                    r = true; cb();
                }
            };
        }        
        
        s.onerror = function(){
            if(cb)cb();
        }
        head.appendChild(s);
        
        function hidden(hidden) {
            var s = $("<span class='{0}'></span>".format(hidden));
            var b = $('body').append(s).find(hidden);
            var h = (b.css("display") == "none")
            b.remove();
            return h;
        }
    },

    loadJs: function (scripts, cb) {

        if (!Array.isArray(scripts)) scripts = [scripts];

        var i = 0;
        scripts.forEach(function (script) {

            var load = true;
            var js;
            var sname;

            if (typeof script == 'string')
                js = script;
            else {
                js = script.js;
                load = script.load;
                sname = script.name;
            }

            if (!load) {
                i += 1
                if (i == scripts.length && cb) cb();
            }
            else {
                var names = js.split("/");
                var name = js.split("/")[names.length - 1];
                var head;
                // in iframe?
                if(( window.self !== window.top ))                
                    head = window.frameElement.contentDocument;
                 else   
                    head = document;
        
                head = head.getElementsByTagName('head')[0];       

                var s = document.createElement('script');
                s.setAttribute('type', 'text/javascript');
                s.setAttribute('src', js);
                if(sname) s.setAttribute('name', sname);
                if (cb) {
                    s.onload = s.onreadystatechange = function () {
                        if (!this.readyState || this.readyState == 'complete' || this.readyState == 'loaded') {
                            i += 1
                            if (i == scripts.length && cb) cb();
                        }
                    };
                }

                s.onerror = function(){
                    if(cb)cb();
                }
        
                head.appendChild(s);
                
            }

        });

    },

    require(name, main, callback) {

        var fn = wire.requireType(name, main, function(_fn){
            if(callback)callback(_fn?new _fn(): null);
        });

        if(fn){
            var obj = new fn();
            if(callback)callback(obj);
            return obj;
        }

    },

    requireType(name, main, callback) {
        
        //requireType("wire.bs.input", main, cb);

        function getFn() {

            var names = name.split(".");
            var o = wire;

            names.forEach(function(s, i){

                if(i > 0) {
                    o = o[s];
                }
                
            });

            return o;                        
        }

        var fn = getFn();

        if(fn){
            if(callback)callback(fn);
            return fn;
        }
        else {            
           if(main) {
                wire.loadJs(main, function(){
                    callback(getFn());
                });
            }
            else {
                console.log("{0} not found and main not supplied to load".format(name));
                callback(null);
            }
        }        

    },

    splitRows: function (rows, numCols) {

        var itemsPerRow = numCols, rowIndex = 0, _rows = [];

        for (var index = 0; index < rows.length; index++) {
            if (!_rows[rowIndex])
                _rows[rowIndex] = [];

            _rows[rowIndex].push(rows[index]);

            if (_rows[rowIndex].length == itemsPerRow)
                rowIndex++;
        }

        return _rows;
    }

}

wire.copy = function (source) {
    
    if (Array.isArray(source)) {
        var _array = [];
        source.forEach((row) => {
            _array.push(wire.copy(row));
        });
        return _array;
    }
    else {
        var obj = {};
        var _source = JSON.parse(JSON.stringify(source));
        wire.merge(obj, _source);
        wire.merge(obj, source, true);    
        return obj;    
    }
}

Function.prototype.clone = function () {
    var that = this;
    var temp = function temporary() { return that.apply(this, arguments); };
    for (var key in this) {
        if (this.hasOwnProperty(key)) {
            temp[key] = this[key];
        }
    }
    return temp;
};

String.prototype.splitUpperCase = function () {
    return this.split(/(?=[A-Z])/);
}

String.prototype.splitUpperCaseSpace = function (leavefirst) {
    var s = this.splitUpperCase().join(" ");
    if (leavefirst != undefined && leavefirst)
        return s;
    else
        return s.substring(0, 1).toUpperCase() + s.substring(1);
}

String.prototype.replaceAll = function (find, replace) {
    var s = this;
    return s.replace(new RegExp(find, 'gm'), replace);
}

String.prototype.format = function () {
    var s = this,
    i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

String.prototype.endsWith = function (suffix) {
    return (this.substr(this.length - suffix.length) === suffix);
}

String.prototype.startsWith = function (prefix) {
    return (this.substr(0, prefix.length) === prefix);
}

Array.prototype.clone = function () {
    return JSON.parse(JSON.stringify(this));
};



// polyfill for CustomEvent in IE
if (typeof window.CustomEvent != "function") {

    var ce = function (event, params) {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        var evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = ce;
}
;;wire.data = {

    DataManager: new function () {

        this.DataSets = new wire.Collection("DataId", []);

    },

    DataEventManager: new function () {

        var self = this;
        var events = {}; // event:'dataselect', listeners: [eventListeners]

        this.event = function(name, el) {

            // ensure event is registered
            _event(name, el);
            // create new listener for caller
            var listener = new wire.data.DataEventListner();
            events[name].listeners.push(listener);
            return listener;

        }

        this.dataselect = function () {
            return self.event("dataselect.wire");
        }

        this.datawrite = function () {
            return self.event("datawrite.wire");
        }

        this.remove = function (event) {
            if (event) {
            document.removeEventListener("{0}".format(event), listener);
            events[event] = null;
            }
        }

        function _event(e, el) {
            if (!events[e]) {
            events[e] = { event: e, listeners: [] };
            if (el)
                document.getElementById(el).addEventListener("{0}".format(e), listener);
            else
                document.addEventListener("{0}".format(e), listener);

            }
        }

        function listener(e) {

            if (!events[e.detail.event.name]) return;

            var d = e.detail.data;
            var ed = { source: e, event: e.detail.event, data: d };
            var listeners = events[e.detail.event.name].listeners;
            
            listeners.forEach(function (listener) {
            var l = listener.data();
            switch (true) {
                
                // just the raw event with no conditions
                case (!l.columns.length && !l.dataset && !l.entities.length):

                case (l.columns && d.cell && new wire.Collection("column", l.columns).get(d.cell.column) != null):
                
                case (l.entities && d.table && d.table.__meta.dataset && d.table.__meta.dataset.Query
                    && d.table.__meta.dataset.Query.Entities.length && l.entities.indexOf(d.table.__meta.dataset.Query.Entities[0].Name) > -1):

                case (l.dataset && d.dataset && l.dataset == d.dataset):

                case (l.dataset && d.table && d.table.__meta.dataset && d.table.__meta.dataset.DataId == l.dataset):

                if (l.when) l.when(ed);
                
                break;
            }
            })

        }

        return this;

    },

    DataEventListner: function() {

        var d = { columns: [], dataset: null, entities: [] };

        this.field = function (name) {
            d.columns.push({ column: name });
            return this;
        }

        this.column = function (name) {
          return this.field(name);
        }

        this.entity = function(entity){
            d.entities.push(entity);
        }

        this.dataset = function (id) {
            d.dataset = id;
            return this;
        }

        this.when = function (callback) {
            d.when = callback;
//            return this;
        }

        this.data = function (data) {
            if (data) d = data;
            return d;
        }

    },

    DataEventAction: { 
        add: "add", 
        remove: "remove", 
        replace: "replace", 
        clear: "clear" 
    },

    DataEvent: function (eventName) {

        var self = this;

        var ev;
        var d = {
                action: wire.data.DataEventAction.replace,
                expression: null,
                cell: null,
                column: null,
                row: null,
                table: null
        };
        var de;
        var el;

        // backwards compatible - source used to be the only constructor param
        var _source = (typeof eventName == 'string') ? null : eventName;

        this.element = function (elementId) {
            el = elementId;
            return this;
        }

        this.getDispatchEvent = function () {
            return de;
        }

        this.datadrilldown = function () {
            ev = 'datadrilldown.wire';
            return this;
        }

        this.dataselect = function () {
            ev = 'dataselect.wire';
            return this;
        }

        this.source = function (source) {
            _source = source;
            return this;
        }

        this.getData = function () {
            return d;
        }

        this.expression = function (exp) {

            if (exp) d.expression = exp;

            this.eq = function () {
                d.expression = new wire.data.EqualsExpression().__typeName;
                return this;
            }

            this.ne = function () {
                d.expression = new wire.data.NotEqualsExpression().__typeName;
                return this;
            }

            this.starts = function () {
                d.expression = new wire.data.StartsExpression().__typeName;
                return this;
            }

            this.contains = function () {
                d.expression = new wire.data.ContainsExpression().__typeName;
                return this;
            }

            this.between = function () {
                d.expression = new wire.data.BetweenExpression().__typeName;
                return this;
            }

            return this;
        }       

        this.action = function (action) {

            if (action) d.action = action;

            this.add = function () {
                d.action = wire.data.DataEventAction.add;
                return this;
            }

            this.remove = function () {
                d.action = wire.data.DataEventAction.remove;
                return this;
            }

            this.clear = function () {
                d.action = wire.data.DataEventAction.clear;
                return this;
            }

            this.replace = function () {
                d.action = wire.data.DataEventAction.replace;
                return this;
            }

            return this;
        }

        this.data = function (data) {
            d = data;
            return this;
        }

        this.cell = function (column, value, text, type) {
            d.cell = { column: column, value: value, text: text, type: type };
            return this;
        }

        this.label = function (column, value) {
            d.cell.label = "{0} = {1}".format(column.splitUpperCaseSpace(), value);
            return this;
        }

        this.column = function (column) {
            d.column = column;
            return this;
        }

        this.row = function (row) {
            d.row = row;
            return this;
        }

        this.table = function (table) {
            d.table = table;
            return this;
        }

        this.raise = function () {

            //  var e = document.createEvent("CustomEvent");
            //  e.initCustomEvent("{0}.eb".format(ev), true, true, { event: { name: ev, source: _source }, data: d });

            var e = new CustomEvent("{0}".format(ev), {
                detail:
                { event: { name: ev, source: _source }, data: d }
            });

            if (el)
                de = document.getElementById(el).dispatchEvent(e);
            else
                de = document.dispatchEvent(e);

            return this;
        }

        this.event = function (event) {
            ev = event;
            return this;
        }

        return this;

    },

    DataPromise: function (data) {

        var dn, bs, bd, fl, aw, pr;
        var d, e, s;

        d = data;

        this.promise = function (promise) {
            if (promise) pr = promise;
            return pr;
        }

        this.always = function (fn) {
            if (d || e)
                fn();
            aw = fn;
            s = false;
            return this;
        }

        this.resolve = function (data) {
            if (data) d = data;
            if (dn)
                if (bd) { bd(d, function (d2) { dn(d2); }); }
                else dn(d);
            if (aw) aw(d);
        }

        this.done = function (fn) {
            if (d) {
                if (bd) { bd(d, function (d2) { fn(d2); }); }
                else fn(d);
            }
            dn = fn;
            return this;
        }

        this.beforeDone = function (fn) {
            bd = fn;
            return this;
        }

        this.reject = function (er) {
            e = er;
            if (fl) fl(e);
            if (aw) aw(null, e);
        }

        this.fail = function (fn) {
            fl = fn;
            if (e)
                fn(e);
            return this;
        }

        this.process = function () {
            s = true;
            if (bs) bs();
        }

        this.processing = function (fn) {
            bs = fn;
            if (s)
                fn(s);
            return this;
        }

        return this;

    },

    DataSet: function (config) {

        var self = this;

        this.__typeName = "DataSet"
        this.DataId = wire.guid();
        this.Source = null
        this.Query = null;
        this.Events = [];  // [{Name: "dataselect", Listen:false, ListenerId: null, Fields: [{Name:"", Alias:"", When: null, Listen:false}]}]
        //this.View = null;
        this.Transform = null;
        this.datasetView = null; // cast converts this string into a View function
        this.__meta = {};
        this.isDataSet = true;
        this.Entity = null;
        this.Write = null;

        var _data = null;
        var _cols = []; // capture columns before any views change the data for write back - remove view columns automatically
        var promises = [];
        var defer = null;

        this.setView = function (view) {
            if (view) self.datasetView = view;
            if (self.datasetView)
                self.Transform = new Function("data, callback", self.datasetView);
        }

        this.clearPromises = function () {
            promises = [];
        }

        
        this.updatePromises = function () {

            promises.forEach(function (p) {
                p.p.resolve(_data);
            });

        }

        this.on = function (event) {

            var ev = null;
            var em = null;

            if (event) {
                ev = _events(event).get(event);
                em = wire.data.DataEventManager.event(event, ev.ListenerId);
                if(self.Query.Entities){
                    self.Query.Entities.forEach(function(entity){
                        em.entity(entity.Name);
                    });
                }
                em.when(l);
            }

            this.fields = function () {

                var fld;

                if (event) {

                    // has user passed in custom event data ?
                    var colEvent = new wire.Collection("Name", self.Events).get(event);
                    var fcols = (colEvent && colEvent.Fields) ? colEvent.Fields : [];
                    var cols = $.extend(true, [], fcols);

                    var colFields = new wire.Collection("Name", cols);
                    var col = null;

                    if (wire.model != undefined && self.Query instanceof wire.model.PivotQuery) m(); else t();

                    // check for custom fields not yet in the event stack
                    cols.forEach(function (cl) {
                        col = cl;
                        if (!wire.toBoolean(cl._found, false)) c(cl);
                    });

                    function m() {
                        self.Query.Dimensions.forEach(function (dim) {
                            em.column(dim.UniqueName);
                        });
                    }
                    function t() {
                        //em.table(self.Name);
                        // Events: [{Name: "dataselect", Listen:false, ListenerId: null, Fields: [{Name:"", Alias:"", When: null, Listen:false}]}]
                        if (self.Query.__typeName == "StoredProcedure")
                            self.Query.Params.forEach(function (p) {
                                col = colFields.get(p.Name) || {}; c(p);
                            });
                        else;
                            if (self.Query.Fields) {
                                self.Query.Fields.forEach(function (f) {
                                    col = colFields.get(f.Name) || {}; c(f);
                                    //em.column(f.Alias || f.Name);                                    
                                })
                                self.Query.Filter.forEach(function (sel) {
                                    col = (sel.Expression.Field ? colFields.get(sel.Expression.Field) : {});
                                    if(!col) col={};
                                    c(sel.Expression);
                                    //em.column(sel.Expression.Alias || sel.Expression.Field);
                                })
                            };

                        //                

                    }
                    function c(f) {
                        // col.Listen
                        if (!wire.toBoolean(f.Events, true)) return;
                        // look for custom field overrides (col)
                        col._found = true;
                        //var n = col.Alias || col.Name || f.Alias || f.Name || f.Field;
                        var n = col.Name || f.Name || f.Field || col.Alias || f.Alias;
                        if (n) em.column(n);
                        // add any event names
                        if (f.EventName)
                            em.column(f.EventName);
                        if (f.EventNames) {
                          f.EventNames.forEach(function (en) {
                            em.column(en);
                          });
                        }
                      }

                }

            }

            this.field = function (field) {
                em.column(field);
                var e = _events().get(event);
                e.Fields = e.Fields || [];
                fld = new wire.Collection("Name", e.Fields).get(field);
                if (!fld) {
                    fld = { Name: field }
                    e.Fields.push(fld);
                }
                return this;
            }

            this.when = function (fn) {
                fld.When = fn;
                return this;
            }

            this.dataselect = function () {
                return self.on("dataselect.wire");
            }

            this.datadrilldown = function () {
                return self.on("datadrilldown.wire");
            }

            function l(ev) {

                var ed = ev.data;
                var _ev = _events().get(ev.event.name);

                if (!_ev) return;

                var q = self.Query;
                var fld;
                var b = false;

                var isSelf = (ed.table && ed.table.__meta.dataset && ed.table.__meta.dataset.DataId == self.DataId);

                // if has paging then set page back to 1
                if (!isSelf && self.Query.Paging && self.Query.Paging.Page > 0)
                    self.Query.Paging.Page = 1;

                var col = fieldAliasMatch(ed.cell.column) || ed.cell.column;

                if (_ev.Fields) {
                    fld = new wire.Collection("Name", _ev.Fields).get(col);
                }

                if (fld && fld.When && !isSelf) {
                    if (q instanceof wire.data.TableQuery || q instanceof wire.data.StoredProcedure)
                        fld.When({ dataset: self, event: ev }, cb);
                    else fld.When(q.dimension(col), ed.cell.value, q, ev); // need to update cube params
                    b = true;
                }
                else cb();

                function cb() {

                    var da = wire.data.DataEventAction;
                    if (wire.model && q instanceof wire.model.PivotQuery) {

                        var fs = q.getDimension(col).Filter.Selections;

                        switch (_ev.Name) {

                            case "datadrilldown.wire":

                                if (ed.table && ed.table.__meta.dataset.DataId == self.DataId) {
                                    switch (ed.action) {
                                        case da.replace:
                                            q.dimension(col).children(ed.cell.value);
                                            break;
                                        case da.add:
                                            var sel = new wire.model.FilterSelection();
                                            sel.Expression = new wire.model.ChildrenExpression(ed.cell.value);
                                            sel.Operation = wire.model.FilterSelectionOperation.AddToFilter;
                                            fs.push(sel);
                                            break;
                                        case da.remove:
                                            var bb = false;
                                            fs.some(function (f, i) {
                                                if (f.Expression.__typeName == "ChildrenExpression" && f.Expression.Member.UniqueName == ed.cell.value) {
                                                    fs.splice(i, 1);
                                                    bb = true;
                                                }
                                                return bb;
                                            });
                                            if (!bb) {
                                                //could not find drill down on individual member to remove
                                                var sel = new wire.model.FilterSelection();
                                                sel.Expression = new wire.model.ChildrenExpression(ed.cell.value);
                                                sel.Operation = wire.model.FilterSelectionOperation.RemoveFromFilter;
                                                fs.push(sel);
                                            }
                                            break;
                                    }
                                    b = true;
                                }
                                break;

                            case "dataselect.wire":

                                q.dimension(col).members(ed.cell.value);
                                b = true;
                                break;

                        }

                    }

                    else {//table query or stored proc;

                        var dim = (ed.table && ed.table.__model) ? ed.table.__model.getDimension(col) : null;

                        switch (_ev.Name) {

                            //case "levelselect":
                            //    q.groupBy(ed.cell.value);

                            case "datadrilldown.wire":

                                if (ed.table.__dataSet.DataId == self.DataId) {
                                    switch (ed.action) {
                                        case da.replace:
                                            // parent child or named levels
                                            switch (true) {
                                                case (dim.ParentId != null && dim.ParentId != undefined):
                                                    q.where().eq(dim.ParentId, ed.row[dim.Id]);
                                                    b = true;
                                                    break;
                                                case (dim.Hierarchy != null && dim.Hierarchy != undefined):
                                                    var index = 0;
                                                    dim.Hierarchy.forEach(function (s, i) {
                                                        var i = q.Fields.indexOf(s);
                                                        if (i > -1) q.Fields.splice(i, 1);
                                                        if (s == col) index = i;
                                                    });
                                                    if (index < dim.Hierarchy.length - 1) {
                                                        q.Fields.splice(0, 0, dim.Hierarchy[index + 1]);
                                                        q.groupBy(dim.Hierarchy[index + 1]); // move to next level down
                                                        q.where().eq(col, ed.cell.text);
                                                        b = true;
                                                    }
                                                    break;
                                            }
                                            break;
                                    }

                                }
                                break;

                            case "dataselect.wire":

                                // don't refresh yourself - this needs to be smarter to handle X components bound to the same data set
                                // this breaks if two plugins are bound to the same datasets
                                if (!isSelf) {
                                    if (q.__typeName == "StoredProcedure") {
                                        b = q.setEventExpression({ column: col, data: ed });
                                    }
                                    else {
                                        
                                        ed.column = ed.column || {};
                                        ed.column.Name = ed.column.Name || ed.cell.column;

                                        //var obj = { Entity: ed.column.Table, Field: ed.column.Name, Value: ed.cell.value };
                                        var obj = { Entity: ed.column ? ed.column.Table: null, Field: ed.column.Name, Value: ed.cell.value };                                        

                                        // check if field is in query and set event name if so in case there is a value so not to lose
                                        // if more than one, use the first one (shouldn't be)
                                        // (may need other props in future)
                                        var queryFields = q.getFields(obj.Field);
                                        if (queryFields.length)
                                            obj.EventName = queryFields[0].EventName;

                                        // check if this is an event field name
                                        var eventFields = q.getEventNameFields(ed.column.Name);
                                        
                                        if (eventFields.length) {

                                            var vals = [];

                                            // check for more than one value

                                            if (Array.isArray(ed.cell.value))
                                                vals = ed.cell.value;
                                            else
                                                vals = [ed.cell.value];

                                            eventFields.forEach(function (f, i) {
                                                col = f;
                                                obj.Field = f;
                                                obj.EventName = ed.column.Name;
                                                if(vals.length > i)
                                                    obj.Value = vals[i];
                                                setExpressions();
                                            });

                                        }
                                        else setExpressions();

                                        function setExpressions() {

                                            switch (ed.action) {

                                                case da.add:
                                                case da.replace:

                                                    if(ed.action == da.replace)
                                                        q.clear(col);

                                                    if (ed.expression)
                                                        q.setEventExpression(ed.expression, obj);
                                                    else
                                                        if (Array.isArray(obj.Value))
                                                            q.in(obj);
                                                        else
                                                            q.eq(obj);
                                                    break;

                                                case da.remove:
                                                    obj.removeJoin = true;
                                                    q.removeFilter(obj);
                                                    break;

                                                case da.clear:
                                                    q.clear(col);
                                                    break;

                                            }
                                        }

                                        b = true;
                                    }
                                }
                                break;
                        }

                    }


                }

                function fieldAliasMatch(column) {
                    var f = null;
                    if (_ev.Fields) {
                        _ev.Fields.some(function (_f) {
                            if (_f.Alias == column) f = _f.Name;
                            return f != null;
                        });
                    }
                    return f;
                }

                if (b)
                    self.refresh();

            }

            return this;
        }

        this.data = function (data) {
            if (typeof data != 'undefined') _data = data;
            return _data;
        }


        // for typescript casting
        this.table = function (data) {
            return self.data(data);
        }        

        this.execAsync = function (config) {
            self.getData(config);
            return defer;
        }

        this.execAsyncListen = function (config) {
            return self.ensureData(config);
        }

        this.getData = function (config) {

            // refreshes cache, updates existing promises, returns one time promise with no future updates
            // use this when there is no concern for changes if any made to the data set from other code
            // this method has less overhead then ensureData as it does not add addional promises to the update stack that broadcasts out changes to the data set

            self.data(null);

            config = config || {};
            config.onetime = true;
            return self.ensureData(config);

        }

        this.refresh = function () {
            _ensuredata(null, null, true);
        }

        this.refreshData = function (config) {
            // clear data, then call ensureData
            // used when updating Query each time before calling ensureData
            // or just always wanting a fresh copy of the data and an new prom
            self.data(null);
            return self.ensureData(config);
        }

        this.ensureData = function (config) {
            return _ensuredata(null, config);
        }

        this.dataTable = function (config) {
            return _ensuredata("dataTable", config);
        }
        this.dimensionTable = function (config) {
            return _ensuredata("dimensionTable", config);
        }
        this.flatTable = function (config) {
            return _ensuredata("flatTable", config);
        }

        this.delete = function (query, options) {

            options = options || {};

            if (!self.Source)
                return;

            if (!self.Source.serviceProvider().delete)
                throw "Service provider does not support deleting data"

            self.Source.delete(query, _queryOptions((typeof self.Delete == "object") ? self.Delete : self.Write), null);

            if (wire.toBoolean(options.refresh, true)) self.refresh();

        }

        this.write = function (data, options) {

            /*
                 
            // not documented
            options: refresh, removeNonDatasetColumns
           
            dataset.Write: { Entity: null, Data: function(){}, Options: { Keys: [], UpdateOnly, Conflict } 

            */

            if (!self.Source)
                return;

            self.Write = self.Write || {};

            //if (!self.Write)
            //    throw "Writing data not turned on for data set";

            if (!self.Source.serviceProvider().write)
                throw "Service provider does not support writing data";

            var _options = self.Write.Options || self.Write.Provider || {};

            if (self.Write.Keys) {
                _options.Keys = self.Write.Keys;
            }

            if (self.Write.Refresh) {
                _options.refresh = self.Write.Refresh;
            }

            if (self.Write.Refresh) {
                _options.refresh = self.Write.Refresh;
            }

            if (self.Write.RemoveNonDatasetColumns) {
                _options.removeNonDatasetColumns = self.Write.RemoveNonDatasetColumns;
            }

            //  method override
            if (options)
                _options = $.extend(_options, options);

            try {

                var _items = data;

                if (!Array.isArray(data))
                    _items = [data];

                // original columns before any views that may have created new ones
                var dtCols = new wire.data.DataTable(_cols);

                // deep clone - push data into temp array to operate
                var items = $.extend(true, [], _items);
                var dtItems = new wire.data.DataTable(items);

                if (wire.toBoolean(_options.removeNonDatasetColumns, true)) {
                    dtItems.Rows.forEach(function (item) {

                        if (_data instanceof wire.data.DataTable) {

                            // remove any columns that are not in the original data that was retrieved from the server (view columns)

                            dtItems.Columns.forEach(function (col) {
                                if (dtCols.where().eq("Name", col.Name).first() == null)
                                    delete item[col.Name];
                            });
                        }
                    });
                }

                var _d = items;
                var wo = (typeof self.Write == "object");

                if (wo && (typeof self.Write.Data == "function"))
                    _d = self.Write.Data(_d, self);

                var rtn = self.Source.write(self.Write.Entity || self.Query.Entities[0].Name, _d, _queryOptions(_options, _d));

                if (wire.toBoolean(_options.refresh, false)) self.refresh();

                return rtn;

            }

            catch (ex) {
                throw ex;
            }

        }

        this.initialize = function () {

            $.extend(this, config);

            if (self.Query && self.Events) {

                var _ev = _events().get("dataselect.wire");

                if (!_ev || wire.toBoolean(_ev.Listen, true))
                    self.on().dataselect().fields();

                _ev = _events().get("datadrilldown.wire");

                if (!_ev || wire.toBoolean(_ev.Listen, true))
                    self.on().datadrilldown().fields();

            }

            wire.data.DataManager.DataSets.add(this);

            return this;

        }

        function _queryOptions(o, d) {

            // evaluate all query parameters
            var options = o || {};

            if (typeof options.params == "object") {
                options = $.extend(true, {}, options);
                for (var obj in options.params) {
                    if (typeof options.params[obj] == "function")
                        options.params[obj] = options.params[obj](d, self);
                }
            }

            return options;
        }

        function _events(event) {
            self.Events = self.Events || [];
            var col = new wire.Collection("Name", self.Events);
            if (event && !col.get(event)) {
                self.Events.push({ Name: event });
            }
            return col;
        }

        function _ensuredata(view, config, refresh) {
;
            var p = null;

            if (!refresh) {
                p = new wire.data.DataPromise();
                promises.push({ p: p, v: view, c: config });
            }

            if (!defer && (!_data | refresh)) {

                var b = _data;
                //if (b) {  does not get called if first query returned no data
                    promises.forEach(function (_p) {
                        _p.p.process();
                    });
                //}

                //defer = self.Source.execAsync(self.Query, self.Read ? self.Read : null)
                defer = self.Source.execAsync(self.Query, config)
                .done(function (r, textStatus, jqXHR) {

                    defer = null;
                    if(config && !wire.toBoolean(config.cast, true))
                        // returning custom object, don't cast to table
                        _data = r;
                    else {
                        _data = self.Source.getResponseTable(r, jqXHR);
                        // extend array
                        Array.prototype.push.apply(_cols, _data.Columns);
                    }

                    let viewRun = false;
                    for (var i = promises.length - 1; i >= 0; i--) {

                        var _p = promises[i];
                        var vd = _p.v ? _data[_p.v](_p.c) : _data;

                        // only call self.View once so maintenace is not repeated in view                        
                        if (!viewRun)
                            setViewData(vd, _p.c, _p.p, function (table, cancel) {
                                viewRun = true;
                                _data = table;
                                _setViewData(cancel);
                            });
                        else
                            _setViewData();
                        function _setViewData(cancel) {
                            if (cancel)
                                _p.p.reject();                                
                            else
                                _p.p.resolve(_data);
                            if (_p.c && _p.c.onetime)
                                promises.splice(i, 1);
                        };
                        }

                })
                .fail(function (r) {

                    defer = null;

                    // check for redirect
                    if (r.getAllResponseHeaders().indexOf("x-wirebootstrap-redirect") > -1) {
                        
                        const arr = r.getAllResponseHeaders().trim().split(/[\r\n]+/);

                        let list = arr.map((line) => {
                            const ar = line.split(": ");
                            return { name: ar[0], value: ar[1] };
                        });

                        location.href = new wire.Collection("name", list).get("x-wirebootstrap-redirect").value;

                    }
                    else
                        promises.forEach(function (_p) {
                            _p.p.reject(r);
                        });

                });

            }

            if (!refresh) {
                if (defer) p.promise(defer.promise);
                else if (_data) {
                    var vd = _data[view] ? _data[view](config) : _data;
                    // calling this with no fresh or not new data from server
                    // causing any changes in self.View to be repeated
                   // setViewData(vd, config, p, function (t) {
                        p.resolve(vd);
                        if (config && config.onetime)
                            promises.splice(promises.length - 1, 1);
                 //   });
                }

                return p;
            }

            function setViewData(vd, config, p, cb) {
                // why is this here? 6/23/2919 -> vd.Name = vd.Name || self.Name || null;
                if(!config || wire.toBoolean(config.cast, true)){
                    vd.__meta.model = self.Model || null;
                    vd.__meta.dataset = self;
                }
                // helper - custom view so don't have to set up a custom view object for transform
                var transform = self.View || self.Transform;
                if (transform) {
                    try {
                        transform({ table: vd, config: config, dataset: self }, function (t) {
                            cb(t);
                        });
                    }
                    catch (e) {
                        p.reject(e);
                    }
                }
                else
                    cb(vd);
            }

        }

        self.initialize(config);

    },

    DataSource: function (provider, config) {

        var self = this;        
        this.__typeName = "DataSource";

        this.Ajax = null;
        this.ServiceRoot = null;
        this.ProviderId = null;
        this.ProviderMain = null;
        this.Provider = null;
        this.Model = null;        

        var _lastQuery = { method: null };
        var _svc = null;

        this.useBasicAuth = function (user, password) {
            self.Ajax = self.Ajax || {};
            self.Ajax.Headers = { "Authorization": "Basic " + window.btoa(user + ":" + password) };
        }

        this.ensureServiceProvider = function(cb) {

            // {success: true, ex: null, data: null}

            var svc = self.serviceProvider();

            if(!svc) {
                if(self.ProviderMain){
                    wire.loadJs(self.ProviderMain, function(){                    
                        cb({});
                    })
                    .fail(function(ex){
                        cb( {ex: ex} );
                    });
                }
                else console.log("Unable to locate DataSource service provider '{0}'".format(self.ProviderId));
            }
            else if(cb) cb({});

        }

        this.serviceProvider = function () {
            if (!_svc) {
                var provider = wire.data.provider.Providers[self.ProviderId];
                if(provider) _svc = new provider.provider({ dataSource: this });                
            }
            return _svc;
        }

        this.allow = function() {
            const sp = this.serviceProvider();
            if(sp) return sp.allow;
        }

        this.getResponseTable = function (response, jqXHR) {
            var d = self.serviceProvider().getResponseTable(response);
            _applyModelResponse(d, jqXHR ? jqXHR.__wire_RequestId : null);
            return d;
        }
        this.getEntityResponseTable = function (response) {
            var d = self.serviceProvider().getEntityResponseTable(response);
            _applyModelResponse(d);
            return d;
        }
        this.test = function (options) {
            return self.serviceProvider().test(options);
        }

        this.discoverEntities = function (options) {
            _lastQuery = { method: "discoverEntities", options: options };
            return self.serviceProvider().discoverEntities(options);
        }
        this.discoverEntitiesAsync = function (options) {
            _lastQuery = { method: "discoverEntities", options: options };
            return self.serviceProvider().discoverEntitiesAsync(options);
        }
        this.discoverFields = function (options) {
            _lastQuery = { method: "discoverFields", options: options };
            var d = self.serviceProvider().discoverFields(options);
            _applyModelResponse(d);
            return d;
        }
        this.discoverFieldsAsync = function (options) {
            _lastQuery = { method: "discoverFields", options: options };
            return self.serviceProvider().discoverFieldsAsync(options);
        }
        this.discoverCatalogs = function (options) {
            _lastQuery = { method: "discoverCatalogs", options: options };
            return self.serviceProvider().discoverCatalogs(options);
        }
        this.discoverCatalogsAsync = function (options) {
            _lastQuery = { method: "discoverCatalogs", options: options };
            return self.serviceProvider().discoverCatalogsAsync(options);
        }        
        this.discoverProcedures = function (options) {
            _lastQuery = { method: "discoverProcedures", options: options };
            return self.serviceProvider().discoverProcedures(options);
        }
        this.discoverProceduresAsync = function (options) {
            _lastQuery = { method: "discoverProcedures", options: options };
            return self.serviceProvider().discoverProceduresAsync(options);
        }        

        this.discoverProcedureParameters = function (options) {
            _lastQuery = { method: "discoverProcedureParameters", options: options };
            return self.serviceProvider().discoverProcedureParameters(options);
        }
        this.discoverProcedureParametersAsync = function (options) {
            _lastQuery = { method: "discoverProcedureParameters", options: options };
            return self.serviceProvider().discoverProcedureParametersAsync(options);
        }        

        this.exec = function (q, options) {
            options = _setRequestOption("exec", q, options);
            var d = self.serviceProvider().exec(q, options);
            _applyModelResponse(d, options.__wire_RequestId);
            return d;
        }
        this.execAsync = function (q, options) {
            options = _setRequestOption("exec", q, options);
            return self.serviceProvider().execAsync(q, options);            
        }
        this.delete = function (q, options) {
            return self.serviceProvider().delete(q, options);
        }
        this.deleteAsync = function (q, options) {
            return self.serviceProvider().deleteAsync(q, options);
        }
        this.write = function (entity, data, options) {
            return self.serviceProvider().write(entity, data, options);
        }
        this.writeAsync = function (entity, data, options) {
            return self.serviceProvider().writeAsync(entity, data, options);
        }

        function _setRequestOption(method, q, options) {
            // needed to tag asyn calls so they can tie to their original query
            var request = wire.guid();
            _lastQuery[request] = { method: method, query: q, options: options };
            _applyModelRequest(request);
            options = options || {};
            options.__wire_RequestId = request;
            return options;
        }

        function _applyModelRequest(request) {

            var q = _lastQuery[request].query;

            // relationships
            //if (!self.Model || q.Joins.length > 0 || q.Entities.length < 2)
            if (!self.Model || q.__typeName == "StoredProcedure")
                return;

            var entities = [];

            // Ensure field meta data
            q.Fields.forEach(function (field) {

                // try to find the entity so the right meta data is pulled fromt the model in case there are field names that are the same
                if(!field.Entity && q.Entities.length == 1){
                    field.Entity = q.Entities[0].Name;
                }

                var f = self.Model.getField(field.Name, field.Entity);
                if(f) wire.merge(field, f);
            });

            //
            // Unique list of entities in Entity and Filters
            //  for join processing
            //

            q.Entities.forEach(function (entity) {
                entities.push({ Name: entity.Name});
            });

            q.Filter.forEach(function (filter) {
                if (filter.Expression && filter.Expression.Entity && new wire.Collection("Name", entities).get(filter.Expression.Entity) == null)
                    entities.push({ Name: filter.Expression.Entity });
            });
                               
            var tblRels = new wire.data.DataTable(self.Model.Relationships);
            var tblEntities = new wire.data.DataTable(entities);
            var joins = [];
            q.Joins = q.Joins || [];
            
            tblEntities.addColumn("processed").value(false);
            tblRels.addColumn("used").value(false);            
            tblRels.addColumn("pos");
            tblRels.addColumn("other");
            tblRels.addColumn("first");

            // set first entity to processed already
            if(tblEntities.Rows.count)
                tblEntities.Rows[0].processed = true;

            // both direct and indirect passes only look for rels to processed entities
            // so may need to make two passes for some entities
            var retry = true;

            do {

                tblEntities.Rows.forEach(function (e, i) {
                
                    if (e.processed)
                        return;

                    var rels = getRels(e);

                    if (!tryDirect(e, rels))
                        tryInDirect(e, rels);

                });

                retry = !retry;                
            }
            while ( (tblEntities.where().eq("processed", false).first() != null) && (retry == false) );


            //
            // Add joins to query
            //
            joins.forEach(function (rel) {
                var e1, e2, f1, f2;
                if (rel.first == 1) {
                    e1 = rel.Entity1;
                    f1 = rel.Field1;
                    e2 = rel.Entity2;
                    f2 = rel.Field2;
                }
                else {
                    e1 = rel.Entity2;
                    f1 = rel.Field2;
                    e2 = rel.Entity1;
                    f2 = rel.Field1;
                }
                q.join(e1, f1).on(e2, f2);
            });


            tblRels.removeColumn("used");
            tblRels.removeColumn("pos");
            tblRels.removeColumn("other");
            tblRels.removeColumn("first");
            tblEntities.removeColumn("processed");

            function getRels(en) {

                // relationships with this entity that have not already been used
                var rels = tblRels.where().eq("used", false).calc(function (row) {
                    row.pos = null;
                    if (row.Entity1 == en.Name) {
                        row.pos = 1;
                        row.other = row.Entity2;                    
                    }
                    if (row.Entity2 == en.Name) {
                        row.pos = 2;
                        row.other = row.Entity1;
                    }
                    return (row.pos != null);
                }).table();

                return rels;

            }

            function tryDirect(e, rels) {

                // other side of these relationships that are in this query (direct relationship)
                // and are already in the join
                var rel = rels.where().calc(function (row) {
                    var b = (tblEntities.where().eq("Name", row.other).eq("processed", true).first() != null);
                    return b;
                }).first();

                if (rel != null) {
                    rel.first = rel.pos;
                    joins.push(rel);
                    rel.used = true;
                    var p = tblEntities.where().eq("Name", rel.Entity1).first();
                    p.processed = true;
                    p = tblEntities.where().eq("Name", rel.Entity2).first();
                    p.processed = true;
                };

                return (rel != null);
            }

            function tryInDirect(e, rels) {

                //
                // InDirect relationships
                // couldn't find this entity with a relationship to another in the query
                // expand search for indirect relationship 
                // - entity not in the query but with a relationship to both this entity and another that is also in the query
                //

                rels.Rows.some(function (rel) {

                    var rel2 = tblRels.where().eq("used", false).calc(function (row) {
                        if (row.Entity1 == rel.other && (tblEntities.where()
                                .ne("Name", e.Name)
                                .eq("Name", row.Entity2)
                                .eq("processed", true)
                                .first() != null)) {
                            row.first = 1; // other needs to go first in indirect relationship
                            rel.first = rel.pos;
                        }
                        else if (row.Entity2 == rel.other && (tblEntities.where()
                            .ne("Name", e.Name)
                            .eq("Name", row.Entity1)
                            .eq("processed", true)
                            .first() != null)) {
                            row.first = 2;
                            rel.first = rel.pos;
                        };
                        return (row.first != null);
                    }).first();

                    if (rel2 != null) {
                        joins.push(rel2);
                        joins.push(rel);
                        rel.used = true;
                        rel2.used = true;
                        var p = tblEntities.where().eq("Name", rel2.Entity1).first();
                        if (p) p.processed = true;
                        p = tblEntities.where().eq("Name", rel2.Entity2).first();
                        if (p) p.processed = true;
                        p = tblEntities.where().eq("Name", rel.Entity1).first();
                        if (p) p.processed = true;
                        p = tblEntities.where().eq("Name", rel.Entity2).first();
                        if (p) p.processed = true;
                        return true;
                    }
                    else
                        return false;

                });
            }

        }

        function _applyModelResponse(d, requestId) {

            if (!self.Model || !requestId || !d.Columns)
                return;

            var query = _lastQuery[requestId];

            var o = query.options;

            if (o && !wire.toBoolean(o.applyModel, true))
                return;

            switch (query.method) {

                case "exec":
                    //NOT SURE WHY THIS WASN'T DONE WITH ALIAS AND HANDLED IN THE QUERY ??
                    // todo: make this smarter, need to incorporate table.field in field name for exec fields
                    //  for queries with two tables with same name

                    var modelFields = new wire.data.DataTable(self.Model.Fields);

                    var entities = [];

                    if (query.query.__typeName == "TableQuery")
                        entities = query.query.Entities;
                    else
                        entities.push({ Name: query.query.Name });                    

                    d.Columns.forEach(function (c) {

                        var r = false;

                        entities.some(function (e) {

                            var mf = modelFields.where().eq("Entity", e.Name).eq("Name", c.Name).first();

                            if (mf) {
                                c.Title = mf.Alias || c.Title;
                                c.Format = mf.Format || c.Format;
                                r = true;
                            }

                            return r;
                        });
                     

                    });

                    break;

                case "discoverEntities":

                    self.Model.Entities.forEach(function (entity) {

                        var row = d.where().eq("Name", entity.Name).first();

                        if (row) {
                            row.Alias = entity.Alias || row.Alias;
                            if (entity.Hidden)
                                d.delete().eq("Name", entity.Name)
                        }
                    });



                    break;

                case "discoverFields":

                    self.Model.Fields.forEach(function (field) {

                        var row = d.where().eq("Entity", field.Entity).eq("Name", field.Name).first();

                        if (row) {
                            row.Alias = field.Alias || row.Alias;
                            if (field.Hidden)
                                d.delete().calc(function (row) {
                                    return row.Entity == field.Entity && row.Name == field.Name;
                                });
                        }
                    });

                    break;

            }

        }


        (function init(config){

            // merge defaults with config passed in
            wire.merge(self, config);

            // id passed in first arg if not in config
            self.ProviderId = self.ProviderId || provider;
            
            // initialize provider if nothing passed in
            if(!self.Provider) self.Provider = {};

            // helper, allow ServiceRoot to be set on the Provider
            //self.ServiceRoot = self.ServiceRoot || self.Provider.ServiceRoot;

            // be sure service provider is available
            //self.ensureServiceProvider();

        })(config);


        /*
        table
        ds.discoverEntities(en)
        ds.discoverFields(entity)
        ds.discoverCatalogs()

        model
        ds.discoverDimensions
        */

    },

    FilterSelection: function (expression, operation) {
        var self = this;
        this.__typeName = "FilterSelection";
        this.Expression = expression;
        this.Operation = operation ? operation : wire.data.FilterSelectionOperation.NotSet;
        this.getDescription = function (options) {
            // leaving operation out for now
            if (self.Expression && self.Expression.getDescription)
                return self.Expression.getDescription(options);
            else
                return "";
        }
    },

    FilterSelectionOperation: {
        NotSet: "NotSet",
        And: "And",
        Or: "Or"
    },

    EntityExpression: function (name, qualifier) {
        this.__typeName = "EntityExpression";
        this.Name = name;
        this.Qualifier = qualifier;
    },

    InExpression: function (field, value) {
        var self = this;
        this.__typeName = "InExpression";
        this.Field = null;
        this.Entity = null;
        this.Alias = null;
        this.Value = value; //array

        this.getDescription = function (options) {

            var s = "{0}{1}{2}";
            var eq = "";
            var v = "";

            var label = self.Field.splitUpperCaseSpace();

            if (options && options.model) {
                var f = options.model.getField(self.Field, self.Entity);
                label = (f && f.Alias) ? f.Alias : label;
            }

            if (self.Value)
                if (self.Value.length == 1) {
                    eq = " = ";
                    v = self.Value;
                }
                else {
                    eq = " in ";
                    v = self.Value.join(",");
                }

            return s.format(label, eq, v);

        }

        this.tojSQL = function () {
            return ".in(\"{0}\",[{1}])".format(self.Field, $.map(self.Value, function (f) {
                return typeof f == 'number' ? f : "\"" + f + "\""
            }).join(", "));
        }

        if (typeof field == 'object') {
            $.extend(this, field);
        }
        else
            self.Field = field;

    },

    _EqualsExpression: function (field, value, not) {
        var self = this;
        this.__typeName = not ? "NotEqualsExpression" : "EqualsExpression";
        this.Field = null;
        this.Entity = null;
        this.Alias = null;
        this.Value = value;
        this.getDescription = function (options) {

            var label = self.Field.splitUpperCaseSpace();

            if (options && options.model){
                var f = options.model.getField(self.Field, self.Entity);
                label = (f && f.Alias) ? f.Alias : label;
            }

            return "{0} {1} {2}".format(label, not ? "<>" : "=", self.Value);
        }
        this.tojSQL = function () {
            return ".{0}(\"{1}\",{2})".format(not ? "ne" : "eq", self.Field, (typeof this.Value == 'number' ? self.Value : "\"" + self.Value + "\"")) + ")";
        }
        if (typeof field == 'object')
            $.extend(this, field);
        else
            self.Field = field;

    },

    StartsExpression: function (field, value) {
        this.__typeName = "StartsExpression";
        this.Field = field;
        this.Value = value;
        this.tojSQL = function () {
            return ".starts(\"{0}\",{1})".format(this.Field, (typeof this.Value == 'number' ? this.Value : "\"" + this.Value + "\"")) + ")";
        }
    },

    BetweenExpression: function (field, value1, value2) {
        this.__typeName = "BetweenExpression";
        this.Entity = null;
        this.Field = field;
        this.Value1 = value1;
        this.Value2 = value2;      
    },

    FieldExpression: function (field1, field2) {
        var self = this;
        this.__typeName = "FieldExpression";
        this.Entity = null;
        this.Field = field1;
        this.Entity2 = null
        this.Field2 = field2;

        this.tojSQL = function () {
            return ".eqField(\"{0}\",\"{1}\")".format(this.Field1, this.Field2);
        }

        this.getDescription = function () {
            return ""; //return self.Field + " = " + self.Field2;
        }      
    
        this.isSameFieldExpression = function (){     
            
            return (self.Entity == self.Entity2) && (self.Field == self.Field2)     ;           
        }

        //init
        if (typeof field1 == 'object')
            $.extend(this, field1);

    
    },

    ContainsExpression: function (field, value) {
        this.__typeName = "ContainsExpression";
        this.Field = field;
        this.Value = value;
        this.tojSQL = function () {
            return ".contains(\"{0}\",{1})".format(this.Field, (typeof this.Value == 'number' ? this.Value : "\"" + this.Value + "\"")) + ")";
        }
    },

    OrderByExpression: function (field, desc) {
        var self = this;
        this.__typeName = "OrderByExpression";
        this.Field = null;
        this.Entity = null;
        this.Alias = null;
        this.Desc = desc || false;
        if (typeof field == 'object')
            $.extend(this, field);
        else
            self.Field = field;
    },

    QueryExpression: new function () {

        this.cast = function (obj) {

            var exp = null;

            if (obj) {
                switch (obj.__typeName) {

                    case "InExpression":
                        exp = $.extend(new wire.data.InExpression(), obj);
                    case "FieldExpression":
                        exp = $.extend(new wire.data.FieldExpression(), obj);
                    }
                
            }
            return exp;

        }
    },

    CustomExpression: function (expression, description) {
        var self = this;
        this.__typeName = "CustomExpression";
        this.Expression = expression;
        this.Description = description;
        this.getDescription = function () {
            return self.Description || self.Expression;
        }
    },

    StoredProcedure: function (name, params, config) {

        var self = this;
        this.__typeName = "StoredProcedure";
        this.Name = name || null;
        this.Params = params || []; //Name, Value, Description, EventName
        
        var p = null;
        
        this.getDescription = function () {
            var desc = [];
            self.Params.forEach(function (p) {
                if (p.Value && wire.toBoolean(p.Visible, true))
                    desc.push(wire.expression.eval(p.Description, p) || p.Name.splitUpperCaseSpace() + " = " + p.Value);
            });
            return desc;
        }

        // chain query
        // change StoredProcedure to Procedure?
        this.param = function(name, value) {
            
            //var query = wire.data.procedure("sproc").param("a", "b"); 

            if(typeof name == "object")
                p = name;
            else
                p = {Name: name, Value: value};

            self.Params.push(p);

            return this;

        }

        this.eventName = function(name) {
            if(p)
                p.EventName = name;            
        }

        this.getParam = function (name) {
            return new wire.Collection("Name", self.Params).get(name);
        }

        this.setEventExpression = function (config) {

            var col = config.column;
            var ed = config.data;
            var da = wire.data.DataEventActions;
      
            var params = [];
      
            // collect param(s)
            self.Params.forEach(function (param) {
              if (param.Name == col)
                params.push(param);
              else
                //if ( (param.EventNames && param.EventNames.indexOf(col) > -1) || 
                if (param.EventName && param.EventName == col) 
                  params.push(param);
            });
      
            // put val(s) into array
            var vals = Array.isArray(ed.cell.value) ? ed.cell.value : [ed.cell.value];
      
            // set value(s) to param(s)
            var ival = 0;
      
            params.forEach(function (p) {

                if (ed.action == da.clear || ed.action == da.remove) {
                  p.Value = null;
                  p.Description = null;
                }
                else {
                  p.Description = ed.cell.label;
                  if (params.length > 1) {
                    p.Value = vals[ival];
                    if ((ival + 1) < vals.length)
                      ival += 1;
                  }
                  else p.Value = vals.join("|");
                }
        
              });
      
            return params.length;
      
        }        

        if (config) $.extend(this, config);
    },

    TableDelete: function () {

        this.__typeName = "TableDelete";
        this.Entity = null;
        this.Filter = [];

        this.from = function (from) {
            if (from)
                this.Entity = from;
            return this;
        }

        this.where = function (expression) {
            this.Filter = [];
            if (expression) {
                this.Filter.push(new wire.data.FilterSelection(new wire.data.CustomExpression(expression)));
            }
            return this;
        }
        this.contains = function (field, value) {
            this.Filter.push(new wire.data.FilterSelection(new wire.data.ContainsExpression(field, value))); return this;
        }

        this.eq = function (field, value, type) {
            var v = value;
            if (type == 'text')
                v = "'" + v + "'";
            this.Filter.push(new wire.data.FilterSelection(new wire.data.EqualsExpression(field, v))); return this;
        }

        this.ne = function (field, value, type) {
            var v = value;
            if (type == 'text')
                v = "'" + v + "'";
            this.Filter.push(new wire.data.FilterSelection(new wire.data.NotEqualsExpression(field, v))); return this;
        }

        this.in = function (field, value, type) {
            var v = value;
            if (type == 'text')
                v = "'" + v + "'";
            this.Filter.push(new wire.data.FilterSelection(new wire.data.InExpression(field, v))); return this;
        }        

        this.expression = function (expression) {
            this.Filter.push(new wire.data.FilterSelection(new wire.data.CustomExpression(expression)));
            return this;
        }

        return this;

    },

    Field: function(field, model){

        var self = this;
        this.Name = null;
        this.Entity = null;
        this.Alias = null;
        this.Hidden = null;

        this.label = function() {
            return self.Alias || self.Name;
        }

        this.description = function() {

            // sum ( [ table ] . [ field ] )
            
            var s = "";

            if(self.Aggregate)
                s += self.Aggregate + " ( ";

            if(self.Entity)
                s += "[ {0} ] . ".format(self.Entity);
            
            // .Field is holdover from earlier and if exists contains the name
            return s + "[ {0} ]".format(self.Field || self.Name) + (self.Aggregate ? " )" : "");     

        }

        $.extend(this, field);

        if(model)
            $.extend(this, model.getField(this));

    },

    TableQuery: function () {

        var self = this;
        this.__typeName = "TableQuery";
        this.Data = false;
        this.Distinct = false;
        this.Top = 0;
        this.Fields = []; // Name, Alias, Entity, Aggregate, EventName
        this.Entities = [];
        this.Filter = [];
        this.Expand = [];
        this.OrderBy = [];
        this.Joins = [];
        this.GroupBy = [];
        this.Paging = { Page: 0, Rows: 0 }
        this.Custom = null;
        
        var j = null;
        var e = null;

        this.data = function () {
            this.Data = true;
            return this;
        }

        this.distinct = function () {
            this.Distinct = true;
            return this;
        }

        this.field = function (field) {
            
            var f;
            
            if (typeof field == 'object')
                f = field;
            else
                f = { Name: field };
            
                this.Fields.push(f);

            this.eventName = function(name){
                f.EventName = name;
            }

            this.as = function (alias) {
                f.Alias = alias;
                return this;
            }

            return this;

        }

        this.fields = function () {
            if (arguments && arguments.length > 0) {
                for (i = 0; i < arguments.length; i++)
                    self.field(arguments[i]);
            }
            return this;
        }

        this.from = function (from) {
            if (from) {
                var e = new wire.data.DataTable(self.Entities).where().eq("Name", from).first();
                if (!e) this.entity(from);
            }
            return this;
        }

        this.where = function (expression) {
            self.Filter = [];
            if (expression) {
                self.Filter.push(new wire.data.FilterSelection(new wire.data.CustomExpression(expression)));
            }
            return this;
        }

        this.custom = function (obj) {
            self.Custom = obj;
            return this;
        }

        this.top = function (number) {
            self.Top = number;
            return this;
        }
        this.format = function (entity, format) {
            this.entity(entity.format(format));
            return this;
        }

        this.join = function (table, field) {
            return _join("inner", table, field);
        }

        this.leftJoin = function (table, field) {
            return _join("left", table, field);
        }

        this.rightJoin = function (table, field) {
            return _join("right", table, field);
        }

        this.fullJoin = function (table, field) {
            return _join("full", table, field);
        }

        function _join(type, table, field) {
            j = { Type: type, Table1: field ? table : e, Field1: field || table };
            self.Joins.push(j);
            return self;
        }

        this.on = function (table, field) {
            j.Table2 = field ? table : e;
            j.Field2 = field ? field : table;
            return this;
        }

        this.entity = function (name, qualifier) {
            e = name;
            self.Entities.push(new wire.data.EntityExpression(name, qualifier));
            return this;
        }

        this.attribute = function (attribute) {
            this.Entities.push(new wire.data.EntityExpression("attribute", attribute ? attribute : null)); return this;
        }

        this.clear = function (field) {

            var index = [];

            // by default, don't clear eqField=eqField
            self.Filter.forEach(function (e, i) {
                var exp = wire.data.QueryExpression.cast(e) || e;
                if (exp.Expression.Field == field && !(exp.Expression.isSameFieldExpression && exp.Expression.isSameFieldExpression()))
                    index.push(i);
            });

            // index.forEach(function (i) {
            //     self.Filter.splice(index[i], 1);
            // });

            for(var i = index.length -1; i >= 0 ; i--){
                self.Filter.splice(index[i], 1);
            }
               
            return this;
        }

        this.page = function (page, rows) {
            self.Paging.Page = page;
            if (typeof rows != 'undefined') self.Paging.Rows = rows;
            return this;
        }

        this.contains = function (field, value) {
            this.Filter.push(new wire.data.FilterSelection(new wire.data.ContainsExpression(field, value))); return this;
        }

        this.starts = function (field, value) {
            this.Filter.push(new wire.data.FilterSelection(new wire.data.StartsExpression(field, value))); return this;
        }

        this.between = function (field, value1, value2) {
            this.Filter.push(new wire.data.FilterSelection(new wire.data.BetweenExpression(field, value1, value2))); return this;
        }

        this.in = function (field, value, type) {
            var v = value;
            if (type == 'text')
                v = "'" + v + "'";
            this.Filter.push(new wire.data.FilterSelection(new wire.data.InExpression(field, v))); return this;
        }

        this.eq = function (field, value, type) {
            var v = value;
            if (type == 'text')
                v = "'" + v + "'";
            this.Filter.push(new wire.data.FilterSelection(new wire.data.EqualsExpression(field, v))); return this;
        }

        this.filter = function(fields) {

            if (!Array.isArray(fields))
                fields = [fields];

            fields.forEach(function(field){

                self.eqField(field, field);   

            });

            return this;
        }

        this.eqField = function (field1, field2) {
            if(!field2)
                field2 = field1;
            this.Filter.push(new wire.data.FilterSelection(new wire.data.FieldExpression(field1, field2))); return this;
        }

        this.ne = function (field, value, type) {
            var v = value;
            if (type == 'text')
                v = "'" + v + "'";
            this.Filter.push(new wire.data.FilterSelection(new wire.data.NotEqualsExpression(field, v))); return this;
        }

        // for custom web services
        this.param = function (field, value, type) {
            return self.eq(field, value, type);
        }
        
        this.setEventExpression = function(exp, param){            
            switch(exp){
                case "EqualsExpression":
                    self.eq(param.Field, param.Value);
                    break;
                case "StartsExpression":
                    self.starts(param.Field, param.Value);
                    break;
                case "ContainsExpression":
                    self.contains(param.Field, param.Value);
                    break;
                case "StartsExpression":
                    self.starts(param.Field, param.Value);
                    break;
                case "BetweenExpression":
                    if (Array.isArray(param.Value))
                        self.between(param.Field, param.Value[0], param.Value[1]);
                    break;
            }
        }

        this.expression = function (expression, description) {
            this.Filter.push(new wire.data.FilterSelection(new wire.data.CustomExpression(expression, description)));
            return this;
        }

        this.expand = function (fields) {
            for (i = 0; i < arguments.length; i++)
                this.Expand.push(arguments[i]);
            return this;
        }

        this.orderBy = function (field, desc) {
            this.OrderBy.push(new wire.data.OrderByExpression(field, desc));
            return this;
        }

        this.groupBy = function (fields) {
            //self.GroupBy = [];
            for (i = 0; i < arguments.length; i++) {
                var f;
                if (typeof (arguments[i]) == 'string')
                    f = { Field: arguments[i] };
                else
                    f = arguments[i];
                this.GroupBy.push(f);
            }
            return this;
        }

        this.expandData = function () {
            return this.expand("data");
        }

        this.getEventNameFields = function (eventName) {

            // check to see if this is an event name 
            // if so return fields that match
            var fields = [];

            if (self.Fields) {
                self.Fields.forEach(function (f) {
                    if (f.EventName && f.EventName == eventName)
                        fields.push(f.Name);
                });
            }

            if (self.Filter) {
                self.Filter.forEach(function (sel) {
                    if (sel.Expression.EventName && sel.Expression.EventName == eventName)
                        fields.push(sel.Expression.Field);
                });
            }

            return fields;

        }
        this.getFields = function (field, entity) {

            // check to see if this is an event name 
            // if so return fields that match
            var fields = [];

            if (self.Fields) {
                self.Fields.forEach(function (f) {

                    // ignore entity if it doesn't exist on the field or is not passed in
                    if (f.Entity && entity) {
                        if (f.Entity == entity && f.Name == field)
                            fields.push(f);
                    }
                    else
                        if (typeof field != 'undefined') {
                            if (f.Name == field)
                                fields.push(f);
                        }
                        else fields.push(f);
                });
            }

            if (self.Filter) {
                self.Filter.forEach(function (sel) {

                    // ignore entity if it doesn't exist on the field or is not passed in
                    var exp = sel.Expression;
                    if (exp.Entity && entity) {
                        if (exp.Entity == entity && exp.Field == field)
                            fields.push(exp);
                    }
                    else
                        if (typeof field != 'undefined') {
                            if (exp.Field == field)
                                fields.push(exp);
                        }
                        else fields.push(exp);
                });
            }

            return fields;

        }

        this.getFilterFields = function () {

            var rows = [];
            self.Filter.forEach(function (sel) {
                var exp = sel.Expression;
                rows.push({ Name: exp.Field, Alias: exp.Alias, Entity: exp.Entity });
            });
            return rows;            
        }

        this.removeField = function(field, entity) {

            for (var i = self.Fields.length - 1; i >= 0; i--) {

                const f = self.Fields[i]
                if (f.Name == field) {

                    if (entity) {
                        if(entity == f.Entity)
                            self.Filter.splice(i, 1);
                        }
                    else
                        self.Fields.splice(i, 1);
                }
                    
            };

        }

        this.removeGroupBy = function (field) {

            for (var i = self.GroupBy.length - 1; i >= 0; i--) {

                if (self.GroupBy[i].Field == field)
                    self.GroupBy.splice(i, 1);

            };

        }
                
        this.removeFilter = function (field, value, entity) {

            var indexes = [];
            var removeJoin = false;
            var entities = [];

            if(typeof field == "object"){
                value = field.Value;
                entity = field.Entity;
                removeJoin = field.removeJoin;
                field = field.Field;
            }                

            self.Filter.forEach(function (sel, index) {

                if (sel.Expression.Field == field 
                    && sel.Expression.Value == (typeof value != "undefined" ? value : sel.Expression.Value)
                    && sel.Expression.Entity == (typeof entity != "undefined" ? entity : sel.Expression.Entity)){
                    
                        indexes.push(index);
                        if(entity) entities.push(entity);
                    
                }

            });

            for (var i = indexes.length; i--;) {
                self.Filter.splice(indexes[i], 1);
            };

            if(removeJoin && entities.length){
                
                // removing this filter value may mean the join to it's entity is no longer needed

                entities.forEach(function(entity){

                    var count = 0;
 
                    self.Filter.forEach(function(f){
                        if(f.Expression.Entity && f.Expression.Entity == entity) count+=1;
                    })

                    if(count)
                        self.removeJoin(entity);

                });                

            }

            return this;

        }

        this.removeJoin = function(entity){

            var index = -1;
            //j = { Type: type, Table1: field ? table : e, Field1: field || table };

            self.Joins.forEach(function (j, i) {

                if(j.Table1 == entity || j.Table2 == entity)
                    index = i;

            });

            if(index > -1) self.Joins.splice(index, 1);

        }

        this.removeFilterOLD = function(field, entity){

            var index = -1;

            self.Filter.forEach(function (sel, i) {
                var exp = sel.Expression;
                if(exp.Field == field && (exp.Entity = (entity ? entity : exp.Entity)))
                    index = i;
            });

            if(index > -1) self.Filter.splice(index, 1);

        }

        this.filterDescription = function (field) {

            var desc = [];

            self.Filter.forEach(function (sel) {

                if (sel.Expression.Field == field)
                    desc.push(sel.getDescription());

            });

            return desc.join(" ");

        }

        this.filterValues = function (field) {

            var values = [];

            self.Filter.forEach(function (sel) {

                if (sel.Expression.__typeName != "FieldExpression")
                    if (sel.Expression.Field == field)
                        if (Array.isArray(sel.Expression.Value))
                            values = values.concat(sel.Expression.Value)
                        else
                            values.push(sel.Expression.Value);

            });

            return values;

        }

        this.fromScript = function (script) {
            var fn = new Function("return wire.data.{0};".format(script));
            return fn();
        }

        this.toScript = function () {

            var fields = [];
            var entity = [];
            var filter = [];
            var group = [];

            var q = this;

            var sql = "select()"

            if (q.Top > 0)
                sql += ".top({0})".format(q.Top);

            if (q.Distinct > 0)
                sql += ".distinct()";

            q.Fields.forEach(function (field) {
                var f = ".field(\"{0}\")".format(field.Name);
                if (field.Alias) f += ".as(\"{0}\")".format(field.Alias);
                fields.push(f);
            });

            if (fields.length > 0)
                sql += fields.join("");

            sql += ".from(";

            if (q.Entities.length == 1)
                sql += "\"{0}\")".format(q.Entities[0].Name);
            else {
                q.Entities.forEach(function (e) {
                    var s = ".entity(\"{0}\")".format(e.Name);
                    if (e.Qualifier)
                        s += ",{0}".format((typeof e.Qualifier == 'number') ? e.Qualifier : "\"" + e.Qualifier + "\"");
                    entity.push(s + ")");
                });
                sql += ")" + entity.join(".")
            }

            if (q.Expand.length > 0) {
                sql += ".expand(\"" + q.Expand.join("\",\"") + "\")";
            }

            q.OrderBy.forEach(function (exp) {
                sql += ".orderBy(\"{0}\", {1})".format(exp.Field, exp.Desc ? true : false);
            });

            q.GroupBy.forEach(function (f) {
                group.push(f.Field || f);
            });

            if (group.length > 0) {
                sql += ".groupBy(\"" + group.join("\",\"") + "\")";
            }

            q.Filter.forEach(function (f) {
                if (f.Expression.tojSQL)
                    filter.push(f.Expression.tojSQL());
            });

            if (filter.length)
                sql += ".where(){0}".format(filter.join("."));

            return sql;

        }


        return this;
    },

    DataTable: function (rows, columns) {

        var self = this;
        var eventCallbacks = [];
        var _rows = null;
        var _sel = null;

        this.__meta = {};
        this.Name = null;
        this.Id = null;
        this.Columns = [];
        this.Rows = [];
        //this.isDataTable = true;
        this.__typeName = "DataTable";

        this.dataTable = function (config) {
            var dt = self;
            if (config && config.distinct) dt = dt.distinct().table();
            if (config && config.name) dt.Name = config.name;
            return dt;
        }

        this.exists = function () {
            return self.count() > 0;
        }

        this.scaler = function () {
            var row = self.first();
            for (var prop in row) {
                return row[prop];
            }
        }

        this.first = function () {
            var rs = self.rows();
            if (rs)
                return rs[0];
            else
                return null;
        }

        this.firstOrDefault = function () {
            var f = self.first();
            return f || self.newRow();
        }

        //selfCount();
        this.count = function () {
            var rs = self.rows();
            if (rs)
                return rs.length;
            else
                return 0;
        }

        this.rows = function () {

            var rs;

            if (_sel && _sel.length)
                rs = self.table().Rows;
            else
                rs = _rows || self.Rows;

            _rows = null;
            _sel = null;
            return rs;

        }

        this.table = function () {

            var t;

            if (!_rows && !_sel)
                t = $.extend({}, this);

            else if (_sel) {

                _rows = _rows || self.Rows;
                var rs = [];
                var d = {};
                var dcount = {};

                _sel.forEach(function (s) {
                    s.as = s.as || s.name;
                });

                _rows.forEach(function (r, i, ar) {

                    var skey = "";
                    var key = {};

                    _sel.forEach(function (s) {
                        if (!s.agg) {
                            skey += r[s.name];
                            key[s.as] = r[s.name];
                        }
                    });

                    if (!d[skey]) {
                        d[skey] = key;
                        rs.push(key);
                    }
                    else
                        key = d[skey];

                    _sel.forEach(function (s) {
                        //                        if (s.agg) {
                        var p = s.name;
                        var a = s.as;
                        var v = s.exp ? wire.expression.eval(s.exp, r, i, ar) : r[p];
                        // does not include nulls
                        switch (s.agg) {
                            case "sum":
                                key[a] = key[a] ? key[a] - -v : v;
                                break;
                            case "count":
                                var _one = typeof v == 'undefined' ? 1 : (v ? 1 : 0);
                                key[a] = key[a] ? key[a] + _one : _one;
                                break;
                            case "dcount":
                                var _one = v ? 1 : (s.name != "_dcount" ? 0 : 1);;
                                if (s.name == "_dcount") dcount[a + v] = null;
                                key[a] = key[a] ? (dcount[a + v] ? key[a] : key[a] + _one) : _one;
                                if (v) dcount[a + v] = 1;
                                break;
                            case "max":
                                key[a] = key[a] ? (v > key[a] ? v : key[a]) : v;
                                break;
                            case "min":
                                key[a] = key[a] ? (v < key[a] ? v : key[a]) : v;
                                break;
                            case "avg":
                                var _v = v || 0;
                                var _one = (v ? 1 : 0);
                                key[a] = key[a] ? key[a] - -_v : _v;
                                key[a + "avg"] = key[a + "avg"] ? key[a + "avg"] + _one : _one;
                                break;
                            default:
                                key[a] = typeof v == "undefined" ? s.v : v;
                        }
                        //                        }
                    });

                });

                rs.forEach(function (r) {
                    _sel.forEach(function (s) {
                        if (s.agg == "avg") {
                            r[s.as] = r[s.as + "avg"] ? (r[s.as] / r[s.as + "avg"]) : null;
                            delete r[s.as + "avg"];
                        }
                    });
                });

                var cs = [];

                _sel.forEach(function (s) {
                    var c = self.getColumn(s.name);
                    if (!c) {
                        c = { Name: s.as || s.name, Title: s.Title, Format: s.Format, DataType: s.DataType };
                    }
                    else {
                        if (typeof (s.Format) != 'undefined')
                            c.Format = c.Format || s.Format;
                        if (s.as) {
                            c.Name = s.as;
                            c.Title = s.Title || c.Title;
                        }
                        else
                            if (s.Title)
                                c.Title = s.Title;
                    }
                    cs.push(c);
                });

                t = new wire.data.DataTable(rs, cs);

            }

            else {
                t = new wire.data.DataTable(_rows, self.Columns);
            }

            _rows = null;
            _sel = null;
            t.__meta = self.__meta; // paging in here
            return t;      

        }

        this.refresh = function (rows, columns) {

            // objects created from functions have methods which cause handson not to bind
            //rows.forEach(function (r, i) {
            //    rows[i] = $.extend({}, r);
            //});

            if (Array.isArray(rows))
                self.Rows = rows;
            else
                self.Rows = [rows];

            var cs = [];

            if (columns)
                cs = columns;
            else
                for (var prop in self.Rows[0])
                    cs.push(prop);

            self.Columns = [];

            cs.forEach(function (c) {

                var col = typeof c == 'object' ? c : self.getColumn(c);

                if (!col)
                    col = { Name: c, Title: c.indexOf(" ") > -1 ? c : c.splitUpperCaseSpace() };
                else
                    if (!col.Title) col.Title = col.Name.splitUpperCaseSpace();

                self.Columns.push(col);

            });

            return this;
        }

        this.newRow = function () {

            var r = {};

            if (self.Rows.length > 0) {

                r = $.extend(r, self.Rows[0]);
                for (var p in r)
                    r[p] = null;
            }
            else {

                self.Columns.forEach(function (col) {
                    r[col.Name] = null;
                });

            }            

            return r;
        }

        this.replace = function (keyName, keyValue, row){

            var col = new wire.Collection(keyName, self.Rows);
            self.Rows[col.index(keyValue)] = row;

        }
            
        this.insert = function (rows, first) {

            var rs = rows;

            if (!Array.isArray(rows))
                rs = [rs];

            var _rs = [];
            rs.forEach(function (r) {
                _rs.push($.extend(self.newRow(), r));
            });

            var noRows = (self.Rows.length == 0);

            if (first)
                Array.prototype.unshift.apply(self.Rows, _rs);
            else
                Array.prototype.push.apply(self.Rows, _rs);

            // set columns if there were no rows
            if (noRows) self.refresh(self.Rows, self.Columns)

            setCalcs();

            // need to redo per new design - raiseEvent('datachange', 'insert', { change: _rs, source: this });

            return this;

        }

        this.delete = function () {
            this.eq = function (column, value) {
                for (var i = self.Rows.length; i--;) {
                    if (self.Rows[i][column] == value)
                        self.Rows.splice(i, 1);
                }
                // loosing references to rows
                //var rs = self.where().ne(column, value).rows();
                //self.refresh(rs, self.Columns);
                return this;
            }
            this.ne = function (column, value) {
                for (var i = self.Rows.length; i--;) {
                    if (self.Rows[i][column] != value)
                        self.Rows.splice(i, 1);
                }
                //                var rs = self.where().eq(column, value).rows();
                //              self.refresh(rs, self.Columns);
                return this;
            }
            this.calc = function (expression) {
                var exp = wire.expression;
                //var rs = [];
                //self.Rows.forEach(function (r, i, s) {
                //    if (!exp.eval(expression, r, i, s))
                //        rs.push(r);
                //});
                //self.refresh(rs, self.Columns);
                for (var i = self.Rows.length; i--;) {
                    if (exp.eval(expression, self.Rows[i], i, self.Rows))
                        self.Rows.splice(i, 1);
                }
                return this;
            }
            return this;
        }

        this.update = function (column, value) {

            if (typeof value != 'undefined') {
                setValue(column, value);
                setCalcs();
            }
            this.value = function (value) {
                setValue(column, value);
                setCalcs();
                return this;
            }
            this.calc = function (expression) {
                //.set("_Id").calc(function (row, index, rows) { return e.I, d; })
                //.set("Id").calc("{Name} + '_' + {Id}")
                var exp = wire.expression;
                self.Rows.forEach(function (r, i, s) {
                    r[column] = exp.eval(expression, r, i, s);
                });
                setCalcs();
                return this;
            }
            return this;

        }

        this.join = function (table) {
            this.on = function (column1, column2) {
                var rows = [];
                if (!column2) column2 = column1;
                self.Rows.forEach(function (o1) {
                    table.where().eq(column2, o1[column1]).rows().forEach(function (o2) {
                        var _o1 = $.extend({}, o1);
                        for (var prop in o2) {
                            var _prop = prop;
                            if (_o1.hasOwnProperty(prop) && prop != column2)
                                _prop = _prop + '_2';
                            _o1[_prop] = o2[prop];
                        }
                        rows.push(_o1);
                    });
                });
                return new wire.data.DataTable(rows);
            }
            return this;
        }

        this.leftJoin = function (table) {
            this.on = function (column1, column2) {
                var rows = [];
                if (!column2) column2 = column1;
                self.Rows.forEach(function (o1) {
                    var b = false;
                    table.where().eq(column2, o1[column1]).rows().forEach(function (o2) {
                        var _o1 = $.extend({}, o1);
                        for (var prop in o2) {
                            var _prop = prop;
                            if (_o1.hasOwnProperty(prop) && prop != column2)
                                _prop = _prop + '_2';
                            _o1[_prop] = o2[prop];
                        }
                        rows.push(_o1);
                        b = true;
                    });
                    if (!b) {
                        var _o1 = $.extend({}, o1);
                        for (var prop in table.Rows[0]) {
                            var _prop = prop;
                            if (_o1.hasOwnProperty(prop) && prop != column2)
                                _prop = _prop + '_2';
                            _o1[_prop] = null;
                        }
                        rows.push(_o1);
                    };
                });
                return new wire.data.DataTable(rows);
            }
            return this;
        }

        this.select = function (columns) {

            _sel = [];
            var col;
            var a = arguments;

            for (var i = 0; i < a.length; i++) {
                _sel.push({ name: a[i], agg: null, as: a[i] });
            }

            this.value = function (value) {
                col.v = value;
                return this;
            }

            this.calc = function (expression) {
                col.exp = expression;
                return this;
            }

            this.as = function (column) {

                if (col)
                    col.as = column;

                return this;
            }

            this.format = function (format) {
                if (col)
                    col.Format = format;
                return this;
            }

            this.column = function (column) {

                if (typeof column == 'object') {
                    //col = $.extend(col, column);
                    col = column;
                    col.name = col.Name;
                }
                else {
                    col = {};
                    col.name = column;
                }

                col.agg = null;

                _sel.push(col);
                return this;
            }

            this.count = function (column) {
                col = { name: column, agg: "count" };
                _sel.push(col);
                return this;
            }

            this.distinctCount = function (column) {
                col = { name: column || "_dcount", agg: "dcount" };
                _sel.push(col);
                return this;
            }

            this.sum = function (column) {
                col = { name: column, agg: "sum" };
                _sel.push(col);
                return this;
            }

            this.max = function (column) {
                col = { name: column, agg: "max" };
                _sel.push(col);
                return this;
            }

            this.min = function (column) {
                col = { name: column, agg: "min" };
                _sel.push(col);
                return this;
            }

            this.avg = function (column) {
                col = { name: column, agg: "avg" };
                _sel.push(col);
                return this;
            }

            return this;
        }

        this.orderBy = function (column, desc) {

            _rows = _rows || self.Rows;
            var c = column;

            _rows = _rows.sort(function compare(a, b) {
                if (a[c] < b[c])
                    return -1;
                if (a[c] > b[c])
                    return 1;
                return 0;
            });

            if (desc)
                _rows.reverse();

            return this;

        }

        this.where = function () {

            var wr = self.Rows;

            selfCount();
            
            this.calc = function (expression) {
                _rows = [];
                wr.forEach(function (r, i, d) {
                    if (wire.expression.eval(expression, r, i, d)) _rows.push(r);
                });
                wr = _rows;
                return this;
            }

            this.ne = function (column, value) {
                _rows = [];
                wr.forEach(function (r) {
                    //var v = typeof r[column] != 'undefined' ? (r[column].Value || r[column]) : null;
                    var v = !(typeof r[column] === 'undefined') ? r[column] : null;
                    if (v != value) _rows.push(r);
                });
                wr = _rows;
                return this;
            }

            this.contains = function (column, value) {
                _rows = [];
                wr.forEach(function (r) {
                    var v = r[column] ? (r[column].Value || r[column]) : null;
                    if (v.toLowerCase().indexOf(value.toLowerCase()) > -1) _rows.push(r);
                });
                wr = _rows;
                return this;
            }

            this.starts = function (column, value) {
                _rows = [];
                var len = value.toLowerCase().length;
                wr.forEach(function (r) {
                    //var v = r[column] ? (r[column].Value || r[column]) : null;
                    var v = !(typeof r[column] === 'undefined') ? r[column] : null;
                    if (v.toLowerCase().substring(0, len) == value) _rows.push(r);
                });
                wr = _rows;
                return this;
            }

            this.eq = function (column, value) {

                _rows = [];

                var _values = Array.isArray(value) ? value : [value];
                var n = wire.isNumeric(_values[0]);

                if (n)
                    _values.forEach(function (_v, i) {
                        _values[i] = parseInt(_v);
                    });

                wr.forEach(function (r) {
                    //var v = typeof r[column] != 'undefined' ? (r[column].Value || r[column]) : null;
                    var v = !(typeof r[column] === 'undefined') ? r[column] : null;
                    if (n) v = parseInt(v);
                    if (_values.indexOf(v) > -1) _rows.push(r);
                });
                wr = _rows;
                return this;
            }
            
            // same implmentation as eq
            this.in = function (column, value) {
                return this.eq(column, value);
            }
                        
            return this;
        }

        this.nonEmpty = function () {

            var cs = _sel ? $.map(_sel, function (s) { return s.name; }) : self.columnNameArray();
            _rows = _rows || [];

            self.Rows.forEach(function (r) {
                var b = true;
                for (var c in cs) {
                    if ((r[c] && r[c].length > 0)) {
                        b = false;
                        break;
                    }
                    if (b)
                        _rows.push(r);
                }
            });
            return this;
        }

        this.top = function (count) {

            _rows = _rows || self.Rows;

            _rows = _rows.slice(0, count);

            return this;

        }

        this.distinct = function (columns) {

            var cs = [];

            if (columns) {
                var a = arguments;
                for (i = 0; i < a.length; i++)
                    cs.push(a[i]);
            }
            else
                cs = _sel ? $.map(_sel, function (s) { return s.name; }) : self.columnNameArray();

            _rows = _rows || self.Rows;

            var key = {};
            var skey;
            var rows = [];

            _rows.forEach(function (r) {
                skey = "";
                cs.forEach(function (c) {
                    if (typeof r[c] != 'object' && typeof r[c] != 'function')
                        skey += r[c]+"" ? r[c] : "n";
                });
                if (!key[skey]) {
                    rows.push(r);
                    key[skey] = 1;
                }
            });

            _rows = rows;

            return this;
        }

        this.distinctArray = function (column) {
            var rs = [];
            self.Rows.forEach(function (r) {
                if (rs.indexOf(r[column]) == -1)
                    rs.push(r[column]);
            });
            return rs;
        }

        // column methods

        this.addLookupColumn = function (name, data, forcolumn) {

            var rc;
            var lc = self.getColumn(forcolumn);

            if (lc) {
                rc = self.addColumn({ Name: name, Title: lc.Title || lc.Name, DataType: "Lookup", Lookup: { Data: data, Column: forcolumn } });

                lc.LookupColumn = name;

                if (typeof data[0] == 'object') {
                    var dt = new wire.data.DataTable(data);
                    self.Rows.forEach(function (r) {
                        r[name] = dt.first().eq("Id", r[forcolumn]).Name;
                    });
                }

            }

            return rc;
        }

        this.addColumn = function (column, value) {
            // Name, DataType, Title, [DataType==[Custom] -> [Custom]:"", On: {click: }
            var col = self.getColumn(column);
            if (!col) {
                col = column.Name ? column : { Name: column };
                if (typeof col.Title == 'undefined') col.Title = (col.Name.indexOf(" ") == -1 ? col.Name.splitUpperCaseSpace() : col.Name);
                self.Columns.push(col);
            }
            if (value) setValue(column, value);
            else
                self.Rows.forEach(function (r) {
                    if (!r[col.Name]) r[col.Name] = null;
                });

            this.value = function (value) {
                setValue(col.Name, value);
                return this;
            }
            this.format = function (format) {
                col.Format = format;
                return this;
            }
            this.type = function (type) {
                col.DataType = type;
                return this;
            }
            this.title = function (title) {
                col.Title = title;
                return this;
            }
            this.index = function () {
                return this.calc(function (r, i) { return i; });
            }
            this.calc = function (expression) {
                col.Expression = expression;
                setCalcs(col);
                return this;
            }

            return this;
        }

        this.removeColumn = function (name) {
            var i = new wire.Collection("Name", self.Columns).index(name);
            if (i > -1) self.Columns.splice(i, 1);
            self.Rows.forEach(function (r) {
                delete r[name];
            });
            return this;
        }

        this.renameColumn = function (oldName, newName) {

            var c = self.getColumn(newName);

            if (c) {

                c.Name = newName;

                self.Rows.forEach(function (r) {
                    r[newName] = r[oldName];
                    delete r[oldName];
                });
            }

            return this;

        }

        this.getColumn = function (name) {

            if (!name) return null;

            var cols = self.Columns;
            var _c = null;
            var _n = name.Name || name;

            cols.some(function (c) {
                if ((c.Name || c) == _n) _c = c;
                return _c != null
            });

            return _c;
        }

        this.getColumnTitle = function (name) {
            var col = self.getColumn(name);
            if (col) return col.Title || col.Name; else return null;
        }

        this.columnEmptyArray = function () {
            var cs = [];
            self.Rows.forEach(function (r) {
                for (var c in r) {
                    if ((!r[c] || r[c].length == 0) && cs.indexOf(c) == -1) cs.push(c);
                }
            });
            return cs;
        }

        this.columnNameArray = function () {

            var c = [];

            for (var p in self.Rows[0])
                c.push(p);

            if (c.length == 0)
                self.Columns.forEach(function (col) {                
                    c.push(col.Name);
                });

            return c;

        }

        this.columnTitleArray = function () {
            var c = [];
            self.Columns.forEach(function (col) {
                c.push(col["Title"] || col["Name"].splitUpperCaseSpace());
            });
            return c;
        }

        this.valueArray = function () {

            var rows = [];
            var row = [];

            rows.push(self.getColumnNameArray());

            this.Rows.forEach(function (r) {

                row = [];
                for (var prop in r)
                    row.push(r[prop]);
                rows.push(row);

            });

            return rows;

        }

        this.on = function (event, callback) {

            event.split(" ").forEach(function (e) {
                eventCallbacks.push({ e: event, cb: callback });
            });
        }

        function selfCount() {

            // count is defined 2x on DataTable
            // this resets the definition to the evaluating version
            // instead of the aggregate

            self.count = function () {
                var rs = self.rows();
                if (rs)
                    return rs.length;
                else
                    return 0;
            }

        }

        function setValue(c, v) {
            self.Rows.forEach(function (r) {
                r[c] = v;
            });
        }

        function setCalcs(c) {

            var exp = wire.expression;
            var cols = self.Columns;

            if (c)
                cols = [c];

            cols.forEach(function (col) {
                if (col.Expression) {
                    try {
                        self.Rows.forEach(function (r, i, s) {
                            r[col.Name] = exp.eval(col.Expression, r, i, s);
                        });            
                        //self.update().set(col.Name).calc(col.Expression); causing recursion with setCalcs call in update
                    } catch (e) { }
                }
            });

        }


        if (rows || columns)
            this.refresh(rows, columns);

        return this;
    },

    DataModel: function (config) {

        var self = this;
        this.Measures = null;
        this.Dimensions = null;

        this.Entities = []; //{Name, Alias, Hidden}
        this.Fields = []; //{Name, Alias, Entity, Aggregate, Hidden, Format}
        this.Relationships = []; // [{ Entity1, Field1, Entity2, Field2 }];

        /*

        Measures: [
            { Name: "AD COUNT", Table: "deals", Field: "Ad Count", Aggregation: "count" },
            { Name: "AVG PRICE", Table: "deals", Calc: "(price_regular-price)/price_regular", Aggregation: "avg", Format: "P1" }
        ],
        Dimensions: [
            {
                Name: "Location", Key: "zip", Entity: "vw_dim_Location", Fields: ["State", "City", "Zip"],
                Hierarchy: ["State", "City", "Zip"]
            },

        Hiearchies: [ {Entity: "vw_dim_Location", Fields: [], ParentId} ]



        */

        this.getEntity = function (entity) {

            var t = new wire.data.DataTable(self.Entities).where().eq("Name", entity);

            return t.first();
        }

        this.setEntity = function (entity) {
            if (!new wire.data.DataTable(self.Entities).where().eq("Name", entity.Name).first())
                self.Entities.push(entity);
        }

        this.getField = function (field, entity) {

            // field = {}, or name
            var f = field;

            if(typeof field == 'string')
                f = {Name: field, Entity: entity};

            var t = new wire.data.DataTable(self.Fields).where().eq("Name", f.Name);

            if (f.Entity)
                t.eq("Entity", f.Entity);

            return t.first();
        }

        this.setField = function (field) {
            if (!new wire.data.DataTable(self.Fields).where().eq("Name", field.Name).eq("Entity", field.Entity).first())
                self.Fields.push(field);
        }

        this.getMeasure = function (name) {

            return self.Measures
        }

        this.getDimension = function (field) {

            var dim;
            self.Dimensions.array().some(function (d) {
                dim = (d.Fields && d.Fields.indexOf(field) > -1) ? d : null;
                return dim != null;
            });

            if (dim) {
                var _d = { Id: "Id", ParentId: null, Levels: [], LevelDepth: "LevelDepth", Fields: [] }; //HasChildren
                return $.extend(_d, dim);
            }

        }

        $.extend(this, config);

        if (self.Measures)
            this.Measures = new wire.Collection("Name", this.Measures || []);

        if (self.Dimensions)
            this.Dimensions = new wire.Collection("Key", this.Dimensions || []);

    },

    provider: {

        Providers: {},

        register: function (provider) {
            if (provider)
                wire.data.provider.Providers[provider.id] = provider;
        },

        // get: function(id){
        //     return wire.data.provider.Providers[id];
        // },

        dataTable: function () {
            return new wire.data.DataTable(wire.data.provider.providerArray());
        },

        providerArray: function () {
            var a = [];
            for (p in wire.data.provider.Providers) {
                a.push(wire.data.provider.Providers[p]);
            }
            return a;
        }

    }

}

wire.data.delete = function () {
    return new wire.data.TableDelete();
}

wire.data.select = function () {

    var q = new wire.data.TableQuery();

    if (arguments && arguments.length > 0) {
        for (i = 0; i < arguments.length; i++)
            q.field(arguments[i]);
    }

    return q;
}

wire.data.call = function (method) {

    // helper for custom web service calls
    return wire.data.select().from(method).where();

}

wire.data.procedure = function (name) {

    var q = new wire.data.StoredProcedure(name);

    if (arguments && arguments.length > 0) {
        q.Name = arguments[0];
    }

    return q;
}

wire.data.DataModel.cast = function (model) {
    var m;
    if (!model.getField)
        m = $.extend(new wire.data.DataModel(), model);
    else
        m = model;
    return m;
}

wire.data.DataTable.cast = function (table) {
    var t = $.extend(new wire.data.DataTable(), table);
    // init fields including setting titles
    t.refresh(t.Rows, t.Columns);
    return t;
}

wire.data.TableQuery.cast = function (query) {
    // problem casting from function object into a new TableQuery
    // if already cast, internal 'self' reference gets messed up
    // no need to recast, just return
    if (typeof query.from == "function") {
        return query;
    }
    else {
        var q = $.extend(new wire.data.TableQuery(), query);
        q.Filter.forEach(function (f, i) {
            var exp = wire.data.QueryExpression.cast(f.Expression);
            if (exp)
                q.Filter[i].Expression = exp;
        });
        return q;
    }
}

wire.data.StoredProcedure.cast = function (query) {
    return $.extend(new wire.data.StoredProcedure(), query);
}

wire.data.DataSet.cast = function (dataset) {

    var ds = $.extend(new wire.data.DataSet(), dataset);

    if (ds.Source)
        ds.Source = wire.data.DataSource.cast(ds.Source);

    if (ds.Query) {

        switch (ds.Query.__typeName) {
            case "StoredProcedure":
                ds.Query = wire.data.StoredProcedure.cast(ds.Query);
                break;
            case "TableQuery":
                ds.Query = wire.data.TableQuery.cast(ds.Query);
                break;
            case "PivotQuery":
                if (eb.model)
                    ds.Query = eb.model.PivotQuery.cast(ds.Query);
                break;
        }
    }


    // View coming from the database as a string needs to be turned into a function
    ds.setView();
    // events don't get wired with no Query    
    return ds.initialize();
}

wire.data.DataSource.cast = function (datasource) {

    var o = $.extend(new wire.data.DataSource(), datasource);

    if (o.Provider == "local") o.Provider.Data = wire.data.DataTable.cast(o.Provider.Data);

    if (o.Model)
        o.Model = wire.data.DataModel.cast(o.Model);
    
    return o;

}

wire.data.FilterSelection.cast = function (sel) {
    var o = $.extend(new wire.data.FilterSelection(), sel);
    return o;
}

wire.data.EqualsExpression = function (field, value) {
    return new wire.data._EqualsExpression(field, value, false);
}

wire.data.NotEqualsExpression = function (field, value) {
    return new wire.data._EqualsExpression(field, value, true);
}
;wire.ui = {

    spinner: function (el, config) {

        var self = this;
        var _body = $(el || document.body), oh, ow;
        var _size;
        var _try = 0;
        var _guid = wire.guidDom();

        // https://fontawesome.com/v4.7.0/examples/#animated
        //fa-circle-o-notch
        //fa-spinner fa-pulse
        var _config = {
            css: {
                size1: "fa fa-circle-o-notch fa-spin fa-lg",
                size2: "fa fa-circle-o-notch fa-spin fa-2x",
                size3: "fa fa-circle-o-notch fa-spin fa-3x",
                size4: "fa fa-circle-o-notch fa-spin fa-4x",
                size5: "fa fa-circle-o-notch fa-spin fa-5x"
            },
            size: 3
        }

        this.size = function (size) {

            if (size)
                _size = size;

            // katz
            //oh = _size == 1 ? 24 : 50;
            ow = _size == 1 ? 12 : 0;

            // katz new, not checked in yet
            // moves spinner over buttons?
            oh = _size == 1 ? 0 : 66;
            //ow = _size == 1 ? 12 : 0;


            // original
            //oh = _size == 1 ? 0 : -400
            //ow = _size == 1 ? 12 : 0;

            return this;
        }

        this.on = function () {
            setTimeout(function () {
                var $l = $("<div >", { 'id': _guid, 'style': "z-index:10000", 'class': "wire-spinner {0} {1}".format(_config.css["size" + _size], (_config.css.extra || "")) });
                var k = $l.appendTo(document.body);
                if (_body.offset()) {
                    var of = _body.offset().left / 330;
                    k.css({ top: _body.offset().top + ((_body.innerHeight() - oh) / 2), left: (_body.offset().left - of) + ((_body.width() + ow) / 2) });
                    _body.addClass("wire-spinner-bg");
                    _body.prop("wire-spinner-on", true);
                }
            }, 200);
            return self;
        }

        this.off = function () {

            //$('.eb-spinner').remove();
            $(document.body).find("#" + _guid).remove();

            _body.removeClass("wire-spinner-bg");

            if (_body.prop("wire-spinner-on")) {
                _body.prop("wire-spinner-on", false);
            }
            else {
                _try += 1;
                if (_try < 5) setTimeout(self.off, 100);
            }

            return self;
        }

        if (config)
            wire.merge(_config, config);

        self.size(_config.size);

        return self;

    },

    Component: function (element, config, defaults) {
       
        var cfg2 = null;
        var self = this;
        var _config = null;
        var _data;
        var _ready = false;
        var ld;

        this.__typeName = "Component";

        //var _plugin; // optional jquery plugin
        this.plugin = null;

        this.initialize = function(configuration) {

            cfg2 = configuration;

            config = cfg2.config.user;

            if(!cfg2.element)
                throw "Missing selector config.element property";                
         
            // re-init ready
            _ready = false;

            // coming in from ng2 not query
            //if(typeof config.element == "string")
            element = $(cfg2.element);

            if(!element.length)	
                element = $("#"+cfg2.element);

            if(!element.length)	
                throw "Element '{0}' not found on the page".format(cfg2.element);

            //else
              //  plugin = config.element;

            defaults = cfg2.config.default;
            
            setConfig();

            wire.ui.prependClass(element, (cfg2.cssClass?cfg2.cssClass+" ":"") + "wire-component");

            //self.eventReady();
            
            if(cfg2.dataBind && wire.toBoolean(self.config().autoBind, true))
                this.bindData(cfg2.dataBind);            

        }    

        // this.plugin = function(plugin) {
        //     if(typeof plugin != "undefined") _plugin = plugin;
        //     return _plugin;
        // }

        this.element = function() {
            if(element)
                return element.get(0);   
            else
                return null;
        }


        this.$element = function() {
            return element;
        }

        this.ListenerId = function (event) {
            var el;
            // pull element id for event from dataset
            var c = self.config();
            if (c.data.Events) {
                var l = new wire.Collection("Name", c.data.Events).get(event);
                el = l.ListenerId;
            }
            return el;
        }

        this.getEventFunction = function (event) {
            // events can be functions or objects with a callback
            var c = self.config();
            var fn = null;
            if(c.events)
                fn = (typeof c.events[event] == "function") ? c.events[event] : (c.events[event].callback ? c.events[event].callback : null);
            return fn;
        }


        this.eventReady = function () {

            var c = self.config();

            if (!_ready) {
                _ready = true;
                setTimeout(function () {
                    if(element.trigger)
                    element.trigger('ready', self.config());
                    if (c.events && c.events.ready)
                        c.events.ready({element: element, config: self.config()});
                }, 200);
            }         
            if (ld) ld.off();
            ld = null;
        }

        this.eventDataBind = function () {

            var c = self.config();
            setTimeout(function () {
                if(element.trigger)
                    element.trigger("databind");
                if (c.events && (c.events.databind || c.events.dataBind)){
                    var _bind = c.events.databind || c.events.dataBind;
                    _bind({element: element, config: self.config(), data: self.data()});
                }
            }, 200);
            if (ld) ld.off();
            ld = null;
        }
        
        this.isReady = function() {
            return _ready;
        }

        this.ready = function (ready) {
            
            // backwards compattibility
            self.eventReady();
            self.eventDataBind();
            
        }

        // this.ready = function () {

        //     var c = self.config();

        //     if (!_ready) {
        //         _ready = true;
        //         setTimeout(function () {
        //             if(plugin.trigger)
        //                 plugin.trigger('ready', self.config());
        //             if (c.events && c.events.ready)
        //                 c.events.ready({plugin: plugin, config: self.config()});
        //         }, 200);
        //     }
        //     setTimeout(function () {
        //         if(plugin.trigger)
        //             plugin.trigger("databind");
        //         if (c.events && (c.events.databind || c.events.dataBind)){
        //             var _bind = c.events.databind || c.events.dataBind;
        //             _bind({plugin: plugin, config: self.config()});
        //         }
        //     }, 200);
        //     if (ld) ld.off();
        //     ld = null;
        // }

        this.model = {

            val: function(val) {

                // helper to handle getting and setting model values

                const cfg = self.config();

                if (cfg.model) {

                    var m = cfg.model;

                    if (typeof val != "undefined") {
                        
                        if (m.type == "number") {
                            if (Array.isArray(val)) {
                                val.forEach(function (v, i) {
                                    if (!isNaN(val[i])) val[i] = +val[i];
                                });
                            }
                            else if (!isNaN(val)) val = +val;
                        }

                        if (m.type == "date") {
                            if (Array.isArray(val)) {
                                val.forEach(function (v, i) {
                                    if (!(typeof val[i].getMonth === 'function')) val[i] = new Date(val[i]);
                                });
                            }
                            else if (!(typeof val.getMonth === 'function')) val = new Date(val);
                        }

                        if (m.ko)
                            m.ko(val);
                        else
                            m.obj[m.property] = val;

                    }

                    if (m.ko)
                        return m.ko();
                    else
                        return m.obj[m.property];

                }

                else return null;

            },

            clear: function () {

                const cfg = self.config();

                if (cfg.model) {

                    var val = null;
                    var m = cfg.model;

                    if (m.type == "number")
                        val = (typeof m.null != "undefined" ? m.null : 0);

                    return self.model.val(val);
                   
                }

                else return null;

            },

            toNumber: function (val) {

                const cfg = self.config();

                if (cfg.model && cfg.model.type == "number" && !isNaN(val)) val = +val;

                return val;

            }

        }

        this.ensureArray = function (value) {

            var v = value;

            if (!Array.isArray(v)) {
                if (v.indexOf(",") > -1)
                    v = $.map(v.split(","), $.trim);
                else
                    v = [v.trim()];
            }

            return v;
        }

        this.color = function () {
            var c = self.config();
            return (c && c.color) ? c.color : "default";
        }

        this.getTitle = function () {
            var c = self.config();
            return (c.panel && c.panel.title) || c.title || c.label || self.nameRef().Name || "";
        }

        this.select = function () {

            var c = self.config();
            var sel = c.select;
            var cols = c.fields;
            var hide = c.hide;

            if (sel) {
                if (typeof sel == 'string') sel = sel.split(",");
            }
            else
                sel = this.data().columnNameArray();

            if (cols) {
                for (var c in cols) {
                    var i = sel.indexOf(c);
                    if (i > -1 && cols[c].visible != undefined && !cols[c].visible) {
                        sel.splice(i, 1);
                    }
                };
            }

            if (hide) {                
                if (!Array.isArray(hide))
                    hide = [hide];
                //for (var c in hide) {
                hide.forEach(function(c){
                    var i = sel.indexOf(c);
                    if(i > -1)
                        sel.splice(i, 1);
                });
            }

            return sel;
        }

        this.fields = function() {
            if(cfg2)
                return self.updateFieldSchema(cfg2.fields); 
        }

        this.updateFieldSchema = function (schema) {

            var c = self.config();            
            var m = c.map || c.schema || c.fields;  // passed in from user overridding the default mapping
            var s = schema;

            for (var prop in s)
                s[prop] = (m && m[prop]) || s[prop];

            return s;
        }
       
        this.configRow = function (row) {
            return self.schemaRow(row);
        }

        this.schemaRow = function (tableRow) {

            // look for property value set directly on config 
            // otherwise, use the property on the table row
            var src = self.config();

            return {
                val: function(prop){
                    return src[prop] || tableRow[prop];
                }
            };

        }

        this.dataBind = function (cb, cbData) {
            this.bindData(cb, cbData);
        }

        this.bindData = function (cb, cbData) {

            var d = getDataRef();
            var cfg = self.config();
            var b = element;            

            if (typeof d == 'function') {
                d = d(cfg.dataconfig);
            }

            if (d.done) {   
                _spinner();
                d.done(function (_d) {
                    _data = _d;
                    _done();
                })
                .processing(function () {
                    _spinner();
                })
                    .fail(function (ex) {                       
                        _done(ex);
                        if(typeof wire.bsErrorModal != 'undefined')
                            wire.bsErrorModal(ex);
                        else {
                            if(ex.Message)
                                alert(ex.Message);
                            console.log(ex);
                        }
                });
            }
            else {
                _data = d;
                _done();
            };

            function _spinner() {
                if (wire.toBoolean(cfg.spinner, true))
                    if (!ld && element.is(":visible"))
                        ld = new wire.ui.spinner(b).size((cfg.spinner && cfg.spinner.size) ? cfg.spinner.size : 3).on();
            }

            function _done(ex) {
                var c = self.config();
                if (ld) {
                    ld.off();
                    ld = null;
                }
                if (ex) {
                    if (c.events && c.events.fail)
                        c.events.fail(ex, cbData);
                }
                else
                    cb(cbData);
            }

        }

        this.data = function (data) {
            if (data) _data = data;
            return _data;
        }
        this.table = function () {            
            return _data;
        }

        this.colId = function (schema) {
            var d = self.data();
            return d.getColumn(schema.id) ? schema.id : schema.name;
        }

        this.nameId = function () {
            var n = self.nameRef();
            return n.Id || n.Name;
        }

        this.nameRef = function () {
            var c = self.config();
            var m = c.map || c.schema;
            var n = {};

            if (m && (m.id || m.name)) {
                n.Name = m.name; n.Id = m.id;
            }
            else {
                var d = self.data();
                if (d)
                    if (d.Id || d.Name) { n.Name = d.Name; n.Id = d.Id; }
            }
            return n;
        }

        this.config = function () {
            if (!_config) setConfig();
            return _config;
        }

        function getDataRef() {

            var cg = self.config();
            var dp = cg.data;
            var fd = cg.field;

            if (typeof dp == 'string') {
                var dp2 = wire.data.DataManager.DataSets.get(dp);
                if (dp2) {
                    cg.data = dp2;
                    dp = dp2;
                }
            }         

            // not field or data reference
            if (!dp && !fd)
                throw "No data reference specified";

            if (fd) return ds(); else return vw();

            function ds() {

                var q;
                var source = eval(fd.source);
                var ismodel = (source.Type.toLowerCase() == "model");

                var lv = [0, 1];
                if (fd.levels) {
                    lv = [];
                    for (i = 0; i < fd.levels; i++) {
                        lv.push(i);
                    }
                }

                if (ismodel)
                    q = $pivotquery.select().onrows().dimension(fd.name).levels(lv).oncols().measure().from(fd.model);
                else
                    q = $tablequery.select(fd.name).from(fd.table);

                var dset = new wire.data.DataSet({
                    Events: [{ Name: "dataselect", Listen: false }],
                    Source: source,
                    Query: q
                });

                if (!cg.dataConfig) cg.dataConfig = {};

                if (ismodel) {
                    cg.dataConfig.dimension = cg.dataConfig.dimension || fd.name;
                    return dset.dimensionTable;
                }
                else {
                    cg.dataConfig.name = cg.dataConfig.name || fd.name;
                    cg.dataConfig.distinct = cg.dataConfig.distinct || fd.distinct;
                    return dset.dataTable;
                }

            }

            function vw() {

                // turns string declaritive bind into an obj ref

                var d = self.config().data;

                // angular
                //var cfg = self.config();

                //if (typeof d == 'string' && cfg.ngData)
                //    d = cfg.ngData.eval(d);

                if (d.view)
                    d = d.view;

                if (Array.isArray(d))
                    return new wire.data.DataTable(d);

                //if (d instanceof wire.data.DataSet) // does not work across iframe boundries                
                if (d.isDataSet)
                    return d.dataTable;

                if (typeof d != 'string')
                    return d;

                var ev = null;

                if (eval(d) instanceof wire.data.DataSet)
                    d = d + ".dataTable";

                // verify the string evals to an object
                try { ev = eval(d); }
                catch (er) { }

                if (ev == null || typeof ev == 'undefined')
                    throw "Unable to resolve view reference from " + d;
                else
                    return ev;
            }

        }

        function setConfig() {

            var self = this;
            var p = element;
            var d = p.data();
            var c = defaults ? defaults : {};

            if (d && d.options) {
                c = $.extend(true, c, d.options);
            }   

            if (config)
                wire.merge(c, config);

            /* declarative binding causing problem with re-initialzation of select2 (and probably others) leaving plugin.data() with data in it and resetting it here
            if (d) {
                $.each(d, function (p, v) {

                    //var n = p.replace(/([a-z](?=[A-Z]))/g, '$1:');
                    var n = p;
                    var num = n.split(":").length - 1;
                    var s;
                    var _v = v + "";

                    if (_v.substring(0, 2) == "[[") { //array -> "[[a]]"                                                
                        s = _v.substring(2);
                        s = s.substring(0, s.length - 2);
                        s = "\":[\"" + s.split(",").join("\",\"") + "\"]";
                    }
                    else if (_v.indexOf(",") > 0) //array -> "a,b,c" 
                        s = "\": [\"" + _v.split(",").join("\",\"") + "\"]";
                    else
                        if (wire.isBoolean(_v))
                            s = "\":" + _v;
                        else
                            s = "\":\"" + _v + "\"";

                    s = "{\"" + n.replace(/:/g, "\":{\"") + s + new Array(num + 1).join("}") + "}";

                    c = $.extend(true, c, $.parseJSON(s));

                });
            }
            */

            //default panel to false
            if (typeof c.panel == 'undefined') c.panel = false;

            _config = c;

        }

        //self.initialize();

    },

    prependClass: function (el, sClass) {
        var s = $(el).attr('class') || "";;
        var ss = s.split(" ");
        sClass = sClass.split(" ");
        //sClass.forEach(function (cs, i) {
        for (var i = sClass.length - 1; i >= 0; i--) {
            var cs = sClass[i];
            if (ss.indexOf(cs) > -1) sClass.splice(i, 1);
        };
        el.attr('class', (sClass.join(" ") + " " + s).trim());
    },

    config: {
        tableExport: { downloadUrl: "//service.eblocks.com/serve/download" },
        styles: {
            drillExpand: "wire-icon-drill-expand",
            drillCollapse: "wire-icon-drill-collapse",
            drillNone: "wire-icon-drill-none"
        }
    } 

};

wire.ui.validate = function(cfg) {

    let config = cfg.field;
    let value = cfg.value;
    let error = null;
    let msg = cfg.error;
    let exp = "";

    if (value != null && value !== "") {

        switch (config.type) {

            case "regex":

                //https://www.regextester.com/95029
                
                exp = new RegExp(config.exp);
                if (!exp.test(value))
                    error = msg || "Failed regular expression evaluation";
    
                break;

            case "phone":

                exp = new RegExp("^\\(?([0-9]{3})\\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$");
                if (!exp.test(value))
                    error = msg || "Invalid phone number";
    
                break;
    
            case "email":
    
                // https://regexr.com/3e48o
    
                exp = new RegExp("^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,}$"); // 2,4 removed to handle top level domains larger than 4 chars (uInvest)
                if (!exp.test(value))
                    error = msg || "Invalid email address";
    
                break;
        
            case "date":

                //Object.prototype.toString.call(date) === '[object Date]'
                if (!value instanceof Date) 
                    error = msg || "Must be a valid date";
                
                break;

            case "number":

                if (isNaN(value)) 
                    error = msg || "Must be a valid number";
                
                if (typeof config.gt != "undefined")
                    if (value <= config.gt)
                        error = msg || "Must be greater than {0}".format(config.gt);

                break;

            case "value":
                //name: "cashTrade", type: "value", values: ['Y', 'N'], case: false

                var _valid = false;
                // ignore case - ignore by default
                if (!config.case)
                    _valid = (config.values.indexOf(value.toLowerCase()) > -1) || (config.values.indexOf(value.toUpperCase()) > -1)
                else
                    _valid = (config.values.indexOf(value) > -1);

                if (!_valid)
                    error = msg || "Must be one of the following: {0}".format(config.values.join(","));
                
                break;

            case "custom":

                //name: "runTimeFormat", type: "custom", validate: function (config: any) {

                if (config.validate)
                    error = config.validate(config);

                break;

        }
        
    }

    // override if required
    if (wire.isBoolean(config.required, false) && (value === "" || value == null))
        error = "Required field";


    return error;

};

wire.ui.Component.create = function(name){
    
    let obj = window;
    
    // wire.bsTable
    name.split(".").forEach((_name) => {
      if(obj)
        obj = obj[_name];
    });

    if(obj)
      return new obj();
    else
      throw "Unable to find the object {0}".format(name);

}

wire.ui.Component.extend = function (component) {

    var base = new wire.ui.Component();
    var obj = Object.create(base);
    return $.extend(obj, component);
    
};

;wire.data.LocalServiceProvider = function (config) {

        var self = this;
        var entityName = "Local Data";

        this.allow = {
            delete: false,
            discover: true,
            write: false,
            tableQuery: {
                orderBy: 1, //single-field
                groupBy: false
            }
        }

        this.getResponseTable = function (response) {
            return response;
        }

        this.exec = function (q) {
            return getData(q);
        }

        this.execAsync = function (q, options) {

            var deferred = $.Deferred();
            var promise = deferred.promise();

            // defer object is null in dataset.ensuredata
            setTimeout(function () {
                getData(q, function(d){
                    deferred.resolve(d, null, options);
                });
            }, 100);

            return promise;
        }

        this.discoverEntities = function (options) {
            // Name, Schema, EntityType, HasChildren, ParentId
            var table = config.dataSource.Name || entityName;
            return new wire.data.DataTable([{ Name: table, Schema: "local", EntityType: "table", HasChildren: true, ParentId: 0 }])
        }

        this.discoverEntitiesAsync = function (options) {

            var deferred = $.Deferred();
            var promise = deferred.promise();

            setTimeout(function () {
                deferred.resolve(self.discoverEntities(options));
            }, 100);

            return promise;

        }

        this.discoverFields = function (options) {

            var table = new wire.data.DataTable(config.dataSource.Provider.Data.Columns);

            table.addColumn("ParentId").value(config.dataSource.Name || entityName);

            table.addColumn("EntityType").value("field");

            return table;
        }

        this.discoverFieldsAsync = function (options) {

            var deferred = $.Deferred();
            var promise = deferred.promise();

            setTimeout(function () {
                deferred.resolve(self.discoverFields(options));
            }, 100);

            return promise;
        }

        this.getEntityResponseTable = function (response) {
            return response;
        }

        function getData(q, cb) {

            // { Data: null, Json: {url: null}, Csv: { url: null, config: null}} // csv config is Papa config

            var d = config.dataSource.Provider.Data;

            var json = config.dataSource.Provider.Json;
            var csv = config.dataSource.Provider.Csv;
                    
            switch(true){

                case d != null:

                    _getData();    

                break;

                case (typeof json == "object"):

                    if(cb)
                        wire.get(json.url).done(function(obj){
                            d = obj;
                            _getData();
                        }).fail(function(ex){
                            console.log(ex);
                            throw "Unable to load data from Json Url: " + json.url;
                        });
                    else
                        d = wire.getWait(json.url);

                break;

                case (typeof csv == "object"):

                    if(typeof Papa == "undefined"){
                        wire.loadJs("https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js", function() {
                            _parse();
                        });
                    }
                    else _parse();
                    
                    function _parse() {

                        let _cfg = csv.papa || {};

                        _cfg.complete = function(obj) {
                            d = obj;
                            _getData();                                            
                        }

                        _cfg.error = function(ex){
                            console.log(ex);
                            throw "Unable to load data from csv Url: " + csv.url;
                        }

                        Papa.parse(csv.url, _cfg);

                    }
            

                break;

                default: 
                    throw "Unable to obtain data reference in local service provicer";
                    console.log(config.dataSource.Provider);
                break;                

            }

            function _getData() {
            
                if (!d) {
                    d = new wire.data.DataTable();
                    if(cb) cb(d);
                    return d;
                }

                // be sure we have columns for all row props

                if(!(d.__typeName == "DataTable"))
                    d = new wire.data.DataTable(d);

                if (d.Rows.length)
                    for (var p in d.Rows[0])
                        if (!d.getColumn(p)) d.addColumn(p);

                var _d = $.extend({}, d);

                if (q.Fields && q.Fields.length > 0) {
                    _d.select();
                    q.Fields.forEach(function (f) {
                        var _f = $.extend({}, f);
                        _d.column(_f);
                    });
                }

                if (q.Distinct) _d.distinct();

                if (q.Top > 0) _d.top(q.Top);

                // filter
                var eq = {}; // { field1: [value1, value2], field2:... }
                var ct = {};
                var sw = {};
                
                q.Filter.forEach(function (sel) {

                    var exp = sel.Expression;

                    switch (exp.__typeName) {

                        case "EqualsExpression":
                            eq[exp.Field] = eq[exp.Field] || [];
                            eq[exp.Field].push(exp.Value);
                            break;

                        case "InExpression":
                            eq[exp.Field] = eq[exp.Field] || [];
                            eq[exp.Field] = eq[exp.Field].concat(exp.Value);
                            break;

                        case "ContainsExpression":
                            ct[exp.Field] = exp.Value;
                            break;

                        case "StartsExpression":
                            sw[exp.Field] = exp.Value;
                            break;

                    };

                });

                if (q.Filter.length) {

                    _d.where();

                    for (var field in eq) {
                        _d.eq(field, eq[field]);
                    }

                    for (var field in ct) {
                        _d.contains(field, ct[field]);
                    }

                    for (var field in sw) {
                        _d.starts(field, sw[field]);
                    }

                }

                // only 1 field supported
                if (q.OrderBy.length > 0)
                    _d.orderBy(q.OrderBy[0].Field, q.OrderBy[0].Desc);


                var t = _d.table();

                // paging
                if (q.Paging.Page) {
                    var length = t.Rows.length;
                    var rows = q.Paging.Rows || 10;
                    var begin = (q.Paging.Page - 1) * (q.Paging.Rows || rows);
                    t = new wire.data.DataTable(t.Rows.slice(begin, begin + rows));
                    t.__meta.paging = q.Paging;
                    t.__meta.paging.Rows = rows;
                    t.__meta.paging.TotalRows = length;
                }

            
                if(cb)cb(t);
                return t;

            }
        }

    };


wire.data.provider.register({
    id: "local",
    type: "Table",
    name: "Local Data Service Provider",
    provider: wire.data.LocalServiceProvider
});
;wire.data.TableServiceProvider = function (config) {

    var self = this;
    var ds = config.dataSource;

    this.allow = {
        tableQuery: {
            orderBy: 2, //multi-field
            groupBy: true
        },
        storedProcedure: true,
        discover: true,
        test: true,
        preview: true,
        model: true
    };

    this.getResponseTable = function (response) {

        // WCF local service returns JSON strings
        if(typeof response == "string")
            response = JSON.parse(response);

        var table = wire.data.DataTable.cast(response);
        // translate column types            
        table.Columns.forEach(function (col) {
            switch (col.DataType) {
                case "Int32":
                    col.Type = "int";
                    break;
                case "String":
                    col.Type = "string";
                    break;
                case "Boolean":
                    col.Type = "boolean";
                    break;
                case "Guid":
                    col.Type = "guid";
                    break;
                default:
                    break;
            }
        });
        return table;
    }

    this.getEntityResponseTable = function (response) {

        // WCF local service returns JSON strings
        if(typeof response == "string")
            response = JSON.parse(response);

        var table = wire.data.DataTable.cast(response);
        // translate column types                    
        table.addColumn("Type");
        table.Rows.forEach(function (row) {
            switch (row.DataType) {
                case "float":
                case "smallint":
                case "tinyint":
                case "int":
                case "money":
                case "real":
                    row.Type = "int";
                    break;
                case "nvarchar":
                case "nchar":
                case "char":
                case "varchar":
                    row.Type = "string";
                    break;
                case "bit":
                    row.Type = "boolean";
                    break;
                case "uniqueidentifier":
                    row.Type = "guid";
                    break;
                default:
                    row.Type = row.DataType;
                    break;
            }
        });
        return table;
    }

    this.discoverEntities = function (options) {
        var results = wire.postWait(getUrl("discover/tables", options), getData(null), getOptions());
        return wire.data.DataTable.cast(results);
    }

    this.discoverEntitiesAsync = function (options) {
        return wire.post(getUrl("discover/entities", options), getData(null), getOptions());
    }

    this.discoverFields = function (options) {
        var results = wire.postWait(getUrl("discover/fields", options), getData(null), getOptions());
        return self.getEntityResponseTable(results);
    }

    this.discoverFieldsAsync = function (options) {
        return wire.post(getUrl("discover/fields", options), getData(null), getOptions());
    }

    this.discoverCatalogs = function (options) {
        var results = wire.postWait(getUrl("discover/databases", options), getData(null), getOptions());
        return wire.data.DataTable.cast(results);
    }

    this.discoverCatalogsAsync = function (options) {
        return wire.post(getUrl("discover/databases", options), getData(null), getOptions());
    }


    this.discoverProcedures = function (options) {
        var results = wire.postWait(getUrl("discover/procedures", options), getData(null), getOptions());
        return wire.data.DataTable.cast(results);
    }

    this.discoverProceduresAsync = function (options) {
        return wire.post(getUrl("discover/procedures", options), getData(null), getOptions());
    }
    
    this.discoverProcedureParameters = function (options) {
        var results = wire.postWait(getUrl("discover/parameters", options), getData(null), getOptions());
        return wire.data.DataTable.cast(results);
    }

    this.discoverProcedureParametersAsync = function (options) {
        return wire.post(getUrl("discover/parameters", options), getData(null), getOptions());
    }

    this.test = function (options) {
        return wire.postWait(getUrl("test", options), getData(null), getOptions());
    }

    this.exec = function (q, options) {
        var results = wire.postWait(getUrl("exec"), getData(q), getOptions(options));
        return self.getResponseTable(results);
    }

    this.execAsync = function (q, options) {
        return wire.post(getUrl("exec"), getData(q), getOptions(options));
    }

    this.write = function (entity, data, options) {
        try {
            // rows in, return updated rows
            var table = wire.postWait(getUrl("write"), getWriteData(entity, data, options), getOptions());
            return wire.data.DataTable.cast(table).Rows;
        }
        catch (ex) {
            throw ex;
        }
    }

    this.writeAsync = function (entity, data, options) {
        return wire.post(getUrl("write"), getWriteData(entity, data, options), getOptions());
    }

    this.delete = function (q, options) {
        // options not used
        return wire.postWait(getUrl("delete"), getData(q), getOptions());
    }

    function getOptions(options) {

        var o = $.extend({}, options)

        if (!ds)
            return o;

        if(ds.Ajax)
            o = ds.Ajax;

        // backwards compat with Connector
        var svc = ds.Provider.ServiceId || ds.Provider.Connector || null;

        if (svc && ds.Provider.SecretKey) {
            o.headers = { "Authorization": "Basic " + window.btoa(svc + ":" + ds.Provider.SecretKey) };
        }
        
        if (ds.Headers)
            o.headers = o.headers ? $.extend(o.headers, ds.Headers) : ds.Headers;

        // if not using gateway, need to send json post as text
        // UseGateway
        if(!wire.toBoolean(ds.Provider.Custom, false))
            o.contentType = "text/plain";
            
        return o;
    }

    function getWriteData(entity, data, options) {
        if (!Array.isArray(data))
            data = [data];
        var d = getData(null);
        return $.extend(d, { entity: entity || null, data: data || null, options: options || null });
    }


    function getData(q) {

        var d = {};

        if (q) {
            switch (q.__typeName) {
                case "TableQuery":
                    d.query = q;
                    break;
                case "TableDelete":
                    d.delete = q;
                    break
                case "StoredProcedure":
                    d.procedure = q;
                    break;
                default:
                    throw "Unable to resolve query type";
                    break;
            }
        }

        // connection object being passed up
        if (ds.Provider.ConnectionObject)
            d.connectionObject = ds.Provider.ConnectionObject;

        return d;
    }

    function getUrl(method, options) {

        var url = "{0}/{1}/{2}?connection={3}";
        var root = ds.ServiceRoot;

        // if(wire.toBoolean(ds.Provider.UseGateway, false))
        //     root = ds.Provider.ServiceRoot || ds.ServiceRoot || "https://gateway.wirebootstrap.com";
        //  else {
        //         if(!ds.Provider.Server)
        //         throw "Server property not set on DataSource.Provider";
        //     else
        //         root = "http://{0}/query.svc".format(ds.Provider.Server);
        //  }

        url = url.format(root, ds.Provider.AltRoute || "table", method, ds.Provider.ConnectionId);

        if (options) {
            for (var option in options) {
                url += "&{0}={1}".format(option, options[option]);
            }
        }

        return url;

    }

}

wire.data.provider.register({
    id: "table",
    type: "Table",
    name: "On-premise Table Data Service Provider",
    provider: wire.data.TableServiceProvider
});
;wire.data.CustomServiceProvider = function (config) {

        var self = this;
        var _ds = config.dataSource;

        this.allow = {
            tableQuery: true,
            storedProcedure: false,
            discover: false,
            test: true,
            preview: false,
            model: false
        }

        this.getResponseTable = function (data) {
            return new wire.data.DataTable(data);
        }

        this.exec = function (query, options) {

            var opt = $.extend(getOptions(), options);
            var url = getUrl(query, null, opt);

            // custom data needs to be posted
            if (query.Custom)
                return wire.postWait(url, query.Custom, opt);
            else
                return wire.getWait(url, opt);

        }

        this.execAsync = function (query, options) {

            var opt = $.extend(getOptions(), options);
            var url = getUrl(query, null, opt);

            // custom data needs to be posted
            if (query.Custom)
                return wire.post(url, query.Custom, opt);
            else
                return wire.get(url, opt);            

        }

        this.write = function (entity, data, options) {
            var o = $.extend(getOptions(), options);
            var rows = wire.postWait(getUrl(null, entity, o), data, o);
            return rows;
        }

        this.delete = function (q, options) {
            var o = $.extend(getOptions(), options);
            return wire.getWait(getUrl(q, null, o), o);
        }

        this.test = function (){             
            if(!_ds.Provider.testMethod)
                throw "Unable to test this service.  A root service url or test method was not provided.";
            else
                {
                    var url = "{0}/{1}".format( (_ds.ServiceRoot || ""), _ds.Provider.testMethod);
                    return wire.getWait(url, getOptions());
                }
        }

        function getOptions() {
            //Auth: { Key: { AppId: "122", Secret: "ff" } }        
            //{ headers: {"Authorization": "Basic "+ window.btoa(_ds.Auth.Key.AppId + ':' + _ds.Auth.Key.Secret) } };            

            var o = {};

            if(_ds && _ds.Ajax)
                o = _ds.Ajax;

            if (_ds && _ds.Headers)
                o.headers  = _ds.Headers;

            return o;
            
        }

        function getUrl(q, entity, options) {

            var expressions = {
                CustomExpression: "{Expression}",
                EqualsExpression: "{Field}={Value}",
                StartsExpression: "{Field}={Value}",
                // filter will go up as param=value1||value2
                InExpression: function (row) {
                    return "{0}={1}".format(row.Field, row.Value.join("||"));
                }
            }

            /*
                [root]/[entity][where]
                [root]/[entity]/{Id}[where]
                [root]/[entity]/{Id}[action][where] (TODO)
            */
            var url = (options && options.Provider && options.Provider.UrlTemplate) ? options.Provider.UrlTemplate : "[root]/[entity][where]";

            var p = wire.expression;
            var where = [];
            var filter = [];


            if(q && q.__typeName == "StoredProcedure"){
                
                entity = q.Name;

                var params = [];
                
                q.Params.forEach(function(param){                                        
                    params.push(new wire.data.EqualsExpression(param.Name, param.Value));
                });

                _filters(params);

            }
            else {

                entity = entity || (q.Entity) || ((q.Entities && q.Entities.length) ? q.Entities[0].Name : "");

                if (q) {
                    if (q.Fields && q.Fields.length > 0)
                        where.push("$select=" + q.Fields.map(function (f) { return f.Name; }));

                _filters(q.Filter);

                }
            }

            function _filters(filters) {

                filters.forEach(function (s) {
                    var exp = s.Expression;
                    // check for field in path filter position 
                    // for eq expression only 
                    // otherwise use query position
                    var path = exp.Field ? "{"+exp.Field+"}" : null;
                    if(path && url.indexOf(path)>-1 && exp.__typeName == "EqualsExpression"){
                        url = url.replace(path, exp.Value)
                    }
                    else {                        
                        var sexp = p.eval(expressions[exp.__typeName], exp);
                        filter.push(sexp);
                    }
                });

            }

            if (options && options.params)
                for (var obj in options.params)
                    filter.push(obj + "=" + options.params[obj]);

            if (filter.length > 0) where.push(filter.join("&"));            

            //"[root]/[entity][filter]";
            url = url.replace("[root]", _ds.Provider.serviceRoot || _ds.ServiceRoot || "");
            url = url.replace("[entity]", entity);
            url = url.replace("[where]", where.length ? "?" + where.join("&") : "");

            return url;
        }


    }


wire.data.provider.register({
    id: "custom",
    type: "Table",
    provider: wire.data.CustomServiceProvider
});

