## Bookmarks Organizer Google Chrome Extension
v2.0.5

Bookmarks Organizer helps in keeping the bookmarks sorted. It monitors for newly added or moved bookmarks and auto arranges them  in ascending order by title. There is a reorder button to manually order the whole bookmark, which can be used initially after installation.

#### Limitations

1. There are max write limits set by the browser so that the sync servers are not abused. So only a certain number of move operations can be performed per session in a given interval of time.

2. Also when you launch the browser, if bookmarks syncing is enabled, then the extension will use resources depending on the number of bookmarks changed. If this is making your system slow, you can disable the extension and re-enable it once the sync is completed.

#### Install

[<img src='https://developer.chrome.com/webstore/images/ChromeWebStore_BadgeWBorder_v2_206x58.png'>](https://chrome.google.com/webstore/detail/bookmarks-organizer/cjdenbocfdbjohomdaojaokiffjbnaca)

#### Change Logs

##### Version 2.0.4

* Memory optimization: removed script loading via xhr and eval which reduces the bookmark object to just one.
* Removed content security policy which reverts it to default.
* Added offline flag.

##### Version 2.0.3

* Made improvements to the sorting algorithm, so that when a node is added, it sorts the whole list to which the node is added, but only updates the node and the ones after it. This reduces the number of move API calls, leaving room for more operation before the max write limit is reached.
