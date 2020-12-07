const apiKey = 'b75cc08cea29ecc3dd19cfd9ece3d7fa';
const imagePrefix = "http://image.tmdb.org/t/p/w220_and_h330_face";
let moviesList = new Object();
const toggleGridClass = 'flex-column';
var largeImagePrefix = 'http://image.tmdb.org/t/p/w440_and_h660_face';
const sortByList = [{ "value": "popularity.desc", "text": "Popularity Descending" },
{ "value": "popularity.asc", "text": "Popularity Ascending" },
{ "value": "vote_average.desc", "text": "Rating Descending" },
{ "value": "vote_average.asc", "text": "Rating Ascending" },
{ "value": "release_date.desc", "text": "Release Date Descending" },
{ "value": "release_date.asc", "text": "Release Date Ascending" },
{ "value": "title.asc", "text": "Title (A-Z)" },
{ "value": "title.desc", "text": "Title (Z-A)" }];

jQuery(() => {
    onInit();
    loadData(2020, "28");
});

const loadData = (year, with_genres) => {
    var requestUrl = "https://api.themoviedb.org/3/discover/movie?api_key=" + apiKey;
    if (year) requestUrl += "&year=" + year;
    if (with_genres) requestUrl += "&with_genres=" + with_genres;

    $.ajax({
        method: "GET",
        url: requestUrl,
        dataType: "json"
    }).done(function (data) {
        moviesList = data;
        reBuildGrid(data.results);
    });
}

function onInit() {

    $('#applyFilter').on("click", () => { applyFilter(); });
    $('#toggle-gridview').on("click", () => {
        var moviesListComponent = $('#movies-list');
        if (moviesListComponent.hasClass(toggleGridClass)) {
            moviesListComponent.removeClass(toggleGridClass);
            //$('.text-wrapper').each((index, element) => { $(element).removeClass('bg-dark text-white'); });
            $('img').each((index, element) => {
                const imagePath = $(element).attr('alt');
                if (imagePath)
                    $(element).attr('src', imagePrefix + imagePath);
            });
        }
        else {
            moviesListComponent.addClass(toggleGridClass);
            $('img').each((index, element) => {
                const imagePath = $(element).attr('alt');
                if (imagePath)
                    $(element).attr('src', largeImagePrefix + imagePath);
            });
            //$('.text-wrapper').each((index, element) => { $(element).addClass('bg-dark text-white'); });
        }
    });
}

function sortByTitle(a, b, isAsc) {
    if (a.title < b.title) {
        return isAsc ? -1 : 1;
    }
    if (a.title > b.title) {
        return isAsc ? 1 : -1;
    }
    return 0;
}

function sortByOnChange(e) {
    let moviesListResults = moviesList.results;
    switch (e.value) {
        case 'title.asc':
            moviesListResults.sort((a, b) => { return sortByTitle(a, b, true); });
            break;

        case 'title.desc':
            moviesListResults.sort((a, b) => { return sortByTitle(a, b, false); });
            break;
        case 'popularity.asc':
            moviesListResults.sort(function (a, b) { return a.popularity - b.popularity; });
            break;
        case 'popularity.desc':
            moviesListResults.sort(function (a, b) { return a.popularity - b.popularity > 0 ? -1 : 1; });
            break;
        case 'vote_average.asc':
            moviesListResults.sort(function (a, b) { return a.vote_average - b.vote_average; });
            break;
        case 'vote_average.desc':
            moviesListResults.sort(function (a, b) { return a.vote_average - b.vote_average > 0 ? -1 : 1; });
            break;
        case 'release_date.asc':
            moviesListResults.sort(function (a, b) { return new Date(a.release_date) - new Date(b.release_date); });
            break;
        case 'release_date.desc':
            moviesListResults.sort(function (a, b) { return new Date(a.release_date) - new Date(b.release_date) > 0 ? -1 : 1; });
            break;

    }
    reBuildGrid(moviesListResults);
}

function reBuildGrid(moviesListResults) {
    $('#movies-list').html('');
    $.each(moviesListResults, function (index, item) {
        try {
            if (item) {
                $('#movies-list').append(createNewListItem(item));
            }
        }
        catch (error) {
            console.log(error);
        }
    });
}

function createNewListItem(item) {
    const itemTemplate = $('#movie-template').clone();
    itemTemplate.attr('id', 'movie-' + item.id);
    itemTemplate.attr('style', '');
    itemTemplate.find('a').attr('href', '#' + item.id);
    itemTemplate.find('p').text(item.overview);
    itemTemplate.find('h2').text(item.original_title);
    itemTemplate.find('span').text('Released:' + item.release_date + '| Rating:' +
        item.vote_average + ' | Popularity' + item.popularity);
    const itemTemplateImage = itemTemplate.find('img');
    if (item.poster_path) {
        itemTemplateImage.attr('src', imagePrefix + item.poster_path);
        itemTemplateImage.attr('alt', item.poster_path);
    } else if (item.backdrop_path) {
        itemTemplateImage.attr('src', imagePrefix + item.backdrop_path);
        itemTemplateImage.attr('alt', item.backdrop_path);
    }
    else
        itemTemplate.find('img').hide();

    return itemTemplate;
}

function applyFilter() {
    const year = $('#filter-year').val();
    let with_genres = '';
    $("input:checkbox:checked").each(function () {
        with_genres += $(this).val() + ',';
    });

    if (year || with_genres.length > 0) {
        loadData(year, with_genres);
    }
}