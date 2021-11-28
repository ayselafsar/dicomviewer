# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [1.2.3] - 2021-11-28

### Added
- Implement new sidebar tab for DICOM image thumbnail and attributes
- Add compatibility with Nextcloud 22 (#76)

## [1.2.2] - 2020-04-07

### Added
- Support for Nextcloud 18

## [1.2.1] - 2019-12-07

### Fixed
- Fixed the sidebar issues in Nextcloud 16 and 17
- Fixed some translations (Thanks to the translation contributors)

### Added
- Support for Nextcloud 17
- Added PANO extension with DICOM mimetype
- Added new translations (Thanks to the translation contributors)

## [1.2.0] - 2019-03-08

### Fixed
- Fixed the sidebar issue with no pixel data
- Fixed incorrect index while scrolling via arrow buttons

### Added
- Added localization support (Thanks to @Lars1963 and @doc-sebastian)
- Jump to selected image when it is opened with all images

### Changed
- Open the selected DICOM file with all images by default
- Support for opening only the selected DICOM file using the "Open with DICOM Viewer" file action menu


## [1.1.0] - 2018-12-27

### Fixed
- Fixed compatibility issues with Nextcloud 15 and older
- Fixed url string and navigation with browser back button

### Added
- Added series panel scrollbar
- Added viewport scrollbar up/down buttons
- Added a toolbar button used to collapse/expand toolbar in small screens
- Added annotate and magnify tools
- Support for additional DICOM extensions (Thanks to @doc-sebastian)

### Changed
- Update cornerstone modules
- Refactor templates with compiled handlebars


## [1.0.2] - 2018-08-30

### Fixed
- Fixed displaying single DICOM images


## [1.0.1] - 2018-08-30

### Fixed
- Fixed displaying DICOM images without extension in folders
- Hide footer when DICOM Viewer is opened in public shares


## [1.0.0] - 2018-08-22

### Added
- Added support for opening DICOM images grouped by study and series in a folder
- Added "Open with DICOM Viewer" in file actions menu
- Added series panel
- Added stack scroll tool
- Added scrollbar
- Added image thumbnail into the sidebar


## [0.0.6] - 2018-04-08

### Fixed
- Fix the conflicting style issue by using modal dialog style under viewer element


## [0.0.5] - 2018-04-03

### Fixed
- Fix the URL generation for the file icon and codec files


## [0.0.4] - 2018-04-01

### Added
- Support for instances running in subfolder

### Fixed
- Fix the issue with Capture Dialog
- Fix the screenshot issue on appstore
- Show orientation markers when images are displayed


## [0.0.3] - 2018-03-28
### Added
- Added Download/Capture Tool

### Fixed
- Fixed performance issue caused by mime type registration


## [0.0.2] - 2018-02-09

### Added
- Added touch support for viewer
- Added orientation markers
- Added new tools:  Rotate Left/Right, Flip Horizontal/Vertical and ROI W/L
- Added webpack for Javascript building
- Added ESLint

### Changed
- Used cornerstonejs library from NPM
- Updated the code structure to make it modular


## [0.0.1] - 2018-01-30
### Added
- Initial release for Nextcloud 12 & 13
