/// <reference path="/Scripts/jquery-1.12.4.js"/>
//! (c) All rights reserved

var define = (function ($) {
    "use strict";
    var storage = {},
        pendingList = {},
        rootPath = "/Scripts/",
        nameMap = {},
        resolveDep = function (key) {
            var url;
            if (typeof key === "function") {
                return key;
            }
            if (key in storage) {
                return storage[key];
            }
            if (key in nameMap) {
                url = nameMap[key];
            }
            if (!(key in pendingList)) {
                pendingList[key] = (function () {
                    var d = $.Deferred(), s = document.createElement("script");
                    s.src = (key in nameMap) ? url : (rootPath + key + ".js");
                    if ("onload" in s) {
                        s.onload = function () {
                            d.resolve(storage[key]);
                        };
                    } else {
                        s.onreadystatechange = function () {
                            if (/loaded|complete/.test(s.readyState)) {
                                d.resolve(storage[key]);
                            }
                        }
                    }
                    try {
                        $("head")[0].appendChild(s);
                    } catch (e) {
                        $(function () {
                            $("head")[0].appendChild(s);
                        });
                    }
                    return d.promise();
                })();
            }
            return pendingList[key];
        };

    var define = function (name, deps, cb) {
        /// <summary>AMD shim</summary>
        /// <param name="name" type="String"/>
        /// <param name="deps" type="Array"/>
        /// <param name="cb" type="Function"/>
        if ($.isFunction(deps) && typeof name === "string") {
            return define(name, [], deps);
        }
        if ($.isArray(name) || $.isFunction(name)) {
            throw new Error("Not implemented.");
        }
        var arr = /((.*?\/)(?:[^/]+\/)?)?[^/]+$/.exec(name),
            path = arr[1], parentPath = arr[2];

        if ((typeof path === "string") && path) {
            deps = $.map(deps, function (dep) {
                return dep.replace(/^\.\//, path);
            });
        }
        if ((typeof parentPath === "string") && parentPath) {
            deps = $.map(deps, function (dep) {
                return dep.replace(/^\.\.\//, parentPath);
            });
        }
        // do something
        if (name in storage) {
            return;
        }
        $.when.apply($, $.map($.map(deps, function (dep) {
            if ("require" !== dep) {
                return dep;
            }
            return function (x) {
                if (/Array/.test(Object.prototype.toString.call(x))) {
                    return define.require.apply(define, arguments);
                }
                if ((typeof path === "string") && path) {
                    x = x.replace(/^\.\//, path);
                }
                if ((typeof parentPath === "string") && parentPath) {
                    x = x.replace(/^\.\.\//, parentPath);
                }
                if (x in storage) {
                    return storage[x];
                }
                throw new Error("Module not found :(");
            }
        }), resolveDep)).then(function () {
            storage[name] = cb.apply(null, arguments);
        });
    };

    define.amd = {};
    /**
     * @param {[String]}deps
     * @param {Function}cb
     */
    define.require = function (deps, cb) {
        $.when.apply($, $.map(deps, resolveDep)).then(function () {
            cb.apply(null, arguments);
        });
    };
    define.requirePromise = function (deps) {
        var d = $.Deferred();
        define.require(deps, function () {
            d.resolve([].slice.call(arguments));
        });
        return d.promise();
    }

    /**
     * @param {Object}obj
     */
    define.config = function (obj) {
        if ("root" in obj) {
            rootPath = obj.root;
        }
    };

    /**
     * @param {String}name
     * @param {String}url
     */
    define.mapModule = function (name, url) {
        var i;
        if (!name) { return nameMap; }
        if (name === "require") { return false; }
        if (typeof name === "object") {
            for (i in name) {
                nameMap[i] = name[i];
            }
            return true;
        }
        nameMap[name] = url;
        return true;
    };

    define("jquery", [], function () {
        return $;
    });

    return define;
})(jQuery);
