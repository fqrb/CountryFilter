// ==UserScript==
// @name         Country Filter At Leaderboard
// @namespace    https://scoresaber.com/
// @version      1.0.0
// @description  Adds a button that lets you filter by your country to the leaderboard page
// @author       fqrb
// @match        https://scoresaber.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=scoresaber.com
// @updateURL    https://github.com/fqrb/CountryFilter/raw/main/main.user.js
// @downloadURL  https://github.com/fqrb/CountryFilter/raw/main/main.user.js
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  let lastUrl = location.href;

  function addCountryButton() {
    const filterContainer = document.querySelector(".filter-container");

    const url = new URL(window.location.href);

    // We only want to add the button to the leaderboard page and if we are not already filtered by NL
    if (
      !url.pathname.startsWith("/leaderboard/") ||
      url.searchParams.get("countries") === "NL"
    ) {
      console.log("Not allowed to add button here");
      return;
    }

    // If the container exists we create the element
    if (!filterContainer) {
      return;
    }

    // Check if it already exists so we do not create multiple buttons
    const existingButton = document.querySelector(".country-filter");
    if (existingButton) return;

    const countryButton = document.createElement("div");
    countryButton.innerHTML = "Filter By Netherlands 🇳🇱";
    countryButton.className = "filter country-filter svelte-1e5nn4d";
    countryButton.onclick = function () {
      url.searchParams.set("countries", "NL");
      url.searchParams.set("page", "1");
      window.location.href = url.toString();
    };
    filterContainer.appendChild(countryButton);
    console.log("Added country button!");
  }

  // Polls every 500 ms to see if the url has changed and if so, adds the country button
  setInterval(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(addCountryButton, 300); // Give DOM a moment to update
    }
  }, 500);

  // Initial run in case you immediately navigate to a leaderboard page
  // Wait for 500 ms before adding button to ensure all the elements have been added to the DOM tree
  setTimeout(addCountryButton, 500);
})();
