// Function to make dropdown items
function makeDropdownItem(dropdown, hasData, item = null) {
    const dropdownItem = document.createElement('a');
    const appendLocation = dropdown;
    dropdownItem.classList = 'dropdown-item d-flex';
    // If has no data, show no items matched search
    if (!(hasData)) {
        dropdownItem.innerHTML = '<div>No items matched your search.</div>';
        dropdownItem.style.backgroundColor = '#771b1f';
        dropdownItem.style.boxShadow = '0 0 10px 0 #771b1f';
        appendLocation.append(dropdownItem);
        // Set dropdown height to the messages' height
        dropdown.style.height = `${dropdownItem.offsetHeight + 20}px`;
        return dropdownItem;
    }
    dropdown.style.height = '';
    dropdownItem.innerHTML = `
        <img src="${item.Poster === 'N/A' ? '' : item.Poster}" class="img-fluid mr-3" alt="item poster" style="height: 7rem; width: 5rem;">
        <div class="d-flex flex-column justify-content-center">
            <h5 class="title">${item.Title}</h5>
            <h6 class="year">${item.Year}</h6>
        </div> 
    `;
    appendLocation.append(dropdownItem);
    return dropdownItem;
}


// Funtion to render the clicked on item from the dropdown
async function renderItemDetails(item, dropdown, input) {
    // To append that specific items summary to the appropriate side of the page
    const specificItem = await getSpecificItem(item.imdbID);

    // This is the correct side where the input event was triggered
    const side = dropdown.parentElement;

    // If left side: true, if right side: false
    const isLeftSide = side.classList.contains('left-section');

    // Classname for the stats container based on 'isLeftSide'
    // Also forwarded to 'renderMovie' and 'renderSeries' functions to set the class name on the stats containers
    const statsClassName = isLeftSide ? 'left-stats' : 'right-stats';

    // Only do input animation on desktop
    if (window.innerWidth > 768) {
        dropdown.classList.add('item-present');
        // 36px is the inputs height, making the dropdown appear under the input
        dropdown.style.transform = 'translate(-50%, 36px)';
        input.classList.add('item-present');
    }
    

    // clear any pre-existing item details if there was a item before a new search
    if (side.children[2]) {
        side.children[2].classList.add('remove-item-details');
        setTimeout(() => {
            side.children[2].remove();
        }, 500);
    }

    // Make and append details
    const detailsContainer = document.createElement('div');
    detailsContainer.classList = `container ${isLeftSide ? 'left-details' : 'right-details'}`;
    // check if is series or a movie, then item different stats
    if (item.Type === 'movie') {
        renderMovie(detailsContainer, specificItem, isLeftSide, statsClassName);
    } else if (item.Type === 'series') {
        renderSeries(detailsContainer, specificItem, isLeftSide, statsClassName);
    } else {
        renderGame(detailsContainer, specificItem, isLeftSide, statsClassName);
    }

    side.append(detailsContainer);
    requestAnimationFrame(() => {
        detailsContainer.classList.add('section-visible');
    })

    // After side has been appended and class added, assign height to side section
    // Get computed heights of elements that make up the side section -
    // process them and add that height to the side section('.left-section' or '.right-section') in order to have height animation
    let inputHeightString = getComputedStyle(input).height;
    // Index where units are ('px')
    let inputUnitsIndex = inputHeightString.length - 2;
    let inputHeight = parseFloat(inputHeightString.slice(0, inputUnitsIndex));

    let detailsHeightString = window.getComputedStyle(side.children[2]).height;
    let unitsIndex = detailsHeightString.length - 2;
    let detailsHeight = parseFloat(detailsHeightString.slice(0, unitsIndex));

    side.style.height = `${inputHeight + detailsHeight + 10}px`;

    // Return item type, side bool, and classname to easily select the elements where the comparison function runs
    return {
        data: specificItem,
        type: item.Type,
        isLeftSide: isLeftSide,
        statsClassName: statsClassName,
        item: detailsContainer
    };
}


