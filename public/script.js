// Enhanced security utility functions
const securityUtils = {
    sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    },

    validateAmount(amount) {
        return /^\d+(\.\d{1,2})?$/.test(amount) && parseFloat(amount) >= 100;
    },

    validateMeterNumber(meter) {
        return /^[A-Za-z0-9]{6,12}$/.test(meter);
    },

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    validatePhone(phone) {
        return /^\+?[\d\s-]{10,}$/.test(phone);
    },

    // Add Content Security Policy checks
    checkCSP() {
        if (!document.head.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
            const meta = document.createElement('meta');
            meta.httpEquiv = "Content-Security-Policy";
            meta.content = "default-src 'self'; script-src 'self'; style-src 'self' https://cdn.jsdelivr.net; font-src 'self' https://cdnjs.cloudflare.com";
            document.head.appendChild(meta);
        }
    },

    // Add stronger input validation
    validateInput(value, type) {
        const patterns = {
            amount: /^\d+(\.\d{0,2})?$/,
            meter: /^[A-Za-z0-9]{6,12}$/,
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^\+?[\d\s-]{10,15}$/,
            text: /^[A-Za-z0-9\s\-_,.']{2,100}$/
        };
        
        const value_trimmed = value.trim();
        return patterns[type]?.test(value_trimmed) || false;
    },

    // Add encryption for sensitive data
    encryptData(data) {
        // Use Web Crypto API for client-side encryption
        return btoa(JSON.stringify(data)); // Basic encoding for example
    }
};

// Enhanced secure fetch with additional security headers
const secureFetch = async (url, options = {}) => {
    try {
        const defaultOptions = {
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                'X-Frame-Options': 'DENY',
                'X-Content-Type-Options': 'nosniff',
                'Referrer-Policy': 'strict-origin-when-cross-origin'
            }
        };

        // Add request timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const response = await fetch(url, { 
            ...defaultOptions, 
            ...options,
            signal: controller.signal 
        });

        clearTimeout(timeoutId);
        
        if (response.status === 403) {
            throw new Error('Session expired');
        }

        return response;
    } catch (error) {
        // Enhanced error handling
        if (error.name === 'AbortError') {
            throw new Error('Request timeout');
        }
        console.error('Network error:', error);
        if (error.message === 'Session expired') {
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'login.html';
        }
        throw error;
    }
};

// Add security initialization
const initSecurity = () => {
    securityUtils.checkCSP();
    window.addEventListener('securitypolicyviolation', (e) => {
        console.error('CSP violation:', e);
    });
};

// Initialize security measures
document.addEventListener('DOMContentLoaded', initSecurity);

// Registration Form Handler with security improvements
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    let isSubmitting = false;
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isSubmitting) return;
        
        try {
            isSubmitting = true;
            const formData = {
                fullname: securityUtils.sanitizeInput(document.getElementById('username').value.trim()),
                email: document.getElementById('email').value.trim(),
                phone: document.getElementById('phone').value.trim(),
                address: securityUtils.sanitizeInput(document.getElementById('address').value.trim()),
                meter: document.getElementById('meterNumber').value.trim()
            };

            // Validate all inputs
            if (!securityUtils.validateEmail(formData.email)) {
                throw new Error('Invalid email format');
            }
            if (!securityUtils.validatePhone(formData.phone)) {
                throw new Error('Invalid phone number');
            }
            if (!securityUtils.validateMeterNumber(formData.meter)) {
                throw new Error('Invalid meter number format');
            }

            const response = await secureFetch('/user/register', {
                method: 'POST',
                body: JSON.stringify({ CreateUserDto: formData })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Registration failed');
            }

            const data = await response.json();
            console.log('Registration response:', data); // Debug log
            
            alert('Registration successful!');
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message || 'An error occurred during registration');
        } finally {
            isSubmitting = false;
        }
    });
}

// Enhanced login handler with additional security
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    // Add bruteforce protection
    const bruteforceProtection = {
        attempts: parseInt(sessionStorage.getItem('loginAttempts') || '0'),
        lastAttempt: parseInt(sessionStorage.getItem('lastLoginAttempt') || '0'),
        maxAttempts: 5,
        lockoutDuration: 300000, // 5 minutes
    };

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // Check for lockout
        const now = Date.now();
        if (bruteforceProtection.attempts >= bruteforceProtection.maxAttempts && 
            (now - bruteforceProtection.lastAttempt) < bruteforceProtection.lockoutDuration) {
            const remainingTime = Math.ceil((bruteforceProtection.lockoutDuration - (now - bruteforceProtection.lastAttempt)) / 60000);
            alert(`Account locked. Please try again in ${remainingTime} minutes`);
            return;
        }

        try {
            const meterNumber = document.getElementById('email').value.trim();
            
            if (!securityUtils.validateMeterNumber(meterNumber)) {
                throw new Error('Invalid meter number format');
            }

            const response = await secureFetch('/user/login', {
                method: 'POST',
                body: JSON.stringify({ meter: meterNumber })
            });

            const data = await response.json();
            
            if (response.ok) {
                bruteforceProtection.attempts = 0;
                sessionStorage.setItem('loginAttempts', '0');
                window.location.href = 'dashboard.html';
            } else {
                bruteforceProtection.attempts++;
                bruteforceProtection.lastAttempt = now;
                sessionStorage.setItem('loginAttempts', bruteforceProtection.attempts.toString());
                sessionStorage.setItem('lastLoginAttempt', now.toString());
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            
            alert(error.message || 'An error occurred during login');
        }
    });
}

