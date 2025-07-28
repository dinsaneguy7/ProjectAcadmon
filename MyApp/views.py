# views.py

# Django imports
from django.shortcuts import render, redirect, get_object_or_404
from django.db import models
from django.db.models import Prefetch
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.decorators import login_required
from django.forms import modelform_factory
from django.core.serializers.json import DjangoJSONEncoder

from django.utils import timezone
from django.http import JsonResponse
import random

# Standard library
import json

from .models import Student, Teacher, Class, Subject, RatingTitle, StudentRating


# ----------------------------
# Authentication Views
# ----------------------------


# ----------------------------
# Authentication Views
# ----------------------------
def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    error = None
    if request.method == 'POST':
        identifier = request.POST.get('identifier')
        password = request.POST.get('password')
        # Try teacher login by email, firstname, or Django username
        from django.contrib.auth.models import User
        teacher = Teacher.objects.filter(
            models.Q(email=identifier) |
            models.Q(firstname=identifier) |
            models.Q(user__username=identifier)
        ).first()
        if teacher:
            # Accept password if matches Teacher.password or Django User password
            if teacher.password == password or (teacher.user and teacher.user.check_password(password)):
                request.session['teacher_id'] = teacher.id
                request.session['role'] = 'teacher'
                if teacher.user:
                    login(request, teacher.user)
                return redirect('dashboard')
            else:
                error = 'Invalid password.'
        else:
            # Fallback to Django user authentication (admin)
            from django.contrib.auth import authenticate, login as django_login
            user = authenticate(request, username=identifier, password=password)
            if user:
                django_login(request, user)
                # Only set role to 'admin' if user is staff or superuser
                if user.is_staff or user.is_superuser:
                    request.session['role'] = 'admin'
                    return redirect('dashboard')
                else:
                    # Not an admin, do not allow access to cadmin
                    error = 'You do not have admin access.'
                    logout(request)
            else:
                error = 'Invalid credentials.'
    return render(request, 'registration/login.html', {'error': error})


def logout_view(request):
    logout(request)
    return redirect('login')


def unauth(request):
    return render(request, 'unauth.html')


# ----------------------------
# Dashboard & Analytics Views
# ----------------------------
@login_required
def dashboard(request):
    context = {
        'class_count': 12,  # Replace with actual data
        'student_count': 345,
        'avg_rating': 4.2,
        'monthly_evaluations': 42,
        'classes': [
            {'id': 1, 'name': 'Class A'},
            {'id': 2, 'name': 'Class B'},
            {'id': 3, 'name': 'Class C'},
        ]
    }
    return render(request, 'dashboard.html', context)
# ----------------------------
# Static Pages
# ----------------------------
def class_list(request):
    # Only show classes assigned to the teacher, or all if admin
    user = request.user
    rating_titles = RatingTitle.objects.all()
    class_list = []
    if user.is_authenticated:
        # Check if user is a teacher
        teacher = None
        try:
            teacher = Teacher.objects.get(user=user)
        except Teacher.DoesNotExist:
            teacher = None
        if teacher and teacher.role == 'teacher':
            # Classes where teacher is class_teacher OR teaches any subject in the class
            class_teacher_qs = Class.objects.filter(class_teacher=teacher)
            subject_teacher_class_ids = Subject.objects.filter(teacher=teacher).values_list('subject_class_id', flat=True)
            subject_teacher_qs = Class.objects.filter(id__in=subject_teacher_class_ids)
            # Union of both querysets, remove duplicates
            classes_qs = class_teacher_qs | subject_teacher_qs
            classes_qs = classes_qs.distinct()
        else:
            # Admins see all classes
            classes_qs = Class.objects.all()
    else:
        classes_qs = Class.objects.none()
    for cls in classes_qs:
        student_count = cls.student_set.count()
        ratings = StudentRating.objects.filter(student__student_class=cls)
        avg = ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0
        average = round(avg, 2)
        topics = []
        for idx, title in enumerate(rating_titles):
            crit_ratings = ratings.filter(rating_title=title)
            crit_avg = crit_ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0
            percent = int((crit_avg / (title.ceiling or 5)) * 100) if title.ceiling else 0
            topics.append({
                'name': title.rating_title,
                'percentage': percent
            })
        cumulative_offset = 0
        for topic in topics:
            topic['offset'] = cumulative_offset
            cumulative_offset -= topic['percentage']
        class_list.append({
            'id': cls.id,
            'name': cls.name,
            'student_count': student_count,
            'average': average,
            'topics': topics
        })
    return render(request, 'class_list.html', {'classes': class_list})

