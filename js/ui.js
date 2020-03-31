const lists = document.querySelector('.lists');

document.addEventListener('DOMContentLoaded', function() {
    // nav menu
    const menus = document.querySelectorAll('.side-menu');
    M.Sidenav.init(menus, {edge: 'right'});

    // Add list form
    const forms = document.querySelectorAll('.side-form');
    M.Sidenav.init(forms, {edge: 'left'});
});

// render lists data
const renderList = (data, id) => {

    let renderedItems = [];
    data.items.forEach(item => {
        renderedItems.push(renderItem(item));
    });

    const html = `
        <div class="card-panel list white row" data-id="${id}">
            <img src="img/dish.png" alt="list thumb">
            <div class="list-details">
                <div class="list-title">${data.title}</div>
                <div class="list-items">
                    ${renderedItems.join('')}
                </div>
            </div>
            <div class="list-delete">
                <i class="material-icons">delete_outline</i>
            </div>
        </div>
    `;

    lists.innerHTML += html;
};

const renderItem = (item) => {
    let checkedString = '';
    if (item.checked) {
        checkedString = 'checked';
    }

    return `
        <div class="item" data-id="${item.id}">
            <label>
                <input type="checkbox" name="complete" ${checkedString}>
                <span>${item.name}</span>
            </label>
            <div class="item-delete">
                <i class="material-icons">delete_outline</i>
            </div>
        </div>
    `;
};


// Remove list from DOM
const removeList = (id) => {
    const list = document.querySelector(`.list[data-id=${id}]`);
    list.remove();
};
