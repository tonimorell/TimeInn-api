import * as data from './data.js';
import * as model from './model.js';
import * as helper from './helper.js';

import * as scroll from './landingPage/scroll-up.js';

import * as headerFooter from './header-footer.js';
import * as firstSection from './landingPage/firstSection.js';
import * as secondSection from './landingPage/secondSection.js';
import * as subscription from './landingPage/subsModal.js';
import * as calendar from './landingPage/calendar.js';
import * as newsSection from './landingPage/outstandingNews.js';

import * as eventPage from './event.js';
import * as allEventsPage from './all-events.js';
import * as newsPage from './all-news.js';

import * as loginValidation from './form-validation/login-validation.js';
import * as signupValidation from './form-validation/signup-validation.js';

// TODO: Parcel HMR (delete)
if (module.hot) {
  module.hot.accept();
}

// ScrollUp handler
scroll.scrollUpHandler();

// Render header and footer
const userName = helper.filterUserCookie()?.replace('user=', '');
headerFooter.renderHeader(userName);
headerFooter.renderFooter();

// Render the first section: events of the day
const controlFirstSection = async function () {
  await model.getAllEvents();
  firstSection.render(firstSection.generateVideoMarkup(model.events));
  firstSection.render(firstSection.generateInfoMarkup(model.events));
};

// Render the second section: events of the week
const controlSecondSection = async function () {
  await model.getAllEvents();
  window.addEventListener('load', () => {
    secondSection.generateImgBkg(model.events);
    secondSection.render(secondSection.generateInfoMarkup(model.events));
  });
  secondSection.displayEventHandler(model.events);
};

//Render Calendar
calendar.render(calendar.createCalendar());
calendar.addEventCalendar();

//Render the fourth section: news
const controlNewsSection = async function () {
  // await model.getNews(
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicGVwZUBwZXBlLmNvbSIsInBzd2QiOiJwZXBlMTIzNCIsImlhdCI6MTY0MzQxNDI2MiwiZXhwIjoxNjQzNDE3ODYyfQ.OutRTavGogZgtuoPfqSbJgMmrYQd9KFcMRI5GFNxCmI'
  // );
  await model.getNews(helper.getToken());
  newsSection
    .filterNews(model.news)
    .slice(0, 4)
    .reverse()
    .forEach(news => newsSection.render(newsSection.generateNewsMarkup(news)));
};

// Generate cookie and render subscription modal
const cookies = helper.getCookies();
if (!cookies.includes('session=Cookie')) {
  // One week = 604800 seconds
  helper.setCookie('session=Cookie; max-age=604800; path=/; SameSite=Lax;');

  // Render modal form for subscription
  subscription.obsSect();
  subscription.addHandlerHideForm();
  subscription.sendBtnHandler();
}

// Render the event when a tickets button is clicked
const controlEventPage = async function () {
  await model.getAllEvents();
  eventPage.render(eventPage.generateEventMarkup(model.events));
};

const controlAllEventsPage = async function () {
  await model.getAllEvents();

  // Render all events into all-events page
  model.events.forEach(event =>
    allEventsPage.render(allEventsPage.generateEventsMarkup(event))
  );
  // Filter events by type
  allEventsPage.renderFilterButtons(
    allEventsPage.generateFilterMarkup(model.events)
  );
  allEventsPage.filterHandler(model.events);
  // Search events
  allEventsPage.searchHandler(model.events);
  // Filter events by date
  allEventsPage.btnFindHandler(model.events);
  // Upload and save new event
  allEventsPage.uploadBtnHandler(model.uploadEvent, model.events);
  allEventsPage.editEventHandler(model.editEvent);
  allEventsPage.deleteEventHandler(model.deleteEvent);
};

// Render the all-news Page
const controlNewsPage = async function () {
  // await model.getNews(
  //   'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicGVwZUBwZXBlLmNvbSIsInBzd2QiOiJwZXBlMTIzNCIsImlhdCI6MTY0MzQxNDI2MiwiZXhwIjoxNjQzNDE3ODYyfQ.OutRTavGogZgtuoPfqSbJgMmrYQd9KFcMRI5GFNxCmI'
  // );
  await model.getNews(helper.getToken());
  newsSection
    .filterNews(model.news)
    .forEach(news => newsPage.render(newsPage.generateAllNews(news)));
  newsPage.showContent();
};

// Login
loginValidation.checkboxHandler();
loginValidation.sendToSignUpPage();
const usersData = [...helper.getLocalStorage(data.users)];
loginValidation.loginBtnHandler(usersData, model.setCookieToken);

// Signup
signupValidation.emailFocusHandler(usersData);
signupValidation.nameFocusHandler();

signupValidation.signupBtnHandler(usersData, model.registerUser);

signupValidation.passwFocusHandler();
signupValidation.passwMatchFocusHandler();

//Show passw
signupValidation.showPassw();

// model.setCookieToken('pepe@pepe.com', 'pepe1234');
const init = function () {
  controlFirstSection();
  controlSecondSection();
  controlEventPage();
  controlAllEventsPage();
  if (helper.getToken()) {
    controlNewsSection();
    controlNewsPage();
  } else {
    newsSection.render('<h2 class="restricted-msg">Restricted content</h2>');
    newsPage.render('<h2 class="restricted-msg">Restricted content</h2>');
  }
};
init();