def privacy_policy(request):
    return render(request, 'privacy_policy.html')


def terms_conditions(request):
    return render(request, 'terms_conditions.html')



def subj_list(request):
    # Only show subjects assigned to the teacher, or all if admin
    user = request.user
    rating_titles = RatingTitle.objects.all()
    subj_list = []
    class_id = request.GET.get('class_id')
    if user.is_authenticated:
        teacher = None
        try:
            teacher = Teacher.objects.get(user=user)
        except Teacher.DoesNotExist:
            teacher = None
        if teacher and teacher.role == 'teacher':
            subjects_qs = Subject.objects.filter(teacher=teacher)
        else:
            subjects_qs = Subject.objects.all()
    else:
        subjects_qs = Subject.objects.none()
    if class_id:
        subjects_qs = subjects_qs.filter(subject_class_id=class_id)
    for subject in subjects_qs:
        # Get all RatingTitles for this subject
        # rating_titles_for_subject = RatingTitle.objects.filter(subject=subject)
        rating_titles_for_subject = RatingTitle.objects.all()
        ratings = StudentRating.objects.filter(
            rating_title__in=rating_titles_for_subject
        )
        avg = ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0
        average = round(avg, 2)
        topics = []
        for title in rating_titles:
            crit_ratings = ratings.filter(rating_title=title)
            crit_avg = crit_ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0
            percent = int((crit_avg / (title.ceiling or 5)) * 100) if title.ceiling else 0
            topics.append({
                'name': title.rating_title,
                'percentage': percent
            })
        cumulative_offset = 0
        for topic in topics:
            topic['offset'] = cumulative_offset
            cumulative_offset -= topic['percentage']
        subj_list.append({
            'id': subject.id,
            'name': subject.name,
            'class_count': 1,
            'average': average,
            'topics': topics,
            'teacher_name': f"{subject.teacher.firstname} {subject.teacher.lastname}" if subject.teacher else "Not Assigned"
        })
    return render(request, 'subject_list.html', {'subjs': subj_list})


def studs_list(request):
    # Only show students for the class of the selected subject
    rating_titles = RatingTitle.objects.all()
    studs_list = []
    subj_id = request.GET.get('subj_id')
    if subj_id:
        try:
            subject = Subject.objects.get(id=subj_id)
            class_obj = subject.subject_class
            studs_qs = Student.objects.filter(student_class=class_obj)
        except Subject.DoesNotExist:
            studs_qs = Student.objects.none()
    else:
        studs_qs = Student.objects.none()
    for stud in studs_qs:
        ratings = StudentRating.objects.filter(student=stud)
        avg = ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0
        average = round(avg, 2)
        topics = []
        for title in rating_titles:
            if title.method == 'numerical':
                crit_ratings = ratings.filter(rating_title=title)
                crit_avg = crit_ratings.aggregate(models.Avg('value_numerical'))['value_numerical__avg'] or 0
                percent = int((crit_avg / (title.ceiling or 5)) * 100) if title.ceiling else 0
                topics.append({
                    'name': title.rating_title,
                    'percentage': percent
                })
        cumulative_offset = 0
        for topic in topics:
            topic['offset'] = cumulative_offset
            cumulative_offset -= topic['percentage']
        studs_list.append({
            'id': stud.id,
            'first_name': stud.firstname,
            'last_name': stud.lastname,
            'class_name': stud.student_class.name if stud.student_class else "No Class",
            'roll_number': stud.roll_no,
            'average': average,
            'topics': topics
        })
    return render(request, 'studs_list.html', {'studs': studs_list})



