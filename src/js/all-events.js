import { firstUpperLetter, emptyInputValues } from './helper.js';

const eventsContainer = document.querySelector('.allevents-container');

const addEventBtn = document.querySelector('.add-event-btn');
const btnCloseModal = document.querySelector('.btn--close-modal');
const overlay = document.querySelector('.overlay');
const formWindow = document.querySelector('.form-window');
const addEventForm = document.querySelector('.upload');
const uploadBtn = document.querySelector('.upload__btn');

const inputTitle = document.querySelector('.title');
const inputImgURL = document.querySelector('.imgURL');
const inputDesc = document.querySelector('.description');
const inputDates = document.querySelector('.dates');

const editBtn = document.querySelector('.edit__btn');

const filterContainer = document.querySelector('.filter-container');
const searchInput = document.querySelector('#search');
const searchBtn = document.querySelector('.fa-search');

const btnFind = document.querySelector('.btn-find');
const dateFromInput = document.querySelector('.date-from');
const dateToInput = document.querySelector('.date-to');

/**
 * A function that given an event object will return the html with the event data
 * @param {object} event
 * @returns A string of an event's html
 */
export const generateEventsMarkup = async function (event, getImgFunc) {
  if (!event) return;
  const imgURL = await getImgFunc(event.id);
  const [...dates] = event.dates;
  const eventsNearDate = dates.join('').slice(0, 10).replaceAll('-', '/');
  const localeDate = new Date(eventsNearDate).toLocaleDateString();
  return `
    <div class="single-event-container">
      <img class="events-img" src="${imgURL}" alt="${event.title}" data-id=${event.id}>
      <h2 class="event-title">${event.title}<span style="visibility: hidden">${event.id}</span></h2>
      <p class="event-desc">${event.description}</p>
      <p class="event-dates">${localeDate}</p>
      <button class="btn-icon edit-icon"><i class="far fa-edit"></i></button>
      <button class="btn-icon trash-icon"><i class="fas fa-trash-alt"></i></button>
    </div>`;
};

/**
 * A function that renders the event
 * @param {string} markup
 */
export const render = function (markup) {
  if (!eventsContainer || !markup) return;
  eventsContainer.insertAdjacentHTML('beforeend', markup);
};

/**
 * A function that generates the html buttons for every type of event of the events data
 * @param {array} events
 * @returns A string of html buttons
 */
export const generateFilterMarkup = function (events) {
  if (!events) return;
  let buttons = '<button class="btn-filter btn-all-events">All events</button>';
  const uniqueEventTypes = [...new Set(events.map(event => event.type))];
  uniqueEventTypes.forEach(eventType => {
    buttons += `
    <button class="btn-filter btn-${eventType}">${firstUpperLetter(
      eventType
    )}</button>
    `;
  });
  return buttons;
};

/**
 * A function that renders all the buttons that will be used to filter the events by its type
 * @param {string} markup
 */
export const renderFilterButtons = function (markup) {
  if (!filterContainer || !markup) return;
  filterContainer.insertAdjacentHTML('afterbegin', markup);
};

/**
 * A function to handle all the filter buttons, which given all the events, will render only those of the filter type
 * @param {array} events
 */
export const filterHandler = async function (events, getImgFunc) {
  if (!filterContainer || !eventsContainer) return;
  filterContainer.addEventListener('click', e => {
    const btn = e.target.closest('.btn-filter');
    if (!btn) return;
    if (btn.classList.contains('btn-all-events')) {
      eventsContainer.innerHTML = '';
      events.forEach(async event => {
        const markup = await generateEventsMarkup(event, getImgFunc);
        render(markup);
      });
    } else if (btn.classList.contains('btn-dance')) {
      eventsContainer.innerHTML = '';
      const danceEvents = filterEventsByType(events, 'dance');
      danceEvents.forEach(async event => {
        const markup = await generateEventsMarkup(event, getImgFunc);
        render(markup);
      });
    } else if (btn.classList.contains('btn-concert')) {
      eventsContainer.innerHTML = '';
      const concertEvents = filterEventsByType(events, 'concert');
      concertEvents.forEach(async event => {
        const markup = await generateEventsMarkup(event, getImgFunc);
        render(markup);
      });
    } else if (btn.classList.contains('btn-opera')) {
      eventsContainer.innerHTML = '';
      const operaEvents = filterEventsByType(events, 'opera');
      operaEvents.forEach(async event => {
        const markup = await generateEventsMarkup(event, getImgFunc);
        render(markup);
      });
    }
  });
};

/**
 * A function that given an array of events and a string telling the event type will return an array of all
 * the events of this type
 * @param {array} events
 * @param {string} type
 * @returns An array of events
 */
