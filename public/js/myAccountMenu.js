/* eslint-disable */

const container = document.querySelectorAll('ul.side-nav');

if (container) {
  // make the active tabs style working when clicking on them
  const queryTabKey = 'active';

  // make the good link active
  window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryTabIndex = urlParams.get(queryTabKey);

    container.forEach((ul) => {
      makeLinkActive({ container, valueToMatch: queryTabIndex });
    });
  });

  let tabIndex = 1;
  container.forEach((ul, index) => {
    ul.querySelectorAll('li').forEach((li) => {
      li.addEventListener(
        'click',
        appendQueryParam({ key: queryTabKey, value: tabIndex })
      );
      tabIndex++;
    });
  });

  function appendQueryParam(parameters) {
    return () => {
      window.location.href = replaceQueryParameter(parameters);
    };
  }

  function makeLinkActive(parameters) {
    const { container, valueToMatch } = parameters;
    let indexToMatch = 1;
    if (valueToMatch) {
      container.forEach((ul) => {
        ul.querySelectorAll('li').forEach((li, index) => {
          if (indexToMatch == valueToMatch) {
            li.classList.add('side-nav--active');
          }
          indexToMatch++;
        });
      });
    } else {
      const regularUserTab = container.item(0);
      const li = regularUserTab.querySelectorAll('li').item(0);
      li.classList.add('side-nav--active');
    }
  }

  function replaceQueryParameter(parameters) {
    const { key, value } = parameters;
    let currentUrl = window.location.href;
    if (currentUrl.includes(key)) {
      const regexString = `${key}=\\d`;
      const regex = new RegExp(regexString);
      currentUrl = currentUrl.replace(regex, `${key}=${value}`);
      return currentUrl;
    } else {
      const separator = currentUrl.includes('?') ? '&' : '?';
      const newUrl = currentUrl + separator + key + '=' + value;
      return newUrl;
    }
  }
}
