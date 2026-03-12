document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('signupform');
    const errorMsg = document.getElementById('errormsg');

    // Check if elements exist
    if (!form || !errorMsg) {
        console.error('Form or error message element not found');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = ''; // Clear previous errors

        const username = document.getElementById('username')?.value?.trim() || '';
        const email = document.getElementById('email')?.value?.trim() || '';
        const password = document.getElementById('password')?.value || '';
        const confirmPassword = document.getElementById('confirmpassword')?.value || '';

        // Validate inputs
        if (!username || !email || !password || !confirmPassword) {
            errorMsg.textContent = 'All fields are required';
            return;
        }

        if (password !== confirmPassword) {
            errorMsg.textContent = 'Passwords do not match';
            return;
        }

        if (password.length < 8) {
            errorMsg.textContent = 'Password must be at least 8 characters';
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            errorMsg.textContent = 'Invalid email format';
            return;
        }

        // Send to backend
        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Signup successful! Redirecting to login...');
                window.location.href = 'login.html';
            } else {
                errorMsg.textContent = data.error || data.message || 'Signup failed';
            }
        } catch (error) {
            console.error('Signup error:', error);
            errorMsg.textContent = 'Server connection error. Please check if the server is running on localhost:3000';
        }
    });
});
