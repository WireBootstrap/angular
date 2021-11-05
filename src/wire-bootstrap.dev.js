if(typeof wire == "undefined")
    throw "WireBootstrap 'wire' object not found.";

(function () {

wire.bsDatasetPaging =  function() {

    var self = this;

    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);
    
    this.render = function (el, config) {    

        ensureDeps(function() {
    
            self.initialize({       
                element: el,     
                cssClass: "wire-dataset-paging",
                config: {
                    default: defaults(),
                    user: config,
                },
                dataBind: bind
            });        

        });
    
    }


    //
    // Local functions
    //

    function bind() {

        var el = self.$element();
        var d = self.data();
        var cfg = self.config();
        var t = template(cfg);
        var p = d.__meta.paging;

        el.empty();

        if (!p) {
            return;
        }

        if (!d.Rows.length) {
            pages = 1;
            rows = 0;
        }

        if (p.TotalRows) {
            pages = p.Rows == p.TotalRows ? 1 : wire.Format((p.TotalRows / p.Rows) + .5, "N").replace(",", "");
            rows = p.TotalRows;
        }

        var row = $(t.row);
        el.append(row);

        row.append(t.colLabel.format(p.Page, pages, rows));

        var colButtons = $(t.colButtons);
        row.append(colButtons);

        var divButtons = $(t.divButtons);
        colButtons.append(divButtons);

        if(cfg.layout == 1)
            divButtons.append($(t.first).click(function () {
                var ds = cfg.data;
                ds.Query.Paging.Page = 1;
                if (rows > 0)
                    ds.refresh();
            }));

        divButtons.append($(t.prev).click(function () {
            var ds = cfg.data;
            if (ds.Query.Paging.Page > 1 && rows > 0) {
                ds.Query.Paging.Page -= 1;
                ds.refresh();
            }
        }));

        divButtons.append($(t.next).click(function () {
            var ds = cfg.data;
            if (ds.Query.Paging.Page < pages && rows > 0) {
                ds.Query.Paging.Page += 1;
                ds.refresh();
            }
        }));

        if(cfg.layout == 1)
            divButtons.append($(t.last).click(function () {
                var ds = cfg.data;
                if (rows > 0) {
                    ds.Query.Paging.Page = pages;
                    ds.refresh();
                }
            }));

        self.ready();

    }

    function defaults() {            

        return {
            datamap: {id: "id", label:"label", selected: "selected"},
            layout: 1,
            loading: false,
            color: "btn-primary",
            multiselect: false,
            alignment:"horizontal"
        };

    }

    function template(cfg) {

        return {
            row: "<div class=\"row\"></div>",
            colLabel: "<div class=\"col-md-6\">" +
                    (cfg.layout == 1 ? "<p>Page {0}/{1}: {2} Total Rows</p>" : "<p>{0}/{1}: {2}</p>") +
                "</div>",
            colButtons: "<div class=\"col-md-6\"></div>",
            divButtons: "<div class=\"btn-group pull-right\">",
            first: "<a title=\"First Page\" style=\"margin-right:3px\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-left\"></i><i class=\"fa fa-chevron-left\"></i></a>",
            prev: "<a title=\"Previous Page\" style=\"margin-right:3px\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-left\"></i></a>",
            next: "<a title=\"Next Page\" style=\"margin-right:3px\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-right\"></i></a>",
            last: "<a title=\"Last Page\" href=\"javascript:void(0)\" class=\"btn btn-default btn-xs\"><i class=\"fa fa-chevron-right\"></i><i class=\"fa fa-chevron-right\"></i></a>",
        };    
    }

    function ensureDeps(cb) {
        $(document).ready(function(){
            
            //wire.loadCss("https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" , cb);
            
            cb();
            
        });
    
    }

    return this;

};wire.bsCheckboxes = function() {

    var self = this;
    var cfg = null;

    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);
    
    this.render = function (el, config) {    

        ensureDeps(function() {
    
            self.initialize({       
                element: el,     
                cssClass: "checkbox wire-checkboxes",
                config: {
                    default: defaults(),
                    user: config,
                },
                dataBind: bind
            });        

        });

        return self;
    
    }

    function bind() {
                
        cfg = self.config();
        datamap = cfg.datamap;

        var d = self.data();
        var t = cfg.template || template();
        var el = self.$element();

        el.empty();

        d.Rows.forEach(function (r) {
            
            var row = self.configRow(r);
            var guid = wire.guidDom();

            var lbl = t.format(
                cfg.type,
                cfg.type == "radio" ? "radio" : "checkbox",
                guid,
                r[datamap.id],
                (row.val("checked") == r[datamap.id] || r[datamap.checked]) ? "checked" : "",
                r[datamap.label]
            );

            el.append(lbl);

        });

        el.find("input").change(function (e) {

            var row = d.where().eq(datamap.id, $(this).val()).first();

            // data event               
            var ev = new wire.data.DataEvent().source(self)
                .cell(datamap.id, $(this).val())
                .column(d.getColumn(datamap.id))
                .row(row)
                .table(d);

            var sel = typeof row[datamap.checked] != "undefined";

            if (this.checked) {
                if (sel) row[datamap.checked] = true;
                ev.action().add();
            }
            else {
                if (sel) row[datamap.checked] = false;
                ev.action().remove();
            }

            var ed = { base: e, data: ev.getData() };

            if (cfg.events && cfg.events.change) {
                cfg.events.change(ed);
            }
            
            ev.dataselect().raise();

        });

        self.ready();

    }

    function template() {

        return "<div class=\"custom-control custom-{0}\">"+
            "<input type=\"{1}\" class=\"custom-control-input\" id=\"check_{2}\" name=\"check\" value=\"{3}\" {4}>"+
            "<label class=\"custom-control-label\" for=\"check_{2}\">{5}</label></div>";


        //return "<div class=\"form-check\"><label{0}>"+
            //      "<input name=\"{1}\" type=\"{2}\" value=\"{3}\" {4}> "+
            //    "<span class=\label-text\">{5}</span></label></div>";            

    }

    function defaults() {
        return {
            autoInit: true,
            type: "checkbox",
            datamap: { id: "id", label: "label", checked: "checked" }
        };
    }

    function ensureDeps(cb) {
        $(document).ready(function(){
            cb();
        });
    }

    return this;

};wire.bsInput = function () {

    var self = this;
    var datamap = null;
    var el = null;
    var cfg = null
    var _isValid = true;
    var _dirty = false;
    var _wireInputCurrency = null;

    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);

    this.render = function (el, config) {

        ensureDeps(function () {

            self.initialize({
                element: el,
                cssClass: "wire-input",
                config: {
                    default: defaults(),
                    user: config
                }
            });

            init();

        });

        return self;
    }

    function init() {

        cfg = self.config();
        el = self.$element();
        datamap = cfg.datamap;

        // Dynamic data
        if (cfg.data)
            self.bindData(bind);
        else
            if (typeof cfg.value != 'undefined') {
                el.val(cfg.value);
                self.ready();
            }
            else
                if (cfg.model) {
                    // this can't be formatted so check value first
                    el.val(self.model.val());
                    self.ready();
                }


        //
        // Events
        //
        
        el.on('change', function (e) {

            var val = removeFormatting($(this).val());

            _dirty = true;

            if (cfg.validate) {

                var _el = el;

                _isValid = true;

                if (cfg.validate.cssParent)
                    _el = el.closest("div");

                _el.removeClass(cfg.validate.css || "border-danger");
                el.prop("title", "");

            }

            if (cfg.model) {
                self.model.val(val);
            }

            var row = self.data();

            if (row)
                row.first();

            var event = new wire.data.DataEvent()
                .dataselect()
                .table(null)
                .row(row)
                .column(null)
                .cell(datamap.value, val)
                .action().replace();

            event.raise();

            if (cfg.events && cfg.events.change) {
                cfg.events.change({ base: e, data: event.getData(), self: self });
            }

        });

        if (cfg.events && cfg.events.keyEnter) {

            el.on("keyup", function (e) {
                
                if (event.keyCode === 13) {
                    e.preventDefault();
                    cfg.events.keyEnter(e);
                }
            });
        }

        //
        // Currency plugin
        //
        
        if (cfg.wireInputCurrency) {

            if (typeof $.fn.wireInputCurrency == "undefined")
                throw "Unable to find wireInputCurrency plugin";
            else
                _wireInputCurrency = el.wireInputCurrency(cfg.wireInputCurrency);

        }

    }

    function bind() {

        var d = self.data();

        var row = d ? d.first() : {};
        var val = row[datamap.value];
        var col = d.getColumn(datamap.value);
        if (col && col.Format) val = wire.Format(val, col.Format);
        el.val(val);

        self.ready();

    }

    function defaults() {

        return {
            loading: false,
            datamap: { value: "value" }
        };

    }

    function ensureDeps(cb) {
        $(document).ready(function () {
            cb();
        });
        //document.addEventListener("DOMContentLoaded", function () {
        //    cb()
        //});
    }

    this.val = function (value) {
        if (typeof value != "undefined") {
            if (cfg.model)
                self.model.val(removeFormatting(value));
            el.val(value);
        }

        // remove valiation highlights
        let _el = el;

        if (cfg.validate.cssParent)
            _el = el.closest("div");

        _el.removeClass(cfg.validate.css || "border-danger");
        el.prop("title", "");

        return removeFormatting(el.val());
    }

    this.clear = function () {
        var val = null;
        this.dirty(false);
        if (cfg.model) {
            val = self.model.clear();
        }
        el.val(val);
    }

    this.dirty = function (dirty) {
        if (typeof dirty != "undefined")
            _dirty = dirty;
        return _dirty;
    }

    this.validate = function () {

        _isValid = true;

        if (cfg.validate) {

            var val = removeFormatting(el.val());

            if (cfg.model) val = self.model.toNumber(val);

            var error = wire.ui.validate({ field: cfg.validate, value: val, component: self });

            if (error) {
                _isValid = false;
                var _el = el;
                if (cfg.validate.cssParent)
                    _el = el.closest("div");
                _el.addClass(cfg.validate.css || "border-danger");
                el.prop("title", error);
            }
        }

        return _isValid;

    }

    this.wireInputCurrency = function() {
        return _wireInputCurrency;
    }

    function removeFormatting(val) {
        //return val.toString().replace("$", "").replace(",", "");
        if(cfg.wireInputCurrency)
            return val.toString().replace("$", "").replace(/,/g, '');
        else
            return val;
    }

    return this;

};wire.bsTable = function() {

    var self = this;
    var el = null;
    var cfg = null;
    var pager = null;
    var searchRow = null;
    var div = null;

    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);
    
    this.render = function (el, config) {    

        ensureDeps(function() {
    
            self.initialize({       
                element: el,     
                cssClass: "wire-table",
                config: {
                    default: defaults(),
                    user: config,
                },
                dataBind: bind
            });        

        });

        return self;
    
    }

    //
    // Local functions
    //

    function bind() {

        cfg = self.config();
        el = self.$element();

        var d = self.data();
        var sel = self.select();
        var r = [];
        var fmt = {};
        var tmpl = template();

        el.empty();

        var t = $("<thead>");
        if (cfg.header)
            el.append(t);
        
        var tr = $("<tr>");
        t.append(tr);
        sel.forEach(function (c, i) {

            var cl = d.getColumn(c);
            var td = $("<th>", { "class": "eb-col-" + (i - -1) });
            tr.append(td);
            if (cl) {
                fmt[cl.Name] = cl.Format;
                td.append(cl.Title || cl.Name);
            }
        });

        t = $("<tbody style=\"height:{0}\">".format(cfg.fixedcols && cfg.fixedcols.height ? cfg.fixedcols.height : "auto"));
        el.append(t);

        if (cfg.filter) {

            // only allow filter on specific fields
            var fsel = Array.isArray(cfg.filter) ? cfg.filter : sel;

            if (!searchRow) {

                searchRow = $("<tr>")
                t.append(searchRow);

                sel.forEach(function (c) {

                    var col = d.getColumn(c);

                    td = $("<td>");
                    searchRow.append(td);

                    if (fsel.indexOf(c) > -1) {

                        var input = $("<input data-col=\"{0}\" type=\"text\" placeholder=\" Filter {1}\">".format(col.Name, col.Title || col.Name));

                        td.append(input);

                        input.keydown(function (e) {
                            var t = $(this);
                            var capsLock = 20;
                            if (e.keyCode != capsLock && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                                setTimeout(function () {
                                    var q = cfg.data.Query; //.page(1);
                                    var v = t.val();
                                    applyFilter(q, col, v);
                                }, 500);
                            }
                        });

                    };

                });
            }
            else {
                t.append(searchRow);

                searchRow.find("input").each(function (e) {
                    var input = $(this);
                    var col = input.data("col");
                    if (input.val().length > 0) input.focus();
                    input.keydown(function (e) {
                        var capsLock = 20;
                        if (e.keyCode != capsLock && !e.ctrlKey && !e.metaKey && !e.altKey && !e.shiftKey) {
                            setTimeout(function () {
                                var q = cfg.data.Query; //.page(1);
                                var v = input.val();
                                applyFilter(q, col, v);
                            }, 500);
                        }
                    });
                });
            }
        }

        function applyFilter(q, col, v) {

            if (q.Paging && q.Paging.Page > 0) q.page(1);

            if (q.__typeName == "StoredProcedure") {
                var p = q.getParam(col.Name || col);
                if (p) p.Value = (v.length > 0) ? v : null;
            }
            else {

                var index = [];

                q.Filter.forEach(function (exp, i) {
                    if ((exp.Expression.Field && exp.Expression.Field == (col.Name || col)) && exp.Expression.__typeName == "ContainsExpression")
                        index.push(i);
                });

                index.forEach(function (i) {
                    q.Filter.splice(i, 1);
                });

                if (v.length > 0)
                    q.contains(col.Name || col, v);

            }

            cfg.data.refresh();

        }

        if (d.Rows.length == 0) {
            t.append("<tr><td>" + (cfg.noRowsMessage || "No rows returned.") + "</td></tr>");
        }


        d.Rows.forEach(function (r, i) {
            tr = $("<tr>");
            tr.attr("_r", i);
            tr.css("cursor", cfg.cursor || "auto");
            t.append(tr);
            //    tr.click(function (e) {
            //    var c = $(e.currentTarget);
            //var _r = c.attr("_r");
            //self.trigger("rowclick", d.Rows[_r]);
            //  });
            sel.forEach(function (c, i) {

                var td = $("<td>", { "class": "eb-col-" + (i - -1) });
                tr.append(td);

                var dv = $("<div>", { "class": "eb-cell-value" });
                td.append(dv);

                var rc = r[c];
                var cl = d.getColumn(c);

                td.click(function (e) {
                    
                    var ev = getEvent(e, "dataselect");
                    var ed = ev.getData();

                    //self.trigger('cellClick', { base: e, data: ed });

                    // data event defaults to false
                    if (cfg.events && cfg.events.click) {
                        if (typeof cfg.events.click == 'function')
                            cfg.events.click(ed);
                        else
                            ev.raise();
                        //self.trigger('dataselect', ed);
                    }
                });

                if (typeof rc == 'undefined' || typeof rc == 'function')
                    return;

                var v = (rc == null || typeof rc.Value == 'undefined') ? (rc == null ? "" : rc) : (rc.Value || "");

                // text or html or object data type
                var _v = fmt[c] ? wire.Format(v, fmt[c]) : v;

                if (typeof rc == "object")
                    dv.append(_v);
                else
                    if (cl.DataType && cl.DataType == "html")
                        dv.html(_v);
                    else
                        dv.text(_v);

                // format class
                if (rc && rc.Format && rc.Format.Class)
                    dv.addClass(rc.Format.Class);

                td.attr("_c", i);

                if (rc && typeof rc.HasChildren != 'undefined') {

                    var dd = $("<div style=\"float:left\">");
                    td.prepend(dd);

                    dv.css("margin-left", (rc.LevelDepth * 15) + "px");

                    if (rc.DrilledDown)
                        dd.addClass(wire.ui.config.styles["drillCollapse"]);
                    else
                        if (rc.HasChildren)
                            dd.addClass(wire.ui.config.styles["drillExpand"]);
                        else
                            dd.addClass(wire.ui.config.styles["drillNone"]);

                    dd.click(function (e) {

                        // default this data event to true if not specified in config
                        if (cfg.events && wire.toBoolean(cfg.events.datadrilldown, true)) {
                            var c = $(e.currentTarget);
                            var ev = getEvent(e, "datadrilldown");
                            if (c.hasClass(wire.ui.config.styles["drillExpand"]))
                                ev.action().add().raise();
                            else
                                ev.action().remove().raise();
                            self.trigger('datadrilldown', ev.getData());
                        }
                    });

                }

                function getEvent(e, event) {
                    var c = $(e.currentTarget);
                    var ci = c.closest("td").attr("_c");
                    var ri = c.closest("tr").attr("_r");
                    var d = self.data();
                    var r = d.Rows[ri];
                    var cl = d.Columns[ci];
                    // assumes typeName == 'DimensionMember'
                    return new wire.data.DataEvent(event).source(self).cell(cl.Id || cl.Name, r[cl.Name].Id || r[cl.Name]).column(cl).row(r).table(d);
                }

            });});

        // paging
        //(cfg.paging || cfg._paging) &&
        // && cfg.data.Query.Paging.Rows > 0
        if (!pager && cfg.data.__typeName && cfg.data.__typeName == "DataSet" && cfg.data.Query.Paging && cfg.data.Query.Paging.Page > 0) {
            //if (cfg._paging)
            //  cfg.data.Query.Paging = wire.deepClone(cfg.data.Query.Paging, cfg._paging);
            //pager = $(tmpl.paging).ebDatasetPaging({ data: cfg.data });
            const div = $(tmpl.paging);
            pager = new wire.bsDatasetPaging();
            pager.render(div, { data: cfg.data });
            //el.find(".wire-dataset-paging").remove();
            el.parent().append("<hr>");
            el.parent().append(div);
        }

        self.ready();

    }

    function template() {

        return {
           // table: "<table class=\"table table-striped table-hover\" data-toggle=\"table\">",
            paging: "<div></div>"
        };

    }

    function defaults() {
        return {
            filter: false, 
            header: true, 
            events: { 
                cellClick: null,
                datadrilldown: true 
            }
        };    
    }

    function ensureDeps(cb) {
        $(document).ready(function(){
            cb();
        });
    }

    return this;

};

