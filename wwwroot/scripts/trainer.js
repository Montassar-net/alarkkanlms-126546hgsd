document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'index.html'; // Redirect to login if no token
    }

    // Fetch courses for the dropdown
    try {
        const response = await fetch('/api/course', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const courses = await response.json();
            const courseDropdown = document.getElementById('course');
            courses.forEach(course => {
                const option = document.createElement('option');
                option.value = course.id;
                option.textContent = course.name;
                courseDropdown.appendChild(option);
            });
        } else {
            alert('Failed to fetch courses.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});


document.getElementById('scheduleClassForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const courseId = document.getElementById('course').value;
    const time = document.getElementById('time').value;
    const location = document.getElementById('location').value;

    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/Classes', {
            method: 'POST',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ courseId, time, location })
        });

        if (response.ok) {
            alert('Class scheduled successfully!');
            fetchTrainerClasses(); // Refresh the class list
        } else {
            alert('Failed to schedule class.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});



async function fetchTrainerClasses() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/Classes', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const classes = await response.json();
            const classList = document.getElementById('classList');
            classList.innerHTML = ''; // Clear existing list
            classes.forEach(cls => {
                const li = document.createElement('li');
                li.textContent = `${cls.courseName} - ${cls.time} (${cls.location})`;
                const openCloseButton = document.createElement('button');
                openCloseButton.textContent = cls.isOpen ? 'Close' : 'Open';
                openCloseButton.addEventListener('click', () => toggleClassStatus(cls.id, cls.isOpen));
                li.appendChild(openCloseButton);
                classList.appendChild(li);
				
				const deleteButton = document.createElement('button');
				deleteButton.textContent = 'Delete';
				deleteButton.addEventListener('click', () => {
					// Add a confirmation before deleting
					if (confirm('Are you sure you want to delete this class?')) {
						deleteClass(cls.id);
					}
				});
				li.appendChild(deleteButton);
            });
        } else {
            alert('Failed to fetch classes.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Initial fetch of classes when the page loads
fetchTrainerClasses();



async function toggleClassStatus(classId, isOpen) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/Classes/${classId}/status`, {
            method: 'PUT',
            headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: !isOpen 
        });

        if (response.ok) {
            alert(`Class ${isOpen ? 'closed' : 'opened'} successfully!`);
            fetchTrainerClasses(); // Refresh the class list
        } else {
            alert('Failed to update class status.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}


// Deletes a class from the database
async function deleteClass(classId) {
     const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`/api/Classes/${classId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            //showMessage('Class deleted successfully!');
            fetchTrainerClasses(); // Refresh the list
        } else {
           // showMessage('Failed to delete class.', true);
        }
    } catch (error) {
        console.error('Error:', error);
        ///showMessage('An error occurred while deleting the class.', true);
    }
}


fetchEnrolledTrainees(0);

async function fetchEnrolledTrainees(classId) {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`/api/Enrollment/ByTrainer`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const enrollments = await response.json();
            const enrollmentList = document.getElementById('enrollmentList');
            enrollmentList.innerHTML = ''; // Clear existing list
            enrollments.forEach(enrollment => {
                const li = document.createElement('li');
                li.textContent = enrollment.traineeName + " | " + enrollment.className + " | " + enrollment.classLocation + " | " + enrollment.classTime ;
                enrollmentList.appendChild(li);
            });
        } else {
            alert('Failed to fetch enrollments.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

// Example: Fetch enrollments for a specific class
document.getElementById('enrollmentsTab').addEventListener('click', () => {
    const classId = prompt('Enter Class ID:'); // In a real app, this would be dynamic
    if (classId) {
        fetchEnrolledTrainees(classId);
    }
});