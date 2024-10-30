// Initialize variables
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let currentDate = new Date();
let selectedDate = moment().format('YYYY-MM-DD');
let recognition = null;

// Initialize speech recognition
function initializeSpeechRecognition() {
    if ('webkitSpeechRecognition' in window) {
        recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function (event) {
            const text = event.results[0][0].transcript;
            const activeElement = document.activeElement;
            if (activeElement.tagName === 'INPUT') {
                activeElement.value = text;
            }
            stopVoiceRecognition();
        };

        recognition.onerror = function (event) {
            console.error('Speech recognition error:', event.error);
            stopVoiceRecognition();
        };
    }
}

function startVoiceRecognition(inputId) {
    if (!recognition) {
        initializeSpeechRecognition();
    }

    const button = event.target;
    const input = document.getElementById(inputId);

    // Remove listening class from all mic icons
    document.querySelectorAll('.mic-icon').forEach(icon => {
        icon.classList.remove('listening');
    });

    button.classList.add('listening');

    recognition.onresult = function (event) {
        const text = event.results[0][0].transcript;

        if (inputId === 'search') {
            input.value = text;
            input.dispatchEvent(new Event('input'));
        } else {
            input.value = text;
        }

        stopVoiceRecognition();
    };

    recognition.start();
    input.focus();
}

function stopVoiceRecognition() {
    document.querySelectorAll('.mic-icon').forEach(icon => {
        icon.classList.remove('listening');
    });
    if (recognition) {
        recognition.stop();
    }
}

// Update search functionality
document.getElementById('searchInput').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');

    if (!searchTerm) {
        searchResults.classList.remove('active');
        updateTransactionLists();
        return;
    }

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.amount.toString().includes(searchTerm) ||
        moment(t.date).format('MMMM D, YYYY').toLowerCase().includes(searchTerm)
    );

    searchResults.innerHTML = '';

    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach(transaction => {
            const searchItem = document.createElement('div');
            searchItem.className = 'search-item';
            searchItem.innerHTML = `
            <div>
                <strong>${transaction.description}</strong>
                <div>${moment(transaction.date).format('MMM D, YYYY')} - ₹${transaction.amount.toFixed(2)}</div>
            </div>
            <span class="type-indicator ${transaction.type}-type">
                ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
            </span>
        `;
            searchResults.appendChild(searchItem);
        });
        searchResults.classList.add('active');
    } else {
        searchResults.innerHTML = '<div class="search-item">No results found</div>';
        searchResults.classList.add('active');
    }
});

// Close search results when clicking outside
document.addEventListener('click', function (e) {
    const searchResults = document.getElementById('searchResults');
    const searchContainer = document.querySelector('.search-container');

    if (!searchContainer.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});
// Calendar functions
function initializeCalendar() {
    const calendar = document.getElementById('calendar');
    calendar.innerHTML = '';

    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'day-header';
        dayHeader.textContent = day;
        calendar.appendChild(dayHeader);
    });

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const today = new Date();

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay.getDay(); i++) {
        calendar.appendChild(document.createElement('div'));
    }

    // Add days of the month
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.textContent = day;
        dayElement.className = 'date';

        const dateStr = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), day)).format('YYYY-MM-DD');
        const dateObj = new Date(dateStr);

        if (dateObj > today) {
            dayElement.classList.add('future-date');
        } else {
            if (hasTransactionsOnDate(dateStr)) {
                dayElement.classList.add('has-data');
            }
            if (dateStr === selectedDate) {
                dayElement.classList.add('selected');
            }
            dayElement.onclick = () => selectDate(dateStr);
        }

        calendar.appendChild(dayElement);
    }

    document.getElementById('currentMonth').textContent =
        moment(currentDate).format('MMMM YYYY');
}

function hasTransactionsOnDate(dateStr) {
    return transactions.some(t => t.date === dateStr);
}

function selectDate(dateStr) {
    selectedDate = dateStr;
    document.getElementById('selectedDateDisplay').textContent =
        `Transactions for ${moment(dateStr).format('MMMM D, YYYY')}`;
    updateTransactionLists();
    initializeCalendar();
}

function previousMonth() {
    currentDate = moment(currentDate).subtract(1, 'month').toDate();
    initializeCalendar();
}

function nextMonth() {
    const nextMonthDate = moment(currentDate).add(1, 'month').toDate();
    if (nextMonthDate <= new Date()) {
        currentDate = nextMonthDate;
        initializeCalendar();
    }
}

