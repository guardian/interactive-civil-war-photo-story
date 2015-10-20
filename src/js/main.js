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
    'rvc!templates/shareContainer',
    'jquery',
    'nouislider'
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
    shareContainerTemplate,
    $,
    nouislider
) {
   'use strict';
    var dom;
    var base;
    var liveLoad = false;
    var fadeBlocks,fadeBlocksEl;
    var previousScrollPos = 0;

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
        loadData();
    }

    function loadData(params){
        var key = "1_TfvV3L-VOOaKmoUvSmXSXd8NsEWZ7w5jqsUdHG7Cog";
        get('http://interactive.guim.co.uk/docsdata-test/'+key+'.json')
            .then(JSON.parse)
            .then(function(json){
                render(json.sheets.blocks, json.sheets.config)
            });
    }

    function render(blocks, config){
        var data = {
            blocks: blocks.map(function(block){
                block.fadeState = ""; 
                block.fadeLevel = 0; 
                block.secondarytext = block.secondarytext.split('\n').filter(function(i){
                    return i;
                }); 
                return block;
            }),
            config: {},
            shareMessage: "Before & After: the British coastline",
            scrollPosition: 0
        }
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
                    blocks[options.id].fadeState = "old";

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
            var windowHeight = window.innerHeight;

            for(var i=0; i<fadeBlocksEl.length;i++){
                var elOffset = fadeBlocksEl[i].getBoundingClientRect().top;
                var elHeight = fadeBlocksEl[i].querySelector('.lead-photo').getBoundingClientRect().height;
                var ractiveId = fadeBlocksEl[i].getAttribute('id').replace('p','');
                var ractiveObject = base.get('blocks[' + ractiveId + ']');
                if(!ractiveObject.toggleClicked){
                    if(elOffset + ((elHeight/3)) < (windowHeight/2) && ractiveObject.fadeState === "old"){
                        base.set('blocks[' + ractiveId + '].fadeState',"new");
                        $('#p' + ractiveId + ' .slider').val(1);
                        base.set('blocks[' + ractiveId + '].fadeLevel',1);
                    }else if(elOffset + ((elHeight/3)) > (windowHeight/2) && ractiveObject.fadeState === "new"){
                        base.set('blocks[' + ractiveId + '].fadeState',"old");
                        $('#p' + ractiveId + ' .slider').val(0);
                        base.set('blocks[' + ractiveId + '].fadeLevel',0);
                    };
                }
            }
        },{delay:500})

        var throttleFade = throttle(function(x,val){
            
        },{delay:200})

        function faderInit(){
            $(".slider").noUiSlider({
            	start: [0],
                step: 0.05,
                animate:true,
            	range: {
            		'min': 0,
            		'max': 1
            	}
            });
            var blocks = base.get('blocks');
            
            $('.slider').on('slide',function(e,val){
                var sliderId = $(e.currentTarget).attr('data-slider');
                blocks[sliderId].fadeLevel = Number(val);
                blocks[sliderId].toggleClicked = true;
                base.set('blocks',blocks);
            })

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
