## Overview of the modules
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
