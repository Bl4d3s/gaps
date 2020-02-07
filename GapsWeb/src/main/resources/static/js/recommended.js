/*
 * Copyright 2019 Jason H House
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

let libraryTitle, notSearchedYetContainer, movieContainer, searchContainer, noMovieContainer;
let plexServers;
let plexServer;
let moviesTable;
let libraryKey;

let stompClient;
let backButton;
let searchResults;
let searchTitle;
let searchDescription;
let movieCounter;

jQuery(function ($) {
    Handlebars.registerHelper('json', function (context) {
        return JSON.stringify(context);
    });

    libraryTitle = $('#libraryTitle');
    notSearchedYetContainer = $('#notSearchedYetContainer');
    movieContainer = $('#movieContainer');
    noMovieContainer = $('#noMovieContainer');
    movieSearchingContainer = $('#movieSearchingContainer');
    plexServers = JSON.parse($('#plexServers').val());
    plexServer = JSON.parse($('#plexServer').val());
    libraryKey = $('#libraryKey').val();

    backButton = $('#cancel');

    searchResults = [];
    searchContainer = $('#searchContainer');
    searchTitle = $('#searchTitle');
    searchDescription = $('#searchDescription');

    moviesTable = $('#movies').DataTable({
        initComplete: function () {
            getMoviesForTable(`/recommended/${plexServer.machineIdentifier}/${libraryKey}`);
        },
        deferRender: true,
        search: true,
        columns: [
            {
                data: "card",
                render: function (data, type, row) {
                    if (type === 'display') {
                        row.address = plexServer.address;
                        row.port = plexServer.port;
                        row.plexToken = plexServer.plexToken;

                        const plexServerCard = $("#movieCard").html();
                        const theTemplate = Handlebars.compile(plexServerCard);
                        return theTemplate(row);
                    }
                    return "";
                }
            },
            {
                data: "title",
                searchable: true,
                visible: false,
                render: function (data, type, row) {
                    if (type === 'display' && row.name) {
                        return row.name;
                    }
                    return "";
                }
            },
            {
                data: "year",
                searchable: true,
                visible: false,
                render: function (data, type, row) {
                    if (type === 'display' && row.year) {
                        return row.year;
                    }
                    return "";
                }
            },
            {
                data: "language",
                searchable: true,
                visible: false,
                render: function (data, type, row) {
                    if (type === 'display' && row.language) {
                        return row.language;
                    }
                    return "";
                }
            },
            {
                data: "summary",
                searchable: true,
                visible: false,
                render: function (data, type, row) {
                    if (type === 'display' && row.overview) {
                        return row.overview;
                    }
                    return "";
                }
            },
        ]
    });


    const socket = new SockJS('/gs-guide-websocket');
    stompClient = Stomp.over(socket);
    stompClient.connect({}, function () {

        stompClient.subscribe('/finishedSearching', function (payload) {
            searchContainer.css({'display': 'none'});

            backButton.text('Restart');
            disconnect();
            if (payload && payload.code === 0) {
                searchTitle.text(`Search Complete`);
                searchDescription.text(`${movieCounter} movies to add to complete your collections. Below is everything Gaps found that is missing from your movie collections.`);
                setCopyToClipboardEnabled(true);
            } else {
                searchTitle.text("Search Failed");
                searchDescription.text(payload.reason);
                setCopyToClipboardEnabled(false);
                movieContainer.css({'display': 'none'});
                notSearchedYetContainer.css({'display': 'none'});
                noMovieContainer.show(100);
            }
        });

        stompClient.subscribe('/newMovieFound', function (status) {
            const obj = JSON.parse(status.body);
            showSearchStatus(obj);

            function buildUrl(nextMovie) {
                if (nextMovie.tvdbId) {
                    return `https://www.themoviedb.org/movie/${nextMovie.tvdbId}`;
                }

                if (nextMovie.imdbId) {
                    return `https://www.imdb.com/title/${nextMovie.imdbId}/`
                }

                return undefined;
            }

            if (obj.nextMovie) {
                movieCounter++;
                moviesTable.row.add(obj.nextMovie).draw();
                searchResults.push(`${obj.nextMovie.name} (${obj.nextMovie.year}) in collection '${obj.nextMovie.collection}'`)
            }
        });
    });

});

function switchPlexLibrary(machineIdentifier, key) {
    libraryKey = key;
    plexServer = plexServers[machineIdentifier];
    const plexLibrary = plexServer.plexLibraries.find(plexServer => plexServer.key === parseInt(key));
    libraryTitle.text(`${plexServer.friendlyName} - ${plexLibrary.title}`);

    notSearchedYetContainer.css({'display': 'none'});
    moviesTable.data().clear();
    moviesTable.rows().invalidate().draw();

    getMoviesForTable(`/recommended/${machineIdentifier}/${libraryKey}`);
}

function getMoviesForTable(url) {
    $.ajax({
        type: "GET",
        url: url,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (result) {
            if (result.success) {
                movieContainer.show(100);
                notSearchedYetContainer.css({'display': 'none'});
                moviesTable.rows.add(JSON.parse(result.movies)).draw();
            } else {
                movieContainer.css({'display': 'none'});
                notSearchedYetContainer.show(100);
            }
        }, error: function () {
            movieContainer.css({'display': 'none'});
            notSearchedYetContainer.show(100);
            //Show error + error
        }
    });
}

function cancel() {
    stompClient.send(`/recommended/cancel/${plexServer.machineIdentifier}/${libraryKey}`);

    //Navigate Home
    location.assign("/");
}

window.onbeforeunload = function () {
    disconnect();
};

function setCopyToClipboardEnabled(bool) {
    if (bool) {
        $('#copyToClipboard').removeClass('disabled');
    } else {
        $('#copyToClipboard').addClass('disabled');
    }
}

function searchForMovies() {
    movieContainer.show(100);
    searchContainer.show(100);
    notSearchedYetContainer.css({'display': 'none'});
    noMovieContainer.css({'display': 'none'});

    //reset movie counter;
    movieCounter = 0;
    searchTitle.text("Searching for Movies");
    searchDescription.text("Gaps is looking through your Plex libraries. This could take a while so just sit tight, and we'll find all the missing movies for you.");

    //ToDo
    //Change to searching with recommended
    $.ajax({
        type: "PUT",
        url: `/recommended/find/${plexServer.machineIdentifier}/${libraryKey}`,
        contentType: "application/json"
    });

    showSearchStatus();
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
    console.log("Disconnected");
}

function showSearchStatus(obj) {
    if (!obj) {
        searchDescription.html("");
    } else {
        obj.percentage = Math.trunc(obj.searchedMovieCount / obj.totalMovieCount * 100);

        const plexServerCard = $("#updateSearchDescription").html();
        const theTemplate = Handlebars.compile(plexServerCard);
        searchDescription.html(theTemplate(obj));
    }
}

function copy(arr) {
    const stringified = arr.join('\r\n');
    $('<input>').val(stringified).appendTo('body').select();
    document.execCommand('copy');
}

function copyToClipboard() {
    copy(searchResults);
    $('#copiedToClipboard').show();
}
