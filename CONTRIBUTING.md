# Contributing
First off, thanks for taking the time to contribute! You are awesome.

The following is a set of guidelines for contributing to 9anime Companion

### Table of Contents
* [Goal](#goal)
* [How Can I Contribute?](#how-can-i-contribute)
  * [Reporting bugs](#reporting-bugs)
  * [Suggesting enhancements/features](#suggesting-enhancementsfeatures)
  * [Pull Requests](#pull-requests)
* [Styleguides](#styleguides)
* [Overview of modules](#overview-of-modules)
  * [download_all.ts](#download_allts)

## Goal
9anime Companion aims to give users meaningful features which are not implemented by 9anime.

## How Can I Contribute?
### Reporting bugs
Before reporting a bug, please do a quick search in the [Issue Tracker](https://github.com/lap00zza/9anime-Companion/issues). If there are no duplicates then file a new issue. Be sure to include a proper description and steps to reproduce the issue.

### Suggesting enhancements/features
Before suggesting an enhancement/feature, please do a quick search in the [Issue Tracker](https://github.com/lap00zza/9anime-Companion/issues). If there are no duplicates then file a new issue and prefix `Enhancement:` or `Suggestion:` on the title. Be sure to include a proper description as well.

### Pull Requests
* Do not include issue numbers in the PR title.
* Be sure to document your code. Without proper documentation your PR won't be accepted.
* Describe what your code does in the PR. A proper description is a must.
* End all files with a newline

## Styleguides
* Git Commit Messages: [Angular JS Commit Guide](https://github.com/angular/angular.js/blob/master/CONTRIBUTING.md#commit)
* Documentation: [JSDoc](http://usejsdoc.org/)
* Typescript: [Microsoft Typescript Styleguide](https://github.com/Microsoft/TypeScript/wiki/Coding-guidelines)

## Overview of modules
### download_all.ts
This module is responsible for the Download All functionality.
Here is a brief overview of how it works:

1. setup function is called to set the `animeName` and the `ts`<sup>[[1]](#myfootnote1)</sup> values.
2. The episode select modal is then attached to the DOM.
3. The `Download All` (or dlAll) buttons are attached to the DOM.
dlAll buttons have a dataset called type which identifies which
server they are supposed to download from. Server types are
RapidVideo and Default.
4. When the Download All button is clicked, the following happens
    1. `currentServer` is set to the type on the button.
    2. All the episodes for that server (on the 9anime page) are added
       to an array called `episodes`.
    3. `episodes` is then used to populate the episode select modal.
    4. The user can then then chose which episode they want to download,
       along with a few other options like quality, downloader etc on
       the modal and click on the Download button.
    5. Selected episodes are added to another array, and the `downloader()`
       method is invoked which takes care of the rest :smile:

#### Design choices:
1. Downloads can be queued only from 1 server. What this means is, if
you are downloading from F2, you cant queue more episodes from F4 or
RapidVideo until the current queue is over.

<hr>
<a name="myfootnote1">[1]</a> ts is a arbitrary value that 9anime adds for each anime. This value is
needed when sending requests to the 9anime API.
