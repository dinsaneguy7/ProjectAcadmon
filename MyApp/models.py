from django.db import models
# Model to store individual ratings for students
class StudentRating(models.Model):
    student = models.ForeignKey('Student', on_delete=models.CASCADE)
    subject = models.ForeignKey('Subject', on_delete=models.CASCADE)
    rating_title = models.ForeignKey('RatingTitle', on_delete=models.CASCADE)
    value_numerical = models.IntegerField(blank=True, null=True)
    value_text = models.TextField(blank=True, null=True)
    rated_by = models.ForeignKey('Teacher', on_delete=models.SET_NULL, null=True, blank=True)
    rated_on = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student} - {self.rating_title} ({self.subject})"

class Teacher(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    address = models.TextField()
    specialization = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)  # Store hashed password in production
    image = models.ImageField(upload_to='teacher_images/', blank=True, null=True)
    user = models.OneToOneField('auth.User', on_delete=models.CASCADE, null=True, blank=True)
    ROLE_CHOICES = [
        ('teacher', 'Teacher'),
        ('admin', 'Admin'),
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='teacher')

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

class Class(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=50, unique=True)
    class_teacher = models.ForeignKey(Teacher, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

class Student(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    firstname = models.CharField(max_length=50)
    lastname = models.CharField(max_length=50)
    roll_no = models.CharField(max_length=20, unique=True)
    address = models.TextField()
    dob = models.DateField()
    student_class = models.ForeignKey(Class, on_delete=models.SET_NULL, null=True)
    parent_name = models.CharField(max_length=100)
    parent_phone = models.CharField(max_length=20)
    parent_email = models.EmailField()
    profile_picture = models.ImageField(upload_to='student_profiles/', blank=True, null=True)

    def __str__(self):
        return f"{self.firstname} {self.lastname}"

class Subject(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    name = models.CharField(max_length=100, blank=True, null=True)
    subject_class = models.ForeignKey('Class', on_delete=models.CASCADE, blank=True, null=True)
    teacher = models.ForeignKey('Teacher', on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.name

class RatingTitle(models.Model):
    NUMERICAL = 'numerical'
    TEXT = 'text'
    METHOD_CHOICES = [
        (NUMERICAL, 'Numerical'),
        (TEXT, 'Text'),
    ]
    rating_title = models.CharField(max_length=100)
    method = models.CharField(max_length=10, choices=METHOD_CHOICES)
    floor = models.IntegerField(blank=True, null=True)
    ceiling = models.IntegerField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if self.method == self.NUMERICAL:
            if self.floor is None:
                self.floor = 0
            if self.ceiling is None:
                self.ceiling = 5
        else:
            self.floor = None
            self.ceiling = None
        super().save(*args, **kwargs)

    def __str__(self):
        return self.rating_title

# Create your models here.
