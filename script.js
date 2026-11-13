// ==============================================================
// Smart Bus Ticket Booking System - JavaScript
// ==============================================================

// ১. প্রয়োজনীয় সব HTML উপাদানগুলো (DOM Elements) সিলেক্ট করা
const seatButtons = document.querySelectorAll('.seat-btn');
const availableSeatsElement = document.getElementById('available-seats');
const selectedSeatCountElement = document.getElementById('selected-seat-count');
const selectedSeatsList = document.getElementById('selected-seats-list');
const noSeatMsg = document.getElementById('no-seat-msg');
const totalPriceElement = document.getElementById('total-price');
const discountRow = document.getElementById('discount-row');
const discountPriceElement = document.getElementById('discount-price');
const couponContainer = document.getElementById('coupon-container');
const couponInput = document.getElementById('coupon-input');
const couponBtn = document.getElementById('coupon-btn');
const grandTotalElement = document.getElementById('grand-total');

const passengerNameInput = document.getElementById('passenger-name');
const passengerPhoneInput = document.getElementById('passenger-phone');
const passengerEmailInput = document.getElementById('passenger-email');
const nextBtn = document.getElementById('next-btn');
const successModal = document.getElementById('success-modal');
const modalCloseBtn = document.getElementById('modal-close-btn');

// ২. প্রাথমিক ডাটা ও স্টেট ভ্যারিয়েবল (State Variables)
const TICKET_PRICE = 550; // প্রতি সিটের মূল্য ৫৫০ টাকা
const MAX_SEATS = 4;      // একজন সর্বোচ্চ ৪টি সিট কিনতে পারবে
let availableSeats = 40;  // মোট খালি সিট
let selectedSeats = [];   // সিলেক্ট করা সিটের তালিকা রাখার অ্যারে
let discountAmount = 0;   // ছাড়ের টাকা

// ==============================================================
// ৩. সিট সিলেকশন লজিক (Seat Selection Handler)
// ==============================================================
seatButtons.forEach((btn) => {
  btn.addEventListener('click', function () {
    const seatName = this.innerText.trim();

    // চেক ১: সিটটি ইতিমধ্যে সিলেক্ট করা আছে কি না?
    if (selectedSeats.includes(seatName)) {
      // যদি আগে থেকেই সিলেক্ট করা থাকে, তবে আন-সিলেক্ট (Deselect) করা
      selectedSeats = selectedSeats.filter((seat) => seat !== seatName);

      // সিট বাটনের স্টাইল আগের স্বাভাবিক অবস্থায় ফিরিয়ে আনা
      this.classList.remove('bg-[#1DD100]', 'text-white');
      this.classList.add('bg-[#F7F8F8]', 'text-[#03071280]');

      // খালি সিট বাড়ানো
      availableSeats++;
    } else {
      // চেক ২: ৪টির বেশি সিট সিলেক্ট করার চেষ্টা করছে কি না?
      if (selectedSeats.length >= MAX_SEATS) {
        alert('আপনি সর্বোচ্চ ৪টি সিট সিলেক্ট করতে পারবেন!');
        return;
      }

      // নতুন সিট সিলেক্ট করা
      selectedSeats.push(seatName);

      // সিট বাটনের স্টাইল সবুজ রঙে পরিবর্তন করা
      this.classList.remove('bg-[#F7F8F8]', 'text-[#03071280]');
      this.classList.add('bg-[#1DD100]', 'text-white');

      // খালি সিট কমানো
      availableSeats--;
    }

    // UI ও ভাড়ার হিসাব আপডেট করা
    updateBookingUI();
  });
});

// ==============================================================
// ৪. UI এবং ভাড়ার তথ্য আপডেট করার ফাংশন
// ==============================================================
function updateBookingUI() {
  // ক. খালি সিট ও নির্বাচিত সিট সংখ্যা আপডেট
  availableSeatsElement.innerText = availableSeats;
  selectedSeatCountElement.innerText = selectedSeats.length;

  // খ. ডানপাশের সিট লিস্ট টেবিল আপডেট করা
  if (selectedSeats.length === 0) {
    selectedSeatsList.innerHTML = `
      <p id="no-seat-msg" class="text-sm text-center text-[#03071266]">No seat selected yet</p>
    `;
  } else {
    selectedSeatsList.innerHTML = '';
    selectedSeats.forEach((seat) => {
      const row = document.createElement('div');
      row.className = 'flex justify-between items-center text-[16px]';
      row.innerHTML = `
        <span class="text-[#03071299]">${seat}</span>
        <span class="text-[#03071299]">Economy</span>
        <span class="text-[#03071299]">${TICKET_PRICE}</span>
      `;
      selectedSeatsList.appendChild(row);
    });
  }

  // গ. মোট ভাড়া (Total Price) গণনা
  const totalPrice = selectedSeats.length * TICKET_PRICE;
  totalPriceElement.innerText = totalPrice;

  // ঘ. যদি ৪টির কম সিট থাকে, তবে কুপন রিসেট হবে
  if (selectedSeats.length < MAX_SEATS) {
    discountAmount = 0;
    discountRow.classList.add('hidden');
    discountPriceElement.innerText = '0';
    couponContainer.classList.remove('hidden');
    couponInput.value = '';
  }

  // ঙ. গ্র্যান্ড টোটাল (Grand Total) আপডেট
  const grandTotal = totalPrice - discountAmount;
  grandTotalElement.innerText = grandTotal;

  // চ. Next বাটন অ্যাক্টিভ বা ডিজেবল চেক করা
  checkNextButtonState();
}

