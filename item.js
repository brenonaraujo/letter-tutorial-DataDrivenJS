/*
    retrieves the letterID from URL which will be used to 
    show the letter. It can also be used for tracking.
*/

function getLetterID() {
    var id;
    var letterParam = window.location.search.split('letter=');
    if (letterParam[1] && letterParam[1] != '') {
        id = letterParam[1].split('&')[0];
    } else {
        console.warn('No letter ID found in the URL. Using a dummy ID instead');
        id = 'a-green-round-sans-bold-uppercase';
    }
    return id;
}

/*  
    shows the main letter based on its ID
*/

function setTheMainLetter(id) {
    var itemsList = document.querySelector('.content .items');
    addLetter(id, itemsList);
    setTimeout(function () {
        itemsList.classList.remove('initial');
    }, 300);
}

/* 
    inserts any letter into the list, this could be used 
    to show other letters, not just the main one 
*/

function addLetter(id, itemsList) {
    var letter = id.split('-');
    var item = document.createElement('div');
    item.innerHTML = '<span>' + letter.shift() + '</span>';
    item.className = letter.join(' ');
    itemsList.appendChild(item);
}


/* 
    enable the back button 
*/

document.querySelector('.backBtn').addEventListener('click', function (e) {
    history.back();
    e.preventDefault();
});


function addStat(type, message) {
    var tpl = '<div class="stat ' + type + '">' + message + '</div>';
    document.querySelector('.stats').innerHTML += tpl;
}

/* 
    set up the page
*/

var letterID = getLetterID();
setTheMainLetter(letterID);

// add likeBtn
function addLikeBtn() {
    var likeBtn = document.createElement('a');
    likeBtn.classList.add('likeBtn');
    likeBtn.href = '#like';
    likeBtn.innerHTML = '&hearts;';

    var container = document.querySelector('.actions');
    container.insertBefore(likeBtn, container.firstElementChild);

    // check if this letter has already been liked
    try {
        if (localStorage.getItem(letterID)) {
            likeBtn.classList.add('liked');
        }
    } catch (error) {
        console.log(error);
    }

    likeBtn.addEventListener('click', function (e) {
        if (!likeBtn.classList.contains('liked')) {
            likeBtn.classList.add('liked');
            // use global letterID to track the liked letter
            localStorage.setItem(letterID, `${new Date()}`);
            DD.tracker.trackMetaEvent('liked', letterID);
            addStat('likes', `<strong> Thanks for your like!</strong>'`);
        } else {
            console.log('Letter liked');
        }
        e.preventDefault();
    });
}

///////////////////////// !the page is ready, now add some data-driven features below

// create data feed, it has to be named so you can manage it
// in the DD.Console
const home = DD.data.feed('Letter Page Views');
// select URLs and their count as 'views' into the feed
home.select(
    DD.data.datapoints.metaevent('URL')
    .contains('/item.html').as('URL'),
    DD.data.datapoints.metaevent('URL')
    .contains('/item.html').count().as('views')
);

// Count likes by user
const likesByUser = DD.data.feed('Letter Likes');
likesByUser.select([
    DD.data.datapoints.metaevent("liked"),
    DD.data.datapoints.property("visitorID")
    .countDistinct().as('likes')
]);

// Create query Function
function createQuery(select, where, equals) {
    const query = DD.data.feedQuery()
        .select(DD.data.feedColumn(select))
        .where(DD.data.feedColumn(where).equals(equals));
    return query;
}

function likesInfo() {
    DD.reader.read(likesByUser, createQuery('likes', 'liked', letterID), function (response) {
        if (response.results[0]) {
            var phrase;
            if (response.results[0].likes == 1) {
                phrase = 'person likes';
            } else {
                phrase = 'people like';
            }
            addStat('likes', '<strong>' + response.results[0].likes + '</strong> ' + phrase + ' it.');
        } else {
            addStat('views', 'This letter is sad. <strong>Nobody likes it</strong>, do you?');
        }
    })
};

function pageViewsInfo() {
    DD.reader.read(home, createQuery('views', 'URL', window.location.href), function (response) {
        if (response.results[0]) {
            var phrase;
            if (response.results[0].views == 1) {
                phrase = 'time.';
            } else {
                phrase = 'times.';
            }
            addStat('views', 'Viewed <strong>' + response.results[0].views + '</strong> ' + phrase);

            // there are views, let's see if there were likes too
            likesInfo();
        } else {
            addStat("views", "You are the first person to view this letter, <strong>isn't it pretty?</strong>");
        }
    });
}

addLikeBtn();
pageViewsInfo();
likesInfo();