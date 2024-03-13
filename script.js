document.addEventListener("DOMContentLoaded", function() {
    var boxes = document.querySelectorAll('.select-box');

    boxes.forEach(function(box) {
        box.addEventListener('click', function() {
            // Remove highlighting from all boxes
            boxes.forEach(b => b.classList.remove('highlighted'));

            // Add highlighting to the clicked box
            box.classList.add('highlighted');
        });
    });
});
