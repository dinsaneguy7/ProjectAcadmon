
from django.db import models

# performance rating model
class StudentSubjectRating(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    class_subject = models.ForeignKey('ClassSubject', on_delete=models.CASCADE)
    reading = models.PositiveSmallIntegerField(default=0)
    writing = models.PositiveSmallIntegerField(default=0)
    assignments = models.PositiveSmallIntegerField(default=0)
    class_activity = models.PositiveSmallIntegerField(default=0)
    complaints = models.TextField(blank=True)
    rated_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.class_subject}"

# Students model
class Student(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    date_of_birth = models.DateField()
    enrollment_date = models.DateField(auto_now_add=True)
    class_room = models.ForeignKey('ClassRoom', on_delete=models.SET_NULL, null=True, blank=True)
    parent_name = models.CharField(max_length=100)
    parent_contact = models.TextField(help_text="Add multiple phone numbers separated by commas or new lines.")
    parent_email = models.EmailField(blank=True, help_text="Parent email (optional)")
    image = models.ImageField(upload_to='student_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

# Teachers model
class Teacher(models.Model):
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    contact = models.CharField(max_length=20)
    subject_specialization = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='teacher_images/', blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


# Class model like 1 2 3 etc
class ClassRoom(models.Model):
    name = models.CharField(max_length=50)  
    class_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True, related_name='class_teacher')

    def __str__(self):
        return self.name

    @property
    def number_of_students(self):
        return self.student_set.count()

#subjects eng nep etc
class ClassSubject(models.Model):
    class_room = models.ForeignKey(ClassRoom, on_delete=models.CASCADE, related_name='class_subjects')
    name = models.CharField(max_length=100)
    assigned_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        teacher = self.assigned_teacher
        teacher_name = f"{teacher.first_name} {teacher.last_name}" if teacher else "No teacher assigned"
        return f"{self.name} - {self.class_room.name} ({teacher_name})"