// Debounce function
// debounce is a factory function - it makes the returned function based on the arguments
// Since the returned function replaces "debounce(onInput)", the arguments(event obj in this case) needs to be collected for the returned function in the listener
// and pass it on to the function that is gonna get executed everytime the returned function(anonymous closure) is called
const debounce = (func, delay = 500) => {
    // Have access to timeoutId becuase of the closure scope
    let timeoutId;
    return (event) => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        timeoutId = setTimeout(() => {
            // Calling onInput (func) here which uses the args (which is the event obj) to put the dropdowns on the correct sides
            func(event);
        }, delay);
    }
}

// function to render item if its a movie
function renderMovie(detailsContainer, specificItem, isLeftSide, statsClassName) {
    detailsContainer.innerHTML = `
        <div class="row mb-5">
            <div class="col-5">
                <img src="${specificItem.Poster === 'N/A' ? '' : specificItem.Poster}" alt="item poster" class="item-detail-poster">
            </div>
            <div class="col-7 px-0">
                <h5 class="card-title mb-0">${specificItem.Title}</h5>
                <h6 class="text-muted"> (${specificItem.Year})</h6>
                <p class="mb-2">${specificItem.Plot}</p>
                <small class="text-muted">${specificItem.Production}</small><br>
                <small class="text-muted">${specificItem.Genre}</small>
            </div>
        </div>
        <div class="row ${statsClassName}">
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                Box Office: ${specificItem.BoxOffice}  
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                IMDB Rating: ${specificItem.imdbRating}
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                Meta Score: ${specificItem.Metascore}
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12 mb-0">
                Awards: ${specificItem.Awards}
            </div>
        </div>
    `;
}


// function to render item if its a series
function renderSeries(detailsContainer, specificItem, isLeftSide, statsClassName) {
    detailsContainer.innerHTML = `
        <div class="row mb-5">
            <div class="col-5">
                <img src="${specificItem.Poster === 'N/A' ? '' : specificItem.Poster}" alt="item poster" class="item-detail-poster">
            </div>
            <div class="col-7 px-0">
                <h5 class="card-title mb-0">${specificItem.Title}</h5>
                <h6 class="text-muted"> (${specificItem.Year})</h6>
                <p class="mb-2">${specificItem.Plot}</p>
                <small class="text-muted">Written by ${specificItem.Writer}</small><br>
                <small class="text-muted">${specificItem.Genre}</small>
            </div>
        </div>
        <div class="row ${statsClassName}">
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                Seasons: ${specificItem.totalSeasons}  
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                IMDB Rating: ${specificItem.imdbRating}
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                IMDB Votes: ${specificItem.imdbVotes}
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12 mb-0">
                Awards: ${specificItem.Awards}
            </div>
        </div>
    `;
}

function renderGame(detailsContainer, specificItem, isLeftSide, statsClassName) {
    detailsContainer.innerHTML = `
        <div class="row mb-5">
            <div class="col-5">
                <img src="${specificItem.Poster === 'N/A' ? '' : specificItem.Poster}" alt="item poster" class="item-detail-poster">
            </div>
            <div class="col-7 px-0">
                <h5 class="card-title mb-0">${specificItem.Title}</h5>
                <h6 class="text-muted"> (${specificItem.Year})</h6>
                <p class="mb-2">${specificItem.Plot}</p>
                <small class="text-muted">Directed by ${specificItem.Director}</small><br>
                <small class="text-muted">${specificItem.Genre}</small>
            </div>
        </div>
        <div class="row ${statsClassName}">
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                IMDB Rating: ${specificItem.imdbRating}
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12">
                IMDB Votes: ${specificItem.imdbVotes}
            </div>
            <div class="${isLeftSide ? 'left-stat' : 'right-stat'} alert col-12 mb-0">
                Awards: ${specificItem.Awards}
            </div>
        </div>
    `;
}