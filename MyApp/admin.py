
from django.contrib import admin
from .models import Teacher, Class, Student, Subject, RatingTitle, StudentRating

admin.site.register(Teacher)
admin.site.register(Class)
admin.site.register(Student)
admin.site.register(Subject)
admin.site.register(RatingTitle)
admin.site.register(StudentRating)
