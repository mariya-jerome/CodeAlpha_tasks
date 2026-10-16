// Get HTML Elements
const galleryItems = Array.from(
    document.querySelectorAll(".gallery-item")
);

const filterButtons = document.querySelectorAll(".filter-btn");

const gallery = document.getElementById("gallery");

const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightboxImage");
const lightboxTitle = document.getElementById("lightboxTitle");
const imageCounter = document.getElementById("imageCounter");

const closeBtn = document.getElementById("closeBtn");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

let visibleImages = [];
let currentIndex = 0;
let lastClickedItem = null;


// Get Currently Visible Images
function updateVisibleImages() {
    visibleImages = galleryItems.filter(item => {
        return !item.classList.contains("hide");
    });
}


// Filter Categories and Scroll to Gallery
filterButtons.forEach(button => {

    button.addEventListener("click", function () {

        const selectedCategory = this.dataset.filter;

        // Update active button
        filterButtons.forEach(btn => {
            btn.classList.remove("active");
            btn.setAttribute("aria-pressed", "false");
        });

        this.classList.add("active");
        this.setAttribute("aria-pressed", "true");

        // Close lightbox if open
        closeLightbox();

        // Filter the images
        galleryItems.forEach((item, index) => {

            const itemCategory = item.dataset.category;

            const shouldDisplay =
                selectedCategory === "all" ||
                itemCategory === selectedCategory;

            if (shouldDisplay) {

                item.classList.remove("hide");

                // Restart animation
                item.style.animation = "none";

                // Force browser to restart the animation
                void item.offsetWidth;

                item.style.animation =
                    `fadeIn 0.5s ease ${index * 0.06}s both`;

            } else {

                item.classList.add("hide");
                item.style.animation = "";

            }

        });

        // Update lightbox image list
        updateVisibleImages();

        // Smoothly scroll to the filtered image grid
        gallery.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    });

});


// Open Lightbox
galleryItems.forEach(item => {

    item.addEventListener("click", function () {

        // Ignore hidden images
        if (this.classList.contains("hide")) {
            return;
        }

        updateVisibleImages();

        currentIndex = visibleImages.indexOf(this);
        lastClickedItem = this;

        showImage(currentIndex);

        lightbox.classList.add("show");
        lightbox.setAttribute("aria-hidden", "false");

        document.body.style.overflow = "hidden";

        closeBtn.focus();

    });

    item.addEventListener("keydown", function (event) {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            this.click();
        }
    });

});


// Display Image in Lightbox
function showImage(index) {

    if (visibleImages.length === 0) {
        return;
    }

    // Wrap around when reaching the beginning or end
    if (index < 0) {
        currentIndex = visibleImages.length - 1;
    } else if (index >= visibleImages.length) {
        currentIndex = 0;
    } else {
        currentIndex = index;
    }

    const selectedItem = visibleImages[currentIndex];

    const image = selectedItem.querySelector("img");
    const title = selectedItem.querySelector("h3");

    lightboxImage.src = image.src;
    lightboxImage.alt = image.alt;

    lightboxTitle.textContent = title.textContent;

    imageCounter.textContent =
        `Image ${currentIndex + 1} of ${visibleImages.length}`;

}


// Next Image
nextBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    showImage(currentIndex + 1);

});


// Previous Image
prevBtn.addEventListener("click", function (event) {

    event.stopPropagation();

    showImage(currentIndex - 1);

});


// Close Lightbox
function closeLightbox(restoreFocus = false) {

    lightbox.classList.remove("show");
    lightbox.setAttribute("aria-hidden", "true");

    document.body.style.overflow = "";

    lightboxImage.removeAttribute("src");

    if (restoreFocus && lastClickedItem && !lastClickedItem.classList.contains("hide")) {
        lastClickedItem.focus();
    }

}


// Close Button
closeBtn.addEventListener("click", function () {

    closeLightbox(true);

});


// Close When Clicking Outside the Image
lightbox.addEventListener("click", function (event) {

    if (event.target === lightbox) {
        closeLightbox(true);
    }

});


// Keyboard Controls
document.addEventListener("keydown", function (event) {

    if (!lightbox.classList.contains("show")) {
        return;
    }

    if (event.key === "Escape") {
        closeLightbox(true);
    } else if (event.key === "ArrowRight") {
        showImage(currentIndex + 1);
    } else if (event.key === "ArrowLeft") {
        showImage(currentIndex - 1);
    } else if (event.key === "Tab") {
        const focusableElements = lightbox.querySelectorAll("button:not([disabled])");
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
        }
    }

});


// Initial Setup
updateVisibleImages();