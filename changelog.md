# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [2.3.1] - 2025-03-26

### Fixed
- Compatibility for Nextcloud 31 (#142)

## [2.3.0] - 2024-12-29

### Added
- Upgrade Acan.io to 1.1.1 with new features and improvements
- Add metadata for multi-frame images (#135)

### Fixed
- Show investigational use dialog once 90 days (Acan.io)
- Fix mimetype for wasm files (#135)
- Encode url path segments (#136)
- Skip DICOM files without required uids (#136)
- Fix benchmarks public path in viewer (#137)

## [2.2.1] - 2024-10-21

### Added
- Hide capture tool in viewer when download is hidden in public share link (#133)

## [2.2.0] - 2024-10-17

### Added
- Support server-side encryption (#128)
- Support for Nextcloud 30 (#127)

## [2.1.2] - 2024-05-25

### Added
- Support for Nextcloud 29

### Fixed
- Fix encoding issues with DICOM parser (#110, #111)

## [2.1.1] - 2024-03-27

### Fixed
- Fix the app path in viewer template (#106)

## [2.1.0] - 2024-03-26

### Added
- Upgrade Acan.io to 1.0.0-beta.1, removing access to third-party urls for privacy reasons (#104)
- Add "Open with DICOM Viewer" option at folder level (#103)
- Support loading extensionless DICOM files when a folder is opened with "Open with DICOM Viewer" option (#103)

### Fixed
- Use IAppManager to determine dicomviewer app path in filesystem (#103)
- Fix the issue with opening DICOM files in 2 or more level directories (#103)

## [2.0.0] - 2024-03-18

### Added
- Support for Nextcloud 28
- Integrate Acan.io, 1.0.0-beta.0, which is a zero-footprint medical image viewer, built on top of OHIF Viewer v3 provided by the Open Health Imaging Foundation (OHIF). It is capable of loading DICOM images directly from Nextcloud, requiring no additional installation. It facilitates rendering sets in 2D, 3D, and reconstructed representations. It also enables the manipulation, annotation, and serialization of observations for medical images, and supports internationalization, hotkeys, and numerous other features.

## [1.2.5] - 2023-10-19

### Added
- Support for Nextcloud 27 (#98)

## [1.2.4] - 2022-11-13

### Added
- Support for Nextcloud 25 (#88)

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
