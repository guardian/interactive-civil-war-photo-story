define([
    'skrollr',
    'unhook',
], function(
    skrollr,
    unhook
) {

var beforeAfter = {

    init: function () {
        var self = this;
        var s = skrollr.init();
        var imgBlock = document.getElementById("p1");
        var skrolls = document.querySelectorAll(".skrollable");

        [].forEach.call(skrolls, function(skroll, i){
            var btnWrap = document.createElement("div");
            btnWrap.className = "uh-element toggle-button-wrap";

            var btnWrapInner = document.createElement("div");
            btnWrapInner.className = "toggle-button-wrap_inner";

            var btn = document.createElement("button");
            btn.setAttribute("id", "toggle-button-"+i);
            btn.className = "toggle-button";
            btn.innerHTML = "Then/Now";

            btnWrapInner.appendChild(btn);
            btnWrap.appendChild(btnWrapInner);
            skroll.parentNode.appendChild(btnWrap);

            self.setToggle(btn);
        });

        var h = new Unhook({topOfPage: 0 });
    },

    setToggle: function (el) {
        var self = this;
        if (el.addEventListener) {
            el.addEventListener("click", self.toggleTime, false);
        } else if (el.attachEvent) {
            el.attachEvent("onclick", self.toggleTime);
        };
    },

    toggleTime: function (el) {
        var trigger = el.target,
            photo = trigger.parentNode.parentNode.previousSibling,
            addPhotoClass = (!photo.className.match("show")) ? "show" : "hide",
            removePhotoClass = (!photo.className.match("hide")) ? "show" : "hide",
            reg = new RegExp(removePhotoClass, "g");

        photo.className = photo.className.replace(reg, "");
        photo.className += " " + addPhotoClass;
    }
};

return beforeAfter;


});