from django.template.defaulttags import register

@register.filter
def get_item(dictionary, key):
    return dictionary.get(key)

@login_required
def rate_studs(request, stud_id):
    student = get_object_or_404(Student, id=stud_id)
    subject_id = request.GET.get('subj_id')
    
    if not subject_id:
        return redirect('studs_list')
    
    subject = get_object_or_404(Subject, id=subject_id)
    
    # Verify the teacher has permission to rate for this subject
    teacher = request.user.teacher
    if teacher.role == 'teacher' and subject.teacher != teacher:
        return redirect('unauth')
    
    rating_titles = RatingTitle.objects.all()
    
    # Get existing ratings for this student-subject combination
    existing_ratings = {}
    for title in rating_titles:
        rating = StudentRating.objects.filter(
            student=student,
            subject=subject,
            rating_title=title
        ).first()
        
        if rating:
            if title.method == 'numerical':
                existing_ratings[title.id] = rating.value_numerical
            else:
                existing_ratings[title.id] = rating.value_text
    
    # Prepare rating titles with their ranges
    rating_titles_with_ranges = []
    for title in rating_titles:
        if title.method == 'numerical':
            title.range = range(title.floor, title.ceiling + 1)
        rating_titles_with_ranges.append(title)
    
    if request.method == 'POST':
        # Process form submission
        for title in rating_titles:
            field_name = f'rating-{title.id}'
            value = request.POST.get(field_name)
            if value:
                if title.method == 'numerical':
                    StudentRating.objects.create(
                        student=student,
                        subject=subject,
                        rating_title=title,
                        value_numerical=int(value),
                        value_text=None,
                        rated_by=teacher
                    )
                else:
                    StudentRating.objects.create(
                        student=student,
                        subject=subject,
                        rating_title=title,
                        value_text=value,
                        value_numerical=None,
                        rated_by=teacher
                    )
        
        return redirect(f'/studs/?subj_id={subject.id}')
    
    context = {
        'stud': student,
        'subject': subject,
        'rating_titles': rating_titles_with_ranges,
        'existing_ratings': existing_ratings
    }
    
    return render(request, 'rater.html', context)




@login_required
def view_rate(request, stud_id):
    student = get_object_or_404(Student, id=stud_id)
    subject_id = request.GET.get('subj_id')
    
    if not subject_id:
        return redirect('studs_list')
    
    subject = get_object_or_404(Subject, id=subject_id)
    
    # Verify the teacher has permission to view these ratings
    teacher = request.user.teacher
    if teacher.role == 'teacher' and subject.teacher != teacher:
        return redirect('unauth')
    
    # Convert rating_titles queryset to list of dicts for JSON serialization
    rating_titles_qs = RatingTitle.objects.all()
    rating_titles = [
        {
            'id': title.id,
            'rating_title': title.rating_title,
            'method': title.method,
            'floor': title.floor,
            'ceiling': title.ceiling
        }
        for title in rating_titles_qs
    ]
    
    # Get all ratings for this student-subject combination
    ratings = StudentRating.objects.filter(
        student=student,
        subject=subject
    ).order_by('rated_on')
    
    # Prepare data for chart and table
    rating_data = {}
    rating_dates = []
    rating_values = {title['id']: [] for title in rating_titles}
    
    for rating in ratings:
        date_str = rating.rated_on.strftime("%Y-%m-%d")
        if date_str not in rating_data:
            rating_data[date_str] = {}
            rating_dates.append(date_str)
        
        if rating.rating_title.method == 'numerical':
            rating_data[date_str][rating.rating_title.id] = rating.value_numerical
            rating_values[rating.rating_title.id].append(rating.value_numerical)
        else:
            rating_data[date_str][rating.rating_title.id] = rating.value_text
    
    context = {
        'stud': student,
        'subject': subject,
        'rating_titles': rating_titles,
        'rating_data': rating_data,
        'rating_dates': rating_dates,
        'rating_values': rating_values
    }
    
    return render(request, 'view_rate.html', context)