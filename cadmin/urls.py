
from django.urls import path
from . import views

urlpatterns = [
    path('', views.admin_dashboard, name='admin_dashboard'),
    path('manage-teachers/', views.manage_teachers, name='manage_teachers'),
    path('manage-classes/', views.manage_classes, name='manage_classes'),
    path('manage-students/', views.manage_students, name='manage_students'),
    path('manage-subjects/', views.manage_subjects, name='manage_subjects'),
    path('manage-ratings/', views.manage_ratings, name='manage_ratings'),

    # AJAX API endpoints for subjects
    path('api/subjects/', views.subject_list, name='subject_list'),
    path('api/subjects/create/', views.subject_create, name='subject_create'),
    path('api/subjects/<int:pk>/update/', views.subject_update, name='subject_update'),
    path('api/subjects/<int:pk>/delete/', views.subject_delete, name='subject_delete'),

    # AJAX API endpoints for students
    path('api/students/', views.student_list, name='student_list_api'),
    path('api/students/create/', views.student_create, name='student_create'),
    path('api/students/<int:pk>/update/', views.student_update, name='student_update'),
    path('api/students/<int:pk>/delete/', views.student_delete, name='student_delete'),

    # AJAX API endpoints for teachers
    path('api/teachers/', views.teacher_list, name='teacher_list'),
    path('api/teachers/create/', views.teacher_create, name='teacher_create'),
    path('api/teachers/<int:pk>/update/', views.teacher_update, name='teacher_update'),
    path('api/teachers/<int:pk>/delete/', views.teacher_delete, name='teacher_delete'),

    # AJAX API endpoints for classes
    path('api/classes/', views.class_list, name='class_list_api'),
    path('api/classes/create/', views.class_create, name='class_create'),
    path('api/classes/<int:pk>/update/', views.class_update, name='class_update'),
    path('api/classes/<int:pk>/delete/', views.class_delete, name='class_delete'),
        # AJAX API endpoints for rating headings
    path('api/rating-headings/', views.rating_heading_list, name='rating_heading_list'),
    path('api/rating-headings/create/', views.rating_heading_create, name='rating_heading_create'),
    path('api/rating-headings/<int:pk>/update/', views.rating_heading_update, name='rating_heading_update'),
    path('api/rating-headings/<int:pk>/delete/', views.rating_heading_delete, name='rating_heading_delete'),
 
]
