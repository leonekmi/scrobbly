# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project **doesn't** adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) because of WebExtensions limitations.

_Warning : Since manifest.json cannot accept tags such as 'rc1' or 'alpha', the release tag isn't in release version but in release name._

## [Unreleased] (release 2.2.2-epsilon)
### Fixed
- Wakanim other regions support (de, ru, etc...)

## [2.2.1] (release 2.2.1-epsilon)
### Fixed
- Fallback for title preference (if user-preferred title is not available)

## [2.2] (release 2.2-epsilon)
### Added
- Manual scrobbling
- Customization options : popup customization, writing way (Rōmaji, English, Native)
- Ignore an anime

### Fixed
- Netflix support improved

## [2.1] (release 2.1-rc1 / 2.1-epsilon)
### Added
- Anime Digital Network support
- HiDive support
- AnimeOnDemand support
- TheTVDB support
- Diagnostic system to detect auth issues

### Changed
- Privacy policy updates

### Fixed
- Wrong anime? button is aborting when user clicks Cancel.
- Crunchyroll main anime page is not detected as a player page.

## [2.0.2] (release 2.0-epsilon)
### Added
- Anime switch is now cached

### Changed
- Season support in most streaming websites

### Fixed
- Daemon logging fixed
- License disclaimer in files

## [2.0.1] (release 2.0-rc2)
### Fixed
- Kitsu login is now working correctly
- Logging from websites is now the same

## [2.0.0] (release 2.0-rc1)
### Added
- Crunchyroll / Wakanim / Plex / Emby / Netflix support
- Kitsu / AniList support
- UI rework from v1

[Unreleased]: https://github.com/leonekmi/scrobbly/compare/v2.2.1-epsilon...master
[2.2.1]: https://github.com/leonekmi/scrobbly/compare/v2.2-epsilon...v2.2.1-epsilon
[2.2]: https://github.com/leonekmi/scrobbly/compare/v2.1-epsilon...v2.2-epsilon
[2.1]: https://github.com/leonekmi/scrobbly/compare/v2.0-epsilon...v2.1-epsilon
[2.0.2]: https://github.com/leonekmi/scrobbly/compare/v2.0-rc2...v2.0-epsilon
[2.0.1]: https://github.com/leonekmi/scrobbly/compare/v2.0-rc1...v2.0-rc2
[2.0.0]: https://github.com/leonekmi/scrobbly/compare/v1.12.2-delta...v2.0-rc1
