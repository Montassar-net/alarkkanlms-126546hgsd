//Fetching Available Courses
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html'; // Redirect to login if no token
    }
		document.getElementById("classSection").style.display = "none";
    // Fetch available courses
    try {
        const response = await fetch('/api/Course', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const courses = await response.json();
            const courseList = document.getElementById('courseList');
			let limit = 3;
            courses.forEach(course => {
				if(limit > 0  )
				{
                const li = document.createElement('li');
                li.textContent = course.name + " | " +  course.price;

                const registerButton = document.createElement('button');
                registerButton.textContent = 'Register';
                registerButton.addEventListener('click', () => bookCourse(course.id));
                li.appendChild(registerButton);
                courseList.appendChild(li);
				}
				limit--;
            });
        } else {
            alert('Failed to fetch courses.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
	
	
});


async function bookCourse(courseId) {
	
	
	document.getElementById("classSection").style.display = "block";
	
	const token = localStorage.getItem('token');
	try {
        const response = await fetch('/api/Classes/ByCourse/'+courseId, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });
		const classList = document.getElementById('classList');
		classList.innerHTML = '';
        if (response.ok) {
            const courses = await response.json();
           
            courses.forEach(course => {

				if(course.isOpen){
                const li = document.createElement('li');
                li.textContent = course.course.name + " | " + course.location  + " | " + course.time + " | ";

                const registerButton = document.createElement('button');
                registerButton.textContent = 'Book';
                registerButton.addEventListener('click', () => registerForCourse(course.id));
                li.appendChild(registerButton);
                classList.appendChild(li);
				}
            });
			
			if(classList.innerHTML == '') classList.innerHTML  = 'No open class for this course';
			
        } else {
            classList.innerHTML = 'No Class available';
        }
    } catch (error) {
       lassList.innerHTML = 'Error:'+ error;
    }
	
	
}

//Registering for a Course
const paymentModal = document.getElementById('paymentModal');
const paymentForm = document.getElementById('paymentForm');
const paymentResult = document.getElementById('paymentResult');

///registerForCourse(2);

// Open payment modal when registering for a course
async function registerForCourse(classId) {
    paymentModal.style.display = 'block'; // Show the payment popup

    // Handle payment form submission
    paymentForm.onsubmit = async (e) => {
        e.preventDefault();
        paymentResult.textContent = 'Processing payment...'; // Show loading message

        // Simulate a payment process with a 2-second delay
        const paymentSuccess = await mockPaymentProcess();

        if (paymentSuccess) {
			paymentResult.style.color ='green';
            paymentResult.textContent = 'Payment successful!';
            setTimeout(async () => {
                paymentModal.style.display = 'none'; // Close the popup
                paymentResult.textContent = ''; // Clear the result message

                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`/api/Enrollment`, {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` ,  'Content-Type': 'application/json' },
					body: JSON.stringify({ classId : classId })
                    });

                    if (response.ok) {
                        alert('You are now registered for the course.');
                        fetchTraineeSchedule(); // Refresh the schedule
                    } else {
                        alert('Failed to register for the course.');
                    }
                } catch (error) {
                    console.error('Error:', error);
                }
            }, 2000);
        } else {
			paymentResult.style.color ='red';
            paymentResult.textContent = 'Payment failed. Please try again.';
        }
    };
}

// Close modal when clicking the close button
document.querySelector('.close').addEventListener('click', () => {
    paymentModal.style.display = 'none';
    paymentResult.textContent = ''; // Clear the result message
});

// Mock payment process
async function mockPaymentProcess() {
    return new Promise((resolve) => {
        setTimeout(() => {
            // Mock a random payment success/failure (90% success rate)
            const success = Math.random() < 0.9;
            resolve(success);
        }, 2000);
    });
}


async function fetchTraineeSchedule() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/Enrollment/MyEnrollments', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const schedule = await response.json();
            const scheduleList = document.getElementById('scheduleList');
            scheduleList.innerHTML = ''; // Clear existing list
            schedule.forEach(cls => {
                const li = document.createElement('li');
                li.textContent = `${cls.className} - ${cls.classTime} (${cls.classLocation})`;
                scheduleList.appendChild(li);
            });
        } else {
            alert('Failed to fetch schedule.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchTraineeSchedule();


// Initial fetch of schedule when the page loads
/*
async function fetchPaymentHistory() {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('https://your-backend-api.com/trainee/payments', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const payments = await response.json();
            const paymentList = document.getElementById('paymentList');
            paymentList.innerHTML = ''; // Clear existing list
            payments.forEach(payment => {
                const li = document.createElement('li');
                li.textContent = `${payment.courseName} - $${payment.amount} (${payment.date})`;
                paymentList.appendChild(li);
            });
        } else {
            alert('Failed to fetch payment history.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}*/

// Initial fetch of payment history when the page loads
//fetchPaymentHistory();

document.getElementById('viewAllCourses').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch('/api/Course', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const courses = await response.json();
            const courseList = document.getElementById('courseList');
            courseList.innerHTML = ''; // Clear existing list
            courses.forEach(course => {
               const li = document.createElement('li');
                li.textContent = course.name + " | " +  course.price;

                const registerButton = document.createElement('button');
                registerButton.textContent = 'Register';
                registerButton.addEventListener('click', () => bookCourse(course.id));
                li.appendChild(registerButton);
                courseList.appendChild(li);
            });
        } else {
            alert('Failed to fetch all courses.');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});