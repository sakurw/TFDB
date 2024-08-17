import { sidebarjs } from "../sidebar/sidebar.js";

document.addEventListener('DOMContentLoaded', function () {
    function loadSidebar() {
        fetch('../sidebar/sidebar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('sidebar_contena').innerHTML = data;
                sidebarjs();
            })
    }
    loadSidebar();
});
document.querySelectorAll(".group-button").forEach(
    button => {
        button.addEventListener("click", function () {
            const forFlex = this.nextElementSibling;
            const GroupContent = forFlex.querySelector(".group-content");

            this.classList.toggle("active");
            GroupContent.style.display = this.classList.contains("active") ? "block" : "none";
        })
    }
);