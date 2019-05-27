// console.log('\'Allo \'Allo!');
(function(document,window){
    var banners = getBannerContainers();
    // console.log(banners);

    var _banner = {

        _clientID : undefined,
        clientID : function(val){
            if(val){
                this._clientID = val;
                return this;
            }else{
                return this._clientID;
            }
        }
    };
    _banner.clientID('11445');
    console.log(_banner.clientID());


    for(var index in banners){
        var banr = banners[index];
        var data = banr.dataset;
        handleBanners(banr, data);
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
                        break;
                    case 'BANNER':
                        var img = document.createElement('img');
                        img.src = resps.image;
                        img.style.maxWidth = '100%';
                        banr.appendChild(img);
                        // console.log(banr);
                        break;
                    default:
                        var ifr = document.createElement('h4');
                        ifr.innerHTML = 'nothing...';
                        banr.appendChild(ifr);
                        break;
                }
            }
        };
        xhr.open('GET', url);
        xhr.send();
    }

    function isBannerImpr(element){

    }




}(document,window));
