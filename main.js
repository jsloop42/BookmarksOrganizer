document.addEventListener('DOMContentLoaded', function () {
    console.log("hi");
    var sortBtn = document.querySelector('.sortBtn');
    console.log(sortBtn);
    sortBtn.addEventListener('click', function (e) {
        console.log("button selected");
    })
});