wire.bsButtons = function() {

    var self = this;

    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);
    
    this.render = function (el, config) {    

        ensureDeps(function() {
    
            self.initialize({       
                element: el,     
                cssClass: "wire-buttons",
                config: {
                    default: defaults(),
                    user: config,
                },
                dataBind: bind
            });        

        });
    
        return self;
        
    }

    //
    // Local functions
    //

    function bind() {

        var el = self.$element();
        var table = self.data();
        var cfg = self.config();
        var t = template();
        
        var group = $(t.group.format(cfg.alignment));
        var button = t.button;

        el.empty().append(group);

        table.Rows.forEach(function(r) {
            var row = self.configRow(r);
            var btn = $(button.format(cfg.color, 
                row.val("selected") == (row.val(cfg.datamap.id)) ? " active" : "", row.val(cfg.datamap.id) || "", row.val(cfg.datamap.label) || ""));
            group.append(btn);

            btn.on("click", function(e) {

                var _this = $(this);
                var id = _this.attr("_id");
                var row = table.where().eq(cfg.datamap.id, id).first();            
                var col = table.getColumn(cfg.datamap.id);

                const wasActive = _this.hasClass("active");

                el.find("button").removeClass("active");
                if(!wasActive)
                    _this.addClass("active");

                var event = new wire.data.DataEvent()
                .dataselect()
                .table(table)
                .row(row)
                .column(col)
                .cell(col.Name, id)
                .action();
    
                if(wasActive)
                    event.clear();
                else
                    event.replace();
    
                event.raise();
                    
            });
            
        });

        self.ready();

    }

    function defaults() {            

        return {
            datamap: {id: "id", label:"label", selected: "selected"},
            color: "btn-primary",
            multiselect: false,
            alignment:"horizontal"
        };

    }

    function template() {

        return {
            group: "<div class=\"btn-group-{0}\" role=\"group\"></div>",
            button: "<button type=\"button\" class=\"btn {0}{1} mr-1\" _id=\"{2\}\">{3}</button>"
        };

    }

    function ensureDeps(cb) {
        $(document).ready(function(){
            cb();
        });
    }
        
};wire.bsSelect = function() {

    var self = this;
    var el = null;
    var cfg = null;
    var allValue = null;

    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);
    
    this.render = function (el, config) {    

        ensureDeps(function() {
    
            self.initialize({       
                element: el,     
                cssClass: "wire-select",
                config: {
                    default: defaults(),
                    user: config,
                },
                dataBind: bind
            });        

        });

        return self;
    
    }

    //
    // Local functions
    //

    function bind() {

        el = self.$element();
        cfg = self.config();
        
        var table = self.data();
        var datamap = cfg.datamap;
        var t = template();
        let hasSelected = false;

        // add all?
        if (cfg.all) {

            if(!table.select().where().eq(datamap.value, cfg.all.value).exists()) {
                                
                let _all = {};

                _all[datamap.value] = cfg.all.value;
                _all[datamap.label] = cfg.all.label;

                table.insert(_all, true);
            }

            allValue = cfg.all.value;
        }
        else
            allValue = null;

        el.empty();

        el.addClass("custom-select");

        table.Rows.forEach(function(r) {

            var row = self.configRow(r);

            if(!hasSelected)
                hasSelected = row.val("selected");

            var option = t.format(
                r[datamap.value],
                (row.val("selected") == r[datamap.value] || r[datamap.selected]) ? "selected" : "",
                r[datamap.label]
            );

            el.append(option);

        });

        el.off("change").
        change(function (e) {

            var val = $(this).val();
            var row = table.where().eq(datamap.value).first();
            
            if (cfg.model) {
                self.model.val(val);
                //cfg._model.val(val);
            }

            // data event               
            var ev = new wire.data.DataEvent().source(self)
                .cell(datamap.value, val)
                .column(table.getColumn(datamap.value))
                .row(row)
                .table(table);

            if (val == allValue)
                ev.action().clear();
            else
                ev.action().replace();

            var ed = { base: e, data: ev.getData() };

            if (cfg.events && cfg.events.change) {
                cfg.events.change(ed);
            }
            
            ev.dataselect().raise();
            
        });

        // default selection
        if(cfg.model){
            var val = self.model.val();
            el.val(val);
        }            
        else if(!hasSelected && allValue) el.val(allValue);

        self.ready();

    }

    function defaults() {            
        return {
            all: null,
            datamap: {value: "value", label:"label", selected: "selected"}
        };
    }

    function template() {
        return "<option value=\"{0}\"{1}>{2}</option>";
    }

    function ensureDeps(cb) {
        $(document).ready(function(){
            cb();
        });
    }

    
    this.val = function () {
        if(el) return el.val();
    }
        
};wire.bs = wire.bs || {};

