/// <reference path="/Scripts/app/define.js"/>
//! fair use from my own previous paper.
define("app/route", ["jquery"], function ($) {
    "use strict";
    var current = null, lastNav = +new Date(), slice = [].slice, navRoutes = {
        regexps: {},
        parsers: {}
    }, blocker = {
        url: null,
        isBlocked: false,
        promiseFunc: null
    }, hostre = new RegExp("^" + location.protocol + "\\/\\/" + location.host), Navigation;

    if (!history.state && typeof history.replaceState === "function") {
        history.replaceState({ count: 0, url: location.href }, null, location.href);
    }

    Navigation = {
        state: history.state,
        createState: function (url) {
            return {
                count: Navigation.state.count + 1,
                url: url || location.href
            }
        }, register: function (routeName, pattern, parser) {
            /// <param name="pattern" type="RegExp"/>
            if (typeof pattern === "string") {
                pattern = new RegExp(pattern, "i");
            }
            navRoutes.regexps[routeName] = pattern;
            navRoutes.parsers[routeName] = parser;
        }, block: function (f) {
            /// <param name="f" type="Function"/>
            if (blocker.isBlocked) { return; }
            window.onbeforeunload = function () {
                return "Are you sure that you want to leave";
            };
            blocker.url = location.href.replace(hostre, "");
            blocker.isBlocked = true;
            if (typeof f === "function") {
                blocker.promiseFunc = f;
                blocker.args = slice.call(arguments, 1);
            }
        }, unblock: function () {
            window.onbeforeunload = null;
            blocker.url = null;
            blocker.isBlocked = false;
            blocker.promiseFunc = null;
        }, isBlocked: function () {
            return blocker.isBlocked;
        }, getRouteOf: function (url) {
            /// <param name="url" type="String"/>
            var k, re;
            url = url.replace(hostre, "");
            for (k in navRoutes.regexps) {
                re = navRoutes.regexps[k];
                if (re.test(url)) {
                    return k;
                }
            }
            return null;
        }, navigate: function (url, state) {
            /// <param name="url" type="String"/>
            /// <param name="state" type="Navigation.createState"/>
            var def = $.Deferred(), k, re, parser;
            url = url.replace(hostre, "");
            if (blocker.isBlocked && blocker.url !== url) {
                if (!blocker.promiseFunc) {
                    if (!confirm("Are you sure?")) {
                        return def.reject().promise();
                    }
                    Navigation.unblock();
                } else {
                    blocker.promiseFunc.apply(window, blocker.args).then(function () {
                        Navigation.unblock();
                        return Navigation.navigate(url, state);
                    }).then(function () {
                        def.resolve();
                    }, function () {
                        def.reject();
                    });
                    return def.promise();
                }
            }
            k = Navigation.getRouteOf(url);
            if (k !== null) {
                re = navRoutes.regexps[k];
                parser = navRoutes.parsers[k];
                url.replace(re, function () {
                    $.when(parser.apply(window, [url, state].concat(slice.call(arguments)))).then(function () {
                        def.resolve();
                    }, function () {
                        def.reject(true);
                    });
                });
                return def.promise();
            }
            return def.reject(true).promise();
        }, canNavigate: function (url) {
            return Navigation.getRouteOf(url) !== null;
        }, currentRoute: function () {
            return Navigation.getRouteOf(location.href);
        }
    };

    $(window).on("popstate", function (e) {
        var orig = e.originalEvent, state, href;
        if (!orig) { return; }
        state = orig.state;
        href = location.href;
        if (!state || !state.url || state.url.replace(hostre, "") === location.href.replace(hostre, "") && state.url === Navigation.state.url) {
            // do something with some browsers
            console.log(1);
            return;
        }
        if (!Navigation.canNavigate(href) && !blocker.isBlocked) {
            location.reload();
            return;
        }
        if (blocker.isBlocked && blocker.url === location.href.replace(hostre, "")) {
            return;
        }
        Navigation.navigate(href, state).then(function () {
            Navigation.state = state;
        }, function (should) {
            if (should) {
                location.reload();
                return;
            }
            if (blocker.isBlocked) {
                history.go(Navigation.state.count - state.count);
            }
        });
    });

    return Navigation;
});