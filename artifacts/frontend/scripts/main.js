document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('https://your-backend-api.com/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token); // Store JWT token
            window.location.href = 'trainee-dashboard.html'; // Redirect to dashboard
        } else {
            alert('Login failed. Please check your credentials.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});









document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html'; // Redirect to login if no token
    }

    try {
        const response = await fetch('https://your-backend-api.com/courses', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const courses = await response.json();
            const courseList = document.getElementById('courseList');
            courses.forEach(course => {
                const li = document.createElement('li');
                li.textContent = course.name;
                const registerButton = document.createElement('button');
                registerButton.textContent = 'Register';
                registerButton.addEventListener('click', () => registerForCourse(course.id));
                li.appendChild(registerButton);
                courseList.appendChild(li);
            });
        } else {
            alert('Failed to fetch courses.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

async function registerForCourse(courseId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`https://your-backend-api.com/courses/${courseId}/register`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            alert('Successfully registered for the course!');
        } else {
            alert('Failed to register for the course.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}