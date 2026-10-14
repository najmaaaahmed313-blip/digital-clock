const STORAGE_KEY = 'interactive-shopping-list';

let shoppingList = loadShoppingList();

const form = document.querySelector('#shopping-form');
const productInput = document.querySelector('#product');
const priceInput = document.querySelector('#price');
const container = document.querySelector('.container');
const btnSection = document.querySelector('.btn-sections');
const clearButton = document.querySelector('.clear-list');
const totalCostElement = document.querySelector('#total-cost');

function loadShoppingList() {
  try {
    const savedList = window.localStorage.getItem(STORAGE_KEY);
    const parsedList = savedList ? JSON.parse(savedList) : [];
    return Array.isArray(parsedList) ? parsedList : [];
  } catch {
    return [];
  }
}

function saveShoppingList() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(shoppingList));
  } catch {
    // The list remains usable when browser storage is unavailable.
  }
}

function updateClearButton() {
  btnSection.classList.toggle('hidden', shoppingList.length === 0);
}

function updateTotal() {
  const total = shoppingList.reduce((sum, item) => sum + Number(item.price || 0), 0);
  totalCostElement.textContent = `Ksh ${total.toFixed(2)}`;
}

function createButton(label, className, action) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = className;
  button.dataset.action = action;
  button.textContent = label;
  return button;
}

function displayItems() {
  container.replaceChildren();

  shoppingList.forEach((item, index) => {
    const card = document.createElement('article');
    card.className = 'item';

    const name = document.createElement('h3');
    name.className = item.purchased ? 'purchased' : '';
    name.textContent = item.name;

    const price = document.createElement('p');
    price.textContent = `Ksh ${Number(item.price).toFixed(2)}`;

    const check = document.createElement('div');
    check.className = 'check';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = Boolean(item.purchased);
    checkbox.dataset.action = 'toggle';
    checkbox.dataset.index = index;
    const label = document.createElement('label');
    label.textContent = 'Purchased';
    check.append(checkbox, label);

    const actions = document.createElement('div');
    actions.className = 'actions';
    actions.append(
      createButton('Edit', 'edit-item', 'edit'),
      createButton('Delete', 'delete-item', 'delete'),
    );

    card.append(name, price, check, actions);
    container.append(card);
  });

  updateClearButton();
  updateTotal();
}

function showEditForm(index) {
  const item = shoppingList[index];
  const card = container.children[index];
  if (!item || !card) return;

  const editForm = document.createElement('form');
  editForm.className = 'edit-form';
  editForm.dataset.index = index;

  const nameInput = document.createElement('input');
  nameInput.name = 'name';
  nameInput.value = item.name;
  nameInput.required = true;
  nameInput.setAttribute('aria-label', 'Item name');

  const priceInput = document.createElement('input');
  priceInput.name = 'price';
  priceInput.type = 'number';
  priceInput.min = '0';
  priceInput.step = '0.01';
  priceInput.value = item.price;
  priceInput.required = true;
  priceInput.setAttribute('aria-label', 'Price');

  const actions = document.createElement('div');
  actions.className = 'inline-actions';
  const saveButton = document.createElement('button');
  saveButton.type = 'submit';
  saveButton.className = 'save-edit';
  saveButton.textContent = 'Save';
  actions.append(saveButton, createButton('Cancel', 'cancel-edit', 'cancel'));

  editForm.append(nameInput, priceInput, actions);
  card.replaceChildren(editForm);
  nameInput.focus();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!form.reportValidity()) return;

  shoppingList.push({
    name: productInput.value.trim(),
    price: Number(priceInput.value),
    purchased: false,
  });

  saveShoppingList();
  form.reset();
  productInput.focus();
  displayItems();
});

clearButton.addEventListener('click', () => {
  shoppingList = [];
  saveShoppingList();
  displayItems();
});

container.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-action]');
  if (!button) return;

  const card = button.closest('.item');
  const index = Array.prototype.indexOf.call(container.children, card);

  if (button.dataset.action === 'edit') {
    showEditForm(index);
  } else if (button.dataset.action === 'cancel') {
    displayItems();
  } else if (button.dataset.action === 'delete') {
    shoppingList.splice(index, 1);
    saveShoppingList();
    displayItems();
  }
});

container.addEventListener('change', (event) => {
  const checkbox = event.target;
  if (!checkbox.matches('input[data-action="toggle"]')) return;

  shoppingList[Number(checkbox.dataset.index)].purchased = checkbox.checked;
  saveShoppingList();
  displayItems();
});

container.addEventListener('submit', (event) => {
  const editForm = event.target.closest('.edit-form');
  if (!editForm) return;
  event.preventDefault();
  if (!editForm.reportValidity()) return;

  const index = Number(editForm.dataset.index);
  shoppingList[index] = {
    ...shoppingList[index],
    name: editForm.elements.name.value.trim(),
    price: Number(editForm.elements.price.value),
  };

  saveShoppingList();
  displayItems();
});

displayItems();
