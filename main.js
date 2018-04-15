// Progressive enhancement
if (navigator.serviceWorker) {
  // Register SW
  navigator.serviceWorker.register("sw.js").catch(console.error);

  // Giphy cache clean
  function giphyCacheClean(giphys) {
    navigator.serviceWorker.getRegistration().then(registration => {
      // Only post message to active SW
      if (registration.active)
        registration.active.postMessage({
          action: "cleanGiphyCache",
          giphys: giphys
        });
    });
  }
}

// Giphy API object
let giphy = {
  url: "https://api.giphy.com/v1/gifs/search",
  query: {
    api_key: "MCWAkBcf3WpQZIyYEqeakqcRLFotCEON",
    q: "funny",
    limit: 15,
    offset: 0
  }
};

// Update offset
function updateOffset(reset = false) {
  let offset = giphy["query"]["offset"];
  if (!reset) {
    offset += giphy["query"]["limit"];
  } else {
    offset = 0;
  }
  giphy["query"]["offset"] = offset;
}

// Update giphys
function update() {
  // Toggle refresh state
  $("#update .icon").toggleClass("d-none");

  // Call Giphy API
  $.get(giphy.url, giphy.query)

    // Success
    .done(function(res) {
      $("#giphys").empty();

      let latestGiphys = [];

      $.each(res.data, function(i, giphy) {
        // Add to latest giphys
        latestGiphys.push(giphy.images.fixed_width.url);

        // Add giphy html
        $("#giphys").prepend(
          '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
            '<img class="w-100 img-fluid" src="' +
            giphy.images.fixed_width.url +
            '">' +
            "</div>"
        );
      });

      // Update request offset
      updateOffset();

      // Inform SW (if available) of current Giphys
      if (navigator.serviceWorker) giphyCacheClean(latestGiphys);
    })

    // Failure
    .fail(function() {
      $(".alert").slideDown();
      setTimeout(function() {
        $(".alert").slideUp();
      }, 2000);
      updateOffset(true);
    })

    // Complete
    .always(function() {
      // Re-Toggle refresh state
      $("#update .icon").toggleClass("d-none");
    });

  // Prevent submission if originates from click
  return false;
}

// Manual refresh
$("#update a").click(update);

// Update trending giphys on load
update();

// Display new search results
function displayNewSearchResults(event) {
  let searchTerm = event.target.value;
  let currentSearch = giphy["query"]["q"];
  if (searchTerm !== currentSearch && searchTerm !== "") {
    giphy["query"]["q"] = searchTerm;
    updateOffset(true);
    update();
  }
}

// Add event listeners
$("#query").on({
  // Refresh search results based on search term
  blur: function(event) {
    displayNewSearchResults(event);
  },
  keypress: function(event) {
    if (event.which == 13) {
      displayNewSearchResults(event);
    }
  },
  // Clear search term on focus
  focus: function() {
    $(this).val("");
  }
});
