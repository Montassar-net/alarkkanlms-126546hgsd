document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/Auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store JWT token
            const decodedToken = decodeJwt(data.token);
           /// alert(JSON.stringify(decodedToken.payload.role, null, 2)); // Use stringify for better display
             window.location.href = decodedToken.payload.role + '-dashboard.html'; // Redirect to dashboard
        } else {
            // Handle HTTP error status codes (e.g., 401 Unauthorized, 404 Not Found)
            const errorData = await response.json();
            alert(`Login failed: ${errorData.message || 'Please check your credentials.'}`);
        }
    } catch (error) {
        console.error('Network or server error:', error);
        alert('An unexpected error occurred. Please try again later.');
    }
});






document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
		   const decodedToken = decodeJwt(token);
           window.location.href = decodedToken.payload.role + '-dashboard.html';
    }

});

