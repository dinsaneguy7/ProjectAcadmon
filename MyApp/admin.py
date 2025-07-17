
from django.contrib import admin
from .models import Student, Teacher, ClassRoom, ClassSubject,StudentSubjectRating

admin.site.register(Student)
admin.site.register(Teacher)
admin.site.register(ClassRoom)
admin.site.register(ClassSubject)
admin.site.register(StudentSubjectRating)
