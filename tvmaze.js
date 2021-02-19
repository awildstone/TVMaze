/** Given a query string, return array of matching shows:
 *     { id, name, summary, episodesUrl }
 */


/** Search Shows
 *    - given a search term, search for tv shows that
 *      match that query.
 *   - Returns an array of objects.
 */
async function searchShows(query) {
  const url = 'https://api.tvmaze.com/search/shows';
  //get the shows from the API that match the search query
  const showsArray = await axios.get(url, {params: {q: query}});

  //remove search form value
  $("#search-query").val('');

  if (showsArray.data.length >= 1) {
    return showsArray.data;
  } else {
    throw new Error(`There was an error searching for ${query}`);
  }
}

/** Populate shows list:
 *     - given list of shows, add shows to DOM
 *     - shows are a card that contains the show image, name, sumary, 
 *       and toggle episodes button
 *     - show id is added to the card as data attribute
 */

function populateShows(shows) {
  //target show-list container
  const $showsList = $("#shows-list");
  //empty any existing (previous query) show cards
  $showsList.empty();
  //append each show card to the DOM
  for (let show of shows) {
    let showImg;
    if (show.show.image) {
      showImg = show.show.image.medium;
    } else {
      showImg = 'https://tinyurl.com/tv-missing';
    }
    let $item = $(
      `<div class="col-md-6 col-lg-3" data-show-id="${show.show.id}">
         <div class="card" data-show-id="${show.show.id}">
         <img class="card-img-top" src="${showImg}">
           <div class="card-body">
             <h5 class="card-title">${show.show.name}</h5>
             <p class="card-text">${show.show.summary}</p>
             <button class="btn btn-success" data-bs-toggle="modal" data-bs-target="#episodeModal">Episodes</button>
           </div>
         </div>
       </div>
      `);
    $showsList.append($item);
  }
}


/** Handle search form submission:
 *    - get list of matching shows and show in shows list
 */

$("#search-form").on("submit", async function handleSearch (evt) {
  //prevent default form submission
  evt.preventDefault();
  //get the search term, if empty return
  let query = $("#search-query").val();
  if (!query) return;

  try {
    //get the list of shows for the search term
    let shows = await searchShows(query);
    //add the show cards to the DOM
    populateShows(shows);
  } catch (e) {
    alert(e);
  }
});


/** Given a show ID, return list of episodes:
 *      { id, name, season, number }
 */

async function getEpisodes(id) {
  //get the list of episodes from the API
  const episodes = await axios(`https://api.tvmaze.com/shows/${id}/episodes`);
  return episodes.data;
}

/** Given an array of episodes, append a list of episodes to the DOM:
 *      { episode name, season, episode number }
 */
function populateEpisodes(episodes) {
  //target the modal ul
  const episodeList = $('#episodes-list');
  //append the episodes to the DOM
  for (let episode of episodes) {
    episodeList.append(`<li>${episode.name}, Season ${episode.season} Episode # ${episode.number}</li>`);
  }
}

/** Toggle episode list modal:
 *    - empty any existing episodes from the modal list
 *    - get list of matching episodes for show id
 */
const showList = $('#shows-list');
showList.on('click', 'button', async function() {
  //remove episodes so the modal can be used for the next group of episodes clicked
  const episodeList = $('#episodes-list');
  episodeList.empty();

  //get the show id of the closest parent element
  const showId = $(this).closest('.card').attr('data-show-id');

  try {
    //get the episodes for the show id
    const episodeArray = await getEpisodes(showId);
    //populate the list of episodes in the DOM
    populateEpisodes(episodeArray);
  } catch (e) {
    alert(e);
  }
});