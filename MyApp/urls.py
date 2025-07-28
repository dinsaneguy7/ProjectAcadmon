from django.urls import path
from . import views

urlpatterns = [
    path('', views.dashboard, name='dashboard'),
    path('privacy-policy/', views.privacy_policy, name='privacy_policy'),
    path('terms-conditions/', views.terms_conditions, name='terms_conditions'),
    path('login/', views.login_view, name='login'),
    path('logout/', views.logout_view, name='logout'),
    path('unauth/', views.unauth, name='unauth'),
    path('classes/', views.class_list, name='class_list'),
    path('subj/', views.subj_list, name='subj_list'),
    path('studs/', views.studs_list, name='studs_list'),
     path('studs/rate/<int:stud_id>/', views.rate_studs, name='rate_studs'),
     path('studs/view/<int:stud_id>/', views.view_rate, name='view_rate'),
]