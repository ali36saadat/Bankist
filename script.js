'use strict';

/////////////////////////////////////////////////
//////////////////// BANKIST ////////////////////

// Data
// const account1 = {
//   owner: 'Jonas Schmedtmann',
//   movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
//   interestRate: 1.2, // %
//   pin: 1111,
// };

// const account2 = {
//   owner: 'Jessica Davis',
//   movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
//   interestRate: 1.5,
//   pin: 2222,
// };

// const account3 = {
//   owner: 'Steven Thomas Williams',
//   movements: [200, -200, 340, -300, -20, 50, 400, -460],
//   interestRate: 0.7,
//   pin: 3333,
// };

// const account4 = {
//   owner: 'Sarah Smith',
//   movements: [430, 1000, 700, 50, 90],
//   interestRate: 1,
//   pin: 4444,
// };

const account10 = {
  owner: 'Ali Saadat',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-07-26T17:01:17.194Z',
    '2020-07-28T23:36:17.929Z',
    '2020-08-01T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account11 = {
  owner: 'Reza Saadat',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2020-06-25T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

// const accounts = [account1, account2, account3, account4, account10, account11];
const accounts = [account10, account11];
let currentAccount,
  timer,
  sorted = false;

// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');
const containerNavInputs = document.querySelector('.login');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

// const inputLoginUsername = document.querySelector('.login__input--user');
// const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

// Functions
const navInputs = function (state) {
  containerNavInputs.innerHTML = '';
  labelWelcome.innerHTML = '';

  let stateInputs = '',
    changeBtn = '';

  if (state === 1) {
    changeBtn = `<button type="submit" class="form__change__btn">Sign In</button>`;

    stateInputs = `<p class="nav__right__title">Log in to get started
 : </p><input
          type="text"
          placeholder="user"
          class="login__input login__input--user"
        />
        <input
          type="text"
          placeholder="PIN"
          maxlength="4"
          class="login__input login__input--pin"
        />
        <button type="button" class="login__btn">&rarr;</button>`;
  } else if (state === 2) {
    stateInputs = `
        <button type="submit" class="logout__btn">Log Out</button>`;
    labelWelcome.textContent = labelWelcome.textContent = `Welcome Back ${
      currentAccount.owner.split(' ')[0]
    }`;
  } else if (state === 3) {
    changeBtn = `<button type="submit" class="form__change__btn">Log In</button>`;

    stateInputs = `<p class="nav__right__title">Sign in to get started : </p><input
          type="text"
          placeholder="user ( full name )"
          class="sign__in__input sign__in__input--user"
        />
        <input
          type="text"
          placeholder="PIN ( max 4 digits )"
          maxlength="4"
          class="sign__in__input sign__in__input--pin"
        />
        <button type="button" class="sign__in__btn">&rArr;</button>`;
  }

  containerNavInputs.insertAdjacentHTML('afterbegin', stateInputs);
  labelWelcome.insertAdjacentHTML('afterbegin', changeBtn);

  stateBtn(state);
};

const calcDaysPassed = function (date2, date1) {
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
};

const formatMovementDate = function (date, locale) {
  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  else if (daysPassed === 1) return 'Yesterday';
  else if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const numberFormat = function (num, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(num);
};

const display = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach((mov, i) => {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.currency);
    const formattedMov = numberFormat(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const createUsernames = function (accs) {
  accs.forEach(
    acc =>
      (acc.username = acc.owner
        .toLowerCase()
        .split(' ')
        .map(name => name[0])
        .join(''))
  );
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = numberFormat(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const income = acc.movements.reduce(
    (acc, mov) => (mov > 0 ? acc + mov : acc),
    0
  );
  labelSumIn.textContent = numberFormat(income, acc.locale, acc.currency);

  const out = acc.movements.reduce(
    (acc, mov) => (mov < 0 ? acc + mov : acc),
    0
  );
  labelSumOut.textContent = numberFormat(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements.reduce(
    (acc, mov) => ((mov / 100) * 1.2 >= 1 ? acc + (mov / 100) * 1.2 : acc),
    0
  );
  labelSumInterest.textContent = numberFormat(
    interest,
    acc.locale,
    acc.currency
  );
};

const updateUI = function (acc) {
  display(acc);

  calcDisplayBalance(acc);

  calcDisplaySummary(acc);
};

const startLogOutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    labelTimer.textContent = `${min} : ${sec}`;

    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
      navInputs(1);
    }
    time--;
  };

  let time = 10;

  tick();
  const timer = setInterval(tick, 1000);

  return timer;
};

// Event handlers
const stateBtn = function (state) {
  if (state === 1) {
    const btnLogin = document.querySelector('.login__btn');
    const inputLoginUsername = document.querySelector('.login__input--user');
    const inputLoginPin = document.querySelector('.login__input--pin');
    // const labelWelcome = document.querySelector('.welcome');
    const formChangeBtn = document.querySelector('.form__change__btn');

    if (btnLogin) {
      btnLogin.addEventListener('click', function (e) {
        e.preventDefault();
        currentAccount = accounts.find(
          acc => acc.username === inputLoginUsername.value
        );

        if (currentAccount?.pin === Number(inputLoginPin.value)) {
          // labelWelcome.textContent = `Welcome Back ${
          //   currentAccount.owner.split(' ')[0]
          // }`;

          labelDate.textContent = new Intl.DateTimeFormat(
            currentAccount.locale,
            {
              hour: 'numeric',
              minute: 'numeric',
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
            }
          ).format(new Date());

          containerApp.style.opacity = 100;

          updateUI(currentAccount);

          if (timer) clearInterval(timer);
          timer = startLogOutTimer();

          navInputs(2);
        }

        inputLoginUsername.value = inputLoginPin.value = '';
        inputLoginPin.blur();
        inputLoginUsername.blur();
      });

      formChangeBtn.addEventListener('click', function (e) {
        e.preventDefault();
        navInputs(3);
      });
    }
  } else if (state === 2) {
    const btnLogout = document.querySelector('.logout__btn');
    if (btnLogout) {
      btnLogout.addEventListener('click', function (e) {
        e.preventDefault();

        clearInterval(timer);
        labelWelcome.textContent = 'Log in to get started';
        containerApp.style.opacity = 0;
        navInputs(1);
      });
    }
  } else if (state === 3) {
    const btnSignIn = document.querySelector('.sign__in__btn');
    const inputSignInUsername = document.querySelector(
      '.sign__in__input--user'
    );
    const inputSignInPin = document.querySelector('.sign__in__input--pin');

    const formChangeBtn = document.querySelector('.form__change__btn');

    btnSignIn.addEventListener('click', function (e) {
      e.preventDefault();

      const searchAcc = accounts.find(
        acc =>
          acc.owner ===
          inputSignInUsername.value
            .toLowerCase()
            .split(' ')
            .map(name => name[0])
            .join('')
      );
      console.log(searchAcc);
      if (!searchAcc) {
        console.log('push');
        // labelDate.textContent = new Intl.DateTimeFormat(currentAccount.locale, {
        //   hour: 'numeric',
        //   minute: 'numeric',
        //   day: 'numeric',
        //   month: 'numeric',
        //   year: 'numeric',
        // }).format(new Date());
        // containerApp.style.opacity = 100;
        // updateUI(currentAccount);
        // if (timer) clearInterval(timer);
        // timer = startLogOutTimer();
        // navInputs(2);
      }

      inputSignInUsername.value = inputSignInPin.value = '';
      inputSignInUsername.blur();
      inputSignInPin.blur();
    });

    formChangeBtn.addEventListener('click', function (e) {
      e.preventDefault();
      navInputs(1);
    });
  }
};

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Number(inputTransferAmount.value);
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );

  inputTransferAmount.value = inputTransferTo.value = '';
  if (receiverAcc) {
    if (
      amount > 0 &&
      currentAccount.balance >= amount &&
      currentAccount.username !== receiverAcc.username
    ) {
      currentAccount.movements.push(-amount);
      currentAccount.movementsDates.push(new Date().toISOString());
      receiverAcc.movementsDates.push(new Date().toISOString());
      receiverAcc.movements.push(amount);
    }

    updateUI(currentAccount);

    inputTransferAmount.blur();
    inputTransferTo.blur();

    clearInterval(timer);
    timer = startLogOutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (
    amount > 0 &&
    currentAccount.movements.some(money => money >= amount * 0.1)
  ) {
    setTimeout(function () {
      currentAccount.movements.push(amount);

      currentAccount.movementsDates.push(new Date().toISOString());

      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2000);
  }
  inputLoanAmount.value = '';
  inputLoanAmount.blur();
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  const confirmUser = inputCloseUsername.value;
  const confirmPin = Number(inputClosePin.value);

  if (
    currentAccount.pin === confirmPin &&
    currentAccount.username === confirmUser
  ) {
    accounts.splice(
      accounts.findIndex(acc => acc.username === currentAccount.username),
      1
    );
  }
});

btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  sorted = !sorted;
  display(currentAccount.movements, sorted);
});
navInputs(1);
createUsernames(accounts);
