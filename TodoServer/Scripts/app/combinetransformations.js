/// <reference path="/Scripts/app/define.js"/>
define("app/combinetransformations", ["jquery"], function ($) {
    "use strict";
    var promiseJoin = function (f, g) {
        /// <param name="f" type="Function"/>
        /// <param name="g" type="Function"/>
        return function (x) {
            /// <returns type="Promise"/>
            return f(x).then(g);
        };
    }, idTransformation = function (x) {
        var d = $.Deferred();
        d.resolve(x);
        return d.promise();
    };
    return function (transformations) {
        /// <param name="transformations" type="Array"/>
        var ret = idTransformation;
        $.each(transformations || [], function (i, val) {
            ret = promiseJoin(ret, val);
        });
        return ret;
    };
});