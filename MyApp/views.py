# Unauthenticated page view
def unauth(request):
    return render(request, 'unauth.html')
import json
from django.core.serializers.json import DjangoJSONEncoder

def teacher_performance(request, teacher_id):
    from .models import Teacher, ClassSubject, StudentSubjectRating, ClassRoom
    teacher = Teacher.objects.get(id=teacher_id)
    # Subjects taught by this teacher
    subjects = ClassSubject.objects.filter(assigned_teacher=teacher)
    # Ratings for all subjects taught by this teacher
    ratings = StudentSubjectRating.objects.filter(class_subject__in=subjects)
    # Overall performance: group by date
    date_map = {}
    for rating in ratings:
        date = rating.rated_on.strftime('%Y-%m-%d %H:%M')
        if date not in date_map:
            date_map[date] = []
        date_map[date].append(rating)
    dates = sorted(date_map.keys())
    overall_data = {
        'dates': dates,
        'reading': [sum(r.reading for r in date_map[date]) / len(date_map[date]) for date in dates],
        'writing': [sum(r.writing for r in date_map[date]) / len(date_map[date]) for date in dates],
        'assignments': [sum(r.assignments for r in date_map[date]) / len(date_map[date]) for date in dates],
        'class_activity': [sum(r.class_activity for r in date_map[date]) / len(date_map[date]) for date in dates],
    }
    # Per class-subject performance
    class_subject_data = []
    for subject in subjects:
        subject_ratings = StudentSubjectRating.objects.filter(class_subject=subject).order_by('rated_on')
        if not subject_ratings.exists():
            continue
        date_map = {}
        for rating in subject_ratings:
            date = rating.rated_on.strftime('%Y-%m-%d %H:%M')
            if date not in date_map:
                date_map[date] = []
            date_map[date].append(rating)
        dates = sorted(date_map.keys())
        class_obj = subject.class_room
        class_subject_data.append({
            'class_id': class_obj.id,
            'class_name': class_obj.name,
            'subject_id': subject.id,
            'subject_name': subject.name,
            'dates': dates,
            'reading': [sum(r.reading for r in date_map[date]) / len(date_map[date]) for date in dates],
            'writing': [sum(r.writing for r in date_map[date]) / len(date_map[date]) for date in dates],
            'assignments': [sum(r.assignments for r in date_map[date]) / len(date_map[date]) for date in dates],
            'class_activity': [sum(r.class_activity for r in date_map[date]) / len(date_map[date]) for date in dates],
        })
    context = {
        'teacher': teacher,
        'overall_data': json.dumps(overall_data, cls=DjangoJSONEncoder),
        'class_subject_data': json.dumps(class_subject_data, cls=DjangoJSONEncoder),
    }
    return render(request, 'teacher_performance.html', context)
from django.db.models import Prefetch

def teachers_list(request):
    from .models import Teacher, ClassSubject, StudentSubjectRating
    teachers = Teacher.objects.all()
    teachers_data = []
    for teacher in teachers:
        subjects = ClassSubject.objects.filter(assigned_teacher=teacher)
        subject_ids = subjects.values_list('id', flat=True)
        ratings = StudentSubjectRating.objects.filter(class_subject_id__in=subject_ids)
        # Calculate average rating (across all rating fields)
        avg_rating = None
        engagement = None
        if ratings.exists():
            avg_rating = (
                ratings.aggregate(
                    avg_reading=models.Avg('reading'),
                    avg_writing=models.Avg('writing'),
                    avg_assignments=models.Avg('assignments'),
                    avg_class_activity=models.Avg('class_activity')
                )
            )
            # Overall average of all rating types
            avg_rating_value = sum([
                avg_rating['avg_reading'] or 0,
                avg_rating['avg_writing'] or 0,
                avg_rating['avg_assignments'] or 0,
                avg_rating['avg_class_activity'] or 0
            ]) / 4
            avg_rating_value = round(avg_rating_value, 2)
            # Engagement: percent of ratings with any nonzero value (simple proxy)
            engagement = int(100 * ratings.exclude(
                reading=0, writing=0, assignments=0, class_activity=0
            ).count() / ratings.count())
        else:
            avg_rating_value = 'N/A'
            engagement = 'N/A'
        teachers_data.append({
            'id': teacher.id,
            'first_name': teacher.first_name,
            'last_name': teacher.last_name,
            'contact': teacher.contact,
            'subject_specialization': teacher.subject_specialization,
            'image': teacher.image,
            'subjects': [s.name for s in subjects],
            'avg_rating': avg_rating_value,
            'engagement': engagement,
        })
    return render(request, 'teachers_list.html', {'teachers': teachers_data})
