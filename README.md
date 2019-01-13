![Downloads](https://img.shields.io/github/downloads/ayselafsar/dicomviewer/total.svg?style=flat-square)
[![Support][support-image]][support-url]

# DICOM Viewer

It is a DICOM viewer which uses [cornerstonejs](https://github.com/cornerstonejs) library to display DICOM files in Nextcloud.

For more information, see the blog post [Nextcloud in Digital Imaging](https://nextcloud.com/blog/digital-imaging-for-medicine-in-nextcloud/)


<kbd>![Viewer 1](https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer1.png)  </kbd>
<kbd>![Viewer 2](https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer2.png)  </kbd>
<kbd>![Viewer 3](https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer3.png)  </kbd>
<kbd>![Viewer 4](https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer4.png)  </kbd>
<kbd>![Dump 1](https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/dump1.png)  </kbd>
<kbd>![Dump 2](https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/dump2.png)  </kbd>


### Features

* **Viewer:** A DICOM viewer which displays images grouped by study and series in selected folders and allows to manipulate images with imaging tools.
* **DICOM Dump:** A list of DICOM attributes displayed on the sidebar with image thumbnail. 
* **Translation:** DICOM Viewer now has the ability to use localized languages. Translators are encouraged to commit.


### Installation
On your Nextcloud, simply navigate to Apps > Multimedia > DICOM Viewer, and enable it.


### Build

Firstly, install NodeJS for JavaScript dependencies, then follow these steps:
1. Clone this repository
2. Change into the directory you have cloned this repository into
3. Run `make && make source` command to build source code
4. Copy `build/artifacts/source/dicomviewer` into `path-to-nextcloud/apps`
5. Enable the DICOM Viewer app


### Roadmap

- Multiframe Support
- DICOM Worklist


[support-image]: https://img.shields.io/badge/Support-Patreon-blue.svg
[support-url]: https://www.patreon.com/ayselafsar