// ==============================================================
// ৫. কুপন কোড অ্যাপ্লাই করার লজিক (Coupon Logic)
// ==============================================================
couponBtn.addEventListener('click', function () {
  const couponCode = couponInput.value.trim();
  const totalPrice = selectedSeats.length * TICKET_PRICE;

  // চেক: ৪টি সিট সিলেক্ট করা হয়েছে কি না?
  if (selectedSeats.length !== MAX_SEATS) {
    alert('কুপন কোড ব্যবহার করতে হলে আপনাকে অবশ্যই ৪টি সিট সিলেক্ট করতে হবে!');
    return;
  }

  // কুপন ভ্যালিডেশন
  if (couponCode === 'NEW15') {
    // ১৫% ছাড়
    discountAmount = totalPrice * 0.15;
  } else if (couponCode === 'Couple 20') {
    // ২০% ছাড়
    discountAmount = totalPrice * 0.20;
  } else {
    alert('ভুল কুপন কোড! দয়া করে সঠিক কুপন কোড দিন (যেমন: NEW15 বা Couple 20)।');
    return;
  }

  // ডিসকাউন্ট প্রদর্শন করা
  discountPriceElement.innerText = discountAmount.toFixed(0);
  discountRow.classList.remove('hidden');

  // গ্র্যান্ড টোটাল আপডেট
  const grandTotal = totalPrice - discountAmount;
  grandTotalElement.innerText = grandTotal.toFixed(0);

  // কুপন একবার ব্যবহারের পর ইনপুট বক্স লুকিয়ে ফেলা
  couponContainer.classList.add('hidden');
  alert(`অভিনন্দন! আপনার কুপন সফলভাবে প্রয়োগ হয়েছে। আপনি ৳${discountAmount.toFixed(0)} ছাড় পেয়েছেন।`);
});

// ==============================================================
// ৬. Next বাটন এবং প্যাসেঞ্জার ফর্ম ভ্যালিডেশন
// ==============================================================
// ফোন নম্বর টাইপ করার সাথে সাথে চেক করা
passengerPhoneInput.addEventListener('input', checkNextButtonState);

function checkNextButtonState() {
  const hasSeat = selectedSeats.length > 0;
  const hasPhone = passengerPhoneInput.value.trim().length > 0;

  // যদি অন্তত ১টি সিট এবং ফোন নম্বর দেওয়া থাকে তবে Next বাটন সক্রিয় থাকবে
  if (hasSeat && hasPhone) {
    nextBtn.removeAttribute('disabled');
    nextBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    nextBtn.setAttribute('disabled', 'true');
    nextBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}

// Next বাটনে ক্লিক করলে সাকসেস মডাল দেখানো
nextBtn.addEventListener('click', function (e) {
  e.preventDefault();

  if (selectedSeats.length === 0) {
    alert('দয়া করে অন্তত একটি সিট সিলেক্ট করুন!');
    return;
  }

  if (!passengerPhoneInput.value.trim()) {
    alert('দয়া করে আপনার ফোন নম্বরটি লিখুন!');
    return;
  }

  // সব ঠিক থাকলে সাকসেস পপআপ মডাল ওপেন হবে
  successModal.classList.remove('hidden');
});

// ==============================================================
// ৭. সাকসেস মডাল ক্লোজ ও পেজ রিসেট
// ==============================================================
modalCloseBtn.addEventListener('click', function () {
  // মডাল হাইড করা
  successModal.classList.add('hidden');

  // সম্পূর্ণ পেজ রিলোড দিয়ে নতুন বুকিংয়ের জন্য ফ্রেশ স্টেট আনা
  window.location.reload();
});

// পেজ লোড হওয়ার সময় প্রাথমিক স্টেট সেট করা
checkNextButtonState();
