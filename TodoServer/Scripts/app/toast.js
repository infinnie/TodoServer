/// <reference path="/Scripts/app/define.js"/>
define("app/toast", ["jquery"], function ($) {
    "use strict";
    var toast = $("[data-toast=toast]").first(), hasToast = 0, resetToast = function () {
        if (hasToast) {
            clearTimeout(hasToast);
            hasToast = 0;
        }
    }, showToast = function (content, duration) {
        resetToast();
        toast.removeClass("toast--hidden").find("[data-toast=content]").html(content);
        hasToast = setTimeout(function () {
            hideToast();
        }, +duration || 6000);
    }, hideToast = function () {
        resetToast();
        toast.addClass("toast--hidden");
    };
    $(function () {
        $("[data-toast=close]").click(function () {
            hideToast();
            return false;
        });
    });
    return { show: showToast, hide: hideToast };
});