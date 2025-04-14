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
  let countryCode = null; // Holds the users country as a code, i.e. NL

  async function addCountryButton() {
    const filterContainer = document.querySelector(".filter-container");
    let url = new URL(window.location.href);

    const country = await getUserCountry();
    if (!country) {
      console.log("Could not find country for filter button");
      return;
    }

    // We only want to add the button to the leaderboard page and if we are not already filtered by the user's country
    const isOnLeaderboard = url.pathname.startsWith("/leaderboard/");
    const isFilteredByCountry =
      url.searchParams.get("countries") === `${country}`;

    if (!isOnLeaderboard || isFilteredByCountry) {
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

    const flagEmoji = getFlagEmoji(country);
    const countryButton = document.createElement("div");
    countryButton.innerHTML = `Filter By ${country} ${flagEmoji}`;

    countryButton.className = "filter country-filter svelte-1e5nn4d";

    // For accessibility
    countryButton.title = `Filter leaderboard to ${country}`;
    countryButton.tabIndex = 0;
    countryButton.role = "button";
    countryButton.addEventListener("keydown", (e) => {
      // If someone presses enter or space we also listen to that
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        countryButton.click();
      }
    });

    // Add the on click which actually filters
    countryButton.onclick = function () {
      url = new URL(window.location.href);
      url.searchParams.set("countries", `${country}`);
      url.searchParams.set("page", "1");
      window.location.href = url.toString();
    };
    filterContainer.appendChild(countryButton);
    console.log("Added country button!");
  }

  async function getUserCountry() {
    // If we already have the country no need to get it again
    if (countryCode) return countryCode;

    // Every page has a navbar with your profile image, which has a link to your profile, that features your id
    const profileLink = document.querySelector('a[href^="/u/"]');
    if (!profileLink) return null;

    const userId = profileLink.getAttribute("href").split("/u/")[1];
    if (!userId) return null;

    // Get the user's country from an API request
    try {
      const response = await fetch(
        `https://scoresaber.com/api/player/${userId}/basic`
      );
      const data = await response.json();
      countryCode = data.country;
      return countryCode;
    } catch (err) {
      console.error("Failed to get user country:", err);
      return null;
    }
  }

  // Converts a country code (NL) into the emoji => 🇳🇱
  // Credits to https://dev.to/jorik/country-code-to-flag-emoji-a21
  function getFlagEmoji(countryCode) {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt());
    return String.fromCodePoint(...codePoints);
  }

  // Create a mutation observer which checks if something in the DOM tree changes.
  const observer = new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      setTimeout(addCountryButton, 300); // Give DOM a moment to update
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Initial run in case you immediately navigate to a leaderboard page
  // Wait for 500 ms before adding button to ensure all the elements have been added to the DOM tree
  setTimeout(addCountryButton, 500);
})();
