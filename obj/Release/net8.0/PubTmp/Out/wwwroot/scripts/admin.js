document.addEventListener('DOMContentLoaded', async () => {
    // Check for token and handle unauthenticated users
    const token = localStorage.getItem('token');
    if (!token) {
         window.location.href = 'login.html'; // Uncomment to redirect
        console.error('No authentication token found. Redirecting to login.');
        return; // Stop execution if no token
    }

    // A map for cleaner section toggling and a list of tabs
    const sections = {
        usersTab: 'usersSection',
        rolesTab: 'rolesSection',
        coursesTab: 'coursesSection',
        settingsTab: 'settingsSection'
    };

    // Use a single function to handle all tab clicks
    Object.keys(sections).forEach(tabId => {
        document.getElementById(tabId)?.addEventListener('click', () => {
            showSection(sections[tabId]);
            if (tabId === 'usersTab') fetchUsers();
            if (tabId === 'rolesTab') fetchAndPopulateUsersForRoleAssignment();
            if (tabId === 'coursesTab') fetchCourses();
        });
    });

    // Event listeners for forms and modals
    document.getElementById('addUserForm')?.addEventListener('submit', handleAddUser);
    document.getElementById('assignRoleForm')?.addEventListener('submit', handleAssignRole);
    document.getElementById('addCourseForm')?.addEventListener('submit', handleAddCourse);
    document.getElementById('editUserForm')?.addEventListener('submit', handleUpdateUser);
    document.getElementById('addUser').addEventListener('click', () => {
		addUserModal.style.display = 'block';
	});
    document.getElementById('addCourse')?.addEventListener('click', openAddCourseModal);

    // Initial data fetch and section display
    await fetchUsers();
    showSection('usersSection');

    // Utility for showing and hiding sections
    function showSection(sectionId) {
        Object.values(sections).forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.style.display = id === sectionId ? 'block' : 'none';
            }
        });
    }

    // Generic function to handle modal open and close
    function setupModal(openButtonId, modalId, closeButtonClass) {
        const modal = document.getElementById(modalId);
        document.getElementById(openButtonId)?.addEventListener('click', () => {
            modal.style.display = 'block';
        });
        document.querySelector(`#${modalId} .${closeButtonClass}`)?.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    setupModal('addUser', 'addUserModal', 'close');
    setupModal('addCourse', 'addCourseModal', 'close'); // Assuming you have a course modal

});


// --- User Management Functions ---

async function fetchUsers() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/MUser', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = await handleResponse(response, 'Failed to fetch users.');
        if (users) {
            const userList = document.getElementById('userList');
            userList.innerHTML = '';
            users.forEach(user => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${user.username} (${user.role})</span>
                    <button onclick="editUser('${user.id}')">Edit</button>
                    <button onclick="deleteUser('${user.id}')">Delete</button>
                `;
                userList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

async function handleAddUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const form = e.target;
    const data = Object.fromEntries(new FormData(form).entries());

    try {
        const response = await fetch('/api/MUser', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('User added successfully!');
            fetchUsers();
            document.getElementById('addUserModal').style.display = 'none';
            form.reset();
        } else {
            alert('Failed to add user.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
}

async function handleUpdateUser(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const form = e.target;
     const userId = editUserForm.dataset.userId;
     const username = document.getElementById('editUserName').value;
     const email = document.getElementById('editUserEmail').value;
     const role = document.getElementById('editUserRole').value;

    try {
        const response = await fetch(`/api/MUser/${userId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username:username ,email:email, role:role})
        });
        
        if (response.ok) {
            alert('User added successfully!');
            fetchUsers();
            document.getElementById('addUserModal').style.display = 'none';
            form.reset();
			 editUserModal.style.display = 'none';
        } else {
            alert('Failed to add user.');
        }
    } catch (error) {
        console.error('Error adding user:', error);
    }
}


