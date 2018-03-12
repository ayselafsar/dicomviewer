# DICOM Viewer

It is a DICOM viewer which uses [cornerstonejs](https://github.com/cornerstonejs) library to display DICOM files on Nextcloud.

For more information, see the blog post [Nextcloud in Digital Imaging](https://nextcloud.com/blog/digital-imaging-for-medicine-in-nextcloud/)

<table>
    <tr>
        <td>
            <img alt="Viewer 1" src="https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer1.png" />
        </td>
        <td>
            <img alt="Viewer 2" src="https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer2.png" />
        </td>
    </tr>
    
    <tr>
        <td>
            <img alt="Viewer 3" src="https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer3.png" />
        </td>
        <td>
            <img alt="Viewer 4" src="https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/viewer4.png" />
        </td>
    </tr>
        
    <tr>
        <td>
            <img alt="Dump 1" src="https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/dump1.png" />
        </td>
        <td>
            <img alt="Dump 2" src="https://github.com/ayselafsar/dicomviewer/blob/master/screenshots/dump2.png" />
        </td>
    </tr>
</table>


### Features

* **Viewer:** A DICOM viewer with basic imaging tools
* **DICOM Dump:** A list of DICOM attributes displayed on the sidebar


### Installation

On your Nextcloud, simply navigate to Apps > Multimedia > DICOM Viewer, and enable it.


### Build

Firstly, install NodeJS for JavaScript dependencies, then follow these steps:
1. Run `make && make source` command to build source code
2. Copy `build/artifacts/source/dicomviewer` into `path-to-nextcloud/apps`
3. Enable the DICOM Viewer app


### Roadmap

- Multiframe Support
- DICOM Worklist
