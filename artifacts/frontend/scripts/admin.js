
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        ///window.location.href = 'login.html'; // Redirect to login if no token
    }

 
    await fetchUsers();

    document.getElementById('usersTab').addEventListener('click', () => {
        showSection('usersSection');
    });
    document.getElementById('rolesTab').addEventListener('click', () => {
        showSection('rolesSection');
    });
    document.getElementById('coursesTab').addEventListener('click', () => {
        showSection('coursesSection');
    });
    document.getElementById('settingsTab').addEventListener('click', () => {
        showSection('settingsSection');
    });

    // Add event listener for "Add New User" button
    document.getElementById('addUser').addEventListener('click', () => {
        addUser();
    });

    // Add event listener for role assignment form
    document.getElementById('assignRoleForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const userId = document.getElementById('userId').value;
        const role = document.getElementById('role').value;
        await assignRole(userId, role);
    });

    // Add event listener for course addition form
    document.getElementById('addCourseForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const courseName = document.getElementById('courseName').value;
        const courseDescription = document.getElementById('courseDescription').value;
        await addCourse(courseName, courseDescription);
    });
});

// Fetch and display users
async function fetchUsers() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/MUser', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const users = await response.json();
            const userList = document.getElementById('userList');
            userList.innerHTML = ''; // Clear existing list
            users.forEach(user => {
                const li = document.createElement('li');
                li.textContent = `${user.name} (${user.role})`;
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => editUser(user.id));
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteUser(user.id));
                li.appendChild(editButton);
                li.appendChild(deleteButton);
                userList.appendChild(li);
            });
        } else {
            alert('Failed to fetch users.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Show the selected section and hide others
function showSection(sectionId) {
    const sections = ['usersSection', 'rolesSection', 'coursesSection', 'settingsSection'];
    sections.forEach(section => {
        document.getElementById(section).style.display = section === sectionId ? 'block' : 'none';
    });
}



// scripts/main.js
// Add a new user
// scripts/main.js
const addUserModal = document.getElementById('addUserModal');
const addUserForm = document.getElementById('addUserForm');

// Open the "Add User" modal when the "Add New User" button is clicked
document.getElementById('addUser').addEventListener('click', () => {
    addUserModal.style.display = 'block';
});

// Close the modal when the close button is clicked
document.querySelector('.close').addEventListener('click', () => {
    addUserModal.style.display = 'none';
});

// Handle form submission for adding a new user
addUserForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Get form values
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    const role = document.getElementById('userRole').value;

    // Add the user
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://your-backend-api.com/users', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password, role })
        });

        if (response.ok) {
            alert('User added successfully!');
            fetchUsers(); // Refresh the user list
            addUserModal.style.display = 'none'; // Close the modal
            addUserForm.reset(); // Clear the form
        } else {
            alert('Failed to add user.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


// Edit a user
async function editUser(userId) {
    const name = prompt('Enter the new name:');
    const email = prompt('Enter the new email:');
    const role = prompt('Enter the new role (Admin, Trainer, Trainee):');

    if (name && email && role) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://your-backend-api.com/users/${userId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, role })
            });

            if (response.ok) {
                alert('User updated successfully!');
                fetchUsers(); // Refresh the user list
            } else {
                alert('Failed to update user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('All fields are required.');
    }
}

// Delete a user
async function deleteUser(userId) {
    const confirmDelete = confirm('Are you sure you want to delete this user?');
    if (confirmDelete) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://your-backend-api.com/users/${userId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('User deleted successfully!');
                fetchUsers(); // Refresh the user list
            } else {
                alert('Failed to delete user.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

// scripts/main.js
async function assignRole(userId, role) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`https://your-backend-api.com/users/${userId}/role`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ role })
        });

        if (response.ok) {
            alert('Role assigned successfully!');
            fetchUsers(); // Refresh the user list
        } else {
            alert('Failed to assign role.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// scripts/main.js
// Add a new course
async function addCourse(courseName, courseDescription) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://your-backend-api.com/courses', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: courseName, description: courseDescription })
        });

        if (response.ok) {
            alert('Course added successfully!');
            fetchCourses(); // Refresh the course list
        } else {
            alert('Failed to add course.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// scripts/main.js
// Fetch and display courses
async function fetchCourses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://your-backend-api.com/courses', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const courses = await response.json();
            const courseList = document.getElementById('courseList');
            courseList.innerHTML = ''; // Clear existing list
            courses.forEach(course => {
                const li = document.createElement('li');
                li.textContent = `${course.name} - ${course.description}`;
                const editButton = document.createElement('button');
                editButton.textContent = 'Edit';
                editButton.addEventListener('click', () => editCourse(course.id));
                const deleteButton = document.createElement('button');
                deleteButton.textContent = 'Delete';
                deleteButton.addEventListener('click', () => deleteCourse(course.id));
                li.appendChild(editButton);
                li.appendChild(deleteButton);
                courseList.appendChild(li);
            });
        } else {
            alert('Failed to fetch courses.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Edit a course
async function editCourse(courseId) {
    const name = prompt('Enter the new course name:');
    const description = prompt('Enter the new course description:');

    if (name && description) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://your-backend-api.com/courses/${courseId}`, {
                method: 'PUT',
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description })
            });

            if (response.ok) {
                alert('Course updated successfully!');
                fetchCourses(); // Refresh the course list
            } else {
                alert('Failed to update course.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        alert('All fields are required.');
    }
}

// Delete a course
async function deleteCourse(courseId) {
    const confirmDelete = confirm('Are you sure you want to delete this course?');
    if (confirmDelete) {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`https://your-backend-api.com/courses/${courseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                alert('Course deleted successfully!');
                fetchCourses(); // Refresh the course list
            } else {
                alert('Failed to delete course.');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