async function fetchAndPopulateUsersForRoleAssignment() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/MUser', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const users = await handleResponse(response, 'Failed to fetch users.');
        if (users) {
            const userIdDropdown = document.getElementById('userId');
            userIdDropdown.innerHTML = '';
            users.forEach(user => {
                const option = document.createElement('option');
                option.value = user.id;
                option.textContent = user.username;
                if (user.username === 'admin') {
                    option.disabled = true;
                }
                userIdDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error fetching users for role assignment:', error);
    }
}

async function handleAssignRole(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const userId = document.getElementById('userId').value;
    const role = document.getElementById('role').value;
    if (!token || !userId || !role) return;

    try {
        const response = await fetch(`/api/MUser/${userId}/role`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(role)
        });
        
        if (response.ok) {
            alert('Role assigned successfully!');
            fetchUsers();
        } else {
            alert('Failed to assign role.');
        }
    } catch (error) {
        console.error('Error assigning role:', error);
    }
}


// --- Course Management Functions ---





// Global functions for edit/delete buttons
window.editUser = async (userId) => {
    // Logic to open edit user modal and populate with data
    const token = localStorage.getItem('token');
    if (!token) return;
    
    try {
        const response = await fetch(`/api/MUser/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const user = await handleResponse(response, 'Failed to fetch user data.');
        if (user) {
            document.getElementById('editUserName').value = user.userName;
            document.getElementById('editUserEmail').value = user.email;
            document.getElementById('editUserRole').value = user.role;
            document.getElementById('editUserForm').dataset.userId = userId;
            document.getElementById('editUserModal').style.display = 'block';
        }
    } catch (error) {
        console.error('Error fetching user data for edit:', error);
    }
};

window.deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch(`/api/MUser/${userId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('User deleted successfully!');
            fetchUsers();
        } else {
            alert('Failed to delete user.');
        }
    } catch (error) {
        console.error('Error deleting user:', error);
    }
};





async function fetchCourses() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/Course', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const courses = await handleResponse(response, 'Failed to fetch courses.');
        if (courses) {
            const courseList = document.getElementById('courseList');
            courseList.innerHTML = '';
            courses.forEach(course => {
                const li = document.createElement('li');
                li.innerHTML = `
                    <span>${course.name} </span>
					  <span>(${course.price} SAR )</span>
                    <button onclick="editCourse('${course.id}')">Edit</button>
                    <button onclick="deleteCourse('${course.id}')">Delete</button>
                `;
                courseList.appendChild(li);
            });
        }
    } catch (error) {
        console.error('Error fetching courses:', error);
    }
}


async function handleAddCourse(e) {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;
    const form = e.target;
    //const data = Object.fromEntries(new FormData(form).entries());
	const courseName = document.getElementById('courseName').value;
    const courseDescription = document.getElementById('courseDescription').value;
    const coursePrice = parseFloat(document.getElementById('coursePrice').value);

    try {
        const response = await fetch('/api/course', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
           body: JSON.stringify({ 
                name: courseName, 
                description: courseDescription, 
                price: coursePrice // Add this line
            })
        });
        
        if (response.ok) {
            alert('Course added successfully!');
            fetchCourses();
            document.getElementById('addCourseModal').style.display = 'none';
            form.reset();
        } else {
            alert('Failed to add course.');
        }
    } catch (error) {
        console.error('Error adding course:', error);
    }
}

