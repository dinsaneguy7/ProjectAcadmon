from django import forms
from .models import Teacher, Class, Student, Subject, RatingTitle

class TeacherForm(forms.ModelForm):
    class Meta:
        model = Teacher
        fields = '__all__'

class ClassForm(forms.ModelForm):
    class Meta:
        model = Class
        fields = '__all__'

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = '__all__'

class SubjectForm(forms.ModelForm):
    class Meta:
        model = Subject
        fields = '__all__'

class RatingTitleForm(forms.ModelForm):
    class Meta:
        model = RatingTitle
        fields = '__all__'