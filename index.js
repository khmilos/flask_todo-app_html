(function() {
  // Constants
  const body = document.querySelector('.js-body');
  const headerLinksHeight = (() => {
    let height = 0;
    document.querySelectorAll('.js-nav-item')
      .forEach((element) => height += element.offsetHeight);
    return height;
  })();
  const MIN_TIME = 17;
  const ANIMATION_TIME = 300;

  // Functions
  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Classes
  class Modal {
    static _shadow = Object.assign(
      document.createElement('DIV'),
      {className: 'modal-shadow'}
    );

    _isOpen = false;
    _isAnimating = false;
    
    constructor(container, openListener = function() {}) {
      this._container = container;
      this._openListener = openListener;
    }

    static get shadow() { return this._shadow; }
    get container() { return this._container; }

    async open(triggeredBy) {
      if (this._isAnimating || this._isOpen) return;
      this._isAnimating = true;
      this._openListener(triggeredBy);

      this._container.classList.add('forward');
      body.classList.add('body-fixed');
      body.appendChild(Modal._shadow);
      await sleep(MIN_TIME);
      this._container.classList.add('active');
      Modal._shadow.classList.add('active');
      await sleep(ANIMATION_TIME);
      
      this._isOpen = true;
      this._isAnimating = false;
    }

    async close() {
      if (this._isAnimating || !this._isOpen) return;
      this._isAnimating = true;

      this._container.classList.remove('active');
      Modal._shadow.classList.remove('active');
      await sleep(ANIMATION_TIME);
      this._container.classList.remove('forward');
      body.removeChild(Modal._shadow);
      body.classList.remove('body-fixed');

      this._isAnimating = false;
      this._isOpen = false;
    }

    async toggle(triggeredBy) {
      if (!this._isOpen) await this.open(triggeredBy);
      else await this.close();
    }
  }

  class Header extends Modal {
    constructor(container, dropdown, burger) {
      super(container);
      this._dropdown = dropdown;
      this._burger = burger;
    }

    async open() {
      if (this._isAnimating || this._isOpen) return;
      this._isAnimating = true;

      body.classList.add('body-fixed');
      this._burger.classList.add('active');
      this._dropdown.classList.add('active');
      this._container.classList.add('forward'); 
      this._dropdown.setAttribute('style', `height: ${headerLinksHeight}px;`);
      body.appendChild(Modal._shadow);
      await sleep(MIN_TIME);
      Modal._shadow.classList.add('active');
      await sleep(ANIMATION_TIME);

      this._isAnimating = false;
      this._isOpen = true;
    }

    async close() {
      if (this._isAnimating || !this._isOpen) return;
      this._isAnimating = true;
      
      this._burger.classList.remove('active');
      this._dropdown.classList.remove('active');
      this._dropdown.setAttribute('style', '');
      Modal._shadow.classList.remove('active');
      await sleep(ANIMATION_TIME);
      body.removeChild(Modal._shadow);
      this._container.classList.remove('forward');
      body.classList.remove('body-fixed');
      
      this._isAnimating = false;
      this._isOpen = false;
      return this;
    }
  }

  // Factories
  class ModalFactory {
    static _subscribe(modal, {toOpen, toClose, toToggle}) {
      const action = [modal.open, modal.close, modal.toggle];

      [toOpen, toClose, toToggle].forEach((group, index) => {
        if (!group) return; 
        group.forEach((element) => {
          element.addEventListener('click', (e) => {
            e.preventDefault();
            action[index].call(modal, element);
          });
        });
      });

      window.addEventListener('click', (e) => {
        if (e.target === modal.container || e.target === Modal.shadow) {
          modal.close();
        }
      });

      return modal;
    }

    static createModal(container, triggerElements, listener) {
      if (!container) return null;
      return this._subscribe(new Modal(container, listener), triggerElements);
    }

    static createHeader(container, dropdown, burger, triggerElements) {
      if (!container) return null;
      return this._subscribe(
        new Header(container, dropdown, burger), 
        triggerElements
      );
    }
  }

  // Scripts
  const header = ModalFactory.createHeader(
    document.querySelector('.js-header'),
    document.querySelector('.js-nav'),
    document.querySelector('.js-burger'),
    { toToggle: [document.querySelector('.js-burger')] },
  );

  const profile = ModalFactory.createModal(
    document.querySelector('.js-profile-setup'),
    {
      toOpen: [document.querySelector('.js-customize')],
      toClose: [document.querySelector('.js-profile-setup-close')],
    }
  );
  if (profile) {
    const userInfo = document.querySelector('.js-profile-info')
      .innerHTML.trim();
    document.querySelector('.js-profile-setup-info').value = userInfo;
  }

  const filterBoard = ModalFactory.createModal(
    document.querySelector('.js-board-filter'),
    { 
      toOpen: [document.querySelector('.js-board-filter-btn')],
      toClose: [document.querySelector('.js-board-filter-close')]
    }
  );

  const setupBoard = ModalFactory.createModal(
    document.querySelector('.js-board-setup'),
    {
      toOpen: [...document.querySelectorAll('.js-setup-boards-btn')],
      toClose: [document.querySelector('.js-board-setup-close')]
    },
    (triggeredBy) => {
      const title = triggeredBy
        .parentNode.querySelector('.js-board-card-title').textContent;
      document.querySelector('.js-board-setup-name').value = title;
    }
  );

  const createBoard = ModalFactory.createModal(
    document.querySelector('.js-board-create'),
    {
      toOpen: [document.querySelector('.js-board-create-btn')],
      toClose: [document.querySelector('.js-board-create-close')]
    }
  );
})()