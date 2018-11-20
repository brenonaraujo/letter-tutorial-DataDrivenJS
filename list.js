itemsUl =  document.querySelector('.items ul');

function sortList(ul, property){
    var new_ul = ul.cloneNode(false);

    // Add all list elements to an array
    var lis = [];
    for(var i = ul.childNodes.length; i--;){
        if(ul.childNodes[i].nodeName === 'LI')
            lis.push(ul.childNodes[i]);
    }

    if (property){
        // Sort the lis in descending order
        lis.sort(function(a, b){
           return b.dataset[property] - 
                  a.dataset[property];
        });
    }else{
        // sort alphabetically a-z
        lis.sort(function(a, b){
            var aText = a.lastElementChild.innerText.toLowerCase();
            var bText = b.lastElementChild.innerText.toLowerCase();
            if(aText < bText) return -1;
            if(aText > bText) return 1;
            return 0;
        });
    }
    // Add them into the ul in order
    for(var i = 0; i < lis.length; i++)
        new_ul.appendChild(lis[i]);
    ul.parentNode.replaceChild(new_ul, ul);
}
function orderAlphabetically (){
    sortList (document.querySelector('.items ul'));
    document.querySelector('.items').classList.remove('initial');
}

orderAlphabetically();

////////////////////////// Controller Functions

var addLikes = function(el,likes){
    el.innerHTML = '<span class="likes">'+likes+' <span>&hearts;</span></span>' + el.innerHTML;
}

function orderByLikes (){
    
    if (itemsUl.dataset.likesLoaded != '1'){
        document.querySelector('.items').classList.add('initial');
        return setTimeout(orderByLikes,20);
    }
    document.querySelector('.order-by-likes').classList.add('active');
    sortList (document.querySelector('.items ul'), 'likes');
    document.querySelector('.items').classList.remove('initial');
}

function orderByViews (){
    
    if (itemsUl.dataset.viewsLoaded != '1'){
        document.querySelector('.items').classList.add('initial');
        loadViews();
        return setTimeout(orderByViews,500);
    }
    document.querySelector('.order-by-views').classList.add('active');
    sortList (document.querySelector('.items ul'), 'views');
    document.querySelector('.items').classList.remove('initial');
}

///////////////////////// !the page is ready, now add some data-driven features below

function loadViews (){
    DD.reader.read('5d19052c72c9c6cab254ec54bcf1623e/Session_listGroupedDatapointsByFilters/2d0e7c60824f2263698810b0472539c4',{}, function(response){
        itemsUl.dataset.viewsLoaded = '1';
        var letterLinks = document.querySelectorAll('.items > ul a');
        var lettersIndex = {};
        for (var i = 0; i<letterLinks.length; i++){       
            lettersIndex[letterLinks[i].href] = letterLinks[i];
            letterLinks[i].parentElement.dataset.views = 0;
        }
        for (i = 0; i<response.results.length; i++){
            var r = response.results[i];
            if (lettersIndex[r.URL]){
                var li = lettersIndex[r.URL].parentElement;
                li.dataset.views = r.views*1;
            }
        }
        
        
    });
}

function loadLikes (){
    DD.reader.read('5d19052c72c9c6cab254ec54bcf1623e/Session_listGroupedDatapointsByFilters/5514c70d1e8a5abcd5be0e7b628af81e',{}, function(response){
        itemsUl.dataset.likesLoaded = '1';
        var letterLinks = document.querySelectorAll('.items > ul a');
        var lettersIndex = {};
        for (var i = 0; i<letterLinks.length; i++){       
            var letterId = letterLinks[i].href.split('?letter=')[1];
            lettersIndex[letterId] = letterLinks[i];
            letterLinks[i].parentElement.dataset.likes = 0;
        }
        for (i = 0; i<response.results.length; i++){
            var r = response.results[i];
            if (lettersIndex[r.liked]){
                var li = lettersIndex[r.liked].parentElement;
                addLikes(li, r.likes);
                li.dataset.likes = r.likes*1;
            }
        }
        
        
    });
}

orderOptions = document.createElement('div');
orderOptions.classList.add('options');
orderOptions.innerHTML = 'Order by <a href="#" class="order-by-likes">likes</a>, <a href="#" class="order-by-views">views</a> or <a href="#" class="order-alphabetically">alphabetically</a>';
var wrapper = document.querySelector('.wrapper');
wrapper.insertBefore(orderOptions,wrapper.children[1]);

orderOptions.addEventListener('click',function(e){
    if(e.target.tagName==='A'){
        var active = document.querySelector('.options .active');
        if (active) active.classList.remove('active');
    
        if (e.target.className==='order-by-likes'){
            orderByLikes();
        }else if (e.target.className==='order-by-views'){
            orderByViews();
        }else if (e.target.className==='order-alphabetically'){
            orderAlphabetically();
        }
        e.target.classList.add('active');
    
    }
    e.preventDefault();
})


loadLikes();