// Offline data
db.enablePersistence()
    .catch(err => {
        if(err.code == 'failed-precondition'){
            // probably multiple tabs open at once
            console.log('persistence failed');
        } else if(err.code == 'unimplemented'){
            // lack of browser support
            console.log('persistence is not available');
        }
    });

// Real-time listener
db.collection('lists').onSnapshot((snapshot) => {
    console.log(snapshot.docChanges());
    snapshot.docChanges().forEach(change => {
      console.log(change, change.doc.data(), change.doc.id);

      switch (change.type) {
          case 'added':
              renderList(change.doc.data(), change.doc.id);
              break;
          case 'modified':
              // Not used
              break;
          case 'removed':
              removeList(change.doc.id);
              break;
      }
    });
});

// Add new list
const form = document.querySelector('form');
form.addEventListener('submit', event => {
    console.log('form submitted');
    event.preventDefault();

    // Gather the items
    let items = [];
    let id = 0;
    document.querySelectorAll('form [name="item[]"]').forEach(itemElement => {
        let item = {
            'id': id,
            'name': itemElement.value,
            'checked': false
        };

        items.push(item);
        id++;
    });

    const list = {
      title: form.title.value,
      items: items
    };

    // Save the new list
    db.collection('lists').add(list)
        .catch(err => { console.log(err)});

    // Reset the list form
    form.title.value = '';
    document.querySelectorAll('form [name="item[]"]').forEach(itemElement => {
        itemElement.remove()
    });
});

// Add new item
const addItemButton = form.querySelector('button.add-item');
addItemButton.addEventListener('click', event => {
    console.log('add item button clicked');
    // Add new field to the list form
    let input = document.createElement('div');
    input.className = 'input-field';
    input.innerHTML = `<input placeholder="e.g. Milk" name="item[]" type="text" class="validate">`;

    const items = document.querySelector('form .items');
    items.appendChild(input)
});

const listContainer = document.querySelector('.lists');
listContainer.addEventListener('click', event => {
    if (event.target.parentNode.className === 'list-delete') {
        // Delete a list
        const list = event.target.closest('.list');
        db.collection('lists').doc(list.getAttribute('data-id')).delete();
    } else
    if (event.target.name === 'complete') {
        // Item checkbox was clicked
        let checkbox = event.target;
        let item = event.target.closest('.item');
        let list = event.target.closest('.list');

        db.collection('lists').doc(list.getAttribute('data-id')).get().then(dataObject => {
            let data = dataObject.data();
            console.log(data)

            for (let i = 0; i < data['items'].length; ++i) {
                if (data['items'][i].id === parseInt(item.getAttribute('data-id'))) {
                    // If the checkbox was checked, we persist it checked. If it wasn't, we persist it unchecked
                    data['items'][i].checked = checkbox.checked;
                    break;
                }
            }

            db.collection('lists').doc(list.getAttribute('data-id')).set(data)
        })
    } else
    if (event.target.parentNode.className === 'item-delete') {
        // Delete an item
        let item = event.target.closest('.item');
        let list = event.target.closest('.list');

        db.collection('lists').doc(list.getAttribute('data-id')).get().then(dataObject => {
            let data = dataObject.data();
            for (let i = 0; i < data['items'].length; ++i) {
                if (data['items'][i].id === parseInt(item.getAttribute('data-id'))) {
                    data['items'].splice(i, 1);
                    item.remove();
                    break;
                }
            }

            db.collection('lists').doc(list.getAttribute('data-id')).set(data)
        })
    }
});
