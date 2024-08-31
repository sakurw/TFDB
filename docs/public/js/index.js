import { sidebarjs } from "../sidebar/sidebar.js";
document.addEventListener('DOMContentLoaded', function () {
    function loadSidebar() {
        fetch('../sidebar/sidebar.html')
            .then(response => response.text())
            .then(data => {
                document.getElementById('sidebar_contena').innerHTML = data;
                sidebarjs();
            })
            .catch(error => console.error(error));
    }
    loadSidebar();
});