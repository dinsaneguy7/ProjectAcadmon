from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('classes/', views.class_list, name='class_list'),
    path('classes/<int:class_id>/', views.class_detail, name='class_detail'),
    path('classes/<int:class_id>/student/<int:student_id>/', views.student_options, name='student_options'),
    path('classes/<int:class_id>/student/<int:student_id>/rate/', views.student_rating, name='student_rating'),
    path('classes/<int:class_id>/student/<int:student_id>/view/', views.student_view_ratings, name='student_view_ratings'),
    path('teachers/', views.teachers_list, name='teachers_list'),
    path('teachers/<int:teacher_id>/performance/', views.teacher_performance, name='teacher_performance'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('terms-conditions/', views.terms_conditions, name='terms_conditions'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('unauth/', views.unauth, name='unauth'),
]