window.editCourse = async (courseId) =>{
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Authentication token is missing. Please log in again.');
        return;
    }

    try {
        // Step 1: Fetch the course data from the server
        const response = await fetch(`/api/course/${courseId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch course data.');
        }

        const course = await response.json();

        // Step 2: Populate the edit form with the fetched data
        document.getElementById('editCourseName').value = course.name;
        document.getElementById('editCourseDescription').value = course.description;
        document.getElementById('editCoursePrice').value = course.price;
        
        // Step 3: Store the course ID in the form for later use during submission
        const form = document.getElementById('editCourseForm');
        form.setAttribute('data-course-id', courseId);

        // Step 4: Show the edit modal/form
        const modal = document.getElementById('editCourseModal');
        if (modal) {
            modal.style.display = 'block';
        }

    } catch (error) {
        console.error('Error during course edit process:', error);
        alert(error.message);
    }
};


document.getElementById('editCourseForm').addEventListener('submit', async (e) => {
    e.preventDefault();

   const form = e.target;
    const courseId = form.getAttribute('data-course-id');
    const token = localStorage.getItem('token');

    const updatedCourse = {
        id: courseId, // Include the ID in the body for server-side validation
        name: document.getElementById('editCourseName').value,
        description: document.getElementById('editCourseDescription').value,
        price: document.getElementById('editCoursePrice').value
    };

    try {
        const response = await fetch(`/api/Course/${courseId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(updatedCourse)
        });

        if (response.ok) {
            alert('Course updated successfully!');
            document.getElementById('editCourseModal').style.display = 'none';
            // Refresh the course list
            fetchCourses();
        } else {
            alert('Failed to update course.');
        }
    } catch (error) {
        console.error('Error updating course:', error);
        alert('An error occurred while updating the course.');
    }
});

document.querySelector('#editCourseModal .close').addEventListener('click', () => {
    document.getElementById('editCourseModal').style.display = 'none';
});

window.deleteCourse = async (courseId) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
        const response = await fetch(`/api/course/${courseId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
            alert('Course deleted successfully!');
            fetchCourses();
        } else {
            alert('Failed to delete course.');
        }
    } catch (error) {
        console.error('Error deleting course:', error);
    }
};

// Generic response handler to avoid repeating checks
async function handleResponse(response, errorMessage) {
    if (!response.ok) {
        console.error(errorMessage, await response.text());
        alert(errorMessage);
        return null;
    }
    return response.json();
}




async function seedCourses() {
    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found. Please log in first.');
        return;
    }

    const courses = [
        {
            "name": "Food Safety Management Systems (ISO 22000)",
            "description": "Learn to implement and audit food safety management systems according to ISO 22000 standards.",
            "price": 2800
        },
        {
            "name": "HACCP (Hazard Analysis Critical Control Point)",
            "description": "Comprehensive training on HACCP principles for food safety and risk management in the food industry.",
            "price": 2500
        },
        {
            "name": "Occupational Health and Safety (OSHA)",
            "description": "Understand OSHA standards, workplace hazards, and safety protocols for a safer work environment.",
            "price": 2200
        },
        {
            "name": "Environmental Management Systems (ISO 14001)",
            "description": "Training on implementing and maintaining environmental management systems as per ISO 14001.",
            "price": 3000
        },
        {
            "name": "First Aid and Emergency Response",
            "description": "Practical first aid training and emergency response techniques for workplace and public settings.",
            "price": 1500
        },
        {
            "name": "Fire Safety and Prevention",
            "description": "Learn fire safety protocols, prevention methods, and emergency evacuation procedures.",
            "price": 1800
        },
        {
            "name": "Personal Protective Equipment (PPE) Training",
            "description": "Guidelines on the correct use, maintenance, and selection of PPE for various industries.",
            "price": 1200
        },
        {
            "name": "Workplace Ergonomics and Wellness",
            "description": "Ergonomic best practices to improve workplace comfort, reduce injuries, and enhance productivity.",
            "price": 1600
        },
        {
            "name": "Waste Management and Pollution Control",
            "description": "Strategies for effective waste management, recycling, and pollution control in industrial settings.",
            "price": 2000
        },
        {
            "name": "Food Handler’s Certification",
            "description": "Essential food hygiene and handling practices for food service workers and handlers.",
            "price": 1000
        }
    ];

    for (const course of courses) {
        try {
            const response = await fetch('/api/course', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(course)
            });

            if (!response.ok) {
                const error = await response.text();
                console.error(`Failed to seed course "${course.name}":`, error);
            } else {
                const result = await response.json();
                console.log(`Successfully seeded course: ${course.name}`, result);
            }
        } catch (error) {
            console.error(`Error seeding course "${course.name}":`, error);
        }
    }
}