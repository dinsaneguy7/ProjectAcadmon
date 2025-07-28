document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const closeModal = document.getElementById('closeModal');
    const cancelStudent = document.getElementById('cancelStudent');
    const studentForm = document.getElementById('studentForm');
    const modalTitle = document.getElementById('modalTitle');
    const studentClassSelect = document.getElementById('studentClassSelect');
    const filterClassSelect = document.getElementById('studentClass');
    
    // Table body
    const studentsTableBody = document.getElementById('studentsTableBody');
    
    let students = [];
    let classes = [];

    // Fetch classes for dropdowns
    function fetchClasses() {
        return fetch('/cadmin/api/classes/')
            .then(response => response.json())
            .then(data => {
                classes = data;
                populateClassDropdowns();
            });
    }

    // Fetch students from API
    function fetchStudents() {
        fetch('/cadmin/api/students/')
            .then(response => response.json())
            .then(data => {
                students = data;
                renderStudentsTable();
            });
    }

    // Calculate age from date of birth
    function calculateAge(dob) {
        const birthDate = new Date(dob);
        const difference = Date.now() - birthDate.getTime();
        const ageDate = new Date(difference);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

    // Populate class dropdowns
    function populateClassDropdowns() {
        studentClassSelect.innerHTML = '<option value="">-- Select Class --</option>';
        filterClassSelect.innerHTML = '<option value="">All Classes</option>';
        classes.forEach(cls => {
            // For form dropdown
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            studentClassSelect.appendChild(option.cloneNode(true));
            // For filter dropdown
            filterClassSelect.appendChild(option);
        });
    }

    // Render students table
    function renderStudentsTable() {
        studentsTableBody.innerHTML = '';
        students.forEach(student => {
            const row = document.createElement('tr');
            row.className = 'student-row';
            row.innerHTML = `
                <td class="px-6 py-4 whitespace-nowrap" data-label="Student">
                    <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10">
                            <img class="h-10 w-10 rounded-full" src="${student.profile_picture || '/static/img/default-profile.png'}" alt="${student.firstname} ${student.lastname}">
                        </div>
                        <div class="ml-4">
                            <div class="text-sm font-medium text-gray-900">${student.firstname} ${student.lastname}</div>
                            <div class="text-sm text-gray-500">${student.roll_no}</div>
                            <div class="text-xs text-gray-400 mt-1">Age: ${calculateAge(student.dob)}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Class">
                    ${student.student_class && student.student_class.name ? `<span class="class-badge">${student.student_class.name}</span>` : '<span class="text-sm text-gray-500">Not assigned</span>'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Parent Info">
                    <div class="text-sm text-gray-900">${student.parent_name}</div>
                    <div class="text-sm text-gray-500">${student.parent_email}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap" data-label="Contact">
                    <div class="text-sm text-gray-900">${student.parent_phone}</div>
                    <div class="text-sm text-gray-500 truncate max-w-xs">${student.address.split(',')[0]}</div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right" data-label="Actions">
                    <div class="flex justify-end space-x-2">
                        <button class="student-action-btn edit-student text-indigo-600 hover:text-indigo-900" data-id="${student.id}">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="student-action-btn delete-student text-red-600 hover:text-red-900" data-id="${student.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            studentsTableBody.appendChild(row);
        });
        // Add event listeners to action buttons
        document.querySelectorAll('.edit-student').forEach(btn => {
            btn.addEventListener('click', (e) => openEditModal(e.target.closest('button').dataset.id));
        });
        document.querySelectorAll('.delete-student').forEach(btn => {
            btn.addEventListener('click', (e) => deleteStudent(e.target.closest('button').dataset.id));
        });
    }

    // Open modal for adding a new student
    addStudentBtn.addEventListener('click', () => {
        studentForm.reset();
        document.getElementById('studentId').value = '';
        modalTitle.textContent = 'Add New Student';
        studentModal.classList.remove('hidden');
    });

    // Close modal
    function closeStudentModal() {
        studentModal.classList.add('hidden');
    }
    closeModal.addEventListener('click', closeStudentModal);
    cancelStudent.addEventListener('click', closeStudentModal);

    // Open modal for editing student
    function openEditModal(id) {
        const student = students.find(s => s.id == id);
        if (student) {
            document.getElementById('studentId').value = student.id;
            document.getElementById('firstname').value = student.firstname;
            document.getElementById('lastname').value = student.lastname;
            document.getElementById('rollNo').value = student.roll_no;
            document.getElementById('dob').value = student.dob;
            document.getElementById('address').value = student.address;
            document.getElementById('studentClassSelect').value = student.student_class ? student.student_class.id : '';
            document.getElementById('parentName').value = student.parent_name;
            document.getElementById('parentPhone').value = student.parent_phone;
            document.getElementById('parentEmail').value = student.parent_email;
            modalTitle.textContent = 'Edit Student';
            studentModal.classList.remove('hidden');
        }
    }

    // Delete student
    function deleteStudent(id) {
        showConfirm('Are you sure you want to delete this student? This action cannot be undone.', function(confirmed) {
            if (confirmed) {
                fetch(`/cadmin/api/students/${id}/delete/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCSRFToken(),
                    },
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        fetchStudents();
                        showAlert('Student deleted successfully', 'success');
                    } else {
                        showAlert('Error deleting student', 'error');
                    }
                });
            }
        });
    }

    // Form submission for add/edit
    studentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const id = document.getElementById('studentId').value;
        const formData = new FormData(studentForm);
        let url = '/cadmin/api/students/create/';
        if (id) {
            url = `/cadmin/api/students/${id}/update/`;
        }
        fetch(url, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCSRFToken(),
            },
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                fetchStudents();
                closeStudentModal();
                showAlert(`Student ${id ? 'updated' : 'added'} successfully`, 'success');
            } else {
                showAlert('Error saving student: ' + (data.error || 'Unknown error'), 'error');
            }
        });
    });

    // CSRF helper
    function getCSRFToken() {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, 10) === ('csrftoken=')) {
                    cookieValue = decodeURIComponent(cookie.substring(10));
                    break;
                }
            }
        }
        return cookieValue;
    }

    // Tailwind dismissible alert
    function showAlert(message, type = 'success') {
        if (!window.alertBox) {
            const ab = document.createElement('div');
            ab.id = 'alertBox';
            ab.className = 'fixed top-4 right-4 z-50';
            document.body.appendChild(ab);
            window.alertBox = ab;
        }
        const color = type === 'success' ? 'green' : 'red';
        window.alertBox.innerHTML = `
            <div class="flex items-center justify-between px-4 py-2 rounded shadow bg-${color}-100 text-${color}-800 border border-${color}-300 mb-2 animate-fade-in">
                <span>${message}</span>
                <button class="ml-4 text-lg font-bold focus:outline-none" onclick="this.parentElement.remove()">&times;</button>
            </div>
        `;
        setTimeout(() => {
            if (window.alertBox) window.alertBox.innerHTML = '';
        }, 2000);
    }

    // Tailwind confirmation modal
    function showConfirm(message, callback) {
        let confirmModal = document.getElementById('confirmModal');
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'confirmModal';
            confirmModal.className = 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50';
            confirmModal.innerHTML = `
                <div class="bg-white rounded shadow-lg p-6 w-96">
                    <div id="confirmText" class="mb-4 text-gray-800"></div>
                    <div class="flex justify-end space-x-2">
                        <button id="confirmYes" class="px-4 py-2 bg-red-600 text-white rounded">Yes</button>
                        <button id="confirmNo" class="px-4 py-2 bg-gray-300 text-gray-800 rounded">No</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);
        }
        document.getElementById('confirmText').textContent = message;
        confirmModal.classList.remove('hidden');
        const yesBtn = document.getElementById('confirmYes');
        const noBtn = document.getElementById('confirmNo');
        function cleanup() {
            confirmModal.classList.add('hidden');
            yesBtn.removeEventListener('click', onYes);
            noBtn.removeEventListener('click', onNo);
        }
        function onYes() {
            cleanup();
            callback(true);
        }
        function onNo() {
            cleanup();
            callback(false);
        }
        yesBtn.addEventListener('click', onYes);
        noBtn.addEventListener('click', onNo);
    }

    // Initial fetch
    fetchClasses().then(fetchStudents);

    // Search functionality
    document.getElementById('studentSearch').addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        document.querySelectorAll('.student-row').forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchTerm) ? '' : 'none';
        });
    });

    // Filter by class
    document.getElementById('studentClass').addEventListener('change', function(e) {
        const classId = e.target.value;
        if (!classId) {
            document.querySelectorAll('.student-row').forEach(row => {
                row.style.display = '';
            });
            return;
        }
        document.querySelectorAll('.student-row').forEach(row => {
            const studentId = row.querySelector('.edit-student').dataset.id;
            const student = students.find(s => s.id == studentId);
            const showRow = student && student.student_class && student.student_class.id == classId;
            row.style.display = showRow ? '' : 'none';
        });
    });
});