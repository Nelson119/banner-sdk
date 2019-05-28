// console.log('\'Allo \'Allo!');
(function(document,window){
    // console.log(banners);

    var _broadCast = {
        banners: [],
        init: function(){
            var banners = getBannerContainers();
            for(var index in banners){
                var banr = banners[index];
                var data = banr.dataset;
                // console.log(data);
                // this.clientID(data.baClientId);
                banr.events = {
                    onAdLoaded: addEvent('on-ad-loaded',banr),
                    onAdFailed: addEvent('on-ad-failed',banr),
                    onAdImpression: addEvent('on-ad-impression',banr)
                }
                handleBanners(banr, data);
                var _banner = {
            
                    _clientID : undefined,
                    clientID : function(val){
                        if(val){
                            this._clientID = val;
                            return this;
                        }else{
                            return this._clientID;
                        }
                    },
                    _element : undefined,
                    element : function(val){
                        if(val){
                            this._element = val;
                            return this;
                        }else{
                            return this._element;
                        }
                    },
                    _data : undefined,
                    data : function(val){
                        if(val){
                            this._data = val;
                            return this;
                        }else{
                            return this._data;
                        }
                    }
                };
                _banner.clientID(data.baClientId);
                _banner.data(data);
                _banner.element(banr);
                this.banners.push(_banner);
            }
        }
    };
    // _broadCast.init();
    // console.log(_broadCast.clientID());
    // console.log(_broadCast.banners);

    function addEvent(name,elem){
        
        var event; // The custom event that will be created

        if (document.createEvent) {
            event = document.createEvent("HTMLEvents");
            event.initEvent(name, true, true);
        } else {
            event = document.createEventObject();
            event.eventType = name;
        }
        event.eventName = name;
        event.trigger = function(){
        
            if (document.createEvent) {
                elem.dispatchEvent(event);
            } else {
                elem.fireEvent("on" + event.eventType, event);
            }
        };
        return event;
    }

    function getApiUrl(type){
        var api = {
            video: 'result.json',
            banner: 'result2.json',
            default: 'result3.json'
        };
        // console.log(api[type] || api['default']);
        return api[type] || api['default'];
    }
    function getBannerContainers(){
        var all = document.getElementsByTagName('*');
        var items = [];
        for(var index in all){
            var item = all[index];
            var baid = null;
            if(item.dataset && item.dataset.baId){
                baid = item.dataset.baId;
                items.push(item);
            }
            
        }
        return items;
    }

    function handleBanners(banr, data){
        
        var xhr = new XMLHttpRequest();
        var url = getApiUrl(data.baType);
        var resps = null;
        xhr.onload = function() {
            if (xhr.status === 200) {
                // console.log(xhr.responseText);
                try{
                    resps = JSON.parse(xhr.responseText);

                }catch(e){
                    // console.error(e);
                }
            }
            else {
                // console.error(xhr.status);
            }
            // console.log(resps.type);
            if(resps){
                switch(resps.type){
                    case 'VIDEO':
                        var ifr = document.createElement('iframe');
                        ifr.src = resps.video_url;
                    
                        banr.appendChild(ifr);
                        // console.log(banr);
                        ifr.addEventListener('load', function(){
                            imprHandler(banr,imprDetect(banr),resps.impression_url);
                        });
                        banr.events.onAdLoaded.trigger();
                        window.addEventListener('scroll', function(){
                            imprHandler(banr,imprDetect(banr),resps.impression_url);
                        });
                        break;
                    case 'BANNER':
                        var img = document.createElement('img');
                        img.src = resps.image;
                        img.style.maxWidth = '100%';
                        banr.appendChild(img);
                        // console.log(banr);
                        img.addEventListener('load', function(){
                            imprHandler(banr,imprDetect(banr),resps.impression_url);
                        });
                        window.addEventListener('scroll', function(){
                            imprHandler(banr,imprDetect(banr),resps.impression_url);
                        });
                        banr.events.onAdLoaded.trigger();
                        break;
                    default:
                        var h4 = document.createElement('h4');
                        h4.innerHTML = 'nothing...';
                        banr.appendChild(h4);
                        // console.log(imprDetect( banr ));
                        banr.events.onAdFailed.trigger();
                        break;
                }
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }

    
    function isWindow( obj ) {
        return obj != null && obj === obj.window;
    }
    function getWindow( elem ) {
        return isWindow( elem ) ? elem : elem.nodeType === 9 && elem.defaultView;
    }
    function offset( elem ) {

        var docElem, win,
            box = { top: 0, left: 0 },
            doc = elem && elem.ownerDocument;
    
        docElem = doc.documentElement;
    
        if ( typeof elem.getBoundingClientRect !== typeof undefined ) {
            box = elem.getBoundingClientRect();
        }
        win = getWindow( doc );
        // console.log(elem.offsetHeight);
        return {
            x: box.left + win.pageXOffset - docElem.clientLeft,
            y: box.top + win.pageYOffset - docElem.clientTop,
            width: elem.offsetWidth,
            height: elem.offsetHeight,
            xMax: function(){ return this.x+this.width; },
            yMax:  function(){ return this.y+this.height; }
        };
    }
    function imprDetect( elem ){
        // return elementInViewport(elem);
        var obj = offset( elem );
        var full = obj.width * obj.height;
        var viewport = {
            x: window.scrollX,
            y: window.scrollY,
            xMax: window.scrollX + window.innerWidth,
            yMax: window.scrollY + window.innerHeight,
        }
        var outer = {
            height: (viewport.y>obj.y ? (viewport.y - obj.y) : 0) + (viewport.yMax<obj.yMax()? (obj.yMax() - viewport.yMax) : 0),
            width: (viewport.x>obj.x ? (viewport.x - obj.x) : 0) + (viewport.xMax<obj.xMax()? (obj.xMax() - viewport.xMax) : 0)
        };
        var inView = {
            height: obj.height - outer.height,
            width: obj.width - outer.width
        };
        var partial = inView.height * inView.width;
        // console.log(elem.id,'elem.id');
        // console.log(obj.xMax(),'obj.xMax()');
        // console.log(viewport.xMax,'viewport.xMax');
        // console.log(viewport,'viewport');
        // console.log(outer,'outer');
        // console.log(inView,'inView');
        var percentage = partial * 10000 / full / 100;
        // console.log(percentage>100?100:percentage,'%');

        obj.percentage = percentage;


        return obj;
        // elem.
    }

    function imprHandler(elem, impr, url){
        
        var impr = imprDetect( elem );
        // console.log(impr);
        if(impr.percentage > 50 && elem.donelog != 1 && elem.sending != 1 ){
            elem.sending = 1;
            // console.log(elem.donelog);
            setTimeout(function(){
                impr = imprDetect( elem );
                if(impr.percentage > 50){
                    elem.events.onAdImpression.trigger();
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function() {
                        elem.donelog = 1;
                        elem.sending = 0;
                    };
                    xhr.onerror = function() {
                        elem.donelog = 1;
                        elem.sending = 0;
                    };
                    xhr.open('GET', url);
                    xhr.send();
                }
            }, 1000);
        }
    }

    window.BROADCAST = _broadCast;
    
    if(console.info){
        console.info('BROADCAST initialized.');
    }

}(document,window));