// Secure data display function
const secureDisplayData = (elementId, value, defaultValue = 'N/A') => {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = securityUtils.sanitizeInput(value || defaultValue);
    }
};

// Dashboard Authentication Check
const dashboardInit = async () => {
    try {
        const response = await secureFetch('/user/check-session');

        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }

        const { user } = await response.json();

        // Update all dashboard elements with user data
        const elements = {
            'username': user.fullname || 'N/A',
            'userEmail': user.email || 'N/A',
            'userPhone': user.phone || 'N/A',
            'userAddress': user.address || 'N/A',
            'meterNumber': user.meter || 'N/A',
            'walletBalance': user.wallet_balance || '0',
            'totalUnits': user.available_units || '0',
        };

        Object.entries(elements).forEach(([id, value]) => {
            secureDisplayData(id, value);
        });
    } catch (error) {
        console.error('Session check error:', error);
        window.location.href = 'login.html';
    }
};

// Profile Page Initialization
const initProfilePage = async () => {
    try {
        const response = await secureFetch('/user/check-session');

        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }

        const { user } = await response.json();
        
        // Update profile elements with user data
        const elements = {
            'username': user.fullname,
            'userEmail': user.email,
            'userPhone': user.phone,
            'userAddress': user.address,
            'meterNumber': user.meter,
            'walletBalance': `₦${user.wallet_balance || '0'}`,
            'totalUnits': `${user.available_units || '0'} kWh`
        };

        Object.entries(elements).forEach(([id, value]) => {
            secureDisplayData(id, value);
        });
    } catch (error) {
        console.error('Profile loading error:', error);
        window.location.href = 'login.html';
    }
};

// Transaction Page Initialization
const initTransactionPage = async () => {
    try {
        const response = await secureFetch('/user/check-session');

        if (!response.ok) {
            window.location.href = 'login.html';
            return;
        }

        const { user } = await response.json();
        
        // Set meter number in purchase form
        const meterInput = document.getElementById('meterNumber');
        if (meterInput) {
            meterInput.value = user.meter;
        }

        // Load transaction history
        const transactions = await fetchTransactionHistory();
        displayTransactions(transactions);
    } catch (error) {
        console.error('Transaction page loading error:', error);
        window.location.href = 'login.html';
    }
};

// Fetch Transaction History
const fetchTransactionHistory = async () => {
    try {
        const response = await secureFetch('/user/transactions');
        if (!response.ok) throw new Error('Failed to fetch transactions');
        return await response.json();
    } catch (error) {
        console.error('Error fetching transactions:', error);
        return [];
    }
};

// Display Transactions in Table
const displayTransactions = (transactions) => {
    const tbody = document.getElementById('transactionTableBody');
    if (!tbody) return;

    tbody.innerHTML = transactions.length ? transactions.map(transaction => `
        <tr>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${new Date(transaction.created_at).toLocaleDateString()}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${transaction.type}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ₦${transaction.amount}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                ${transaction.units} kWh
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${transaction.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                    ${transaction.status}
                </span>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" class="px-6 py-4 text-center text-gray-500">No transactions found</td></tr>';
};

// Purchase Form Handler with input validation
const purchaseForm = document.getElementById('purchaseForm');
if (purchaseForm) {
    purchaseForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        try {
            const amount = document.getElementById('amount').value;
            const meterNumber = document.getElementById('meterNumber').value;

            if (!securityUtils.validateAmount(amount)) {
                throw new Error('Invalid amount');
            }
            if (!securityUtils.validateMeterNumber(meterNumber)) {
                throw new Error('Invalid meter number');
            }

            const response = await secureFetch('/user/purchase', {
                method: 'POST',
                body: JSON.stringify({ 
                    amount: parseFloat(amount),
                    meter: meterNumber
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                alert('Purchase successful!');
                window.location.reload();
            } else {
                throw new Error(data.message || 'Purchase failed');
            }
        } catch (error) {
            console.error('Purchase error:', error);
            alert(error.message || 'An error occurred during purchase');
        }
    });
}

// Secure logout
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', async () => {
        try {
            await secureFetch('/user/logout', { method: 'POST' });
            sessionStorage.clear();
            localStorage.clear();
            window.location.href = 'login.html';
        } catch (error) {
            console.error('Logout error:', error);
            window.location.href = 'login.html';
        }
    });
}

// Initialize appropriate page
if (window.location.pathname.includes('dashboard')) {
    dashboardInit();
} else if (window.location.pathname.includes('profile')) {
    initProfilePage();
} else if (window.location.pathname.includes('transaction')) {
    initTransactionPage();
}