const filterEventsByType = function (events, type) {
  if (!events || !type) return;
  return events.filter(event => event.type === type);
};

/**
 * A function that toggle the hidden class to the modal form to show or hide it
 */
const toggleWindow = function () {
  if (!overlay || !formWindow) return;
  overlay.classList.toggle('hidden');
  formWindow.classList.toggle('hidden');
};

/**
 * A function to handle the clicks on the add-event button and show or hide the modal form.
 * It also changes the button from edit to upload by toggling the class btn-hidden
 */
const addHandlerShowForm = function () {
  if (!addEventBtn) return;
  addEventBtn.addEventListener('click', () => {
    if (uploadBtn.classList.contains('btn-hidden')) {
      toggleBtnVisibility();
    }
    toggleWindow();
  });
};
addHandlerShowForm();

/**
 * A function to handle the clicks on the x button or outside the modal to close the modal form
 */
const addHandlerHideForm = function () {
  if (!btnCloseModal || !overlay) return;
  btnCloseModal.addEventListener('click', toggleWindow);
  overlay.addEventListener('click', toggleWindow);
};
addHandlerHideForm();

/**
 * A function to handle the clicks on the modal form upload button
 */
export const uploadBtnHandler = function (uploadFunc, data) {
  if (!uploadBtn) return;
  uploadBtn.addEventListener('click', e => {
    e.preventDefault();
    uploadEvent(uploadFunc, data);
    setTimeout(() => {
      location.reload();
    }, 1000);
  });
};

/**
 * A function to render the new event given the data added by the user into the modal form
 */
const uploadEvent = function (uploadFunc, data) {
  if (!eventsContainer) return;
  const formData = getFormData();
  data.push(formData);
  uploadFunc(formData);
  toggleWindow();
  emptyInputValues(inputTitle, inputImgURL, inputDesc, inputDates);
};

/**
 * A function to extract the data from the modal form
 * @returns An object with the form data
 */
const getFormData = function () {
  const formData = new FormData(addEventForm);
  if (!formData) return;
  const data = Object.fromEntries(formData);
  return data;
};

/**
 * A function to handle the clicks on the trash icon of the event
 */
export const deleteEventHandler = function (deleteFunc) {
  if (!eventsContainer) return;
  eventsContainer.addEventListener('click', e => {
    e.stopPropagation();
    const btn = e.target.closest('.btn-icon');
    if (!btn) return;
    if (btn.classList.contains('trash-icon')) {
      deleteEvent(btn);
      const eventId =
        btn.parentElement.childNodes[3].firstElementChild.innerHTML;
      deleteFunc(eventId);
    }
  });
};

/**
 * A function that deletes an element
 * @param {element} elem
 */
const deleteEvent = function (elem) {
  elem.parentElement.remove();
};

/**
 * A function that toggles the btn-hidden class from the edit and upload buttons to show or hide them
 */
const toggleBtnVisibility = function () {
  if (!editBtn || !uploadBtn) return;
  editBtn.classList.toggle('btn-hidden');
  uploadBtn.classList.toggle('btn-hidden');
};

/**
 * A function that given an event object will return its html as a string
 * @param {object} event
 * @returns A string of the event data html
 */
const generateEditedEventMarkup = async function (event, getImgFunc) {
  const imgURL = await getImgFunc(event.id);
  const [...dates] = event.dates;
  const eventsNearDate = dates.join('').slice(0, 10).replaceAll('-', '/');
  const localeDate = new Date(eventsNearDate).toLocaleDateString();
  return `
      <img src="${imgURL}" alt="${event.title} data-id="${event.id}"">
      <h2 class="event-title">${event.title}<span style="visibility: hidden">${event.id}</span></h2>
      <p class="event-desc">${event.description}</p>
      <p class="event-dates">${localeDate}</p>
      <button class="btn-icon edit-icon"><i class="far fa-edit"></i></button>
      <button class="btn-icon trash-icon"><i class="fas fa-trash-alt"></i></button>
      `;
};

/**
 * A function that given an element (an event container) will put the form data of the edited element within the element
 * @param {element} parentElem
 */
const editEvent = async function (parentElem, editFunc, eventId, getImgFunc) {
  const formData = getFormData();
  const markup = await generateEditedEventMarkup(formData, getImgFunc);
  parentElem.innerHTML = markup;
  emptyInputValues(inputTitle, inputImgURL, inputDesc, inputDates);
  editFunc(eventId, formData);
  setTimeout(() => {
    location.reload();
  }, 1000);
};

/**
 * A function to handle the clicks on the modal form edit button
 * @param {element} parentElem
 */