wire.bsSearchList = function() {

    var self = this;
    var cfg = null;
    var checkbox = null;
    var searchTimeout = 0;
    var el = null;
    var elCheckBoxes = null;  
    var datamap = null;
    
    
    //
    // Inherit from wire component
    //
    wire.ui.Component.call(this);
    
    this.render = function (el, config) {    

        ensureDeps(function() {
    
            self.initialize({       
                element: el,     
                cssClass: "wire-search-list",
                config: {
                    default: defaults(),
                    user: config,
                }
            });        

            init();
        });

        return self;
    
}

function init() {

    cfg = self.config();
    el = self.$element();
    datamap = cfg.datamap;

    //var d = self.data();
    var t = template();
    
    el.empty();

    //
    // Top row, search box
    //
    var search = cfg.searchTemplate || t.search;

    search = $(search);

    el.append($(t.row).append($(t.col).append(search)));

    search.find("input").prop("placeholder", "Search " + datamap.label);

    el.append($(t.row).append(t.hr));

    //
    // Middle row - checkboxes
    //
    
    elCheckBoxes = $(t.div);

    el.append($(t.row).append($(t.col).append(elCheckBoxes)));

    el.append($(t.row).append(t.hr));

    //
    // Bottom row - paging
    //
    cfg.paging.data = cfg.data;

    var paging = new wire.bsDatasetPaging();

    var div = $(t.div);

    paging.render(div, cfg.paging);

    el.append($(t.row).append($(t.col).append(div)));

    
    //
    // Events
    //

    search.find("input").keydown(function (e) {
        clearTimeout(searchTimeout);
        var t = $(this);
        searchTimeout = setTimeout(function () {
            var q = cfg.data.Query.where().page(1);
            var v = t.val();
            if (v.length > 0)
                q.contains(datamap.label, v);
            cfg.data.refresh();
        }, 500);
    });

    el.find(".clear-search").click(function (e) {
        search.find("input").val("");
        var ds = cfg.data;
        ds.Query.where();
        if(ds.Query.Paging.Page > 1)
            ds.Query.page(1);
        // refresh this dataset
        ds.refresh();
        // issue clear to a anything listening
        // table
        var dt = checkbox.data();
        new wire.data.DataEvent().dataselect().source(el)
        .cell(cfg.datamap.id, null)
        .column(dt.getColumn(cfg.datamap.id))
        .table(dt)
        .action().clear().raise();   
    });

    self.bindData(_bind);

}

function _bind() {

    var table = self.data();

    cfg.checkbox.datamap = cfg.datamap;
    cfg.checkbox.events = cfg.checkbox.events || {};
    cfg.checkbox.events.change = cfg.events.change;
    cfg.checkbox.data = table;
        
    checkbox = new wire.bsCheckboxes().render(elCheckBoxes, cfg.checkbox);

    self.ready();

}

function ensureDeps(cb) {
    $(document).ready(function() {
        cb();
    });
}

function defaults(){

    return {
        datamap: { id: "id", label: "label" },
        events: {},
        //checkbox: { events: { itemClick: { callback: null, dataevent: null } } },
        checkbox: {},
        paging: { layout: 0 }
    };

}

function template() {

    return {
        row: "<div class=\"row\"></div>",
        col: "<div class=\"col-md-12\"></div>",
        search: "<div class=\"input-group\"><input placeholder=\"\" class=\"form-control\" />"+
        "<div class=\"input-group-btn clear-search\" style=\"cursor:pointer\">" +
            "<span class=\"input-group-text\">x</span></div>",
        div: "<div></div>",
        hr: "<div class=\"col-md-12\"><hr/></div>"
    };
}

this.checkbox = function() {
    return checkbox;
}

return this;

};wire.bsMessageModal = function(config){

    let deferred = $.Deferred();
    let promise = deferred.promise();
    let cfg = _defaults();
    const id = config.id || "wire-message-modal";
    let el = $("#"+id);
  
    wire.merge(cfg, config);
  
    let tmpl = _template();
  
    if (!el.length) {
      el = $("<div id='{0}' class='modal wire-modal wire-modal-message'></div>".format(id));
      $(document.body).append(el);
    }
    else
      el.empty();
        

    tmpl = tmpl.format(cfg.css, cfg.title, cfg.message, cfg.ok.css, cfg.ok.label);

    el.append(tmpl);
    el.modal("show");
    el.css('margin-top', ($(window).height() - el.height()) / 2);
    el.css('margin-left', ($(window).width() - el.width()) / 2);

    el.find(".btn-wire-modal").click((e) => {

        const ok = $(e.currentTarget).hasClass("ok");
        
        if(cfg.callback){

            cfg.callback(ok, (keepOpen) => {

                if(!keepOpen) resolve();

            });

        }
        else resolve();

        function resolve() {
            el.modal("hide");
            deferred.resolve(ok);
        }

    });


    function _template() {

        var s = cfg.cancel.visible ? "<button type='button' class='btn {0} btn-wire-modal cancel'>{1}</button>".format(cfg.cancel.css, cfg.cancel.label) : "";

        return "<div class='modal-dialog'>" +
            "<div class='modal-content'>" +
                "<div class='modal-header {0}'>" +
                    "<h5 class='modal-title panel-card'>{1}</h5>" +
                    "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
                "</div>" +
                "<div class='modal-body'>" +
                    "<p>{2}</p>" +
                "</div>" +
                "<div class='modal-footer'>" +
                    "<button type='button' class='btn {3} btn-wire-modal ok'>{4}</button>" + s +
                "</div>" +
            "</div>" +
        "</div>";
    }

    function _defaults() {
        return {
            message: "",
            title: "Message",
            css: "alert-primary",
            callback: null,
            ok: {
                label: "Ok",
                css: "btn-secondary"
            },
            cancel: {
                visible: false,
                label: "Cancel",
                css: "btn-secondary"
            }                       
        };
    }
          
    return promise;
};wire.bsErrorModal = function (d, m, e) {

    // responseText, status, statusText

    // custom http code for Json resopnse redirect implementation
    // skip dialog as page is being redirected to an error page
    if (d && d.status && d.status == 545)
        return;

    if (typeof d == "string") 
        // custom error message passed in
        m = d;
    else if (typeof d.responseJSON == "object")
        d = d.responseJSON;
    else if (typeof d.responseJSON == "string")
        d = $.parseJSON(d.responseJSON);
    else if (d.responseText)
        d = $.parseJSON(d.responseText);

    var er = {};
    er.msg = d.ExceptionMessage || d.Message || d.message || d.responseText || "";
    er.msg = m ? (m + "\n\n" + er.msg) : er.msg;
    er.title = d.Title || d.statusText || "Error";
    er.number = d.number || d.status || d.HResult || "";
    er.stack = d.StackTrace || d.stack || d.StackTraceString || "";
    er.instance = d.Instance || "";
    er.user = d.User || "";

    if (d.InnerException)
        er.inner = inner(d.InnerException);

    function inner(ed) {
        var m = null;
        if (ed.Message) {
            m = ed.Message + "<br><br>";
            if (ed.InnerException)
                m += inner(ed.InnerException);
        }
        return m;
    }

    var el = $("#wire-error-modal");
    if (!el.length) {
        el = $("<div id='wire-error-modal' class='modal wire-modal wire-modal-error'></div>");
        $(document.body).append(el);
    }
    else { el.empty(); }

    var s = getHtml();
    s = s.format(er.title, er.msg, er.number, er.instance, er.user, er.inner, er.stack)
    el.append(s);
    el.modal();
    el.css('margin-top', ($(window).height() - el.height()) / 2);
    el.css('margin-left', ($(window).width() - el.width()) / 2);

    function getHtml() {
        return "<div class='modal-dialog'>" +
                "<div class='modal-content'>" +
                    "<div class='modal-header alert-danger'>" +
                        "<h5 class='modal-title card-title'>{0}</h5>" +
                        "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
                    "</div>" +
                    "<div class='modal-body'>" +
                        "<p>{1}</p>" +
                        "<p><br><a href=\"#\" onclick=\"$('#eb-error-st').toggle();\" style=\"cursor:pointer\">Details</a></p>" +
                        "<p id='eb-error-st' class='text-warning' style='display:none'>" +
                        "<small>Error Number: {2}<br>Instance: {3}<br>User: {4}<br><br>" +
                        "{5}" +
                        "{6}</small></p>" +
                    "</div>" +
                    "<div class='modal-footer'>" +
                        "<button type='button' class='btn btn-secondary' data-dismiss='modal'>Close</button>" +
                    "</div>" +
                "</div>" +
            "</div>";
    }
};
wire.bsUrlModal = function (config) {

  var _modal = null;

  if (!config.url) throw "Missing url parameter to ModalUrl function"

  var el = $("#wire-url-modal");
  if (!el.length) {
    el = $("<div id='wire-url-modal' class='modal wire-modal wire-modal-url' style='overflow:hidden'></div>");
    $(document.body).append(el);
  }
  else { el.empty(); }

  var html = modalHtml();

  config.frame = config.frame || {};

  s = html.body.format(
    config.color || "default", (config.width || "980") + "px", (config.height || "800") + "px", config.css ? "; "+config.css : "", config.title || this.Title,
    config.frame.width || "100%", config.frame.height || "100%", config.frame.scrolling ? "yes" : "no",
    config.url, (config.footer ? html.footer : ""));
  el.append(s);
  // CORS issues, using iframe
  //el.modal('show').find('.modal-body').load(config.url);
  _modal = el.modal();

  setTimeout(() => {
    //el.css('margin-top', -10);
    el.css('margin-left', -1 * ((config.width || "980") / 2) * .6);
  }, 500);


  function modalHtml() {

    return {

      footer: "<div class='modal-footer'>" +
        "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>" +
        "</div>",

      body: "<div class='modal-dialog'>" +
        "<div class='modal-content panel-{0}' style='width:{1}; height:{2}{3}'>" +
        "<div class='modal-header panel-heading'>" +
        "<button type='button' class='close' data-dismiss='modal' aria-hidden='true'>&times;</button>" +
        "<h4 class='modal-title panel-title'>{4}</h4>" +
        "</div>" +
        "<div class='modal-body'>" +
        "<iframe width=\"{5}\" height=\"{6}\" frameborder=\"0\" scrolling=\"{7}\" allowtransparency=\"true\" src = \"{8}\"></iframe>" +
        "</div>{8}" +
        "</div>" +
        "</div>"
    };

  }

};// 3.0 style sub-menus in 4.0
// https://codepen.io/surjithctly/pen/PJqKzQ
// sub-menus were removed in 4.0
wire.bsSubMenus = function(){

    // sub menu code
    $('.dropdown-menu a.dropdown-toggle').on('click', function (e) {

        if (!$(this).next().hasClass('show')) {
            $(this).parents('.dropdown-menu').first().find('.show').removeClass("show");
        }
        var $subMenu = $(this).next(".dropdown-menu");
        $subMenu.toggleClass('show');


        $(this).parents('li.nav-item.dropdown.show').on('hidden.bs.dropdown', function (e) {
            $('.dropdown-submenu .show').removeClass("show");
        });


        return false;
    });

};
})();