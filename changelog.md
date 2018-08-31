# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).


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
