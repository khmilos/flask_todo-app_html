(function() {
  const body = document.querySelector('.js-body');
  // Modal Shadow
  const shadow = document.createElement('DIV');
  shadow.classList.add('modal-shadow');

  // Constants
  const MIN_TIME = 11;
  const ANIMATION_TIME = 500;

  // Functions
  function sleep(ms) { 
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Classes
  class Modal {
    constructor({ container, body, shadow, }, time) {
      this.container = container;
      this.body = body;
      this.shadow = shadow;
      this.time = time;
      this.status = {
        isOpen: false,
        isAnimated: false,
      };

      this.lastEventTarget = null;
      this.listener = function() {};
    }

    set isOpen(value) {
      this.status.isOpen = value;
      this.listener(value);
    }

    registerListener(listener) {
      this.listener = listener;
    }
    
    async open(target) {
      if (this.status.isAnimated || this.status.isOpen) return this;
      this.lastEventTarget = target;
      this.status.isAnimated = true;
      this.isOpen = true;

      this.container.parentNode.classList.add('forward');
      this.body.classList.add('body-fixed');
      this.body.appendChild(shadow);
      await sleep(MIN_TIME);
      this.container.parentNode.classList.add('active');
      this.shadow.classList.add('active');
      await sleep(this.time);
  
      this.status.isAnimated = false;
      return this;
    }
  
    async close(target) {
      if (this.status.isAnimated || !this.status.isOpen) return this;
      this.lastEventTarget = target;
      this.status.isAnimated = true;
      this.isOpen = false;

      this.shadow.classList.remove('active');
      this.container.parentNode.classList.remove('active');
      await sleep(this.time);
      this.container.parentNode.classList.remove('forward');
      this.body.removeChild(this.shadow);
      this.body.classList.remove('body-fixed');

      this.status.isAnimated = false;
      return this;
    }
    
    toggle() {
      if (!this.status.isOpen) this.open();
      else this.close();
    }
  }

  class Header extends Modal {
    constructor({ container, body, shadow, dropdown, burger }, time) {
      super({ container, body, shadow, }, time);
      this.dropdown = dropdown;
      this.burger = burger;
    }

    async open() {
      if (this.status.isAnimated || this.status.isOpen) return this;
      this.isOpen = true;
      this.status.isAnimated = true;

      this.body.classList.add('body-fixed');
      this.burger.classList.add('active');
      this.dropdown.classList.add('active');
      this.container.classList.add('forward');
      const links = document.querySelectorAll('.js-nav__item');
      let height = 0;
      links.forEach((element) => height += element.offsetHeight);
      this.dropdown.setAttribute('style', `height: ${height}px;`);
      this.body.appendChild(this.shadow);
      await sleep(MIN_TIME);
      this.shadow.classList.add('active');
      await sleep(ANIMATION_TIME);

      this.status.isAnimated = false;
      return this;
    }

    async close() {
      if (this.status.isAnimated || !this.status.isOpen) return false;
      this.isOpen = false;
      this.status.isAnimated = this;
  
      this.burger.classList.remove('active');
      this.dropdown.classList.remove('active');
      this.dropdown.setAttribute('style', '');
      this.shadow.classList.remove('active');
      await sleep(ANIMATION_TIME);
      body.removeChild(this.shadow);
      this.container.classList.remove('forward');
      this.body.classList.remove('body-fixed');
  
      this.status.isAnimated = false;
      return this;
    }
  }

  // Factories
  class modalFactory {
    static _subscribe({ toOpen, toClose, toToggle }, modal, shadow) {
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
      window.addEventListener('click', (event) => {
        if (event.target === modal.container.parentNode
          || event.target === shadow) {
            modal.close(window);
          }
      });
      return modal;
    }

    static createModal(modalElements, animation, triggerElements) {
      if (!modalElements.container) return null;
      return this._subscribe(
        triggerElements, 
        new Modal(modalElements, animation),
        modalElements.shadow,
      );
    }

    static createHeader(modalElements, animation, triggerElements) {
      if (!modalElements.container) return null;
      return this._subscribe(
        triggerElements,
        new Header(modalElements, animation),
        modalElements.shadow,
      );
    }
  }
  
  // Scripts
  const header = modalFactory.createHeader(
    {
      container: document.querySelector('.js-header'),
      dropdown: document.querySelector('.js-nav'),
      burger: document.querySelector('.js-burger'),
      body,
      shadow,
    },
    ANIMATION_TIME,
    { toToggle: [document.querySelector('.js-burger')] },
  );

  const profile = modalFactory.createModal(
    { container: document.querySelector('.js-profile-setup'), body, shadow, },
    ANIMATION_TIME, 
    {
      toOpen: [document.querySelector('.js-customize')],
      toClose: [document.querySelector('.js-profile-setup-close')],
    },
  );
  if (profile) {
    const userInfo = document.querySelector('.js-profile-info')
      .innerHTML.trim();
    document.querySelector('.js-profile-setup-info').value = userInfo;
  }

  const filterBoard = modalFactory.createModal(
    {
      container: document.querySelector('.js-filter-boards'),
      body,
      shadow,
    }, 
    ANIMATION_TIME,
    { 
      toOpen: [document.querySelector('.js-filter-boards-btn')],
      toClose: [document.querySelector('.js-filter-boards-close')],
    },
  );
  
  const setupBoard = modalFactory.createModal(
    { container: document.querySelector('.js-setup-boards'), body, shadow },
    ANIMATION_TIME,
    {
      toOpen: [...document.querySelectorAll('.js-setup-boards-btn')],
      toClose: [document.querySelector('.js-setup-boards-close')],
    },
  );
  if (setupBoard) setupBoard.registerListener(function(value) {
    if (value) {
      const title = this.lastEventTarget.parentNode
        .querySelector('.js-board-card-title').textContent;
      document.querySelector('.js-setup-name').value = title;
    }
  });

  const createBoard = modalFactory.createModal(
    { container: document.querySelector('.js-board-create'), body, shadow },
    ANIMATION_TIME,
    {
      toOpen: [document.querySelector('.js-board-create-btn')],
      toClose: [document.querySelector('.js-board-create-close')]
    }
  )
})()