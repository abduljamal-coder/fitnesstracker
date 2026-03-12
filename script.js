addEventListener('DOMContentLoaded', async()=>{ 
    const signupForm = document.getElementById('signupform');
    if (signupForm) {
        signupForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmpassword').value;
            const errorMsg = document.getElementById('errormsg');
            errorMsg.textContent= '';

            if (password !== confirmPassword) {
                errorMsg.textContent= 'Passwords do not match.';
                return;
            }
        
            // Submit form if valid
            this.submit();
        });
    }
    
    // Validate username
    const usernameField = document.getElementById('username');
    if (usernameField) {
        usernameField.addEventListener('blur', function () {
            const username = this.value;
            const errorMsg = document.getElementById('errormsg');
            
            if (username.length < 3) {
                errorMsg.textContent = 'Username must be at least 3 characters long.';
            } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
                errorMsg.textContent = 'Username can only contain letters, numbers, and underscores.';
            } else {
                errorMsg.textContent = '';
            }
        });
    }
    
    // Validate email
    const emailField = document.getElementById('email');
    if (emailField) {
        emailField.addEventListener('blur', function() {
            const email = this.value;
            const errorMsg = document.getElementById('errormsg');
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            
            if (!emailRegex.test(email)) {
                errorMsg.textContent = 'Please enter a valid email address.';
            } else {
                errorMsg.textContent = '';
            }
        });
    }
});
