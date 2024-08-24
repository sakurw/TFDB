function sidebarjs() {
    const buttons = document.querySelectorAll("button")
    const sidebar = document.getElementById("sidebar")
    const closesidebar = document.getElementById("CloseSidebar");
    const main = document.getElementById("main");

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            const click_button_id = button.getAttribute('id');
            switch (click_button_id) {
                case "CloseSidebar":
                    sidebar.classList.remove('width-wide');
                    sidebar.offsetHeight;
                    sidebar.classList.add('width-narrow');

                    main.classList.add("main-with-sidebar-narrow")
                    main.classList.remove("main-with-sidebar-wide")
                    break;
                case "OpenSidebar":
                    sidebar.classList.remove('width-narrow');
                    sidebar.offsetHeight;
                    sidebar.classList.add('width-wide');
                    closesidebar.style.visibility = 'hidden';
                    sidebar.addEventListener('transitionend', function handleTransitionEnd(event) {
                        if (event.propertyName === 'width') {
                            closesidebar.style.visibility = 'visible';
                            sidebar.removeEventListener('transitionend', handleTransitionEnd);
                        }
                    });

                    main.classList.add("main-with-sidebar-wide")
                    main.classList.remove("main-with-sidebar-narrow")
                    break;
            }
        });
    });
}

export { sidebarjs };