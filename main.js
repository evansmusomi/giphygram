// Giphy API object
let giphy = {
  url: "https://api.giphy.com/v1/gifs/search",
  query: {
    api_key: "MCWAkBcf3WpQZIyYEqeakqcRLFotCEON",
    q: "funny",
    limit: 15
  }
};

// Update trending giphys
function update() {
  // Toggle refresh state
  $("#update .icon").toggleClass("d-none");

  // Call Giphy API
  $.get(giphy.url, giphy.query)

    // Success
    .done(function(res) {
      // Empty Element
      $("#giphys").empty();

      // Loop Giphys
      $.each(res.data, function(i, giphy) {
        // Add Giphy HTML
        $("#giphys").prepend(
          '<div class="col-sm-6 col-md-4 col-lg-3 p-1">' +
            '<img class="w-100 img-fluid" src="' +
            giphy.images.downsized_large.url +
            '">' +
            "</div>"
        );
      });
    })

    // Failure
    .fail(function() {
      $(".alert").slideDown();
      setTimeout(function() {
        $(".alert").slideUp();
      }, 2000);
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
  if (giphy["query"]["q"] !== searchTerm) {
    giphy["query"]["q"] = searchTerm;
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