const editBtnHandler = function (parentElem, editFunc, eventId, getImgFunc) {
  if (!editBtn) return;
  editBtn.addEventListener('click', e => {
    e.preventDefault();
    toggleWindow();
    editEvent(parentElem, editFunc, eventId, getImgFunc);
    toggleBtnVisibility();
  });
};

/**
 * A function to handle the clicks on the edit icon of the event
 */
export const editEventHandler = function (editFunc, getImgFunc) {
  if (!eventsContainer) return;
  eventsContainer.addEventListener('click', e => {
    const btn = e.target.closest('.btn-icon');
    if (!btn) return;
    if (btn.classList.contains('edit-icon')) {
      if (editBtn.classList.contains('btn-hidden')) {
        toggleBtnVisibility();
      }
      toggleWindow();
      const eventId =
        btn.parentElement.childNodes[3].firstElementChild.innerHTML;
      editBtnHandler(btn.parentElement, editFunc, eventId, getImgFunc);
    }
  });
};

/**
 * A function to handle the clicks on the search icon and the filter the events by the word given as an input.
 * Finally, it renders the events that its title has the given word
 * @param {array} events
 */
export const searchHandler = function (events, getImgFunc) {
  if (!events || !searchBtn || !eventsContainer) return;
  try {
    searchBtn.addEventListener('click', () => {
      const filteredEvents = events.filter(event => {
        if (searchInput.value === '' || searchInput.value === ' ') return;
        if (
          event.title.toLowerCase().includes(searchInput.value.toLowerCase())
        ) {
          return event;
        }
      });
      eventsContainer.innerHTML = '';
      filteredEvents.forEach(async event => {
        const markup = await generateEventsMarkup(event, getImgFunc);
        render(markup);
      });
      searchInput.value = '';
    });
  } catch (err) {
    console.error(err);
  }
};

export const btnFindHandler = function (events, getImgFunc) {
  if (!btnFind) return;
  try {
    btnFind.addEventListener('click', e => {
      e.preventDefault();
      filterEventsByDate(events, getImgFunc);
    });
  } catch (err) {
    console.error(err);
  }
};

const filterEventsByDate = function (events, getImgFunc) {
  const dateFrom = new Date(dateFromInput.value);
  const dateTo = new Date(dateToInput.value);
  const filteredEvents = events.filter(event => {
    return event.dates.some(date => {
      return new Date(date) >= dateFrom && new Date(date) <= dateTo;
    });
  });
  eventsContainer.innerHTML = '';
  filteredEvents.forEach(async event => {
    const markup = await generateEventsMarkup(event, getImgFunc);
    render(markup);
  });
};

export const showEventHandler = function (getEventFunc, getImgFunc) {
  if (!eventsContainer) return;
  eventsContainer.addEventListener('click', e => {
    e.stopPropagation();
    const eventCard = e.target;
    if (!eventCard || !eventCard.classList.contains('events-img')) return;
    const id = eventCard.dataset.id;
    getEventFunc(id).then(async event => {
      eventsContainer.innerHTML = '';
      const eventMarkup = await generateEventMarkup(event, getImgFunc);
      renderEvent(eventMarkup);
    });
  });
};

// A function to return an event markup given an event fetch by id
const generateEventMarkup = async function (event, getImgFunc) {
  const imgURL = await getImgFunc(event.id);
  return `
  <section class="event">
        <h1 class="event-title">${event.title}</h1>
        <img class="event-img" src="${imgURL}" alt="${event.title}" data-id="${
    event.id
  }">
        <aside class="event-form">
          <form action="post">
            <input class="event-form-input" type="text" name="name" id="name" placeholder="Name"/>
            <input class="event-form-input" type="text" name="lastName" id="lastName" placeholder="Last name"/>
            <input class="event-form-input" type="text" name="phone" id="phone" placeholder="Phone"/>
            <input class="event-form-input" type="text" name="email" id="email" placeholder="Email"/>
            <input class="event-form-input" type="number" name="numTickets" id="numTickets" value="1" min="1"/>
            <button class="event-form-btn" type="submit">Add to cart</button>
          </form>
        </aside>
        <div class="event-description">
        <h2>Price</h2>
        <p>${event.price} €</p>
        <h2>Dates</h2>
        <p>${event.dates
          .map(date => new Date(date).toLocaleDateString())
          .join(', ')}</p>
        <h2>Author</h2>
        <p>${event.author}</p>
          <h2>Description</h2>
          <p>${event.description}</p>
          <h2>Duration</h2>
        <p>${event.duration} min</p>
        </div>
      </section>
  `;
};

// A function to render the event
const renderEvent = function (markup) {
  if (!eventsContainer) return;
  eventsContainer.insertAdjacentHTML('afterbegin', markup);
};
