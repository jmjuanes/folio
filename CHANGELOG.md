# v0.21.0 (August 25, 2024) Duplicate Pages and some Bug Fixes

> We have introduced the ability to duplicate entire pages, making it easier to create variations of your work. We have also fixed bugs related to curved arrows, ensuring accurate selection area calculations and preventing cropping when exporting to images.

## Duplicating Pages

We have added a highly requested feature: you can now duplicate entire pages within your whiteboard. This makes it easier than ever to create variations of your designs or work on multiple versions of your ideas without starting from scratch.

## Fixed Selection Area Calculation for Curved Arrows

We have resolved an issue where the total selection area was incorrectly calculated when it included a curved arrow. Now, the selection area will be accurately reflected for all elements.

## Fixed Image Export for Curved Arrows

We have also fixed a bug that caused curved arrows to be cropped when exporting the whiteboard to an image. Your exported images will now correctly include the full shape of curved arrows.


# v0.20.0 (July 11, 2024) New Layers Panel and Object Dimensions

> The latest update to Folio introduces a new Layers Panel, allowing users to manage elements with ease. Additionally, users can enable displaying dimensions for shapes, text, and selections for precise designs. 

## New Layers Panel

Introducing the Layers Panel, a powerful new feature that enhances your workflow by displaying all elements added to the board. This panel allows you to easily manage your elements, including changing the name, duplicating an element, or removing an element.

## Displaying Object Dimensions

We have added the ability to view object dimensions for shapes, text, and for a selection. This new feature helps you achieve precise designs by displaying the width and height of selected objects directly on the board.

Displaying dimensions can be enabled from *Menu* -> *Object dimensions*.

## Full changelog

- We have added a new layers panel, allowing users to see all the elements added to the board. [#87](https://github.com/jmjuanes/folio/pull/87).
- Now users can display the dimensions of shapes, text, and selections. [#88](https://github.com/jmjuanes/folio/pull/88).
- We allow to set and change the name of elements from the new layers panel. [#89](https://github.com/jmjuanes/folio/pull/89).
- We have fixed a bug that crashes Folio when the user clears the board with some elements selected. [#90](https://github.com/jmjuanes/folio/pull/90).
- Now when you keep a single element inside a group (for example when you remove the other elements), we remove also the group. [#91](https://github.com/jmjuanes/folio/pull/91).


# v0.19.0 (Jun 17, 2024) New URL and Stickers tool

> Folio has a new home at folio.josemi.xyz! In this update, we have introduced a new Stickers tool, and restored the board title in the header for improved project management.

## We have moved folio App to folio.josemi.xyz

We are excited to announce that Folio has a new home! The application has been migrated from *josemi.xyz/folio* to a dedicated subdomain: [folio.josemi.xyz](https://folio.josemi.xyz). This change is aimed at providing a better and more seamless user experience. Follow the next instructions to migrate your whiteboard:

**1. Visit the Legacy Version**: access the previous version of Folio at [josemi.xyz/folio-legacy](https://www.josemi.xyz/folio-legacy).

**2. Export Your Whiteboards**: go to *Menu* -> *Save As...* to download your whiteboard as a *.folio* file. Save this file to a safe location on your device.

**3. Import to the New Folio**: go to the new Folio application at [folio.josemi.xyz](https://folio.josemi.xyz) and go to *Menu* -> *Open...* to upload the *.folio* file you exported from the legacy version. Your whiteboard will be restored and ready for you to continue working on them.

## New Stickers Tool

We have introduced a fun and creative way to enhance your whiteboards! The new Stickers tool allows you to insert a variety of custom stickers into your boards. We have created our own unique set of stickers, and in future releases, we will be adding even more stickers to provide you with a broader range of options to express your ideas.

## Restored Board Title in Header

We have restored the board title in the header. Now you can easily see and manage the title of your current board, making it simpler to keep track of your projects.


# v0.18.0 (Apr 12, 2024) Rendering links as bookmarks

> We are thrilled to announce the release of version v0.18.0, packed with a new exciting way to render links as bookmarks cards and some bug fixes.

## Introducing Bookmarked Links

In this update, we have added the ability to **render links as bookmarks styled like cards**, instead of plain text. Now, when you add a link to your canvas, it will be displayed as a visually appealing bookmark card, making it easier to identify and access important resources.

## Bug Fixes and Improvements

We have included various bug fixes when saving the version of the secene in the local storageo of your browser.


# v0.17.0 (Mar 25, 2024) Grouping Elements

> On this release we have restored the Group Elements feature and fixed some bugs.

## Restored Group Elements Feature

In this update, we have restored the Group Elements feature to its full functionality. Now you can easily group together multiple elements on your canvas for streamlined organization and editing.

## Bug Fixes

We have also included various bug fixes and performance improvements to ensure a smoother and more reliable drawing experience overall.


# v0.16.0 (Mar 6, 2024) Snap to Elements and Laser Pointer tool

> We are thrilled to announce the release of version v0.16.0, packed with exciting new features and improvements to enhance your drawing experience.

## Introducing Snap to Elements

In this update, we have added the Snap to Elements feature, allowing you to align your drawings with precision. Say goodbye to crooked lines and uneven shapes – now your elements will snap into place effortlessly, ensuring a polished and professional look.

## Laser Pointer tool is back!

We are excited to announce that the Laser Pointer Tool has been enabled again. Use it to highlight specific details or guide your audience during presentations and demos.


# v0.15.0 (Mar 3, 2024) Enabling page reordering

In this update, we have added the ability to reorder pages within your projects. Now you can arrange your pages in the order that best suits your workflow, allowing for greater flexibility and organization. Simply drag and drop pages to reorder them, making it easy to customize the structure of your projects on the fly.


# v0.14.0 (Feb 11, 2024) Introducing Pages

We are excited to introduce the Pages feature to our editor. Now you can organize your drawings into multiple pages, allowing for structured layouts and improved organization.

With Pages, you have the flexibility to create storyboards, presentations, or any other multi-page project with ease, unlocking new possibilities for your creative process.
