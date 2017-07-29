/// <reference path="/Scripts/app/define.js"/>
define("app/appstorage", ["jquery"], function ($) {
    "use strict";
    var normalizeTodo = function (todo) {
        if (!todo) { return; }
        return {
            id: todo.ID,
            content: todo.Content,
            done: todo.Done
        };
    }, connectMapper = function (f) {
        /// <param name="f" type="Function"/>
        return function (arr) {
            /// <param name="arr" type="Array"/>
            return $.map(arr, f);
        }
    };
    return {
        read: function () {
            return $.get("/Todos/ListJSON").then(connectMapper(normalizeTodo));
        }, create: function (value) {
            return $.post("/Todos/Create", value).then(normalizeTodo);
        }, update: function (id, value) {
            return $.post("/Todos/Update/" + id, value).then(normalizeTodo);
        }, destroy: function (id) {
            /// <param name="id" type="Number"/>
            return $.post("/Todos/Delete/" + id);
        }, markAll: function (done) {
            /// <param name="done" type="Boolean"/>
            return $.post("/Todos/MarkAll", { done: done });
        }, clearCompleted: function () {
            return $.post("/Todos/ClearCompleted");
        }, normalize: normalizeTodo
    };
});