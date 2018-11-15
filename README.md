# anilist-scrobbler

[![Licence Creative Commons](https://i.creativecommons.org/l/by-sa/4.0/80x15.png)](http://creativecommons.org/licenses/by-sa/4.0/)
[![shields.io](https://img.shields.io/badge/browsers-chromium--based%2C%20firefox-green.svg)](https://shields.io)
![Chrome Web Store](https://img.shields.io/chrome-web-store/v/gochjbmioibanjdppcempakcjcfaconi.svg)

# Notice

anilst-scrobbler is gonna die, [Scrobbly](https://github.com/leonekmi/anilist-scrobbler/tree/2.0) will replace it in further days.

## Connect to Anilist / Kitsu and "scrobble your animes"

### Websites support

-   ADN : _Anime Digital Network_
-   Crunchyroll
-   Hulu
-   Netflix
-   Wakanim

#### Planned

_Create an issue for request websites. We don't accept streaming or illegal websites_

-   None for now

### Install (stable)

[Click here](https://leonekmi.twittolabel.fr/anilist-scrobble) to download signed packages for Chrome and Firefox.

### Install (from git)

Clone this repository : `git clone https://github.com/leonekmi/anilist-scrobbler.git`

#### On Chrome-based browsers (tested for Chrome/Chromium only)

-   activate Developer mode
-   click "Load unpacked extension"
-   choose the folder
-   `git pull` sometimes :)

#### On Firefox

_On Firefox (except for [Firefox Developer and Nightly](https://support.mozilla.org/en-US/kb/add-on-signing-in-firefox#w_what-are-my-options-if-i-want-to-use-an-unsigned-add-on-advanced-users)), we cannot load an unpacked/unsigned extension for permanent._

##### Using `web-ext` tool

-   `web-ext run` in the clone folder.

##### Using Firefox debugging

-   go to `about:debugging#addons`
-   activate module debugging
-   load the `manifest.json`
