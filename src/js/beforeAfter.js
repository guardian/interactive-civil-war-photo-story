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
        self.setScroll();

        var faderBlocks = document.querySelectorAll(".uh-container");
        self.faderInit()

        // var imgBlock = document.getElementById("p1");
        // var skrolls = document.querySelectorAll(".guLazyLoad");

        // self.makeButtons(skrolls);

        // var h = new Unhook();
    },

    faderInit: function(){
        var faderBlocks = document.querySelectorAll(".uh-container");
        var faderPositions = [];
        for(var i = 0;i<faderBlocks.length; i++){
            faderPositions[i] = "new"
        }

        var windowHeight = window.innerHeight;
        window.onscroll = function(){
            for(var i = 0;i<faderBlocks.length; i++){
                console.log(base);
                var faderBlock = faderBlocks[i];
                var faderBlockOffset = faderBlock.getBoundingClientRect().top;
                var faderBlockHeight = faderBlock.getBoundingClientRect().height;
                
                if(faderBlockOffset < (windowHeight/2) - (faderBlockHeight/2)){
                    if(faderPositions[i] === "new"){
                        console.log('hey');
                        faderPositions[i] = "old";
                    }       
                }else{
                    if(faderPositions[i] === "old"){
                        console.log('doei')
                        faderPositions[i] = "new";
                    }
                }
            }
        }
    },

    setScroll: function(){
        skrollr.init();
        // setTimeout(function() {
        //     skrollr.get().refresh();
        // }, 5000);
        skrollr.get().relativeToAbsolute(document.getElementById("photoBlocks"));
    },

    makeButtons: function(blocks){
        var self = this;
        [].forEach.call(blocks, function(skroll, i){
            var btnWrap = document.createElement("div"),
                btnWrapInner = document.createElement("div"),
                btn = document.createElement("button");

            btnWrap.className = "uh-element toggle-button-wrap";
            btnWrapInner.className = "toggle-button-wrap_inner";

            btn.setAttribute("id", "toggle-button-"+i);
            btn.className = "toggle-button";
            btn.innerHTML = "Then/Now";

            btnWrapInner.appendChild(btn);
            btnWrap.appendChild(btnWrapInner);
            skroll.parentNode.appendChild(btnWrap);

            self.setToggle(btn);
        });
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
            addPhotoClass = (!photo.className.match("btn-show")) ? "btn-show" : "btn-hide",
            removePhotoClass = (!photo.className.match("btn-hide")) ? "btn-show" : "btn-hide",
            reg = new RegExp(removePhotoClass, "g");

        photo.className = photo.className.replace(reg, "");
        photo.className += " " + addPhotoClass;
    }
};

return beforeAfter;


});