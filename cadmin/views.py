def manage_ratings(request):
    return render(request, 'ratingsmanage.html')
from django.db import models
from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse
from MyApp.models import Teacher, Class, Student, Subject, RatingTitle
from django.views.decorators.csrf import csrf_exempt
# --- RATINGTITLE AJAX CRUD VIEWS ---
def rating_heading_list(request):
    titles = RatingTitle.objects.all().order_by('-created_at')
    data = []
    for t in titles:
        data.append({
            'id': t.id,
            'rating_title': t.rating_title,
            'method': t.method,
            'floor': t.floor,
            'ceiling': t.ceiling,
            'created_at': t.created_at.strftime('%Y-%m-%d'),
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def rating_heading_create(request):
    if request.method == 'POST':
        try:
            rating_title = request.POST.get('rating_title')
            method = request.POST.get('method')
            floor = request.POST.get('floor')
            ceiling = request.POST.get('ceiling')
            title = RatingTitle(
                rating_title=rating_title,
                method=method,
                floor=floor if method == 'numerical' else None,
                ceiling=ceiling if method == 'numerical' else None
            )
            title.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def rating_heading_update(request, pk):
    title = get_object_or_404(RatingTitle, pk=pk)
    if request.method == 'POST':
        try:
            title.rating_title = request.POST.get('rating_title')
            title.method = request.POST.get('method')
            if title.method == 'numerical':
                title.floor = request.POST.get('floor')
                title.ceiling = request.POST.get('ceiling')
            else:
                title.floor = None
                title.ceiling = None
            title.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def rating_heading_delete(request, pk):
    title = get_object_or_404(RatingTitle, pk=pk)
    if request.method == 'POST':
        try:
            title.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage

# --- CLASS AJAX CRUD VIEWS ---
def class_list(request):
    classes = Class.objects.select_related('class_teacher').all().order_by('-created_at')
    data = []
    for c in classes:
        data.append({
            'id': c.id,
            'name': c.name,
            'class_teacher': {
                'id': c.class_teacher.id,
                'firstname': c.class_teacher.firstname,
                'lastname': c.class_teacher.lastname,
                'image_url': c.class_teacher.image.url if c.class_teacher and c.class_teacher.image else ''
            } if c.class_teacher else None,
            'student_count': c.student_set.count(),
            'created_at': c.created_at.strftime('%Y-%m-%d'),
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def class_create(request):
    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            teacher_id = request.POST.get('class_teacher')
            teacher = Teacher.objects.get(pk=teacher_id) if teacher_id else None
            new_class = Class(name=name, class_teacher=teacher)
            new_class.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def class_update(request, pk):
    cls = get_object_or_404(Class, pk=pk)
    if request.method == 'POST':
        try:
            cls.name = request.POST.get('name')
            teacher_id = request.POST.get('class_teacher')
            cls.class_teacher = Teacher.objects.get(pk=teacher_id) if teacher_id else None
            cls.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def class_delete(request, pk):
    cls = get_object_or_404(Class, pk=pk)
    if request.method == 'POST':
        try:
            cls.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

# --- TEACHER AJAX CRUD VIEWS ---
def manage_teachers(request):
    return render(request, 'teachersmanage.html')

def teacher_list(request):
    try:
        teachers = Teacher.objects.all().order_by('-created_at')
        data = []
        for t in teachers:
            data.append({
                'id': t.id,
                'firstname': t.firstname,
                'lastname': t.lastname,
                'email': t.email,
                'phone': t.phone,
                'specialization': t.specialization,
                'address': t.address,
                'created_at': t.created_at.strftime('%Y-%m-%d') if t.created_at else '',
                'image_url': t.image.url if hasattr(t, 'image') and t.image else '',
            })
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=500)

@csrf_exempt
def teacher_create(request):
    if request.method == 'POST':
        try:
            from django.contrib.auth.models import User
            firstname = request.POST.get('firstname')
            lastname = request.POST.get('lastname')
            email = request.POST.get('email')
            phone = request.POST.get('phone')
            specialization = request.POST.get('specialization')
            address = request.POST.get('address')
            password = request.POST.get('password')
            image = request.FILES.get('image')
            username = f"{firstname}_{lastname}".replace(' ', '').lower()
            # Ensure username is unique
            base_username = username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            role = request.POST.get('role', 'teacher')
            user = User.objects.create_user(username=username, email=email, password=password)
            # Set is_staff/superuser based on role
            if role == 'admin':
                user.is_staff = True
                user.is_superuser = True
            else:
                user.is_staff = False
                user.is_superuser = False
            user.save()
            teacher = Teacher(
                firstname=firstname,
                lastname=lastname,
                email=email,
                phone=phone,
                specialization=specialization,
                address=address,
                password=password,
                image=image,
                user=user,
                role=role
            )
            teacher.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def teacher_update(request, pk):
    teacher = get_object_or_404(Teacher, pk=pk)
    if request.method == 'POST':
        try:
            teacher.firstname = request.POST.get('firstname')
            teacher.lastname = request.POST.get('lastname')
            teacher.email = request.POST.get('email')
            teacher.phone = request.POST.get('phone')
            teacher.specialization = request.POST.get('specialization')
            teacher.address = request.POST.get('address')
            password = request.POST.get('password')
            role = request.POST.get('role', teacher.role)
            teacher.role = role
            if password:
                teacher.password = password
            if request.FILES.get('image'):
                teacher.image = request.FILES.get('image')
            # Update linked User
            if teacher.user:
                user = teacher.user
                user.email = teacher.email
                # Set is_staff/superuser based on role
                if role == 'admin':
                    user.is_staff = True
                    user.is_superuser = True
                else:
                    user.is_staff = False
                    user.is_superuser = False
                if password:
                    user.set_password(password)
                user.save()
            teacher.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def teacher_delete(request, pk):
    teacher = get_object_or_404(Teacher, pk=pk)
    if request.method == 'POST':
        try:
            # Delete linked User if exists
            if teacher.user:
                teacher.user.delete()
            teacher.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

# --- STUDENT AJAX CRUD VIEWS ---
def manage_students(request):
    return render(request, 'studentsmanage.html')

def manage_subjects(request):
    return render(request, 'subjectsmanage.html')

def student_list(request):
    students = Student.objects.select_related('student_class').all().order_by('-created_at')
    data = []
    for s in students:
        data.append({
            'id': s.id,
            'firstname': s.firstname,
            'lastname': s.lastname,
            'roll_no': s.roll_no,
            'address': s.address,
            'dob': s.dob.strftime('%Y-%m-%d'),
            'student_class': {
                'id': s.student_class.id if s.student_class else None,
                'name': s.student_class.name if s.student_class else None,
            },
            'parent_name': s.parent_name,
            'parent_phone': s.parent_phone,
            'parent_email': s.parent_email,
            'created_at': s.created_at.strftime('%Y-%m-%d'),
            'profile_picture': s.profile_picture.url if s.profile_picture else '',
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def student_create(request):
    if request.method == 'POST':
        try:
            s = Student()
            s.firstname = request.POST.get('firstname')
            s.lastname = request.POST.get('lastname')
            s.roll_no = request.POST.get('roll_no')
            s.address = request.POST.get('address')
            s.dob = request.POST.get('dob')
            class_id = request.POST.get('student_class')
            s.student_class = Class.objects.get(pk=class_id) if class_id else None
            s.parent_name = request.POST.get('parent_name')
            s.parent_phone = request.POST.get('parent_phone')
            s.parent_email = request.POST.get('parent_email')
            if request.FILES.get('profile_picture'):
                s.profile_picture = request.FILES.get('profile_picture')
            s.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def student_update(request, pk):
    s = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        try:
            s.firstname = request.POST.get('firstname')
            s.lastname = request.POST.get('lastname')
            s.roll_no = request.POST.get('roll_no')
            s.address = request.POST.get('address')
            s.dob = request.POST.get('dob')
            class_id = request.POST.get('student_class')
            s.student_class = Class.objects.get(pk=class_id) if class_id else None
            s.parent_name = request.POST.get('parent_name')
            s.parent_phone = request.POST.get('parent_phone')
            s.parent_email = request.POST.get('parent_email')
            if request.FILES.get('profile_picture'):
                s.profile_picture = request.FILES.get('profile_picture')
            s.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def student_delete(request, pk):
    s = get_object_or_404(Student, pk=pk)
    if request.method == 'POST':
        try:
            s.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

# --- SUBJECT AJAX CRUD VIEWS ---
def subject_list(request):
    subjects = Subject.objects.select_related('subject_class', 'teacher').all().order_by('-created_at')
    data = []
    for s in subjects:
        data.append({
            'id': s.id,
            'name': s.name,
            'subject_class': {
                'id': s.subject_class.id if s.subject_class else None,
                'name': s.subject_class.name if s.subject_class else None,
            },
            'teacher': {
                'id': s.teacher.id if s.teacher else None,
                'firstname': s.teacher.firstname if s.teacher else None,
                'lastname': s.teacher.lastname if s.teacher else None,
                'image_url': s.teacher.image.url if s.teacher and s.teacher.image else ''
            } if s.teacher else None,
            'created_at': s.created_at.strftime('%Y-%m-%d'),
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
def subject_create(request):
    if request.method == 'POST':
        try:
            name = request.POST.get('name')
            class_id = request.POST.get('subject_class')
            teacher_id = request.POST.get('teacher')
            subject_class = Class.objects.get(pk=class_id) if class_id else None
            teacher = Teacher.objects.get(pk=teacher_id) if teacher_id else None
            subject = Subject(name=name, subject_class=subject_class, teacher=teacher)
            subject.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def subject_update(request, pk):
    subject = get_object_or_404(Subject, pk=pk)
    if request.method == 'POST':
        try:
            subject.name = request.POST.get('name')
            class_id = request.POST.get('subject_class')
            teacher_id = request.POST.get('teacher')
            subject.subject_class = Class.objects.get(pk=class_id) if class_id else None
            subject.teacher = Teacher.objects.get(pk=teacher_id) if teacher_id else None
            subject.save()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

@csrf_exempt
def subject_delete(request, pk):
    subject = get_object_or_404(Subject, pk=pk)
    if request.method == 'POST':
        try:
            subject.delete()
            return JsonResponse({'success': True})
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)})
    return JsonResponse({'success': False, 'error': 'Invalid request'})

def admin_dashboard(request):
    # Gather class performance data
    from MyApp.models import Class, Teacher, StudentRating, RatingTitle
    classes = []
    for cls in Class.objects.select_related('class_teacher').all():
        teacher = cls.class_teacher
        teacher_name = f"{teacher.firstname} {teacher.lastname}" if teacher else "-"
        student_count = cls.student_set.count()
        # Example: get overall rating (average of all StudentRatings for this class)
        ratings = StudentRating.objects.filter(student__student_class=cls)
        overall_rating = round(ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0, 2)
        # Example: rating change (dummy value for now)
        rating_change = 5
        # Example: criteria breakdown (average per RatingTitle)
        criteria = []
        for title in RatingTitle.objects.all():
            crit_ratings = ratings.filter(rating_title=title)
            avg = round(crit_ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0, 2)
            percent = int((avg / (title.ceiling or 5)) * 100) if title.ceiling else 0
            criteria.append({
                'name': title.rating_title,
                'value': avg,
                'percent': percent
            })
        # Color logic (alternate for demo)
        header_color = 'bg-indigo-700' if classes.__len__() % 2 == 0 else 'bg-green-700'
        classes.append({
            'name': cls.name,
            'teacher_name': teacher_name,
            'student_count': student_count,
            'header_color': header_color,
            'overall_rating': overall_rating,
            'rating_change': rating_change,
            'criteria': criteria
        })
    return render(request, 'admin_dashboard.html', {'classes': classes})

def manage_classes(request):
    return render(request, 'classmanage.html')