function addTransaction(type) {
    const amountInput = document.getElementById(`${type}Amount`);
    const descriptionInput = document.getElementById(`${type}Description`);

    const amount = parseFloat(amountInput.value);
    const description = descriptionInput.value.trim();

    if (!amount || isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
    }

    if (!description) {
        alert('Please enter a description');
        return;
    }

    const transaction = {
        id: Date.now(), // Unique identifier
        date: selectedDate,
        amount: amount,
        description: description,
        type: type,
        timestamp: new Date().getTime()
    };

    transactions.push(transaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Clear inputs
    amountInput.value = '';
    descriptionInput.value = '';

    // Update UI
    updateTransactionLists();
    updateSummary();
    initializeCalendar();
}

function updateTransactionLists() {
    const incomeList = document.getElementById('incomeList');
    const expenseList = document.getElementById('expenseList');

    // Clear existing lists
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    // Get transactions for selected date
    const dayTransactions = transactions
        .filter(t => t.date === selectedDate)
        .sort((a, b) => b.timestamp - a.timestamp);

    dayTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
        <div>
            <strong>${transaction.description}</strong>
            <div>₹${transaction.amount.toFixed(2)}</div>
        </div>
        <button 
            onclick="deleteTransaction(${transaction.id})" 
            class="delete-btn"
            title="Delete transaction">
            ❌
        </button>
    `;

        if (transaction.type === 'income') {
            incomeList.appendChild(transactionElement);
        } else {
            expenseList.appendChild(transactionElement);
        }
    });
}

function deleteTransaction(id) {
    if (confirm('Are you sure you want to delete this transaction?')) {
        transactions = transactions.filter(t => t.id !== id);
        localStorage.setItem('transactions', JSON.stringify(transactions));
        updateTransactionLists();
        updateSummary();
        initializeCalendar();
    }
}

function updateSummary() {
    const totalIncome = transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses;

    document.getElementById('totalIncome').textContent = `₹${totalIncome.toFixed(2)}`;
    document.getElementById('totalExpenses').textContent = `₹${totalExpenses.toFixed(2)}`;
    document.getElementById('balance').textContent = `₹${balance.toFixed(2)}`;

    // Add color coding for balance
    const balanceElement = document.getElementById('balance');
    if (balance > 0) {
        balanceElement.style.color = 'var(--success-color)';
    } else if (balance < 0) {
        balanceElement.style.color = 'var(--danger-color)';
    } else {
        balanceElement.style.color = 'var(--text-color)';
    }
}

document.getElementById('searchInput').addEventListener('input', function (e) {
    const searchTerm = e.target.value.toLowerCase();
    const searchResults = document.getElementById('searchResults');

    if (!searchTerm) {
        searchResults.classList.remove('active');
        updateTransactionLists();
        return;
    }

    const filteredTransactions = transactions.filter(t =>
        t.description.toLowerCase().includes(searchTerm) ||
        t.amount.toString().includes(searchTerm) ||
        moment(t.date).format('MMMM D, YYYY').toLowerCase().includes(searchTerm)
    );

    searchResults.innerHTML = '';

    if (filteredTransactions.length > 0) {
        filteredTransactions.forEach(transaction => {
            const searchItem = document.createElement('div');
            searchItem.className = 'search-item';
            searchItem.innerHTML = `
                <div class="search-item-content">
                    <div class="search-item-header">
                        <strong>${transaction.description}</strong>
                        <span class="transaction-tag ${transaction.type}-tag">
                            ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                    </div>
                    <div class="search-item-details">
                        <span class="search-date" data-date="${transaction.date}">
                            ${moment(transaction.date).format('MMM D, YYYY')}
                        </span>
                        <span class="search-amount">₹${transaction.amount.toFixed(2)}</span>
                    </div>
                </div>
            `;

            // Add click handler for date navigation
            searchItem.addEventListener('click', function () {
                const date = this.querySelector('.search-date').dataset.date;
                selectDate(date);
                searchResults.classList.remove('active');
                document.getElementById('searchInput').value = '';
            });

            searchResults.appendChild(searchItem);
        });
        searchResults.classList.add('active');
    } else {
        searchResults.innerHTML = '<div class="search-item">No results found</div>';
        searchResults.classList.add('active');
    }
});

// Update transaction lists with subtle delete buttons
function updateTransactionLists() {
    const incomeList = document.getElementById('incomeList');
    const expenseList = document.getElementById('expenseList');

    // Clear existing lists
    incomeList.innerHTML = '';
    expenseList.innerHTML = '';

    // Get transactions for selected date
    const dayTransactions = transactions
        .filter(t => t.date === selectedDate)
        .sort((a, b) => b.timestamp - a.timestamp);

    dayTransactions.forEach(transaction => {
        const transactionElement = document.createElement('div');
        transactionElement.className = 'transaction-item';
        transactionElement.innerHTML = `
            <div class="transaction-content">
                <strong>${transaction.description}</strong>
                <div class="transaction-amount">₹${transaction.amount.toFixed(2)}</div>
            </div>
            <button 
                onclick="deleteTransaction(${transaction.id})" 
                class="delete-btn-subtle"
                title="Delete transaction">
                ×
            </button>
        `;

        if (transaction.type === 'income') {
            incomeList.appendChild(transactionElement);
        } else {
            expenseList.appendChild(transactionElement);
        }
    });
}

// Add keyboard shortcuts
document.addEventListener('keydown', function (e) {
    // Ctrl/Cmd + S to save current transaction
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        const activeElement = document.activeElement;
        if (activeElement.id.includes('income')) {
            addTransaction('income');
        } else if (activeElement.id.includes('expense')) {
            addTransaction('expense');
        }
    }
});

// Handle Enter key in amount and description fields
['income', 'expense'].forEach(type => {
    document.getElementById(`${type}Amount`).addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById(`${type}Description`).focus();
        }
    });

    document.getElementById(`${type}Description`).addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTransaction(type);
        }
    });
});

// Initialize the application
window.addEventListener('load', function () {
    initializeCalendar();
    updateTransactionLists();
    updateSummary();
    initializeSpeechRecognition();
});