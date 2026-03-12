document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.querySelector('form');
    const errorMsg = document.getElementById('error-message');
    
    // Check if elements exist
    if (!loginForm || !errorMsg) {
        console.error('Login form or error message element not found');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMsg.textContent = ''; // Clear previous errors
        
        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');
        
        if (!emailInput || !passwordInput) {
            errorMsg.textContent = 'Form elements not found';
            return;
        }
        
        const email = emailInput.value?.trim() || '';
        const password = passwordInput.value || '';
        
        if (!email || !password) {
            errorMsg.textContent = 'Please fill in all fields';
            return;
        }
        
        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (response.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('username', data.username);
                alert('Login successful! Redirecting to dashboard...');
                window.location.href = "dashboard.html";
            } else {
                errorMsg.textContent = data.error || 'Login failed. Check your credentials.';
            }
        } catch (error) {
            console.error('Login error:', error);
            errorMsg.textContent = 'Server connection error. Please check if the server is running on localhost:3000';
        }
    });
});