def student_view_ratings(request, class_id, student_id):
    student = get_object_or_404(Student, id=student_id, class_room_id=class_id)
    class_obj = get_object_or_404(ClassRoom, id=class_id)
    subjects = ClassSubject.objects.filter(class_room=class_obj)
    ratings = StudentSubjectRating.objects.filter(student=student, class_subject__in=subjects)
    # Prepare data for graphs
    subject_data = []
    for subject in subjects:
        subject_ratings = ratings.filter(class_subject=subject).order_by('rated_on')
        for rating in subject_ratings:
            subject_data.append({
                'name': subject.name,
                'reading': rating.reading,
                'writing': rating.writing,
                'assignments': rating.assignments,
                'class_activity': rating.class_activity,
                # 'sports' removed
                'complaints': rating.complaints,
                'date': rating.rated_on.strftime('%Y-%m-%d %H:%M'),
            })
    return render(request, 'student_view_ratings.html', {
        'student': student,
        'class_obj': class_obj,
        'subject_data': subject_data,
    })
def student_options(request, class_id, student_id):
    student = get_object_or_404(Student, id=student_id, class_room_id=class_id)
    class_obj = get_object_or_404(ClassRoom, id=class_id)
    return render(request, 'student_options.html', {
        'student': student,
        'class_obj': class_obj,
    })
from .models import Student, ClassRoom, ClassSubject, StudentSubjectRating
from django.db import models
from django.shortcuts import get_object_or_404, redirect
from django.forms import modelform_factory

def student_rating(request, class_id, student_id):
    student = get_object_or_404(Student, id=student_id, class_room_id=class_id)
    class_obj = get_object_or_404(ClassRoom, id=class_id)
    subjects = ClassSubject.objects.filter(class_room=class_obj)
    RatingForm = modelform_factory(StudentSubjectRating, fields=[
        'reading', 'writing', 'assignments', 'class_activity', 'complaints'
    ])
    rating_forms = []
    if request.method == 'POST':
        for subject in subjects:
            form = RatingForm(request.POST, prefix=str(subject.id))
            if form.is_valid():
                # Always create a new rating entry with timestamp
                rating = StudentSubjectRating(
                    student=student,
                    class_subject=subject,
                    **form.cleaned_data
                )
                # If there are previous complaints, append new complaint
                last_rating = StudentSubjectRating.objects.filter(student=student, class_subject=subject).order_by('-rated_on').first()
                if last_rating and last_rating.complaints and form.cleaned_data['complaints']:
                    rating.complaints = last_rating.complaints + '\n' + form.cleaned_data['complaints']
                rating.save()
        return redirect('class_detail', class_id=class_id)
    else:
        for subject in subjects:
            form = RatingForm(prefix=str(subject.id))
            rating_forms.append((subject, form))
    return render(request, 'student_rating.html', {
        'student': student,
        'class_obj': class_obj,
        'rating_forms': rating_forms,
    })
from .models import ClassRoom, Student

def class_detail(request, class_id):
    class_obj = ClassRoom.objects.get(id=class_id)
    students = Student.objects.filter(class_room=class_obj)
    # Calculate average rating for this class
    subjects = ClassSubject.objects.filter(class_room=class_obj)
    ratings = StudentSubjectRating.objects.filter(class_subject__in=subjects)
    if ratings.exists():
        avg = ratings.aggregate(
            avg_reading=models.Avg('reading'),
            avg_writing=models.Avg('writing'),
            avg_assignments=models.Avg('assignments'),
            avg_class_activity=models.Avg('class_activity')
        )
        avg_rating = round(sum([
            avg['avg_reading'] or 0,
            avg['avg_writing'] or 0,
            avg['avg_assignments'] or 0,
            avg['avg_class_activity'] or 0
        ]) / 4, 2)
    else:
        avg_rating = 'N/A'
    return render(request, 'class_detail.html', {'class_obj': class_obj, 'students': students, 'avg_rating': avg_rating})
