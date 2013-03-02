document.addEventListener('DOMContentLoaded', function () {
    var sortBtn = document.querySelector('.sortBtn');
    sortBtn.addEventListener('click', function (e) {
        console.log("button selected");
        var bo, bbId;
        bo = new BookmarksOrganizer();
        bbId = bo.getBookmarksBarId();
        bo.getAllBookmarks(function (bnodes) {
            console.log(bnodes);
        });
        bo. getBookmarksBarNode(function (bnodes) {
            console.log(bnodes);
        });
        bo. getOtherBookmarksNode(function (bnodes) {
            console.log(bnodes);
        });
    });
});


