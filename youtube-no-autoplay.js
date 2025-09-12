// ==UserScript==
// @name         YouTube No Autoplay
// @version      1.0
// @description  Simple autoplay disabler that survives YouTube navigation
// @author       enterdot
// @match        https://www.youtube.com/*
// @match        https://youtube.com/*
// @run-at       document-start
// @grant        none
// @namespace    youtube-no-autoplay
// ==/UserScript==

(function() {
  'use strict';

  window.YouTubeAutoplayController = {

    DEBUG: true,
    RETRY_DELAY: 500,
    TRANSITION_DELAY: 500,
    MAX_RETRIES: 10,
    ENGAGEMENT_THRESHOLD: 5,

    observer: null,
    lastUrl: '',
    autoplayProcessed: false,
    retryCount: 0,
    userIsEngaged: false,
    engagementWatcher: null,
    isInitialized: false,

    log: function(message) {
      if (this.DEBUG) {
        console.log(`[YouTube No Autoplay]: ${message}`);
      }
    },

    setupEngagementWatcher: function() {
      const video = document.querySelector('video');

      if (!video) {
        this.log('Video element not found for engagement tracking.');
        setTimeout(() => this.setupEngagementWatcher(), 1000);
        return;
      }

      if (this.engagementWatcher) {
        video.removeEventListener('timeupdate', this.engagementWatcher);
      }

      const self = this;
      this.engagementWatcher = function() {
        if (video.currentTime > self.ENGAGEMENT_THRESHOLD && !self.userIsEngaged) {
          self.userIsEngaged = true;
          self.log(`User engagement threshold reached (${video.currentTime.toFixed(1)}s > ${self.ENGAGEMENT_THRESHOLD}s), allowing autoplay.`);

          video.removeEventListener('timeupdate', self.engagementWatcher);
          self.engagementWatcher = null;
        }
      };

      video.addEventListener('timeupdate', this.engagementWatcher);
      this.log(`Engagement tracker set up, threshold is ${this.ENGAGEMENT_THRESHOLD}s.`);
    },

    processAutoplay: function() {

      if (this.userIsEngaged) {
        this.log(`User is engaged, skipping automatic disabling of autoplay.`);
        return false;
      }

      const autoplayElement = document.querySelector('.ytp-autonav-toggle-button');

      if (!autoplayElement) {
        if (this.retryCount < this.MAX_RETRIES) {
          this.retryCount++;
          this.log(`Autoplay element not found, retrying... (${this.retryCount}/${this.MAX_RETRIES})`);
          setTimeout(() => this.processAutoplay(), this.RETRY_DELAY);
          return false;
        } else {
          this.log(`Autoplay element not found after ${this.MAX_RETRIES} retries.`);
          return false;
        }
      }

      this.retryCount = 0;

      const isEnabled = autoplayElement.getAttribute('aria-checked') === 'true';

      if (isEnabled) {
        this.log('Disabling autoplay...');
        try {
          autoplayElement.click();
          this.log('Autoplay state toggled.');
          this.autoplayProcessed = true;
          return true;
        } catch (error) {
          this.log(`Error toggling autoplay, ${error.message}.`);
          return false;
        }
      } else {
        this.log('Autoplay already disabled, no action needed.');
        this.autoplayProcessed = true;
        return false;
      }
    },

    handleNavigation: function() {
      const currentUrl = window.location.href;

      if (currentUrl !== this.lastUrl && currentUrl.includes('/watch')) {
        this.log(`Navigation detected, new URL is ${currentUrl}.`);
        this.lastUrl = currentUrl;

        // Reset state for new URL
        this.userIsEngaged = false;
        this.autoplayProcessed = false;
        this.retryCount = 0;

        setTimeout(() => this.setupEngagementWatcher(), 500);
        setTimeout(() => this.processAutoplay(), 1500);
      }
    },

    setupObserver: function() {
      if (this.observer) {
        this.observer.disconnect();
      }

      // Capture reference for use in observer
      const self = this;

      this.observer = new MutationObserver((mutations) => {
        let needsProcessing = false;

        mutations.forEach((mutation) => {
          if (mutation.type === 'attributes' &&
            mutation.target.classList.contains('ytp-autonav-toggle-button') &&
            mutation.attributeName === 'aria-checked') { // Autoplay toggle state changes

            const newValue = mutation.target.getAttribute('aria-checked');
            self.log(`Observed autoplay state change to ${newValue}.`);

            if (newValue === 'true') {
              needsProcessing = true;

              if (self.autoplayProcessed) {
                self.log('Autoplay re-enabled after processing, re-processing...');
                self.autoplayProcessed = false;
              }
            }
          } else if (mutation.type === 'childList') { // Autoplay elements additions
            const addedNodes = Array.from(mutation.addedNodes);
            const hasAutoplayElement = addedNodes.some(node =>
              node.nodeType === 1 && (
                (node.classList && node.classList.contains('ytp-autonav-toggle-button')) ||
                (node.querySelector && node.querySelector('.ytp-autonav-toggle-button'))
              )
            );

            if (hasAutoplayElement && !self.autoplayProcessed) {
              needsProcessing = true;
              self.log('Autoplay element added to DOM.');
            }
          }
        });

        if (needsProcessing) {
          // Delay for state changes to handle rapid transitions
          setTimeout(() => self.processAutoplay(), self.TRANSITION_DELAY);
        }
      });

      this.observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-checked']
      });

      this.log('Observer set up completed.');
    },

    initialize: function() {
      if (this.isInitialized) {
        this.log('Already initialized, no action needed.');
        return;
      }

      this.log('Initializing...');

      const self = this;
      const init = () => {
        self.setupObserver();
        self.handleNavigation(); // Process current page

        // Hook into navigation events
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function() {
          originalPushState.apply(history, arguments);
          setTimeout(() => self.handleNavigation(), 100);
        };

        history.replaceState = function() {
          originalReplaceState.apply(history, arguments);
          setTimeout(() => self.handleNavigation(), 100);
        };

        window.addEventListener('popstate', () => self.handleNavigation());

        self.isInitialized = true;
        self.log('Initialization was completed successfully.');
      };

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
      } else {
        setTimeout(init, 500);
      }
    },
  };

  window.YouTubeAutoplayController.initialize();

})();