from .models import ClassRoom

def class_list(request):
    classes = ClassRoom.objects.all()
    from .models import StudentSubjectRating, ClassSubject
    class_data = []
    for class_obj in classes:
        subjects = ClassSubject.objects.filter(class_room=class_obj)
        ratings = StudentSubjectRating.objects.filter(class_subject__in=subjects)
        if ratings.exists():
            avg = ratings.aggregate(
                avg_reading=models.Avg('reading'),
                avg_writing=models.Avg('writing'),
                avg_assignments=models.Avg('assignments'),
                avg_class_activity=models.Avg('class_activity')
            )
            avg_rating = round(sum([
                avg['avg_reading'] or 0,
                avg['avg_writing'] or 0,
                avg['avg_assignments'] or 0,
                avg['avg_class_activity'] or 0
            ]) / 4, 2)
        else:
            avg_rating = 'N/A'
        class_data.append({'class_obj': class_obj, 'avg_rating': avg_rating})
    return render(request, 'class_list.html', {'class_data': class_data})

from django.shortcuts import render, redirect
# Django authentication imports
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
# Login view
def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    form = AuthenticationForm(request, data=request.POST or None)
    if request.method == 'POST' and form.is_valid():
        user = form.get_user()
        login(request, user)
        return redirect('dashboard')
    return render(request, 'registration/login.html', {'form': form})

# Logout view
def logout_view(request):
    logout(request)
    return redirect('login')

from .models import Student, Teacher, ClassRoom

def dashboard(request):
    import json
    from django.core.serializers.json import DjangoJSONEncoder
    student_count = Student.objects.count()
    teacher_count = Teacher.objects.count()
    class_count = ClassRoom.objects.count()
    classes = ClassRoom.objects.all()
    class_averages = []
    total_sum = 0
    total_count = 0
    for class_obj in classes:
        subjects = ClassSubject.objects.filter(class_room=class_obj)
        ratings = StudentSubjectRating.objects.filter(class_subject__in=subjects)
        # Group ratings by date
        date_map = {}
        for rating in ratings:
            date = rating.rated_on.strftime('%Y-%m-%d %H:%M')
            if date not in date_map:
                date_map[date] = []
            date_map[date].append(rating)
        dates = sorted(date_map.keys())
        avg_reading = []
        avg_writing = []
        avg_assignments = []
        avg_class_activity = []
        for date in dates:
            ratings_on_date = date_map[date]
            avg_reading.append(sum(r.reading for r in ratings_on_date) / len(ratings_on_date))
            avg_writing.append(sum(r.writing for r in ratings_on_date) / len(ratings_on_date))
            avg_assignments.append(sum(r.assignments for r in ratings_on_date) / len(ratings_on_date))
            avg_class_activity.append(sum(r.class_activity for r in ratings_on_date) / len(ratings_on_date))
        # For overall average rating (across all classes)
        for rating in ratings:
            total_sum += (rating.reading + rating.writing + rating.assignments + rating.class_activity)
            total_count += 4
        class_averages.append({
            'id': class_obj.id,
            'name': class_obj.name,
            'dates': dates,
            'reading': avg_reading,
            'writing': avg_writing,
            'assignments': avg_assignments,
            'class_activity': avg_class_activity,
        })
    if total_count > 0:
        overall_avg_rating = round(total_sum / total_count, 2)
    else:
        overall_avg_rating = 'N/A'
    context = {
        'student_count': student_count,
        'teacher_count': teacher_count,
        'class_count': class_count,
        'class_averages': json.dumps(class_averages, cls=DjangoJSONEncoder),
        'overall_avg_rating': overall_avg_rating,
    }
    return render(request, 'dashboard.html', context)

# Privacy Policy and Terms & Conditions views
def privacy_policy(request):
    return render(request, 'privacy_policy.html')

def terms_conditions(request):
    return render(request, 'terms_conditions.html')
