define([
    'get',
    'tabletop',
    'imageQueue',
    'custom',
    'throttle',
    'rvc!templates/appTemplate',
    'rvc!templates/block_lead',
    'rvc!templates/custom/block_lead_intro',
    'rvc!templates/custom/block_lead_intro_with_audio',
    'rvc!templates/block_photo',
    'rvc!templates/block_quote',
    'rvc!templates/block_text',
    'rvc!templates/block_audio',
    'rvc!templates/block_title',
    'rvc!templates/shareContainer'
], function(
    get,
    Tabletop,
    imageQueue,
    custom,
    throttle,
    AppTemplate,
    blockLeadTemplate,
    blockLeadIntroTemplate,
    blockLeadIntroWithAudioTemplate,
    blockPhotoTemplate,
    blockQuoteTemplate,
    blockTextTemplate,
    blockAudio,
    blockTitle,
    shareContainerTemplate
) {
   'use strict';
    var dom;
    var base;
    var liveLoad = false;
    var fadeBlocks,fadeBlocksEl;

    function parseUrl(el){
        
        var urlParams; 

        //sample ?key=1H2Tqs-0nZTqxg3_i7Xd5-VHd2JMIRr9xOKe72KK6sj4

        if(el.getAttribute('data-alt')){
            //pull params from alt tag of bootjs
            urlParams = el.getAttribute('data-alt').split('&');

        } else if(urlParams == undefined){
            //if doesn't exist, pull from url param
            urlParams = window.location.search.substring(1).split('&');
            liveLoad = true;
        }


        var params = {};
        urlParams.forEach(function(param){
            var pair = param.split('=');
            params[ pair[0] ] = pair[1];
        })
        
        return params;
    }

    function init(el, context, config, mediator) {
        // DEBUG: What we get given on boot
        dom = el;
       // console.log(el, context, config, mediator);
        var params = parseUrl(el);
        if(params.key){
            loadData(params);
        } else {
            console.log('Please enter a key in the alt text of the embed or as a param on the url in the format "key="" ')
        }
    }

    function loadData(params){
        if(!liveLoad){
            get('http://interactive.guim.co.uk/spreadsheetdata/'+params.key+'.json')
                .then(JSON.parse)
                .then(function(json){
                    render(json.sheets.blocks, json.sheets.config)
                });
        } else {
            Tabletop.init({ 
                key: params.key,
                callback: function(data, tabletop) { 
                    render(data.blocks.elements, data.config.elements)
                }
            });
        }
        
    }

    function render(blocks, config){
        var data = {
            blocks: blocks.map(function(block){block.fadeState = ""; return block;}),
            config: {},
            shareMessage: "Before & After: the American Civil War",
            scrollPosition: 0
        }
        console.log(data);
        //convert array of params into a single config object
        config.forEach(function(d){

            if(d.param.search('_sizes') > -1){
                //converts string of sizes into array of numbers
                var a = d.value.split(',');
                a.forEach(function(d,i){
                    a[i] = Number(d);
                })
                data.config[d.param] = a;

            } else {
                //stores params in key value pairs of config object
                data.config[d.param] = d.value;
            }
        })
        data.shareMessage = data.config.sharemessage;

        base = new AppTemplate({
            el: dom,
            data: data,
            components: {
                leadBlock: blockLeadIntroTemplate, // SET TO TEST INTRO STYLES 
                leadIntroBlock: blockLeadIntroTemplate,
                leadIntroWithAudioBlock: blockLeadIntroWithAudioTemplate,
                photoBlock: blockPhotoTemplate,
                quoteBlock: blockQuoteTemplate,
                textBlock: blockTextTemplate,
                shareContainer: shareContainerTemplate,
                audioBlock: blockAudio,
                titleBlock: blockTitle
            },
            decorators: {
                lazyload: function ( node, options ) {
                    imageQueue.add( node, options.src, options.imgSizes ).then( function (path) {
                        var img = document.createElement("img");
                        img.setAttribute("src", path);
                        node.appendChild(img);
                
                        node.className = node.className.replace('guLazyLoad','');
                    });

                    return {
                        teardown: function () {}
                    }
                },
                photofade: function(node,options){
                    var blocks = this.get('blocks');
                    blocks[options.id].fadeState = "new";

                    this.set('blocks',blocks);

                    return {
                        teardown: function() {}
                    }
                }
            }
        });

        var footer = document.querySelector('.l-footer');
        if(footer){
            footer.setAttribute('style','display:block;');
        }

        var throttledFunction = throttle(function(){
            var scrollPos = document.documentElement.scrollTop || document.body.scrollTop;
            for(var i=0; i<fadeBlocksEl.length;i++){
                var elOffset = fadeBlocksEl[i].getBoundingClientRect().top;
                var elHeight = fadeBlocksEl[i].querySelector('.lead-photo').getBoundingClientRect().height;
                var windowHeight = window.innerHeight;
                var ractiveId = fadeBlocksEl[i].getAttribute('id').replace('p','');
                var ractiveObject = base.get('blocks[' + ractiveId + ']');
                
                if(elOffset < (windowHeight/2) - (elHeight/2) && ractiveObject.fadeState === "new"){
                    base.set('blocks[' + ractiveId + '].fadeState',"old");
                }else if(elOffset > (windowHeight/2) - (elHeight/2) && ractiveObject.fadeState === "old"){
                    base.set('blocks[' + ractiveId + '].fadeState',"new");
                };
            }
        },{delay:500})

        function faderInit(){
            fadeBlocks = base.get('blocks');
            fadeBlocksEl = document.querySelectorAll('.block-lead.intro');

            window.onscroll = function(){
                throttledFunction();
            }
            
        }

        faderInit();

        // run any/all custom code  
        // custom.init();
    }

    return {
        init: init
    };
});
